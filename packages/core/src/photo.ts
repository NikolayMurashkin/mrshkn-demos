import type { TextFieldSingleValidation } from 'payload';

/**
 * Проверка поля `photo` коллекции: пусто — без фото, иначе ключ из карты кадров приложения (регистр важен).
 * Поле — текст, а не `select`: новый кадр не требует миграции базы.
 */
export const validatePhotoKey =
  (keys: readonly string[]): TextFieldSingleValidation =>
  (value) =>
    !value || keys.includes(value)
      ? true
      : `Нет кадра «${value}» в карте кадров приложения (src/assets/photos/index.ts)`;
