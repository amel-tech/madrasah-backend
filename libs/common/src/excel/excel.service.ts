// excel.service.ts

import { Injectable, StreamableFile } from '@nestjs/common';
import { Workbook, Worksheet } from 'exceljs';
import { ExcelSheetConfig, ExcelColumnConfig } from './interfaces/excel-column.interface';
import { Readable } from 'stream';

@Injectable()
export class ExcelService {
  
  async generateSample<T extends Record<string, any>>(
    config: ExcelSheetConfig<T>,
    format: 'xlsx' | 'csv' = 'xlsx',
  ): Promise<StreamableFile> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(config.sheetName || 'Sheet1');

    sheet.columns = config.columns.map((col) => ({
      header: col.header,
      key: col.key as string,
      width: col.width || 20,
    }));

    if (config.examples && config.examples.length > 0) {
      const rows = config.examples.map((example) => {
        const row: Record<string, any> = {};
        config.columns.forEach((col) => {
          const value = example[col.key];
          row[col.key as string] = col.format ? col.format(value) : value;
        });
        return row;
      });
      sheet.addRows(rows);
    }

    this.styleHeader(sheet);

    let buffer: Buffer;

    if (format === 'xlsx') {
      buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    } else {
      const chunks: Buffer[] = [];
      const stream = new Readable({ read() {} });
      await workbook.csv.write(stream);
      
      buffer = await new Promise((resolve) => {
        const buffers: any[] = [];
        stream.on('data', (chunk) => buffers.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(buffers)));
      });
      stream.push(null); // Stream'i bitir
    }

    return new StreamableFile(buffer, {
      type: format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv',
      disposition: `attachment; filename=sample.${format}`,
    });
  }
  
  async parseFile<T extends Record<string, any>>(
    buffer: Buffer,
    config: ExcelSheetConfig<T>,
    format: 'xlsx' | 'csv' = 'xlsx',
  ): Promise<T[]> {
    const workbook = new Workbook();

    if (format === 'xlsx') {
        await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } else {
        const stream = Readable.from(buffer);
        await workbook.csv.read(stream);
    }

    const sheet = workbook.worksheets[0];
    return this.parseSheet<T>(sheet, config);
  }

  private parseSheet<T extends Record<string, any>>(
    sheet: Worksheet,
    config: ExcelSheetConfig<T>,
  ): T[] {
    const data: T[] = [];
    const headerMap = new Map<number, ExcelColumnConfig<T>>();

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const headerValue = String(cell.value).trim();
      const columnConfig = config.columns.find(
        (col) => col.header.toLowerCase() === headerValue.toLowerCase(),
      );
      if (columnConfig) {
        headerMap.set(colNumber, columnConfig);
      }
    });
    
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = {} as T;
      let hasData = false;

      headerMap.forEach((columnConfig, colNumber) => {
        const cell = row.getCell(colNumber);
        let value = cell.value;

        if (value !== null && value !== undefined && value !== '') {
          hasData = true;
          
          if (columnConfig.transform) {
            value = columnConfig.transform(value);
          }

          (rowData as any)[columnConfig.key] = value;
        }
      });

      if (hasData) {
        data.push(rowData);
      }
    });

    return data;
  }

  private styleHeader(sheet: Worksheet): void {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  detectFormat(filename: string): 'xlsx' | 'csv' {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'csv' ? 'csv' : 'xlsx';
  }
}