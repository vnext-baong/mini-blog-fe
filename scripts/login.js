document.addEventListener("DOMContentLoaded", () => {
  validateInput(document.getElementById("username"));
  validateInput(document.getElementById("password"));
});

document.getElementById("password").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    login();
  }
});

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  document.getElementById("username-error").textContent = "";
  document.getElementById("password-error").textContent = "";
  let hasError = false;
  if (!username) {
    document.getElementById("username-error").textContent = i18next.t(
      "validation.usernameRequired",
    );
    hasError = true;
  }
  if (!password) {
    document.getElementById("password-error").textContent = i18next.t(
      "validation.passwordRequired",
    );
    hasError = true;
  }
  if (hasError) {
    return;
  }
  btnLoading.start(document.querySelector(".submit-btn"));
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      document.cookie = `ac=${data.accessToken}; path=/; max-age=3600; secure; samesite=strict`;
      document.cookie = `rf=${data.refreshToken}; path=/; max-age=604800; secure; samesite=strict`;
      const userData = await getMe(data.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      showToast("success", i18next.t("messages.loginSuccess"));
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      showToast("error", data.message || i18next.t("messages.loginError"));
    }
  } catch (error) {
    showToast("error", i18next.t("messages.loginError"));
  } finally {
    btnLoading.stop(document.querySelector(".submit-btn"));
  }
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

const loginTogglePassword = document.querySelector(".toggle-password");
if (loginTogglePassword) {
  loginTogglePassword.innerHTML = `
 <img
                src="./assets/icons/hide.png"
                alt="Toggle Password"
                height="20"
                width="20"
              />
`;
}
