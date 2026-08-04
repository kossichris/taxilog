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
      `SELECT COALESCE(SUM(CAST(r.amount AS DECIMAL)), 0) as total
       FROM revenues r
       JOIN vehicles v ON r.vehicle_id = v.id
       WHERE v.owner_id = $1 AND r.status = 'VALIDATED'`,
      [auth.user.id]
    );

    return createSuccessResponse({
      total: parseFloat(result.rows[0].total),
    });
  } catch (error) {
    console.error('Error fetching total revenues:', error);
    return createErrorResponse('Erreur lors du chargement des recettes', 500);
  }
}
