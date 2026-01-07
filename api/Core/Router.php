<?php
// core/Router.php
namespace App\Core;

use App\Config\Config;

$config = Config::getInstance();
define('BASE_PATH', $config->get('BASE_PATH'));

class Router
{
    private array $routes = [];
    private string $currentGroupPrefix = '';
    private array $currentGroupMiddleware = [];
    private bool $inGroupContext = false;

    /**
     * @var int[] Indices des routes ajoutées par le dernier appel à group()
     */
    private array $lastGroupIndices = []; // <-- NOUVEAU

    /**
     * Nettoie le contexte du dernier groupe pour éviter que
     * de futurs appels n'agissent dessus.
     */
    private function clearLastGroupContext(): void // <-- NOUVEAU
    {
        if (!empty($this->lastGroupIndices)) {
            $this->lastGroupIndices = [];
        }
    }

    public function register(string $method, string $pattern, array $handler)
    {
        if (!$this->inGroupContext) {
            $this->clearLastGroupContext();
        }

        $fullPattern = $this->currentGroupPrefix . $pattern;
        $regex = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '(?P<$1>[^/]+)', $fullPattern);
        $regex = '#^' . $regex . '$#';

        $this->routes[] = [
            'method'     => strtoupper($method),
            'raw_pattern'=> $fullPattern,
            'pattern'    => $regex,
            'handler'    => $handler,
            'middleware' => $this->currentGroupMiddleware ? array_values($this->currentGroupMiddleware) : [],
        ];

        return $this;
    }

    public function group(string $prefix, callable $callback)
    {
        // 1. Nettoyer le contexte d'un appel ->middleware() précédent
        $this->clearLastGroupContext();

        // 2. Sauvegarder l'état
        $prevPrefix = $this->currentGroupPrefix;
        $prevMiddleware = $this->currentGroupMiddleware;
        $prevInGroup = $this->inGroupContext;

        // 3. Mémoriser l'index de DÉBUT
        // (Nous permettra de savoir tout ce qui a été ajouté par ce groupe)
        $startIndex = count($this->routes);

        // 4. Entrer dans le groupe
        $this->currentGroupPrefix = $prevPrefix . $prefix;
        $this->inGroupContext = true;
        $this->currentGroupMiddleware = []; // Important: les sous-groupes ne doivent pas hériter le MW du parent *automatiquement*

        // 5. Exécuter l'enregistrement (qui va ajouter des routes)
        $callback($this);

        // 6. Restaurer l'état
        $this->currentGroupPrefix = $prevPrefix;
        $this->currentGroupMiddleware = $prevMiddleware;
        $this->inGroupContext = $prevInGroup;

        // 7. Mémoriser TOUS les indices ajoutés dans ce groupe
        $endIndex = count($this->routes) - 1;
        if ($endIndex >= $startIndex) {
            // Le groupe a ajouté des routes (directement ou via sous-groupes)
            // On mémorise la plage d'indices
            $this->lastGroupIndices = range($startIndex, $endIndex);
        } else {
            $this->lastGroupIndices = []; // Le groupe était vide
        }

        return $this;
    }

    public function middleware(callable $fn)
    {
        if (!empty($this->lastGroupIndices)) {
            // Cas n°1: On vient de définir un groupe.
            // Appliquer le middleware à toutes les routes de ce groupe.
            foreach ($this->lastGroupIndices as $index) {
                $this->routes[$index]['middleware'][] = $fn;
            }
            // On ne vide PAS $this->lastGroupIndices ici,
            // pour permettre ->middleware(...)->middleware(...)

        } else if ($this->inGroupContext) {
            // Cas n°2: Middleware défini DANS le callback du groupe (pas votre cas)
            $this->currentGroupMiddleware[] = $fn;
        } else {
            // Cas n°3: Middleware sur une route unique
            $last = count($this->routes) - 1;
            if ($last >= 0) {
                // On nettoie le contexte du groupe au cas où
                $this->clearLastGroupContext(); // <-- NOUVEAU
                $this->routes[$last]['middleware'][] = $fn;
            }
        }
        return $this;
    }

    public function dispatch(string $method, string $uri, array $bodyParams = [])
    {
        // Une fois le dispatch lancé, on n'a plus besoin du contexte du dernier groupe
        $this->clearLastGroupContext(); // <-- NOUVEAU

        $path = parse_url($uri, PHP_URL_PATH);

        if (defined('BASE_PATH') && BASE_PATH !== '' && BASE_PATH !== '/') {
            $path = preg_replace('#^' . preg_quote(BASE_PATH, '#') . '#', '', $path);
        }
        if ($path === '') $path = '/';

        foreach ($this->routes as $route) {
            if ($route['method'] === strtoupper($method) && preg_match($route['pattern'], $path, $matches)) {
                // Params d'URL
                $urlParams = [];
                foreach ($matches as $key => $value) {
                    if (!is_int($key)) $urlParams[$key] = $value;
                }

                // <-- Ajout pour illustrer le flux

                // Exécuter les middlewares (si un middleware bloque, il doit gérer la réponse lui-même)
                if (!empty($route['middleware'])) {
                    foreach ($route['middleware'] as $mw) {

                        // Fusion des paramètres pour le middleware
                        // Le middleware reçoit TOUS les paramètres (URL + Body)
                        $allParams = array_merge($urlParams, $bodyParams);

                        // Note: $mw($urlParams, $bodyParams) est aussi valide,
                        // mais $mw($allParams, $bodyParams) peut être plus flexible
                        // Gardons votre logique originale pour l'instant :
                        $result = $mw($urlParams, $bodyParams);

                        if ($result === false) {
                            // Middleware a bloqué sans réponse → 403 par défaut
                            http_response_code(403);
                            echo json_encode([
                                'status' => false,
                                'msg' => 'Accès interdit par middleware',
                            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                            return;
                        }
                        // Si le middleware retourne un tableau, on suppose qu'il a répondu
                        if (is_array($result) && isset($result['status']) && $result['status'] === false) {
                            // Le middleware a retourné une erreur spécifique
                            echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                            return;
                        }
                        // Si $result === true ou null, on continue
                    }
                }

                // Appeler le contrôleur
                [$class, $func] = $route['handler'];
                $controller = new $class();

                // On passe toujours ($params URL, $data body)
                $result = $controller->$func($urlParams, $bodyParams);

                echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                return;
            }
        }

        // 404 enrichi
        http_response_code(404);
        echo json_encode([
            'status'       => false,
            'msg'          => 'Route non trouvée',
            'method'       => strtoupper($method),
            'request_uri'  => $uri,
            'parsed_path'  => $path,
            'base_path'    => defined('BASE_PATH') ? BASE_PATH : '',
            'registered_routes' => array_map(function ($r) {
                return [
                    'method'  => $r['method'],
                    'pattern' => BASE_PATH . $r['raw_pattern'] ?? $r['pattern'],
                ];
            }, $this->routes)
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}