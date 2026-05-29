import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  validatePhoneFormat,
  ALGERIAN_PHONE_RE,
  classifyFiles,
  FILE_RULES,
  validatePassportExpiry,
  buildBookingMessage,
} = require('../site/assets/js/booking-form.js');

// Lightweight stand-in for the browser File object — classifyFiles only
// reads `.name`, `.type`, `.size`.
const file = (name, type, size) => ({ name, type, size });

describe('validatePhoneFormat (Algerian mobile)', () => {
  it('accepts local 05/06/07 numbers', () => {
    expect(validatePhoneFormat('0561 616 266')).toBe(true);
    expect(validatePhoneFormat('0661234567')).toBe(true);
    expect(validatePhoneFormat('0712345678')).toBe(true);
  });

  it('accepts the +213 international prefix', () => {
    expect(validatePhoneFormat('+213561616266')).toBe(true);
  });

  it('trims surrounding whitespace before testing', () => {
    expect(validatePhoneFormat('  0561 616 266  ')).toBe(true);
  });

  it('rejects landline-style leading digits (08/09/04)', () => {
    expect(validatePhoneFormat('0812345678')).toBe(false);
    expect(validatePhoneFormat('0412345678')).toBe(false);
  });

  it('rejects too-short numbers', () => {
    expect(validatePhoneFormat('0561')).toBe(false);
  });

  it('rejects empty / nullish input', () => {
    expect(validatePhoneFormat('')).toBe(false);
    expect(validatePhoneFormat(undefined)).toBe(false);
    expect(validatePhoneFormat(null)).toBe(false);
  });

  it('rejects letters and foreign formats', () => {
    expect(validatePhoneFormat('+33612345678')).toBe(false);
    expect(validatePhoneFormat('not a phone')).toBe(false);
  });

  it('keeps the exported regex in sync with the #bf-phone pattern attribute', () => {
    // Guards against the JS rule and the HTML pattern silently drifting apart.
    const src = require('node:fs').readFileSync(
      require('node:path').resolve(__dirname, '../site/assets/js/booking-form.js'),
      'utf8',
    );
    const m = src.match(/pattern="\^\(\\\\\+213\|0\)\[5-7\]\[0-9 \]\{8,\}\$"/);
    expect(m, 'FORM_HTML #bf-phone pattern should mirror ALGERIAN_PHONE_RE').toBeTruthy();
    expect(ALGERIAN_PHONE_RE.source).toBe('^(\\+213|0)[5-7][0-9 ]{8,}$');
  });
});

describe('classifyFiles — upload gate', () => {
  const okType = 'image/jpeg';

  it('accepts allowed image types and PDFs', () => {
    const { accepted, errors } = classifyFiles([
      file('a.jpg', 'image/jpeg', 1000),
      file('b.png', 'image/png', 1000),
      file('c.webp', 'image/webp', 1000),
      file('d.pdf', 'application/pdf', 1000),
    ]);
    expect(accepted).toHaveLength(4);
    expect(errors).toHaveLength(0);
  });

  it('rejects unsupported types with an error and no acceptance', () => {
    const { accepted, errors } = classifyFiles([file('evil.svg', 'image/svg+xml', 100)]);
    expect(accepted).toHaveLength(0);
    expect(errors[0]).toContain('type non supporté');
  });

  it('rejects a file over the 8 MB per-file limit', () => {
    const { accepted, errors } = classifyFiles([file('big.jpg', okType, FILE_RULES.MAX_FILE_BYTES + 1)]);
    expect(accepted).toHaveLength(0);
    expect(errors[0]).toContain('trop lourd');
  });

  it('accepts a file exactly at the 8 MB boundary', () => {
    const { accepted } = classifyFiles([file('edge.jpg', okType, FILE_RULES.MAX_FILE_BYTES)]);
    expect(accepted).toHaveLength(1);
  });

  it('enforces the 12-file count cap including pre-existing uploads', () => {
    const batch = Array.from({ length: 5 }, (_, i) => file(`x${i}.jpg`, okType, 100));
    const { accepted, errors } = classifyFiles(batch, { existingCount: 10, existingBytes: 1000 });
    expect(accepted).toHaveLength(2);                 // only room for 2 more (10 + 2 = 12)
    expect(errors.some(e => e.includes('Limite atteinte'))).toBe(true);
  });

  it('enforces the 40 MB total budget across the batch', () => {
    const big = FILE_RULES.MAX_FILE_BYTES; // 8 MB each, all under per-file cap
    const batch = Array.from({ length: 6 }, (_, i) => file(`x${i}.jpg`, okType, big));
    const { accepted, errors } = classifyFiles(batch);
    // 40 MB / 8 MB = 5 fit, the 6th busts the total
    expect(accepted).toHaveLength(5);
    expect(errors.some(e => e.includes('taille totale'))).toBe(true);
  });

  it('counts already-uploaded bytes against the total budget', () => {
    const { accepted, errors } = classifyFiles(
      [file('x.jpg', okType, FILE_RULES.MAX_FILE_BYTES)],
      { existingCount: 1, existingBytes: FILE_RULES.MAX_TOTAL_BYTES }, // already full
    );
    expect(accepted).toHaveLength(0);
    expect(errors.some(e => e.includes('taille totale'))).toBe(true);
  });

  it('returns empty results for an empty file list', () => {
    expect(classifyFiles([])).toEqual({ accepted: [], errors: [] });
  });
});

describe('validatePassportExpiry — "valid ≥ 6 months" rule', () => {
  const from = new Date('2026-05-29');

  it('treats empty expiry as OK (optional field)', () => {
    expect(validatePassportExpiry('', { from })).toEqual({ ok: true, error: null });
    expect(validatePassportExpiry(undefined, { from })).toEqual({ ok: true, error: null });
  });

  it('accepts an expiry more than 6 months out', () => {
    expect(validatePassportExpiry('2027-01-01', { from }).ok).toBe(true);
  });

  it('accepts an expiry exactly 6 months out', () => {
    expect(validatePassportExpiry('2026-11-29', { from }).ok).toBe(true);
  });

  it('rejects an expiry less than 6 months out', () => {
    const res = validatePassportExpiry('2026-08-01', { from });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('6 mois');
  });

  it('rejects an already-expired passport', () => {
    expect(validatePassportExpiry('2025-01-01', { from }).ok).toBe(false);
  });

  it('rejects an unparseable date string', () => {
    const res = validatePassportExpiry('not-a-date', { from });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('invalide');
  });

  it('honours a custom monthsRequired threshold', () => {
    expect(validatePassportExpiry('2026-08-01', { from, monthsRequired: 2 }).ok).toBe(true);
    expect(validatePassportExpiry('2026-08-01', { from, monthsRequired: 6 }).ok).toBe(false);
  });

  it('defaults the reference date to "now" when none is given', () => {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 5);
    const iso = farFuture.toISOString().slice(0, 10);
    expect(validatePassportExpiry(iso).ok).toBe(true);
  });
});

describe('buildBookingMessage', () => {
  const calc = {
    tripName: 'Le Caire & Sharm · Juin 2026',
    hotel: 'Tivoli 4★',
    date: '12 Juin 2026',
    room: 'Double',
    adults: 2,
    kids: [{ age: 4 }],
    totalDA: 400000,
    totalUSD: 30,
  };

  it('includes the trip selection from calc state', () => {
    const msg = buildBookingMessage({ calc, name: 'Ahmed' });
    expect(msg).toContain('Destination : Le Caire & Sharm · Juin 2026');
    expect(msg).toContain('Hôtel : Tivoli 4★');
    expect(msg).toContain('Adultes : 2');
    expect(msg).toContain('Enfants/Bébés : 1');
  });

  it('formats the DA total and surfaces the on-site USD tax', () => {
    const msg = buildBookingMessage({ calc, name: 'Ahmed' });
    expect(msg).toMatch(/Prix estimé : .*DA/);
    expect(msg).toContain('30 USD (sur place)');
  });

  it('falls back to a placeholder when no name is given', () => {
    expect(buildBookingMessage({ calc })).toContain('• Nom : (non renseigné)');
  });

  it('omits empty optional lines (phone, city, notes)', () => {
    const msg = buildBookingMessage({ calc, name: 'Ahmed' });
    expect(msg).not.toContain('Téléphone WA');
    expect(msg).not.toContain('Wilaya/Ville');
    expect(msg).not.toContain('NOTE');
  });

  it('includes only passports that have a name or number', () => {
    const msg = buildBookingMessage({
      calc,
      name: 'Ahmed',
      passports: [
        { name: 'Ahmed Benkhalifa', number: 'AB123456', expiry: '2027-01-01' },
        {}, // empty → excluded
        { number: 'CD789012' },
      ],
    });
    expect(msg).toContain('INFORMATIONS PASSEPORTS');
    expect(msg).toContain('Voyageur 1 : Ahmed Benkhalifa · N° AB123456 · Exp. 2027-01-01');
    expect(msg).toContain('Voyageur 2 : N° CD789012'); // re-indexed, empty one dropped
    expect(msg).not.toContain('Voyageur 3');
  });

  it('notes the number of uploaded passport copies', () => {
    const msg = buildBookingMessage({ calc, name: 'Ahmed', uploadCount: 3 });
    expect(msg).toContain('*3 copie(s) de passeport*');
  });

  it('appends a free-text note when provided', () => {
    const msg = buildBookingMessage({ calc, name: 'Ahmed', notes: 'Lune de miel' });
    expect(msg).toContain('💬 *NOTE :* Lune de miel');
  });

  it('produces a usable message even with an empty calc object', () => {
    const msg = buildBookingMessage({});
    expect(msg).toContain('Destination : —');
    expect(msg).toContain('• Nom : (non renseigné)');
    expect(msg.endsWith('Merci ! ✅')).toBe(true);
  });

  it('survives URL-encoding for the wa.me link without throwing', () => {
    const msg = buildBookingMessage({ calc, name: 'Ahmed & Co', notes: 'a/b?c=d' });
    expect(() => encodeURIComponent(msg)).not.toThrow();
    expect(decodeURIComponent(encodeURIComponent(msg))).toBe(msg);
  });
});
