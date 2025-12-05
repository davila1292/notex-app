const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// The PORT environment variable is provided by Cloud Run
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Frontend server listening on port ${port}`);
});
