/**
 * Integer → Persian words for document printing (PR-140).
 * Covers non-negative integers up to 10^15 − 1 (تریلیون scale).
 */

const ONES = [
  '',
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
];

const TENS = [
  '',
  '',
  'بیست',
  'سی',
  'چهل',
  'پنجاه',
  'شصت',
  'هفتاد',
  'هشتاد',
  'نود',
];

const HUNDREDS = [
  '',
  'صد',
  'دویست',
  'سیصد',
  'چهارصد',
  'پانصد',
  'ششصد',
  'هفتصد',
  'هشتصد',
  'نهصد',
];

const SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'] as const;

function joinAnd(parts: string[]): string {
  return parts.filter(Boolean).join(' و ');
}

function underThousand(n: number): string {
  if (n <= 0) return '';
  if (n < 20) return ONES[n]!;
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return joinAnd([TENS[ten]!, ONES[one]!]);
  }
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return joinAnd([HUNDREDS[hundred]!, underThousand(rest)]);
}

export type NumberToPersianWordsOptions = {
  /** Append currency word (`ریال` / `تومان`). */
  currency?: 'rial' | 'toman';
  /** Prefix for negative numbers. Default `منفی`. */
  negativeWord?: string;
};

/**
 * Convert an integer (or truncatable number) to Persian words.
 * Fractional parts are truncated toward zero.
 */
export function numberToPersianWords(
  value: number | bigint,
  options: NumberToPersianWordsOptions = {},
): string {
  let n: bigint;
  if (typeof value === 'bigint') {
    n = value;
  } else {
    if (!Number.isFinite(value)) return '';
    n = BigInt(Math.trunc(value));
  }

  const negative = n < 0n;
  if (negative) n = -n;

  let words: string;
  if (n === 0n) {
    words = 'صفر';
  } else {
    const chunks: string[] = [];
    let scale = 0;
    let remaining = n;
    while (remaining > 0n && scale < SCALES.length) {
      const chunk = Number(remaining % 1000n);
      remaining /= 1000n;
      if (chunk > 0) {
        const body = underThousand(chunk);
        const scaleWord = SCALES[scale]!;
        chunks.unshift(scaleWord ? `${body} ${scaleWord}` : body);
      }
      scale += 1;
    }
    if (remaining > 0n) {
      // Beyond documented range — fall back to digit string
      words = n.toString();
    } else {
      words = joinAnd(chunks);
    }
  }

  if (negative) {
    words = `${options.negativeWord ?? 'منفی'} ${words}`;
  }

  if (options.currency === 'rial') return `${words} ریال`;
  if (options.currency === 'toman') return `${words} تومان`;
  return words;
}
