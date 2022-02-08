const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  from_user: String,required,
  room: String,required,
  message: String,required,
  date_sent:{
    type: Date,
    default: Date.now,
    required: true
  }

});

const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema);
module.exports = GroupMessage;