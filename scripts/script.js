async function LoadLayout() {
  const headerResponse = await fetch("./components/header.html");
  const headerData = await headerResponse.text();
  document.getElementById("header").innerHTML = headerData;
  await stateRightHeader();
  hightLightCurrentPage();
  updateLangFlag();
  if (typeof updateContent === "function") {
    updateContent();
  }
}

function updateLangFlag() {
  const lang = localStorage.getItem("lang") || "vi";
  const imgLang = {
    en: "https://flagcdn.com/w20/us.png",
    ja: "https://flagcdn.com/w20/jp.png",
    vi: "https://flagcdn.com/w20/vn.png",
  };
  const btnImg = document.querySelector("#change-lang img");
  if (imgLang[lang] && btnImg) {
    btnImg.src = imgLang[lang];
  }
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

async function stateRightHeader() {
  const rightHeader = document.querySelector(".right-header");
  const ac = getCookie("ac");
  if (ac) {
    const user = await getMe(ac);
    rightHeader.innerHTML = `
      <span class="user-name">${user.name}</span>
      <a href="#" class="nav-item" id="logout" data-i18n="auth.logout">Đăng xuất</a>
    `;
    document.getElementById("logout").addEventListener("click", () => {
      document.cookie = "ac=; path=/; max-age=0; secure; samesite=strict";
      localStorage.removeItem("user");
      stateRightHeader();
    });
  } else {
    rightHeader.innerHTML = `
       <a href="login.html" class="btn" data-i18n="auth.login">Đăng nhập</a>
       <a href="register.html" class="btn reg-btn" data-i18n="auth.register">Đăng ký</a>
    `;
  }
}
window.onload = LoadLayout;

function openModal() {
  if (!getCookie("ac")) {
    showToast("error", "Bạn cần đăng nhập để đăng bài viết");
    return;
  }
  const modal = document.querySelector(".modal");
  modal.style.display = "block";
}
function closeModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = "none";
  const titleInput = document.getElementById("post-title");
  const contentInput = document.getElementById("post-content");
  const thumbnailInput = document.getElementById("post-thumbnail");
  const thumbnailPreview = document.getElementById("thumbnail-preview");
  titleInput.value = "";
  contentInput.value = "";
  thumbnailInput.value = "";
  thumbnailPreview.innerHTML = "";
}

function previewImage() {
  const fileInput = document.getElementById("post-thumbnail");
  const preview = document.getElementById("thumbnail-preview");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="preview-img" />`;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
  }
}

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
            <img src='./assets/img/avt.jpg' alt='Avatar' class='avatar' height='50' width='50'/>
            <h3 class='author'>${post.author.name}</h3>
          </div>
          <p class='created-at' data-timestamp='${post.createdAt}'>${formatTimeAgo(post.createdAt)}</p>
        </div>
        <div class='post-body'>
          <img src='${post.thumbnail ? API_URL + post.thumbnail : "./assets/img/image.png"}' alt='Thumbnail' class='thumbnail'/>
          <div class='post-info'>
            <h2 class='title'>${post.title}</h2>
            <p class='content'>${post.content.substring(0, 100)}...</p>
          </div>
        </div>
        `;
        postsContainer.appendChild(postElement);
        postElement.addEventListener("click", () => {
          window.location.href = `post-detail.html?slug=${post.slug}`;
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

document.addEventListener("DOMContentLoaded", () => {
  validateInput(document.getElementById("post-title"));
  validateInput(document.getElementById("post-content"));
});

async function submitPost() {
  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();
  const thumbnailInput = document.getElementById("post-thumbnail");
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  if (!userId) {
    showToast("error", "Bạn cần đăng nhập để đăng bài viết");
    return;
  }

  if (!title || !content) {
    showToast("error", "Vui lòng nhập tiêu đề và nội dung");
    return;
  }

  const cancelBtn = document.querySelector(".cancel-btn");
  const submitBtn = document.querySelector(".submit-btn");
  cancelBtn.disabled = true;
  btnLoading.start(submitBtn);

  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("authorId", userId);

    if (thumbnailInput.files.length > 0) {
      formData.append("thumbnail", thumbnailInput.files[0]);
    }

    const res = await fetchWithAuth(`${API_URL}/posts`, {
      method: "POST",
      body: formData,
    });

    if (!res) return;

    if (res.ok) {
      showToast("success", "Đăng bài viết thành công!");
      closeModal();
      getPosts(document.querySelector(".pagination select").value, currentPage);
    } else {
      showToast("error", "Đăng bài viết thất bại");
    }
  } catch (error) {
    showToast("error", error);
  } finally {
    btnLoading.stop(submitBtn);
    cancelBtn.disabled = false;
  }
}

function displayMenu() {
  const menu = document.querySelector(".menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("#dropdown-content a");
  if (link) {
    e.preventDefault();
    const lang = link.getAttribute("data-lang");
    const imgLang = {
      en: "https://flagcdn.com/w20/us.png",
      vi: "https://flagcdn.com/w20/vn.png",
      jp: "https://flagcdn.com/w20/jp.png",
    };

    const btnImg = document.querySelector("#change-lang img");
    if (imgLang[lang] && btnImg) {
      btnImg.src = imgLang[lang];
    }

    if (typeof changeLanguage === "function") {
      changeLanguage(lang);
    }
  }
});
