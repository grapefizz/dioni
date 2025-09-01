export const config = {
  runtime: 'edge'
};

const KEY = 'vote-count';

async function getCount(env) {
  const r = await fetch(`${env.KV_REST_API_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${env.KV_REST_API_TOKEN}` }
  });
  if (!r.ok) return 0;
  const { result } = await r.json();
  return Number(result) || 0;
}

// Simple polling push every 2s (serverless cannot be notified automatically)
export default async function handler(req) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      send({ count: await getCount(process.env) });
      let last = null;
      const interval = setInterval(async () => {
        const c = await getCount(process.env);
        if (c !== last) {
          send({ count: c });
          last = c;
        }
      }, 2000);
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}