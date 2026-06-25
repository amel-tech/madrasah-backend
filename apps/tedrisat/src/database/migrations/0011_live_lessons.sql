ALTER TABLE "lessons" ADD COLUMN "scheduled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "meeting_url" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "agenda" jsonb;
