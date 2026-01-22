<script>
  import { onMount } from 'svelte';

  let habits = [];
  let habitLogs = {};
  let loading = true;
  let showAddForm = false;
  let newHabitName = '';
  let newHabitDescription = '';
  let error = '';
  let submitting = false;

  onMount(() => {
    loadHabits();
  });

  async function loadHabits() {
    try {
      const response = await fetch('/api/habits');
      if (response.ok) {
        habits = await response.json();
        
        // Load logs for each habit
        for (const habit of habits) {
          await loadHabitLogs(habit.id);
        }
      }
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      loading = false;
    }
  }

  async function loadHabitLogs(habitId) {
    try {
      const response = await fetch(`/api/habits/${habitId}/logs`);
      if (response.ok) {
        const logs = await response.json();
        habitLogs[habitId] = logs;
        habitLogs = habitLogs; // Trigger reactivity
      }
    } catch (err) {
      console.error('Failed to load habit logs:', err);
    }
  }

  async function handleAddHabit() {
    error = '';
    
    if (!newHabitName.trim()) {
      error = 'Please enter a habit name';
      return;
    }

    submitting = true;

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHabitName.trim(),
          description: newHabitDescription.trim() || null
        })
      });

      if (response.ok) {
        const newHabit = await response.json();
        habits = [...habits, newHabit];
        habitLogs[newHabit.id] = [];
        
        // Reset form
        newHabitName = '';
        newHabitDescription = '';
        showAddForm = false;
      } else {
        const data = await response.json();
        error = data.error || 'Failed to add habit';
      }
    } catch (err) {
      error = 'Something went wrong. Please try again.';
    } finally {
      submitting = false;
    }
  }

  async function toggleHabitToday(habitId) {
    const today = new Date().toISOString().split('T')[0];
    const logs = habitLogs[habitId] || [];
    const todayLog = logs.find(log => log.date.startsWith(today));

    try {
      if (todayLog) {
        // Delete the log
        const response = await fetch(`/api/habits/${habitId}/logs/${todayLog.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          habitLogs[habitId] = logs.filter(log => log.id !== todayLog.id);
          habitLogs = habitLogs;
        }
      } else {
        // Create a log
        const response = await fetch(`/api/habits/${habitId}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: new Date().toISOString() })
        });

        if (response.ok) {
          const newLog = await response.json();
          habitLogs[habitId] = [...logs, newLog];
          habitLogs = habitLogs;
        }
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  }

  async function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit? All tracking data will be lost.')) return;

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        habits = habits.filter(h => h.id !== id);
        delete habitLogs[id];
        habitLogs = habitLogs;
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  }

  function isCompletedToday(habitId) {
    const today = new Date().toISOString().split('T')[0];
    const logs = habitLogs[habitId] || [];
    return logs.some(log => log.date.startsWith(today));
  }

  function calculateStreak(habitId) {
    const logs = habitLogs[habitId] || [];
    if (logs.length === 0) return 0;

    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  function getCompletionRate(habitId) {
    const logs = habitLogs[habitId] || [];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const daysSinceCreation = Math.floor(
      (new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)
    ) + 1;

    return daysSinceCreation > 0 ? Math.round((logs.length / daysSinceCreation) * 100) : 0;
  }

  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return days;
  }

  function isCompletedOnDate(habitId, dateStr) {
    const logs = habitLogs[habitId] || [];
    return logs.some(log => log.date.startsWith(dateStr));
  }

  $: last7Days = getLast7Days();
  $: totalHabits = habits.length;
  $: completedToday = habits.filter(h => isCompletedToday(h.id)).length;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Habits</h1>
      <p class="text-gray-600 mt-1">Build consistency with daily habit tracking</p>
    </div>
    <button
      on:click={() => showAddForm = !showAddForm}
      class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
    >
      {showAddForm ? 'Cancel' : '+ Add Habit'}
    </button>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Total Habits</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{totalHabits}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Completed Today</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{completedToday} / {totalHabits}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Today's Progress</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">
        {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
      </p>
    </div>
  </div>

  <!-- Add Habit Form -->
  {#if showAddForm}
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Add New Habit</h2>
      
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Habit Name
          </label>
          <input
            id="name"
            type="text"
            bind:value={newHabitName}
            placeholder="e.g., Morning Exercise, Read 30 minutes"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            bind:value={newHabitDescription}
            placeholder="Add details about your habit..."
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          ></textarea>
        </div>

        <button
          on:click={handleAddHabit}
          disabled={submitting}
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          {submitting ? 'Adding...' : 'Add Habit'}
        </button>
      </div>
    </div>
  {/if}

  <!-- Habits List -->
  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <p class="mt-2 text-gray-600">Loading habits...</p>
    </div>
  {:else if habits.length === 0}
    <div class="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
      <p class="text-gray-500 text-lg">No habits yet. Create your first one to start tracking!</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each habits as habit}
        {@const streak = calculateStreak(habit.id)}
        {@const completionRate = getCompletionRate(habit.id)}
        {@const completedToday = isCompletedToday(habit.id)}
        
        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <button
                  on:click={() => toggleHabitToday(habit.id)}
                  class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition {completedToday ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'}"
                >
                  {#if completedToday}
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  {/if}
                </button>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{habit.name}</h3>
                  {#if habit.description}
                    <p class="text-gray-600 text-sm mt-1">{habit.description}</p>
                  {/if}
                </div>
              </div>

              <!-- Stats -->
              <div class="flex gap-6 mt-4 ml-11">
                <div>
                  <p class="text-sm text-gray-500">Current Streak</p>
                  <p class="text-2xl font-bold text-orange-600">{streak} days 🔥</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Completion Rate</p>
                  <p class="text-2xl font-bold text-blue-600">{completionRate}%</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Total Logs</p>
                  <p class="text-2xl font-bold text-purple-600">{habitLogs[habit.id]?.length || 0}</p>
                </div>
              </div>

              <!-- Last 7 Days Calendar -->
              <div class="mt-4 ml-11">
                <p class="text-sm text-gray-500 mb-2">Last 7 Days</p>
                <div class="flex gap-2">
                  {#each last7Days as day}
                    {@const completed = isCompletedOnDate(habit.id, day.date)}
                    <div class="text-center">
                      <p class="text-xs text-gray-500 mb-1">{day.label}</p>
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center {completed ? 'bg-green-500' : 'bg-gray-100'}">
                        {#if completed}
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>

            <button
              on:click={() => deleteHabit(habit.id)}
              class="text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>