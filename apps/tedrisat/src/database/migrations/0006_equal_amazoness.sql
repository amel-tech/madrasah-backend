CREATE TABLE "deck_labelings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label_id" uuid NOT NULL,
	"private_to_user_id" uuid NOT NULL,
	"deck_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"create_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck_label" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"scope" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck_labels_decks" (
	"deck_id" uuid NOT NULL,
	"deck_label_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deck_label_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lable_id" uuid NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_label_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label_id" uuid NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Flashcard_labeling" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label_id" uuid NOT NULL,
	"private_to_user_id" uuid,
	"flashcard_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"scope" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deck_labelings" ADD CONSTRAINT "deck_labelings_label_id_deck_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."deck_label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_labelings" ADD CONSTRAINT "deck_labelings_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_labels_decks" ADD CONSTRAINT "deck_labels_decks_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_labels_decks" ADD CONSTRAINT "deck_labels_decks_deck_label_id_deck_label_id_fk" FOREIGN KEY ("deck_label_id") REFERENCES "public"."deck_label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deck_label_stats" ADD CONSTRAINT "deck_label_stats_lable_id_deck_label_id_fk" FOREIGN KEY ("lable_id") REFERENCES "public"."deck_label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_label_stats" ADD CONSTRAINT "flashcard_label_stats_label_id_flashcard_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."flashcard_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Flashcard_labeling" ADD CONSTRAINT "Flashcard_labeling_label_id_flashcard_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."flashcard_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Flashcard_labeling" ADD CONSTRAINT "Flashcard_labeling_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE set null ON UPDATE no action;