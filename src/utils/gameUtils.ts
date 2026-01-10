/**
 * Calculate player's total score
 */
export function getPlayerScore(player: { timeline: unknown[]; bonusPoints: number }): number {
  return player.timeline.length + player.bonusPoints;
}

export function generateGitHubIssueUrl(song: { id: string; title: string; artist: string; year: number; youtubeId: string }): string {
  const repo = 'arthurkowalsky/timetune';
  const title = `Błędny YouTube ID: ${song.title} - ${song.artist}`;

  const youtubeUrl = `https://www.youtube.com/watch?v=${song.youtubeId}`;

  const body = `**Song ID:** ${song.id}
**Tytuł:** ${song.title}
**Wykonawca:** ${song.artist}
**Rok:** ${song.year}
**Obecny YouTube ID:** ${song.youtubeId}
**Link do wideo:** ${youtubeUrl}

---

**Opis problemu:**
<!-- Opisz co jest nie tak z tym utworem (np. błędny utwór, błędny wykonawca, wideo niedostępne) -->
`;

  const params = new URLSearchParams({
    title,
    body,
    labels: 'bug,youtube-id'
  });

  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
