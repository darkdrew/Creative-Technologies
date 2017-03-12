var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//IT WORKS

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.render('index.jade');
});
app.get('/mobile/:id', function(req, res){
    res.render('mobile.jade', {id: req.params.id});
});

server.listen(process.env.PORT || 3000);

console.log("Hello I am Listening to port " + 3000);


var regUsers = {};

io.sockets.on('connection', function(socket) {
    var deskSocket;
    var mobileSocket;

    socket.on('desktop-register', function(data) {
        regUsers[data.id] = deskSocket = socket;
        console.log("Desktop connected");
    });

    
    socket.on('mobile-register', function(data) {
        mobileSocket = socket;
        //If registered users's id is not undefined then the desktop socket will connect to the mobile socket
        if(typeof(regUsers[data.id]) !== "undefined") {
            deskSocket = regUsers[data.id];
            console.log("Mobile connected");

            //DesktopSocket send to desktop first function, same with mobile
            deskSocket.emit('deskShowInstructions');
            mobileSocket.emit('mobileShowInstructions');

            //
            //mobileSocket.emit('goTouch');
        }
    }.bind(this));


    socket.on('updatePosition', function(data){
        var newMobileX = data.mobileX;
        var newMobileY = data.mobileY;

        //setInterval(function(){
        //deskSocket.emit('lol', {deskX: mobileX, deskY: mobileY });
        deskSocket.emit('newPosition', newMobileX, newMobileY);
        //}, 1000);
        console.log(newMobileX);
        console.log(newMobileY);
    }.bind(this));


    /*THIS IS MOBILE ORIENTATION */
    /*Orientation was triggered from mobile js then if desktop socket is not null then trigger the desktop orientation */
    // socket.on('mobile-orientation', function(orientation) {
    //     if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
    //         deskSocket.emit('orientation', orientation);
    //     }
    // });

    //THIS IS WHEN THE GAME STARTS
    socket.on('GameStart', function(data) {
        if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            deskSocket.emit('DeskGameStart', data);
            mobileSocket.emit('MobileGameStart', data);
        }
    });

    /* THIS IS VIDEO*/
    // socket.on('change first video', function(data) {
        
    //         deskSocket.emit('replace first video');
        
    // });


});