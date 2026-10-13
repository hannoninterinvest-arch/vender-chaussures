const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3198', '-H', '127.0.0.1'], { env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
(async () => {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Next.js startup timeout')), 15000);
    child.stdout.on('data', data => { if (data.toString().includes('Ready')) { clearTimeout(timer); resolve(); } });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Next.js exited: ${code}`)); });
    child.once('error', reject);
  });
  const response = await fetch('http://127.0.0.1:3198/vendeur');
  assert.equal(response.status, 200);
  const csp = response.headers.get('content-security-policy');
  assert.ok(csp.includes("'strict-dynamic'"));
  assert.ok(!csp.includes("'unsafe-eval'"));
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  const nonce = csp.match(/'nonce-([^']+)'/)[1];
  const html = await response.text();
  const scripts = html.match(/<script\b[^>]*>/g) || [];
  assert.ok(scripts.length > 0);
  assert.ok(scripts.every(s => s.includes(`nonce="${nonce}"`)), 'Every script must match the CSP nonce');
  const rejected = await fetch('http://127.0.0.1:3198/api/auth/login', { method: 'POST', headers: { origin: 'https://evil.example' } });
  assert.equal(rejected.status, 403);
  console.log(`Production HTTP: matching nonce for ${scripts.length} scripts, security headers and cross-origin login rejection passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => child.kill('SIGTERM'));
