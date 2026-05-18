window.addEventListener("DOMContentLoaded", () => {
  verifyEmail();
});

async function verifyEmail() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const statusMessage = document.getElementById("status-message");
  const spinner = document.getElementById("loading-spinner");

  if (!token) {
    if (spinner) spinner.style.display = "none";
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
      if (statusMessage)
        statusMessage.innerText =
          "Xác thực email thành công! Đang chuyển hướng đến trang đăng nhập...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    } else {
      const data = await response.json().catch(() => ({}));
      if (statusMessage)
        statusMessage.innerText =
          data.message ||
          "Xác thực email thất bại. Vui lòng thử lại hoặc link đã hết hạn.";
    }
  } catch (error) {
    if (spinner) spinner.style.display = "none";
    if (statusMessage)
      statusMessage.innerText = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
  }
}
