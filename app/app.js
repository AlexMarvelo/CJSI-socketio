'use strict';

var $ = require('jquery');
var socket = io();

$(document).ready(function() {
  const form = $('#form-newmessage');
  const input = form.find('.form-input')[0];
  const entryForm = $('#entry-form');
  const entryInput = entryForm.find('.entry-input')[0];
  const messagesContainer = $('.messages-container');
  const messageList = $('#messages-list');
  const sidebar = $('.sidebar');
  const sidebarList = sidebar.find('.sidebar-list');
  entryInput.focus();

  let currentUser;
  let onlineList = [];

  entryForm.submit((event) => {
    event.preventDefault();
    if (!entryInput.value.length) return;
    socket.emit('user login', {
      name: entryInput.value
    });
    entryForm.remove();
  });

  form.submit((event) => {
    event.preventDefault();
    if (!currentUser) {
      input.value = '';
      return;
    }
    let msg = {
      text: input.value,
      user: currentUser,
      time: new Date()
    };
    messageList.append(getMessageBlock(msg));
    scrollToListBttom();
    socket.emit('chat message', msg);
    input.value = '';
  });

  sidebar.find('.sidebar-toggle').click(() => {
    sidebar.toggleClass('opened');
  });

  socket.on('user logined', (user, onlineUsers) => {
    currentUser = user;
    onlineList = onlineUsers;
    updateOnlineList();

    socket.on('user joineduser', user => {
      if (currentUser && user.id == currentUser.id) return;
      addInfoMsg(`${user.name} joined this chat`);
      addToOnlineList(user);
    });

    socket.on('user leaveuser', user => {
      if (currentUser && user.id == currentUser.id) return;
      addInfoMsg(`${user.name} left this chat`);
      removeFromOnlineList(user);
    });

    socket.on('chat message', msg => {
      if (msg.user.id == currentUser.id) return;
      addMsg(msg);
    });

    socket.on('chat history', msgs => {
      if (!currentUser) return;
      msgs.forEach(msg => messageList.append(getMessageBlock(msg)));
      scrollToListBttom();
    });
  });

  socket.on('user loginunavailable', () => {
    addInfoMsg('Room is full (limit of 5 users). Entry unavailable');
  });


  // -----------------------------------------------------


  function addToOnlineList(user) {
    onlineList.push(user);
    updateOnlineList();
  }

  function removeFromOnlineList(user) {
    let index;
    onlineList.find((u, i) => {
      if (u.id == user.id) {
        index = i;
        return true;
      }
    });
    if (index) onlineList.splice(index, 1);
    updateOnlineList();
  }

  function updateOnlineList() {
    sidebarList.empty();
    onlineList.forEach(user => {
      if (user.id == currentUser.id) return;
      sidebarList.append(`<li>${user.name}</li>`);
    });
  }

  function addMsg(msg) {
    messageList.append(getMessageBlock(msg));
    scrollToListBttom();
  }

  function getMessageBlock(msg) {
    if (!msg.text.length) return;
    let isMy = msg.user.id == currentUser.id;
    let getTimeString = function(time) {
      time = new Date(time);
      const now = new Date();
      const isToday = time.getDate() == now.getDate() && time.getMonth() == now.getMonth();
      const dateStr = isToday ? 'Today' : `${time.getDate()}.${time.getMonth()+1}`;
      const timeStr = `${time.getHours() < 10 ? 0 : ''}${time.getHours()}:${time.getMinutes() < 10 ? 0 : ''}${time.getMinutes()}`;
      return `${dateStr} ${timeStr}`;
    };
    let userRow = `<span class="message-content-user">${msg.user.name}</span>`;
    return `
    <li class="message message--${isMy ? 'inside' : 'outside'}">
      <div class="message-imgContainer">
        <img src="assets/img/user-avatar.png" alt="${msg.user.name}" />
      </div>
      <div class="message-content">
        ${isMy ? '' : userRow }
        <p class="message-content-text">${msg.text}</p>
        <span class="message-content-time">${getTimeString(msg.time)}</span>
      </div>
    </li>`;
  }

  function addInfoMsg(infoMsg) {
    messageList.append(getInfoMessageBlock(infoMsg));
    scrollToListBttom();
  }

  function getInfoMessageBlock(infoMsg) {
    if (!infoMsg.length) return;
    return `
    <div class="entry-container">
      <span class="entry-msg">${infoMsg}</span>
    </div>`;
  }

  function scrollToListBttom() {
    messagesContainer.animate({
      scrollTop: messagesContainer[0].scrollHeight
    }, 'slow');
  }
});
