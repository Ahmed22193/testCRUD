const API_BASE = "https://test-crud-backend-three.vercel.app/api/Test";

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
  messages.forEach(msg => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${msg.name}</td>
      <td>${msg.nationalId}</td>
      <td>${msg.content}</td>
      <td>${msg.notes || ""}</td>
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
  messages.forEach(msg => {
    const card = document.createElement("div");
    card.className = "mobile-card";
    card.innerHTML = `
      <p><strong>Name:</strong> ${msg.name}</p>
      <p><strong>National ID:</strong> ${msg.nationalId}</p>
      <p><strong>Content:</strong> ${msg.content}</p>
      <p><strong>Notes:</strong> ${msg.notes || ""}</p>
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
    name: document.getElementById("name").value,
    nationalId: document.getElementById("nationalId").value,
    content: document.getElementById("content").value,
    notes: document.getElementById("notes").value
  };

  try {
    showLoader();
    const endpoint = id ? `${API_BASE}/update/${id}` : `${API_BASE}/create`;
    const method = id ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
      document.getElementById("name").value = msg.name;
      document.getElementById("nationalId").value = msg.nationalId;
      document.getElementById("content").value = msg.content;
      document.getElementById("notes").value = msg.notes;

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
      const res = await fetch(`${API_BASE}/deleteDocument/${id}`, { method: "DELETE" });
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
  const filtered = allMessages.filter(msg =>
    msg.name.toLowerCase().includes(keyword) ||
    msg.nationalId.toLowerCase().includes(keyword) ||
    msg.content.toLowerCase().includes(keyword) ||
    (msg.notes || "").toLowerCase().includes(keyword)
  );
  renderTable(filtered);
  renderMobileCards(filtered);
});

/* ===============================
   Initial Load
================================*/
loadMessages();
