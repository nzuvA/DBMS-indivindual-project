<script>
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleLogin() {
    error = '';
    loading = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to dashboard on success
        window.location.href = '/dashboard';
      } else {
        error = data.error || 'Login failed';
      }
    } catch (err) {
      error = 'Something went wrong. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
      <p class="text-gray-600">Sign in to your LifeHub account</p>
    </div>

    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        {error}
      </div>
    {/if}

    <div class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="john@example.com"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
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
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
          required
        />
      </div>

      <button
        on:click={handleLogin}
        disabled={loading}
        class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </div>

    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Don't have an account?
        <a href="/register" class="text-purple-600 hover:text-purple-700 font-semibold">
          Create one
        </a>
      </p>
    </div>
  </div>
</div>