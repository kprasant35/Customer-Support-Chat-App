const socket = io('http://localhost:3000/'); //io socket

const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('inputField');
const messageInput = document.getElementById('message-input');

if(messageForm != null){

  socket.emit('new-connection',userId, isCustomer);

  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(message, isCustomer);
    socket.emit('new-chat-message', userId, message, isCustomer);
    messageInput.value = '';
  });
}

socket.on('chat-message', (message, isCustomer) => {
    appendMessage(message, isCustomer);
  });

function appendMessage(message, isCustomer) {

    const messageElement = document.createElement('p')
    messageElement.classList.add('message');

    if(isCustomer == 'false'){
      messageElement.classList.add('user_message');
    }
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}
