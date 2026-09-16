import type { TextMeasurer } from '../../engine/dataOps/columnAutoSize';

const DEFAULT_FONT =
  '12px system-ui, -apple-system, "Segoe UI", sans-serif';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

/**
 * Off-DOM canvas `measureText` (PR-112). Avoids layout reflow during auto-size.
 */
export function createCanvasMeasureText(font = DEFAULT_FONT): TextMeasurer {
  if (typeof document !== 'undefined') {
    if (!canvas) {
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
    }
    if (ctx) {
      ctx.font = font;
      return (text: string) => ctx!.measureText(text).width;
    }
  }
  return (text: string) => text.length * 7;
}
