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
    const result = await query(
      `UPDATE revenues
       SET status = 'VALIDATED', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [(await params).id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Recette non trouvée', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Error validating revenue:', error);
    return createErrorResponse('Erreur lors de la validation', 500);
  }
}
