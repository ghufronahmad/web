const mongoose = require('mongoose');
const { fieldEncryption } = require('../utils/dbEncryption');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  personalInfo: {
    fullName: String,
    phoneNumber: String,
    nationalId: String
  },
  // ...existing code...
});

// Apply encryption to sensitive fields
userSchema.plugin(fieldEncryption, {
  fields: ['personalInfo.phoneNumber', 'personalInfo.nationalId']
});

// ...existing code...

module.exports = mongoose.model('User', userSchema);
