export class FlashcardDeck {
  constructor(
    public readonly authorId: number,
    public readonly title: string,
    public readonly isPublic: boolean,
    public readonly description?: string,
  ) {}
}
