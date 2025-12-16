// Setup server, session and middleware here.
// Used docker for redis server 
import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import cors from 'cors';
import client from './config/redisClient.js';
import http from 'http';
import wrap from 'express-socket.io-session';
import { RedisStore } from 'connect-redis';
import { Server } from 'socket.io';
import setupSocket from './socket/socket.js';
import { initIndexes } from './config/indexes.js';
import path from 'path';

app.use(express.json());

const sessionMiddleware = session({
  name: 'AuthenticationState',
  store: new RedisStore({ client, prefix: 'sess:' }),
  secret: "...",
  saveUninitialized: false,
  resave: false,
});

app.use(sessionMiddleware);

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

app.use(cors({
  credentials: true
}));

configRoutes(app);

app.use(express.static(path.join(process.cwd(), "dist")));


app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", credentials: true }
});

app.locals.io = io;

io.use(wrap(sessionMiddleware, { autoSave: true }));

io.on("connection", (socket) => {
  const userId = socket.handshake.session.user?._id;
  if (!userId) {
    console.log("Unauthenticated socket tried to connect:", socket.id);
    socket.disconnect(); 
    return;
  }

  socket.userId = userId;
  socket.join(userId);
  console.log("Authenticated user connected:", socket.userId);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

});

setupSocket(io);

initIndexes();

const PORT = process.env.PORT || 3000

server.listen(PORT , () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on ');
})