import { HadeethContentDto } from '../dto/content/hadeeth-content.dto';
import { VocabContentDto } from '../dto/content/vocab-content.dto';
import { CardType } from '../enums/card-type.enum';

export interface Card {
  id: number;
  type: CardType;
  author_id: number;
  is_public: boolean;
  image_source?: string;
  content: HadeethContentDto | VocabContentDto;
}
