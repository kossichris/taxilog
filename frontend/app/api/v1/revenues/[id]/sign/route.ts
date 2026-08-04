import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const { signature } = await request.json();

    const result = await query(
      `UPDATE revenues
       SET signature = $1, status = 'SIGNED', updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [signature, (await params).id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Recette non trouvée', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Error signing revenue:', error);
    return createErrorResponse('Erreur lors de la signature', 500);
  }
}
