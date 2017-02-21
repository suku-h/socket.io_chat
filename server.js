var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 9801);
console.log("server running...");

app.get('/', function(req, res){
	console.log("process started");
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	//find how many connected to socket
	console.log('Connected: %s sockets connected', connections.length);

	socket.on('disconnect', function(){
		//remove username if user closes tab or disconnects
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		//when someone disconnects we want to know how many are still connected
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	socket.on('send message', function(data){
		console.log(data);
		io.sockets.emit('new message', {msg: data, user: socket.username});
	});

	socket.on('new user', function(data, callback){
		callback(true);
		socket.username = data;
		console.log("user: " + data);
		users.push(socket.username);
		updateUsernames();
	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
});
