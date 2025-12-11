ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_deck_id_decks_id_fk";
ALTER TABLE "flashcard_progress" DROP CONSTRAINT "flashcard_progress_user_id_flashcard_id_pk";

ALTER TABLE "decks" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "decks" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "decks" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "decks" ALTER COLUMN "author_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flashcard_progress" ALTER COLUMN "user_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flashcard_progress" ALTER COLUMN "flashcard_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flashcards" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "flashcards" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flashcards" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flashcards" ALTER COLUMN "deck_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flashcards" ALTER COLUMN "author_id" SET DATA TYPE uuid USING gen_random_uuid();

ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "flashcard_progress" ADD CONSTRAINT "flashcard_progress_user_id_flashcard_id_pk" PRIMARY KEY("user_id","flashcard_id");