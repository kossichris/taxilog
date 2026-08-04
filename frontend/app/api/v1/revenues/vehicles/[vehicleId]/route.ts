import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : null;

    // Verificar que el vehículo pertenece al usuario
    const vehicleCheck = await query(
      'SELECT id FROM vehicles WHERE id = $1 AND owner_id = $2',
      [(await params).vehicleId, auth.user.id]
    );

    if (vehicleCheck.rows.length === 0) {
      return createErrorResponse('Véhicule non trouvé', 404);
    }

    if (page) {
      // Paginated response
      const limit = 20;
      const offset = (page - 1) * limit;

      const countResult = await query(
        'SELECT COUNT(*) as total FROM revenues WHERE vehicle_id = $1',
        [(await params).vehicleId]
      );

      const result = await query(
        `SELECT r.*, d.name as driver_name
         FROM revenues r
         LEFT JOIN drivers d ON r.driver_id = d.id
         WHERE r.vehicle_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [(await params).vehicleId, limit, offset]
      );

      const total = parseInt(countResult.rows[0].total);

      return createSuccessResponse({
        data: result.rows,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      });
    } else {
      // All revenues
      const result = await query(
        `SELECT r.*, d.name as driver_name
         FROM revenues r
         LEFT JOIN drivers d ON r.driver_id = d.id
         WHERE r.vehicle_id = $1
         ORDER BY r.created_at DESC`,
        [(await params).vehicleId]
      );

      return createSuccessResponse(result.rows);
    }
  } catch (error) {
    console.error('Error fetching revenues:', error);
    return createErrorResponse('Erreur lors du chargement des recettes', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const { driverId, amount, description, date } = await request.json();

    // Verify vehicle belongs to user
    const vehicleCheck = await query(
      'SELECT id FROM vehicles WHERE id = $1 AND owner_id = $2',
      [(await params).vehicleId, auth.user.id]
    );

    if (vehicleCheck.rows.length === 0) {
      return createErrorResponse('Véhicule non trouvé', 404);
    }

    const result = await query(
      `INSERT INTO revenues (vehicle_id, driver_id, amount, description, date, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW())
       RETURNING *`,
      [(await params).vehicleId, driverId, amount, description, date]
    );

    return createSuccessResponse(result.rows[0], 201);
  } catch (error) {
    console.error('Error creating revenue:', error);
    return createErrorResponse('Erreur lors de la création de la recette', 500);
  }
}
