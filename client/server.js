const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const port = process.env.PORT || 8080;

// Middleware for enabling Vue.js HTML5 history mode (SPA routing)
app.use(history());

// Serve static built Vue app from 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(port, () => {
    console.log(`Frontend Express server is running on port ${port}`);
});
