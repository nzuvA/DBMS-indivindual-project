import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma.js';
import { hashPassword, generateToken } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return json({ error: 'Email already registered' }, { status: 400 });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password)
      }
    });

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    cookies.set('token', token, {
      path: '/',
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return json({ error: 'Registration failed' }, { status: 500 });
  }
}