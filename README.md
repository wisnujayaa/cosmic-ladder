# Cosmic Ladder 3D

An interactive 3D journey from Earth to the edge of the observable universe and back: about 20 orders of magnitude (10⁷ → 10²⁷ metres), built on real data. The interface is bilingual (English and Bahasa Indonesia).

**▶ Live:** https://wisnujayaa.github.io/cosmic-ladder/

## Features

- **11 scale levels**: Earth, Earth–Moon, inner solar system, solar system, heliosphere, Oort Cloud, neighbouring stars, Milky Way, Local Group, Laniakea and the observable universe.
- **Real positions**: planets are computed from JPL Keplerian elements, solving Kepler's equation with Newton's method. Earth's rotation follows sidereal time (GMST). Hundreds of moons use JPL mean elements, and asteroids and dwarf planets come from the JPL Small-Body Database.
- **Real sky**: HYG star catalogue, Stellarium constellation lines, and nebula and galaxy photos.
- **Two-way guided tour** (Earth → Universe, Universe → Earth) with documentary narration, subtitles and a chapter player (pause, replay, skip).
- **Learning hub**: 27-question quiz, 25-term glossary, progress tracking and keyboard shortcuts.
- **Tools**: scale bar, distance ruler (distance, light time, travel time), weight calculator, size comparison, events timeline and object search.
- **Sound** is synthesised live with the Web Audio API; narration uses the Web Speech API.
- Cinematic mode, a collapsible side panel and a responsive mobile layout.

## Run locally

The page loads `data/`, `img/` and `tex/` with `fetch`, so serve it over HTTP instead of opening the file directly:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Project structure

```
index.html      built page, ready to serve (GitHub Pages serves this file)
build.py        assembles index.html from src/
src/
  template.html HTML + CSS
  astro.js      orbital mechanics (Kepler, coordinate frames, GMST)
  content.js    level and object texts (EN/ID)
  content2.js   extra sky objects, photos, references
  moons_snd.js  moon data + sound synthesis
  extras.js     JPL small bodies, spacecraft, events, UI strings
  narr.js       documentary narration script
  learn.js      quiz, glossary, "try this" prompts
  main.js       3D engine (three.js r128), camera, overlay, UI
data/ img/ tex/ star catalogue, photos, planet textures
```

After editing anything in `src/`, run `python3 build.py` to regenerate `index.html`.

## Data and image credits

- Sun, giant-planet and some moon textures: [Solar System Scope](https://www.solarsystemscope.com/textures/), CC BY 4.0, based on NASA data.
- Terrestrial planet textures: Planet Pixel Emporium (James Hastings-Trew). Earth night lights: NASA Black Marble. Mercury: NASA/JHUAPL/Carnegie (MESSENGER). Moon: NASA SVS.
- Surface and mission photos (Olympus Mons, Great Red Spot, Saturn's hexagon, Apollo 11, Perseverance and more): NASA (public domain), collected in [kylegough/solar-system](https://github.com/kylegough/solar-system).
- Nebula, cluster and galaxy photos: the astrophotographers credited in each panel, distributed with [Stellarium](https://stellarium.org/).
- Star catalogue: [HYG Database v4.0](https://github.com/astronexus/HYG-Database), CC BY-SA 4.0. Constellation lines: Stellarium ("modern" sky culture).
- Planetary elements: JPL Solar System Dynamics. Moons: JPL Planetary Satellite Mean Elements plus Wikipedia tables. Asteroids and dwarf planets: JPL Small-Body Database.
- Voyager and New Horizons positions are extrapolated from the latest distances published by NASA; the orbital phases of the ISS, Hubble, GPS, geostationary satellites and JWST's halo orbit are illustrative.
- Library: [three.js](https://threejs.org/) r128 (MIT), loaded from jsDelivr. Font: Inter (Google Fonts).

Built by **Muhammad Wisnu Jaya Wardana** ([@wisnujayaa](https://github.com/wisnujayaa)) with Claude.
