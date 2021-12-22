const express = require('express');
const app = express();

// const session = require('express-session');
// const cookieSession = require("cookie-session");
const http = require('http').Server(app);

// socket
const io = require('socket.io')(http,{
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["nuxt-comment"],
      credentials: true
    }
});
const PORT = process.env.PORT || 7000;
// node-postgres
// const pg = require("pg");
// const pgPool = new pg.Pool({
//     database: "postgres",
//     user: "postgres",
//     password: "nikoniko7",
//     host: "localhost",
//     port: 5432,
// });

// corsエラー回避
app.use(function(req, res, next) {    
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true")    
    next();
  });


app.use('/', require('./index'));

// Postgres操作

// app.get('/' , async function(req, res){
//     // res.sendFile(__dirname+'/index.html');
//     const getData = await db.TestClass.findAll()
//     res.send(getData)    
// });

// app.post("/create", function (req, res) {
//     db.TestClass.create({
//       attr1: "test",
//     }).then(() => {
//       res.send("Data Created.");
//     });
// });

// socket 通信
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
    //   console.log('message: ' + msg);
      io.emit('chat message', msg);
    });
});

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });

http.listen(PORT, function(){
    console.log('server listening. Port:' + PORT);
});
