document.addEventListener("DOMContentLoaded", () => {
  validateInput(document.getElementById("username"));
  validateInput(document.getElementById("name"));
  validateInput(document.getElementById("password"));
  validateInput(document.getElementById("confirm-password"));
  validateInput(document.getElementById("email"), "validation.emailRequired");
});

async function register() {
  const username = document.getElementById("username").value.trim();
  const name = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const email = document.getElementById("email").value.trim();

  document.getElementById("username-error").textContent = "";
  document.getElementById("name-error").textContent = "";
  document.getElementById("password-error").textContent = "";
  document.getElementById("confirm-password-error").textContent = "";
  document.getElementById("email-error").textContent = "";

  let hasError = false;

  if (!username) {
    document.getElementById("username-error").textContent = i18next.t(
      "validation.usernameRequired",
    );
    hasError = true;
  }

  if (!email) {
    document.getElementById("email-error").textContent = i18next.t(
      "validation.emailRequired",
    );
    hasError = true;
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById("email-error").textContent = i18next.t(
      "validation.emailInvalid",
    );
    hasError = true;
  }

  if (!name) {
    document.getElementById("name-error").textContent = i18next.t(
      "validation.nameRequired",
    );
    hasError = true;
  }

  if (!password) {
    document.getElementById("password-error").textContent = i18next.t(
      "validation.passwordRequired",
    );
    hasError = true;
  }
  if (password && password.length < 6) {
    document.getElementById("password-error").textContent = i18next.t(
      "validation.passwordLength",
    );
    hasError = true;
  }
  if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    document.getElementById("password-error").textContent = i18next.t(
      "validation.passwordStrength",
    );
    hasError = true;
  }

  if (!confirmPassword) {
    document.getElementById("confirm-password-error").textContent = i18next.t(
      "validation.confirmPasswordRequired",
    );
    hasError = true;
  }

  if (password && confirmPassword && password !== confirmPassword) {
    document.getElementById("confirm-password-error").textContent = i18next.t(
      "validation.passwordMismatch",
    );
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
      body: JSON.stringify({ username, name, password, email }),
    });
    const data = await response.json();
    if (response.ok) {
      showToast("success", i18next.t("toast.registerSuccess"));
      setTimeout(() => {
        window.location.href = "sent-email.html";
      }, 1000);
    } else {
      showToast("error", data.message || i18next.t("toast.registerFailure"));
    }
  } catch (error) {
    showToast("error", i18next.t("toast.registerFailure"));
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
