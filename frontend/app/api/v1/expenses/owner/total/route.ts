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
      `SELECT COALESCE(SUM(CAST(e.amount AS DECIMAL)), 0) as total
       FROM expenses e
       JOIN vehicles v ON e.vehicle_id = v.id
       WHERE v.owner_id = $1 AND e.status = 'VALIDATED'`,
      [auth.user.id]
    );

    return createSuccessResponse({
      total: parseFloat(result.rows[0].total),
    });
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    return createErrorResponse('Erreur lors du chargement des dépenses', 500);
  }
}
