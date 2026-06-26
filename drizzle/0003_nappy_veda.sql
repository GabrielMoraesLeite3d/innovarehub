CREATE TABLE `crm_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`type` enum('email','telefone','reuniao','proposta','acompanhamento','outro') DEFAULT 'email',
	`description` text,
	`interactionDate` timestamp NOT NULL,
	`userId` int NOT NULL,
	`nextFollowUp` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('convidado','confirmado','rejeitado','nao_respondeu') DEFAULT 'convidado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('reuniao','treinamento','apresentacao','workshop','outro') DEFAULT 'reuniao',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`location` varchar(255),
	`organizerId` int NOT NULL,
	`status` enum('planejado','confirmado','em_andamento','concluido','cancelado') DEFAULT 'planejado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assignedToId` int,
	`priority` enum('baixa','media','alta','critica') DEFAULT 'media',
	`status` enum('nao_iniciada','em_andamento','bloqueada','concluida','cancelada') DEFAULT 'nao_iniciada',
	`dueDate` timestamp,
	`completedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceId` int NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`purpose` text,
	`status` enum('planejado','confirmado','em_uso','concluido','cancelado') DEFAULT 'planejado',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resource_assignments_id` PRIMARY KEY(`id`)
);
