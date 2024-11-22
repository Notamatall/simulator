class RTP {
  private betsCumulative = 0;
  private won = 0;
  value() {
    return (this.won / this.betsCumulative) * 100;
  }
  processBet(wager: {bet: number; won: number}) {
    this.won += wager.won;
    this.betsCumulative += wager.bet;
  }
  message() {
    return this.value().toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3}).replace(/,/g, " ") + "%";
  }
}

export default new RTP();
