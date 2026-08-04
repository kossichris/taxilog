import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const result = await query(
      'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2',
      [(await params).id, auth.user.id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Véhicule non trouvé', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return createErrorResponse('Erreur lors du chargement du véhicule', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const { brand, model, color } = await request.json();

    const result = await query(
      `UPDATE vehicles
       SET brand = COALESCE($1, brand),
           model = COALESCE($2, model),
           color = COALESCE($3, color),
           updated_at = NOW()
       WHERE id = $4 AND owner_id = $5
       RETURNING *`,
      [brand, model, color, (await params).id, auth.user.id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Véhicule non trouvé', 404);
    }

    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return createErrorResponse('Erreur lors de la mise à jour du véhicule', 500);
  }
}

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
      'UPDATE vehicles SET active = false, updated_at = NOW() WHERE id = $1 AND owner_id = $2 RETURNING *',
      [(await params).id, auth.user.id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Véhicule non trouvé', 404);
    }

    return createSuccessResponse({ message: 'Véhicule désactivé' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return createErrorResponse('Erreur lors de la suppression du véhicule', 500);
  }
}
