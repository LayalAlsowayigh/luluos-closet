CREATE TYPE "public"."category" AS ENUM('Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "closet_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" "category" NOT NULL,
	"color" text NOT NULL,
	"style" text,
	"description" text,
	"occasions" text[] DEFAULT '{}',
	"image_url" text,
	"image_base64" text,
	"bg_removed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outfit_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"occasion" text NOT NULL,
	"weather" text NOT NULL,
	"items" text[] NOT NULL,
	"rationale" text,
	"styling_tip" text,
	"color_narrative" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
