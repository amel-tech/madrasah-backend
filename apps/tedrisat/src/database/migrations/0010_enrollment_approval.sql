ALTER TYPE "public"."enrollment_status" ADD VALUE 'PENDING' BEFORE 'ENROLLED';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "requires_approval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "student_name" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "student_email" text;
