import express from 'express';
import cors from 'cors'
import control from './control.js'
import session from "express-session";
import connect_pg from 'connect-pg-simple'
import pg from 'pg';
import { WebSocket, WebSocketServer } from "ws";

const app = express();

const port = 3000;


app.use(express.json())

app.use(express.urlencoded({extended: true}))


const wss = new WebSocketServer({port: 8080});

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "tickets",
    password: "123456",
    port: 5432,
});
db.connect();

const pgSession = connect_pg(session);

app.use(session({
  store: new pgSession({
    pool: db,
    tableName: 'session',
    createTableIfMissing: "true"
  }),
  secret: "hello there",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true
  }
}));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


const rooms = {};

wss.on("connection", (ws) => {
  console.log("Connected")

  ws.on("message", (data)=>{
    const message = JSON.parse(data);
    console.log(message)

    if (message.type == "join"){
      const room = message.room;
      ws.room = room;
      ws.id = message.id
      

      if (!rooms[room]) rooms[room] = [];
      rooms[room].push(ws);

      if (rooms[room]?.length == 2){
        var users = [];
        rooms[room]?.forEach(member => {
          users.push(member.id)
        })
        rooms[room]?.forEach(member => {
          if (member.readyState == WebSocket.OPEN){
            member.send(JSON.stringify({type: "started", users: users, started: users[Math.floor(Math.random()*users.length)]}))
          }
        })
      }
    }


    if (message.type == "update"){
      rooms[ws.room].forEach(client => {
        if (client != ws){
          client.send(JSON.stringify({type: "update", positions: message.positions, turn: message.turn}))
        }
      })
    }
    if (message.type == "pos"){
      rooms[ws.room].forEach(client => {
        if (client != ws){
          client.send(JSON.stringify({type: "pos", positions: message.positions}))
        }
      })
    }

    if (message.type == "over"){
      rooms[ws.room].forEach(client => {
        client.send(JSON.stringify({type: "over"}))
      })
    }

  })

  ws.on('close', () => {
      if (ws.room && rooms[ws.room]) {
          rooms[ws.room] = rooms[ws.room].filter(client => client !== ws);
      }
  });

})

app.get('/test', ()=>{
  console.log("test")
})

app.post('/login', control.login)

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})