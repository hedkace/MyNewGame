
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var sanitizer = require('sanitizer');

app.get('/',function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var io=require('socket.io')(serv,{});
io.sockets.on('connection',function(socket){
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = "" + Math.floor(10*Math.random());
  SOCKET_LIST[socket.id]=socket;

  socket.on('disconnect',function(){
    delete SOCKET_LIST[socket.id];
  });

  socket.on('sendMsgToServer',function(data){
    data = sanitizer.escape(data);
    var playerName = ("" + socket.id).slice(2,7);
    for(var i in SOCKET_LIST){
      SOCKET_LIST[i].emit('addToChat',playerName+': '+ data);
    }
  });
});

setInterval(function(){
  pack=[];
  for (var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    pack.push({
      x:socket.x,
      y:socket.y,
      number:socket.number
    });
  }
  for (var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('newPositions',pack);
  }
},1000/25);
