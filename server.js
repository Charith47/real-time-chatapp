const cyan = '\x1b[36m%s\x1b[0m';
const yellow = '\x1b[33m%s\x1b[0m';

const {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals,
} = require('unique-names-generator');

const server = require('http').createServer();
const crypto = require('crypto-js');
const io = require('socket.io')(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: false,
	},
});

const users = {};

const hash = crypto.lib.WordArray.random(16).toString();
const randomName = uniqueNamesGenerator({
	dictionaries: [adjectives, colors, animals],
});
const sentence = randomName.split('_').join(' ');
const groupName = sentence.charAt(0).toUpperCase() + sentence.slice(1);

let count = 0;

io.on('connection', (socket) => {
	// log to server and increment user count
	console.log(cyan, '[SERVER] : A user connected ');
	count++;

	// emit count, robohash, random group name to all users
	io.emit('user-count', count);
	io.emit('group-info', {
		hash: hash.toString(),
		groupName: groupName,
	});

	// message handling
	socket.on('new-user', (name) => {
		users[socket.id] = name;
		socket.broadcast.emit('user-connected', name);
	});
	socket.on('send-chat-message', (message) => {
		socket.broadcast.emit('chat-message', {
			message: message,
			name: users[socket.id],
		});
	});
	socket.on('disconnect', () => {
		console.log(yellow, '[SERVER] : A user disconnected');
		socket.broadcast.emit('user-disconnected', users[socket.id]);
		delete users[socket.id];
		count--;
		io.emit('user-count', count);
	});
});

server.listen(3000);
