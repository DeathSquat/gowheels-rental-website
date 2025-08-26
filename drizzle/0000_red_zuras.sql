CREATE TABLE `admin_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_settings_setting_key_unique` ON `admin_settings` (`setting_key`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_reference` text NOT NULL,
	`user_id` integer,
	`vehicle_id` integer,
	`pickup_date` text NOT NULL,
	`return_date` text NOT NULL,
	`pickup_time` text,
	`return_time` text,
	`pickup_address` text NOT NULL,
	`dropoff_address` text NOT NULL,
	`driver_name` text NOT NULL,
	`driver_phone` text NOT NULL,
	`driver_email` text NOT NULL,
	`extras_insurance` integer DEFAULT false,
	`extras_driver` integer DEFAULT false,
	`extras_child_seat` integer DEFAULT false,
	`promo_code` text,
	`base_price` text NOT NULL,
	`extras_price` text DEFAULT '0',
	`taxes` text NOT NULL,
	`total_amount` text NOT NULL,
	`payment_method` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_booking_reference_unique` ON `bookings` (`booking_reference`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer,
	`razorpay_order_id` text NOT NULL,
	`razorpay_payment_id` text,
	`razorpay_signature` text,
	`amount` text NOT NULL,
	`currency` text DEFAULT 'INR',
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_type` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `support_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`conversation_reference` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`agent_name` text DEFAULT 'AI Assistant',
	`is_ai_handled` integer DEFAULT true,
	`escalated_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `support_conversations_conversation_reference_unique` ON `support_conversations` (`conversation_reference`);--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer,
	`sender_type` text NOT NULL,
	`content` text NOT NULL,
	`attachment_url` text,
	`attachment_name` text,
	`is_escalated` integer DEFAULT false,
	`ai_generated` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `support_conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`profile_image_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_login_at` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicle_insurance_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer,
	`type` text NOT NULL,
	`price_per_day` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`image_url` text NOT NULL,
	`gallery_images` text,
	`seats` integer NOT NULL,
	`transmission` text NOT NULL,
	`fuel_type` text NOT NULL,
	`doors` integer,
	`price_per_hour` text,
	`price_per_day` text NOT NULL,
	`amenities` text,
	`rating` text DEFAULT '0',
	`review_count` integer DEFAULT 0,
	`location_address` text NOT NULL,
	`location_lat` text,
	`location_lng` text,
	`availability_status` integer DEFAULT true,
	`cancellation_policy` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`is_active` integer DEFAULT true
);
