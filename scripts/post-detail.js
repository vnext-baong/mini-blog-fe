let postId;
async function getPostDetail() {
  try {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const res = await fetch(`${API_URL}/posts/${slug}`);
    if (res.ok) {
      const post = await res.json();
      const postDetail = document.getElementById("post-detail");
      postDetail.innerHTML = `
      <div class="breadcrumb">
        <a href="index.html" class="back-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> 
          Trang chủ
        </a>
      </div>
      <div class='post-header'>
        <h1 class="title">${window.escapeHTML(post.title)}</h1>
        <div class="post-meta">
          <div class="author-info">
            <img src="${post.author?.avatar ? API_URL + post.author.avatar : "./assets/img/avt.jpg"}" alt="Avatar" class="author-avatar" onerror="this.src='./assets/img/avt.jpg'"/>
            <span class="author-name">${window.escapeHTML(post.author?.name || "Ẩn danh")}</span>
          </div>
          <span class="created-at" data-timestamp="${post.createdAt}">• ${formatTimeAgo(post.createdAt)}</span>
        </div>
      </div>
      <img src='${post.thumbnail}' onerror="this.style.display='none'" alt='Thumbnail' class='thumbnail'/>
      <div class="content ql-snow"><div class="ql-editor">${post.content}</div></div>
    `;
      postId = post.id;
      if (typeof hljs !== "undefined") {
        document.querySelectorAll("pre").forEach((block) => {
          hljs.highlightElement(block);
        });
      }
      getComments();
    }
  } catch (error) {
    showToast("error", "Không thể tải bài viết");
  }
}
getPostDetail();
async function getComments() {
  try {
    const res = await fetch(`${API_URL}/comments/?postId=${postId}`);
    if (res.ok) {
      const comments = await res.json();
      console.log(comments);
      const commentList = document.getElementById("comments-list");
      commentList.innerHTML = "";
      comments.items.forEach((comment) => {
        const commentElement = document.createElement("div");
        commentElement.classList.add("comment");
        commentElement.innerHTML = `
        <div class='comment-header'>
          <img src='${comment.author?.avatar ? API_URL + comment.author.avatar : "./assets/img/avt.jpg"}' onerror="this.src='./assets/img/avt.jpg'" alt='Avatar' class='avatar' height='36' width='36'/>
          <p class="comment-author">${window.escapeHTML(comment.author?.name || "Ẩn danh")}</p>
          <span class="comment-created-at" data-timestamp="${comment.createdAt}">• ${formatTimeAgo(comment.createdAt)}</span>
        </div>
        <div class="comment-content">${window.escapeHTML(comment.content)}</div>
      `;
        commentList.appendChild(commentElement);
      });
      console.log(comments);
    }
  } catch (error) {
    showToast("error", "Không thể tải bình luận");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  validateInput(document.getElementById("comment-input"));
});

async function postComment() {
  const sendBtn = document.getElementById("submit-comment");
  const commentInput = document.getElementById("comment-input");
  sendBtn.disabled = true;
  btnLoading.start(sendBtn);
  try {
    const token = getCookie("ac");
    if (!token) {
      showToast("error", "Bạn cần đăng nhập để bình luận");
      return;
    }
    const content = commentInput.value.trim();
    if (!content) {
      showToast("error", "Nội dung bình luận không được để trống");
      return;
    }

    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    if (!userId) {
      showToast("error");
      return;
    }

    const res = await fetchWithAuth(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
        postId: postId,
        authorId: userId,
      }),
    });

    if (!res) return;

    if (res.ok) {
      commentInput.value = "";
      getComments();
    } else {
      showToast("error", "Bình luận thất bại");
    }
  } catch (error) {
    showToast("error", "Bình luận thất bại");
  } finally {
    btnLoading.stop(sendBtn);
    sendBtn.disabled = false;
  }
}
