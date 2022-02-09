//console.log('Welcome to socket programming')
const app = require('express')()
const http = require('http').createServer(app)
const { Console } = require('console')
const cors = require('cors')
const PORT = 3000
const express = require('express');
const mongoose = require('mongoose');

const userModel = require(__dirname + '/models/User');
const gmModel = require(__dirname + '/models/GroupMessage');
const pmModel = require(__dirname + '/models/PrivateMessage');

//Create Server Socket
const io = require('socket.io')(http)
app.use(cors()) 
//Create user list
users = []
var roomName = 'test'
//Accept new request
io.on('connection', (socket) => {
    console.log('Connected ')
    
    socket.emit('welcome', 'Welcome to Socket Programming : ' + socket.id)
    //console.log(socket)

    //Custom message event to socket
    socket.on('message', (data) => {
        console.log(data)
        if(data.room == ''){
            console.log(`Room Name: ${data.room}`)
            //socket.broadcast.emit('newMessage', data.message)
            io.emit('newMessage', socket.id + ' : ' + data.message)
        }else{
            ///socket.broadcast.to(data.room).emit('newMessage', data.message)
            io.to(data.room).emit('newMessage', socket.id +' : ' + data.message)
        }
        //These will send to current/sending client
        //socket.emit('newMessage', data)

        //These will send to all connected client
        //io.sockets.emit('newMessage', data)

        //This will send to all except sender
        //socket.broadcast.emit('newMessage', data)
        
        //this send to the sender and the client
        //io.to(roomName).emit('newMessage', data)
        

    })

    //Get User name
    socket.on('newUser', (name) => {
        console.log(users)
        console.log(name)

        if(users.includes(name)){
            name = users[i]
            users.push(name)
        }else{
            users.push(name)
        }
        socket.id = name
    })


    //Group/Room Join
    socket.on('joinroom', (room) => {
        socket.join(room)
        roomName = room
    })

    //Disconnected
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
    })
})


app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json()); // Make sure it comes back as json

//TODO - Replace you Connection String here
mongoose.connect('mongodb+srv://gbc:pruthvi@sa.dubue.mongodb.net/db_f2021_comp3123?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});

//http://localhost:3000/signin
app.get('/signup', async (req, res) => {
  res.sendFile(__dirname + '/html/signup.html')
});

//http://localhost:3000/login
app.get('/login', async (req, res) => {
    res.sendFile(__dirname + '/html/login.html')
});
app.post('/login', async (req, res) => {
  const user = new userModel(req.body);
  try {
    await user.save((err) => {
      if(err){
        console.log("1")
        if(err.code === 11000){
        console.log("2")

          res.sendFile(__dirname + '/html/signup.html')
          
          console.log("3")

        }
        res.send(err)
        console.log("4")

      }else{
        res.sendFile(__dirname + '/html/login.html')
        console.log("5")

      }
    });
  } catch (err) {
    res.status(500).send(err);
    console.log("10")

  }
});

//http://localhost:3000/
app.get('/', async (req, res) => {
  //const users = await userModel.find({});
  res.sendFile(__dirname + '/html/index.html')
});

//http://localhost:3000/chat/covid
app.get('/chat/:room', async (req, res) => {
  //const users = await userModel.find({});
  res.sendFile(__dirname + '/html/chat.html')
});



//http://localhost:3000/signedup
app.post('/a', async (req, res) => {
  console.log("post")
  console.log(req.body)
  try {
      if(err){
        res.send(err)
      }else{
        res.send("user");
      }
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

app.listen(3000, () => { console.log('Server is running...') });
