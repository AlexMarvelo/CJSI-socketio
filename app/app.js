var socket = io();
var form = $('#form-newmessage'),
    input = form.find('.form-input')[0];

$(form).submit(function(){
  socket.emit('chat message', input.value);
  input.value = '';
  return false;
});
socket.on('chat message', function(msg){
  console.warn(msg);
});
