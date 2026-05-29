document.addEventListener("DOMContentLoaded", () => {
  validateInput(document.getElementById("email"), "validation.emailRequired");
});

async function forgotPassword() {
  const email = document.getElementById("email").value.trim();
  document.getElementById("email-error").textContent = "";

  let hasError = false;

  if (!email) {
    document.getElementById("email-error").textContent = i18next.t(
      "validation.emailRequired",
      "Vui lòng nhập email"
    );
    hasError = true;
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById("email-error").textContent = i18next.t(
      "validation.emailInvalid",
      "Địa chỉ email không hợp lệ"
    );
    hasError = true;
  }

  if (hasError) {
    return;
  }
  btnLoading.start(document.querySelector(".submit-btn"));
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (response.ok) {
      showToast("success", i18next.t("messages.forgotSuccess", "Đã gửi liên kết đặt lại mật khẩu tới email của bạn."));
      setTimeout(() => {
        window.location.href = `sent-email.html?email=${encodeURIComponent(email)}`;
      }, 1500);
    } else {
      showToast("error", data.message || i18next.t("messages.forgotError", "Có lỗi xảy ra. Vui lòng thử lại."));
    }
  } catch (error) {
    showToast("error", i18next.t("messages.forgotError", "Có lỗi xảy ra. Vui lòng thử lại."));
  } finally {
    btnLoading.stop(document.querySelector(".submit-btn"));
  }
}
