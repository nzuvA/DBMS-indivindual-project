import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function DELETE({ params, cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the expense belongs to the user
    const expense = await prisma.expense.findUnique({
      where: { id: params.id }
    });

    if (!expense || expense.userId !== userId) {
      return json({ error: 'Expense not found' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id: params.id }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Delete expense error:', error);
    return json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}