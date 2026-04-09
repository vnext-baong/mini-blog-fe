async function LoadLayout() {
  const headerResponse = await fetch("./components/header.html");
  const headerData = await headerResponse.text();
  document.getElementById("header").innerHTML = headerData;
  stateRightHeader();
  hightLightCurrentPage();
}
function hightLightCurrentPage() {
  const currentPath =
    window.location.pathname.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-item");
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function stateRightHeader() {
  const rightHeader = document.querySelector(".right-header");
  const token = localStorage.getItem("token");
  if (token) {
    rightHeader.innerHTML = `
      <a href="#" class="nav-item" id="logout">Đăng xuất</a>
    `;
    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem("token");
      stateRightHeader();
      showToast("success", "Đã đăng xuất thành công!");
    });
  } else {
    rightHeader.innerHTML = `
       <a href="/login.html" class="btn">Đăng nhập</a>
       <a href="/pages/register.html" class="btn reg-btn">Đăng ký</a>
    `;
  }
}
window.onload = LoadLayout;

function openModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = "block";
}
function closeModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = "none";
}
const API_URL = "http://localhost:3000";
function getPosts() {
  fetch(`${API_URL}/posts`)
    .then((response) => response.json())
    .then((data) => {
      const postsContainer = document.getElementById("posts");
      console.log(data);
      data.items.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
          <h2 class='title'>${post.title}</h2>
          <p class='content'>${post.content}</p>
        `;
        postsContainer.appendChild(postElement);
      });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  getPosts();
});

function showToast(type, message) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const toastContent = document.createElement("span");
  toastContent.innerText = message;

  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
      if (toastContainer && toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  };

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";

  toast.appendChild(toastContent);
  toast.appendChild(closeButton);
  toast.appendChild(progressBar);

  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);
  let progressInterval;
  let width = 100;
  const duration = 10000;
  const stepTime = duration / 100;
  progressInterval = setInterval(() => {
    width--;
    progressBar.style.width = width + "%";
    if (width <= 0) {
      clearInterval(progressInterval);
    }
  }, stepTime);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
      if (toastContainer && toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, duration);
}
