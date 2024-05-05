// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//     const msg = { type, payload };
//     return JSON.stringify(msg); // JSON.stringify는 javascript object를 string으로 바꿔준다
// }

// function handleOpen() {
//     console.log("Connected to Server ✅");
// }

// socket.addEventListener("open", handleOpen);

// socket.addEventListener("message", (message) => {
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
//     // console.log("New message: ", message.data, " from the server");
// });

// socket.addEventListener("close", () => {
//     console.log("Disconnected from Server ❌");
// });

// // setTimeout(() => {
// //     socket.send("hello from the browser!");
// // }, 10000); // 10 seconds

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     // socket.send(input.value);
//     // console.log(input.value);
//     socket.send(makeMessage("new_message", input.value));
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
//     // input.value = "";
// }

// function handleNickSubmit(event) {
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     // socket.send(`Nickname: ${input.value}`);
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);

const socket = io(); // io는 자동적으로 back-end socket.io와 연결해주는 function

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", input.value);
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    //1. emit은 back-end로 event를 보내는 function,
    // 2. emit의 첫번째 인자는 event 이름, 두번째 인자는 event에 보낼 data(payload)
    // 3. 세번째 인자는 서버에서 호출하는 function
    socket.emit(
        "enter_room",
        input.value,
        showRoom // 마지막 argument는 function이어야 한다
    );
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

// "welcome" event가 발생하면 addMessage("someone joined!")를 실행한다
socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName} (${newCount})`;
    addMessage(`${user} joined!`);
})

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName} (${newCount})`;
    addMessage(`${left} left ㅠㅠ`);
})

socket.on("new_message", addMessage); // "new_message" event가 발생하면 addMessage를 실행한다

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    if (rooms.length === 0) {
        roomList.innerHTML = "";
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});