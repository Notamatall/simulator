import {ODDS, PlinkoRiskTypeShuffle, PlinkoRows} from "./plinko/shuffle-constants";

const {createHash, randomBytes} = require("crypto");
const serverSeed = randomBytes(32).toString("hex");
const clientSeed = randomBytes(32).toString("hex");
let nonce = 0;

function getOutcomes(serverSeed, clientSeed, nonce, rowsCount) {
  const bytes = generateBytes(serverSeed, clientSeed, nonce, rowsCount);
  const bytesByRowsCount = bytes.slice(0, rowsCount * 4);

  const chunks = bytesByRowsCount.reduce((result, current, index) => {
    if (index % 4 == 0) result.push([current]);
    else {
      const chunkIndex = Math.floor(index / 4);
      const chunk = result[chunkIndex];
      chunk.push(current);
    }
    return result;
  }, []);

  let outcome = chunks.map(bytesChunk =>
    bytesChunk.reduce((result, value, i) => {
      const divider = 256 ** (i + 1);
      const partialResult = value / divider;
      return result + partialResult;
    }, 0),
  );

  return outcome;
}

function generateBytes(serverSeed, clientSeed, nonce, rowsCount) {
  let currentCursor = 0;
  let endCursor = Math.ceil(rowsCount / 8);
  let bytes = [];

  while (currentCursor <= endCursor - 1) {
    const hash = createHash("sha256").update(`${serverSeed}:${clientSeed}:${nonce}:${currentCursor}:${rowsCount}`).digest();

    bytes.push(...hash);

    currentCursor++;
  }

  return bytes;
}

function getRepresentativeDirections(outcome: number[]): number[] {
  const values = [0, 1];
  const mappedValues: number[] = outcome.map(result => values[Math.floor(result * 2)]);
  return mappedValues;
}

function getMultiplier(rowsCount: number, risk: PlinkoRiskTypeShuffle, index: number): number {
  const oddsSet = ODDS[rowsCount][risk];
  const multiplier = oddsSet[index];
  return multiplier;
}
function getResult(bet: number, rowsCount: PlinkoRows, risk: PlinkoRiskTypeShuffle) {
  const outcome = getOutcomes(serverSeed, clientSeed, nonce, rowsCount);
  const results = getRepresentativeDirections(outcome);
  const multiplierIndex = results.reduce((result, current) => result + current, 0);
  const multiplier = getMultiplier(rowsCount, risk, multiplierIndex);
  const won = multiplier * bet;

  const result = {
    multiplier,
    risk,
    rowsCount,
    won,
    bet,
  };

  nonce++;

  return result;
}

export default getResult;
