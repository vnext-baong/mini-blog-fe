const btnLoading = {
  start(btnElement) {
    btnElement.classList.add("is-loading");
    btnElement.disabled = true;
  },
  stop(btnElement) {
    btnElement.classList.remove("is-loading");
    btnElement.disabled = false;
  },
};

const validateInput = (inputElement) => {
  inputElement.addEventListener("beforeinput", (e) => {
    if (e.data && !/^[0-9a-zA-Z]*$/.test(e.data)) {
      e.preventDefault();
    }
  });

  inputElement.addEventListener("input", (e) => {
    const value = e.target.value;
    if (!/^[0-9a-zA-Z]*$/.test(value)) {
      e.target.value = value.replace(/[^0-9a-zA-Z]/g, "");
    }
  });

  inputElement.addEventListener("paste", (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text",
    );
    if (!/^[0-9a-zA-Z]*$/.test(pastedText)) {
      e.preventDefault();
    }
  });
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  const intervals = [
    { label: "năm", seconds: 31536000 },
    { label: "tháng", seconds: 2592000 },
    { label: "ngày", seconds: 86400 },
    { label: "giờ", seconds: 3600 },
    { label: "phút", seconds: 60 },
    { label: "giây", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} trước`;
    }
  }

  return "vừa xong";
};

async function getMe(token) {
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      refreshToken();
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

async function refreshToken() {
  const refreshToken = getCookie("rf");
  if (!refreshToken) {
    showToast("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }
  try {
    const response = await fetch(`${API_URL}/tokens/access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (response.ok) {
      document.cookie = `ac=${data.accessToken}; path=/; max-age=3600; secure; samesite=strict`;
      return data.accessToken;
    } else {
      showToast("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    }
  } catch (error) {
    showToast("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
