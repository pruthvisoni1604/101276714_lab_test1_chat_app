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

io.on('connection', (socket) => {
  console.log('Connected ')
  
  socket.emit('welcome', 'Welcome to Socket Programming : ' + socket.id)
  //console.log(socket)

  //Custom message event to socket
  socket.on('message', (data) => {
      if(data.room == '' || data.room==undefined){
          io.emit('newMessage', socket.id + ' : ' + data.message)
      }else{
        console.log(data)
        console.log(socket)
        
        io.to(data.room).emit('newMessage', socket.id +' : ' + data.message)
        const gm = new gmModel({from_user:socket.id,room:data.room,message:data.message});
          try {
            gm.save((err) => {
              if(err){
                console.log(err)
              }else{
                //res.sendFile(__dirname + '/html/login.html')
              }
            });
          } catch (err) {
            console.log(err);
          }
      }
      //These will send to current/sending client
      //socket.emit('newMessage', data)

      //These will send to all connected client
      //io.sockets.emit('newMessage', data)

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
      socket.currentRoom = room;
  })
  socket.on('leaveRoom', () =>{
    socket.leave(socket.currentRoom);
    socket.currentRoom = null;
    console.log(socket.rooms);
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

//http://localhost:3000/signup
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
          if (err.code === 11000) {
             return res.redirect('/signup?err=username')
          }
        
        res.send(err)
      }else{
        res.sendFile(__dirname + '/html/login.html')
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//http://localhost:3000/
app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/html/index.html')
});
app.post('/', async (req, res) => {
  const username=req.body.username
  const password=req.body.password

  const user = await userModel.find({username:username});

  try {
    if(user.length != 0){
      if(user[0].password==password){
        return res.redirect('/')
      }
      else{
        return res.redirect('/login?wrong=pass')
      }
    }else{
      return res.redirect('/login?wrong=uname')
    }
  } catch (err) {
    res.status(500).send(err);
  }
  
  
});

//http://localhost:3000/chat/covid
app.get('/chat/:room', async (req, res) => {
  const room = req.params.room
  const msg = await gmModel.find({room: room}).sort({'date_sent': 'desc'}).limit(10);
  if(msg.length!=0){
    res.send(msg)
  }
  else
  res.sendFile(__dirname + '/html/chat.html')
});
app.post('/chat',async(req,res)=>{
  const username=req.body.username
  const user = await userModel.find({username:username});
  console.log(user)
  if(user[0].username==username){
    return res.redirect('/chat/'+username)
  }
  else{
    return res.redirect('/?err=noUser')
  }
  


})

http.listen(PORT, () => {
  console.log(`Server started at ${PORT}`)
})

