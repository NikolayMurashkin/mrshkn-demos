import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { DOCTORS } from '../cms/seed/data'

/**
 * Засев кладет врачей только в пустую коллекцию → у стенда с врачами старого засева поле кадра пустое, на месте
 * портрета — плашка инициалов. Ключ портрета из засева ставится по `slug` только там, где кадра нет: кадр, выбранный
 * в админке, и врачи не из засева не трогаются, врачи не создаются и не удаляются. На пустой базе обновлять нечего —
 * врачей с портретами положит засев.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { slug, photo } of DOCTORS) {
    if (photo) {
      await db.execute(sql`
        UPDATE "doctors" SET "photo" = ${photo}
         WHERE "slug" = ${slug} AND ("photo" IS NULL OR "photo" = '')`)
    }
  }
}

/** Откат схему не меняет, а проставленный ключ не отличить от того же ключа из админки → портреты остаются. */
export async function down(_args: MigrateDownArgs): Promise<void> {}
