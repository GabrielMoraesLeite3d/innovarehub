CREATE TABLE `local_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` text,
	`teamType` enum('innovare_team','rocket_team') NOT NULL DEFAULT 'innovare_team',
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `local_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `teamType` enum('innovare_team','rocket_team') DEFAULT 'innovare_team' NOT NULL;