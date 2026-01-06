<?php

use App\Config\Config;

$config = Config::getInstance();
$debug = $config->get('APP_DEBUG', false);

// Gestionnaire d'exceptions global : transforme TOUT crash en JSON
set_exception_handler(function (Throwable $e) use ($debug) {
    error_log($e->getMessage());
    error_log($e->getTraceAsString());

    $httpCode = 500;
    $userMsg  = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
    $devError = null;

    // Erreur volontaire « input »
    if ($e instanceof InvalidArgumentException) {
        $httpCode = 400;
        $userMsg  = $e->getMessage();
    }

    // Méthode non implémentée
    if ($e instanceof Exception && preg_match("/Méthode .+ non implémentée\.?$/i", $e->getMessage())) {
        $httpCode = 500;
        $userMsg  = $e->getMessage();
    }

    // Récupération PDOException
    $pdoEx = null;
    if ($e instanceof PDOException) {
        $pdoEx = $e;
    } elseif ($e->getPrevious() instanceof PDOException) {
        $pdoEx = $e->getPrevious();
    }

    if ($pdoEx) {
        $info      = $pdoEx->errorInfo;
        $sqlState  = $info[0] ?? '';
        $errNo     = $info[1] ?? 0;
        $rawMsg    = $info[2] ?? $pdoEx->getMessage();

        $httpCode = 400;

        // Valeur incorrecte
        if ($errNo === 1366 || $sqlState === '22007') {
            if (preg_match("/Incorrect (?:integer|datetime) value: '(.+?)' for column (.+?) at row/i", $rawMsg, $m)) {
                preg_match_all("/`([^`]+)`/", $m[2], $colMatches);
                $column = end($colMatches[1]);
                $type   = stripos($rawMsg, 'integer') !== false ? 'nombre entier' : 'date/heure';
                $userMsg = sprintf(
                    "Le champ « %s » doit être un %s valide, « %s » n'est pas accepté.",
                    $column,
                    $type,
                    $m[1]
                );
            } else {
                $userMsg = "Une valeur fournie n'est pas dans un format valide.";
            }
        }

        // Duplicate entry
        if ($sqlState === '23000' && preg_match("/Duplicate entry '([^']+)' for key '([^']+)'/", $rawMsg, $m)) {
            list(, $dupValue, $keyName) = $m;
            if ($keyName === 'PRIMARY' || stripos($keyName, 'year') !== false) {
                $userMsg = "Impossible de créer/modifier la saison : l’année « {$dupValue} » existe déjà.";
            } else {
                $userMsg = "Valeur dupliquée « {$dupValue} » pour la clé « {$keyName} ».";
            }
        }
        elseif ($errNo === 1451) {
            if (preg_match("/fails \(`[^`]+`\.`([^`]+)`/", $rawMsg, $m)) {
                $child = $m[1];
                switch ($child) {
                    case 'Resultats':
                        $userMsg = "Impossible de supprimer cet utilisateur : il possède des résultats.";
                        break;
                    case 'SeasonUsers':
                        $userMsg = "Impossible de supprimer cet utilisateur : il est inscrit à une ou plusieurs saisons.";
                        break;
                    default:
                        $userMsg = "Impossible de supprimer cet élément : il est référencé dans « {$child} ».";
                }
            } else {
                $userMsg = "Violation de contrainte d’intégrité (FK).";
            }
        }
        elseif ($sqlState === '23000') {
            $userMsg = "Violation de contrainte d’intégrité (code {$errNo}).";
        }
        else {
            $userMsg = "Erreur SQL inattendue.";
        }

        // Message technique pour le dev
        $devError = [
            'exception' => get_class($e),
            'message'   => $e->getMessage(),
            'sqlInfo'   => $pdoEx->errorInfo,
            'trace'     => $e->getTraceAsString()
        ];
    } else {
        // Cas non PDO → on met quand même un bloc technique si debug
        $devError = [
            'exception' => get_class($e),
            'message'   => $e->getMessage(),
            'trace'     => $e->getTraceAsString()
        ];
    }

    // Réponse JSON
    $response = [
        'status' => false,
        'msg'    => $userMsg
    ];

    // Ajout du message technique uniquement en mode debug
    if ($debug && $devError) {
        $response['dev_error'] = $devError;

        // Ajoute aussi le payload reçu
        $rawPayload = file_get_contents('php://input');
        $decodedPayload = json_decode($rawPayload, true);
        $response['payload'] = $decodedPayload ?? $rawPayload;
    }

    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
});
