export enum AlgorithmType {
  FIFO = 'FIFO',
  LRU = 'LRU',
  OPTIMAL = 'OPTIMAL',
  CLOCK = 'CLOCK'
}

export interface SimulationStep {
  stepIndex: number;
  requestedPage: number;
  frames: (number | null)[]; // null represents an empty frame
  status: 'HIT' | 'FAULT';
  replacedPage?: number | null; // which page was evicted, if any
  explanation: string;
  metadata?: {
    clockPointer?: number; // For CLOCK
    referenceBits?: number[]; // For CLOCK
    // Potential future metadata for other algos
  };
}

export interface SimulationResult {
  algorithm: AlgorithmType;
  steps: SimulationStep[];
  totalHits: number;
  totalFaults: number;
  hitRatio: number;
  faultRatio: number;
}

export interface AppState {
  referenceString: string;
  frameCount: number;
  selectedAlgorithm: AlgorithmType;
  results: Record<AlgorithmType, SimulationResult | null>;
}