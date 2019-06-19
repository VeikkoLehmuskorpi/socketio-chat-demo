const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

let connectedUsers = [];

// Connection started
io.on('connection', socket => {
  // add user's information to a list of connected users
  connectedUsers.push({
    id: socket.id,
    nickname: [socket.nickname || 'Anonymous'],
    handshake: socket.handshake
  });

  // emit the user list change to every socket
  io.emit('userlist change', connectedUsers);

  const nickname = socket.nickname || 'Anonymous';

  const date = new Date();
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const seconds =
    date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

  const formattedTimestamp = `${hours}:${minutes}:${seconds}`;

  io.emit('chat connect', nickname, formattedTimestamp, connectedUsers);

  console.log(
    `${formattedTimestamp} >> ${socket.handshake.address} - ${nickname} connected`
  );

  // On new nickname
  socket.on('set nickname', nickname => {
    socket.nickname = nickname;
    socket.emit('set nickname', socket.nickname);

    // get the specific user
    const currentUserArr = connectedUsers.filter(user => user.id === socket.id);
    const currentUser = currentUserArr[0];

    // update nickname
    currentUser.nickname.push(nickname);
    // remove current user from list of all users
    connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
    // add updated user back
    connectedUsers.push(currentUser);

    // emit the nickname change to every socket
    io.emit('userlist change', connectedUsers);

    const previousNickname =
      currentUser.nickname[currentUser.nickname.length - 2];

    console.log(
      `${formattedTimestamp} >> ${socket.handshake.address} - ${previousNickname} changed their nickname to ${nickname}`
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

    io.emit('chat message', msg, nickname, formattedTimestamp);

    console.log(
      `${formattedTimestamp} >> ${socket.handshake.address} - ${nickname} says: ${msg}`
    );
  });

  // On disconnect
  socket.on('disconnect', () => {
    // remove current user from the list of all users
    connectedUsers = connectedUsers.filter(user => user.id !== socket.id);

    // emit the user list change to every socket
    io.emit('userlist change', connectedUsers);

    const nickname = socket.nickname || 'Anonymous';

    const date = new Date();
    const hours =
      date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes =
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const seconds =
      date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

    const formattedTimestamp = `${hours}:${minutes}:${seconds}`;

    io.emit('chat disconnect', socket.nickname || nickname, formattedTimestamp);

    console.log(
      `${formattedTimestamp} >> ${socket.handshake.address} - ${nickname} disconnected`
    );
  });
});

// Start the server
http.listen(3000, () => {
  console.log('listening on port 3000...');
});
