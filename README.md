# Cosmic Ladder 3D

An interactive 3D journey from Earth to the edge of the observable universe and back: about 20 orders of magnitude (10⁷ → 10²⁷ metres), built on real data. The interface is bilingual (English and Bahasa Indonesia).

**▶ Live:** https://wisnujayaa.github.io/cosmic-ladder/

## Features

- **11 scale levels**: Earth, Earth–Moon, inner solar system, solar system, heliosphere, Oort Cloud, neighbouring stars, Milky Way, Local Group, Laniakea and the observable universe.
- **Real positions**: planets are computed from JPL Keplerian elements, solving Kepler's equation with Newton's method. Earth's rotation follows sidereal time (GMST). Hundreds of moons use JPL mean elements, and asteroids and dwarf planets come from the JPL Small-Body Database.
- **NASA-style realism**: 4K textures streamed on demand as you approach a world, relief normal maps, Earth with moving cloud shadows, ocean sun glint, city lights and a sunset-coloured terminator, sun-aware atmospheres (Venus, Mars, Titan, giant planets), and Saturn's rings and globe casting shadows on each other. At galaxy scale, NASA's face-on Milky Way map is combined with 42,000 3D stars sampled from it.
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
index.html        page markup; loads the CSS and scripts below (GitHub Pages serves this file)
css/style.css     all styles
js/
  astro.js        orbital mechanics (Kepler, coordinate frames, GMST)
  content.js      level and object texts (EN/ID)
  content2.js     extra sky objects, photos, references
  moons_snd.js    moon data + sound synthesis
  extras.js       JPL small bodies, spacecraft, events, UI strings
  narr.js         documentary narration script
  learn.js        quiz, glossary, "try this" prompts
  main/           3D engine and UI (three.js r128), split by section:
    core.js       helpers, language, renderer + bloom, shaders, layers, time
    solar.js      Sun, planets, moons, satellites, small bodies, spacecraft, Oort cloud
    deepsky.js    stars, deep-sky objects, Milky Way, Local Group, Laniakea, cosmic web
    frame.js      category toggles, per-frame positions, label overlay
    ui.js         HUD, info panel, camera helpers, language apply
    input.js      pointer/keyboard input, info extras, events timeline, search
    narration.js  narration engine, deep links, intro
    tour.js       two-way tour, cinematic, ruler, learning hub, tour player
    boot.js       data loading and the render loop
data/ img/ tex/   star catalogue, photos, planet textures
```

There is no build step: edit the files and reload. The `js/main/*.js` files are classic scripts that share one global scope, so they must stay in the order listed in `index.html`.

## Data and image credits

- Sun, giant-planet and some moon textures: [Solar System Scope](https://www.solarsystemscope.com/textures/), CC BY 4.0, based on NASA data.
- Face-on Milky Way: NASA/JPL-Caltech/R. Hurt (SSC/Caltech), taken from the [mw_plot](https://github.com/henrysky/milkyway_plot) package; the galaxy's 3D star particles are sampled from this map's brightness so they follow the same arms.
- High-resolution textures (streamed when you get close) and relief normal maps for the Moon, Mercury, Mars, the giant planets, Pluto, Charon and the major moons: [RSS-Textures](https://github.com/KSP-RO/RSS-Textures) (NathanKell et al.), **CC BY-NC-SA**, largely based on NASA/JPL imagery, Steve Albers and the Celestia Motherlode. Because of that licence, these textures may only be reused non-commercially and under the same terms.
- High-resolution Earth: NASA Blue Marble, Black Marble and topography (public domain), via [three-globe](https://github.com/vasturiano/three-globe).
- Terrestrial planet textures: Planet Pixel Emporium (James Hastings-Trew). Earth night lights: NASA Black Marble. Mercury: NASA/JHUAPL/Carnegie (MESSENGER). Moon: NASA SVS.
- Surface and mission photos (Olympus Mons, Great Red Spot, Saturn's hexagon, Apollo 11, Perseverance and more): NASA (public domain), collected in [kylegough/solar-system](https://github.com/kylegough/solar-system).
- Nebula, cluster and galaxy photos: the astrophotographers credited in each panel, distributed with [Stellarium](https://stellarium.org/).
- Star catalogue: [HYG Database v4.0](https://github.com/astronexus/HYG-Database), CC BY-SA 4.0. Constellation lines: Stellarium ("modern" sky culture).
- Planetary elements: JPL Solar System Dynamics. Moons: JPL Planetary Satellite Mean Elements plus Wikipedia tables. Asteroids and dwarf planets: JPL Small-Body Database.
- Voyager and New Horizons positions are extrapolated from the latest distances published by NASA; the orbital phases of the ISS, Hubble, GPS, geostationary satellites and JWST's halo orbit are illustrative.
- Library: [three.js](https://threejs.org/) r128 (MIT), loaded from jsDelivr. Font: Inter (Google Fonts).

Built by **Muhammad Wisnu Jaya Wardana** ([@wisnujayaa](https://github.com/wisnujayaa)) with Claude.
