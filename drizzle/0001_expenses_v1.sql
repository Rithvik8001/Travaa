CREATE TABLE "trip_expense_settlements" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"created_by" text,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"paid_on" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trip_expense_settlements_amount_check" CHECK ("trip_expense_settlements"."amount_minor" between 1 and 2000000000),
	CONSTRAINT "trip_expense_settlements_people_check" CHECK ("trip_expense_settlements"."from_user_id" <> "trip_expense_settlements"."to_user_id")
);
--> statement-breakpoint
CREATE TABLE "trip_expense_splits" (
	"id" text PRIMARY KEY NOT NULL,
	"expense_id" text NOT NULL,
	"user_id" text NOT NULL,
	"amount_minor" integer NOT NULL,
	CONSTRAINT "trip_expense_splits_amount_check" CHECK ("trip_expense_splits"."amount_minor" between 1 and 2000000000)
);
--> statement-breakpoint
CREATE TABLE "trip_expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"created_by" text,
	"paid_by" text NOT NULL,
	"description" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"incurred_on" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trip_expenses_amount_check" CHECK ("trip_expenses"."amount_minor" between 1 and 2000000000)
);
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "trip_expense_settlements" ADD CONSTRAINT "trip_expense_settlements_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense_settlements" ADD CONSTRAINT "trip_expense_settlements_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense_settlements" ADD CONSTRAINT "trip_expense_settlements_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense_settlements" ADD CONSTRAINT "trip_expense_settlements_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense_splits" ADD CONSTRAINT "trip_expense_splits_expense_id_trip_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."trip_expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expense_splits" ADD CONSTRAINT "trip_expense_splits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_paid_by_user_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trip_expense_settlements_trip_date_idx" ON "trip_expense_settlements" USING btree ("trip_id","paid_on");--> statement-breakpoint
CREATE INDEX "trip_expense_settlements_from_idx" ON "trip_expense_settlements" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "trip_expense_settlements_to_idx" ON "trip_expense_settlements" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "trip_expense_settlements_createdBy_idx" ON "trip_expense_settlements" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_expense_splits_expense_user_idx" ON "trip_expense_splits" USING btree ("expense_id","user_id");--> statement-breakpoint
CREATE INDEX "trip_expense_splits_userId_idx" ON "trip_expense_splits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trip_expenses_trip_date_idx" ON "trip_expenses" USING btree ("trip_id","incurred_on");--> statement-breakpoint
CREATE INDEX "trip_expenses_paidBy_idx" ON "trip_expenses" USING btree ("paid_by");--> statement-breakpoint
CREATE INDEX "trip_expenses_createdBy_idx" ON "trip_expenses" USING btree ("created_by");--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_currency_check" CHECK ("trips"."currency" in ('USD','CAD','EUR','GBP','AUD','NZD','JPY','INR','CHF'));