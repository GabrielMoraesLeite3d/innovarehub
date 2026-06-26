CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`value` decimal(12,2) NOT NULL,
	`percentage` decimal(5,2),
	`status` enum('previsto','aprovado','pago') DEFAULT 'previsto',
	`paymentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skill` varchar(255) NOT NULL,
	`level` int DEFAULT 0,
	`evaluationDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`origin` varchar(100),
	`contact` varchar(255),
	`company` varchar(255),
	`description` text,
	`status` enum('entrada','triagem','aguardando_briefing','orcamento_elaboracao','proposta_enviada','negociacao','aprovado','recusado','virou_projeto','arquivado') DEFAULT 'entrada',
	`estimatedValue` decimal(12,2),
	`commissionApplicable` boolean DEFAULT true,
	`commissionPercentage` decimal(5,2),
	`responsibleId` int,
	`personInCharge` varchar(255),
	`nextAction` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('receita','despesa','comissao','reembolso','aporte') NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`category` varchar(100),
	`date` timestamp NOT NULL,
	`status` enum('previsto','confirmado','pago') DEFAULT 'previsto',
	`projectId` int,
	`userId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pnd` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provisionalName` varchar(255) NOT NULL,
	`internalCode` varchar(100),
	`area` varchar(100),
	`problemStatement` text,
	`proposedSolution` text,
	`technicalDifferential` text,
	`status` enum('ideia','registro_interno','pesquisa_referencia','hipotese_tecnica','conceito','prototipo','teste','contraprova','documentacao','analise_patente') DEFAULT 'ideia',
	`patentPotential` varchar(100),
	`editorialPotential` varchar(100),
	`secretLevel` varchar(100),
	`piStatus` varchar(100),
	`nextStep` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pnd_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`client` varchar(255) NOT NULL,
	`description` text,
	`phase` enum('entrada_lead','diagnostico','proposta','kickoff','conceito','producao','qa','pos_projeto') NOT NULL,
	`status` enum('backlog','em_andamento','concluido','pausado','cancelado') DEFAULT 'backlog',
	`priority` enum('baixa','media','alta','critica') DEFAULT 'media',
	`responsibleId` int,
	`value` decimal(12,2),
	`estimatedCost` decimal(12,2),
	`internalDeadline` timestamp,
	`externalDeadline` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceId` int NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`purpose` text,
	`status` enum('solicitado','aprovado','em_uso','concluido','cancelado') DEFAULT 'solicitado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resource_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`location` varchar(255),
	`responsibleId` int,
	`status` enum('disponivel','em_uso','manutencao','descartado') DEFAULT 'disponivel',
	`availability` varchar(100),
	`riskLevel` varchar(100),
	`linkedProject` int,
	`lastUsage` timestamp,
	`maintenanceNeeded` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rocket_missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`objective` text,
	`payload` varchar(255),
	`subsystem` varchar(255),
	`responsibleId` int,
	`requirement` text,
	`proposedSolution` text,
	`status` enum('planejamento','desenvolvimento','teste','validacao','concluido') DEFAULT 'planejamento',
	`relatedDocument` varchar(255),
	`relatedTest` varchar(255),
	`risk` varchar(100),
	`nextValidation` timestamp,
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rocket_missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technical_counterproofs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`subsystem` varchar(255),
	`hypothesis` text,
	`calculation` text,
	`simulation` text,
	`prototype` text,
	`test` text,
	`result` text,
	`failure` text,
	`correction` text,
	`evidence` text,
	`conclusion` text,
	`status` enum('em_andamento','concluida','falha','revisao') DEFAULT 'em_andamento',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technical_counterproofs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainingId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('nao_iniciado','em_andamento','concluido') DEFAULT 'nao_iniciado',
	`completionDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`instructor` varchar(255),
	`area` varchar(100),
	`status` enum('planejado','em_andamento','concluido') DEFAULT 'planejado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `jobTitle` varchar(100);