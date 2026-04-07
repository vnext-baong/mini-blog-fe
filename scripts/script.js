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
