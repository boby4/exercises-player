const https = require('https');
const fs = require('fs');
const path = require('path');

const exercises = require('./src/assets/data/exercises.json');
const outDir = path.join(__dirname, 'public', 'gifs');
const CONCURRENCY = 10;
const BASE_URL = 'https://static.exercisedb.dev/media';

function downloadGif(mediaId) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outDir, `${mediaId}.gif`);
    if (fs.existsSync(filePath)) {
      return resolve({ id: mediaId, status: 'skip' });
    }
    const url = `${BASE_URL}/${mediaId}.gif`;
    const file = fs.createWriteStream(filePath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlinkSync(filePath);
        return resolve({ id: mediaId, status: res.statusCode });
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve({ id: mediaId, status: 'ok' }); });
    }).on('error', (e) => {
      try { fs.unlinkSync(filePath); } catch {}
      resolve({ id: mediaId, status: 'error', error: e.message });
    });
  });
}

async function main() {
  const ids = exercises.map(e => e.media_id).filter(Boolean);
  console.log(`Downloading ${ids.length} GIFs (concurrency: ${CONCURRENCY})...`);
  
  let done = 0, ok = 0, skipped = 0, failed = 0;
  const startTime = Date.now();
  
  async function worker() {
    while (ids.length > 0) {
      const id = ids.shift();
      const result = await downloadGif(id);
      done++;
      if (result.status === 'ok') ok++;
      else if (result.status === 'skip') skipped++;
      else failed++;
      
      if (done % 50 === 0 || done === exercises.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[${done}/${exercises.length}] ok:${ok} skip:${skipped} fail:${failed} (${elapsed}s)`);
      }
    }
  }
  
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone! ok:${ok} skipped:${skipped} failed:${failed} (${elapsed}s)`);
}

main().catch(console.error);
