CREATE TYPE "public"."flashcard_user_status" AS ENUM('NEW', 'LEARNING', 'MASTERED');--> statement-breakpoint
CREATE TABLE "flashcard_progress" (
	"user_id" integer NOT NULL,
	"flashcard_id" integer NOT NULL,
	"status" "flashcard_user_status" DEFAULT 'NEW' NOT NULL
);
