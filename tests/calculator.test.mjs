import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

// calculator.js exports via CommonJS (UMD-style guard); pull it in with require.
const require = createRequire(import.meta.url);
const { computePricing, roomLabelFor } = require('../site/assets/js/calculator.js');

// Fixture mirrors the shape of window.TRIP_DATA injected on each trip page
// (see site/cairo-sharm/index.html). Round numbers keep assertions readable.
const TRIP = {
  name: 'Test Trip',
  dates: ['12 Juin 2026'],
  hotels: [
    {
      id: 'tivoli',
      name: 'Tivoli 4★',
      prices: { double: 200000, triple: 190000, single: 250000, child1: 100000, child2: 150000, baby: 25000 },
    },
    {
      // Intentionally missing `triple` and `child2` to exercise the fallbacks.
      id: 'sparse',
      name: 'Sparse Hotel',
      prices: { double: 180000, single: 230000, child1: 90000, baby: 20000 },
    },
  ],
  extras: [],
};

const baseState = (overrides = {}) => ({
  hotelId: 'tivoli',
  date: '12 Juin 2026',
  room: 'double',
  adults: 2,
  kids: [],
  extras: [],
  ...overrides,
});

describe('roomLabelFor', () => {
  it('maps known room keys to French labels', () => {
    expect(roomLabelFor('double')).toBe('Double');
    expect(roomLabelFor('triple')).toBe('Triple');
    expect(roomLabelFor('single')).toBe('Individuelle');
  });

  it('returns the raw key for unknown room types', () => {
    expect(roomLabelFor('penthouse')).toBe('penthouse');
  });
});

describe('computePricing — guards', () => {
  it('returns null when trip is missing', () => {
    expect(computePricing(null, baseState())).toBeNull();
    expect(computePricing(undefined, baseState())).toBeNull();
  });

  it('returns null when the selected hotel id does not exist', () => {
    expect(computePricing(TRIP, baseState({ hotelId: 'nope' }))).toBeNull();
  });
});

describe('computePricing — adults & room rates', () => {
  it('multiplies the room rate by the adult count', () => {
    const { totalDA, totalUSD, lines } = computePricing(TRIP, baseState({ adults: 2 }));
    expect(totalDA).toBe(400000); // 200000 × 2
    expect(totalUSD).toBe(0);
    expect(lines).toHaveLength(1);
    expect(lines[0].currency).toBe('DA');
  });

  it('uses the single-room rate when room=single', () => {
    const { totalDA } = computePricing(TRIP, baseState({ room: 'single', adults: 1 }));
    expect(totalDA).toBe(250000);
  });

  it('uses the triple-room rate when room=triple', () => {
    const { totalDA } = computePricing(TRIP, baseState({ room: 'triple', adults: 3 }));
    expect(totalDA).toBe(570000); // 190000 × 3
  });

  it('falls back to the double rate when the room rate key is absent', () => {
    // `sparse` hotel has no `triple` price → falls back to double (180000)
    const { totalDA } = computePricing(TRIP, baseState({ hotelId: 'sparse', room: 'triple', adults: 2 }));
    expect(totalDA).toBe(360000); // 180000 × 2
  });

  it('singularises the adult label for a single adult', () => {
    const { lines } = computePricing(TRIP, baseState({ adults: 1 }));
    expect(lines[0].label).toContain('1 adulte');
    expect(lines[0].label).not.toContain('adultes');
  });

  it('pluralises the adult label for multiple adults', () => {
    const { lines } = computePricing(TRIP, baseState({ adults: 3 }));
    expect(lines[0].label).toContain('3 adultes');
  });
});

describe('computePricing — children & babies', () => {
  it('prices a baby (age < 2) at the baby rate', () => {
    const { totalDA, lines } = computePricing(TRIP, baseState({ adults: 2, kids: [{ age: 0, type: 'baby' }] }));
    expect(totalDA).toBe(400000 + 25000);
    expect(lines.find(l => l.label.startsWith('Bébé'))).toBeTruthy();
  });

  it('prices the first child at child1 and the second at child2', () => {
    const kids = [{ age: 4, type: 'child_a' }, { age: 9, type: 'child_b' }];
    const { totalDA, lines } = computePricing(TRIP, baseState({ adults: 2, kids }));
    // adults 400000 + child1 100000 + child2 150000
    expect(totalDA).toBe(650000);
    expect(lines[1].amount).toBe(100000); // 1st child → child1
    expect(lines[2].amount).toBe(150000); // 2nd child → child2
    expect(lines[1].label).toContain('1ᵉʳ');
  });

  it('does not let babies consume a child slot (baby between two children)', () => {
    // baby should be priced as baby and NOT advance the child index
    const kids = [
      { age: 4, type: 'child_a' }, // 1st child → child1
      { age: 1, type: 'baby' },    // baby → baby rate, no index advance
      { age: 9, type: 'child_b' }, // still counts as 2nd child → child2
    ];
    const { totalDA } = computePricing(TRIP, baseState({ adults: 2, kids }));
    // 400000 + child1 100000 + baby 25000 + child2 150000
    expect(totalDA).toBe(675000);
  });

  it('prices a third child at child2 as well', () => {
    const kids = [
      { age: 4, type: 'child_a' },
      { age: 5, type: 'child_a' },
      { age: 6, type: 'child_a' },
    ];
    const { lines } = computePricing(TRIP, baseState({ adults: 2, kids }));
    expect(lines[1].amount).toBe(100000); // child1
    expect(lines[2].amount).toBe(150000); // child2
    expect(lines[3].amount).toBe(150000); // child2 again
  });

  it('falls back to child1 when child2 price is missing on the hotel', () => {
    const kids = [{ age: 4, type: 'child_a' }, { age: 9, type: 'child_b' }];
    const { lines } = computePricing(TRIP, baseState({ hotelId: 'sparse', adults: 2, kids }));
    // sparse has no child2 → 2nd child falls back to child1 (90000)
    expect(lines[2].amount).toBe(90000);
  });

  it('uses the 2–5 age label for child_a and 2–11.99 for child_b', () => {
    const { lines } = computePricing(TRIP, baseState({
      adults: 2,
      kids: [{ age: 4, type: 'child_a' }, { age: 9, type: 'child_b' }],
    }));
    expect(lines[1].label).toContain('2–5 ans');
    expect(lines[2].label).toContain('2–11.99 ans');
  });
});

describe('computePricing — extras & dual currency', () => {
  it('ignores unchecked extras', () => {
    const extras = [{ label: 'Excursion', amount: 5000, currency: 'DA', checked: false }];
    const { totalDA, lines } = computePricing(TRIP, baseState({ extras }));
    expect(totalDA).toBe(400000);
    expect(lines).toHaveLength(1);
  });

  it('adds checked DA extras to the DA total', () => {
    const extras = [{ label: 'Excursion', amount: 5000, currency: 'DA', checked: true }];
    const { totalDA } = computePricing(TRIP, baseState({ extras }));
    expect(totalDA).toBe(405000);
  });

  it('keeps USD extras in a separate total (payable on-site)', () => {
    const extras = [{ label: 'Visa', amount: 30, currency: 'USD', checked: true }];
    const { totalDA, totalUSD } = computePricing(TRIP, baseState({ extras }));
    expect(totalDA).toBe(400000);
    expect(totalUSD).toBe(30);
  });

  it('defaults an extra with no currency to DA', () => {
    const extras = [{ label: 'Mystery', amount: 1000, checked: true }];
    const { totalDA, totalUSD } = computePricing(TRIP, baseState({ extras }));
    expect(totalDA).toBe(401000);
    expect(totalUSD).toBe(0);
  });

  it('tolerates a missing extras array', () => {
    const state = baseState();
    delete state.extras;
    expect(() => computePricing(TRIP, state)).not.toThrow();
  });
});
