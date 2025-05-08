const express = require('express');
const router = express.Router();
const { decryptRequest, encryptResponse } = require('../middleware/encryption');

// Apply encryption middleware to these secure routes
router.use(decryptRequest);
router.use(encryptResponse);

// Example secure endpoint
router.post('/sensitive-data', (req, res) => {
  // This data will be automatically encrypted in the response if requested
  res.json({ 
    status: 'success',
    message: 'Sensitive data processed',
    data: req.body
  });
});

module.exports = router;
