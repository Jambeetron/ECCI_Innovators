// server.js
const express = require('express');
const app = express();
const port = 3000;

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta "public"
app.use(express.static('public'));

// Ruta dinámica (puedes personalizarla)
app.get('/api/data', (req, res) => {
  res.json({ message: '¡Hola desde el servidor Node.js!' });
});

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
