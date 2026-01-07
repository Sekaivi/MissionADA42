<?php
// core/BaseController.php
namespace App\Core;

use App\Config\Config;

/**
 * Classe de base abstraite pour tous les contrôleurs.
 * Elle utilise le trait Controller et initialise
 * les dépendances communes (API, TokenUtils, res).
 */
abstract class BaseController
{
    use Controller;

    protected API $api;
    protected TokenUtils $tokenUtils;

    /**
     * Le constructeur de base initialise les services communs.
     */
    public function __construct()
    {
        // 4. Instancier les services
        $this->api = new API();
        $this->tokenUtils = new TokenUtils();

        // 5. Initialiser le tableau de réponse
        // (le trait le déclare, mais c'est bien de l'initialiser ici)
        $this->res = ['status' => true, 'msg' => '', 'data' => []];
    }

    /**
     * Helper pour récupérer facilement la config
     */
    protected function cfg(string $key, $default = null)
    {
        return Config::getInstance()->get($key, $default);
    }

    protected function renderMailTemplate(string $type, array $data, string $lang = 'fr'): array
    {
        $path = __DIR__ . "/../templates/mails/{$type}.{$lang}.php";
        if (!file_exists($path)) {
            throw new \Exception("Template de mail introuvable : {$path}");
        }

        $template = include $path;
        return $template($data);
    }

}