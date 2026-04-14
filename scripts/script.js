async function LoadLayout() {
  const headerResponse = await fetch("./components/header.html");
  const headerData = await headerResponse.text();
  document.getElementById("header").innerHTML = headerData;
  stateRightHeader();
  hightLightCurrentPage();
}
function hightLightCurrentPage() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
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
      <span class="user-name">Xin chào, ${JSON.parse(localStorage.getItem("user")).name}</span>
      <a href="#" class="nav-item" id="logout">Đăng xuất</a>
    `;
    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      stateRightHeader();
    });
  } else {
    rightHeader.innerHTML = `
       <a href="/login.html" class="btn">Đăng nhập</a>
       <a href="/register.html" class="btn reg-btn">Đăng ký</a>
    `;
  }
}
window.onload = LoadLayout;

function openModal() {
  if (!localStorage.getItem("token")) {
    showToast("error", "Bạn cần đăng nhập để đăng bài viết");
    return;
  }
  const modal = document.querySelector(".modal");
  modal.style.display = "block";
}
function closeModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = "none";
}
const API_URL = "http://localhost:3000";
let currentPage = 1;
let totalPage = 1;

function getPosts(limit = 5, page = 1) {
  fetch(`${API_URL}/posts?limit=${limit}&page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      const postsContainer = document.getElementById("posts");
      if (!postsContainer) return;
      postsContainer.innerHTML = "";
      renderPagination(data.total, limit, page);
      data.items.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
        <div class='post-header'>
        <div class='author-info'>
        <img src='../assets/img/avt.jpg' alt='Avatar' class='avatar' height='50' width='50'/  >
        <h3 class='author'>${post.author.name}</h3>
          </div>
        <p class='created-at'>${new Date(post.createdAt).toLocaleString()}</p>
        </div>
          <h2 class='title'>${post.title}</h2>
          <p class='content'>${post.content.substring(0, 100)}...</p>
        `;
        postsContainer.appendChild(postElement);
        postElement.addEventListener("click", () => {
          window.location.href = `/post-detail.html?slug=${post.slug}`;
        });
      });
    });
}

function renderPagination(total, limit, page) {
  totalPage = Math.ceil(total / limit);
  const pageInfo = document.getElementById("page-info");
  pageInfo.innerText = "";
  for (let i = 1; i <= totalPage; i++) {
    if (i === 1 || i === totalPage || (i >= page - 1 && i <= page + 1)) {
      const pageBtn = document.createElement("button");
      pageBtn.classList.add("page-btn");
      pageBtn.innerText = i;
      if (i === page) {
        pageBtn.classList.add("active");
      }
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        getPosts(
          document.querySelector(".pagination select").value,
          currentPage,
        );
      });
      pageInfo.appendChild(pageBtn);
      ``;
    } else if (i === page - 2 || i === page + 2) {
      const dots = document.createElement("span");
      dots.innerText = "...";
      pageInfo.appendChild(dots);
    }
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    getPosts(document.querySelector(".pagination select").value, currentPage);
  }
}
function nextPage() {
  if (currentPage < totalPage) {
    currentPage++;
    getPosts(document.querySelector(".pagination select").value, currentPage);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  getPosts();
});
const limitSelect = document.querySelector(".pagination select");
if (limitSelect) {
  limitSelect.addEventListener("change", () => {
    currentPage = 1;
    getPosts(limitSelect.value, currentPage);
  });
}

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

async function submitPost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user")).id;
  if (!token) {
    showToast("error", "Bạn cần đăng nhập để đăng bài viết");
    return;
  }
  const body = {
    title: title,
    content: content,
    authorId: userId,
  };
  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showToast("success", "Đăng bài viết thành công!");
      closeModal();
      getPosts(document.querySelector(".pagination select").value, currentPage);
    }
  } catch (error) {
    showToast("error", error);
  }
}
