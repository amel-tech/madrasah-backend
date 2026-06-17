ALTER TABLE "kosks" ADD COLUMN "field" text;--> statement-breakpoint
ALTER TABLE "kosks" ADD COLUMN "level" text;--> statement-breakpoint
ALTER TABLE "kosks" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "kosks" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "kosks" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "kosks" ADD COLUMN "rating" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "kosks" ADD COLUMN "rating_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE "kosk_followers" (
	"user_id" uuid NOT NULL,
	"kosk_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kosk_followers_user_id_kosk_id_pk" PRIMARY KEY("user_id","kosk_id")
);
--> statement-breakpoint
ALTER TABLE "kosk_followers" ADD CONSTRAINT "kosk_followers_kosk_id_kosks_id_fk" FOREIGN KEY ("kosk_id") REFERENCES "public"."kosks"("id") ON DELETE cascade ON UPDATE no action;
