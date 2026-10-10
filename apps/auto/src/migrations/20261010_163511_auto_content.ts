import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ru', 'en');
  CREATE TYPE "public"."enum_nodes_key" AS ENUM('engine', 'suspension', 'brakes', 'steering', 'electrics', 'cooling', 'exhaust', 'transmission');
  CREATE TYPE "public"."enum_symptoms_place" AS ENUM('timing', 'rear');
  CREATE TABLE "nodes_causes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"term" varchar NOT NULL
  );
  
  CREATE TABLE "nodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"key" "enum_nodes_key" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "nodes_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "symptoms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"key" varchar NOT NULL,
  	"node_id" integer NOT NULL,
  	"place" "enum_symptoms_place",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "symptoms_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_locales" (
  	"author" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"subject" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "nodes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "symptoms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "nodes_causes" ADD CONSTRAINT "nodes_causes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "nodes_locales" ADD CONSTRAINT "nodes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "symptoms_locales" ADD CONSTRAINT "symptoms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_locales" ADD CONSTRAINT "reviews_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "nodes_causes_order_idx" ON "nodes_causes" USING btree ("_order");
  CREATE INDEX "nodes_causes_parent_id_idx" ON "nodes_causes" USING btree ("_parent_id");
  CREATE INDEX "nodes_causes_locale_idx" ON "nodes_causes" USING btree ("_locale");
  CREATE INDEX "nodes__order_idx" ON "nodes" USING btree ("_order");
  CREATE UNIQUE INDEX "nodes_key_idx" ON "nodes" USING btree ("key");
  CREATE INDEX "nodes_updated_at_idx" ON "nodes" USING btree ("updated_at");
  CREATE INDEX "nodes_created_at_idx" ON "nodes" USING btree ("created_at");
  CREATE UNIQUE INDEX "nodes_locales_locale_parent_id_unique" ON "nodes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "symptoms__order_idx" ON "symptoms" USING btree ("_order");
  CREATE UNIQUE INDEX "symptoms_key_idx" ON "symptoms" USING btree ("key");
  CREATE INDEX "symptoms_node_idx" ON "symptoms" USING btree ("node_id");
  CREATE INDEX "symptoms_updated_at_idx" ON "symptoms" USING btree ("updated_at");
  CREATE INDEX "symptoms_created_at_idx" ON "symptoms" USING btree ("created_at");
  CREATE UNIQUE INDEX "symptoms_locales_locale_parent_id_unique" ON "symptoms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE UNIQUE INDEX "reviews_locales_locale_parent_id_unique" ON "reviews_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nodes_fk" FOREIGN KEY ("nodes_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_symptoms_fk" FOREIGN KEY ("symptoms_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_nodes_id_idx" ON "payload_locked_documents_rels" USING btree ("nodes_id");
  CREATE INDEX "payload_locked_documents_rels_symptoms_id_idx" ON "payload_locked_documents_rels" USING btree ("symptoms_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "nodes_causes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nodes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nodes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "symptoms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "symptoms_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "nodes_causes" CASCADE;
  DROP TABLE "nodes" CASCADE;
  DROP TABLE "nodes_locales" CASCADE;
  DROP TABLE "symptoms" CASCADE;
  DROP TABLE "symptoms_locales" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_nodes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_symptoms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  DROP INDEX "payload_locked_documents_rels_nodes_id_idx";
  DROP INDEX "payload_locked_documents_rels_symptoms_id_idx";
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "nodes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "symptoms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_nodes_key";
  DROP TYPE "public"."enum_symptoms_place";`)
}
