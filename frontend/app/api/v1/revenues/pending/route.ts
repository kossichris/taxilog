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
      `SELECT r.*, v.plate, u.name as driver_name
       FROM revenues r
       JOIN vehicles v ON r.vehicle_id = v.id
       LEFT JOIN drivers d ON r.driver_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
       WHERE v.owner_id = $1 AND r.status IN ('PENDING', 'SIGNED')
       ORDER BY r.created_at DESC`,
      [auth.user.id]
    );

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Error fetching pending revenues:', error);
    return createErrorResponse('Erreur lors du chargement des recettes en attente', 500);
  }
}
