// @vitest-environment jsdom
//
// Integration test for the calculator → booking-form wiring — the seam the
// pure unit tests can't reach. It stitches the two modules together exactly
// as the live trip page does:
//   calculator's computePricing()  ──▶ window.__calcState + 'calcStateUpdated'
//   booking-form (live in the DOM)  ──▶ #bf-trip-summary + wa.me / mailto links
//
// We drive the real booking-form.js mounted in a real (jsdom) DOM, and feed it
// a calc state whose price comes from calculator.js's real computePricing — so
// a broken event listener, a renamed element id, or a wrong wa.me number would
// fail here even though every pure unit test still passes.

import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { computePricing, roomLabelFor } = require('../../site/assets/js/calculator.js');

const BF_PATH = require.resolve('../../site/assets/js/booking-form.js');

// Realistic trip dataset (shape mirrors window.TRIP_DATA on a trip page).
const TRIP = {
  name: 'Le Caire & Sharm · Juin 2026',
  dates: ['12 Juin 2026'],
  hotels: [
    {
      id: 'tivoli',
      name: 'Tivoli 4★',
      prices: {
        double: 200000,
        triple: 190000,
        single: 250000,
        child1: 100000,
        child2: 150000,
        baby: 25000,
      },
    },
  ],
  extras: [],
};

// Build the calc state the way calculator.js's render() publishes it, using the
// REAL pricing core so the number flowing into the booking message is genuine.
function publishCalcState(state) {
  const { totalDA, totalUSD, hotel } = computePricing(TRIP, state);
  window.__calcState = {
    tripName: TRIP.name,
    hotel: hotel.name,
    hotelId: state.hotelId,
    date: state.date,
    room: roomLabelFor(state.room),
    adults: state.adults,
    kids: state.kids,
    totalDA,
    totalUSD,
  };
  document.dispatchEvent(new window.CustomEvent('calcStateUpdated'));
  return { totalDA, totalUSD, hotel };
}

const fire = (el, type) => el.dispatchEvent(new window.Event(type, { bubbles: true }));

function fillContact({ name, phone, city }) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    el.value = val;
    fire(el, 'input');
  };
  set('bf-name', name);
  set('bf-phone', phone);
  set('bf-city', city);
  // Blur on phone triggers booking-form's synchronous _validate() + _liveUpdate().
  fire(document.getElementById('bf-phone'), 'blur');
}

beforeEach(() => {
  // Fresh DOM + fresh booking-form boot for every test so state never leaks.
  document.body.innerHTML = '<section id="booking"></section>';
  delete window.__calcState;
  delete require.cache[BF_PATH]; // force re-boot (boot() reads #booking at require time)
  require(BF_PATH); // mounts the form into #booking
});

describe('calculator ↔ booking-form integration (jsdom)', () => {
  const baseState = (o = {}) => ({
    hotelId: 'tivoli',
    date: '12 Juin 2026',
    room: 'double',
    adults: 2,
    kids: [],
    extras: [],
    ...o,
  });

  it('mounts an empty-state summary before any calc selection', () => {
    expect(document.getElementById('bf-trip-summary')).toBeTruthy();
    expect(document.querySelector('.bf-trip-empty')).toBeTruthy();
  });

  it('syncs the trip summary when the calculator publishes state', () => {
    publishCalcState(baseState());
    const summary = document.getElementById('bf-trip-summary');
    expect(document.querySelector('.bf-trip-empty')).toBeNull(); // empty state replaced
    expect(summary.textContent).toContain('Tivoli 4★');
    expect(summary.textContent).toContain('Le Caire & Sharm');
  });

  it('builds a wa.me link to the primary number carrying the calculator total', () => {
    const { totalDA } = publishCalcState(baseState({ adults: 2 }));
    fillContact({ name: 'Ahmed Benkhalifa', phone: '0561 616 266', city: 'Bordj Bou Arreridj' });

    const btn = document.getElementById('bf-send-btn');
    const href = btn.getAttribute('href');
    expect(href.startsWith('https://wa.me/213561616266?text=')).toBe(true);

    const text = decodeURIComponent(href.split('?text=')[1]);
    expect(text).toContain('Tivoli 4★');
    expect(text).toContain('Ahmed Benkhalifa');
    expect(text).toContain('0561 616 266');
    expect(text).toContain('Prix estimé');
    // The real computed total (400000) must appear, however fr-DZ formats it.
    const formatted = new Intl.NumberFormat('fr-DZ').format(totalDA);
    expect(text).toContain(formatted);
  });

  it('enables the send button only when contact fields are valid', () => {
    publishCalcState(baseState());
    const btn = document.getElementById('bf-send-btn');

    // Invalid phone → gate closed
    fillContact({ name: 'Ahmed', phone: '0812345678', city: 'Alger' });
    expect(btn.classList.contains('is-disabled')).toBe(true);
    expect(btn.getAttribute('aria-disabled')).toBe('true');

    // Fix the phone → gate opens
    fillContact({ name: 'Ahmed', phone: '0561616266', city: 'Alger' });
    expect(btn.classList.contains('is-disabled')).toBe(false);
    expect(btn.getAttribute('aria-disabled')).toBe('false');
  });

  it('reflects a price change from a new calculator selection in the message', () => {
    publishCalcState(baseState({ adults: 2 }));
    fillContact({ name: 'Ahmed', phone: '0561616266', city: 'Alger' });

    // User adds a child in the calculator and re-publishes.
    const { totalDA } = publishCalcState(
      baseState({ adults: 2, kids: [{ age: 4, type: 'child_a' }] }),
    );
    fire(document.getElementById('bf-phone'), 'blur'); // re-render the preview

    const text = decodeURIComponent(
      document.getElementById('bf-send-btn').getAttribute('href').split('?text=')[1],
    );
    expect(text).toContain('Enfants/Bébés : 1');
    expect(text).toContain(new Intl.NumberFormat('fr-DZ').format(totalDA)); // 500000
  });
});
