<?php
namespace App\Core;

class AuthTokenService
{
    private TokenUtils $tokenUtils;
    private int $accessLifetime;
    private int $refreshLifetime;
    private string $issuer;

    public function __construct(
        TokenUtils $tokenUtils,
        string $issuer,
        int $accessLifetime,
        int $refreshLifetime
    ) {
        $this->tokenUtils = $tokenUtils;
        $this->issuer = $issuer;
        $this->accessLifetime = $accessLifetime;
        $this->refreshLifetime = $refreshLifetime;
    }

    public function generateAccessToken(int $userId, array $roles = []): string
    {
        $now = time();
        $payload = [
            'iss'    => $this->issuer,
            'sub'    => $userId,
            'userId' => $userId,
            'iat'    => $now,
            'exp'    => $now + $this->accessLifetime,
            'roles'  => $roles
        ];
        return $this->tokenUtils->createToken($payload);
    }

    public function validateAccessToken(string $token): ?array
    {
        return $this->tokenUtils->validateToken($token);
    }

    public function generateRefreshToken(): string
    {
        return $this->tokenUtils->generateRandomString();
    }

    public function getAccessLifetime(): int
    {
        return $this->accessLifetime;
    }

    public function getRefreshLifetime(): int
    {
        return $this->refreshLifetime;
    }
}
