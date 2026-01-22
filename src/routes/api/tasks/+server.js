import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function GET({ cookies, url }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return json(tasks);
  } catch (error) {
    console.error('Tasks error:', error);
    return json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}

export async function POST({ request, cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, priority } = await request.json();

    if (!title || !title.trim()) {
      return json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        priority: priority || 'medium',
        completed: false
      }
    });

    return json(task);
  } catch (error) {
    console.error('Create task error:', error);
    return json({ error: 'Failed to create task' }, { status: 500 });
  }
}