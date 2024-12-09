class TaskManager {
  constructor() {
    this.tasks = []
  }

  loadTasks() {
    const savedTasks = localStorage.getItem('tasks')
    this.tasks = savedTasks ? JSON.parse(savedTasks) : []
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks))
  }

  addTask(title, dueDate, priority) {
    const task = {
      id: Date.now(),
      title,
      dueDate,
      priority,
      completed: false,
      createdAt: new Date().toISOString()
    }
    this.tasks.push(task)
    this.saveTasks()
    return task
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId)
    this.saveTasks()
  }

  toggleTaskStatus(taskId) {
    const task = this.tasks.find((task) => task.id === taskId)
    if (task) {
      task.completed = !task.completed
      this.saveTasks()
    }
  }

  editTask(taskId, newTitle, newDueDate, newPriority) {
    const task = this.tasks.find((task) => task.id === taskId)
    if (task) {
      task.title = newTitle
      task.dueDate = newDueDate
      task.priority = newPriority
      this.saveTasks()
    }
  }

  sortTasks(criteria) {
    switch (criteria) {
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 }
        this.tasks.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        )
        break
      case 'date':
        this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        break
    }
  }

  searchTasks(query) {
    return this.tasks.filter((task) =>
      task.title.toLowerCase().includes(query.toLowerCase())
    )
  }
}

// Task Manager End

// Theme Manager Start

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle')
  }

  initialize() {
    this.loadTheme()
    this.setupEventListeners()
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)
    this.updateToggleButton(savedTheme)
  }

  setupEventListeners() {
    this.themeToggle.addEventListener('click', () => this.toggleTheme())
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'

    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    this.updateToggleButton(newTheme)
  }

  updateToggleButton(theme) {
    this.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️'
  }
}

// Theme Manager End

// Theme UI Manager Start

class UIManager {
  constructor(taskManager) {
    this.taskManager = taskManager
    this.taskForm = document.getElementById('taskForm')
    this.taskList = document.getElementById('taskList')
    this.searchInput = document.getElementById('searchInput')
    this.sortSelect = document.getElementById('sortSelect')
  }

  initialize() {
    this.setupEventListeners()
    this.renderTasks()
  }

  setupEventListeners() {
    this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e))
    this.searchInput.addEventListener('input', () => this.handleSearch())
    this.sortSelect.addEventListener('change', () => this.handleSort())

    // Navigation
    document.querySelectorAll('nav button').forEach((button) => {
      button.addEventListener('click', () => this.handleNavigation(button))
    })
  }

  handleTaskSubmit(e) {
    e.preventDefault()
    const title = document.getElementById('taskTitle').value
    const dueDate = document.getElementById('taskDate').value
    const priority = document.getElementById('taskPriority').value

    this.taskManager.addTask(title, dueDate, priority)
    this.renderTasks()
    this.taskForm.reset()
  }

  handleSearch() {
    const query = this.searchInput.value
    const filteredTasks = this.taskManager.searchTasks(query)
    this.renderTasks(filteredTasks)
  }

  handleSort() {
    this.taskManager.sortTasks(this.sortSelect.value)
    this.renderTasks()
  }

  handleNavigation(button) {
    document
      .querySelectorAll('nav button')
      .forEach((btn) => btn.classList.remove('active'))
    button.classList.add('active')

    const view = button.dataset.view
    if (view === 'about') {
      this.showAboutView()
    } else {
      this.showTasksView()
    }
  }

  renderTasks(tasks = this.taskManager.tasks) {
    this.taskList.innerHTML = ''
    tasks.forEach((task) => {
      const taskElement = this.createTaskElement(task)
      this.taskList.appendChild(taskElement)
    })
  }

  createTaskElement(task) {
    const taskElement = document.createElement('div')
    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`
    taskElement.innerHTML = `
          <div class="task-content">
              <h3>${task.title}</h3>
              <p>Due: ${task.dueDate}</p>
              <span class="priority ${task.priority}">${task.priority}</span>
          </div>
          <div class="task-actions">
              <button onclick="this.closest('.task-item').dispatchEvent(new CustomEvent('toggleStatus'))">
                  ${task.completed ? '↩️' : '✓'}
              </button>
              <button onclick="this.closest('.task-item').dispatchEvent(new CustomEvent('editTask'))">
                  ✏️
              </button>
              <button onclick="this.closest('.task-item').dispatchEvent(new CustomEvent('deleteTask'))">
                  🗑️
              </button>
          </div>
      `

    taskElement.addEventListener('toggleStatus', () => {
      this.taskManager.toggleTaskStatus(task.id)
      this.renderTasks()
    })

    taskElement.addEventListener('deleteTask', () => {
      taskElement.classList.add('removing')
      setTimeout(() => {
        this.taskManager.deleteTask(task.id)
        this.renderTasks()
      }, 300)
    })

    taskElement.addEventListener('editTask', () => {
      this.showEditForm(task)
    })

    return taskElement
  }

  showEditForm(task) {
    const currentElement = document.querySelector(`[data-task-id="${task.id}"]`)
    const form = document.createElement('form')
    form.className = 'edit-form'
    form.innerHTML = `
          <input type="text" value="${task.title}" required>
          <input type="date" value="${task.dueDate}" required>
          <select>
              <option value="low" ${
                task.priority === 'low' ? 'selected' : ''
              }>Low</option>
              <option value="medium" ${
                task.priority === 'medium' ? 'selected' : ''
              }>Medium</option>
              <option value="high" ${
                task.priority === 'high' ? 'selected' : ''
              }>High</option>
          </select>
          <button type="submit">Save</button>
          <button type="button">Cancel</button>
      `

    form.onsubmit = (e) => {
      e.preventDefault()
      const [title, dueDate, priority] = [
        form.querySelector('input[type="text"]').value,
        form.querySelector('input[type="date"]').value,
        form.querySelector('select').value
      ]
      this.taskManager.editTask(task.id, title, dueDate, priority)
      this.renderTasks()
    }

    form.querySelector('button[type="button"]').onclick = () => {
      this.renderTasks()
    }

    if (currentElement) {
      currentElement.replaceWith(form)
    }
  }

  showAboutView() {
    const mainContent = document.getElementById('mainContent')
    mainContent.innerHTML = `
          <div class="about-section">
              <h2>About Task Manager</h2>
              <p>A simple and efficient way to manage your daily tasks.</p>
              <h3>Features:</h3>
              <ul>
                  <li>Add, edit, and delete tasks</li>
                  <li>Mark tasks as completed</li>
                  <li>Sort tasks by priority or due date</li>
                  <li>Search functionality</li>
                  <li>Dark/Light theme toggle</li>
              </ul>
          </div>
      `
  }

  showTasksView() {
    window.location.reload()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const taskManager = new TaskManager()
  const uiManager = new UIManager(taskManager)
  const themeManager = new ThemeManager()

  // Initialize the application
  taskManager.loadTasks()
  uiManager.initialize()
  themeManager.initialize()
})

