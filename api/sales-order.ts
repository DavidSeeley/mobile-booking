/**
 * Vercel Serverless Proxy — NetSirv Sales Order API
 * Forwards POST requests from the browser to test.netsirv.com,
 * bypassing CORS restrictions (server-to-server has no CORS).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET_URL =
  'https://test.netsirv.com/localmotion/api/wp/api.php?controller=sales_order';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY ?? process.env.VITE_API_KEY ?? '';

  try {
    // Body arrives as a string (application/x-www-form-urlencoded)
    const body =
      typeof req.body === 'string'
        ? req.body
        : new URLSearchParams(req.body as Record<string, string>).toString();

    const response = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': `Bearer ${apiKey}`,
      },
      body,
    });

    const text = await response.text();

    res.setHeader('Content-Type', 'application/json');
    return res.status(response.status).send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Proxy error: ${message}` });
  }
}
