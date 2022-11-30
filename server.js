const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utility/messages');
const {getCurrentUser, userJoin, userLeave, getRoomUsers} = require('./utility/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

const botName = 'ChatCord Bot';

// run when cliet connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id ,username, room);


        socket.join(user.room)
        // welcome current user
        socket.emit('message', formatMessage(botName,'Welcome to ChatCord'));
    
        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat.`));

        // users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });



    // listen for chatMessage
    socket.on('chatMessage', (msg) => {

        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){

            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));
        }

        // users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    
    });
});

const PORT = 4000 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});