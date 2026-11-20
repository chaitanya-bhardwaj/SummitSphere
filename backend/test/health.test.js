const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const healthRoutes = require('../routes/healthRoutes');

test('health endpoint reports readiness, never caches, and reflects disconnection', async (t) => {
  const connection = { readyState: 1 };
  const app = express();
  app.use('/health', healthRoutes(connection));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/health`;

  const ready = await fetch(url);
  assert.equal(ready.status, 200);
  assert.equal(ready.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await ready.json(), { status: 'ok' });

  for (const readyState of [0, 2, 3]) {
    connection.readyState = readyState;
    const unavailable = await fetch(url);
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { status: 'unavailable' });
  }
  connection.readyState = 1;
  assert.equal((await fetch(url)).status, 200);
});
