async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (!username && !password) {
    document.getElementById("username-error").textContent =
      "Vui lòng nhập tên đăng nhập";
    document.getElementById("password-error").textContent =
      "Vui lòng nhập mật khẩu";
    return;
  } else if (!username) {
    document.getElementById("username-error").textContent =
      "Vui lòng nhập tên đăng nhập";
    return;
  } else if (!password) {
    document.getElementById("password-error").textContent =
      "Vui lòng nhập mật khẩu";
    return;
  } else {
    document.getElementById("username-error").textContent = "";
    document.getElementById("password-error").textContent = "";
  }

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.accessToken);
      showToast("success", "Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      showToast(
        "error",
        data.message || "Đăng nhập thất bại. Vui lòng thử lại.",
      );
    }
  } catch (error) {
    showToast("error", "Đăng nhập thất bại. Vui lòng thử lại.");
  }
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.innerHTML = `<img
                src="./assets/icons/show.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />`;
  } else {
    passwordInput.type = "password";
    toggleBtn.innerHTML = `<img
                src="./assets/icons/hide.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />`;
  }
}
document.querySelector(".toggle-password").innerHTML = `
 <img
                src="./assets/icons/hide.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />
`;
