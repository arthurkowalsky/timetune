/**
 * Calculate player's total score
 */
export function getPlayerScore(player: { timeline: unknown[]; bonusPoints: number }): number {
  return player.timeline.length + player.bonusPoints;
}
