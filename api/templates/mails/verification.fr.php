<?php
return function(array $data) {
    $username = $data['username'];
    $link = $data['link'];

    return [
        'subject' => "Vérifiez",
        'body'    => <<<HTML
<p>Bonjour {$username},</p>
<p><a href="{$link}">lien</a></p>
HTML
    ];
};
