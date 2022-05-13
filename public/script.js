const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('msg-field');

// core functions -----------------------------

function getTime() {
	// this function handles timing
	var date = new Date();
	var h = date.getHours();
	var m = date.getMinutes();

	h = h < 10 ? '0' + h : h;
	m = m < 10 ? '0' + m : m;

	var time = h + ':' + m;
	return time;
}

function setImage(ID) {
	// this function takes a random string and attaches it to url to set profile image
	var style = document.createElement('style');
	style.innerHTML =
		'#room-picture{background-image:url(https://robohash.org/' +
		ID +
		'/?size=65x65);}';
	var ref = document.querySelector('script');
	ref.parentNode.insertBefore(style, ref);
}

function appendMessage(name, message) {
	// this function handles client messages
	const messageElement = document.createElement('div');
	messageElement.classList.add('friend-message');
	messageElement.innerHTML =
		'<b>' +
		name +
		'</b> <span style="color:rgb(223, 201, 8); font-size:17px;">|</span> ' +
		message +
		' ' +
		'<span style="color:rgb(170, 170, 170); font-size:10px;">' +
		getTime() +
		'</span>';
	messageContainer.append(messageElement);

	//scroll
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

function myMessage(message) {
	// this function handles user messages
	const messageElement = document.createElement('div');
	messageElement.classList.add('my-message');
	messageElement.innerHTML =
		message +
		' ' +
		'<span style="color:rgb(170, 170, 170); font-size:10px;">' +
		getTime() +
		'</span>';
	messageContainer.append(messageElement);

	//scroll
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

function botMessage(message) {
	// this function handles user joined and left messages
	const messageElement = document.createElement('div');
	messageElement.classList.add('bot-message');
	messageElement.innerText = message;
	messageContainer.append(messageElement);

	//scroll
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

// --------------------------------------------

// server handling ----------------------------
const name = prompt('What is your name?'); // get username
botMessage('You joined'); // join alert
socket.emit('new-user', name); // gives the name to the server

socket.on('hash-code', (hash) => {
	// all clients recieve same hash ID to generate profile image
	setImage(hash); // inject css to <style> tag
});

socket.on('group-name', (groupName) => {
	// all clients recieve the same random group name
	document.getElementById('room-name').innerHTML = groupName;
});

socket.on('user-count', (count) => {
	// display user count
	if (count > 1)
		document.getElementById('room-participants').innerHTML =
			count + ' people are online';
	else
		document.getElementById('room-participants').innerHTML =
			'You are all alone, find some friends';
});

socket.on('chat-message', (data) => {
	// handle incoming chat message
	appendMessage(`${data.name}`, `${data.message}`);
});

socket.on('user-connected', (name) => {
	// user connected alert
	botMessage(`${name} joined`);
});

socket.on('user-disconnected', (name) => {
	// user disconnected alert
	botMessage(`${name} left`);
});

messageForm.addEventListener('submit', (e) => {
	// listens to submit and appends client message to message box
	e.preventDefault(); // prevents page from refreshing on submission
	const message = messageInput.value;

	// cannot send empty messages
	if (message.trim() != '') {
		myMessage(`${message}`);
		socket.emit('send-chat-message', message);
		messageInput.value = '';
		console.log('submitted');
	} else {
		alert('DONT SEND EMPTY MESSAGES YOU MORON!');
		console.log('empty message');
	}
});

// --------------------------------------------
