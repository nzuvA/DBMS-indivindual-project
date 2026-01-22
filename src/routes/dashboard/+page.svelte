<script>
  export let data;
  
  import { onMount } from 'svelte';

  let stats = {
    totalExpenses: 0,
    expensesThisMonth: 0,
    activeHabits: 0,
    habitStreak: 0,
    pendingTasks: 0,
    completedTasks: 0
  };

  let recentExpenses = [];
  let todayHabits = [];
  let recentTasks = [];
  let loading = true;

  onMount(async () => {
    await loadDashboardData();
  });

  async function loadDashboardData() {
    try {
      // Load stats
      const statsRes = await fetch('/api/dashboard/stats');
      if (statsRes.ok) {
        stats = await statsRes.json();
      }

      // Load recent expenses
      const expensesRes = await fetch('/api/expenses?limit=5');
      if (expensesRes.ok) {
        recentExpenses = await expensesRes.json();
      }

      // Load today's habits
      const habitsRes = await fetch('/api/habits/today');
      if (habitsRes.ok) {
        todayHabits = await habitsRes.json();
      }

      // Load recent tasks
      const tasksRes = await fetch('/api/tasks?limit=5');
      if (tasksRes.ok) {
        recentTasks = await tasksRes.json();
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-600 mt-1">Welcome back, {data?.user?.name || 'User'}! Here's your overview.</p>
  </div>

  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <p class="mt-2 text-gray-600">Loading your data...</p>
    </div>
  {:else}
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Expenses Card -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">This Month</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">
              ${stats.expensesThisMonth?.toFixed(2) || '0.00'}
            </p>
            <p class="text-sm text-gray-500 mt-1">Total expenses</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <span class="text-2xl">💰</span>
          </div>
        </div>
        <a href="/dashboard/expenses" class="text-purple-600 text-sm font-medium mt-4 inline-block hover:text-purple-700">
          View all expenses →
        </a>
      </div>

      <!-- Habits Card -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Habits</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{stats.activeHabits || 0}</p>
            <p class="text-sm text-gray-500 mt-1">Best streak: {stats.habitStreak || 0} days</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <span class="text-2xl">🎯</span>
          </div>
        </div>
        <a href="/dashboard/habits" class="text-purple-600 text-sm font-medium mt-4 inline-block hover:text-purple-700">
          View all habits →
        </a>
      </div>

      <!-- Tasks Card -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Tasks</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{stats.pendingTasks || 0}</p>
            <p class="text-sm text-gray-500 mt-1">{stats.completedTasks || 0} completed</p>
          </div>
          <div class="bg-yellow-100 rounded-full p-3">
            <span class="text-2xl">✅</span>
          </div>
        </div>
        <a href="/dashboard/tasks" class="text-purple-600 text-sm font-medium mt-4 inline-block hover:text-purple-700">
          View all tasks →
        </a>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
         <a href="/dashboard/expenses"
          class="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
        >
          <span class="text-2xl">➕</span>
          <span class="font-medium text-gray-700">Add Expense</span>
        </a>
        
        <a  href="/dashboard/habits"
          class="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
        >
          <span class="text-2xl">🎯</span>
          <span class="font-medium text-gray-700">Log Habit</span>
        </a>
        
        <a  href="/dashboard/tasks"
          class="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
        >
          <span class="text-2xl">📝</span>
          <span class="font-medium text-gray-700">Create Task</span>
        </a>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Recent Expenses -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Recent Expenses</h3>
        {#if recentExpenses.length > 0}
          <div class="space-y-3">
            {#each recentExpenses as expense}
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p class="font-medium text-gray-900">{expense.category}</p>
                  <p class="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <p class="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 text-center py-8">No expenses yet</p>
        {/if}
      </div>

      <!-- Recent Tasks -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Recent Tasks</h3>
        {#if recentTasks.length > 0}
          <div class="space-y-3">
            {#each recentTasks as task}
              <div class="flex items-center space-x-3 py-2 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={task.completed}
                  disabled
                  class="w-5 h-5 text-purple-600 rounded"
                />
                <span class="{task.completed ? 'line-through text-gray-400' : 'text-gray-900'}">
                  {task.title}
                </span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 text-center py-8">No tasks yet</p>
        {/if}
      </div>
    </div>
  {/if}
</div>