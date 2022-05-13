let context = null;
const socket = io('http://localhost:3000');

const init = () => {
	const name = prompt('What is your name?');
	socket.emit('new-user', name);
};

init();

socket.on('group-info', (info) => {
	let tag = document.createElement('style');
	tag.innerHTML = `.group-image{
        background-image: url(https://robohash.org/${info.hash}/?size=60x60);
    }`;
	document.querySelector('head').appendChild(tag);
	document.getElementById('group-name').innerHTML = info.groupName;
});

socket.on('user-count', (count) => {
	let memberCount = document.getElementById('group-member-count');

	if (count > 1) memberCount.innerHTML = `${count} people are online`;
	else memberCount.innerHTML = 'You are all alone, find some friends';
});

socket.on('chat-message', (data) => {
	const messages = document.getElementById('messages');

	const contexts = document
		.getElementById('messages')
		.getElementsByClassName('context');
	let context = contexts[contexts.length - 1];
	let contextName = context.className.split(' ')[1];

	const message = document.createElement('div');
	message.className = 'bubble left';
	message.innerHTML = data.message;

	if (contextName === 'recieve') {
		context.appendChild(message);
	} else {
		const newContext = document.createElement('div');
		newContext.className = 'context recieve';

		newContext.appendChild(message);
		messages.appendChild(newContext);
	}
	// appendMessage(`${data.name}`, `${data.message}`);
});
