CREATE TABLE `Games` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `code` varchar(6) NOT NULL, -- Code unique (ex: AH7B) pour rejoindre
    `state` json NOT NULL,      -- L'état du jeu (étape, énigmes résolues...)
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `code` (`code`)
);