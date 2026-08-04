import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    // Get vehicles assigned to this driver
    const result = await query(
      `SELECT DISTINCT v.* FROM vehicles v
       INNER JOIN drivers d ON d.id = ANY(v.driver_ids)
       WHERE d.user_id = $1
       ORDER BY v.created_at DESC`,
      [auth.user.id]
    );

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Error fetching driver vehicles:', error);
    return createErrorResponse('Erreur lors du chargement des véhicules', 500);
  }
}
