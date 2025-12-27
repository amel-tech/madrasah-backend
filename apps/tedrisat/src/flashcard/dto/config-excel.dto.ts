// users/config/user-excel.config.ts

import { ExcelSheetConfig } from '@madrasah/common';
import { PickType } from '@nestjs/swagger';
import { CreateFlashcardDto } from './create-flashcard.dto';
import { FlashcardType } from '../domain/flashcard-type.enum';

export class FlashcardColumnDto extends PickType(CreateFlashcardDto, [
  'type',
  'contentFront',
  'contentBack',
] as const) {}

export const FLASHCARD_EXCEL_CONFIG: ExcelSheetConfig<FlashcardColumnDto> = {
  sheetName: 'Cards',
  columns: [
    {
      key: 'type',
      header: 'Card Type',
      width: 25,
    },
    {
      key: 'contentFront',
      header: 'Content Front',
      width: 60,
    },
    {
      key: 'contentBack',
      header: 'Content Back',
      width: 60,
    },
  ],
  examples: [
    {
      type: FlashcardType.HADEETH,
      contentBack: 'اَلْحَمْدُ عَلٰي النِّعْمَةِ أَمَانٌ لِزَوَالِهِ',
      contentFront:
        '“Cenâb-ı Hakk’ın ni’metlerine şükür, o ni’metin zevâline (yok olmasına) emândır.” (Deylemî)',
    },
    {
      type: FlashcardType.VOCABULARY,
      contentFront: 'أهلاً',
      contentBack: 'selam',
    },
  ],
};
