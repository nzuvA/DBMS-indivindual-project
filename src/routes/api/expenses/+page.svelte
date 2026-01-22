<script>
  import { onMount } from 'svelte';

  let expenses = [];
  let loading = true;
  let showAddForm = false;

  // Form data
  let formData = {
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Health',
    'Education',
    'Other'
  ];

  const categoryColors = {
    'Food': 'bg-green-100 text-green-800',
    'Transport': 'bg-blue-100 text-blue-800',
    'Entertainment': 'bg-purple-100 text-purple-800',
    'Shopping': 'bg-pink-100 text-pink-800',
    'Bills': 'bg-red-100 text-red-800',
    'Health': 'bg-yellow-100 text-yellow-800',
    'Education': 'bg-indigo-100 text-indigo-800',
    'Other': 'bg-gray-100 text-gray-800'
  };

  let error = '';
  let submitting = false;

  onMount(() => {
    loadExpenses();
  });

  async function loadExpenses() {
    try {
      const response = await fetch('/api/expenses?limit=50');
      if (response.ok) {
        expenses = await response.json();
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      loading = false;
    }
  }

  async function handleAddExpense() {
    error = '';
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      error = 'Please enter a valid amount';
      return;
    }

    submitting = true;

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: new Date(formData.date).toISOString(),
          notes: formData.notes || null
        })
      });

      if (response.ok) {
        const newExpense = await response.json();
        expenses = [newExpense, ...expenses];
        
        // Reset form
        formData = {
          amount: '',
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        };
        showAddForm = false;
      } else {
        const data = await response.json();
        error = data.error || 'Failed to add expense';
      }
    } catch (err) {
      error = 'Something went wrong. Please try again.';
    } finally {
      submitting = false;
    }
  }

  async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        expenses = expenses.filter(e => e.id !== id);
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  }

  // Calculate totals
  $: totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  $: expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Expenses</h1>
      <p class="text-gray-600 mt-1">Track and manage your spending</p>
    </div>
    <button
      on:click={() => showAddForm = !showAddForm}
      class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
    >
      {showAddForm ? 'Cancel' : '+ Add Expense'}
    </button>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Total Expenses</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">${totalExpenses.toFixed(2)}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Total Transactions</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{expenses.length}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p class="text-sm font-medium text-gray-600">Average Transaction</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">
        ${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
      </p>
    </div>
  </div>

  <!-- Add Expense Form -->
  {#if showAddForm}
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Add New Expense</h2>
      
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            bind:value={formData.amount}
            placeholder="0.00"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            bind:value={formData.category}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            bind:value={formData.date}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <input
            id="notes"
            type="text"
            bind:value={formData.notes}
            placeholder="Coffee at Starbucks"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        on:click={handleAddExpense}
        disabled={submitting}
        class="mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        {submitting ? 'Adding...' : 'Add Expense'}
      </button>
    </div>
  {/if}

  <!-- Category Breakdown -->
  {#if Object.keys(expensesByCategory).length > 0}
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
      <div class="space-y-3">
        {#each Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]) as [category, amount]}
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1 rounded-full text-sm font-medium {categoryColors[category]}">
                {category}
              </span>
              <div class="flex-1 bg-gray-200 rounded-full h-2 w-48">
                <div
                  class="bg-purple-600 h-2 rounded-full"
                  style="width: {(amount / totalExpenses * 100)}%"
                ></div>
              </div>
            </div>
            <span class="font-semibold text-gray-900">${amount.toFixed(2)}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Expenses List -->
  <div class="bg-white rounded-lg shadow border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-900">All Expenses</h2>
    </div>

    {#if loading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-gray-600">Loading expenses...</p>
      </div>
    {:else if expenses.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-500">No expenses yet. Add your first one!</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each expenses as expense}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-xs font-medium {categoryColors[expense.category]}">
                    {expense.category}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {expense.notes || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                  ${expense.amount.toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    on:click={() => deleteExpense(expense.id)}
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>