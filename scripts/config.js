const API_URL = "https://mini-blog-32rh.onrender.com";
// const API_URL = "http://localhost:3000";

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch(...args);
  if (response.status === 503) {
    const currentPath = window.location.pathname.split("/").pop();
    let isAdmin = false;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const roles = user.roles || user.role;
        if (roles) {
          isAdmin =
            typeof roles === "string"
              ? roles.toLowerCase().includes("admin")
              : roles.includes("admin");
        }
      }
    } catch (e) {}

    if (
      currentPath !== "login.html" &&
      currentPath !== "maintenance.html" &&
      currentPath !== "admin-maintenance.html" &&
      !isAdmin
    ) {
      window.location.href = "maintenance.html";
      return new Promise(() => {});
    }
  }
  return response;
};
