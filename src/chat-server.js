import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { instrument } from '@socket.io/admin-ui';
// import WebSocket from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on: http://localhost:3000`);

const httpServer = http.createServer(app);
// const wss = new WebSocket.Server({ server });
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://localhost:3000/admin/socket.io"],
        credentials: true,
    },
});
instrument(wsServer, {
    auth: false
});

function publicRooms() {
    const { sockets: { adapter: { sids, rooms } } } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}
// const sids = wsServer.sockets.adapter.sids;
// const rooms = wsServer.sockets.adapter.rooms;

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter.rooms);
        console.log(`Socket Event: ${event}`);
    });

    // console.log(socket);
    socket.on("enter_room", (roomName, done) => {
        // console.log(socket.id);
        // console.log(socket.rooms); // set { <socket.id> }
        socket.join(roomName);
        // console.log(socket.rooms); // set { <socket.id>, roomName }
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // roomName에 있는 모든 socket(사람)들에게 welcome event를 보낸다
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));

    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

function onSocketClose() {
    console.log("Disconnected from the Browser ❌");
}

function onSocketMessage(message) {
    console.log(message.toString('utf8'));
}

// const sockets_arr = [];

// wss.on("connection", (socket) => {
//     sockets_arr.push(socket);
//     socket["nickname"] = "Anonymous";
//     console.log("Connected to Browser ✅");
//     socket.on("close", onSocketClose);
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg); //Json.parse는 string을 object로 바꿔준다
//         switch (message.type) {
//             case "new_message":
//                 sockets_arr.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//             // console.log(message.payload);
//         }
//         // if (parsed.type === "new_message") {
//         //     sockets_arr.forEach((aSocket) => aSocket.send(parsed.payload));
//         // } else if(parsed.type === "nickname") {
//         //     console.log(parsed.payload);
//         // }
//         // sockets_arr.forEach((aSocket) => aSocket.send(message.toString('utf8')));
//     });
// });

httpServer.listen(3000, handleListen);

// {
//     type: "message",
//     payload: "hello everyone!"
// }

// {
//     type: "nickname",
//     payload: "min"
// }