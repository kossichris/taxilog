import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, createErrorResponse } from '@/lib/middleware';
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
    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicleCheck = await query(
      'SELECT id, plate, brand, model FROM vehicles WHERE id = $1 AND owner_id = $2',
      [(await params).vehicleId, auth.user.id]
    );

    if (vehicleCheck.rows.length === 0) {
      return createErrorResponse('Véhicule non trouvé', 404);
    }

    const vehicle = vehicleCheck.rows[0];

    const revenuesResult = await query(
      `SELECT r.*, u.name as driver_name
       FROM revenues r
       LEFT JOIN drivers d ON r.driver_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
       WHERE r.vehicle_id = $1 AND r.status = 'VALIDATED'
       ORDER BY r.created_at DESC`,
      [(await params).vehicleId]
    );

    const expensesResult = await query(
      `SELECT * FROM expenses
       WHERE vehicle_id = $1 AND status = 'VALIDATED'
       ORDER BY created_at DESC`,
      [(await params).vehicleId]
    );

    const totalRevenues = revenuesResult.rows.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0);
    const totalExpenses = expensesResult.rows.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

    const reportData = {
      vehicle,
      generatedAt: new Date().toISOString(),
      revenues: revenuesResult.rows,
      expenses: expensesResult.rows,
      totals: {
        revenues: totalRevenues,
        expenses: totalExpenses,
        net: totalRevenues - totalExpenses,
      },
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating vehicle report:', error);
    return createErrorResponse('Erreur lors de la génération du rapport', 500);
  }
}
