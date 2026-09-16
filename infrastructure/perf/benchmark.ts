export type BenchmarkSample = {
  readonly name: string;
  readonly iterations: number;
  readonly totalMs: number;
  readonly avgMs: number;
  readonly maxMs: number;
};

export type PerformanceBudget = {
  readonly name: string;
  /** Maximum allowed average milliseconds per iteration. */
  readonly maxAvgMs: number;
  /** Maximum allowed single-iteration milliseconds. */
  readonly maxMaxMs?: number;
};

export type BenchmarkResult = {
  readonly sample: BenchmarkSample;
  readonly budget: PerformanceBudget;
  readonly ok: boolean;
  readonly reasons: string[];
};

/**
 * Tiny synchronous/async micro-benchmark helper for core hot paths.
 * Not a substitute for browser profiling — guards CI regressions.
 */
export async function runBenchmark(
  name: string,
  iterations: number,
  fn: () => void | Promise<void>,
): Promise<BenchmarkSample> {
  // Warmup
  await fn();

  let totalMs = 0;
  let maxMs = 0;
  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    await fn();
    const elapsed = performance.now() - start;
    totalMs += elapsed;
    if (elapsed > maxMs) maxMs = elapsed;
  }

  return {
    name,
    iterations,
    totalMs,
    avgMs: totalMs / iterations,
    maxMs,
  };
}

export function checkBudget(
  sample: BenchmarkSample,
  budget: PerformanceBudget,
): BenchmarkResult {
  const reasons: string[] = [];
  if (sample.avgMs > budget.maxAvgMs) {
    reasons.push(
      `avg ${sample.avgMs.toFixed(3)}ms exceeds budget ${budget.maxAvgMs}ms`,
    );
  }
  if (budget.maxMaxMs != null && sample.maxMs > budget.maxMaxMs) {
    reasons.push(
      `max ${sample.maxMs.toFixed(3)}ms exceeds budget ${budget.maxMaxMs}ms`,
    );
  }
  return {
    sample,
    budget,
    ok: reasons.length === 0,
    reasons,
  };
}

/** Default budgets for Phase 4 CI guards (generous for CI variance). */
export const DEFAULT_PERFORMANCE_BUDGETS = {
  inMemoryAppend100: {
    name: 'inMemoryAppend100',
    maxAvgMs: 25,
    maxMaxMs: 80,
  },
  indexedDbAppend100: {
    name: 'indexedDbAppend100',
    maxAvgMs: 80,
    maxMaxMs: 200,
  },
  selectorNotifyNoop: {
    name: 'selectorNotifyNoop',
    maxAvgMs: 5,
    maxMaxMs: 20,
  },
  /** PR-99: one arrow-key neighbor lookup on a 100k SparseRowIndex. */
  arrowNeighbor100k: {
    name: 'arrowNeighbor100k',
    maxAvgMs: 2,
    // Single-iteration spikes from GC under the 100k harness (PR-100).
    maxMaxMs: 20,
  },
} as const satisfies Record<string, PerformanceBudget>;
