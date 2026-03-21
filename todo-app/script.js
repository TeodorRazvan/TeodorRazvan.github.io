const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("task-item");

    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <span>${task.text}</span>
      <div class="task-buttons">
        <button onclick="toggleTask(${index})">Done</button>
        <button onclick="deleteTask(${index})">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") return;

  tasks.push({
    text: taskText,
    completed: false
  });

  taskInput.value = "";
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);