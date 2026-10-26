import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { randomBytes } from 'node:crypto'
import { DOCTORS } from '../cms/seed/data'

/** Срок аккредитации специалиста по закону — пять лет: им дозаполняются врачи, которых нет в засеве. */
const FALLBACK_VALIDITY = '5 years'

/** Часы работы клиники — график врача, которого нет в засеве, пока его не поправят в админке. */
const FALLBACK_SCHEDULE = { days: 'Ежедневно', hours: '9:00–21:00' }

/** Строка массива Payload: id — 24 hex-знака, как у ObjectId, который Payload ставит сам. */
const rowId = () => randomBytes(12).toString('hex')

/**
 * Новые обязательные поля врачей на живой базе: столбцы добавляются пустыми, врачи из засева получают свои
 * документы и график по адресу страницы, прочие — специальность из должности и график по часам клиники; затем
 * `NOT NULL`. ID врачей не меняются.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_doctors_accreditation_kind" AS ENUM('accreditation', 'certificate');
  CREATE TABLE "doctors_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar NOT NULL,
  	"hours" varchar NOT NULL
  );
  
  CREATE TABLE "quality_surveys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"information" numeric NOT NULL,
  	"comfort" numeric NOT NULL,
  	"accessibility" numeric,
  	"courtesy" numeric NOT NULL,
  	"satisfaction" numeric NOT NULL,
  	"comment" varchar,
  	"demo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "doctors" ADD COLUMN "accreditation_kind" "enum_doctors_accreditation_kind" DEFAULT 'accreditation' NOT NULL;
  ALTER TABLE "doctors" ADD COLUMN "accreditation_specialty" varchar;
  ALTER TABLE "doctors" ADD COLUMN "accreditation_valid_until" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quality_surveys_id" integer;
  ALTER TABLE "doctors_schedule" ADD CONSTRAINT "doctors_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "doctors_schedule_order_idx" ON "doctors_schedule" USING btree ("_order");
  CREATE INDEX "doctors_schedule_parent_id_idx" ON "doctors_schedule" USING btree ("_parent_id");
  CREATE INDEX "quality_surveys_updated_at_idx" ON "quality_surveys" USING btree ("updated_at");
  CREATE INDEX "quality_surveys_created_at_idx" ON "quality_surveys" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quality_surveys_fk" FOREIGN KEY ("quality_surveys_id") REFERENCES "public"."quality_surveys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_quality_surveys_id_idx" ON "payload_locked_documents_rels" USING btree ("quality_surveys_id");`)

  for (const { slug, accreditation, schedule } of DOCTORS) {
    await db.execute(sql`
      UPDATE "doctors"
         SET "accreditation_kind" = ${accreditation.kind},
             "accreditation_specialty" = ${accreditation.specialty},
             "accreditation_valid_until" = ${accreditation.validUntil}
       WHERE "slug" = ${slug}`)

    for (const [order, { days, hours }] of schedule.entries()) {
      await db.execute(sql`
        INSERT INTO "doctors_schedule" ("_order", "_parent_id", "id", "days", "hours")
        SELECT ${order + 1}, "id", ${rowId()}, ${days}, ${hours} FROM "doctors" WHERE "slug" = ${slug}`)
    }
  }

  const { rows: strangers } = await db.execute(sql`
    UPDATE "doctors"
       SET "accreditation_specialty" = "position",
           "accreditation_valid_until" = now() + ${FALLBACK_VALIDITY}::interval
     WHERE "accreditation_specialty" IS NULL
    RETURNING "id"`)

  for (const { id } of strangers as { id: number }[]) {
    await db.execute(sql`
      INSERT INTO "doctors_schedule" ("_order", "_parent_id", "id", "days", "hours")
      VALUES (1, ${id}, ${rowId()}, ${FALLBACK_SCHEDULE.days}, ${FALLBACK_SCHEDULE.hours})`)
  }

  await db.execute(sql`
    ALTER TABLE "doctors" ALTER COLUMN "accreditation_specialty" SET NOT NULL;
    ALTER TABLE "doctors" ALTER COLUMN "accreditation_valid_until" SET NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "doctors_schedule" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quality_surveys" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "doctors_schedule" CASCADE;
  DROP TABLE "quality_surveys" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quality_surveys_fk";
  
  DROP INDEX "payload_locked_documents_rels_quality_surveys_id_idx";
  ALTER TABLE "doctors" DROP COLUMN "accreditation_kind";
  ALTER TABLE "doctors" DROP COLUMN "accreditation_specialty";
  ALTER TABLE "doctors" DROP COLUMN "accreditation_valid_until";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quality_surveys_id";
  DROP TYPE "public"."enum_doctors_accreditation_kind";`)
}
