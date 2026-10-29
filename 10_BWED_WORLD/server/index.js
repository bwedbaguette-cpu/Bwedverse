/* ==========================================================================
   SERVEUR MULTIJOUEUR COLYSEUS / WEBSOCKET — BWED WORLD
   Gère les rooms de 20-30 joueurs pour le Hub et les mini-jeux
   ========================================================================== */

const http = require('http');

const PORT = process.env.PORT || 2567;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', game: 'Bwed World Hub Server', port: PORT }));
});

server.listen(PORT, () => {
  console.log(`Serveur Bwed World ecoute sur http://localhost:${PORT}`);
});
