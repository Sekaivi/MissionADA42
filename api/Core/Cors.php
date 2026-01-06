<?php
// core/Cors.php
namespace App\Core;

use App\Config\Config;

class Cors
{
    public static function handle(): void
    {
        $config = Config::getInstance();
        $allowedOrigins = $config->get('ALLOWED_ORIGINS', []);
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header("Access-Control-Allow-Credentials: true");
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Expose-Headers: Set-Cookie");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status'  => true,
                'msg'     => 'Préflight OK',
                'origin'  => $origin,
                'allowed' => in_array($origin, $allowedOrigins, true),
            ], JSON_PRETTY_PRINT);
            exit;
        }
    }
}
