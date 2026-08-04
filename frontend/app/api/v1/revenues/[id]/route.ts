import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const result = await query(
      `DELETE FROM revenues WHERE id = $1 RETURNING *`,
      [(await params).id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Recette non trouvée', 404);
    }

    return createSuccessResponse({ message: 'Recette supprimée' });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return createErrorResponse('Erreur lors de la suppression', 500);
  }
}
