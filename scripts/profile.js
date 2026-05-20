function openTab(evt, tabName) {
  var i, tabcontent, tabbuttons;
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tabbuttons = document.getElementsByClassName("tab-btn");
  for (i = 0; i < tabbuttons.length; i++) {
    tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.addEventListener("DOMContentLoaded", () => {
  setPasswordToggleIcon(".old-password-toggle");
  setPasswordToggleIcon(".new-password-toggle");
  setPasswordToggleIcon(".confirm-password-toggle");

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("tab") === "password") {
    const tabBtns = document.querySelectorAll(".tab-btn");
    if (tabBtns.length > 1) {
      tabBtns[1].click();
    }
  }
});

function setPasswordToggleIcon(selector) {
  const toggleBtn = document.querySelector(selector);
  if (!toggleBtn) return;

  toggleBtn.innerHTML = `
    <img
      src="./assets/icons/hide.png"
      alt="Toggle Password"
      height="20"
      width="20"
    />
  `;
}

function togglePasswordField(inputId, toggleSelector) {
  const passwordInput = document.getElementById(inputId);
  const toggleBtn = document.querySelector(toggleSelector);
  if (!passwordInput || !toggleBtn) return;

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.innerHTML = `
      <img
        src="./assets/icons/show.png"
        alt="Toggle Password"
        height="20"
        width="20"
      />
    `;
  } else {
    passwordInput.type = "password";
    toggleBtn.innerHTML = `
      <img
        src="./assets/icons/hide.png"
        alt="Toggle Password"
        height="20"
        width="20"
      />
    `;
  }
}

function toggleOldPassword() {
  togglePasswordField("old-password", ".old-password-toggle");
}

function toggleNewPassword() {
  togglePasswordField("new-password", ".new-password-toggle");
}

function toggleConfirmPassword() {
  togglePasswordField("confirm-password", ".confirm-password-toggle");
}

function clearChangePasswordErrors() {
  document.getElementById("old-password-error").textContent = "";
  document.getElementById("new-password-error").textContent = "";
  document.getElementById("confirm-password-error").textContent = "";
}

function resetChangePasswordForm() {
  const fields = ["old-password", "new-password", "confirm-password"];
  fields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (!input) return;
    input.value = "";
    input.type = "password";
  });

  setPasswordToggleIcon(".old-password-toggle");
  setPasswordToggleIcon(".new-password-toggle");
  setPasswordToggleIcon(".confirm-password-toggle");
}

async function changePass() {
  try {
    const currentPass = document.getElementById("old-password").value;
    const newPass = document.getElementById("new-password").value;
    const confirmPass = document.getElementById("confirm-password").value;

    clearChangePasswordErrors();

    let hasError = false;

    if (!currentPass.trim()) {
      document.getElementById("old-password-error").textContent = i18next.t(
        "validation.passwordRequired",
      );
      hasError = true;
    }

    if (!newPass.trim()) {
      document.getElementById("new-password-error").textContent = i18next.t(
        "validation.passwordRequired",
      );
      hasError = true;
    } else {
      if (newPass.length < 6) {
        document.getElementById("new-password-error").textContent = i18next.t(
          "validation.passwordMin",
        );
        hasError = true;
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPass)) {
        document.getElementById("new-password-error").textContent = i18next.t(
          "validation.passwordStrength",
        );
        hasError = true;
      }
    }

    if (!confirmPass.trim()) {
      document.getElementById("confirm-password-error").textContent = i18next.t(
        "validation.confirmPasswordRequired",
      );
      hasError = true;
    } else if (newPass && confirmPass && newPass !== confirmPass) {
      document.getElementById("confirm-password-error").textContent = i18next.t(
        "validation.passwordMismatch",
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const userStr = localStorage.getItem("user");
    const userId = userStr ? JSON.parse(userStr).id : null;

    const res = await fetchWithAuth(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: currentPass,
        newPassword: newPass,
        userId: userId,
      }),
    });
    if (!res) return;

    if (res.ok) {
      showToast("success", i18next.t("toast.password_changed_successfully"));
      resetChangePasswordForm();
    } else if (res.status === 400) {
      const data = await res.json();
      showToast(
        "error",
        data.message || i18next.t("toast.error_changing_password"),
      );
    } else {
      showToast("error", i18next.t("toast.error_changing_password"));
    }
  } catch (error) {
    showToast("error", i18next.t("toast.error_changing_password"));
  }
}
