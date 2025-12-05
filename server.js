import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Usa a porta do ambiente ou 3000 por padrão
const PORT = process.env.PORT || 3000;

// Serve os arquivos estáticos da pasta de build (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Redireciona qualquer rota desconhecida para o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  🚀 LAURA AI SYSTEM RODANDO!
  ---------------------------
  Porta: ${PORT}
  Status: ONLINE
  `);
});