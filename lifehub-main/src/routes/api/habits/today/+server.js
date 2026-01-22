import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function GET({ cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const habits = await prisma.habit.findMany({
      where: { userId }
    });

    return json(habits);
  } catch (error) {
    console.error('Habits error:', error);
    return json({ error: 'Failed to load habits' }, { status: 500 });
  }
}