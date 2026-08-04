import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    // Get revenues for this driver
    const result = await query(
      `SELECT r.*, d.name as driver_name, v.plate as vehicle_plate
       FROM revenues r
       INNER JOIN drivers d ON r.driver_id = d.id
       INNER JOIN vehicles v ON r.vehicle_id = v.id
       WHERE d.user_id = $1
       ORDER BY r.date DESC`,
      [auth.user.id]
    );

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Error fetching driver revenues:', error);
    return createErrorResponse('Erreur lors du chargement des revenus', 500);
  }
}
