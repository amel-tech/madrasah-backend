CREATE TYPE "public"."flashcard_type" AS ENUM('VOCABULARY', 'HADEETH');--> statement-breakpoint
CREATE TABLE "deck_tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "deck_tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck_tags_decks" (
	"deck_id" integer NOT NULL,
	"deck_tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "decks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"author_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "flashcards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"deck_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"type" "flashcard_type" NOT NULL,
	"content_front" text NOT NULL,
	"content_back" text NOT NULL,
	"content_meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deck_tags_decks" ADD CONSTRAINT "deck_tags_decks_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_tags_decks" ADD CONSTRAINT "deck_tags_decks_deck_tag_id_deck_tags_id_fk" FOREIGN KEY ("deck_tag_id") REFERENCES "public"."deck_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;