import {
  AuthenticatedUser,
  AuthzForbiddenError,
  AuthzService,
  RoleResolver,
} from '@madrasah/common';
import { FlashcardDeckService } from '../../../src/flashcard/flashcard-deck.service';
import { FlashcardDeckRepository } from '../../../src/flashcard/flashcard-deck.repository';
import { ICreateFlashcardDeck } from '../../../src/flashcard/flashcard-deck.repository.interface';

const stubResolver: RoleResolver = { resolve: jest.fn().mockResolvedValue(null) };

const ordinary = (sub = 'u-1'): AuthenticatedUser => ({ sub });
const sysAdmin: AuthenticatedUser = {
  sub: 'admin',
  realm_access: { roles: ['SYSTEM_ADMIN'] },
};

describe('FlashcardDeckService.create — publish gate', () => {
  let service: FlashcardDeckService;
  let deckRepo: jest.Mocked<Partial<FlashcardDeckRepository>>;

  beforeEach(() => {
    deckRepo = {
      create: jest.fn().mockResolvedValue({ id: 'd-1' }),
    };
    service = new FlashcardDeckService(
      deckRepo as unknown as FlashcardDeckRepository,
      new AuthzService(stubResolver),
    );
  });

  const privateDto = (authorId: string): ICreateFlashcardDeck => ({
    authorId,
    title: 'My deck',
    isPublic: false,
  });

  const publicDto = (authorId: string): ICreateFlashcardDeck => ({
    authorId,
    title: 'Public deck',
    isPublic: true,
  });

  it('allows ordinary users to create a private deck', async () => {
    await expect(service.create(ordinary(), privateDto('u-1'))).resolves.toEqual(
      { id: 'd-1' },
    );
    expect(deckRepo.create).toHaveBeenCalledWith(privateDto('u-1'));
  });

  it('blocks ordinary users from creating a public deck', async () => {
    await expect(
      service.create(ordinary(), publicDto('u-1')),
    ).rejects.toBeInstanceOf(AuthzForbiddenError);
    expect(deckRepo.create).not.toHaveBeenCalled();
  });

  it('lets SYSTEM_ADMIN publish a global deck', async () => {
    await expect(service.create(sysAdmin, publicDto('admin'))).resolves.toEqual(
      { id: 'd-1' },
    );
    expect(deckRepo.create).toHaveBeenCalled();
  });
});
