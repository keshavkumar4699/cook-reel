CREATE TABLE "video_recipe_translations" (
	"video_id" text NOT NULL,
	"language" text NOT NULL,
	"recipe" jsonb NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "video_recipe_translations_video_id_language_pk" PRIMARY KEY("video_id","language")
);
--> statement-breakpoint
ALTER TABLE "import_jobs" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "import_jobs" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "video_analyses" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "video_recipe_translations" ADD CONSTRAINT "video_recipe_translations_video_id_video_analyses_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video_analyses"("video_id") ON DELETE cascade ON UPDATE no action;