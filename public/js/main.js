const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.querySelector('#room-name');
const userList = document.querySelector('#users');

// get username and room from url
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});


const socket = io();

// join chatroom
socket.emit('joinRoom', {username, room});


// get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

// message from server
socket.on('message', message => {
    outputMessage(message);

    // scrollDown
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;

    // emitting a msg to the server
    socket.emit('chatMessage', msg);

    // clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

})

// output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOm
function outputRoomName(room){
    roomName.innerText = room;
}

// add usrs to DOM 
function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}