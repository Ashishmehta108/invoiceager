ALTER TABLE "invoiceager_user" ADD COLUMN "passwordHash" varchar(255);--> statement-breakpoint
ALTER TABLE "invoiceager_user" ADD COLUMN "businessName" varchar(255);--> statement-breakpoint
ALTER TABLE "invoiceager_user" ADD COLUMN "gstin" varchar(32);--> statement-breakpoint
ALTER TABLE "invoiceager_user" ADD COLUMN "bankInfo" text;