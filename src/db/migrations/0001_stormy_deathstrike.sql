CREATE TABLE "calendar_outfits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"item_ids" text[] DEFAULT '{}' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
