import { NotFoundException } from '@nestjs/common';
import {
  AuthenticatedUser,
  AuthzForbiddenError,
  AuthzService,
  RoleResolver,
} from '@madrasah/common';
import { FlashcardService } from '../../../src/flashcard/flashcard.service';
import { FlashcardRepository } from '../../../src/flashcard/flashcard.repository';
import { FlashcardProgressStatus } from '../../../src/flashcard/domain/flashcard-progress-status.enum';
import { CreateFlashcardProgressDto } from '../../../src/flashcard/dto/create-flashcard-progress.dto';

const owner = (sub = 'owner-1'): AuthenticatedUser => ({ sub });
const sysAdmin: AuthenticatedUser = {
  sub: 'admin',
  realm_access: { roles: ['SYSTEM_ADMIN'] },
};

const progress = (flashcardId: string): CreateFlashcardProgressDto => ({
  flashcardId,
  status: FlashcardProgressStatus.MASTERED,
});

const stubRoleResolver: RoleResolver = {
  resolve: jest.fn().mockResolvedValue(null),
};

describe('FlashcardService.replaceManyProgress visibility check', () => {
  let service: FlashcardService;
  let cardRepo: jest.Mocked<Partial<FlashcardRepository>>;

  beforeEach(() => {
    cardRepo = {
      findVisibilityByIds: jest.fn(),
      replaceManyProgress: jest.fn(),
    };
    service = new FlashcardService(
      cardRepo as unknown as FlashcardRepository,
      new AuthzService(stubRoleResolver),
    );
  });

  it('writes progress when every card lives in a public deck', async () => {
    (cardRepo.findVisibilityByIds as jest.Mock).mockResolvedValue([
      { cardId: 'c-1', deckId: 'd-1', isPublic: true, authorId: 'someone' },
    ]);
    (cardRepo.replaceManyProgress as jest.Mock).mockResolvedValue([]);

    await service.replaceManyProgress(owner(), [progress('c-1')]);
    expect(cardRepo.replaceManyProgress).toHaveBeenCalledWith([
      { userId: 'owner-1', flashcardId: 'c-1', status: 'MASTERED' },
    ]);
  });

  it('writes progress when caller owns the private deck', async () => {
    (cardRepo.findVisibilityByIds as jest.Mock).mockResolvedValue([
      { cardId: 'c-1', deckId: 'd-1', isPublic: false, authorId: 'owner-1' },
    ]);
    (cardRepo.replaceManyProgress as jest.Mock).mockResolvedValue([]);

    await expect(
      service.replaceManyProgress(owner(), [progress('c-1')]),
    ).resolves.toEqual([]);
  });

  it('denies when ANY referenced card is in a stranger’s private deck', async () => {
    (cardRepo.findVisibilityByIds as jest.Mock).mockResolvedValue([
      { cardId: 'c-1', deckId: 'd-1', isPublic: true, authorId: 'someone' },
      { cardId: 'c-2', deckId: 'd-2', isPublic: false, authorId: 'other' },
    ]);

    await expect(
      service.replaceManyProgress(owner(), [progress('c-1'), progress('c-2')]),
    ).rejects.toMatchObject({
      name: 'AuthzForbiddenError',
      context: {
        userId: 'owner-1',
        unreachableCardIds: ['c-2'],
        unreachableDeckIds: ['d-2'],
      },
    });
    expect(cardRepo.replaceManyProgress).not.toHaveBeenCalled();
  });

  it('throws AuthzForbiddenError before writing any row', async () => {
    (cardRepo.findVisibilityByIds as jest.Mock).mockResolvedValue([
      { cardId: 'c-1', deckId: 'd-1', isPublic: false, authorId: 'other' },
    ]);

    await expect(
      service.replaceManyProgress(owner(), [progress('c-1')]),
    ).rejects.toBeInstanceOf(AuthzForbiddenError);
  });

  it('404s when a referenced flashcardId does not exist', async () => {
    (cardRepo.findVisibilityByIds as jest.Mock).mockResolvedValue([]);

    await expect(
      service.replaceManyProgress(owner(), [progress('ghost')]),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(cardRepo.replaceManyProgress).not.toHaveBeenCalled();
  });

  it('SYSTEM_ADMIN bypasses the visibility check entirely', async () => {
    (cardRepo.replaceManyProgress as jest.Mock).mockResolvedValue([]);
    await service.replaceManyProgress(sysAdmin, [progress('anything')]);
    expect(cardRepo.findVisibilityByIds).not.toHaveBeenCalled();
    expect(cardRepo.replaceManyProgress).toHaveBeenCalled();
  });

  it('no-op for an empty batch (no lookup, no write)', async () => {
    await service.replaceManyProgress(owner(), []);
    expect(cardRepo.findVisibilityByIds).not.toHaveBeenCalled();
    expect(cardRepo.replaceManyProgress).not.toHaveBeenCalled();
  });
});
