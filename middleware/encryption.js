const { decryptObject, encryptObject } = require('../utils/encryption');

// Middleware to decrypt incoming request bodies
exports.decryptRequest = (req, res, next) => {
  try {
    if (req.body && req.body.encryptedData) {
      req.body = decryptObject(req.body.encryptedData);
    }
    next();
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(400).json({ error: 'Invalid encrypted data' });
  }
};

// Middleware to encrypt outgoing responses
exports.encryptResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(body) {
    // Only encrypt if client expects encrypted response
    if (req.headers['x-expect-encrypted'] === 'true') {
      return originalJson.call(this, { encryptedData: encryptObject(body) });
    }
    return originalJson.call(this, body);
  };
  
  next();
};
