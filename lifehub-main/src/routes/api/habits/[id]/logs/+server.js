import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function GET({ params, cookies }) {
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

    const logs = await prisma.habitLog.findMany({
      where: { habitId: params.id },
      orderBy: { date: 'desc' }
    });

    return json(logs);
  } catch (error) {
    console.error('Habit logs error:', error);
    return json({ error: 'Failed to load habit logs' }, { status: 500 });
  }
}

export async function POST({ params, request, cookies }) {
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

    const { date } = await request.json();
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    const log = await prisma.habitLog.create({
      data: {
        habitId: params.id,
        date: logDate,
        completed: true
      }
    });

    return json(log);
  } catch (error) {
    console.error('Create habit log error:', error);
    return json({ error: 'Failed to create habit log' }, { status: 500 });
  }
}