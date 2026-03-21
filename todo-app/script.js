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
    return {
      id: task.id,
      text: task.text,
      completed: task.completed,
    };
  });

  localStorage.setItem("tasks", JSON.stringify(tasksToSave));
}

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");

  if (savedTasks) {
    const parsedTasks = JSON.parse(savedTasks);

    tasks = parsedTasks.map(function (task) {
      return {
        ...task,
        isEditing: false,
      };
    });
  }
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");

  if (task.completed) {
    li.classList.add("completed");
  }

  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.classList.add("task-buttons");

  if (task.isEditing) {
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
      if (event.key === "Enter") {
        saveEditedTask(task.id, editInput.value);
      }

      if (event.key === "Escape") {
        cancelEditingTask(task.id);
      }
    });

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

  const taskText = document.createElement("span");
  taskText.classList.add("task-text");
  taskText.textContent = task.text;

  const toggleButton = document.createElement("button");
  toggleButton.classList.add("task-btn", "complete-btn");
  toggleButton.textContent = task.completed ? "Undo" : "Done";
  toggleButton.addEventListener("click", function () {
    toggleTask(task.id);
  });

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

  buttonsWrapper.appendChild(toggleButton);
  buttonsWrapper.appendChild(editButton);
  buttonsWrapper.appendChild(deleteButton);

  li.appendChild(taskText);
  li.appendChild(buttonsWrapper);

  return li;
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (task) {
      return !task.completed;
    });
  }

  if (currentFilter === "completed") {
    return tasks.filter(function (task) {
      return task.completed;
    });
  }

  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("empty-state");

    if (currentFilter === "active") {
      emptyItem.textContent = "No active tasks.";
    } else if (currentFilter === "completed") {
      emptyItem.textContent = "No completed tasks yet.";
    } else {
      emptyItem.textContent = "No tasks yet. Add your first one.";
    }

    taskList.appendChild(emptyItem);
    return;
  }

  filteredTasks.forEach(function (task) {
  const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });

  updateTaskCount();
}

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    return;
  }

  const newTask = {
  id: Date.now(),
  text: taskText,
  completed: false,
  isEditing: false,
};

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed,
      };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

function startEditingTask(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return {
        ...task,
        isEditing: true,
      };
    }

    return {
      ...task,
      isEditing: false,
    };
  });

  saveTasks();
  renderTasks();
}

function cancelEditingTask(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return {
        ...task,
        isEditing: false,
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function saveEditedTask(id, newText) {
  const trimmedText = newText.trim();

  if (trimmedText === "") {
    return;
  }

  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return {
        ...task,
        text: trimmedText,
        isEditing: false,
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(function (task) {
    return task.id === id;
  });

  if (!task) {
    return;
  }

  const newText = prompt("Edit your task:", task.text);

  if (newText === null) {
    return;
  }

  const trimmedText = newText.trim();

  if (trimmedText === "") {
    return;
  }

  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return {
        ...task,
        text: trimmedText,
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach(function (button) {
    button.classList.remove("active");

    if (button.dataset.filter === filter) {
      button.classList.add("active");
    }
  });

  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setFilter(button.dataset.filter);
  });
});

function updateTaskCount() {
  const activeTasks = tasks.filter(function (task) {
    return !task.completed;
  });

  taskCount.textContent = `${activeTasks.length} task${activeTasks.length !== 1 ? "s" : ""} left`;
}

function clearCompletedTasks() {
  tasks = tasks.filter(function (task) {
    return !task.completed;
  });

  saveTasks();
  renderTasks();
}

clearCompletedBtn.addEventListener("click", clearCompletedTasks);



loadTasks();
renderTasks();