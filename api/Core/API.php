<?php
// core/API.php
namespace App\Core;

use App\Core\BDHandler;

class API extends BDHandler
{
    public function add($req, $args): false|string
    {
        return $this->instruct($req, $args);
    }

    public function list($req, $args = []): array
    {
        return $this->select($req, $args);
    }

    /**
     * SELECT une seule ligne
     * @param  string   $req
     * @param   array   $args
     * @return array<string,mixed>   la première ligne, ou tableau vide
     */
    public function one(string $req, array $args = []): array
    {
        $rows = $this->select($req, $args);
        return !empty($rows) ? $rows[0] : [];
    }

    public function update($req, $args): void
    {
        $this->instruct($req, $args);
    }

    public function delete($req, $args): void
    {
        $this->instruct($req, $args);
    }


}
