import { Injectable } from '@nestjs/common';
import {
  AuthenticatedUser,
  AuthzForbiddenError,
  AuthzService,
} from '@madrasah/common';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import {
  ICreateFlashcardDeck,
  IFlashcardDeck,
  IFlashcardDeckFilters,
  IFlashcardDeckUserCollectionItem,
  IUpdateFlashcardDeck,
} from './flashcard-deck.repository.interface';

@Injectable()
export class FlashcardDeckService {
  constructor(
    private readonly deckRepo: FlashcardDeckRepository,
    private readonly authz: AuthzService,
  ) {}

  async findById(
    id: string,
    include?: string[],
  ): Promise<IFlashcardDeck | null> {
    const includeSet = new Set(include);
    return this.deckRepo.findById(id, includeSet);
  }

  async findAll(include?: string[]): Promise<IFlashcardDeck[]> {
    const includeSet = new Set(include);
    return this.deckRepo.findAll(includeSet);
  }

  async findAllVisibleToUser(
    userId: string,
    filters?: IFlashcardDeckFilters,
    include?: string[],
  ): Promise<IFlashcardDeck[]> {
    const includeSet = new Set(include);
    return this.deckRepo.findAllVisibleToUser(userId, filters, includeSet);
  }

  async findAllByUser(userId: string): Promise<IFlashcardDeck[]> {
    return this.deckRepo.findAllByUser(userId);
  }

  /**
   * Create a flashcard deck. The matrix grants `create_private_deck` to
   * PUBLIC so any authenticated caller can create their own deck; the
   * matrix does NOT grant any path to creating a public/global deck
   * outside SYSTEM_ADMIN. This gate enforces that asymmetry — `isPublic`
   * in the DTO is silently allowed only for callers carrying the
   * SYSTEM_ADMIN realm role.
   */
  async create(
    user: AuthenticatedUser,
    newDeck: ICreateFlashcardDeck,
  ): Promise<IFlashcardDeck> {
    if (newDeck.isPublic && !this.authz.isSystemAdmin(user)) {
      throw new AuthzForbiddenError(
        'Only system administrators can create public flashcard decks',
        { userId: user.sub },
      );
    }
    return this.deckRepo.create(newDeck);
  }

  async addToUserCollection(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUserCollectionItem> {
    return this.deckRepo.addToUserCollection(userId, deckId);
  }

  async update(
    id: string,
    updates: IUpdateFlashcardDeck,
  ): Promise<IFlashcardDeck | null> {
    return this.deckRepo.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.deckRepo.delete(id);
  }

  async removeFromUserCollection(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUserCollectionItem> {
    return this.deckRepo.removeFromUserCollection(userId, deckId);
  }
}
