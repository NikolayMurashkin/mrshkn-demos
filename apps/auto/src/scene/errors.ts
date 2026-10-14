/** Файл сцены не загрузился (обрыв, блокировка, не тот ответ): в тексте — адрес файла. */
export class SceneLoadError extends Error {
  readonly file: string;

  constructor(file: string, cause: unknown) {
    super(`3D-сцена: не загрузился файл ${file}`, { cause });
    this.name = 'SceneLoadError';
    this.file = file;
  }
}

/** WebGL-контекст не создался: не ошибка посетителя и не сбой — сцена тихо остается постером. */
export class SceneUnsupportedError extends Error {
  constructor(cause: unknown) {
    super('3D-сцена: WebGL недоступен', { cause });
    this.name = 'SceneUnsupportedError';
  }
}
