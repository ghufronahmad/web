const { encrypt, decrypt } = require('./encryption');

// Mongoose plugin for field-level encryption
exports.fieldEncryption = function(schema, options) {
  // Encrypt fields before saving
  schema.pre('save', function(next) {
    options.fields.forEach(field => {
      if (this[field] && this.isModified(field)) {
        this[field] = encrypt(this[field].toString());
      }
    });
    next();
  });

  // Add method to decrypt fields
  schema.methods.withDecryptedFields = function() {
    const doc = this.toObject();
    
    options.fields.forEach(field => {
      if (doc[field]) {
        try {
          doc[field] = decrypt(doc[field]);
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error);
        }
      }
    });
    
    return doc;
  };
};
