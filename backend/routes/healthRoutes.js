const express = require('express');

// Inspect connection state without issuing a database query on every heartbeat.
module.exports = function healthRoutes(connection) {
  const router = express.Router();
  router.get('/', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    const ready = connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' });
  });
  return router;
};
