<script>
  export let data;

  let mobileMenuOpen = false;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Navbar -->
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <a href="/dashboard" class="text-2xl font-bold text-purple-600">
            LifeHub
          </a>
          
          <!-- Desktop Navigation -->
          <div class="hidden md:flex ml-10 space-x-8">
            <a href="/dashboard" class="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              Dashboard
            </a>
            <a href="/dashboard/expenses" class="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              Expenses
            </a>
            <a href="/dashboard/habits" class="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              Habits
            </a>
            <a href="/dashboard/tasks" class="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium">
              Tasks
            </a>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-700 hidden md:block">
            Welcome, <span class="font-semibold">{data.user.name}</span>
          </span>
          <button
            on:click={handleLogout}
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
          
          <!-- Mobile menu button -->
          <button
            on:click={() => mobileMenuOpen = !mobileMenuOpen}
            class="md:hidden text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-gray-200">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a href="/dashboard" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
            Dashboard
          </a>
          <a href="/dashboard/expenses" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
            Expenses
          </a>
          <a href="/dashboard/habits" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
            Habits
          </a>
          <a href="/dashboard/tasks" class="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
            Tasks
          </a>
        </div>
      </div>
    {/if}
  </nav>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <slot />
  </main>
</div>