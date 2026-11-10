CREATE TABLE "ticket_counter" (
	"id" integer PRIMARY KEY NOT NULL,
	"end" integer NOT NULL,
	"current" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "urls" (
	"id" integer PRIMARY KEY NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"original_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "urls_short_code_unique" UNIQUE("short_code")
);
