<?php
// core/Controller.php
namespace App\Core;

trait Controller
{
    protected array $res = [];

    protected function isset(array $data, string $field, string $msg): void
    {
        if (!isset($data[$field]) || $data[$field] === '') {
            $val  = $data[$field] ?? null;
            $type = $val === null ? 'NULL' : gettype($val);

            $this->res['msg'] = $msg;
            $this->res['dev_error'] = [
                'field'     => $field,
                'issue'     => 'Champ requis manquant ou vide',
                'value'     => $val,
                'type'      => $type,
                'timestamp' => date('c')
            ];
            $this->stop(false);
        }
    }

    /**
     * Stoppe l'exécution et renvoie une réponse JSON.
     * Inclut des informations de débogage si APP_DEBUG est true.
     */
    protected function stop(bool $status): void
    {
        $this->res['status'] = $status;

        $config = \App\Config\Config::getInstance();
        $appDebug = $config->get('APP_DEBUG', false);

        if ($appDebug) {
            $rawBody = trim(file_get_contents('php://input'));
            $jsonPayload = json_decode($rawBody, true);
            $postPayload = $_POST;
            $getPayload = $_GET;

            $this->res['_payload'] = [
                'get_params'  => $getPayload,
                'post_params' => $postPayload,
                'json_payload' => $jsonPayload ?? $rawBody
            ];
        } else {
            unset($this->res['dev_error'], $this->res['_payload']);
        }

        echo json_encode($this->res, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    protected function resolveAuth(): ?array
    {
        // Nettoyage global des tokens expirés
        $this->api->instruct("DELETE FROM UserRefreshTokens WHERE expires_at <= NOW()");

        $token = $_COOKIE['access_token'] ?? null;

        if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
                $token = $m[1];
            }
        }

        if ($token) {
            $payload = $this->tokenUtils->validateToken($token);
            if ($payload) {
                return $payload;
            }
        }

        // Tentative de refresh silencieuse
        $refreshToken = $_COOKIE['refresh_token'] ?? null;
        if (!$refreshToken) {
            return null;
        }

        $dbToken = $this->api->one(
            "SELECT * FROM UserRefreshTokens WHERE token = ? AND expires_at > NOW()",
            [$refreshToken]
        );

        if (!$dbToken) {
            return null;
        }

        // Génération nouveaux tokens
        $roles = $this->api->list(
            "SELECT R.* FROM Roles R JOIN UserRoles UR ON UR.roleId = R.id WHERE UR.userId = ?",
            [$dbToken['user_id']]
        );

        $newAccessToken  = $this->authTokenService->generateAccessToken($dbToken['user_id'], $roles);
        $newRefreshToken = $this->tokenUtils->generateRandomString();

        $this->api->instruct(
            "UPDATE UserRefreshTokens SET token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE token = ?",
            [$newRefreshToken, $refreshToken]
        );

        $this->setAuthCookies($newAccessToken, $newRefreshToken);

        return $this->tokenUtils->validateToken($newAccessToken);
    }


    public function requireAuth(?int $expectedUserId = null): array
    {
        $payload = $this->resolveAuth();

        if (!$payload) {
            $this->res['msg'] = "Non authentifié.";
            $this->stop(false);
        }

        if (
            $expectedUserId !== null &&
            (int)($payload['userId'] ?? $payload['sub']) !== $expectedUserId
        ) {
            $this->res['msg'] = "Accès interdit.";
            $this->stop(false);
        }

        return $payload;
    }

    /**
     * * Helper pour récupérer l'ID de l'utilisateur
     * authentifié à partir de son token.
     *
     * Appeller $this->stop(false) si l'utilisateur n'est pas connecté.
     *
     * @return int L'ID de l'utilisateur connecté.
     */
    protected function getAuthUserId(): int
    {
        $payload = $this->requireAuth();
        $userId = (int) ($payload['userId'] ?? $payload['sub'] ?? 0);

        if (!$userId) {
            $this->res['msg'] = "Utilisateur non authentifié ou token invalide (ID manquant).";
            $this->stop(false);
        }

        return $userId;
    }

    protected function prepareAddQuery(array $data, array $config): array
    {
        $table         = $config['table'] ?? null;
        $notInsertable = $config['notInsertable'] ?? [];
        $extraFields   = $config['extraFields'] ?? [];

        if (!$table) {
            $this->res['msg'] = "Table d'insertion non spécifiée.";
            $this->stop(false);
        }

        $fields       = [];
        $placeholders = [];
        $params       = [];

        // Champs issus des données reçues
        foreach ($data as $field => $value) {
            // Ignorer les champs interdits
            if (in_array($field, $notInsertable, true)) {
                continue;
            }

            // Ignorer les champs optionnels vides
            if ($value === null || $value === '' || (is_array($value) && empty($value))) {
                continue;
            }

            $fields[]       = "`$field`";
            $placeholders[] = "?";
            $params[]       = $value;
        }

        // Champs supplémentaires forcés (calculés côté PHP)
        foreach ($extraFields as $field => $value) {
            $fields[]       = "`$field`";
            $placeholders[] = "?";
            $params[]       = $value;
        }

        // Vérification : au moins un champ à insérer
        if (empty($fields) || empty($placeholders)) {
            $this->res['msg'] = "Aucune donnée valide à insérer.";
            $this->res['dev_error'] = [
                'issue'     => 'INSERT vide',
                'data'      => $data,
                'extra'     => $extraFields,
                'timestamp' => date('c')
            ];
            $this->stop(false);
        }

        // Construction de la requête
        $sql = sprintf(
            "INSERT INTO `%s` (%s) VALUES (%s);",
            $table,
            implode(", ", $fields),
            implode(", ", $placeholders)
        );

        return [
            'sql'    => $sql,
            'params' => $params,
        ];
    }

    protected function prepareUpdateQuery(array $data, array $original, array $config): ?array
    {
        $table           = $config['table'] ?? null;
        $identifierField = $config['identifierField'] ?? 'id';
        $notUpdatable    = $config['notUpdatable'] ?? [];
        $extraSets       = $config['extraSets'] ?? [];

        if (!$table || !isset($data[$identifierField])) {
            $this->res['msg'] = "Table ou identifiant manquant pour la mise à jour.";
            $this->stop(false);
        }

        $sets   = [];
        $params = [];

        // Champs modifiables envoyés par l'utilisateur
        foreach ($data as $field => $newValue) {
            if ($field === $identifierField) {
                continue;
            }

            if (in_array($field, $notUpdatable, true)) {
                $this->res['msg'] = "Le champ « {$field} » ne peut pas être modifié.";
                $this->stop(false);
            }

            $oldValue = $original[$field] ?? null;

            // Comparaison en chaîne pour éviter les faux positifs liés au typage
            if ((string)$newValue !== (string)$oldValue) {
                $sets[]   = "`$field` = ?";
                $params[] = $newValue;
            }
        }

        // Ajout des champs forcés (valeurs SQL brutes)
        foreach ($extraSets as $field => $sqlValue) {
            $sets[] = "`$field` = {$sqlValue}";
        }

        // Aucun changement détecté
        if (empty($sets)) {
            return null;
        }

        // Ajout de l'identifiant pour la clause WHERE
        $params[] = $data[$identifierField];

        return [
            'sql'    => "UPDATE `{$table}` SET " . implode(", ", $sets) . " WHERE `{$identifierField}` = ?;",
            'params' => $params,
        ];
    }

    protected function validateFields(array &$data, array $schema): void
    {
        foreach ($schema as $field => $rules) {
            $label    = $rules['label']    ?? $field;
            $required = $rules['required'] ?? true;

            if ($required) {
                $this->isset(
                    $data,
                    $field,
                    $rules['required_msg'] ?? "Le champ « {$label} » doit être renseigné."
                );
            }

            if (!array_key_exists($field, $data)) {
                continue;
            }

            $value = $data[$field];

            if (isset($rules['type'])) {
                switch ($rules['type']) {
                    case 'string':
                        if (!is_string($value)) {
                            $this->validationError($field, $label, 'string', $value, $rules['type_msg'] ?? null);
                        }
                        break;

                    case 'int':
                        if (filter_var($value, FILTER_VALIDATE_INT) === false) {
                            $this->validationError($field, $label, 'int', $value, $rules['type_msg'] ?? null);
                        }
                        break;

                    case 'float':
                        if (filter_var($value, FILTER_VALIDATE_FLOAT) === false) {
                            $this->validationError($field, $label, 'float', $value, $rules['type_msg'] ?? null);
                        }
                        break;

                    case 'bool':
                    case 'boolean':
                        $bool = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                        if ($bool === null) {
                            $this->validationError($field, $label, 'bool', $value, $rules['type_msg'] ?? null);
                        }
                        $data[$field] = $bool;
                        break;

                    case 'json':
                        if (is_string($value)) {
                            $decoded = json_decode($value, true);
                            if (json_last_error() !== JSON_ERROR_NONE) {
                                $this->validationError(
                                    $field,
                                    $label,
                                    'json',
                                    $value,
                                    $rules['type_msg'] ?? "Le champ « {$label} » doit être un JSON valide.",
                                    'JSON invalide',
                                    json_last_error_msg()
                                );
                            }
                            $data[$field] = $decoded;
                        } elseif (!is_array($value) && !is_object($value)) {
                            $this->validationError($field, $label, 'json', $value, $rules['type_msg'] ?? null);
                        }
                        break;
                }
            }

            if (isset($rules['pattern']) && !preg_match($rules['pattern'], $value)) {
                $this->validationError(
                    $field,
                    $label,
                    'pattern',
                    $value,
                    $rules['pattern_msg'] ?? "Le champ « {$label} » n'est pas dans le format attendu.",
                    'Pattern non respecté',
                    $rules['pattern']
                );
            }

            if (!empty($rules['truthy'])) {
                $bool = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($bool !== true) {
                    $this->validationError(
                        $field,
                        $label,
                        'truthy',
                        $value,
                        $rules['truthy_msg'] ?? "Le champ « {$label} » doit être vrai.",
                        'Valeur non truthy'
                    );
                }
            }
        }
    }

    /**
     * Centralise la génération d'une erreur de validation
     */
    private function validationError(
        string $field,
        string $label,
        string $expected,
               $value,
        ?string $msg = null,
        string $issue = 'Type invalide',
        $extra = null
    ): void {
        $this->res['msg'] = $msg ?? "Le champ « {$label} » est invalide.";
        $this->res['dev_error'] = [
            'field'     => $field,
            'issue'     => $issue,
            'expected'  => $expected,
            'received'  => gettype($value),
            'value'     => $value,
            'extra'     => $extra,
            'timestamp' => date('c')
        ];
        $this->stop(false);
    }

}
