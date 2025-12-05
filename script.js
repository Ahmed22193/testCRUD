const API_BASE = "https://test-crud-backend-three.vercel.app/api/Test";
// const API_BASE = "http://localhost:5500/api/Test";

const messageForm = document.getElementById("messageForm");
const messageTableBody = document.querySelector("#messageTable tbody");
const tableHead = document.querySelector("#messageTable thead tr");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("searchInput");
const formInputsContainer = document.getElementById("formInputs");

const mobileContainer = document.createElement("div");
mobileContainer.id = "mobileCardsWrapper";
document.querySelector(".table-wrapper").after(mobileContainer);

let allMessages = [];
let allColumns = [];

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
   Render Table Headers
================================*/
const renderTableHeaders = (columns) => {
  tableHead.innerHTML = "";
  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    tableHead.appendChild(th);
  });
  const actionTh = document.createElement("th");
  actionTh.textContent = "Actions";
  tableHead.appendChild(actionTh);
};

/* ===============================
   Render Form Inputs
================================*/
const renderFormInputs = (columns) => {
  formInputsContainer.innerHTML = "";
  columns.forEach(col => {
    const input = document.createElement("input");
    input.type = col.toLowerCase().includes("date") ? "date" : "text";
    input.id = col;
    input.placeholder = col;
    formInputsContainer.appendChild(input);
  });
};

/* ===============================
   Render Table Rows
================================*/
const renderTable = (messages) => {
  messageTableBody.innerHTML = "";
  messages.forEach(msg => {
    const tr = document.createElement("tr");
    allColumns.forEach(col => {
      const td = document.createElement("td");
      let val = msg[col] ?? "";
      if (val && !isNaN(Date.parse(val))) val = new Date(val).toLocaleDateString();
      td.textContent = val;
      tr.appendChild(td);
    });
    const actionTd = document.createElement("td");
    actionTd.innerHTML = `
      <button class="edit-btn" data-id="${msg._id}">Edit</button>
      <button class="delete-btn" data-id="${msg._id}">Delete</button>
    `;
    tr.appendChild(actionTd);
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
    card.innerHTML = allColumns.map(col => {
      let val = msg[col] ?? "";
      if (val && !isNaN(Date.parse(val))) val = new Date(val).toLocaleDateString();
      return `<p><strong>${col}:</strong> ${val}</p>`;
    }).join("");
    card.innerHTML += `
      <div class="mobile-actions">
        <button class="edit-btn" data-id="${msg._id}">Edit</button>
        <button class="delete-btn" data-id="${msg._id}">Delete</button>
      </div>
    `;
    mobileContainer.appendChild(card);
  });
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

    if (allMessages.length) {
      allColumns = Object.keys(allMessages[0]).filter(k => k !== "_id" && k !== "__v");
      renderTableHeaders(allColumns);
      renderFormInputs(allColumns);
    }

    renderTable(allMessages);
    renderMobileCards(allMessages);
  } catch (err) {
    showAlert(err.message, "error");
  } finally {
    hideLoader();
  }
};

/* ===============================
   Live Search
================================*/
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = allMessages.filter(msg =>
    allColumns.some(col => (msg[col] ?? "").toString().toLowerCase().includes(keyword))
  );
  renderTable(filtered);
  renderMobileCards(filtered);
});

/* ===============================
   Reset Form
================================*/
resetBtn.addEventListener("click", () => {
  messageForm.reset();
  document.getElementById("messageId").value = "";
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

      Object.keys(msg).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
          if (key.toLowerCase().includes("date") && msg[key]) input.value = msg[key].slice(0, 10);
          else input.value = msg[key] ?? "";
        }
      });
      document.getElementById("messageId").value = msg._id;
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
   Form Submit (Create/Update)
================================*/
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("messageId").value;

  const payload = {};
  allColumns.forEach(col => {
    const input = document.getElementById(col);
    if (input) payload[col] = input.value;
  });

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



const uploadExcelBtn = document.getElementById("uploadExcelBtn");
const excelFileInput = document.getElementById("excelFile");
const clearAllBtn = document.getElementById("clearAllBtn");

// ===== رفع ملف Excel =====
uploadExcelBtn.addEventListener("click", async () => {
  const file = excelFileInput.files[0];
  if (!file) return showAlert("Please select a file first", "error");

  const formData = new FormData();
  formData.append("xlsx", file);

  try {
    showLoader();
    const res = await fetch(`${API_BASE}/upload-excel`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.err || "Failed to upload file");

    showAlert(`Uploaded ${data.inserted} rows successfully!`, "success");
    excelFileInput.value = ""; // مسح اختيار الملف
    loadMessages(); // إعادة تحميل البيانات
  } catch (err) {
    showAlert(err.message, "error");
  } finally {
    hideLoader();
  }
});

// ===== مسح كل البيانات =====
clearAllBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete all data?")) return;

  try {
    showLoader();
    const res = await fetch(`${API_BASE}/deleteAll`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) throw new Error(data.err || "Failed to delete all data");

    showAlert("All data deleted successfully!", "success");
    loadMessages(); // إعادة تحميل البيانات
  } catch (err) {
    showAlert(err.message, "error");
  } finally {
    hideLoader();
  }
});






/* ===============================
   Initial Load
================================*/
loadMessages();
