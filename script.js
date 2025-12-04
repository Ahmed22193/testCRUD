const API_BASE = "http://localhost:5500/api/Test"; // عدل على حسب السيرفر بتاعك

const messageForm = document.getElementById("messageForm");
const messageTableBody = document.querySelector("#messageTable tbody");
const resetBtn = document.getElementById("resetBtn");

// Load all messages
const loadMessages = async () => {
  const res = await fetch(`${API_BASE}/getAll`);
  const data = await res.json();
  console.log("data : ",data);
  
  renderTable(data.data || []);
};

// Render table rows
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

// Handle form submit (create or update)
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("messageId").value;
  const payload = {
    name: document.getElementById("name").value,
    nationalId: document.getElementById("nationalId").value,
    content: document.getElementById("content").value,
    notes: document.getElementById("notes").value
  };

  if (id) {
    // Update
    await fetch(`${API_BASE}/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } else {
    // Create
    await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  messageForm.reset();
  document.getElementById("messageId").value = "";
  loadMessages();
});

// Handle edit & delete buttons
messageTableBody.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("edit-btn")) {
    const res = await fetch(`${API_BASE}/getOne/${id}`);
    const msg = (await res.json()).data;
    document.getElementById("messageId").value = msg._id;
    document.getElementById("name").value = msg.name;
    document.getElementById("nationalId").value = msg.nationalId;
    document.getElementById("content").value = msg.content;
    document.getElementById("notes").value = msg.notes;
  } else if (e.target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this record?")) {
      await fetch(`${API_BASE}/deleteDocument/${id}`, { method: "DELETE" });
      loadMessages();
    }
  }
});

// Reset form
resetBtn.addEventListener("click", () => {
  messageForm.reset();
  document.getElementById("messageId").value = "";
});

// Initial load
loadMessages();
