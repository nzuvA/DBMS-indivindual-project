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
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return json(habits);
  } catch (error) {
    console.error('Habits error:', error);
    return json({ error: 'Failed to load habits' }, { status: 500 });
  }
}

export async function POST({ request, cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return json({ error: 'Name is required' }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    return json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    return json({ error: 'Failed to create habit' }, { status: 500 });
  }
}