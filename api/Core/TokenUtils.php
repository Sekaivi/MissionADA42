<?php
// core/TokenUtils.php
namespace App\Core;

use App\Config\Config;

class TokenUtils
{
    private string $secret;

    public function __construct()
    {
        $config = Config::getInstance();
        $this->secret = $config->get('APP_SECRET', 'default_secret');
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public function createToken(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $headerEncoded  = $this->base64UrlEncode(json_encode($header));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));
        $signature      = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $this->secret, true);
        $signatureEncoded = $this->base64UrlEncode($signature);

        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }

    public function validateToken(string $token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

        $expectedSignature = $this->base64UrlEncode(
            hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $this->secret, true)
        );

        if (!hash_equals($expectedSignature, $signatureEncoded)) {
            return false;
        }

        $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);
        if (isset($payload['exp']) && time() > $payload['exp']) {
            return false;
        }

        return $payload;
    }

    /**
     * Génère une chaîne aléatoire sécurisée pour le Refresh Token.
     */
    public function generateRandomString(int $length = 32): string
    {
        return bin2hex(random_bytes($length));
    }
}
