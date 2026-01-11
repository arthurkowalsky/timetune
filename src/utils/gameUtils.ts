/**
 * Calculate player's total score
 */
export function getPlayerScore(player: { timeline: unknown[]; bonusPoints: number }): number {
  return player.timeline.length + player.bonusPoints;
}

export function generateGitHubIssueUrl(song: { id: string; title: string; artist: string; year: number; youtubeId: string }): string {
  const repo = 'arthurkowalsky/timetune';
  const title = `Wrong YouTube video: ${song.title} - ${song.artist}`;

  const youtubeUrl = `https://www.youtube.com/watch?v=${song.youtubeId}`;

  const body = `**Song ID:** ${song.id}
**Title:** ${song.title}
**Artist:** ${song.artist}
**Year:** ${song.year}
**Current YouTube ID:** ${song.youtubeId}
**Video link:** ${youtubeUrl}

---

**Problem description:**
<!-- Describe what's wrong with this track (e.g., wrong song, wrong artist, video unavailable) -->
`;

  const params = new URLSearchParams({
    title,
    body,
    labels: 'bug,youtube-id'
  });

  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
