document.addEventListener("DOMContentLoaded", () => {
  const resendBtn = document.getElementById("resend-btn");
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  if (!email && resendBtn) {
    resendBtn.style.display = "none";
  }

  if (resendBtn && email) {
    resendBtn.addEventListener("click", () => {
      resendEmail(email);
    });

    const nextTime = localStorage.getItem(`resend_time_${email}`);
    if (nextTime) {
      const remaining = Math.ceil((parseInt(nextTime) - Date.now()) / 1000);
      if (remaining > 0) {
        startCountdown(resendBtn, remaining, email);
      }
    }
  } else {
    startCountdown(resendBtn, 60, email);
  }
});

let countdownTimer = null;

async function resendEmail(email) {
  if (!email) return;

  const resendBtn = document.getElementById("resend-btn");

  if (resendBtn.disabled) return;

  btnLoading.start(resendBtn);

  try {
    const token = getCookie("ac");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/auth/send-verify-email`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast(
        "success",
        i18next.t("messages.resendSuccess") || "Đã gửi lại email xác minh!",
      );
      startCountdown(resendBtn, 60, email);
    } else {
      showToast(
        "error",
        data.message ||
          i18next.t("messages.resendError") ||
          "Có lỗi xảy ra, vui lòng thử lại!",
      );
    }
  } catch (error) {
    console.error("Resend error:", error);
    showToast(
      "error",
      i18next.t("messages.resendError") || "Có lỗi xảy ra, vui lòng thử lại!",
    );
  } finally {
    btnLoading.stop(resendBtn);
  }
}

function startCountdown(button, seconds, email) {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  button.disabled = true;
  let remaining = seconds;

  const targetTime = Date.now() + seconds * 1000;
  localStorage.setItem(`resend_time_${email}`, targetTime);

  const originalText = button.dataset.i18n
    ? i18next.t(button.dataset.i18n) ||
      button.innerText.replace(/\s\(\d+s\)/, "")
    : button.innerText.replace(/\s\(\d+s\)/, "");

  button.innerText = `${originalText} (${remaining}s)`;

  countdownTimer = setInterval(() => {
    const now = Date.now();
    const savedTarget = parseInt(localStorage.getItem(`resend_time_${email}`));

    if (savedTarget) {
      remaining = Math.ceil((savedTarget - now) / 1000);
    } else {
      remaining--;
    }

    if (remaining <= 0) {
      clearInterval(countdownTimer);
      button.disabled = false;
      button.innerText = originalText;
      localStorage.removeItem(`resend_time_${email}`);
    } else {
      button.innerText = `${originalText} (${remaining}s)`;
    }
  }, 1000);
}
