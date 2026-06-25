import { ENTITIES, byBody, byParam, byQuery } from '@madrasah/common';
import { Request } from 'express';

const req = (overrides: Partial<Record<string, unknown>> = {}): Request =>
  ({
    params: {},
    query: {},
    body: {},
    ...overrides,
  }) as unknown as Request;

describe('authz resolvers', () => {
  describe('byParam', () => {
    it('reads :id by default', () => {
      const r = byParam(ENTITIES.COURSE);
      expect(r(req({ params: { id: 'c-1' } }))).toEqual({
        entity: 'course',
        id: 'c-1',
      });
    });

    it('reads a custom param name', () => {
      const r = byParam(ENTITIES.COURSE, 'courseId');
      expect(r(req({ params: { courseId: 'c-1' } }))).toEqual({
        entity: 'course',
        id: 'c-1',
      });
    });

    it('returns empty id when the param is missing (guard rejects as config error)', () => {
      const r = byParam(ENTITIES.COURSE);
      expect(r(req({ params: { wrong: 'c-1' } }))).toEqual({
        entity: 'course',
        id: '',
      });
    });

    it('returns empty id when the param is an array (?id=a&id=b style)', () => {
      const r = byParam(ENTITIES.COURSE);
      expect(r(req({ params: { id: ['a', 'b'] } }))).toEqual({
        entity: 'course',
        id: '',
      });
    });
  });

  describe('byBody', () => {
    it('reads a body field', () => {
      const r = byBody(ENTITIES.KOSK, 'koskId');
      expect(r(req({ body: { koskId: 'k-1' } }))).toEqual({
        entity: 'kosk',
        id: 'k-1',
      });
    });

    it('returns empty id when body is missing', () => {
      const r = byBody(ENTITIES.KOSK, 'koskId');
      expect(r(req({ body: undefined }))).toEqual({ entity: 'kosk', id: '' });
    });
  });

  describe('byQuery', () => {
    it('reads a query field', () => {
      const r = byQuery(ENTITIES.FLASHCARD_DECK, 'deckId');
      expect(r(req({ query: { deckId: 'd-1' } }))).toEqual({
        entity: 'flashcard-deck',
        id: 'd-1',
      });
    });
  });
});
