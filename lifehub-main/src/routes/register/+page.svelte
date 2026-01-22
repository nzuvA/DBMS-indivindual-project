<script>
  let email = '';
  let password = '';
  let name = '';
  let error = '';
  let loading = false;

  async function handleRegister() {
    error = '';
    loading = true;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to dashboard on success
        window.location.href = '/dashboard';
      } else {
        error = data.error || 'Registration failed';
      }
    } catch (err) {
      error = 'Something went wrong. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
      <p class="text-gray-600">Join LifeHub to start tracking your life</p>
    </div>

    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        {error}
      </div>
    {/if}

    <div class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="John Doe"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          required
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="john@example.com"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          required
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          required
        />
        <p class="text-xs text-gray-500 mt-1">At least 6 characters</p>
      </div>

      <button
        on:click={handleRegister}
        disabled={loading}
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </div>

    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Already have an account?
        <a href="/login" class="text-blue-600 hover:text-blue-700 font-semibold">
          Sign in
        </a>
      </p>
    </div>
  </div>
</div>