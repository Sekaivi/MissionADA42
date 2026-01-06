<?php
return function(array $data) {
    $username = $data['username'];
    $link = $data['link'];

    return [
        'subject' => "Verify",
        'body'    => <<<HTML
<p>Hello {$username},</p>
<p><a href="{$link}">link</a></p>
HTML
    ];
};
