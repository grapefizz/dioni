import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const newVal = await kv.incr('vote-count');
  res.status(200).json({ count: newVal });
}