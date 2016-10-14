'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname + '/public'));
http.listen(process.env.PORT || 5000, () => {
  console.log(`listening on:${process.env.PORT || 5000}`);
});

const users = [];
const msgs = [];

io.on('connection', socket => {
  const socketID = socket.id;
  // console.log(`- unknown client connected. Socket ID: ${socketID}`);
  let currnentUser = {};
  socket.on('disconnect', () => {
    io.emit('user leaveuser', currnentUser);
    disconnectUser(currnentUser, socketID);
  });

  socket.on('chat message', msg => {
    msgs.push(msg);
    io.emit('chat message', msg);
  });

  socket.on('user login', user => {
    if (getCurrentlyLogined().length >= 5) {
      socket.emit('user loginunavailable');
      return;
    }
    currnentUser = loginUser(user);
    socket.emit('user logined', currnentUser, getCurrentlyLogined());
    socket.emit('chat history', msgs);
    io.emit('user joineduser', currnentUser);
  });
});


// -----------------------------------------------------------------


function loginUser(user) {
  let currnentUser = users.find(u => u.name == user.name);
  if (currnentUser) {
    currnentUser.logined = true;
  } else {
    currnentUser = user;
    currnentUser.id = getUniqUserID();
    currnentUser.logined = true;
    users.push(currnentUser);
  }
  console.log(`- a client logined with ID: ${currnentUser.id}`);
  return currnentUser;
}

function disconnectUser(user, socketID) {
  if (!user) {
    // console.log(`- unknown client disconnected. Socket ID: ${socketID}`);
    return;
  }
  users.find(u => u.id == user.id).logined = false;
  console.log(`- client with ID ${user.id} disconnected. Socket ID: ${socketID}`);
}

function getUniqUserID() {
  let clientIDTemp = parseInt((Math.random()*1000).toString(), 16);
  while (users.find(u => u.id == clientIDTemp)) {
    clientIDTemp = parseInt((Math.random()*1000).toString(), 16);
  }
  return clientIDTemp;
}

function getCurrentlyLogined() {
  return users.filter(u => u.logined);
}
