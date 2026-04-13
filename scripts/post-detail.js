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
    }
  } catch (error) {
    showToast("error", "Không thể tải bài viết");
  }
}

getPostDetail();
