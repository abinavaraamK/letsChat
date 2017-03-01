/*var socket = io();*/
var socket = io.connect(
	'',
	{transports   : ['polling', 'websocket']});
var userName;
var hour,minute,time;
var displayPushNotification;

$( document ).ready(function() {
  /*$( "#m" ).focus();*/
  $("#smiley").hide();

});


$(window).blur(function(){
	displayPushNotification = true;
});

$(window).focus(function(){
	displayPushNotification = false;
});

function joinChat(){
	var user = $('#user').val();
	if(user === null || user === ''){
		$("#userVerify").append("<p> user cannot be empty</p>");
	}else{
		/*console.log("user ", user);*/
		Cookies.set("userName",user);
		socket.emit('newUser',user);	
		
	}	
}

function refreshScroll(){
	console.log("inside binding onfocusin" );
	var messageDiv =document.getElementById("messageDiv");
	var isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 1;
		if(!isScrolledToBottom){
			messageDiv.scrollTop = (messageDiv.scrollHeight - messageDiv.clientHeight) ;	
		}  
};

function refreshScrollBody(){
	console.log("inside binding refreshScrollBody" );
	var messageDiv =document.getElementById("messageDiv");
	var isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 1;
		if(!isScrolledToBottom){
			messageDiv.scrollTop = (messageDiv.scrollHeight - messageDiv.clientHeight) ;	
		}  
}

function notifyTyping(){
	var user = Cookies.get("userName");
	console.log("user from notifyTyping " +user);
	var messageDiv =document.getElementById("messageDiv");
	var isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 1;
		if(!isScrolledToBottom){
			messageDiv.scrollTop = (messageDiv.scrollHeight - messageDiv.clientHeight) ;	
		} 
	socket.emit('notifyUser',user);
}

function submitfunction(){
	var from =  Cookies.get("userName"); 
	console.log('from in submitfunction '+ userName);
	var message = $('#m').val();
	if(message === null || message ===''){
		alert("input messages cannot be null");
	}else{
		hour = (new Date).getHours();
		minute = (new Date).getMinutes();
		time = hour + " " +minute;
		console.log(time +"time");
		socket.emit('chatMessage',from,message,time);
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

function notifyMe(from,msg){
	if(displayPushNotification){
	var notification ;
		if(!("Notification" in window)){
			alert("This browser does not support desktop notification");	
		}

		else if(Notification.permission === "granted"){
			var options = {
	        body: from +" texted You ",
	        dir : "ltr",
	        icon:"css/message.png",
	        tag:"notifyUser"
	    };
	 	notification = new Notification("Chat App",options);
	 	setTimeout(notification.close.bind(notification),4000);
	  	}

	    
	    else if (Notification.permission !== 'denied') {

	    	Notification.requestPermission(function (permission) {
	      	if (!('permission' in Notification)) {
	        	Notification.permission = permission;
	      	}

		    if (permission === "granted") {
	    	    var options = {
	        	    body: "Hey U got a message",
	       			dir : "ltr",
			        tag:"notifyUser"

	          	};
	        notification = new Notification("ChatApp",options);
	      }
	    });
	  }
	}
}

function showEmoji(){
	$("#smiley").toggle();
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

socket.on('serverChatMessage',function(from,msg,time){
/*	console.log("from " +from);
	console.log("message "+ msg);
	console.log("me "+userName);*/
	var me = Cookies.get("userName"); 
	console.log("me "+ me);
	var color = (from == me) ?  '#31708f' : '#9C27B0';
	console.log("color "+ color);
	var name  = (from === me) ? 'Me' : from;
	/*var bgcolor = (from == me) ? '#31708f' : 'darksalmon';*/
	/*console.log("bgcolor "+ bgcolor);*/
	if(me != from){
		console.log("sldkfnhjsdbf sduagf ksdfksdvf hkgsgdvf jsdvfjhsd vgf")
		console.log(from);
		console.log(Cookies.get("userName"));
		notifyMe(from,msg);
	}
	$('#messages').append('<li class="liBorder"><b class="col-md-1 col-xs-3 col-sm-1" style="color:' +color+ '; " > ' + name + '</b>' +'<span class="col-md-10 col-xs-7 col-sm-8" style="display:block;word-wrap:break-word;color:black;">' + msg +'</span>'+ '<b class="col-md-1 col-xs-2" style="color:black;font-size: x-small;">'+ time +'</b> </li>' );

});

socket.on('notifyServerUser', function(user){
  var me = Cookies.get("userName"); 
 /* console.log('inside notify user me'+ me);
  console.log('inside notify user received'+ me);*/
  if(user != me) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  setTimeout(function(){ $('#notifyUser').text(''); }, 1000);
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
	console.log(emoji.emoji)
	var size = Object.keys(emoji.emoji).length;
	var val = Object.values(emoji.emoji);
	console.log(size)
	console.log(val)
	console.log(val[1])

	for(var t=800;t<1000;t++)
		$('#one').append('<td data-value="'+val[t]+'"> '+val[t]+'</td>' );	
	for(var t=0;t<200;t++)
		$('#two').append('<td data-value="'+val[t]+'">'+val[t]+'</td>' );	
	for(var t=400;t<600;t++)
		$('#three').append('<td data-value="'+val[t]+'"> '+val[t]+'</td>' );	
	for(var t=600;t<800;t++)
		$('#four').append('<td data-value="'+val[t]+'"> '+val[t]+'</td>' );	
	for(var t=200;t<400;t++)
		$('#five').append('<td data-value="'+val[t]+'"> '+val[t]+'</td>' );
});

/*$(function(){
	var tbl = document.getElementById("smiley");
	console.log(tbl)
	for (var i = 0; i < tbl.rows.length; i++) {
	   for (var j = 0; j < tbl.rows[i].cells.length; j++){
          tbl.rows[i].cells[j].onclick = function () {   getval(this);};
    	}
    }
});
*/
$(document).on("click", "#smiley td", function(e) {
    var data = $(this).attr('data-value');
    console.log(data);
  	var text = $("#m");
  	text.val(text.val() + data )
}); 