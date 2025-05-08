const express = require('express');
const app = express();
// ...existing code...

// Import secure routes
const secureRoutes = require('./routes/secureRoutes');

// Regular middlewares
app.use(express.json());
// ...existing code...

// Apply secure routes
app.use('/api/secure', secureRoutes);

// ...existing code...
