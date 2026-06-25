import { ENTITIES, MATRIX, ROLES, SCOPES } from '@madrasah/common';

describe('auth-matrix structural invariants', () => {
  it('every entity has at least one entry', () => {
    const empty = Object.values(ENTITIES).filter(
      (entity) => Object.keys(MATRIX[entity] ?? {}).length === 0,
    );
    expect(empty).toEqual([]);
  });

  it('every scope referenced in the matrix is a declared scope', () => {
    const validScopes = new Set<string>(Object.values(SCOPES));
    const bad: Array<{ entity: string; role: string; scope: string }> = [];
    for (const entity of Object.values(ENTITIES)) {
      const rows = MATRIX[entity] ?? {};
      for (const role of Object.keys(rows)) {
        for (const scope of rows[role as keyof typeof rows] ?? []) {
          if (!validScopes.has(scope)) {
            bad.push({ entity, role, scope });
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('every role used in the matrix is a declared role', () => {
    const validRoles = new Set<string>(Object.values(ROLES));
    const bad: Array<{ entity: string; role: string }> = [];
    for (const entity of Object.values(ENTITIES)) {
      const rows = MATRIX[entity] ?? {};
      for (const role of Object.keys(rows)) {
        if (!validRoles.has(role)) {
          bad.push({ entity, role });
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('SYSTEM_ADMIN is never listed in any matrix row — bypass is the only path', () => {
    const leaks: Array<{ entity: string }> = [];
    for (const entity of Object.values(ENTITIES)) {
      const rows = MATRIX[entity] ?? {};
      if (ROLES.SYSTEM_ADMIN in rows) {
        leaks.push({ entity });
      }
    }
    expect(leaks).toEqual([]);
  });

  it('flashcard-deck PUBLIC grants view (anyone authenticated can see public decks)', () => {
    expect(
      MATRIX[ENTITIES.FLASHCARD_DECK][ROLES.PUBLIC]?.includes(SCOPES.VIEW),
    ).toBe(true);
  });

  it('flashcard-deck PUBLIC grants create_private_deck (anyone can create their own)', () => {
    expect(
      MATRIX[ENTITIES.FLASHCARD_DECK][ROLES.PUBLIC]?.includes(
        SCOPES.CREATE_PRIVATE_DECK,
      ),
    ).toBe(true);
  });

  it('flashcard-deck PUBLIC does NOT grant manage scopes (gate stays SYSTEM_ADMIN-only)', () => {
    const pubScopes = MATRIX[ENTITIES.FLASHCARD_DECK][ROLES.PUBLIC] ?? [];
    expect(pubScopes).not.toContain(SCOPES.MANAGE_PRIVATE_DECK);
    expect(pubScopes).not.toContain(SCOPES.MANAGE_FLASHCARDS);
  });

  it('course PUBLIC grants enroll (anyone authenticated may request enrollment)', () => {
    expect(MATRIX[ENTITIES.COURSE][ROLES.PUBLIC]).toEqual([SCOPES.ENROLL]);
  });

  it('kosk PUBLIC grants view only — CREATE_KOSK is SYSTEM_ADMIN-only', () => {
    expect(MATRIX[ENTITIES.KOSK][ROLES.PUBLIC]).toEqual([SCOPES.VIEW]);
  });

  it('CREATE_KOSK is intentionally absent from every kosk matrix row', () => {
    const koskRows = MATRIX[ENTITIES.KOSK] ?? {};
    const rolesWithCreate = Object.entries(koskRows)
      .filter(([, scopes]) => scopes?.includes(SCOPES.CREATE_KOSK))
      .map(([role]) => role);
    expect(rolesWithCreate).toEqual([]);
  });

  it('madrasah PUBLIC grants view and donate (plan §4.4)', () => {
    expect(MATRIX[ENTITIES.MADRASAH][ROLES.PUBLIC]).toEqual([
      SCOPES.VIEW,
      SCOPES.DONATE,
    ]);
  });
});
