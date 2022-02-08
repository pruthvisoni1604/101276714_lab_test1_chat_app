const express = require('express');
const userModel = require('../models/User');
const gmModel = require('../models/GroupMessage');
const pmModel = require('../models/PrivateMessage');
const app = express();

//http://localhost:3000/
app.get('/login', async (req, res) => {
  const users = await userModel.find({});
  res.writeHead(200,{"Location": "http://" + req.headers['host'] + '/login.html'})
  try {
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

//http://localhost:3000
app.post('/', async (req, res) => {
    const user = new userModel(req.body);
    try {
      await user.save((err) => {
        if(err){
          res.send(err)
        }else{
          res.send(user);
        }
      });
    } catch (err) {
      res.status(500).send(err);
    }
});
module.exports = app