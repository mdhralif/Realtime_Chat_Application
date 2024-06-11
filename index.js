// index.js

const express = require('express');
const path = require('path');
const app = express();
const PORT = 5174; // Explicitly set the port to 5174

// Serve static files from 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Route all GET requests to the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
