const mongoose = require('mongoose');

const PrivateMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter PrivateMessage name'],
    trim: true,
    lowercase: true
  },
  from_user: String,
  to_user: String,
  message: String,
  date_sent:{
    type: Date,
    default: Date.now
  }

});

const PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);
module.exports = PrivateMessage;