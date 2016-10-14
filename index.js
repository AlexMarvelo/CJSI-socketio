const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const users = [];
const msgs = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  const socketID = socket.id;
  console.log(`- unknown client connected. Socket ID: ${socketID}`);
  let currnentUser;
  socket.on('disconnect', () => {
    disconnectUser(currnentUser, socketID);
  });

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('user login', user => {
    user = loginUser(user);
    socket.emit('user logined', user);
  });
});

app.use('/app', express.static(__dirname + '/app'));
app.use('/assets', express.static(__dirname + '/assets'));
http.listen(3000, () => {
  console.log('listening on *:3000');
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
  user = users.find(u => u.id == user.id);
  if (!user) {
    console.log(`- unknown client disconnected. Socket ID: ${socketID}`);
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
