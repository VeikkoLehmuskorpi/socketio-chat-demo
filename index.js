const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', socket => {
  socket.broadcast.emit('chat connect', socket.handshake.address);
  console.log(`${socket.handshake.address} connected`);

  socket.on('chat message', msg => {
    socket.broadcast.emit('chat message', msg, socket.handshake.address);
    console.log(`${socket.handshake.address} says: ${msg}`);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat disconnect', socket.handshake.address);
    console.log(`${socket.handshake.address} disconnected`);
  });
});

http.listen(3000, () => {
  console.log('listening on port 3000...');
});
