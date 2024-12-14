const express = require("express")
const app = express()
const http = require("http")
const path = require("path")
const {Server} = require("socket.io")
const cors = require("cors")
const client = require("./db")
const { createAdapter } = require("@socket.io/postgres-adapter");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3001',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static("../front_end/build"))
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "front_end", "build", "index.html"))
})

const server = http.createServer(app)
 
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ['GET', 'POST'],
    },
})

io.on("connection", async (socket) => {
    console.log(`User - ${socket.id} connected`)

    socket.on("joinRoom", async (roomId) => {
        console.log(roomId)
        socket.join(roomId)
        const res = await client.query(`
        CREATE TABLE IF NOT EXISTS ${roomId} (
            id SERIAL PRIMARY KEY,
            uname varchar(225),
            message varchar(225),
            timeStamp timestamp
        );
      `);
        // console.log(res)
        console.log(`User ${socket.id} joined ${roomId}`)
    })

    socket.on("sendMessage", async (data) => {
        const {username, room, message, timeStamp} = data
        console.log(room)
        const res = await client.query(`insert into ${room} (uname, message , timeStamp) values ('${username}', '${message}', '${timeStamp}')`)
        console.log(res)
        io.to(room).emit("recieveMessage", data)
    })

    socket.on("leaveRoom", async (roomId) => {
        socket.leave(roomId)
        console.log(`User ${socket.id} left ${roomId}`)
    })

    socket.on("quit_room", async (roomId) => {
        const res = await client.query(`SELECT EXISTS (
            SELECT 1
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = '${roomId}'
         );`)
        console.log(res)
        if (res.rows[0].exists){
            await client.query(`DROP TABLE ${roomId}`)
        }
    })

    socket.on("disconnect", (socket) => {
        console.log(`User - ${socket.id} disconnected`)
    })

})

io.adapter(createAdapter(client))

server.listen(3000, () => {
    console.log('Server running at 3000')
})

app.listen(3002, () => {
    console.log("App Backend is running at port 3002")
})

app.post('/getData', cors(corsOptions), async (req, res) => {
    const {roomId} = req.body
    // res.write(roomId)
    console.log(req.body)

    const check = await client.query(`SELECT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = '${roomId}'
     );`)

     if (check.rows[0].exists){
        const data = await client.query(`select * from ${roomId}`)
        console.log(data.rows)
        res.send(data.rows)
     }
})