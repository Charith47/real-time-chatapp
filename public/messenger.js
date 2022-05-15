let context = null;
const socket = io('http://localhost:3000');

// helper functions
const getContext = () => {
	const contexts = document
		.getElementById('messages')
		.getElementsByClassName('context');

	const context = contexts[contexts.length - 1];
	return context ? [context, ...context.className.split(' ')] : [];
};

const createContext = (type, id) => {
	const contextWrapper = document.createElement('div');
	contextWrapper.className = 'wrapper';

	const newContext = document.createElement('div');
	newContext.className = id ? `context ${type} ${id}` : `context ${type}`;

	return [contextWrapper, newContext];
};

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

	const [context, contextType, contextName, contextId] = getContext();

	const message = document.createElement('div');
	message.className = 'bubble left';
	message.innerHTML = data.message;

	if (contextName === 'recieve' && contextId === data.id) {
		context.appendChild(message);
	} else {
		const [contextWrapper, newContext] = createContext('recieve', data.id);

		const name = document.createElement('span');
		name.id = `${data.name} ${data.id}`;
		name.className = 'user-name';
		name.innerHTML = data.name;

		newContext.appendChild(message);

		contextWrapper.appendChild(name);
		contextWrapper.appendChild(newContext);

		messages.appendChild(contextWrapper);
	}
});

socket.on('user-connected', () => {
	//TODO:
});

const onSendMessage = (e) => {
	e.preventDefault();
	const messages = document.getElementById('messages');

	const input = document.getElementById('message-input');
	const messageText = input.value;

	if (messageText.trim() != '') {
		socket.emit('send-chat-message', messageText);

		const message = document.createElement('div');
		message.className = 'bubble right';
		message.innerHTML = messageText;

		const [context, contextType, contextName, contextId] = getContext();

		if (contextName === 'send') {
			context.appendChild(message);
		} else {
			const [contextWrapper, newContext] = createContext('send', '');

			newContext.appendChild(message);
			contextWrapper.appendChild(newContext);

			messages.appendChild(contextWrapper);
		}

		input.value = '';
	}
};

const init = () => {
	document
		.getElementById('send-message')
		.addEventListener('submit', onSendMessage);

	const name = prompt('What is your name?');
	socket.emit('new-user', name);
	// set a cookie to username
};

init();