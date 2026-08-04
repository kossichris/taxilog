import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ExportService } from '../common/services/export.service';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private exportService: ExportService,
  ) {}

  @Get('owner/:format')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async exportOwnerReport(
    @Param('format') format: 'pdf' | 'excel',
    @Response() res: any,
    @Request() req: any,
  ) {
    const reportData = await this.reportsService.generateOwnerReport(
      req.user.id,
    );

    const exportData = {
      vehiclePlate: 'Rapport Global',
      startDate: new Date(),
      endDate: new Date(),
      items: reportData.items.map((item) => ({
        date: item.date,
        name: item.vehicle,
        amount: item.amount,
        status: item.status,
      })),
      total: reportData.totalRevenues,
      validated: reportData.items
        .filter((i) => i.status === 'VALIDATED')
        .reduce((sum, i) => sum + i.amount, 0),
    };

    if (format === 'pdf') {
      const pdf = await this.exportService.generateOwnerReportPDF(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="rapport_taxilog_${new Date().toISOString().split('T')[0]}.pdf"`,
      );
      res.send(pdf);
    } else {
      const excel = await this.exportService.generateOwnerReportExcel(
        reportData,
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="rapport_taxilog_${new Date().toISOString().split('T')[0]}.xlsx"`,
      );
      res.send(excel);
    }
  }
}
