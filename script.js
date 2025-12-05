// const API_BASE = "https://test-crud-backend-three.vercel.app/api/Test";
const API_BASE = "http://localhost:5500/api/Test";

const messageForm = document.getElementById("messageForm");
const messageTableBody = document.querySelector("#messageTable tbody");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("searchInput");

const mobileContainer = document.createElement("div");
mobileContainer.id = "mobileCardsWrapper";
document.querySelector(".table-wrapper").after(mobileContainer);

let allMessages = [];

/* ===============================
   Helpers
================================*/
const showAlert = (text, type = "error") => {
  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.textContent = text;
  document.body.appendChild(alertBox);
  setTimeout(() => alertBox.remove(), 2500);
};

const showLoader = () => {
  const loader = document.createElement("div");
  loader.className = "loader-overlay";
  loader.innerHTML = `<div class="spinner"></div>`;
  document.body.appendChild(loader);
};

const hideLoader = () => {
  const loader = document.querySelector(".loader-overlay");
  if (loader) loader.remove();
};

/* ===============================
   Load Messages
================================*/
const loadMessages = async () => {
  try {
    showLoader();
    const res = await fetch(`${API_BASE}/getAll`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.err || "Failed to fetch data");

    allMessages = json.data || [];
    renderTable(allMessages);
    renderMobileCards(allMessages);
  } catch (err) {
    showAlert(err.message, "error");
  } finally {
    hideLoader();
  }
};

/* ===============================
   Render Table
================================*/
const renderTable = (messages) => {
  messageTableBody.innerHTML = "";
  messages.forEach((msg) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${msg.landLocation || ""}</td>
      <td>${msg.committee || ""}</td>
      <td>${msg.center || ""}</td>
      <td>${msg.unit || ""}</td>
      <td>${msg.area || ""}</td>
      <td>${msg.type || ""}</td>
      <td>${msg.requestDate ? new Date(msg.requestDate).toLocaleDateString() : ""}</td>
      <td>${msg.requestNumber || ""}</td>
      <td>${msg.requestedFor || ""}</td>
      <td>${msg.phone || ""}</td>
      <td>${msg.applicantName || ""}</td>
      <td>${msg.nationalId || ""}</td>
      <td>
        <button class="edit-btn" data-id="${msg._id}">Edit</button>
        <button class="delete-btn" data-id="${msg._id}">Delete</button>
      </td>
    `;
    messageTableBody.appendChild(tr);
  });
};

/* ===============================
   Render Mobile Cards
================================*/
const renderMobileCards = (messages) => {
  mobileContainer.innerHTML = "";
  messages.forEach((msg) => {
    const card = document.createElement("div");
    card.className = "mobile-card";
    card.innerHTML = `
      <p><strong>مكان الأرض:</strong> ${msg.landLocation || ""}</p>
      <p><strong>اللجنة:</strong> ${msg.committee || ""}</p>
      <p><strong>المركز:</strong> ${msg.center || ""}</p>
      <p><strong>الوحدة:</strong> ${msg.unit || ""}</p>
      <p><strong>المساحة:</strong> ${msg.area || ""}</p>
      <p><strong>النوع:</strong> ${msg.type || ""}</p>
      <p><strong>تاريخ الطلب:</strong> ${msg.requestDate ? new Date(msg.requestDate).toLocaleDateString() : ""}</p>
      <p><strong>رقم الطلب:</strong> ${msg.requestNumber || ""}</p>
      <p><strong>الطلب لصالح:</strong> ${msg.requestedFor || ""}</p>
      <p><strong>التليفون:</strong> ${msg.phone || ""}</p>
      <p><strong>مقدم الطلب:</strong> ${msg.applicantName || ""}</p>
      <p><strong>الرقم القومي:</strong> ${msg.nationalId || ""}</p>
      <div class="mobile-actions">
        <button class="edit-btn" data-id="${msg._id}">Edit</button>
        <button class="delete-btn" data-id="${msg._id}">Delete</button>
      </div>
    `;
    mobileContainer.appendChild(card);
  });
};

/* ===============================
   Form Submit (Create/Update)
================================*/
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("messageId").value;
  const payload = {
    landLocation: document.getElementById("landLocation").value,
    committee: document.getElementById("committee").value,
    center: document.getElementById("center").value,
    unit: document.getElementById("unit").value,
    area: Number(document.getElementById("area").value),
    type: document.getElementById("type").value,
    requestDate: document.getElementById("requestDate").value,
    requestNumber: document.getElementById("requestNumber").value,
    requestedFor: document.getElementById("requestedFor").value,
    phone: document.getElementById("phone").value,
    applicantName: document.getElementById("applicantName").value,
    nationalId: document.getElementById("nationalId").value,
  };

  try {
    showLoader();
    const endpoint = id ? `${API_BASE}/update/${id}` : `${API_BASE}/create`;
    const method = id ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.err || "Failed to save");

    showAlert("Saved Successfully!", "success");
    messageForm.reset();
    document.getElementById("messageId").value = "";
    loadMessages();
  } catch (err) {
    showAlert(err.message, "error");
  } finally {
    hideLoader();
  }
});

/* ===============================
   Edit & Delete
================================*/
document.body.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("edit-btn")) {
    try {
      showLoader();
      const res = await fetch(`${API_BASE}/getOne/${id}`);
      const msg = (await res.json()).data;
      if (!msg) throw new Error("Failed to load item");

      document.getElementById("messageId").value = msg._id;
      document.getElementById("landLocation").value = msg.landLocation || "";
      document.getElementById("committee").value = msg.committee || "";
      document.getElementById("center").value = msg.center || "";
      document.getElementById("unit").value = msg.unit || "";
      document.getElementById("area").value = msg.area || "";
      document.getElementById("type").value = msg.type || "";
      document.getElementById("requestDate").value = msg.requestDate ? msg.requestDate.slice(0, 10) : "";
      document.getElementById("requestNumber").value = msg.requestNumber || "";
      document.getElementById("requestedFor").value = msg.requestedFor || "";
      document.getElementById("phone").value = msg.phone || "";
      document.getElementById("applicantName").value = msg.applicantName || "";
      document.getElementById("nationalId").value = msg.nationalId || "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      hideLoader();
    }
  }

  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      showLoader();
      const res = await fetch(`${API_BASE}/deleteDocument/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.err || "Delete failed");
      showAlert("Deleted Successfully!", "success");
      loadMessages();
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      hideLoader();
    }
  }
});

/* ===============================
   Reset Form
================================*/
resetBtn.addEventListener("click", () => {
  messageForm.reset();
  document.getElementById("messageId").value = "";
});

/* ===============================
   Live Search
================================*/
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = allMessages.filter((msg) =>
    (msg.landLocation || "").toLowerCase().includes(keyword) ||
    (msg.committee || "").toLowerCase().includes(keyword) ||
    (msg.center || "").toLowerCase().includes(keyword) ||
    (msg.unit || "").toLowerCase().includes(keyword) ||
    (msg.area !== undefined ? msg.area.toString() : "").includes(keyword) ||
    (msg.type || "").toLowerCase().includes(keyword) ||
    (msg.requestNumber || "").toLowerCase().includes(keyword) ||
    (msg.requestedFor || "").toLowerCase().includes(keyword) ||
    (msg.phone || "").toLowerCase().includes(keyword) ||
    (msg.applicantName || "").toLowerCase().includes(keyword) ||
    (msg.nationalId || "").toLowerCase().includes(keyword)
  );
  renderTable(filtered);
  renderMobileCards(filtered);
});

/* ===============================
   Initial Load
================================*/
loadMessages();
