<?php
namespace App\Controllers;

use App\Core\BaseController;

class Game extends BaseController
{
    /**
     * CRÉATION
     * Génère un code et initialise la partie
     */
    public function create($params, $data): void
    {
        $code = strtoupper(substr(str_shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 4));

        $initialState = json_encode([
            'step' => 0,
            'message' => 'En attente du MJ',
            'timestamp' => time()
        ]);

        $this->api->instruct(
            "INSERT INTO Games (code, state) VALUES (?, ?)",
            [$code, $initialState]
        );

        $this->res['status'] = true;
        $this->res['msg']    = "Partie créée avec succès !";
        $this->res['data']   = ['code' => $code];
        $this->stop(true);
    }

    /**
     * LECTURE (Polling)
     * Récupère l'état via le code
     */
    public function read($params, $data): void
    {
        $this->validateFields($data, [
            'code' => ['label' => 'Code de partie', 'type' => 'string', 'required' => true]
        ]);

        $game = $this->api->one(
            "SELECT state FROM Games WHERE code = ?",
            [$data['code']]
        );

        if (!$game) {
            $this->res['status'] = false;
            $this->res['msg']    = "Partie introuvable.";
            $this->stop(false);
        }

        $stateObj = json_decode($game['state']);

        $this->res['status'] = true;
        $this->res['data']   = $stateObj;
        $this->stop(true);
    }

    /**
     * MISE À JOUR (Action MJ)
     * Modifie l'état de la partie
     */
    public function update($params, $data): void
    {
        $this->validateFields($data, [
            'code'  => ['label' => 'Code de partie', 'type' => 'string', 'required' => true],
            'state' => ['label' => 'État du jeu', 'type' => 'json', 'required' => true]
        ]);

        $existing = $this->api->one("SELECT id FROM Games WHERE code = ?", [$data['code']]);
        if (!$existing) {
            $this->res['msg'] = "Partie introuvable.";
            $this->stop(false);
        }

        $jsonState = json_encode($data['state']);

        $this->api->instruct(
            "UPDATE Games SET state = ? WHERE code = ?",
            [$jsonState, $data['code']]
        );

        $this->res['status'] = true;
        $this->res['msg']    = "État mis à jour.";
        $this->stop(true);
    }
}