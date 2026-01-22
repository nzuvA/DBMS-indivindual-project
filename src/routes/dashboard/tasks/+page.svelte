<script>
  import { onMount } from 'svelte';

  let tasks = [];
  let loading = true;
  let showAddForm = false;
  let newTaskTitle = '';
  let newTaskPriority = 'medium';
  let error = '';
  let submitting = false;

  const priorities = ['low', 'medium', 'high'];
  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800 border-gray-300',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'high': 'bg-red-100 text-red-800 border-red-300'
  };

  onMount(() => {
    loadTasks();
  });

  async function loadTasks() {
    try {
      const response = await fetch('/api/tasks?limit=100');
      if (response.ok) {
        tasks = await response.json();
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      loading = false;
    }
  }

  async function handleAddTask() {
    error = '';
    
    if (!newTaskTitle.trim()) {
      error = 'Please enter a task title';
      return;
    }

    submitting = true;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newTaskPriority
        })
      });

      if (response.ok) {
        const newTask = await response.json();
        tasks = [newTask, ...tasks];
        
        // Reset form
        newTaskTitle = '';
        newTaskPriority = 'medium';
        showAddForm = false;
      } else {
        const data = await response.json();
        error = data.error || 'Failed to add task';
      }
    } catch (err) {
      error = 'Something went wrong. Please try again.';
    } finally {
      submitting = false;
    }
  }

  async function toggleTask(taskId, currentStatus) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        tasks = tasks.map(t => t.id === taskId ? updatedTask : t);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }

  async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        tasks = tasks.filter(t => t.id !== id);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  // Computed values
  $: pendingTasks = tasks.filter(t => !t.completed);
  $: completedTasks = tasks.filter(t => t.completed);
  $: completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(0) : 0;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
      <p class="text-gray-600 mt-1">Stay organized with your todo list</p>
    </div>
    <button
      on:click={() => showAddForm = !showAddForm}
      class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
    >
      {showAddForm ? 'Cancel' : '+ Add Task'}
    </button>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Pending Tasks</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{pendingTasks.length}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Completed Tasks</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{completedTasks.length}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Completion Rate</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{completionRate}%</p>
    </div>
  </div>

  <!-- Add Task Form -->
  {#if showAddForm}
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Add New Task</h2>
      
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      {/if}

      <div class="flex gap-4">
        <input
          type="text"
          bind:value={newTaskTitle}
          placeholder="What needs to be done?"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          on:keypress={(e) => e.key === 'Enter' && handleAddTask()}
        />
        
        <select
          bind:value={newTaskPriority}
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button
          on:click={handleAddTask}
          disabled={submitting}
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  {/if}

  <!-- Pending Tasks -->
  <div class="bg-white rounded-lg shadow border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-900">Pending Tasks ({pendingTasks.length})</h2>
    </div>

    {#if loading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-gray-600">Loading tasks...</p>
      </div>
    {:else if pendingTasks.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-500">No pending tasks. You're all caught up! 🎉</p>
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each pendingTasks as task}
          <div class="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
            <div class="flex items-center space-x-4 flex-1">
              <input
                type="checkbox"
                checked={task.completed}
                on:change={() => toggleTask(task.id, task.completed)}
                class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              />
              <div class="flex-1">
                <p class="text-gray-900 font-medium">{task.title}</p>
                <p class="text-sm text-gray-500">
                  Created {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-medium border {priorityColors[task.priority]}">
                {task.priority}
              </span>
            </div>
            <button
              on:click={() => deleteTask(task.id)}
              class="ml-4 text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Completed Tasks -->
  {#if completedTasks.length > 0}
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Completed Tasks ({completedTasks.length})</h2>
      </div>

      <div class="divide-y divide-gray-200">
        {#each completedTasks as task}
          <div class="px-6 py-4 hover:bg-gray-50 flex items-center justify-between opacity-75">
            <div class="flex items-center space-x-4 flex-1">
              <input
                type="checkbox"
                checked={task.completed}
                on:change={() => toggleTask(task.id, task.completed)}
                class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              />
              <div class="flex-1">
                <p class="text-gray-500 line-through">{task.title}</p>
                <p class="text-sm text-gray-400">
                  Completed {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-medium border {priorityColors[task.priority]}">
                {task.priority}
              </span>
            </div>
            <button
              on:click={() => deleteTask(task.id)}
              class="ml-4 text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>