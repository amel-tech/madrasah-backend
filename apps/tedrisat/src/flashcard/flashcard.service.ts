import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AuthenticatedUser,
  AuthzForbiddenError,
  AuthzService,
} from '@madrasah/common';
import { FlashcardRepository } from './flashcard.repository';
import {
  ICreateFlashcard,
  IFlashcard,
  IFlashcardProgress,
  IUpdateFlashcard,
} from './flashcard.repository.interface';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { CreateFlashcardProgressDto } from './dto/create-flashcard-progress.dto';
import { CardIncludeEnum } from './domain/card-include.enum';

const validIncludes = new Set<string>(Object.values(CardIncludeEnum));

function toIncludeSet(include?: string[]): Set<CardIncludeEnum> {
  if (!include) return new Set();
  return new Set(
    include.filter((v): v is CardIncludeEnum => validIncludes.has(v)),
  );
}

/**
 * Card CRUD is authorized upstream by `@Authz` on the controller (cards
 * inherit their parent deck's rules through the `flashcard-deck`
 * matrix row).
 *
 * `replaceManyProgress` is the exception: the batch may touch many
 * cards across many decks, which the single-resource `@Authz` resolver
 * cannot express. The check therefore lives here — before any write,
 * every referenced card's parent deck must be visible to the caller
 * (public OR owned), or the entire batch is rejected.
 */
@Injectable()
export class FlashcardService {
  constructor(
    private readonly cardRepo: FlashcardRepository,
    private readonly authz: AuthzService,
  ) {}

  async findById(
    id: string,
    userId: string,
    include?: string[],
  ): Promise<IFlashcard | null> {
    return this.cardRepo.findById(id, userId, toIncludeSet(include));
  }

  async findByDeckId(
    deckId: string,
    userId: string,
    include?: string[],
  ): Promise<IFlashcard[]> {
    return this.cardRepo.findByDeckId(deckId, userId, toIncludeSet(include));
  }

  async createMany(
    deckId: string,
    authorId: string,
    cards: CreateFlashcardDto[],
  ): Promise<IFlashcard[]> {
    const newCards: ICreateFlashcard[] = cards.map((card) => ({
      ...card,
      deckId,
      authorId,
    }));
    return this.cardRepo.createMany(newCards);
  }

  async replaceManyProgress(
    user: AuthenticatedUser,
    progress: CreateFlashcardProgressDto[],
  ): Promise<IFlashcardProgress[]> {
    if (progress.length === 0) return [];
    await this.assertCanWriteProgress(user, progress);
    const progressWithUser = progress.map((data) => ({
      userId: user.sub,
      ...data,
    }));
    return this.cardRepo.replaceManyProgress(progressWithUser);
  }

  async update(
    id: string,
    updates: IUpdateFlashcard,
  ): Promise<IFlashcard | null> {
    return this.cardRepo.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.cardRepo.delete(id);
  }

  /**
   * Verify every flashcardId in the batch belongs to a deck the caller
   * can view (public or owned). NotFoundException for an id that
   * doesn't exist — lets the client fix a bad reference.
   * AuthzForbiddenError if any belongs to a private deck owned by
   * someone else. SYSTEM_ADMIN bypasses the check entirely.
   */
  private async assertCanWriteProgress(
    user: AuthenticatedUser,
    progress: CreateFlashcardProgressDto[],
  ): Promise<void> {
    if (this.authz.isSystemAdmin(user)) return;

    const requestedIds = [...new Set(progress.map((p) => p.flashcardId))];
    const visibility = await this.cardRepo.findVisibilityByIds(requestedIds);

    if (visibility.length !== requestedIds.length) {
      const found = new Set(visibility.map((v) => v.cardId));
      const missing = requestedIds.filter((id) => !found.has(id));
      throw new NotFoundException(
        `Flashcards not found: ${missing.join(', ')}`,
      );
    }

    const unreachable = visibility.filter(
      (row) => !row.isPublic && row.authorId !== user.sub,
    );
    if (unreachable.length > 0) {
      throw new AuthzForbiddenError(
        'Progress contains flashcards in decks the caller cannot view',
        {
          userId: user.sub,
          unreachableCardIds: unreachable.map((row) => row.cardId),
          unreachableDeckIds: [
            ...new Set(unreachable.map((row) => row.deckId)),
          ],
        },
      );
    }
  }
}
