'use server';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getEnvSingle } from '../env';
import { Session } from '../type';
import { parseDuration } from '../lib/time';
import { Role } from '../enum';

const key = new TextEncoder().encode(getEnvSingle('SESSION_KEY'));

export async function encrypt(session: Session) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(paylpad: Session) {
  const expiresAt = new Date(Date.now() + parseDuration('90d'));
  const session = await encrypt(paylpad);
  (await cookies()).set('x-kopjum-session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookie = await cookies();

  const session = await decrypt(cookie.get('x-kopjum-session')?.value);
  if (!session?.userId) {
    redirect('/login');
  }

  return {
    userId: session.userId as string,
    username: session.username as string,
    role: session.role as Role,
  } satisfies Session;
}

export async function deleteSession() {
  (await cookies()).delete('x-kopjum-session');
  redirect('/');
}
