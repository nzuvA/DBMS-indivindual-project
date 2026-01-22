import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function DELETE({ params, cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const habit = await prisma.habit.findUnique({
      where: { id: params.id }
    });

    if (!habit || habit.userId !== userId) {
      return json({ error: 'Habit not found' }, { status: 404 });
    }

    await prisma.habit.delete({
      where: { id: params.id }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Delete habit error:', error);
    return json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}