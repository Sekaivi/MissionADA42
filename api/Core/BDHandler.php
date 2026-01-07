<?php
// core/BDHandler.php
namespace App\Core;

use PDO;
use PDOException;
use PDOStatement;
use RuntimeException;
use App\Config\Config;

class BDHandler
{
    private PDO $conn;

    public function __construct()
    {
        // Récupère la config via le singleton
        $config = Config::getInstance();

        $host = $config->get('DB_HOST');
        $port = $config->get('DB_PORT');
        $name = $config->get('DB_NAME');
        $user = $config->get('DB_USER');
        $pwd  = $config->get('DB_PWD');

        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $name);

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ];

        try {
            $this->conn = new PDO($dsn, $user, $pwd, $options);
        } catch (PDOException $e) {
            throw new RuntimeException('Connexion à la base impossible', 0, $e);
        }
    }

    /**
     * Exécute une requête SELECT et renvoie un tableau associatif
     */
    public function select(string $sql, array $params = []): array
    {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $this->cleanData($stmt->fetchAll());
        } catch (PDOException $e) {
            throw new RuntimeException('Erreur SQL : ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Exécute une requête INSERT/UPDATE/DELETE et retourne lastInsertId
     */
    public function instruct(string $sql, array $params = [])
    {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            throw new RuntimeException('Erreur SQL : ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Prépare et exécute une requête, renvoie le PDOStatement
     */
    public function query(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Nettoie les clés numériques d'un fetchAll()
     */
    private function cleanData(array $data): array
    {
        return array_map(fn($row) => array_filter($row, fn($k) => !is_int($k), ARRAY_FILTER_USE_KEY), $data);
    }

    /**
     * Retourne la connexion PDO brute
     */
    public function getConnection(): PDO
    {
        return $this->conn;
    }
}
