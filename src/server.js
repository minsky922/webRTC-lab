import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on: http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function onSocketClose() {
    console.log("Disconnected from the Browser ❌");
}

function onSocketMessage(message) {
    console.log(message.toString('utf8'));
}

const sockets_arr = [];

wss.on("connection", (socket) => {
    sockets_arr.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser ✅");
    socket.on("close", onSocketClose);
    socket.on("message", (msg) => {
        const message = JSON.parse(msg); //Json.parse는 string을 object로 바꿔준다
        switch (message.type) {
            case "new_message":
                sockets_arr.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
                break;
            case "nickname":
                socket["nickname"] = message.payload;
            // console.log(message.payload);
        }
        // if (parsed.type === "new_message") {
        //     sockets_arr.forEach((aSocket) => aSocket.send(parsed.payload));
        // } else if(parsed.type === "nickname") {
        //     console.log(parsed.payload);
        // }
        // sockets_arr.forEach((aSocket) => aSocket.send(message.toString('utf8')));
    });
});

server.listen(3000, handleListen);

// {
//     type: "message",
//     payload: "hello everyone!"
// }

// {
//     type: "nickname",
//     payload: "min"
// }