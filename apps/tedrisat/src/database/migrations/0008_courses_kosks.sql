CREATE TYPE "public"."course_level" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('ENROLLED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('VIDEO', 'DOCUMENT', 'LIVE', 'QUIZ');--> statement-breakpoint
CREATE TABLE "kosks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"handle" text,
	"description" text,
	"cover_hue" integer DEFAULT 215 NOT NULL,
	"is_private" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_muderris" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"title" text,
	"bio" text,
	"avatar_hue" integer DEFAULT 220 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"name" text NOT NULL,
	"meta" text,
	"type" text,
	"url" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_weeks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kosk_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"category" text,
	"level" "course_level" DEFAULT 'BEGINNER' NOT NULL,
	"language" text,
	"cover_hue" integer DEFAULT 220 NOT NULL,
	"duration_weeks" integer DEFAULT 0 NOT NULL,
	"status" "course_status" DEFAULT 'DRAFT' NOT NULL,
	"grants_certificate" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" "enrollment_status" DEFAULT 'ENROLLED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enrollments_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "lesson_type" NOT NULL,
	"duration" text,
	"kaynak" text,
	"is_preview" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_muderris" ADD CONSTRAINT "course_muderris_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_weeks" ADD CONSTRAINT "course_weeks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_kosk_id_kosks_id_fk" FOREIGN KEY ("kosk_id") REFERENCES "public"."kosks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_week_id_course_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."course_weeks"("id") ON DELETE cascade ON UPDATE no action;