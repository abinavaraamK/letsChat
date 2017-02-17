var express = require('express');

var app = express();

var http = require('http').Server(app);

var io  = require('socket.io')(http);

var path = require('path');

var userNames = [];
var checkUsers = [];
var cutoffLogin = false;
var currentUserName ;
var emojisArr = [];

var emoji = require('node-emoji');


app.use(express.static(path.join(__dirname,'/public')));

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname,'index.html'));	
});

app.get('/startChat',function(req,res){
	console.log("req.query.id is set to " + req.query.userName);
	currentUserName = req.query.userName;
	res.sendFile(path.join(__dirname,'chat.html'));	
});


emojisArr.push(emoji.get('coffee'));

emojisArr.push(emoji.get('100'));


io.on('connection',function(socket){
	console.log('connection established');

	io.emit('listOfUsers',userNames);

	io.emit('emoji',emoji);
	
	app.sendCurrentStatus(socket.id);
	socket.emit('currentStatus', {'connected': true});

	socket.on('disconnect',function(){
		console.log('user disconnected');
	});

	socket.on("disconnectServer",function(userName){
	console.log("inside disconnectServer event ", userName );
	for (var i=userNames.length-1; i>=0; i--) {
    	if (userNames[i] === userName) {
        	userNames.splice(i, 1);
    	}
	}
		io.emit('listOfUsers',userNames);
		socket.disconnect();
	});

	socket.on('chatMessage',function(from,msg,time){
		console.log('from '+ from);
		console.log('chatMessage '+msg);
		io.emit('serverChatMessage',from,msg,time);
	});

	socket.on('notifyUser',function(user){
		io.emit('notifyServerUser',user);
	});

	socket.on('newUser',function(user){
		console.log('userName ', user);
	
		for(var i=0;i<userNames.length;i++){	
			if(user == userNames[i]){
				console.log("same");
				checkUsers.push("same");
				break;
				}
			else{
				console.log("different");
				checkUsers.push("different");
				}
			}
	console.log("checkUsers "+checkUsers);
	console.log("checkUsers.length "+checkUsers.length);

	for(var j=0;j<checkUsers.length;j++){
		if(checkUsers[j] =="same"){
			console.log("same user");
			cutoffLogin = true;
		}else{
			console.log("different user ");
		}
	};
	console.log('cutoffLogin' + cutoffLogin);
	
	if(!cutoffLogin){
		console.log("inside adding user ");
		userNames.push(user);
		console.log(userNames+' userNames');
		io.emit("addUserName","success",user);
	}else{
		console.log("cannot add user ");
		io.emit("addUserName","failure");
	}
	checkUsers = [];
	cutoffLogin = false;
	});
});


http.listen(3000,function(){
	console.log('node server listning on port 3000');
});