async function LoadLayout() {
  const headerResponse = await fetch("./components/header.html");
  const headerData = await headerResponse.text();
  const headerContainer = document.getElementById("header");
  if (headerContainer) {
    headerContainer.innerHTML = headerData;
  }

  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    const footerResponse = await fetch("./components/footer.html");
    const footerData = await footerResponse.text();
    footerContainer.innerHTML = footerData;
  }

  const isLoggedIn = !!getCookie("ac");

  if (isLoggedIn) {
    const chatResponse = await fetch("./components/chats.html");
    const chatModalResponse = await fetch("./components/chat-modal.html");
    const chatData = await chatResponse.text();

    const chatsContainer = document.getElementById("chats");
    if (chatsContainer) {
      chatsContainer.innerHTML = chatData;
    }

    const chatModalData = await chatModalResponse.text();
    const modalContainer = document.createElement("div");
    modalContainer.innerHTML = chatModalData;
    document.body.appendChild(modalContainer);

    if (typeof window.setupChatPopupDelegation === "function") {
      window.setupChatPopupDelegation();
    }
  } else {
    const chatsContainer = document.getElementById("chats");
    if (chatsContainer) chatsContainer.style.display = "none";
    document.body.classList.add("no-sidebar");
  }

  await stateRightHeader();
  hightLightCurrentPage();
  updateLangFlag();
  if (typeof updateContent === "function") {
    updateContent();
  }
  fetchHeaderTopics();
}

function fetchHeaderTopics() {
  const dropdown = document.getElementById("header-topics-dropdown");
  if (!dropdown) return;

  const headers = {};
  const ac = getCookie("ac");
  if (ac) headers["Authorization"] = `Bearer ${ac}`;

  fetch(`${API_URL}/topics`, { headers })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) {
        dropdown.innerHTML = "";
        return;
      }
      let topics = [];
      if (Array.isArray(data)) topics = data;
      else if (data.items) topics = data.items;

      dropdown.innerHTML = "";
      topics.forEach((t) => {
        const name = typeof t === "string" ? t : t.name || t.title || "";
        if (!name) return;
        const a = document.createElement("a");
        a.href = `#`;
        a.textContent = name;
        a.onclick = (e) => {
          e.preventDefault();
          if (typeof getPosts === "function") {
            window.location.href = `index.html?topic=${encodeURIComponent(name)}`;
          }
        };
        dropdown.appendChild(a);
      });

      if (topics.length === 0) dropdown.innerHTML = "";
    })
    .catch(() => {
      if (dropdown) dropdown.innerHTML = "";
    });
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
      <div class="user-dropdown dropdown">
        <div class="user-avatar-btn change-lang dropdown-toggle" style="width: auto; padding: 4px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <span class="user-name" style="margin: 0;">${window.escapeHTML(user.name)}</span>
          <img src="${user.avatar ? API_URL + user.avatar : "./assets/img/avt.jpg"}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"/>
        </div>
        <div class="dropdown-content user-dropdown-content" style="min-width: 180px; top: 110%; right: 0;">
          <a href="profile.html" class="dropdown-item" data-i18n="user.editProfile">Sửa thông tin</a>
          <a href="profile.html?tab=password" class="dropdown-item" data-i18n="user.changePassword">Đổi mật khẩu</a>
          <a href="#" class="dropdown-item" id="logout" data-i18n="auth.logout" style="color: #d32f2f;">Đăng xuất</a>
        </div>
      </div>
    `;
    document.getElementById("logout").addEventListener("click", () => {
      document.cookie = "ac=; path=/; max-age=0; secure; samesite=strict";
      localStorage.removeItem("user");
      stateRightHeader();
    });

    const createPostElem = document.querySelector(".create-post");
    if (createPostElem) {
      createPostElem.style.display = "flex";
    }
  } else {
    rightHeader.innerHTML = `
       <a href="login.html" class="btn" data-i18n="auth.login">Đăng nhập</a>
       <a href="register.html" class="btn reg-btn" data-i18n="auth.register">Đăng ký</a>
    `;
    const createPostElem = document.querySelector(".create-post");
    if (createPostElem) {
      createPostElem.style.display = "none";
    }
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
  populateTopicSelect();
}

function populateTopicSelect() {
  const select = document.getElementById("post-topic");
  if (!select) return;

  // Nếu đã có options (ngoài placeholder) thì không cần fetch lại
  if (select.options.length > 1) return;

  const headers = {};
  const ac = getCookie("ac");
  if (ac) headers["Authorization"] = `Bearer ${ac}`;

  // Hiển thị trạng thái loading
  const loadingOption = document.createElement("option");
  loadingOption.value = "";
  loadingOption.disabled = true;
  loadingOption.textContent = "Đang tải chủ đề...";
  select.appendChild(loadingOption);

  fetch(`${API_URL}/topics`, { headers })
    .then((res) => (res.ok ? res.json() : []))
    .then((data) => {
      // Xoá option loading
      loadingOption.remove();

      let topics = [];
      if (Array.isArray(data)) topics = data;
      else if (data?.items) topics = data.items;

      topics.forEach((t) => {
        const id = typeof t === "object" ? t.id : t;
        const name = typeof t === "object" ? t.name || t.title || "" : t;
        if (!name) return;
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        select.appendChild(option);
      });
    })
    .catch(() => {
      loadingOption.remove();
    });
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
let currentSearch = "";
let currentTopic = "All";
let searchDebounceTimer = null;
let topicsLoaded = false;
let cachedTopics = [];
function showSkeletonLoading(container, count = 6) {
  container.innerHTML = "";
  const topicsPlaceholder = document.createElement("div");
  const searchPlaceholder = document.createElement("div");
  searchPlaceholder.className = "skeleton-search";
  topicsPlaceholder.className = "topics-bar skeleton-topics";
  for (let i = 0; i < 6; i++) {
    const pill = document.createElement("div");
    pill.className = "skeleton-pill";
    topicsPlaceholder.appendChild(pill);
  }
  container.appendChild(topicsPlaceholder);

  const layout = document.createElement("div");
  layout.className = "posts-layout";
  const grid = document.createElement("div");
  grid.className = "grid-column";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>`;
    grid.appendChild(card);
  }
  layout.appendChild(grid);
  container.appendChild(layout);
}

function getTopicLabel(topic) {
  if (topic === "All" || !topic) return "All";
  return typeof topic === "string" ? topic : topic.name;
}
function getTopicId(topic) {
  if (topic === "All" || !topic) return null;
  return typeof topic === "object" ? topic.id : topic;
}
function isSameTopic(a, b) {
  if (a === "All" && b === "All") return true;
  if (a === "All" || b === "All") return false;
  const idA = typeof a === "object" ? a.id : a;
  const idB = typeof b === "object" ? b.id : b;
  return idA === idB;
}

function renderTopicsBar(container, topicsList) {
  const existing = container.querySelector(".topics-bar");
  if (existing) existing.remove();

  const topicsBar = document.createElement("div");
  topicsBar.className = "topics-bar";

  const allItems = ["All", ...topicsList];
  allItems.forEach((topic) => {
    const label = getTopicLabel(topic);
    const btn = document.createElement("button");
    btn.className = `topic-btn${isSameTopic(topic, currentTopic) ? " active" : ""}`;
    btn.innerText = label;
    btn.addEventListener("click", () => {
      currentTopic = topic;
      currentPage = 1;
      const url = new URL(window.location);
      const id = getTopicId(topic);
      if (!id) url.searchParams.delete("topicId");
      else url.searchParams.set("topicId", id);
      window.history.replaceState({}, "", url);
      getPosts(document.querySelector(".pagination select")?.value || 6, 1);
    });
    topicsBar.appendChild(btn);
  });

  const controlsBar = document.createElement("div");
  controlsBar.className = "post-controls";
  controlsBar.style.display = "flex";
  controlsBar.style.justifyContent = "space-between";
  controlsBar.style.alignItems = "center";
  controlsBar.style.flexWrap = "wrap";
  controlsBar.style.gap = "16px";
  controlsBar.style.marginBottom = "22px";

  // Update topicsBar to remove its bottom margin since container manages it
  topicsBar.style.borderBottom = "none";
  topicsBar.style.marginBottom = "0";

  controlsBar.appendChild(topicsBar);

  const searchBar = document.createElement("div");
  searchBar.className = "search-bar";
  searchBar.innerHTML = `
    <input type="text" placeholder="Tìm kiếm bài viết..." data-i18n-placeholder="header.searchPlaceholder" value="${window.escapeHTML(currentSearch)}" id="search-input"/>
    <button id="search-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" height="18" width="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
  `;
  controlsBar.appendChild(searchBar);

  const layout = container.querySelector(".posts-layout");
  if (layout) container.insertBefore(controlsBar, layout);
  else container.prepend(controlsBar);

  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearTimeout(searchDebounceTimer);
        executeSearch(e.target.value.trim(), true);
      }
    });
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      clearTimeout(searchDebounceTimer);
      executeSearch(searchInput.value.trim(), true);
    });
  }
}

function loadTopicsBar(container, headers) {
  if (topicsLoaded && cachedTopics.length > 0) {
    renderTopicsBar(container, cachedTopics);
    return;
  }
  fetch(`${API_URL}/topics`, { headers })
    .then((res) => (res.ok ? res.json() : []))
    .then((topicsData) => {
      let fetched = [];
      if (Array.isArray(topicsData)) fetched = topicsData;
      else if (topicsData?.items) fetched = topicsData.items;
      cachedTopics = fetched.filter(
        (t) => t && (t.name || typeof t === "string"),
      );
      topicsLoaded = true;
      renderTopicsBar(container, cachedTopics);
    })
    .catch(() => renderTopicsBar(container, []));
}

function renderPostCard(post) {
  const card = document.createElement("div");
  card.className = "grid-card";
  const formattedDate = formatTimeAgo(new Date(post.createdAt));

  const authorName = post.author?.name || "Anonymous";
  const initials = authorName.charAt(0).toUpperCase();

  const topicName =
    post.topic?.name || (typeof post.topic === "string" ? post.topic : null);
  const topicTag = topicName
    ? `<span class="card-topic-tag">${window.escapeHTML(topicName)}</span>`
    : "";

  const thumbnail =
    post.thumbnail || `https://picsum.photos/seed/${post.id}/400/220`;

  card.innerHTML = `
    <div class="card-image">
      <img src="${thumbnail}" alt="${window.escapeHTML(post.title)}" loading="lazy" onerror="this.src='https://picsum.photos/seed/${post.id}/400/220'"/>
      <div class="card-title-overlay">${window.escapeHTML(post.title)}</div>
      ${topicTag}
    </div>
    <div class="card-content">
      <div class="card-author">
        <div class="author-initials">${initials}</div>
        <div class="author-name-date">
          <strong>${window.escapeHTML(authorName)}</strong>
          <span>${formattedDate}</span>
        </div>
      </div>
      <p class="card-text">${window.escapeHTML(post.content || "").substring(0, 120)}…</p>
    </div>`;
  card.addEventListener("click", () => {
    window.location.href = `post-detail.html?slug=${post.slug}`;
  });
  return card;
}

function renderEmptyState(grid, search, topic) {
  grid.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="#b5def8" stroke-width="1.5" width="64" height="64"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <h3>Không tìm thấy bài viết</h3>
      <p>${search ? `Không có kết quả cho "<strong>${window.escapeHTML(search)}</strong>"` : topic !== "All" ? `Chưa có bài viết trong chủ đề <strong>${window.escapeHTML(topic)}</strong>` : "Chưa có bài viết nào."}</p>
    </div>`;
}

function getPosts(
  limit = 6,
  page = 1,
  search = currentSearch,
  topic = currentTopic,
) {
  currentSearch = search;
  currentTopic = topic;

  const token = getCookie("ac");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const postsContainer = document.getElementById("posts");
  if (!postsContainer) return;

  showSkeletonLoading(postsContainer, parseInt(limit));

  const topicId = getTopicId(topic);
  let url = `${API_URL}/posts?limit=${limit}&page=${page}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (topicId) url += `&topicId=${encodeURIComponent(topicId)}`;

  const browserUrl = new URL(window.location);
  if (search) browserUrl.searchParams.set("search", search);
  else browserUrl.searchParams.delete("search");
  window.history.replaceState({}, "", browserUrl);

  fetch(url, { headers })
    .then((res) => res.json())
    .then((data) => {
      postsContainer.innerHTML = "";
      renderPagination(data.total, limit, page);

      loadTopicsBar(postsContainer, headers);

      const layoutContainer = document.createElement("div");
      layoutContainer.className = "posts-layout";
      const gridCol = document.createElement("div");
      gridCol.className = "grid-column";
      layoutContainer.appendChild(gridCol);
      postsContainer.appendChild(layoutContainer);

      if (!data.items || data.items.length === 0) {
        renderEmptyState(gridCol, search, getTopicLabel(topic));
        return;
      }

      data.items.forEach((post) => gridCol.appendChild(renderPostCard(post)));
    })
    .catch((err) => {
      console.error("Error fetching posts:", err);
      if (postsContainer)
        postsContainer.innerHTML = `<div class="empty-state"><p>Không thể tải bài viết. Vui lòng thử lại.</p></div>`;
    });
}

function renderPagination(total, limit, page) {
  totalPage = Math.ceil(total / limit);
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;
  pageInfo.innerHTML = "";

  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  if (prevBtn) prevBtn.disabled = page <= 1;
  if (nextBtn) nextBtn.disabled = page >= totalPage;

  for (let i = 1; i <= totalPage; i++) {
    if (i === 1 || i === totalPage || (i >= page - 1 && i <= page + 1)) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `page-btn${i === page ? " active" : ""}`;
      pageBtn.innerText = i;
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        getPosts(
          document.querySelector(".pagination select")?.value || 6,
          currentPage,
        );
        window.scrollTo({
          top: document.getElementById("posts")?.offsetTop - 100,
          behavior: "smooth",
        });
      });
      pageInfo.appendChild(pageBtn);
    } else if (i === page - 2 || i === page + 2) {
      const dots = document.createElement("span");
      dots.className = "page-dots";
      dots.innerText = "…";
      pageInfo.appendChild(dots);
    }
  }
}

function executeSearch(searchValue, forceRedirect = false) {
  const postsContainer = document.getElementById("posts");
  if (!postsContainer) {
    if (forceRedirect) {
      window.location.href = `index.html?search=${encodeURIComponent(searchValue)}`;
    }
    return;
  }
  currentPage = 1;
  getPosts(
    document.querySelector(".pagination select")?.value || 6,
    1,
    searchValue,
  );
}

function setupSearch() {
  const headerSearch = document.getElementById("header-search-input");
  if (headerSearch) {
    if (currentSearch) {
      headerSearch.value = currentSearch;
    }
    headerSearch.addEventListener("input", (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        executeSearch(e.target.value.trim(), false);
      }, 400);
    });
    headerSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearTimeout(searchDebounceTimer);
        executeSearch(e.target.value.trim(), true);
      }
    });

    const searchBtn = document.getElementById("header-search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        clearTimeout(searchDebounceTimer);
        executeSearch(headerSearch.value.trim(), true);
      });
    }
  }
}

function updateCreatePostAvatar() {
  const avtImg = document.querySelector(".create-post .avt");
  if (!avtImg) return;
  const token = getCookie("ac");
  if (!token) return;
  getMe(token)
    .then((user) => {
      if (user?.avatar) avtImg.src = `${API_URL}${user.avatar}`;
    })
    .catch(() => {});
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    getPosts(
      document.querySelector(".pagination select")?.value || 6,
      currentPage,
    );
    window.scrollTo({
      top: document.getElementById("posts")?.offsetTop - 100,
      behavior: "smooth",
    });
  }
}
function nextPage() {
  if (currentPage < totalPage) {
    currentPage++;
    getPosts(
      document.querySelector(".pagination select")?.value || 6,
      currentPage,
    );
    window.scrollTo({
      top: document.getElementById("posts")?.offsetTop - 100,
      behavior: "smooth",
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("topic")) currentTopic = urlParams.get("topic");
  if (urlParams.get("search")) currentSearch = urlParams.get("search");

  getPosts(6, 1);
  updateCreatePostAvatar();
});

const limitSelect = document.querySelector(".pagination select");
if (limitSelect) {
  limitSelect.addEventListener("change", () => {
    currentPage = 1;
    getPosts(limitSelect.value, currentPage);
  });
}

let introSlideIndex = 1;
function showIntroSlides(n) {
  let i;
  let slides = document.getElementsByClassName("intro-slide");
  let dots = document.getElementsByClassName("intro-dot");
  if (!slides || slides.length === 0) return;
  if (n > slides.length) {
    introSlideIndex = 1;
  }
  if (n < 1) {
    introSlideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
    slides[i].classList.remove("active");
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }
  slides[introSlideIndex - 1].style.display = "block";
  slides[introSlideIndex - 1].classList.add("active");
  if (dots.length > 0) dots[introSlideIndex - 1].classList.add("active");
}
function plusIntroSlides(n) {
  showIntroSlides((introSlideIndex += n));
}
function currentIntroSlide(n) {
  showIntroSlides((introSlideIndex = n));
}
document.addEventListener("DOMContentLoaded", () => {
  showIntroSlides(introSlideIndex);
});

function showToast(type, message) {
  const ICONS = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };
  const TITLES = {
    success: "Thành công",
    error: "Lỗi",
    info: "Thông báo",
    warning: "Cảnh báo",
  };

  const safeType = ICONS[type] ? type : "info";

  const toast = document.createElement("div");
  toast.className = `toast ${safeType}`;

  const iconWrap = document.createElement("div");
  iconWrap.className = "toast-icon-wrap";
  iconWrap.innerHTML = ICONS[safeType];

  const body = document.createElement("div");
  body.className = "toast-body";

  const title = document.createElement("div");
  title.className = "toast-title";
  title.textContent = TITLES[safeType];

  const msg = document.createElement("div");
  msg.className = "toast-message";
  msg.textContent = message || "";

  body.appendChild(title);
  if (message) body.appendChild(msg);

  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.setAttribute("aria-label", "Close");

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";

  toast.appendChild(iconWrap);
  toast.appendChild(body);
  toast.appendChild(closeButton);
  toast.appendChild(progressBar);

  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });
  const duration = 5000;
  let width = 100;
  const stepTime = duration / 100;
  const progressInterval = setInterval(() => {
    width -= 1;
    progressBar.style.width = width + "%";
    if (width <= 0) clearInterval(progressInterval);
  }, stepTime);

  const dismiss = () => {
    clearInterval(progressInterval);
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
      if (toastContainer && toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 350);
  };
  closeButton.onclick = dismiss;
  setTimeout(dismiss, duration);
}

document.addEventListener("DOMContentLoaded", () => {
  const postTitle = document.getElementById("post-title");
  if (postTitle) validateInput(postTitle);

  const postContent = document.getElementById("post-content");
  if (postContent) validateInput(postContent);

  const chatInput = document.getElementById("chat-input");
  if (chatInput) validateInput(chatInput);
});

async function submitPost() {
  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();
  const thumbnailInput = document.getElementById("post-thumbnail");
  const topicSelect = document.getElementById("post-topic");
  const topicId = topicSelect?.value || "";
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
    if (topicId) formData.append("topicId", topicId);

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

function openGroupModal() {
  const modal = document.getElementById("group-modal");
  if (modal) {
    modal.style.display = "flex";
    document.getElementById("group-name").value = "";
    document.getElementById("member-search-input").value = "";
    const usersListContainer = document.getElementById("group-users-list");
    if (!usersListContainer) return;
    usersListContainer.innerHTML = "";

    const currentUser = JSON.parse(localStorage.getItem("user"));
    users.forEach((user) => {
      if (currentUser && user.id === currentUser.id) return;

      const label = document.createElement("label");
      label.className = "user-checkbox-item";
      label.innerHTML = `
            <input type="checkbox" value="${user.id}" data-name="${window.escapeHTML(user.name)}" class="group-member-checkbox">
            ${window.escapeHTML(user.name)}
          `;
      usersListContainer.appendChild(label);
    });
  }
}

function closeGroupModal() {
  const modal = document.getElementById("group-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function filterMembers(query) {
  const items = document.querySelectorAll(".user-checkbox-item");
  const lowerQuery = query.toLowerCase();

  items.forEach((item) => {
    const userName = item.textContent.trim().toLowerCase();
    if (userName.includes(lowerQuery)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

async function createGroup(type) {
  const groupName = document.getElementById("group-name").value.trim();

  if (!groupName) {
    if (typeof showToast === "function")
      showToast("error", "Group name is required");
    return;
  }

  const selectedCheckboxes = document.querySelectorAll(
    ".group-member-checkbox:checked",
  );
  const selectedMembers = Array.from(selectedCheckboxes).map((cb) => ({
    id: cb.value,
  }));

  if (selectedMembers.length < 2) {
    if (typeof showToast === "function")
      showToast("error", "Please select at least 2 members");
    return;
  }
  const btn = document.getElementById("create-group-btn");
  const cancelBtn = document.querySelector("#group-modal .btn-secondary");
  if (cancelBtn) cancelBtn.disabled = true;
  btn.disabled = true;
  btnLoading.start(btn);
  try {
    const token = await getCookie("ac");
    const response = await fetch(`${API_URL}/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: groupName,
        memberIds: selectedMembers.map((m) => m.id),
        type: type,
        senderId: JSON.parse(localStorage.getItem("user")).id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = "Failed to create group";
      if (errorData.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
      }
      throw new Error(errorMessage);
    }

    if (typeof showToast === "function") {
      showToast("success", "Group created successfully");
    }
    closeGroupModal();
  } catch (error) {
    console.error("Error:", error);
    if (typeof showToast === "function") {
      showToast(
        "error",
        error.message || "An error occurred while creating the group",
      );
    }
  } finally {
    btnLoading.stop(btn);
    btn.disabled = false;
    const cancelBtn = document.querySelector("#group-modal .btn-secondary");
    if (cancelBtn) cancelBtn.disabled = false;
  }
}

function getGroups() {
  const userItem = localStorage.getItem("user");
  if (!userItem) return;

  const userId = JSON.parse(userItem).id;
  const token = getCookie("ac");
  fetch(`${API_URL}/groups?userId=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      return res.json();
    })
    .then((data) => {
      const groupsContainer = document.getElementById("groups-list");
      if (!groupsContainer) return;
      groupsContainer.innerHTML = "";
      const groups = data.filter((group) => group.type === "public");
      groups.forEach((group) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "group";
        groupDiv.dataset.id = group.id;
        groupDiv.innerHTML = `
          <div class="logo">${window.escapeHTML(group.name).charAt(0).toUpperCase()}</div>
          <div class="name">${window.escapeHTML(group.name)}</div>
        `;
        groupsContainer.appendChild(groupDiv);
      });
    })
    .catch((err) => {
      console.error("Error fetching groups:", err);
    });
}

getGroups();
const users = [];
function getUsers() {
  const token = getCookie("ac");
  fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      return res.json();
    })
    .then((data) => {
      const usersContainer = document.getElementById("users-list");
      if (!usersContainer) return;
      usersContainer.innerHTML = "";
      const fetchedUsers = data.items || data;
      users.length = 0;
      fetchedUsers.forEach((user) => {
        users.push(user);
      });
      const currentUser = JSON.parse(localStorage.getItem("user"));
      users.forEach((user) => {
        if (currentUser && user.id === currentUser.id) return;
        const userDiv = document.createElement("div");
        userDiv.className = "user";
        userDiv.dataset.id = user.id;
        userDiv.innerHTML = `
          <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div class="name">${window.escapeHTML(user.name)}</div>
        `;
        usersContainer.appendChild(userDiv);
      });
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
    });
}

getUsers();

document.addEventListener("click", (e) => {
  const isDropdownToggle = e.target.closest(".dropdown-toggle");

  if (!isDropdownToggle) {
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.classList.remove("show");
    });
    return;
  }

  const currentDropdown = e.target.closest(".dropdown");
  if (currentDropdown) {
    const currentContent = currentDropdown.querySelector(".dropdown-content");
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      if (content !== currentContent) {
        content.classList.remove("show");
      }
    });
    if (currentContent) {
      currentContent.classList.toggle("show");
    }
  }
});
