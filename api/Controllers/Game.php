<?php
// controllers/Game.php
namespace App\Controllers;

use App\Core\BaseController;

class Game extends BaseController
{
    public function create(): void {
        $code = strtoupper(substr(str_shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 4));
        $initialState = json_encode(['step' => 0, 'message' => 'En attente du MJ']);

        $this->api->instruct(
            "INSERT INTO Games (code, state) VALUES (?, ?)",
            [$code, $initialState]
        );

        $this->res['status'] = true;
        $this->res['msg']    = "Partie crée avec succès !";
        $this->res['data']   = ['code' => $code];
        $this->stop(true);
    }

}