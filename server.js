//console.log('Welcome to socket programming')
const app = require('express')()
const http = require('http').createServer(app)
const { Console } = require('console')
const cors = require('cors')
const PORT = 3000
const express = require('express');
const mongoose = require('mongoose');
const chatRoomRouter = require('./routes/ChatAppRoutes.js');

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

app.use(chatRoomRouter);

app.listen(3000, () => { console.log('Server is running...') });
