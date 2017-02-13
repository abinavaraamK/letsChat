var socket = io();
var userName;

$( document ).ready(function() {
  $( "#m" ).focus();
});

function joinChat(){
	var user = $('#user').val();
	if(user === null || user === ''){
		$("#userVerify").append("<p> user cannot be empty</p>");
	}else{
		console.log("user ", user);
		Cookies.set("userName",user);
		socket.emit('newUser',user);	
		
	}	
}

function refreshScroll(){
	console.log("inside binding refreshScroll" );
	/*var messageDiv =document.getElementById("messageDiv");
	console.log("$('#messageDiv').scrollHeight "+messageDiv.scrollHeight);
	console.log("$('#messageDiv').clientHeight "+messageDiv.clientHeight );
	console.log("$('#messageDiv').scrollTop "+ messageDiv.scrollTop);	
	var isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 1;
		if(!isScrolledToBottom){
			messageDiv.scrollTop = (messageDiv.scrollHeight - messageDiv.clientHeight) ;	
		}  */
};

function refreshScrollBody(){
	setInterval(checkingScroll,1000);
};

function checkingScroll(){
	console.log("inside binding refreshScrollBody" );
	var messageDiv =document.getElementById("messageDiv");
	/*console.log("$('#messageDiv').scrollHeight "+messageDiv.scrollHeight);
	console.log("$('#messageDiv').clientHeight "+messageDiv.clientHeight );
	console.log("$('#messageDiv').scrollTop "+ messageDiv.scrollTop);	*/
	var isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 1;
		if(!isScrolledToBottom){
			messageDiv.scrollTop = (messageDiv.scrollHeight - messageDiv.clientHeight) ;	
		}  
}

function notifyTyping(){
	var user = Cookies.get("userName");
	console.log("user from notifyTyping " +user);
	/*var messageDiv =document.getElementById("messageDiv");
	var isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 1;
		if(!isScrolledToBottom){
			messageDiv.scrollTop = (messageDiv.scrollHeight - messageDiv.clientHeight) ;	
		}  */
	socket.emit('notifyUser',user);
}

function submitfunction(){
	var from =  Cookies.get("userName"); 
	console.log('from in submitfunction '+ userName);
	var message = $('#m').val();
	if(message === null || message ===''){
		alert("input messages cannot be null");
	}else{
		socket.emit('chatMessage',from,message);
		/*console.log("$('#messageDiv').scrollHeight "+messageDiv.scrollHeight);
		console.log("$('#messageDiv').clientHeight "+messageDiv.clientHeight );
		console.log("$('#messageDiv').scrollTop "+ messageDiv.scrollTop);	
		var messageDiv =document.getElementById("messageDiv");
		var isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 1;
		if(!isScrolledToBottom){
			messageDiv.scrollTop = (messageDiv.scrollHeight - messageDiv.clientHeight) ;	
		}  */
	}

	$('#m').val('').focus();
	return false;
}

function clearError(){
	$("#userVerify").empty();
}
function leaveChat(){
	console.log("leaving chat bye bye" +Cookies.get("userName"));
	socket.emit("disconnectServer",Cookies.get("userName"));
	window.location = "/" ;
}

socket.on('addUserName',function(value,user){
	console.log("value " +value);
	console.log("user " +user);
	if(value === "success"){
		console.log("inside success");
		uName = Cookies.get("userName");
		console.log(userName+ 'value of username');
		if(uName === user){
			window.location.href = '/startChat?userName='+user;	
		}else{
			console.log("user name not valid");
		}
		
	}else{
		$("#userVerify").append("<p> cannot add user.User Already exists</p>");
	}
});

socket.on('serverChatMessage',function(from,msg){
/*	console.log("from " +from);
	console.log("message "+ msg);
	console.log("me "+userName);*/
	var me = Cookies.get("userName"); 
	console.log("me "+ me);
	var color = (from == me) ? 'ffc4c4' : '0addf5';
	console.log("color "+ color);
	var from  = (from ==me) ? 'Me' : from;
	console.log("from " + from);
	$('#messages').append('<li><b style="color:' +color+ '"> ' + from + '</b>: ' + msg + '</li>');
});

socket.on('notifyServerUser', function(user){
  var me = Cookies.get("userName"); 
 /* console.log('inside notify user me'+ me);
  console.log('inside notify user received'+ me);*/
  if(user != me) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  setTimeout(function(){ $('#notifyUser').text(''); }, 1000);;
});


socket.on('listOfUsers',function(usersList){
	console.log("listOfUsers.............................. first" +usersList);
	var me = Cookies.get("userName");
	$("#activeUsers").empty();
	for(var s=0;s<usersList.length;s++){
		if(usersList[s] === me){
			usersList.splice(s,1);
		}
	}
	usersList.forEach(function(values){
		$("#activeUsers").append('<li>' +values +'</li>')	;
	});

	clearDuplicates();

	function clearDuplicates(){
		var seen = {};
		$('li').each(function() {
		    var txt = $(this).text();
		    if (seen[txt])
		        $(this).remove();
		    else
		        seen[txt] = true;
		});
	}
	usersList = [];

	console.log("listOfUsers.............................." +usersList);	
});

socket.on('emoji',function(emoji){
	console.log(emoji.emoji.coffee);
});

