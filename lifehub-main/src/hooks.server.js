import { getUserFromCookies } from '$lib/server/auth.js';
import prisma from '$lib/server/prisma.js';

export async function handle({ event, resolve }) {
  const userId = getUserFromCookies(event.cookies);
  
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });
    
    event.locals.user = user;
  }
  
  return resolve(event);
}