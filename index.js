const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

// Connection started
io.on('connection', socket => {
  const nickname = socket.nickname || 'Anonymous';

  const date = new Date();
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const seconds =
    date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

  const formattedTimestamp = `${hours}:${minutes}:${seconds}`;

  socket.emit('chat connect', nickname, formattedTimestamp);

  console.log(
    `${formattedTimestamp} >> ${socket.handshake.address} - ${nickname} connected`
  );

  // On new nickname
  socket.on('set nickname', nickname => {
    socket.nickname = nickname;
    socket.emit('set nickname', socket.nickname);

    console.log(
      `${formattedTimestamp} >> ${socket.handshake.address} - changed their nickname to ${nickname}`
    );
  });

  // On new message
  socket.on('chat message', msg => {
    const nickname = socket.nickname || 'Anonymous';
    const date = new Date();
    const hours =
      date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes =
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const seconds =
      date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

    const formattedTimestamp = `${hours}:${minutes}:${seconds}`;

    socket.emit('chat message', msg, nickname, formattedTimestamp);

    console.log(
      `${formattedTimestamp} >> ${socket.handshake.address} - ${nickname} says: ${msg}`
    );
  });

  // On disconnect
  socket.on('disconnect', () => {
    const nickname = socket.nickname || 'Anonymous';
    socket.emit('chat disconnect', socket.nickname || nickname);

    console.log(
      `${formattedTimestamp} >> ${socket.handshake.address} - ${nickname} disconnected`
    );
  });
});

// Start the server
http.listen(3000, () => {
  console.log('listening on port 3000...');
});
