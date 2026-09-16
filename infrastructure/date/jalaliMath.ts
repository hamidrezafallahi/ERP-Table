/**
 * Jalali ↔ Gregorian conversion (PR-128).
 * Algorithm adapted from the public-domain jalaali-js approach.
 */

export function isJalaliLeap(jy: number): boolean {
  return jalaliLeapOffset(jy) === 0;
}

function jalaliLeapOffset(jy: number): number {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  let jp = breaks[0]!;
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i]!;
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;
  if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;
  let leap = ((((n + 1) % 33) - 1) % 4);
  if (leap === -1) leap = 4;
  return leap;
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): { gy: number; gm: number; gd: number } {
  const r = jalaliToJdn(jy, jm, jd);
  return jdnToGregorian(r);
}

export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): { jy: number; jm: number; jd: number } {
  return jdnToJalali(gregorianToJdn(gy, gm, gd));
}

export function jalaliToGregorianDate(jy: number, jm: number, jd: number): Date {
  const g = jalaliToGregorian(jy, jm, jd);
  return new Date(Date.UTC(g.gy, g.gm - 1, g.gd, 12, 0, 0));
}

export function gregorianDateToJalali(date: Date): {
  jy: number;
  jm: number;
  jd: number;
} {
  return gregorianToJalali(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function div(a: number, b: number): number {
  return Math.floor(a / b);
}

function gregorianToJdn(gy: number, gm: number, gd: number): number {
  const a = div(14 - gm, 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  return (
    gd +
    div(153 * m + 2, 5) +
    365 * y +
    div(y, 4) -
    div(y, 100) +
    div(y, 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): { gy: number; gm: number; gd: number } {
  let a = jdn + 32044;
  const b = div(4 * a + 3, 146097);
  a -= div(146097 * b, 4);
  const c = div(4 * a + 3, 1461);
  a -= div(1461 * c, 4);
  const d = div(5 * a + 2, 153);
  const gd = a - div(153 * d + 2, 5) + 1;
  const gm = d + 3 - 12 * div(d, 10);
  const gy = 100 * b + c - 4800 + div(d, 10);
  return { gy, gm, gd };
}

function jalaliToJdn(jy: number, jm: number, jd: number): number {
  const epbase = jy - (jy >= 0 ? 474 : 473);
  const epyear = 474 + (epbase % 2820);
  return (
    jd +
    (jm <= 7 ? (jm - 1) * 31 : (jm - 1) * 30 + 6) +
    div(epyear * 682 - 110, 2816) +
    (epyear - 1) * 365 +
    div(epbase, 2820) * 1029983 +
    (1948320 - 1)
  );
}

function jdnToJalali(jdn: number): { jy: number; jm: number; jd: number } {
  const depoch = jdn - jalaliToJdn(475, 1, 1);
  const cycle = div(depoch, 1029983);
  const cyear = depoch % 1029983;
  let ycycle: number;
  if (cyear === 1029982) {
    ycycle = 2820;
  } else {
    const aux1 = div(cyear, 366);
    const aux2 = cyear % 366;
    ycycle = div(2134 * aux1 + 2816 * aux2 + 2815, 1028522) + aux1 + 1;
  }
  const jy = ycycle + 2820 * cycle + 474;
  const yday = jdn - jalaliToJdn(jy, 1, 1) + 1;
  const jm = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
  const jd = jdn - jalaliToJdn(jy, jm, 1) + 1;
  return { jy, jm, jd };
}
