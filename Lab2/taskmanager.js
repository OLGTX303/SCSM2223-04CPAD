// In-memory task state for this lab. No localStorage is used.
const tasks = [];
let nextTaskId = 1;
let editingTaskId = null;
let activeColumnId = "todo";

const columnLists = {
  todo: document.getElementById("todoList"),
  inprogress: document.getElementById("inprogressList"),
  done: document.getElementById("doneList")
};

const taskCounter = document.getElementById("taskCounter");
const priorityFilter = document.getElementById("priorityFilter");
const addTaskButtons = document.querySelectorAll(".add-task-btn");
const clearDoneBtn = document.getElementById("clearDoneBtn");
const taskModal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskForm = document.getElementById("taskForm");
const cancelBtn = document.getElementById("cancelBtn");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDueDateInput = document.getElementById("taskDueDate");
const taskColumnInput = document.getElementById("taskColumn");

// Build one task card entirely with DOM methods.
function createTaskCard(taskObj) {
  const li = document.createElement("li");
  li.setAttribute("data-id", String(taskObj.id));
  li.setAttribute("data-priority", taskObj.priority);
  li.setAttribute("data-column", taskObj.columnId);
  li.classList.add("task-card");

  const metaRow = document.createElement("div");
  metaRow.classList.add("task-meta");

  const priorityBadge = document.createElement("span");
  priorityBadge.classList.add("priority-badge");
  priorityBadge.classList.add("priority-" + taskObj.priority);
  priorityBadge.textContent = taskObj.priority.charAt(0).toUpperCase() + taskObj.priority.slice(1) + " Priority";

  metaRow.appendChild(priorityBadge);

  const title = document.createElement("span");
  title.classList.add("task-title");
  title.setAttribute("data-role", "task-title");
  title.setAttribute("tabindex", "0");
  title.textContent = taskObj.title;

  const description = document.createElement("p");
  description.classList.add("task-description");
  description.setAttribute("data-role", "task-description");
  description.textContent = taskObj.description || "No description provided.";

  const footer = document.createElement("div");
  footer.classList.add("task-footer");

  const details = document.createElement("div");
  details.classList.add("task-details");

  const dueDateBadge = document.createElement("span");
  dueDateBadge.classList.add("due-date-badge");
  dueDateBadge.setAttribute("data-role", "task-due-date");
  dueDateBadge.textContent = taskObj.dueDate ? "Due: " + taskObj.dueDate : "No due date";

  details.appendChild(dueDateBadge);

  const actions = document.createElement("div");
  actions.classList.add("task-actions");

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.classList.add("task-action-btn");
  editBtn.setAttribute("data-action", "edit");
  editBtn.setAttribute("data-id", String(taskObj.id));
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.classList.add("task-action-btn");
  deleteBtn.setAttribute("data-action", "delete");
  deleteBtn.setAttribute("data-id", String(taskObj.id));
  deleteBtn.textContent = "Delete";

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  footer.appendChild(details);
  footer.appendChild(actions);

  li.appendChild(metaRow);
  li.appendChild(title);
  li.appendChild(description);
  li.appendChild(footer);

  return li;
}

// Append a task card into its target column and refresh UI state.
function addTask(columnId, taskObj) {
  const card = createTaskCard(taskObj);
  const targetList = columnLists[columnId];
  targetList.appendChild(card);
  updateTaskCounter();
  applyPriorityFilter();
}

// Fade out a card, then remove both the element and its task object.
function deleteTask(taskId) {
  const card = document.querySelector('.task-card[data-id="' + String(taskId) + '"]');
  if (!card) return;

  card.classList.add("is-removing");

  card.addEventListener("transitionend", function handleTransitionEnd(event) {
    if (event.propertyName !== "opacity") return;
    card.removeEventListener("transitionend", handleTransitionEnd);
    card.remove();
    const taskIndex = tasks.findIndex(function(task) {
      return task.id === taskId;
    });
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
    }
    updateTaskCounter();
  });
}

// Open the modal with an existing task pre-filled for editing.
function editTask(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  editingTaskId = taskId;
  modalTitle.textContent = "Edit Task";
  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description;
  taskPriorityInput.value = task.priority;
  taskDueDateInput.value = task.dueDate;
  taskColumnInput.value = task.columnId;
  openModal();
}

// Update the task object and refresh the matching card in the DOM.
function updateTask(taskId, updatedData) {
  const task = findTaskById(taskId);
  if (!task) return;

  const previousColumnId = task.columnId;

  task.title = updatedData.title;
  task.description = updatedData.description;
  task.priority = updatedData.priority;
  task.dueDate = updatedData.dueDate;
  task.columnId = updatedData.columnId;

  const existingCard = document.querySelector('.task-card[data-id="' + String(taskId) + '"]');
  if (!existingCard) return;

  if (previousColumnId !== updatedData.columnId) {
    existingCard.remove();
    addTask(updatedData.columnId, task);
    return;
  }

  refreshTaskCard(existingCard, task);
  applyPriorityFilter();
  updateTaskCounter();
}

// Refresh card content after a task is edited.
function refreshTaskCard(card, taskObj) {
  card.setAttribute("data-priority", taskObj.priority);
  card.setAttribute("data-column", taskObj.columnId);

  const title = card.querySelector('[data-role="task-title"]');
  const description = card.querySelector('[data-role="task-description"]');
  const priorityBadge = card.querySelector(".priority-badge");
  const dueDateBadge = card.querySelector('[data-role="task-due-date"]');

  title.textContent = taskObj.title;
  description.textContent = taskObj.description || "No description provided.";
  priorityBadge.className = "priority-badge";
  priorityBadge.classList.add("priority-" + taskObj.priority);
  priorityBadge.textContent = taskObj.priority.charAt(0).toUpperCase() + taskObj.priority.slice(1) + " Priority";
  dueDateBadge.textContent = taskObj.dueDate ? "Due: " + taskObj.dueDate : "No due date";
}

function findTaskById(taskId) {
  return tasks.find(function(task) {
    return task.id === taskId;
  });
}

function updateTaskCounter() {
  const count = tasks.length;
  taskCounter.textContent = count === 1 ? "1 task" : String(count) + " tasks";
}

// Hide non-matching cards by toggling a CSS class instead of inline styles.
function applyPriorityFilter() {
  const selectedPriority = priorityFilter.value;
  const allCards = document.querySelectorAll(".task-card");

  allCards.forEach(function(card) {
    const shouldHide = selectedPriority !== "all" && card.getAttribute("data-priority") !== selectedPriority;
    card.classList.toggle("is-hidden", shouldHide);
  });
}

function openModal(columnId) {
  if (columnId) {
    activeColumnId = columnId;
    taskColumnInput.value = columnId;
  }

  taskModal.classList.remove("is-hidden");
  taskModal.setAttribute("aria-hidden", "false");
  taskTitleInput.focus();
}

function closeModal() {
  taskModal.classList.add("is-hidden");
  taskModal.setAttribute("aria-hidden", "true");
  taskForm.reset();
  taskPriorityInput.value = "medium";
  taskColumnInput.value = activeColumnId;
  modalTitle.textContent = "Add Task";
  editingTaskId = null;
}

function beginCreateTask(columnId) {
  editingTaskId = null;
  modalTitle.textContent = "Add Task";
  taskForm.reset();
  taskPriorityInput.value = "medium";
  taskColumnInput.value = columnId;
  openModal(columnId);
}

function handleFormSubmit(event) {
  event.preventDefault();

  const titleValue = taskTitleInput.value.trim();
  if (titleValue === "") {
    taskTitleInput.focus();
    return;
  }

  const formData = {
    title: titleValue,
    description: taskDescriptionInput.value.trim(),
    priority: taskPriorityInput.value,
    dueDate: taskDueDateInput.value,
    columnId: taskColumnInput.value
  };

  if (editingTaskId === null) {
    const newTask = {
      id: nextTaskId++,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
      columnId: formData.columnId
    };
    tasks.push(newTask);
    addTask(formData.columnId, newTask);
  } else {
    updateTask(editingTaskId, formData);
  }

  closeModal();
}

// One delegated click listener per column handles Edit and Delete actions.
function handleColumnClick(event) {
  const action = event.target.getAttribute("data-action");
  const idStr = event.target.getAttribute("data-id");
  if (!action || !idStr) return;

  const taskId = parseInt(idStr, 10);
  if (action === "delete") {
    deleteTask(taskId);
  }
  if (action === "edit") {
    editTask(taskId);
  }
}

// Commit inline title editing on Enter or blur.
function commitInlineTitle(taskId, inputElement) {
  const task = findTaskById(taskId);
  if (!task) return;

  const newTitle = inputElement.value.trim();
  const card = document.querySelector('.task-card[data-id="' + String(taskId) + '"]');
  if (!card) return;

  const replacementTitle = document.createElement("span");
  replacementTitle.classList.add("task-title");
  replacementTitle.setAttribute("data-role", "task-title");
  replacementTitle.setAttribute("tabindex", "0");
  replacementTitle.textContent = newTitle === "" ? task.title : newTitle;

  if (newTitle !== "") {
    task.title = newTitle;
  }

  inputElement.replaceWith(replacementTitle);
}

function startInlineTitleEdit(titleElement) {
  const card = titleElement.closest(".task-card");
  if (!card) return;

  const taskId = parseInt(card.getAttribute("data-id"), 10);
  const task = findTaskById(taskId);
  if (!task) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.classList.add("task-title-input");

  input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      commitInlineTitle(taskId, input);
    }
  });

  input.addEventListener("blur", function() {
    commitInlineTitle(taskId, input);
  });

  titleElement.replaceWith(input);
  input.focus();
  input.select();
}

function handleTitleDoubleClick(event) {
  const titleElement = event.target.closest('[data-role="task-title"]');
  if (!titleElement) return;
  startInlineTitleEdit(titleElement);
}

// Remove all Done cards with staggered fade-out timing.
function clearDoneTasks() {
  const doneTasks = tasks.filter(function(task) {
    return task.columnId === "done";
  });

  doneTasks.forEach(function(task, index) {
    window.setTimeout(function() {
      deleteTask(task.id);
    }, index * 100);
  });
}

function seedTasks() {
  const initialTasks = [
    {
      title: "Draft homepage wireframe",
      description: "Sketch the first version of the project landing page.",
      priority: "high",
      dueDate: "2026-04-15",
      columnId: "todo"
    },
    {
      title: "Prepare presentation slides",
      description: "Finish the middle section and speaker notes.",
      priority: "medium",
      dueDate: "2026-04-18",
      columnId: "inprogress"
    },
    {
      title: "Submit weekly report",
      description: "Sent to the lecturer and group members.",
      priority: "low",
      dueDate: "2026-04-10",
      columnId: "done"
    }
  ];

  initialTasks.forEach(function(taskData) {
    const task = {
      id: nextTaskId++,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      columnId: taskData.columnId
    };
    tasks.push(task);
    addTask(task.columnId, task);
  });
}

function init() {
  Object.values(columnLists).forEach(function(list) {
    list.addEventListener("click", handleColumnClick);
    list.addEventListener("dblclick", handleTitleDoubleClick);
  });

  addTaskButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const columnId = button.getAttribute("data-column");
      beginCreateTask(columnId);
    });
  });

  priorityFilter.addEventListener("change", applyPriorityFilter);
  clearDoneBtn.addEventListener("click", clearDoneTasks);
  taskForm.addEventListener("submit", handleFormSubmit);
  cancelBtn.addEventListener("click", closeModal);

  taskModal.addEventListener("click", function(event) {
    if (event.target.getAttribute("data-close-modal") === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && !taskModal.classList.contains("is-hidden")) {
      closeModal();
    }
  });

  updateTaskCounter();
  seedTasks();
}

init();
