window.addEventListener("DOMContentLoaded", () => {
  verifyEmail();
});

function showStatusIcon(type) {
  const iconDiv = document.getElementById("status-icon");
  if (!iconDiv) return;
  iconDiv.style.display = "block";
  if (type === "success") {
    iconDiv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    iconDiv.className = "status-icon";
  } else {
    iconDiv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    iconDiv.className = "status-icon error";
  }
}

async function verifyEmail() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const statusMessage = document.getElementById("status-message");
  const spinner = document.getElementById("loading-spinner");

  if (!token) {
    if (spinner) spinner.style.display = "none";
    showStatusIcon("error");
    if (statusMessage)
      statusMessage.innerText = "Mã xác thực không hợp lệ hoặc không tồn tại.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (spinner) spinner.style.display = "none";

    if (response.ok) {
      showStatusIcon("success");
      if (statusMessage)
        statusMessage.innerText =
          "Xác thực email thành công! Đang chuyển hướng đến trang đăng nhập...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    } else {
      showStatusIcon("error");
      const data = await response.json().catch(() => ({}));
      if (statusMessage)
        statusMessage.innerText =
          data.message ||
          "Xác thực email thất bại. Vui lòng thử lại hoặc link đã hết hạn.";
    }
  } catch (error) {
    if (spinner) spinner.style.display = "none";
    showStatusIcon("error");
    if (statusMessage)
      statusMessage.innerText = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
  }
}
