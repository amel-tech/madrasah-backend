CREATE TABLE "decks_users" (
	"user_id" uuid NOT NULL,
	"deck_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "decks_users_user_id_deck_id_pk" PRIMARY KEY("user_id","deck_id")
);
--> statement-breakpoint
ALTER TABLE "decks_users" ADD CONSTRAINT "decks_users_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;