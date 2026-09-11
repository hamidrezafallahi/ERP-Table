import { deflateSync } from 'fflate';

const encoder = new TextEncoder();

function concat(chunks: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

function pad10(n: number): string {
  return String(n).padStart(10, '0');
}

export class PdfBuilder {
  private readonly objects: Uint8Array[] = [];

  addAscii(body: string): number {
    this.objects.push(encoder.encode(body));
    return this.objects.length;
  }

  replaceAscii(objNum: number, body: string): void {
    this.objects[objNum - 1] = encoder.encode(body);
  }

  addFlate(uncompressed: Uint8Array, extraDict = ''): number {
    const compressed = deflateSync(uncompressed, { level: 9 });
    const dict = `<< /Filter /FlateDecode /Length ${compressed.length} ${extraDict}>>`;
    const header = encoder.encode(`${dict}stream\n`);
    const tail = encoder.encode('\nendstream\n');
    this.objects.push(concat([header, compressed, tail]));
    return this.objects.length;
  }

  build(): Uint8Array {
    const parts: Uint8Array[] = [encoder.encode('%PDF-1.4\n%\x80\x80\x80\x80\n')];
    const offsets = [0];
    let pos = parts[0].length;
    for (let i = 0; i < this.objects.length; i += 1) {
      offsets.push(pos);
      const head = encoder.encode(`${i + 1} 0 obj\n`);
      const tail = encoder.encode('endobj\n');
      const body = this.objects[i];
      parts.push(head, body, tail);
      pos += head.length + body.length + tail.length;
    }
    const xrefStart = pos;
    let xref = `xref\n0 ${this.objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= this.objects.length; i += 1) {
      xref += `${pad10(offsets[i] ?? 0)} 00000 n \n`;
    }
    xref += `trailer<< /Size ${this.objects.length + 1} /Root 1 0 R >>\n`;
    xref += `startxref\n${xrefStart}\n%%EOF\n`;
    parts.push(encoder.encode(xref));
    return concat(parts);
  }
}

export function pdfEscapeTextHex(gids: readonly number[]): string {
  return gids.map((g) => g.toString(16).padStart(4, '0')).join('');
}
