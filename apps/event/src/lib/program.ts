/** Пункт программы «18:00 — открываем двери»: время и что происходит, по первому « — ». */
export const splitProgramItem = (item: string) => {
  const [time, ...rest] = item.split(' — ');

  return { time, text: rest.join(' — ') };
};
