import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { MENU_ITEMS } from '../cms/seed/data'

/**
 * Засев кладет позиции только в пустую коллекцию → у стенда с меню старого засева поле кадра пустое. Ключ кадра
 * из засева ставится по `slug` только там, где кадра нет: кадр, выбранный в админке, и позиции не из засева
 * не трогаются. На пустой базе обновлять нечего — позиции с кадрами положит засев.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { slug, photo } of MENU_ITEMS) {
    if (photo) {
      await db.execute(sql`
        UPDATE "menu_items" SET "photo" = ${photo}
         WHERE "slug" = ${slug} AND ("photo" IS NULL OR "photo" = '')`)
    }
  }
}

/** Откат схему не меняет, а проставленный ключ не отличить от того же ключа из админки → кадры остаются. */
export async function down(_args: MigrateDownArgs): Promise<void> {}
