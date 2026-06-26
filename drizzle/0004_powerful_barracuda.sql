CREATE TABLE `rocket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subsystemId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`messageType` enum('instrucao','status','resposta','comentario') DEFAULT 'comentario',
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rocket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rocket_subsystems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`leadId` int,
	`progress` int DEFAULT 0,
	`status` enum('planejamento','desenvolvimento','teste','validacao','concluido') DEFAULT 'planejamento',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rocket_subsystems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rocket_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subsystemId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`createdById` int NOT NULL,
	`assignedToId` int,
	`priority` enum('baixa','media','alta','critica') DEFAULT 'media',
	`status` enum('pendente','em_progresso','concluida','bloqueada') DEFAULT 'pendente',
	`dueDate` timestamp,
	`completedDate` timestamp,
	`completedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rocket_tasks_id` PRIMARY KEY(`id`)
);
