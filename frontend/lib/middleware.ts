import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from './auth';

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Token manquant', status: 401 };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { error: 'Token invalide ou expiré', status: 401 };
  }

  const user = await getUserById(decoded.sub);
  if (!user) {
    return { error: 'Utilisateur non trouvé', status: 404 };
  }

  return { user, error: null, status: 200 };
}

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
