import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function GET({ cookies, url }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit
    });

    return json(expenses);
  } catch (error) {
    console.error('Expenses error:', error);
    return json({ error: 'Failed to load expenses' }, { status: 500 });
  }
}

export async function POST({ request, cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, category, date, notes } = await request.json();

    if (!amount || amount <= 0) {
      return json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!category) {
      return json({ error: 'Category is required' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        notes: notes || null
      }
    });

    return json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    return json({ error: 'Failed to create expense' }, { status: 500 });
  }
}