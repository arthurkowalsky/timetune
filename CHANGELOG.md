# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-01-18
### Added
- Motion library integration - consistent animations with `prefers-reduced-motion` support
- Compact turn timer in game header (left side, symmetrical to exit button)

### Changed
- Migrated all CSS animations to Motion library (pulse, ping, fade, slide, scale)
- Fullscreen button hidden during gameplay to avoid overlap with exit button

### Fixed
- `crypto.randomUUID` error on non-HTTPS connections (PWA fallback)


## [0.6.0] - 2026-01-13
### Added
- English language support with language switcher (flag toggle in top-left corner)
- Voice voting - record title/artist guess, other players vote (online mode)
- Track issue reporting - report wrong YouTube videos directly to GitHub
- Entrance/exit animations - smooth transitions between game phases
- Song category selector - filter by All/Polish/International songs
- Era filter - choose All / Old School (–1989) / New School (1990+) songs
- International songs database - 1052 worldwide hits (1950-2025)

### Changed
- Total song database expanded to 1691 songs (639 Polish + 1052 International)
- Simplified player timeline viewing
- Database scripts: `--origin` parameter now optional (reads from CSV)

## [0.5.1] - 2026-01-06 
### Fixed
- Invitation links now work on GitHub Pages (changed from path to query params)

## [0.5.0] - 2026-01-06
### Added
- Multiplayer mode with PartyKit - create rooms and play with friends online
- Turn timer configuration
- Song tagging system with origin and genres support

### Changed
- Song database expanded to 530 songs (1950-2024)
- Minor UX/UI improvements

## [0.4.0] - 2025-01-05

### Added
- Bottom action bar for mobile - all game controls in one place
- Mystery card animation after drawing a song
- Auto-play setting - skip manual play button
- Settings section on start screen

### Changed
- Song database expanded to 303 songs (1950-2024)
- Removed nested scrolling - better mobile UX
- Sticky header during gameplay

## [0.3.0] - 2026-01-04

### Added
- PWA support - install as mobile app with home screen icon e

### Fixed
- Win condition now correctly includes bonus points in score calculation
- Timeline interaction blocked until music starts playing

## [0.2.0] - 2026-01-04

### Added
- Database management scripts (`db:fetch-youtube`, `db:generate-json`)
- Multi-region song support (PL, EN, etc.)
- Fullscreen mode - toggle button in game header
- Enhanced audio visualizer - 15 bars with gradient colors and glow effect
- CI pipeline with linting and security audit
- Professional README with badges
- CHANGELOG file

### Changed
- Song database extended: 165 Polish songs (1960-2024)
- Song data now includes `region` field
- Deploy triggered only on GitHub release (not on push to main)
- Extended CSS animations for visualizer
- ESLint rules: no-console warning, strict unused-vars

## [0.1.0] - 2026-01-03

### Added
- Initial release of TimeTune
- Core game mechanics - chronological song placement
- 268 Polish songs database (1980-2019)
- Multiplayer support (2+ teams)
- localStorage persistence
- YouTube audio playback
- Mobile-first responsive design
- Haptic feedback (Vibration API)
- Polish language support
