import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, createErrorResponse } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    // Récupérer toutes les données du propriétaire
    const revenuesResult = await query(
      `SELECT r.*, v.plate, u.name as driver_name
       FROM revenues r
       JOIN vehicles v ON r.vehicle_id = v.id
       LEFT JOIN drivers d ON r.driver_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
       WHERE v.owner_id = $1 AND r.status = 'VALIDATED'
       ORDER BY r.created_at DESC`,
      [auth.user.id]
    );

    const expensesResult = await query(
      `SELECT e.*, v.plate
       FROM expenses e
       JOIN vehicles v ON e.vehicle_id = v.id
       WHERE v.owner_id = $1 AND e.status = 'VALIDATED'
       ORDER BY e.created_at DESC`,
      [auth.user.id]
    );

    const vehiclesResult = await query(
      `SELECT id, plate, brand, model FROM vehicles WHERE owner_id = $1 AND active = true`,
      [auth.user.id]
    );

    const totalRevenues = revenuesResult.rows.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0);
    const totalExpenses = expensesResult.rows.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

    const reportData = {
      owner: auth.user,
      generatedAt: new Date().toISOString(),
      vehicles: vehiclesResult.rows,
      revenues: revenuesResult.rows,
      expenses: expensesResult.rows,
      totals: {
        revenues: totalRevenues,
        expenses: totalExpenses,
        net: totalRevenues - totalExpenses,
      },
    };

    // Pour maintenant, retourner les données en JSON
    // L'export PDF peut être généré côté client ou avec une bibliothèque comme pdfkit
    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return createErrorResponse('Erreur lors de la génération du rapport', 500);
  }
}
