/**
 * Local development server.
 * Serves the /public directory as static files.
 *
 * All image processing is now handled 100% client-side (Canvas API).
 * This server is NOT required for the Vercel deployment — see vercel.json.
 *
 * Usage: node server.js  →  http://localhost:3000
 */

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Catch-all: return index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n  PixelFlow — Local Dev Server`);
    console.log(`  → http://localhost:${PORT}\n`);
});
