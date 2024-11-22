const { createHash, createHmac: createHmacFunction } = require("crypto");
const serverSeed =
  "559e16ed53c470047933d5f9d3f7159be184850505a444773ab6b0cdf55ab676";
const clientSeed =
  "2e4c8efa60efbc3683bb694324178513f6d6d72c9a294e3cb6818e02d930e4f4";
const nonce = 0;
const rowsCount = 8;
// evo approach
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

  let outcome = chunks.map((bytesChunk) =>
    bytesChunk.reduce((result, value, i) => {
      const divider = 256 ** (i + 1);
      const partialResult = value / divider;
      return result + partialResult;
    }, 0)
  );

  return outcome;
}

function generateBytes(serverSeed, clientSeed, nonce, rowsCount) {
  let currentCursor = 0;
  let endCursor = Math.ceil(rowsCount / 8);
  let bytes = [];

  while (currentCursor <= endCursor - 1) {
    const hash = createHash("sha256")
      .update(
        `${serverSeed}:${clientSeed}:${nonce}:${currentCursor}:${rowsCount}`
      )
      .digest();

    bytes.push(...hash);

    currentCursor++;
  }

  return bytes;
}

const outcomes = getOutcomes(serverSeed, clientSeed, nonce, rowsCount);
const hash = createHash("sha512")
  .update(`${serverSeed}:${clientSeed}:${nonce}`)
  .digest();

//stake approach

function* byteGenerator({ serverSeed, clientSeed, nonce, cursor }) {
  // Initialize cursor variables
  let currentRound = Math.floor(cursor / 32);
  let currentRoundCursor = cursor % 32; // Use modulus for direct calculation

  while (true) {
    // Generate HMAC for the current round
    const hmac = createHmac("sha256", serverSeed);
    hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
    const buffer = hmac.digest();

    // Yield bytes starting from current cursor position
    while (currentRoundCursor < 32) {
      yield Number(buffer[currentRoundCursor]);
      currentRoundCursor += 1;
    }

    // Reset cursor and move to the next round
    currentRoundCursor = 0;
    currentRound += 1;
  }
}

const generator = byteGenerator({
  serverSeed: "secretServerSeed",
  clientSeed: "userProvidedSeed",
  nonce: 42,
  cursor: 0,
});

// Generate first 10 random bytes
for (let i = 0; i < 10; i++) {
  console.log(generator.next().value);
}

//tequity
const MAXIMAL_RANDOM_LIMIT = 2 ** 32;

// for (let i = 0; i < 10; i++) {
//   const rng = createProvablyFairRng({
//     serverSeed,
//     clientSeed,
//     nonce,
//     cursor: i,
//   });
//   const getRandomNumber = () => rng.random(2);
//   console.log(getRandomNumber());
// }

function createProvablyFairRng({ serverSeed, clientSeed, nonce, cursor }) {
  const hmacFactory = (hashIndex) =>
    createHmac(serverSeed, clientSeed, nonce, hashIndex);
  return createRng(hmacFactory, cursor);
}

function createHmac(serverSeed, clientSeed, nonce, hashIndex) {
  return createHmacFunction("sha256", serverSeed).update(
    `${clientSeed}:${nonce}:${hashIndex}`
  );
}

function createRng(hmacFactory, cursor) {
  return {
    random: (limit = 2 ** 32) => {
      validateRandomLimit(limit);
      return unbiasedRandomInteger(limit, () => random(hmacFactory, cursor));
    },
    getRngCursor: () => cursor,
  };
}

function validateRandomLimit(limit) {
  if (!Number.isInteger(limit)) {
    throw new Error("Random function limit must be an integer");
  }
  if (limit <= 0) {
    throw new Error("Random function limit must be positive");
  }
  if (limit > MAXIMAL_RANDOM_LIMIT) {
    throw new Error(
      `Random function limit cannot exceed 32-bit range (not greater than 2**32 = ${IRandom_1.MAXIMAL_RANDOM_LIMIT})`
    );
  }
}

function extractInteger(createHmac, cursor) {
  const hashIndex = Math.floor(cursor / 8);
  const hmac = createHmac(hashIndex);
  const offset = cursor % 8;
  const integer = hmac.digest().readUInt32BE(offset * 4);
  return {
    cursor,
    hashIndex,
    offset,
    integer,
  };
}

function random(hmacFactory, cursor) {
  const extractedInteger = extractInteger(hmacFactory, cursor);
  cursor++;
  return extractedInteger.integer;
}

function unbiasedRandomInteger(limit, random) {
  let power = 1;
  while (power < limit) {
    power *= 2;
  }
  let number;
  do {
    const int = random();
    number = int % power;
  } while (number >= limit);
  return number;
}

function extractInteger(createHmac, cursor) {
  const hashIndex = Math.floor(cursor / 8);
  const hmac = createHmac(hashIndex);
  const offset = cursor % 8;
  const integer = hmac.digest().readUInt32BE(offset * 4);
  return {
    cursor,
    hashIndex,
    offset,
    integer,
  };
}
