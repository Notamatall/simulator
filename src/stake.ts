import {createHmac} from "crypto";
const {randomBytes} = require("crypto");
const serverSeed = randomBytes(32).toString("hex");
const clientSeed = randomBytes(32).toString("hex");
let nonce = 0;

function getIterator({serverSeed, clientSeed, nonce, cursor}) {
  return byteGenerator({
    serverSeed,
    clientSeed,
    nonce: nonce,
    cursor: 0,
  });
}
function* byteGenerator({serverSeed, clientSeed, nonce, cursor}) {
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

let generator = byteGenerator({
  serverSeed,
  clientSeed,
  nonce: nonce,
  cursor: 0,
});

for (let i = 0; i < 4; i++) {
  console.log(generator.next().value);
}

nonce++;
generator = byteGenerator({
  serverSeed,
  clientSeed,
  nonce: nonce,
  cursor: 0,
});

for (let i = 0; i < 4; i++) {
  console.log(generator.next().value);
}
