/**
 * View-state value object for virtual scrolling.
 * Lives in Domain types but is NOT an accounting invariant — Adapters drive it.
 */
export class Viewport {
  constructor(
    /** Vertical scroll offset in pixels. */
    public readonly scrollOffset: number,
    /** Visible viewport height in pixels. */
    public readonly viewportSize: number,
    /** Fixed row height in pixels (variable-height later). */
    public readonly rowHeight: number,
    /** Extra rows rendered above/below the window. */
    public readonly overscan: number = 2,
  ) {
    if (viewportSize <= 0) throw new Error('Viewport.viewportSize must be > 0');
    if (rowHeight <= 0) throw new Error('Viewport.rowHeight must be > 0');
    if (overscan < 0) throw new Error('Viewport.overscan must be >= 0');
    if (scrollOffset < 0) throw new Error('Viewport.scrollOffset must be >= 0');
  }

  equals(other: Viewport): boolean {
    return (
      this.scrollOffset === other.scrollOffset &&
      this.viewportSize === other.viewportSize &&
      this.rowHeight === other.rowHeight &&
      this.overscan === other.overscan
    );
  }

  withScrollOffset(scrollOffset: number): Viewport {
    return new Viewport(
      Math.max(0, scrollOffset),
      this.viewportSize,
      this.rowHeight,
      this.overscan,
    );
  }

  withViewportSize(viewportSize: number): Viewport {
    return new Viewport(
      this.scrollOffset,
      viewportSize,
      this.rowHeight,
      this.overscan,
    );
  }

  toJSON() {
    return {
      scrollOffset: this.scrollOffset,
      viewportSize: this.viewportSize,
      rowHeight: this.rowHeight,
      overscan: this.overscan,
    };
  }
}

/** Inclusive start, exclusive end — indices into the ordered row list. */
export type VisibleRange = {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly totalHeight: number;
  readonly visibleCount: number;
};
