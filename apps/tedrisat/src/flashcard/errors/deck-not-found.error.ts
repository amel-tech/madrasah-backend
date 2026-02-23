import { ErrorContext, NotFoundError } from '@madrasah/common';

export class DeckNotFoundError extends NotFoundError {
  static readonly code = 'DECK_NOT_FOUND';

  constructor(deckId: string, context?: ErrorContext) {
    super(DeckNotFoundError.code, `Deck with id ${deckId} not found`, context);
  }
}
