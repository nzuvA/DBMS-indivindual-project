import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { getUserFromCookies } from '$lib/server/auth.js';

export async function PATCH({ params, request, cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the task belongs to the user
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    });

    if (!task || task.userId !== userId) {
      return json({ error: 'Task not found' }, { status: 404 });
    }

    const { completed } = await request.json();

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { completed }
    });

    return json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE({ params, cookies }) {
  const userId = getUserFromCookies(cookies);
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the task belongs to the user
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    });

    if (!task || task.userId !== userId) {
      return json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.id }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return json({ error: 'Failed to delete task' }, { status: 500 });
  }
}