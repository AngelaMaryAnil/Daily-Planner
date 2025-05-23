document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Load tasks from local storage
    loadTasks();
    
    // Set min attribute for datetime input to current time
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - timezoneOffset)).toISOString().slice(0, 16);
    document.getElementById('dueDateTime').min = localISOTime;
});

// Function to add a new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDateTimeInput = document.getElementById('dueDateTime');
    const taskValue = taskInput.value.trim();
    const dueDateTimeValue = dueDateTimeInput.value;
    
    if (taskValue !== "") {
        const task = {
            id: Date.now(),
            text: taskValue,
            dueDate: dueDateTimeValue,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to DOM
        addTaskToDOM(task);
        
        // Save to local storage
        saveTask(task);
        
        // Clear inputs
        taskInput.value = '';
        dueDateTimeInput.value = '';
    } else {
        alert('Please enter a task!');
    }
}

// Function to add task to DOM
function addTaskToDOM(task) {
    const taskList = document.getElementById('taskList');
    
    const listItem = document.createElement('li');
    listItem.dataset.id = task.id;
    if (task.completed) {
        listItem.classList.add('completed');
    }
    
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const now = new Date();
    
    let dueDateClass = '';
    let dueDateText = '';
    
    if (dueDate) {
        if (task.completed) {
            dueDateText = `Completed: ${formatDate(new Date(task.completedAt))}`;
        } else if (dueDate < now) {
            dueDateClass = 'overdue';
            dueDateText = `Overdue: ${formatDate(dueDate)}`;
        } else if (isToday(dueDate)) {
            dueDateClass = 'today';
            dueDateText = `Due Today: ${formatTime(dueDate)}`;
        } else {
            dueDateText = `Due: ${formatDate(dueDate)}`;
        }
    }
    
    listItem.innerHTML = `
        <div class="task-content">
            <span class="task-text">${task.text}</span>
        </div>
        ${dueDate ? `<div class="task-due ${dueDateClass}">${dueDateText}</div>` : ''}
        <div class="task-actions">
            <button class="complete-button" onclick="toggleTaskCompletion(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
            <button class="delete-button" onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `;
    
    taskList.appendChild(listItem);
}

// Helper function to format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to check if date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Function to save task to local storage
function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToDOM(task));
}

// Function to delete a task
function deleteTask(id) {
    // Remove from DOM
    document.querySelector(`li[data-id="${id}"]`).remove();
    
    // Remove from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to toggle task completion
function toggleTaskCompletion(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].completedAt = tasks[taskIndex].completed ? new Date().toISOString() : null;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Reload tasks to reflect changes
        document.getElementById('taskList').innerHTML = '';
        loadTasks();
    }
}

// Function to filter tasks
function filterTasks(filterType) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    
    let filteredTasks = [];
    
    switch(filterType) {
        case 'all':
            filteredTasks = tasks;
            break;
        case 'today':
            filteredTasks = tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                return dueDate >= todayStart && dueDate <= todayEnd;
            });
            break;
        case 'upcoming':
            filteredTasks = tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                return dueDate > now;
            });
            break;
        case 'past':
            filteredTasks = tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                return dueDate < now && !task.completed;
            });
            break;
        default:
            filteredTasks = tasks;
    }
    
    // Display filtered tasks
    document.getElementById('taskList').innerHTML = '';
    filteredTasks.forEach(task => addTaskToDOM(task));
}

// Make functions available globally
window.addTask = addTask;
window.deleteTask = deleteTask;
window.toggleTaskCompletion = toggleTaskCompletion;
window.filterTasks = filterTasks;