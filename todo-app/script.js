const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let tasks = [];
let currentFilter = "all";

function saveTasks() {
  const tasksToSave = tasks.map(function (task) {
    return { id: task.id, text: task.text, completed: task.completed };
  });
  localStorage.setItem("tasks", JSON.stringify(tasksToSave));
}

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    const parsedTasks = JSON.parse(savedTasks);
    tasks = parsedTasks.map(function (task) {
      return { ...task, isEditing: false };
    });
  }
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  if (task.completed) li.classList.add("completed");

  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.classList.add("task-buttons");

  if (task.isEditing) {
    // Placeholder check circle (disabled during edit)
    const ghost = document.createElement("div");
    ghost.classList.add("task-check");

    const editInput = document.createElement("input");
    editInput.classList.add("task-edit-input");
    editInput.type = "text";
    editInput.value = task.text;

    const saveButton = document.createElement("button");
    saveButton.classList.add("task-btn", "edit-btn");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", function () {
      saveEditedTask(task.id, editInput.value);
    });

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("task-btn", "delete-btn");
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", function () {
      cancelEditingTask(task.id);
    });

    editInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") saveEditedTask(task.id, editInput.value);
      if (event.key === "Escape") cancelEditingTask(task.id);
    });

    li.appendChild(ghost);
    li.appendChild(editInput);
    buttonsWrapper.appendChild(saveButton);
    buttonsWrapper.appendChild(cancelButton);
    li.appendChild(buttonsWrapper);

    setTimeout(function () {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }, 0);

    return li;
  }

  // Custom circular checkbox
  const checkBtn = document.createElement("button");
  checkBtn.classList.add("task-check");
  checkBtn.setAttribute("aria-label", task.completed ? "Mark incomplete" : "Mark complete");

  const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  checkIcon.setAttribute("viewBox", "0 0 24 24");
  checkIcon.setAttribute("fill", "none");
  checkIcon.setAttribute("stroke", "currentColor");
  checkIcon.setAttribute("stroke-width", "3");
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", "20 6 9 17 4 12");
  checkIcon.appendChild(polyline);
  checkBtn.appendChild(checkIcon);

  checkBtn.addEventListener("click", function () {
    toggleTask(task.id);
  });

  const taskText = document.createElement("span");
  taskText.classList.add("task-text");
  taskText.textContent = task.text;

  const editButton = document.createElement("button");
  editButton.classList.add("task-btn", "edit-btn");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", function () {
    startEditingTask(task.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("task-btn", "delete-btn");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", function () {
    deleteTask(task.id);
  });

  buttonsWrapper.appendChild(editButton);
  buttonsWrapper.appendChild(deleteButton);

  li.appendChild(checkBtn);
  li.appendChild(taskText);
  li.appendChild(buttonsWrapper);

  return li;
}

function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter(t => !t.completed);
  if (currentFilter === "completed") return tasks.filter(t => t.completed);
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("empty-state");
    if (currentFilter === "active") emptyItem.textContent = "No active tasks.";
    else if (currentFilter === "completed") emptyItem.textContent = "Nothing completed yet.";
    else emptyItem.textContent = "Your list is empty. Add something.";
    taskList.appendChild(emptyItem);
    updateTaskCount();
    return;
  }

  filteredTasks.forEach(function (task) {
    taskList.appendChild(createTaskElement(task));
  });

  updateTaskCount();
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  tasks.push({ id: Date.now(), text: taskText, completed: false, isEditing: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  renderTasks();
}

function startEditingTask(id) {
  tasks = tasks.map(t => ({ ...t, isEditing: t.id === id }));
  saveTasks();
  renderTasks();
}

function cancelEditingTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, isEditing: false } : t);
  saveTasks();
  renderTasks();
}

function saveEditedTask(id, newText) {
  const trimmedText = newText.trim();
  if (trimmedText === "") return;
  tasks = tasks.map(t => t.id === id ? { ...t, text: trimmedText, isEditing: false } : t);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
  renderTasks();
}

function updateTaskCount() {
  const count = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${count} task${count !== 1 ? "s" : ""} left`;
}

function clearCompletedTasks() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });
filterButtons.forEach(btn => btn.addEventListener("click", () => setFilter(btn.dataset.filter)));
clearCompletedBtn.addEventListener("click", clearCompletedTasks);

loadTasks();
renderTasks();