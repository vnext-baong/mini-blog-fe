async function register() {
  const username = document.getElementById("username").value.trim();
  const name = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  document.getElementById("username-error").textContent = "";
  document.getElementById("name-error").textContent = "";
  document.getElementById("password-error").textContent = "";
  document.getElementById("confirm-password-error").textContent = "";

  let hasError = false;

  if (!username) {
    document.getElementById("username-error").textContent =
      "Vui lòng nhập tên đăng nhập";
    hasError = true;
  }

  if (!name) {
    document.getElementById("name-error").textContent =
      "Vui lòng nhập họ và tên";
    hasError = true;
  }

  if (!password) {
    document.getElementById("password-error").textContent =
      "Vui lòng nhập mật khẩu";
    hasError = true;
  }

  if (!confirmPassword) {
    document.getElementById("confirm-password-error").textContent =
      "Vui lòng xác nhận mật khẩu";
    hasError = true;
  }

  if (password && confirmPassword && password !== confirmPassword) {
    document.getElementById("confirm-password-error").textContent =
      "Mật khẩu xác nhận không khớp";
    hasError = true;
  }

  if (hasError) {
    return;
  }
  btnLoading.start(document.querySelector(".submit-btn"));
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, name, password }),
    });
    const data = await response.json();
    if (response.ok) {
      showToast("success", "Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } else {
      showToast("error", data.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  } catch (error) {
    showToast("error", "Đăng ký thất bại. Vui lòng thử lại.");
  } finally {
    btnLoading.stop(document.querySelector(".submit-btn"));
  }
}

const toggleButtons = document.querySelectorAll(".toggle-password");
if (toggleButtons[0]) {
  toggleButtons[0].innerHTML = `<img
                src="./assets/icons/hide.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />`;
}
if (toggleButtons[1]) {
  toggleButtons[1].innerHTML = `<img
                src="./assets/icons/hide.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />`;
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.querySelector(".toggle-password");
  if (!passwordInput || !toggleBtn) return;

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

function toggleConfirmPassword() {
  const confirmPasswordInput = document.getElementById("confirm-password");
  const toggleBtn = document.querySelectorAll(".toggle-password")[1];
  if (!confirmPasswordInput || !toggleBtn) return;

  if (confirmPasswordInput.type === "password") {
    confirmPasswordInput.type = "text";
    toggleBtn.innerHTML = `<img
                src="./assets/icons/show.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />`;
  } else {
    confirmPasswordInput.type = "password";
    toggleBtn.innerHTML = `<img
                src="./assets/icons/hide.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />`;
  }
}
