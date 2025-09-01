import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'count.json');

let count = 0;
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));
    if (typeof raw.count === 'number') count = raw.count;
  }
} catch {}

const save = () => {
  fs.writeFile(DATA_FILE, JSON.stringify({ count }), ()=>{});
};

const app = express();
app.use(express.static(__dirname)); // serves index.html, styles, etc.

let clients = new Set();

function broadcast() {
  const data = `data: ${JSON.stringify({ count })}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}

app.get('/api/count', (_req,res) => {
  res.json({ count });
});

app.post('/api/vote', (_req,res) => {
  count += 1;
  save();
  broadcast();
  res.status(204).end();
});

app.get('/api/stream', (req,res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write(`data: ${JSON.stringify({ count })}\n\n`);
  clients.add(res);
  req.on('close', () => {
    clients.delete(res);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT));