import { PayloadTooLargeException } from '../http';
export async function boundedRequest(req: Request): Promise<Request> {
  if (!req.body) return req;
  const max = 128 * 1024;
  if (Number(req.headers.get('content-length') || 0) > max) throw new PayloadTooLargeException('Requête trop volumineuse');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const item = await reader.read();
    if (item.done) break;
    length += item.value.byteLength;
    if (length > max) { await reader.cancel(); throw new PayloadTooLargeException('Requête trop volumineuse'); }
    chunks.push(item.value);
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return new Request(req.url, { method: req.method, headers: req.headers, body: body as BodyInit });
}
