import { HadeethContentDto } from '../dto/content/flashcard-hadeeth-content.dto';
import { VocabContentDto } from '../dto/content/flashcard-vocab-content.dto';
import { FlashcardType } from '../enums/flashcard-type.enum';

export interface Flashcard {
  id: number;
  type: FlashcardType;
  author_id: number;
  is_public: boolean;
  image_source?: string;
  content: HadeethContentDto | VocabContentDto;
}
