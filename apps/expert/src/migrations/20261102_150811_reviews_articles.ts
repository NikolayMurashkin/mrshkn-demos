import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { ARTICLES } from '../cms/seed/data'
import { lexicalFromSections } from '../cms/seed/lexical'
import type { LexicalNode, LexicalState } from '../cms/types'

/** Описание индивидуальной сессии старого засева и новое: меняется, только если его не правили в админке. */
const INDIVIDUAL_SUMMARY = {
  slug: 'individual',
  from: 'Основной формат работы. Обычно раз в неделю, первые изменения — через 6–10 встреч.',
  to: 'Основной формат работы, обычно раз в неделю. Сколько понадобится встреч, зависит от запроса: раз в несколько встреч мы сверяемся, движемся ли к цели.',
}

/** Заголовок раздела статьи о первой встрече: старый и новый. */
const FIRST_SESSION_HEADING = { slug: 'first-session', from: 'Первые 50 минут', to: 'На встрече' }

/** Заголовок раздела с прежним текстом одним куском — новый текст; иначе узел как был. */
const renameHeading = (node: LexicalNode): LexicalNode => {
  const [only] = node.children ?? []

  return node.type === 'heading' && node.children?.length === 1 && only?.type === 'text' && only.text === FIRST_SESSION_HEADING.from
    ? { ...node, children: [{ ...only, text: FIRST_SESSION_HEADING.to }] }
    : node
}

/**
 * Отзывы — новая таблица, их кладет засев при старте. Живой стенд со статьями старого засева получает здесь недостающие
 * статьи по адресу и кадры у статей без кадра; заголовки, лиды и кадры из админки не трогаются. Пустая база статей
 * не получает: иначе засев увидит непустую коллекцию и пропустит остальные. Два старых текста меняются, только если
 * на стенде все еще прежний текст.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"subject" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");`)

  const { rows: present } = await db.execute(sql`SELECT "slug" FROM "articles"`)
  const slugs = new Set((present as { slug: string }[]).map(({ slug }) => slug))

  if (slugs.size > 0) {
    for (const { slug, title, publishedAt, lead, sections, photo } of ARTICLES) {
      if (slugs.has(slug)) {
        await db.execute(sql`
          UPDATE "articles" SET "photo" = ${photo ?? null}
           WHERE "slug" = ${slug} AND ("photo" IS NULL OR "photo" = '')`)
      } else {
        await db.execute(sql`
          INSERT INTO "articles" ("title", "slug", "published_at", "lead", "photo", "content")
          VALUES (${title}, ${slug}, ${publishedAt}, ${lead}, ${photo ?? null}, ${JSON.stringify(lexicalFromSections(sections))}::jsonb)`)
      }
    }
  }

  await db.execute(sql`
    UPDATE "formats" SET "summary" = ${INDIVIDUAL_SUMMARY.to}
     WHERE "slug" = ${INDIVIDUAL_SUMMARY.slug} AND "summary" = ${INDIVIDUAL_SUMMARY.from}`)

  const { rows: firstSession } = await db.execute(sql`
    SELECT "id", "content" FROM "articles" WHERE "slug" = ${FIRST_SESSION_HEADING.slug}`)

  for (const { id, content } of firstSession as { id: number; content: LexicalState }[]) {
    const children = content.root.children.map(renameHeading)

    if (children.some((node, index) => node !== content.root.children[index])) {
      await db.execute(sql`
        UPDATE "articles" SET "content" = ${JSON.stringify({ ...content, root: { ...content.root, children } })}::jsonb
         WHERE "id" = ${id}`)
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reviews" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";`)
}
