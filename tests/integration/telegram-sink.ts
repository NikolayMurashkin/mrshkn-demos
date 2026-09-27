import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

type TelegramCall = {
  path: string;
  body: { chat_id: string; text: string };
};

/** Приемник вместо api.telegram.org: запоминает, что пришло, и отвечает заданным статусом. */
export const startTelegramSink = async () => {
  const calls: TelegramCall[] = [];
  let status = 200;

  const server: Server = createServer((request, response) => {
    let raw = '';

    request.on('data', (chunk) => {
      raw += chunk;
    });
    request.on('end', () => {
      calls.push({ path: request.url ?? '', body: JSON.parse(raw) });
      response.writeHead(status, { 'content-type': 'application/json' }).end('{"ok":true}');
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    calls,
    failWith(code: number) {
      status = code;
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
