import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const result = await query(
      'SELECT * FROM vehicles WHERE owner_id = $1 AND active = true ORDER BY created_at DESC',
      [auth.user.id]
    );

    return createSuccessResponse(result.rows);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return createErrorResponse('Erreur lors du chargement des véhicules', 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    const { plate, brand, model, color } = await request.json();

    if (!plate || !brand || !model || !color) {
      return createErrorResponse('Données manquantes', 400);
    }

    const result = await query(
      `INSERT INTO vehicles (owner_id, plate, brand, model, color, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING *`,
      [auth.user.id, plate, brand, model, color]
    );

    return createSuccessResponse(result.rows[0], 201);
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    if (error.code === '23505') { // Unique violation
      return createErrorResponse('Cette immatriculation existe déjà', 409);
    }
    return createErrorResponse('Erreur lors de la création du véhicule', 500);
  }
}
