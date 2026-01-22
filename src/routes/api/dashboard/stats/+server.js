import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function GET({ cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get expenses this month
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const expensesThisMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Get habits count
    const activeHabits = await prisma.habit.count({
      where: { userId }
    });

    // Get tasks count
    const pendingTasks = await prisma.task.count({
      where: { userId, completed: false }
    });

    const completedTasks = await prisma.task.count({
      where: { userId, completed: true }
    });

    return json({
      expensesThisMonth,
      activeHabits,
      habitStreak: 0,
      pendingTasks,
      completedTasks
    });
  } catch (error) {
    console.error('Stats error:', error);
    return json({ error: 'Failed to load stats' }, { status: 500 });
  }
}