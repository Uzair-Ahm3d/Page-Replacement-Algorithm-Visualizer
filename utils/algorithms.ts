import { AlgorithmType, SimulationResult, SimulationStep } from '../types';

const parseReferenceString = (input: string): number[] => {
  return input
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '' && !isNaN(Number(s)))
    .map(Number)
    .filter(n => n >= 0); // Ensure positive integers
};

export const runSimulation = (
  rawRefString: string,
  frameCount: number,
  algorithm: AlgorithmType
): SimulationResult => {
  const pages = parseReferenceString(rawRefString);
  const steps: SimulationStep[] = [];
  let hits = 0;
  let faults = 0;

  // Initialize frames
  let currentFrames: (number | null)[] = Array(frameCount).fill(null);
  
  // State variables for algorithms
  const fifoQueue: number[] = []; 
  const lruMap = new Map<number, number>(); 
  
  // CLOCK specific state
  // Reference bits: 1 = recently used/loaded, 0 = candidate for replacement
  let referenceBits: number[] = Array(frameCount).fill(0);
  let clockPointer = 0;

  pages.forEach((page, stepIndex) => {
    const isHit = currentFrames.includes(page);
    let status: 'HIT' | 'FAULT' = isHit ? 'HIT' : 'FAULT';
    let replacedPage: number | null = null;
    let explanation = "";
    let stepMetadata: any = {};

    const nextFrames = [...currentFrames];
    const nextRefBits = [...referenceBits];

    if (isHit) {
      hits++;
      explanation = `Page ${page} is already in Frame ${currentFrames.indexOf(page) + 1}.`;
      
      if (algorithm === AlgorithmType.LRU) {
        lruMap.set(page, stepIndex);
        explanation += " Updated access time.";
      } else if (algorithm === AlgorithmType.CLOCK) {
        const hitIndex = currentFrames.indexOf(page);
        nextRefBits[hitIndex] = 1; // Give second chance
        explanation += " Set Reference Bit to 1.";
      }
    } else {
      faults++;
      const emptyIndex = nextFrames.indexOf(null);

      if (emptyIndex !== -1) {
        // Fill empty frame
        nextFrames[emptyIndex] = page;
        explanation = `Page ${page} loaded into empty Frame ${emptyIndex + 1}.`;

        if (algorithm === AlgorithmType.FIFO) {
          fifoQueue.push(page);
        } else if (algorithm === AlgorithmType.LRU) {
          lruMap.set(page, stepIndex);
        } else if (algorithm === AlgorithmType.CLOCK) {
          nextRefBits[emptyIndex] = 1;
          // Pointer typically moves only on replacement or stays? 
          // Standard varies, but usually pointer advances after insertion in circular buffer if we treat empty fill as 'use'.
          // To keep it simple: we just insert. Pointer stays or moves to next empty? 
          // Let's increment pointer to distribute load.
          clockPointer = (clockPointer + 1) % frameCount; 
        }
      } else {
        // Replacement needed
        let indexToReplace = -1;

        if (algorithm === AlgorithmType.FIFO) {
          const pageToEvict = fifoQueue.shift();
          if (pageToEvict !== undefined) {
             indexToReplace = nextFrames.indexOf(pageToEvict);
             replacedPage = pageToEvict;
             fifoQueue.push(page);
             explanation = `Page ${pageToEvict} replaced (Oldest in FIFO queue).`;
          }
        } else if (algorithm === AlgorithmType.LRU) {
          let minLastAccess = Infinity;
          let pageToEvict = -1;
          
          nextFrames.forEach((p) => {
            if (p !== null) {
              const lastAccess = lruMap.get(p) ?? -1;
              if (lastAccess < minLastAccess) {
                minLastAccess = lastAccess;
                pageToEvict = p;
              }
            }
          });
          
          if (pageToEvict !== -1) {
             indexToReplace = nextFrames.indexOf(pageToEvict);
             replacedPage = pageToEvict;
             const stepsAgo = stepIndex - (lruMap.get(pageToEvict) || 0);
             explanation = `Page ${pageToEvict} replaced (Least Recently Used, ${stepsAgo} steps ago).`;
          }
           lruMap.set(page, stepIndex);
        } else if (algorithm === AlgorithmType.OPTIMAL) {
          let furthestDistance = -1;
          let pageToEvict = -1;
          let isInfinite = false;

          nextFrames.forEach((p) => {
            if (p !== null) {
              const remainingPages = pages.slice(stepIndex + 1);
              const nextUseIndex = remainingPages.indexOf(p);
              
              if (nextUseIndex === -1) {
                if (!isInfinite) {
                    // First infinite found, take it
                    furthestDistance = Infinity;
                    pageToEvict = p;
                    isInfinite = true;
                } else {
                    // Already have an infinite, logic to break tie (e.g. FIFO or smallest ID)
                    // We'll stick with the first one found or update if needed.
                    // Usually we replace the one in the lowest frame index or FIFO. 
                    // Let's just keep the first one found for stability.
                }
              } else {
                if (!isInfinite && nextUseIndex > furthestDistance) {
                  furthestDistance = nextUseIndex;
                  pageToEvict = p;
                }
              }
            }
          });

          if (pageToEvict !== -1) {
             indexToReplace = nextFrames.indexOf(pageToEvict);
             replacedPage = pageToEvict;
             explanation = furthestDistance === Infinity 
                ? `Page ${pageToEvict} replaced (Will not be used again).`
                : `Page ${pageToEvict} replaced (Longest distance to next use).`;
          }
        } else if (algorithm === AlgorithmType.CLOCK) {
          // Find victim
          let found = false;
          let attempts = 0;
          // Safety break to prevent infinite loop (though structurally impossible if frames > 0)
          while (!found && attempts < frameCount * 3) {
            const candidateRef = nextRefBits[clockPointer];
            if (candidateRef === 0) {
              found = true;
              indexToReplace = clockPointer;
              replacedPage = nextFrames[clockPointer];
              explanation = `Page ${replacedPage} replaced (Ref Bit was 0 at Frame ${clockPointer + 1}).`;
              
              // Move pointer for next time
              clockPointer = (clockPointer + 1) % frameCount;
            } else {
              // Give second chance
              nextRefBits[clockPointer] = 0;
              clockPointer = (clockPointer + 1) % frameCount;
            }
            attempts++;
          }
          
          if (indexToReplace !== -1) {
             nextRefBits[indexToReplace] = 1; // New page gets ref bit 1
          }
        }

        if (indexToReplace !== -1) {
          nextFrames[indexToReplace] = page;
        }
      }
    }

    if (algorithm === AlgorithmType.CLOCK) {
        stepMetadata = {
            clockPointer: clockPointer,
            referenceBits: [...nextRefBits]
        };
    }

    currentFrames = nextFrames;
    referenceBits = nextRefBits;

    steps.push({
      stepIndex,
      requestedPage: page,
      frames: nextFrames,
      status,
      replacedPage,
      explanation,
      metadata: stepMetadata
    });
  });

  return {
    algorithm,
    steps,
    totalHits: hits,
    totalFaults: faults,
    hitRatio: pages.length > 0 ? hits / pages.length : 0,
    faultRatio: pages.length > 0 ? faults / pages.length : 0,
  };
};