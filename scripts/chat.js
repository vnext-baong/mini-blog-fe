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

window.chatSocket = socket;

const user = JSON.parse(localStorage.getItem("user"));
let lastSenderId = null;
let isTyping = false;
let typingTimeout;
let currentGroupId = null;

chatInput?.addEventListener("input", function (e) {
  if (!isTyping && currentGroupId) {
    socket.emit("startTyping", { groupId: currentGroupId, name: user.name });
    isTyping = true;
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (currentGroupId) {
      socket.emit("stopTyping", { groupId: currentGroupId, name: user.name });
    }
    isTyping = false;
  }, 10000);
});

socket.on("connect", () => {
  console.log("Socket connected successfully");
  if (currentGroupId) {
    socket.emit("joinRoom", currentGroupId);
  }
});

socket.on("connect_error", (err) => {
  console.log("Socket connection error:", err.message);
});

socket.on("receiveMessage", (message) => {
  if (
    window.currentReceiverId === message.groupId ||
    window.currentReceiverId === message.receiverId
  ) {
    if (message.senderId === user.id) return;
    const messagesContainer = document.getElementById("chatMessages");
    if (messagesContainer) {
      const msgDiv = document.createElement("div");
      msgDiv.className = "message incoming";
      const timeStr = formatTimeAgo(new Date(message.createdAt || new Date()));
      const senderStr = message.sender?.name || message.senderName || "";
      msgDiv.innerHTML = `
      ${senderStr ? `<div class="msg-name" style="font-size: 0.75em; opacity: 0.8; margin-bottom: 2px;">${senderStr}</div>` : ""}
      <div class="msg-content">${message.content}</div>
      <div class="msg-time" style="font-size: 0.7em; opacity: 0.6; margin-top: 2px; text-align: right;">${timeStr}</div>`;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  if (message.userId === user.id || message.senderId === user.id) return;
  displayMessage(message, "received");
});

socket.on("message", (message) => {
  displayMessage(message, "received");
});

socket.on("newMessage", (message) => {
  displayMessage(message, "received");
});

socket.on("startTyping", (data) => {
  if (data.groupId && window.currentReceiverId === data.groupId) {
    const chatTitle = document.getElementById("chatUserName");
    if (chatTitle && !chatTitle.innerText.includes("...")) {
      chatTitle.dataset.origName = chatTitle.innerText;
      chatTitle.innerText = `${data.name} is typing...`;
    }
  }

  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.textContent = `${data.name + " " + (window.i18next ? i18next.t("chat.isTyping") : "is typing...")}`;
  }
});

socket.on("stopTyping", (data) => {
  if (data.groupId && window.currentReceiverId === data.groupId) {
    const chatTitle = document.getElementById("chatUserName");
    if (chatTitle && chatTitle.dataset.origName) {
      chatTitle.innerText = chatTitle.dataset.origName;
    }
  }

  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.textContent = "";
  }
});

function sendMessage() {
  const messageText = chatInput.value.trim();
  if (!messageText) return;
  if (!token) {
    showToast("error", i18next.t("auth.pleaseLogin"));
    return;
  }

  const messageData = {
    groupId: currentGroupId,
    content: messageText,
    timestamp: new Date().toISOString(),
  };

  socket.emit("sendMessage", messageData, (response) => {});

  if (currentGroupId) {
    socket.emit("stopTyping", { groupId: currentGroupId, name: user.name });
  }
  isTyping = false;
  displayMessage({ ...messageData, user }, "sent");
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

chatInput?.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});
window.setupChatPopupDelegation = function setupChatPopupDelegation() {
  const chatsContainer = document.getElementById("chats");
  if (chatsContainer) {
    chatsContainer.addEventListener("click", function (e) {
      const chatItem = e.target.closest(".group, .user");
      if (chatItem) {
        const nameEl = chatItem.querySelector(".name");
        const receiverId =
          chatItem.dataset.id || chatItem.getAttribute("data-id");
        if (nameEl) {
          openChatPopup(nameEl.innerText, receiverId);
        }
      }
    });
  }

  const modalChatInput = document.getElementById("chatInput");
  if (modalChatInput) {
    if (typeof validateInput === "function") validateInput(modalChatInput);
    modalChatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        sendPopupMessage();
      } else {
        if (window.chatSocket && window.currentReceiverId) {
          window.chatSocket.emit("startTyping", {
            groupId: window.currentReceiverId,
            name: JSON.parse(localStorage.getItem("user"))?.name,
          });
          clearTimeout(window.popupTypingTimeout);
          window.popupTypingTimeout = setTimeout(() => {
            window.chatSocket.emit("stopTyping", {
              groupId: window.currentReceiverId,
              name: JSON.parse(localStorage.getItem("user"))?.name,
            });
          }, 5000);
        }
      }
    });
  }

  const closeBtn = document.getElementById("closeChatBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeChatPopup);
  }

  const minimizeBtn = document.getElementById("minimizeChatBtn");
  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", toggleMinimizeChat);
  }

  const chatHeaderBar = document.getElementById("chatHeaderBar");
  if (chatHeaderBar) {
    chatHeaderBar.addEventListener("click", function (e) {
      if (e.target.closest("button")) return;
      toggleMinimizeChat();
    });
  }

  const popupSendBtn = document.getElementById("sendMessageBtn");
  if (popupSendBtn) {
    popupSendBtn.addEventListener("click", sendPopupMessage);
  }
};

window.isChatMinimized = false;

window.toggleMinimizeChat = function toggleMinimizeChat() {
  const messagesContainer = document.getElementById("chatMessages");
  const chatFooter = document.getElementById("chatFooter");
  const popup = document.getElementById("chatPopup");

  if (window.isChatMinimized) {
    messagesContainer.style.display = "flex";
    chatFooter.style.display = "flex";
    popup.style.height = "400px";
  } else {
    messagesContainer.style.display = "none";
    chatFooter.style.display = "none";
    popup.style.height = "auto";
  }
  window.isChatMinimized = !window.isChatMinimized;
};

window.fetchChatMessages = async function fetchChatMessages(
  receiverId,
  page = 1,
) {
  try {
    const response = await fetch(
      `${typeof API_URL !== "undefined" ? API_URL : ""}/messages?groupId=${receiverId}&page=${page}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${getCookie("ac")}`,
        },
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return null;
  }
};

window.openChatPopup = async function openChatPopup(name, receiverId) {
  const popup = document.getElementById("chatPopup");
  if (popup) {
    document.getElementById("chatUserName").innerText = name;
    popup.style.display = "flex";

    if (window.isChatMinimized) {
      window.toggleMinimizeChat();
    }

    if (window.chatSocket) {
      window.currentGroupId = receiverId;
      window.chatSocket.emit("joinRoom", receiverId);
    }

    window.currentReceiverId = receiverId;
    window.currentChatPage = 1;
    window.hasMoreChatMessages = true;
    window.isFetchingChat = false;

    const messagesContainer = document.getElementById("chatMessages");
    messagesContainer.innerHTML =
      '<div class="loading">Loading messages...</div>';

    if (window.chatScrollHandler) {
      messagesContainer.removeEventListener("scroll", window.chatScrollHandler);
    }

    const data = await window.fetchChatMessages(
      receiverId,
      window.currentChatPage,
    );

    messagesContainer.innerHTML = "";

    const user = JSON.parse(localStorage.getItem("user"));
    const messages = Array.isArray(data)
      ? data
      : data?.messages || data?.data || [];

    if (messages.length < 10) {
      window.hasMoreChatMessages = false;
    }

    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(a.createdAt || a.timestamp) -
        new Date(b.createdAt || b.timestamp),
    );

    sortedMessages.forEach((msg) => {
      const msgDiv = document.createElement("div");
      const isMine = msg.senderId === user?.id;
      msgDiv.className = `message ${isMine ? "outgoing" : "incoming"}`;
      const timeStr =
        msg.createdAt || msg.timestamp
          ? formatTimeAgo(new Date(msg.createdAt || msg.timestamp))
          : "";
      const senderStr = isMine ? "" : msg.sender?.name || msg.senderName || "";
      msgDiv.innerHTML = `
      ${senderStr ? `<div class="msg-name" style="font-size: 0.75em; opacity: 0.8; margin-bottom: 2px;">${senderStr}</div>` : ""}
      <div class="msg-content">${msg.content}</div>
      ${timeStr ? `<div class="msg-time" style="font-size: 0.7em; opacity: 0.6; margin-top: 2px; text-align: right;">${timeStr}</div>` : ""}
      `;
      messagesContainer.appendChild(msgDiv);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    window.chatScrollHandler = async function () {
      if (
        messagesContainer.scrollTop === 0 &&
        window.hasMoreChatMessages &&
        !window.isFetchingChat
      ) {
        window.isFetchingChat = true;
        window.currentChatPage++;

        const oldHeight = messagesContainer.scrollHeight;

        const loadingDiv = document.createElement("div");
        loadingDiv.className = "loading";
        loadingDiv.innerText = "Loading...";
        messagesContainer.prepend(loadingDiv);

        const moreData = await window.fetchChatMessages(
          receiverId,
          window.currentChatPage,
        );
        const moreMessages = Array.isArray(moreData)
          ? moreData
          : moreData?.messages || moreData?.data || [];

        messagesContainer.removeChild(loadingDiv);

        if (moreMessages.length < 10) {
          window.hasMoreChatMessages = false;
        }

        const sortedMore = moreMessages.sort(
          (a, b) =>
            new Date(a.createdAt || a.timestamp) -
            new Date(b.createdAt || b.timestamp),
        );

        sortedMore.reverse().forEach((msg) => {
          const msgDiv = document.createElement("div");
          const isMine = msg.senderId === user?.id;
          msgDiv.className = `message ${isMine ? "outgoing" : "incoming"}`;
          const timeStr =
            msg.createdAt || msg.timestamp
              ? formatTimeAgo(new Date(msg.createdAt || msg.timestamp))
              : "";
          const senderStr = isMine
            ? ""
            : msg.sender?.name || msg.senderName || "";
          msgDiv.innerHTML = `
          ${senderStr ? `<div class="msg-name" style="font-size: 0.75em; opacity: 0.8; margin-bottom: 2px;">${senderStr}</div>` : ""}
          <div class="msg-content">${msg.content}</div>
          ${timeStr ? `<div class="msg-time" style="font-size: 0.7em; opacity: 0.6; margin-top: 2px; text-align: right;">${timeStr}</div>` : ""}
          `;
          messagesContainer.prepend(msgDiv);
        });

        const newHeight = messagesContainer.scrollHeight;
        messagesContainer.scrollTop = newHeight - oldHeight;

        window.isFetchingChat = false;
      }
    };

    messagesContainer.addEventListener("scroll", window.chatScrollHandler);
  }
};

window.closeChatPopup = function closeChatPopup() {
  const popup = document.getElementById("chatPopup");
  if (popup) {
    popup.style.display = "none";
  }
};

window.sendPopupMessage = function sendPopupMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (text) {
    if (window.chatSocket) {
      const messageData = {
        groupId: window.currentReceiverId,
        content: text,
      };
      window.chatSocket.emit("sendMessage", messageData, () => {});
    }

    const messagesContainer = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "message outgoing";
    const timeStr = formatTimeAgo(new Date());
    msgDiv.innerHTML = `
    <div class="msg-content">${text}</div>
    <div class="msg-time" style="font-size: 0.7em; opacity: 0.6; margin-top: 2px; text-align: right;">${timeStr}</div>
    `;
    messagesContainer.appendChild(msgDiv);
    input.value = "";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};
