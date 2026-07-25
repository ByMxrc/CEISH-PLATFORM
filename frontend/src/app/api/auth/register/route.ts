import { backendFetch, forwardResponse } from '@/lib/server-api';

export async function POST(request: Request) {
  return forwardResponse(await backendFetch('/auth/register', {
    method: 'POST',
    body: await request.text(),
  }));
}
