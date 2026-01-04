# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-04

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

## [0.1.0] - 2025-01-03

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
