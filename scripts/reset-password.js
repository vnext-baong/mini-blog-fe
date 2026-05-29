document.addEventListener("DOMContentLoaded", () => {
  validateInput(document.getElementById("password"));
  validateInput(document.getElementById("confirm-password"));
});

async function resetPassword() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  document.getElementById("password-error").textContent = "";
  document.getElementById("confirm-password-error").textContent = "";

  let hasError = false;

  if (!password) {
    document.getElementById("password-error").textContent = i18next.t(
      "validation.passwordRequired",
      "Vui lòng nhập mật khẩu",
    );
    hasError = true;
  }
  if (password && password.length < 6) {
    document.getElementById("password-error").textContent = i18next.t(
      "validation.passwordLength",
      "Mật khẩu phải có ít nhất 6 ký tự",
    );
    hasError = true;
  }
  if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    document.getElementById("password-error").textContent = i18next.t(
      "validation.passwordStrength",
      "Mật khẩu phải có ít nhất 1 chữ in hoa, 1 chữ thường và 1 chữ số",
    );
    hasError = true;
  }

  if (!confirmPassword) {
    document.getElementById("confirm-password-error").textContent = i18next.t(
      "validation.confirmPasswordRequired",
      "Vui lòng xác nhận mật khẩu",
    );
    hasError = true;
  }

  if (password && confirmPassword && password !== confirmPassword) {
    document.getElementById("confirm-password-error").textContent = i18next.t(
      "validation.passwordMismatch",
      "Mật khẩu xác nhận không khớp",
    );
    hasError = true;
  }

  if (hasError) {
    return;
  }
  btnLoading.start(document.querySelector(".submit-btn"));
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    console.log;

    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (response.ok) {
      showToast(
        "success",
        i18next.t("messages.resetSuccess", "Đặt lại mật khẩu thành công!"),
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      showToast(
        "error",
        data.message ||
          i18next.t("messages.resetError", "Đặt lại mật khẩu thất bại."),
      );
    }
  } catch (error) {
    showToast(
      "error",
      i18next.t("messages.resetError", "Đặt lại mật khẩu thất bại."),
    );
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
  const toggleBtn = document.querySelectorAll(".toggle-password")[0];
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
