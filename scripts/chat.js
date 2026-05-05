let chatMessages = document.getElementById("chat-messages");
let chatInput = document.getElementById("chat-input");
let sendBtn = document.getElementById("send-btn");

const token = getCookie("ac");

const socket = io(`${API_URL}/chats`, {
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
  auth: {
    token: `Bearer ${token}`,
  },
});

const user = JSON.parse(localStorage.getItem("user"));
let lastSenderId = null;
let isTyping = false;
let typingTimeout;
chatInput.addEventListener("input", function (e) {
  if (!isTyping) {
    socket.emit("startTyping", { userId: user.id, name: user.name });
    isTyping = true;
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", { userId: user.id, name: user.name });
    isTyping = false;
  }, 10000);
});

socket.on("connect", () => {
  console.log("Socket connected successfully");
});

socket.on("connect_error", (err) => {
  console.log("Socket connection error:", err.message);
});

socket.on("receiveMessage", (message) => {
  if (message.userId === user.id) return;
  displayMessage(message, "received");
});

socket.on("message", (message) => {
  displayMessage(message, "received");
});

socket.on("newMessage", (message) => {
  displayMessage(message, "received");
});

socket.on("startTyping", (data) => {
  const typingIndicator = document.getElementById("typing-indicator");
  typingIndicator.textContent = `${data.name + " " + i18next.t("chat.isTyping")}`;
});

socket.on("stopTyping", (data) => {
  const typingIndicator = document.getElementById("typing-indicator");
  typingIndicator.textContent = "";
});

function sendMessage() {
  const messageText = chatInput.value.trim();
  if (!messageText) return;
  if (!token) {
    showToast("error", i18next.t("auth.pleaseLogin"));
    return;
  }

  const messageData = {
    text: messageText,
    content: chatInput.value.trim(),
    timestamp: new Date().toISOString(),
  };

  socket.emit("sendMessage", messageData);
  socket.emit("stopTyping", { userId: user.id, name: user.name });
  isTyping = false;
  displayMessage(messageData, "sent");
  chatInput.value = "";
}

function displayMessage(message, type) {
  const messageElement = document.createElement("div");
  const currentSenderId =
    message.userId || message.user?.id || (type === "sent" ? user.id : null);

  let nameHtml = "";
  if (type !== "sent" && currentSenderId !== lastSenderId) {
    nameHtml = `<p class="message-name">${message.name || message.user?.name || ""}</p>`;
  }

  messageElement.innerHTML = `
  ${nameHtml}
  <p class="message-content">${message.content}</p>
  <span class="message-timestamp live-timestamp" data-timestamp="${message.timestamp}">${formatTimeAgo(new Date(message.timestamp))}</span>
    `;
  messageElement.classList.add("message", type);

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  lastSenderId = currentSenderId;
}

function updateTimestamps() {
  const timestampElements = document.querySelectorAll(".live-timestamp");
  timestampElements.forEach((element) => {
    const timestamp = element.getAttribute("data-timestamp");
    if (timestamp) {
      element.textContent = formatTimeAgo(new Date(timestamp));
    }
  });
}

setInterval(updateTimestamps, 30000);

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});
