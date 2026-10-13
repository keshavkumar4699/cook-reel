CREATE TABLE "speech_clips" (
	"key" text PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"voice" text NOT NULL,
	"model" text NOT NULL,
	"audio" "bytea" NOT NULL,
	"chars" integer NOT NULL,
	"duration_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speech_usage" (
	"scope" text NOT NULL,
	"day" text NOT NULL,
	"reserved_ms" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "speech_usage_scope_day_pk" PRIMARY KEY("scope","day")
);
--> statement-breakpoint
CREATE INDEX "speech_clips_last_used_idx" ON "speech_clips" USING btree ("last_used_at");