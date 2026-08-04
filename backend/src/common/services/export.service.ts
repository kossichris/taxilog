import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

export interface ExportData {
  vehiclePlate: string;
  startDate: Date;
  endDate: Date;
  items: Array<{
    date: string;
    name: string;
    amount: number;
    status: string;
  }>;
  total: number;
  validated: number;
}

@Injectable()
export class ExportService {
  generatePDF(data: ExportData): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Rapport TaxiLog', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Véhicule: ${data.vehiclePlate}`, { align: 'center' })
      .text(
        `Période: ${new Date(data.startDate).toLocaleDateString('fr-FR')} - ${new Date(data.endDate).toLocaleDateString('fr-FR')}`,
        { align: 'center' },
      )
      .moveDown(1);

    // Summary
    doc.fontSize(11).font('Helvetica-Bold').text('Résumé');
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Total: ${data.total.toFixed(2)} F`)
      .text(`Validé: ${data.validated.toFixed(2)} F`)
      .text(`En attente: ${(data.total - data.validated).toFixed(2)} F`)
      .moveDown(1);

    // Table header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 300;
    const col4 = 420;
    const rowHeight = 25;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', col1, tableTop);
    doc.text('Chauffeur', col2, tableTop);
    doc.text('Montant', col3, tableTop);
    doc.text('Statut', col4, tableTop);

    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table rows
    let y = tableTop + 30;
    doc.fontSize(9).font('Helvetica');

    data.items.forEach((item) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(item.date, col1, y);
      doc.text(item.name, col2, y);
      doc.text(`${item.amount.toFixed(2)} F`, col3, y);
      doc.text(item.status, col4, y);
      y += rowHeight;
    });

    doc.end();

    return Buffer.concat(buffers);
  }

  async generateExcel(data: ExportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Données');

    // Headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Chauffeur', key: 'name', width: 20 },
      { header: 'Montant', key: 'amount', width: 15 },
      { header: 'Statut', key: 'status', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F5E9' },
    };

    // Add data rows
    data.items.forEach((item) => {
      worksheet.addRow(item);
    });

    // Add summary section
    worksheet.addRow({});
    const summaryRow = worksheet.addRow({
      date: 'TOTAL',
      amount: data.total.toFixed(2),
    });
    summaryRow.font = { bold: true };

    worksheet.addRow({
      date: 'VALIDÉ',
      amount: data.validated.toFixed(2),
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
