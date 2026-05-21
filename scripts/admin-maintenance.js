document.addEventListener("DOMContentLoaded", async () => {
  const adminContainer = document.querySelector(".admin-container");
  if (adminContainer) adminContainer.style.display = "none";

  const token = getCookie("ac");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  let user = JSON.parse(localStorage.getItem("user"));
  if (!user || (!user.role && !user.roles)) {
    if (typeof getMe === "function") {
      user = await getMe(token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
    }
  }

  const userRoles = user ? user.roles || user.role : null;
  const isAdmin =
    userRoles &&
    (typeof userRoles === "string"
      ? userRoles.toLowerCase().includes("admin")
      : userRoles.includes("admin"));

  if (!isAdmin) {
    window.location.href = "index.html";
    return;
  }

  if (adminContainer) adminContainer.style.display = "block";

  fetchMaintenanceStatus();
  fetchWhitelistIps();
  fetchAllUsersForSelect().then(() => fetchWhitelistUsers());
});

async function apiCall(endpoint, options = {}) {
  const token = getCookie("ac");
  if (!token) {
    if (typeof showToast === "function")
      showToast("error", "Authentication required. Please login.");
    return null;
  }

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error("API Call Failed:", error);
    if (typeof showToast === "function") showToast("error", error.message);
    return null;
  }
}

async function fetchMaintenanceStatus() {
  const data = await apiCall("/maintenance/status", { method: "GET" });
  if (data) {
    updateToggleUI(data.isActive);
  }
}

async function toggleMaintenanceMode(isActive) {
  const data = await apiCall("/maintenance/toggle", {
    method: "POST",
    body: JSON.stringify({ isActive }),
  });

  if (data) {
    if (typeof showToast === "function")
      showToast(
        "success",
        `Maintenance mode turned ${isActive ? "ON" : "OFF"}`,
      );
    updateToggleUI(isActive);
  } else {
    updateToggleUI(!isActive);
  }
}

function updateToggleUI(isActive) {
  const toggleInput = document.getElementById("maintenance-toggle");
  const statusText = document.getElementById("maintenance-status-text");
  const card = document.querySelector(".maintenance-status-card");

  toggleInput.checked = isActive;

  if (isActive) {
    statusText.textContent = "ON";
    statusText.className = "status-on";
    card.classList.add("active");
  } else {
    statusText.textContent = "OFF";
    statusText.className = "status-off";
    card.classList.remove("active");
  }
}

async function fetchWhitelistIps() {
  const data = await apiCall("/maintenance/whitelist-ips", { method: "GET" });
  const ipList = document.getElementById("ip-list");
  ipList.innerHTML = "";

  if (data && data.ips && data.ips.length > 0) {
    data.ips.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${window.escapeHTML ? window.escapeHTML(item.ip) : item.ip}</td>
        <td>${window.escapeHTML ? window.escapeHTML(item.description) : item.description}</td>
        <td>
          <button class="btn-danger" onclick="removeWhitelistIp('${item.ip}')">Remove</button>
        </td>
      `;
      ipList.appendChild(tr);
    });
  } else {
    ipList.innerHTML =
      '<tr><td colspan="3" class="empty-message">No IPs whitelisted.</td></tr>';
  }
}

async function addWhitelistIp(event) {
  event.preventDefault();
  const ipInput = document.getElementById("ip-address");
  const descInput = document.getElementById("ip-description");
  const btn = event.target.querySelector('button[type="submit"]');

  const ip = ipInput.value.trim();
  const description = descInput.value.trim();

  if (!ip || !description) return;

  if (typeof btnLoading !== "undefined") btnLoading.start(btn);
  else btn.disabled = true;

  const data = await apiCall("/maintenance/whitelist-ip", {
    method: "POST",
    body: JSON.stringify({ ip, description }),
  });

  if (typeof btnLoading !== "undefined") btnLoading.stop(btn);
  else btn.disabled = false;

  if (data) {
    if (typeof showToast === "function")
      showToast("success", "IP added to whitelist");
    ipInput.value = "";
    descInput.value = "";
    fetchWhitelistIps();
  }
}

async function removeWhitelistIp(ip) {
  if (!confirm(`Are you sure you want to remove ${ip} from the whitelist?`))
    return;

  const data = await apiCall(
    `/maintenance/whitelist-ip/remove/${encodeURIComponent(ip)}`,
    {
      method: "DELETE",
    },
  );

  if (data) {
    if (typeof showToast === "function")
      showToast("success", "IP removed from whitelist");
    fetchWhitelistIps();
  }
}

async function fetchWhitelistUsers() {
  const data = await apiCall("/maintenance/whitelist-users", { method: "GET" });
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  if (data && data.users && data.users.length > 0) {
    data.users.forEach((userId) => {
      const userObj = typeof allUsersList !== 'undefined' ? allUsersList.find(u => u.id === userId) : null;
      const displayName = userObj ? (userObj.name ? `${userObj.name} (${userObj.username || userId})` : userId) : userId;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${window.escapeHTML ? window.escapeHTML(displayName) : displayName}</td>
      `;
      userList.appendChild(tr);
    });
  } else {
    userList.innerHTML =
      '<tr><td colspan="1" class="empty-message">No users whitelisted.</td></tr>';
  }
}

async function addWhitelistUser(event) {
  event.preventDefault();
  const userInput = document.getElementById("user-id");
  const btn = event.target.querySelector('button[type="submit"]');

  const userId = userInput.value.trim();

  if (!userId) return;

  if (typeof btnLoading !== "undefined") btnLoading.start(btn);
  else btn.disabled = true;

  const data = await apiCall("/maintenance/whitelist-user", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });

  if (typeof btnLoading !== "undefined") btnLoading.stop(btn);
  else btn.disabled = false;

  if (data) {
    if (typeof showToast === "function")
      showToast("success", "User added to whitelist");
    userInput.value = "";
    fetchWhitelistUsers();
  }
}

let allUsersList = [];

async function fetchAllUsersForSelect() {
  const data = await apiCall("/users", { method: "GET" });
  if (data && (data.items || data)) {
    const users = Array.isArray(data) ? data : (data.items || []);
    allUsersList = users;
    const select = document.getElementById("user-id");
    if (!select) return;
    
    select.innerHTML = '<option value="" disabled selected>Select User</option>';
    
    users.forEach(u => {
      const option = document.createElement("option");
      option.value = u.id;
      option.textContent = u.name ? `${u.name} (${u.username || u.id})` : u.id;
      select.appendChild(option);
    });
  }
}
