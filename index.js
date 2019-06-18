const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', socket => {
  socket.broadcast.emit('chat connect', socket.handshake.address);
  console.log(`${socket.handshake.address} connected`);

  socket.on('set nickname', nickname => {
    socket.nickname = nickname;
    const users = [];
    users.push(nickname);
    console.log(users);
  });

  socket.on('chat message', msg => {
    // const user = socket.handshake.address;
    const user =
      socket.nickname === 'undefined'
        ? socket.handshake.address
        : socket.nickname;
    const timestamp = new Date();
    const timeHours =
      timestamp.getHours() < 10
        ? `0${timestamp.getHours()}`
        : timestamp.getHours();
    const timeMinutes =
      timestamp.getMinutes() < 10
        ? `0${timestamp.getMinutes()}`
        : timestamp.getMinutes();
    const timeSeconds =
      timestamp.getSeconds() < 10
        ? `0${timestamp.getSeconds()}`
        : timestamp.getSeconds();
    const formattedTimestamp = `${timeHours}:${timeMinutes}:${timeSeconds}`;
    socket.broadcast.emit('chat message', msg, user, formattedTimestamp);
    console.log(`${user} (${formattedTimestamp}) says: ${msg}`);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat disconnect', socket.handshake.address);
    console.log(`${socket.handshake.address} disconnected`);
  });
});

http.listen(3000, () => {
  console.log('listening on port 3000...');
});
