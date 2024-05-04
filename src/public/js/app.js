const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg); // JSON.stringify는 javascript object를 string으로 바꿔준다
}

function handleOpen() {
    console.log("Connected to Server ✅");
}

socket.addEventListener("open", handleOpen);

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
    // console.log("New message: ", message.data, " from the server");
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

// setTimeout(() => {
//     socket.send("hello from the browser!");
// }, 10000); // 10 seconds

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    // socket.send(input.value);
    // console.log(input.value);
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
    // input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    // socket.send(`Nickname: ${input.value}`);
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);