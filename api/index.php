<?php
// index.php — Point d'entrée unique

require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Config;
use App\Core\Cors;
use App\Core\Router;

// Init config
$config = Config::getInstance();

// CORS (AVANT tout output)
Cors::handle();

// Headers globaux
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/Config/error_handler.php';

// Router
$router = new Router();

$router->group('/game', function ($r) {
    $r->register('GET', '/list', [\App\Controllers\Game::class, 'list']);
    $r->register('GET', '/create', [\App\Controllers\Game::class, 'create']);

    // requiert ?code=XXXX via GET
    $r->register('GET', '/read', [\App\Controllers\Game::class, 'read']);

    $r->register('POST', '/update', [\App\Controllers\Game::class, 'update']);

    $r->register('DELETE', '/{id}', [\App\Controllers\Game::class, 'delete']);
});

// Lecture body
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$bodyParams = [];

if (stripos($contentType, 'application/json') !== false) {
    $rawBody = trim(file_get_contents('php://input'));
    if ($rawBody !== '') {
        $bodyParams = json_decode($rawBody, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new InvalidArgumentException('JSON invalide');
        }
    }
} else {
    $bodyParams = $_POST;
}

$params = array_merge($bodyParams, $_GET);

// Dispatch
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$router->dispatch($_SERVER['REQUEST_METHOD'], $uri, $params);
