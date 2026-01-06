CREATE TABLE `Games` (
                         `id` int(11) NOT NULL AUTO_INCREMENT,
                         `code` varchar(4) NOT NULL,
                         `state` json NOT NULL, -- Si ta version MySQL est vieille, utilise TEXT
                         `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `unique_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;