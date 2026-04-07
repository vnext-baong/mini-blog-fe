async function LoadLayout() {
  const headerResponse = await fetch("/components/header.html");
  const headerData = await headerResponse.text();
  document.getElementById("header").innerHTML = headerData;
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

window.onload = LoadLayout;

function openModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = "block";
}
function closeModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = "none";
}

function getPosts() {
  fetch(`http://localhost:3000/posts`)
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
