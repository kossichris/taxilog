import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateAccessToken, getUserById } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const refreshToken = body.refresh_token || body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const user = await getUserById(decoded.sub);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const newAccessToken = generateAccessToken(user.id, user.role);

    return NextResponse.json({
      access_token: newAccessToken,
      user,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
