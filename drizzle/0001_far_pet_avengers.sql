CREATE TABLE `analytics_event` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`kind` text NOT NULL,
	`value` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`visitor_id`) REFERENCES `analytics_visitor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_analytics_event_created` ON `analytics_event` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_event_visitor_created` ON `analytics_event` (`visitor_id`,`created_at`);