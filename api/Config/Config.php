<?php
// config/Config.php
namespace App\Config;

use Dotenv\Dotenv;

class Config
{
    private static ?self $instance = null;
    private array $vars = [];

    private function __construct()
    {
        // Valeurs par défaut
        $defaults = [
            'DB_HOST' => '',
            'DB_PORT' => '',
            'DB_NAME' => '',
            'DB_USER' => '',
            'DB_PWD'  => '',
            'APP_DEBUG' => false,
            'COOKIE_SECURE' => true,
            'COOKIE_SAMESITE' => 'None',
            'FRONT_ROOT' => '',
            'FRONT_BASE_URI' => '',
            'UPLOAD_DIR' => '/uploads',
            'ALLOWED_ORIGINS' => '',
            'SITE_URL' => 'http://localhost',
            'DEFAULT_LANG' => 'en',
            'MAIL_FROM' => 'noreply@example.com',
        ];

        // Charger .env
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->safeLoad(); // safeLoad = ne crash pas si .env absent
        if (file_exists(__DIR__ . '/../../.env.local')) {
            $dotenvLocal = Dotenv::createImmutable(__DIR__ . '/../../', '.env.local');
            $dotenvLocal->safeLoad();
        }

        // Merge defaults + .env
        $env = $_ENV ?? [];
        $this->vars = array_merge($defaults, $env);

        // Typage / parsing
        $this->vars['DB_PORT'] = (int) ($this->vars['DB_PORT'] ?? 3306);
        $this->vars['APP_DEBUG'] = filter_var($this->vars['APP_DEBUG'], FILTER_VALIDATE_BOOLEAN);
        $this->vars['COOKIE_SECURE'] = filter_var($this->vars['COOKIE_SECURE'], FILTER_VALIDATE_BOOLEAN);
        $this->vars['ALLOWED_ORIGINS'] = array_filter(array_map('trim', explode(',', $this->vars['ALLOWED_ORIGINS'])));

        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $basePath = rtrim(dirname($scriptName), '/');
        $this->vars['BASE_PATH'] = $basePath === '' ? '/' : $basePath;
    }

    public static function getInstance(): self
    {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get(string $key, $default = null)
    {
        return $this->vars[$key] ?? $default;
    }

    public function all(): array
    {
        return $this->vars;
    }
}
