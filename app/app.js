var socket = io();

$(document).ready(function() {
  const form = $('#form-newmessage');
  const input = form.find('.form-input')[0];
  const entryForm = $('#entry-form');
  const entryInput = entryForm.find('.entry-input')[0];
  const messageList = $('#messages-list');
  entryInput.focus();

  let currentUser;

  $(entryForm).submit((event) => {
    event.preventDefault();
    socket.emit('user login', {
      name: entryInput.value,
      time: new Date()
    });
    entryForm.remove();
  });

  $(form).submit((event) => {
    event.preventDefault();
    if (!currentUser) {
      input.value = '';
      return;
    }
    let msg = {
      text: input.value,
      user: currentUser.name,
      time: new Date()
    };
    messageList.append(getMessageBlock(msg));
    socket.emit('chat message', msg);
    input.value = '';
  });

  socket.on('user logined', user => {
    currentUser = user;
    console.log(currentUser);
  });

  socket.on('chat message', msg => {
    if (msg.user == currentUser.name) return;
    messageList.append(getMessageBlock(msg));
  });

  function getMessageBlock(msg) {
    console.dir(msg);
    var getTimeString = function(time) {
      time = new Date(time);
      const now = new Date();
      const isToday = time.getDate() == now.getDate() && time.getMonth() == now.getMonth();
      const dateStr = isToday ? 'Today' : `${time.getDate()}.${time.getMonth()+1}`;
      const timeStr = `${time.getHours() < 10 ? 0 : ''}${time.getHours()}:${time.getMinutes() < 10 ? 0 : ''}${time.getMinutes()}`;
      return `${dateStr} ${timeStr}`;
    };
    return `
    <li class="message message--${msg.user == currentUser.name ? 'inside' : 'outside'}">
      <div class="message-imgContainer">
        <img src="assets/img/user-avatar.png" alt="${msg.user}" />
      </div>
      <div class="message-content">
        <span class="message-content-user">${msg.user}</span>
        <p class="message-content-text">${msg.text}</p>
        <span class="message-content-time">${getTimeString(msg.time)}</span>
      </div>
    </li>`;
  }
});
