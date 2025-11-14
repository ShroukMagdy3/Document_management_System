import { IncomingMessage, ServerResponse } from 'http';
import createApp from '../src/app.controller';

let cachedApp: any = null;

export default async function handler(
  req: IncomingMessage & { query?: Record<string, any>; cookies?: Record<string, string>; body?: any },
  res: ServerResponse & { status?: (code: number) => any; json?: (body: any) => void; send?: (body: any) => void }
) {
  try {
    if (!cachedApp) {
      cachedApp = await createApp();
    }

    return await new Promise<void>((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('error', (err: any) => reject(err));
      try {
        (cachedApp as any)(req as any, res as any);
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    try {
      res.status?.(500);
      res.send?.(String(err));
    } catch (e) {
      // ignore
    }
  }
}
