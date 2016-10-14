const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  // console.log('a user connected');
  // socket.on('disconnect', () => {
  //   console.log('user disconnected');
  // });

  socket.broadcast.emit('hi');

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('user login', user => {
    io.emit('user logined', user);
  });
});

app.use('/app', express.static(__dirname + '/app'));
app.use('/assets', express.static(__dirname + '/assets'));
http.listen(3000, () => {
  console.log('listening on *:3000');
});
