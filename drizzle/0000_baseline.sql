CREATE TYPE "public"."availability" AS ENUM('yes', 'maybe', 'no');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('member_joined', 'dates_locked', 'idea_commented', 'comment_replied', 'idea_converted');--> statement-breakpoint
CREATE TYPE "public"."packing_visibility" AS ENUM('shared', 'private');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_id" text NOT NULL,
	"actor_id" text,
	"trip_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"entity_id" text,
	"event_key" text NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_date_options" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_date_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"option_id" text NOT NULL,
	"user_id" text NOT NULL,
	"value" "availability" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_itinerary_items" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"created_by" text NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"url" text,
	"date" date,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"source_suggestion_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trip_itinerary_items_source_suggestion_id_unique" UNIQUE("source_suggestion_id")
);
--> statement-breakpoint
CREATE TABLE "trip_members" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_packing_items" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"assigned_to" text,
	"completed_at" timestamp,
	"completed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trip_packing_items_quantity_check" CHECK ("trip_packing_items"."quantity" between 1 and 999)
);
--> statement-breakpoint
CREATE TABLE "trip_packing_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"visibility" "packing_visibility" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_suggestion_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"suggestion_id" text NOT NULL,
	"parent_id" text,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_suggestion_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"suggestion_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"created_by" text NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"destination" text,
	"start_date" date,
	"end_date" date,
	"invite_code" text,
	"archived_at" timestamp,
	"dates_locked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trips_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_date_options" ADD CONSTRAINT "trip_date_options_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_date_options" ADD CONSTRAINT "trip_date_options_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_date_votes" ADD CONSTRAINT "trip_date_votes_option_id_trip_date_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."trip_date_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_date_votes" ADD CONSTRAINT "trip_date_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_itinerary_items" ADD CONSTRAINT "trip_itinerary_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_itinerary_items" ADD CONSTRAINT "trip_itinerary_items_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_itinerary_items" ADD CONSTRAINT "trip_itinerary_items_source_suggestion_id_trip_suggestions_id_fk" FOREIGN KEY ("source_suggestion_id") REFERENCES "public"."trip_suggestions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_packing_items" ADD CONSTRAINT "trip_packing_items_list_id_trip_packing_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."trip_packing_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_packing_items" ADD CONSTRAINT "trip_packing_items_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_packing_items" ADD CONSTRAINT "trip_packing_items_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_packing_items" ADD CONSTRAINT "trip_packing_items_completed_by_user_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_packing_lists" ADD CONSTRAINT "trip_packing_lists_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_packing_lists" ADD CONSTRAINT "trip_packing_lists_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_suggestion_comments" ADD CONSTRAINT "trip_suggestion_comments_suggestion_id_trip_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."trip_suggestions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_suggestion_comments" ADD CONSTRAINT "trip_suggestion_comments_parent_id_trip_suggestion_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trip_suggestion_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_suggestion_comments" ADD CONSTRAINT "trip_suggestion_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_suggestion_votes" ADD CONSTRAINT "trip_suggestion_votes_suggestion_id_trip_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."trip_suggestions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_suggestion_votes" ADD CONSTRAINT "trip_suggestion_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_suggestions" ADD CONSTRAINT "trip_suggestions_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_suggestions" ADD CONSTRAINT "trip_suggestions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_recipient_event_idx" ON "notifications" USING btree ("recipient_id","event_key");--> statement-breakpoint
CREATE INDEX "notifications_recipient_created_idx" ON "notifications" USING btree ("recipient_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_recipient_read_idx" ON "notifications" USING btree ("recipient_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_trip_recipient_idx" ON "notifications" USING btree ("trip_id","recipient_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_date_options_window_idx" ON "trip_date_options" USING btree ("trip_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "trip_date_options_tripId_idx" ON "trip_date_options" USING btree ("trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_date_votes_option_user_idx" ON "trip_date_votes" USING btree ("option_id","user_id");--> statement-breakpoint
CREATE INDEX "trip_date_votes_optionId_idx" ON "trip_date_votes" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "trip_itinerary_items_tripId_idx" ON "trip_itinerary_items" USING btree ("trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_members_trip_user_idx" ON "trip_members" USING btree ("trip_id","user_id");--> statement-breakpoint
CREATE INDEX "trip_members_userId_idx" ON "trip_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trip_members_tripId_idx" ON "trip_members" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_packing_items_listId_idx" ON "trip_packing_items" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "trip_packing_items_assignedTo_idx" ON "trip_packing_items" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "trip_packing_lists_tripId_idx" ON "trip_packing_lists" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_packing_lists_private_owner_idx" ON "trip_packing_lists" USING btree ("trip_id","created_by","visibility");--> statement-breakpoint
CREATE INDEX "trip_suggestion_comments_suggestionId_idx" ON "trip_suggestion_comments" USING btree ("suggestion_id");--> statement-breakpoint
CREATE INDEX "trip_suggestion_comments_parentId_idx" ON "trip_suggestion_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_suggestion_votes_suggestion_user_idx" ON "trip_suggestion_votes" USING btree ("suggestion_id","user_id");--> statement-breakpoint
CREATE INDEX "trip_suggestion_votes_suggestionId_idx" ON "trip_suggestion_votes" USING btree ("suggestion_id");--> statement-breakpoint
CREATE INDEX "trip_suggestions_tripId_idx" ON "trip_suggestions" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trips_ownerId_idx" ON "trips" USING btree ("owner_id");