import fetch from 'node-fetch';

const KEY = 'vote-count';

async function getCount() {
  const r = await fetch(`${process.env.KV_REST_API_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  if (!r.ok) return 0;
  const { result } = await r.json();
  return Number(result) || 0;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const count = await getCount();
  res.status(200).json({ count });
}