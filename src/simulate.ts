import getResult from "./current";
import {riskListShuffle} from "./plinko/shuffle-constants";
import RTP from "./rtp";
let maxwin = 0;
let hitFrequency = 0;

function runSimulation(count: number) {
  for (let index = 0; index < count; index++) {
    const rowsCount = Math.round(Math.random() * 8) + 8;
    const riskIndex = Math.round(Math.random() * 2);
    const risk = riskListShuffle[riskIndex];
    const result = getResult(100, rowsCount, risk);
    const prevMaxWin = maxwin;
    maxwin =
      result.multiplier > maxwin
        ? result.multiplier
        : maxwin;
    hitFrequency =
      prevMaxWin != maxwin
        ? 1
        : result.multiplier === maxwin
        ? hitFrequency + 1
        : hitFrequency;
    RTP.processBet({bet: result.bet, won: result.won});
  }

  console.log({
    rtp: RTP.message(),
    maxwin: maxwin,
    hitFrequency: hitFrequency,
  });
}

runSimulation(2500000);
