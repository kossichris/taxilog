import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const result = await query(
      `SELECT e.*, v.plate
       FROM expenses e
       JOIN vehicles v ON e.vehicle_id = v.id
       WHERE e.status IN ('PENDING', 'SIGNED')
       ORDER BY e.created_at DESC`
    );

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Error fetching pending expenses:', error);
    return createErrorResponse('Erreur lors du chargement des dépenses en attente', 500);
  }
}
