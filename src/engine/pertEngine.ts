export interface PertInputs {
  optimistic: number; // O
  mostLikely: number; // M
  pessimistic: number; // P
}

export interface PertResult {
  expectedDuration: number; // (O + 4M + P) / 6
  standardDeviation: number; // (P - O) / 6
  variance: number; // sigma^2
  confidence68: [number, number]; // expected ± 1 sigma
  confidence95: [number, number]; // expected ± 2 sigma
  confidence99: [number, number]; // expected ± 3 sigma
  weightRatio: {
    optimisticWeight: number; // 1/6
    mostLikelyWeight: number; // 4/6 (66.7%)
    pessimisticWeight: number; // 1/6
  };
}

export function calculatePert(inputs: PertInputs): PertResult {
  const { optimistic, mostLikely, pessimistic } = inputs;

  const expected = (optimistic + 4 * mostLikely + pessimistic) / 6;
  const standardDeviation = (pessimistic - optimistic) / 6;
  const variance = Math.pow(standardDeviation, 2);

  return {
    expectedDuration: Number(expected.toFixed(2)),
    standardDeviation: Number(standardDeviation.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    confidence68: [
      Number((expected - standardDeviation).toFixed(2)),
      Number((expected + standardDeviation).toFixed(2)),
    ],
    confidence95: [
      Number((expected - 2 * standardDeviation).toFixed(2)),
      Number((expected + 2 * standardDeviation).toFixed(2)),
    ],
    confidence99: [
      Number((expected - 3 * standardDeviation).toFixed(2)),
      Number((expected + 3 * standardDeviation).toFixed(2)),
    ],
    weightRatio: {
      optimisticWeight: 1 / 6,
      mostLikelyWeight: 4 / 6,
      pessimisticWeight: 1 / 6,
    },
  };
}

