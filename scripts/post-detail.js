let postId;
async function getPostDetail() {
  try {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const res = await fetch(`${API_URL}/posts/${slug}`);
    if (res.ok) {
      const post = await res.json();
      const postDetail = document.getElementById("post-detail");
      postDetail.innerHTML = `
      <div class='post-header'>
        <h1 class="title">${post.title}</h1>
        <p class="created-at">${new Date(post.createdAt).toLocaleString()}</p>
      </div>
      <p class="content">${post.content}</p>
      <p class="author">${post.author.name}</p>
    `;
      postId = post.id;
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
        <img src='../assets/img/avt.jpg' alt='Avatar' class='avatar' height='30' width='30'/>
        <p class="comment-author">${comment.author.name}</p>
        <p class="comment-created-at">${new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        <p class="comment-content">${comment.content}</p>
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
    const commentInput = document.getElementById("comment-input");
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Bạn cần đăng nhập để bình luận");
      return;
    }
    const content = commentInput.value.trim();
    if (!content) {
      showToast("error", "Nội dung bình luận không được để trống");
      return;
    }

    const res = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: content,
        postId: postId,
        authorId: JSON.parse(localStorage.getItem("user")).id,
      }),
    });
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
