// interfaces/excel-column.interface.ts

export interface ExcelColumnOptions {
  header: string;          
  width?: number;          
  order?: number;          
  transform?: (value: any) => any; 
  format?: (value: any) => any;
}

export interface ExcelColumnMetadata extends ExcelColumnOptions {
  propertyKey: string;
}

export interface ExcelSheetConfig<T> {
  sheetName?: string;
  columns: ExcelColumnConfig<T>[];
  examples?: T[];      
}

export type ExcelColumnConfig<T> = {
  key: keyof T;
  header: string;
  width?: number;
  transform?: (value: any) => any;
  format?: (value: any) => any;
};

export interface ExcelParseOptions {
  requireAllColumns?: boolean; 
  minRows?: number;
  maxRows?: number;
  allowEmptyRows?: boolean;
}

export class ExcelParseException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'ExcelParseException';
  }
}

