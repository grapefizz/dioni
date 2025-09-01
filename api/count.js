import { kv } from '@vercel/kv';

export default async function handler(_req, res) {
  const val = await kv.get('vote-count');
  res.status(200).json({ count: Number(val) || 0 });
}