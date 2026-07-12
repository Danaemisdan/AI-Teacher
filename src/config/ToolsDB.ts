/**
 * Hierarchical Tools Database
 * Maps: Domain -> Subtopic -> Learning Intent -> Best Tool in the World
 */

export type LearningIntent =
    | 'observe'     // Look at something (sky, map, specimen)
    | 'simulate'    // Run a physics/chemistry/economic simulation
    | 'practice'    // Hands-on skill building (typing, coding, drawing)
    | 'explore'     // Free navigation (3D globe, anatomy model)
    | 'analyze'     // Data and graphs (charts, comparisons)
    | 'build'       // Create something (code, design, structure)
    | 'visualize'   // See abstract concepts rendered (molecules, math)
    | 'reference';  // Look up facts (encyclopedia, database)

export type EmbedType = 'iframe' | 'component' | 'api' | 'link';

export interface Tool {
    name: string;
    url: string;
    embedType: EmbedType;
    embedUrl?: string; // If the tool requires a specific URL format for embedding
    description: string;
    licensing: 'free' | 'freemium' | 'paid' | 'open_source';
    requiresApiKey: boolean;
    iframeAllowed: boolean;
}

export interface SubtopicDB {
    intents: Partial<Record<LearningIntent, Tool[]>>;
}

export interface DomainDB {
    subtopics: Record<string, SubtopicDB>;
}

// Helper to quickly define a standard iframe tool
const createIframeTool = (name: string, url: string, embedUrl: string, desc: string, isFree: boolean = true): Tool => ({
    name,
    url,
    embedType: 'iframe',
    embedUrl,
    description: desc,
    licensing: isFree ? 'free' : 'freemium',
    requiresApiKey: false,
    iframeAllowed: true,
});

const createLinkTool = (name: string, url: string, desc: string): Tool => ({
    name,
    url,
    embedType: 'link',
    description: desc,
    licensing: 'free',
    requiresApiKey: false,
    iframeAllowed: false,
});

export const ToolsDB: Record<string, DomainDB> = {
    // ── 1. SPACE & ASTRONOMY ──────────────────────────────────────────────────
    astronomy: {
        subtopics: {
            night_sky: {
                intents: {
                    observe: [
                        createIframeTool('Stellarium Web', 'https://stellarium-web.org/', 'https://stellarium-web.org/', 'Full planetarium; real-time sky for any location/time'),
                    ]
                }
            },
            solar_system: {
                intents: {
                    explore: [
                        createIframeTool('NASA Eyes on the Solar System', 'https://eyes.nasa.gov/apps/solar-system/', 'https://eyes.nasa.gov/apps/solar-system/?embed=true', 'Real-time 3D solar system from NASA/JPL data'),
                        createIframeTool('Solar System Scope', 'https://www.solarsystemscope.com/', 'https://www.solarsystemscope.com/iframe', 'Interactive 3D model with textures')
                    ],
                    simulate: [
                        createIframeTool('PhET Gravity and Orbits', 'https://phet.colorado.edu/en/simulations/gravity-and-orbits', 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_en.html', 'Move Sun/Earth/Moon; watch orbital paths change')
                    ]
                }
            },
            gravity: {
                intents: {
                    simulate: [
                        createIframeTool('Academo Orbit Simulator', 'https://academo.org/demos/orbit-simulator/', 'https://academo.org/demos/orbit-simulator/', 'Body under gravity influence; adjust initial velocity'),
                        createIframeTool('PhysSandbox N-body', 'https://www.physandbox.com/', 'https://www.physandbox.com/', 'N-body gravity, 3-body figure-eight orbits')
                    ]
                }
            },
            black_holes: {
                intents: {
                    visualize: [
                        createIframeTool('Inverness Design Studio Black Hole', 'https://www.invernessdesignstudio.com/black-hole/', 'https://www.invernessdesignstudio.com/black-hole/', 'Orbital mechanics of stars around black hole'),
                        createLinkTool('Singularity WebGPU', 'https://singularity.misterprada.com', 'Real-time WebGPU black hole with accretion disk')
                    ]
                }
            },
            galaxies_nebulae: {
                intents: {
                    observe: [
                        createIframeTool('AAS WorldWide Telescope', 'https://web.wwtassets.org/specials/2022/jwst-release/', 'https://web.wwtassets.org/specials/2022/jwst-release/', 'Pan/zoom through JWST imagery in context of full night sky'),
                        createLinkTool('NASA JWST Gallery', 'https://science.nasa.gov/mission/webb/images/', 'Filterable JWST image gallery')
                    ]
                }
            },
            satellites: {
                intents: {
                    observe: [
                        createIframeTool('SatelliteMap.space', 'https://satellitemap.space/', 'https://satellitemap.space/', 'Live satellite positions on globe'),
                        // N2YO requires a JS widget script, so we treat it as link/custom for now
                        createLinkTool('N2YO Tracker', 'https://www.n2yo.com/', 'Real-time satellite tracker; track ISS')
                    ]
                }
            },
            exoplanets: {
                intents: {
                    explore: [
                        createIframeTool('NASA Eyes on Exoplanets', 'https://eyes.nasa.gov/apps/exo/', 'https://eyes.nasa.gov/apps/exo/?embed=true', '3D interactive exoplanet systems; habitable zones')
                    ]
                }
            }
        }
    },

    // ── 2. GEOGRAPHY ──────────────────────────────────────────────────────────
    geography: {
        subtopics: {
            countries_borders: {
                intents: {
                    explore: [
                        {
                            name: 'Leaflet OpenStreetMap',
                            url: 'https://leafletjs.com',
                            embedType: 'component', // Will be rendered via a custom Leaflet wrapper in ClientPage
                            description: 'Interactive maps; open source',
                            licensing: 'open_source',
                            requiresApiKey: false,
                            iframeAllowed: false
                        }
                    ]
                }
            },
            terrain_3d: {
                intents: {
                    explore: [
                        createIframeTool('National Geographic MapMaker', 'https://mapmaker.nationalgeographic.org/', 'https://mapmaker.nationalgeographic.org/', '2D/3D maps, curated data layers, designed for educators'),
                        createLinkTool('Google Earth Web', 'https://earth.google.com/web/', '3D terrain, historical imagery (Not iframeable)')
                    ]
                }
            },
            climate_weather: {
                intents: {
                    observe: [
                        createIframeTool('Windy', 'https://www.windy.com', 'https://embed.windy.com/embed2.html', 'Live animated weather layers (wind, temp, rain)')
                    ]
                }
            },
            earthquakes: {
                intents: {
                    observe: [
                        {
                            name: 'USGS Earthquake Map',
                            url: 'https://earthquake.usgs.gov/',
                            embedType: 'component', // Needs custom Leaflet + USGS GeoJSON
                            description: 'Real-time earthquake data via GeoJSON feed',
                            licensing: 'free',
                            requiresApiKey: false,
                            iframeAllowed: false
                        }
                    ]
                }
            },
            oceans_maritime: {
                intents: {
                    observe: [
                        createIframeTool('MarineTraffic', 'https://www.marinetraffic.com/', 'https://www.marinetraffic.com/en/ais/embed', 'Comprehensive vessel positions, port data', false)
                    ]
                }
            },
            population_data: {
                intents: {
                    analyze: [
                        createIframeTool('Our World In Data', 'https://ourworldindata.org', 'https://ourworldindata.org/grapher/population', 'Interactive charts auto-update; customizable time ranges')
                    ]
                }
            }
        }
    },

    // ── 3. PHYSICS ────────────────────────────────────────────────────────────
    physics: {
        subtopics: {
            mechanics: {
                intents: {
                    simulate: [
                        createIframeTool('PhET Forces and Motion', 'https://phet.colorado.edu/', 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html', 'Explore forces, friction, and acceleration'),
                        createIframeTool('PhET Energy Skate Park', 'https://phet.colorado.edu/', 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_en.html', 'Conservation of energy'),
                        createIframeTool('oPhysics', 'https://ophysics.com/', 'https://ophysics.com/', 'Wide range of mechanics sims')
                    ]
                }
            },
            electricity_circuits: {
                intents: {
                    simulate: [
                        createIframeTool('Falstad Circuit Simulator', 'https://www.falstad.com/circuit/', 'https://www.falstad.com/circuit/circuitjs.html', 'Live circuit simulation; build RC, RL, amplifier circuits'),
                        createIframeTool('PhET Circuit Construction Kit', 'https://phet.colorado.edu/', 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html', 'Build DC circuits')
                    ]
                }
            },
            waves_optics: {
                intents: {
                    simulate: [
                        createIframeTool('Ray Optics Simulation', 'https://phydemo.app/ray-optics/', 'https://phydemo.app/ray-optics/simulator/', 'Drag-and-drop lenses, mirrors, prisms; real-time ray tracing'),
                        createIframeTool('PhET Wave Interference', 'https://phet.colorado.edu/', 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html', 'Interference of water, sound, and light waves')
                    ]
                }
            },
            quantum: {
                intents: {
                    simulate: [
                        createIframeTool('Quantum Flytrap Virtual Lab', 'https://lab.quantumflytrap.com/', 'https://lab.quantumflytrap.com/', 'Drag-and-drop quantum optical bench'),
                        createIframeTool('QuVis St Andrews', 'https://www.st-andrews.ac.uk/physics/quvis/', 'https://www.st-andrews.ac.uk/physics/quvis/', 'Research-based HTML5 sims; entanglement, spin')
                    ]
                }
            }
        }
    },

    // ── 4. CHEMISTRY ──────────────────────────────────────────────────────────
    chemistry: {
        subtopics: {
            molecules: {
                intents: {
                    visualize: [
                        {
                            name: '3Dmol.js',
                            url: 'https://3dmol.csb.pitt.edu/',
                            embedType: 'component', // We already have a chemistry component
                            description: 'Load any PDB/SDF molecule; multiple rendering styles',
                            licensing: 'open_source',
                            requiresApiKey: false,
                            iframeAllowed: false
                        },
                        createIframeTool('PhET Build a Molecule', 'https://phet.colorado.edu/', 'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html', 'Build molecules from atoms')
                    ]
                }
            },
            periodic_table: {
                intents: {
                    explore: [
                        createIframeTool('Ptable', 'https://ptable.com/', 'https://ptable.com/', '3D orbitals, isotopes, oxidation states, periodic trends')
                    ]
                }
            },
            reactions: {
                intents: {
                    simulate: [
                        createIframeTool('PhET Acid-Base Solutions', 'https://phet.colorado.edu/', 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html', 'Explore pH, conductivity'),
                        createLinkTool('ChemCollective Virtual Lab', 'http://chemcollective.org/vlab', '100s of aqueous reagents; realistic titration')
                    ]
                }
            },
            crystallography: {
                intents: {
                    visualize: [
                        createIframeTool('Crystallography at Otterbein', 'https://www.otterbein.edu/science/crystallography/', 'https://www.otterbein.edu/science/crystallography/', 'Close-packing, coordination numbers')
                    ]
                }
            }
        }
    },

    // ── 5. BIOLOGY ────────────────────────────────────────────────────────────
    biology: {
        subtopics: {
            anatomy: {
                intents: {
                    explore: [
                        {
                            name: 'Anatomy Engine',
                            url: '',
                            embedType: 'component', // Existing in-app 3D anatomy viewer
                            description: 'Built-in Three.js anatomy viewer',
                            licensing: 'open_source',
                            requiresApiKey: false,
                            iframeAllowed: false
                        },
                        createLinkTool('Innerbody Research', 'https://www.innerbody.com/', 'Free human anatomy explorer')
                    ]
                }
            },
            dna_genetics: {
                intents: {
                    visualize: [
                        createIframeTool('JBrowse 2', 'https://jbrowse.org/', 'https://jbrowse.org/jb2/', 'Circular, synteny views; in-browser 3D protein structures'),
                        createIframeTool('UCSC Genome Browser', 'https://genome.ucsc.edu/', 'https://genome.ucsc.edu/cgi-bin/hgRenderTracks', 'Thousands of organisms; annotation tracks')
                    ]
                }
            },
            evolution: {
                intents: {
                    explore: [
                        createIframeTool('OneZoom Tree of Life', 'https://www.onezoom.org/', 'https://www.onezoom.org/', '2M+ species on one zoomable interactive tree')
                    ]
                }
            },
            cells: {
                intents: {
                    explore: [
                        createIframeTool('CELLS alive!', 'https://www.cellsalive.com/', 'https://www.cellsalive.com/cells/cell_model_js.htm', 'Interactive cell models (plant, animal, bacteria)')
                    ]
                }
            }
        }
    },

    // ── 6. MATH ───────────────────────────────────────────────────────────────
    mathematics: {
        subtopics: {
            graphing: {
                intents: {
                    visualize: [
                        createIframeTool('Desmos Graphing Calculator', 'https://www.desmos.com/calculator', 'https://www.desmos.com/calculator', '2D graphing, sliders, animations, tables'),
                        createIframeTool('GeoGebra Classic', 'https://www.geogebra.org/classic', 'https://www.geogebra.org/classic', 'Geometry, algebra, graphing, CAS')
                    ]
                }
            },
            graphing_3d: {
                intents: {
                    visualize: [
                        createIframeTool('Desmos 3D Calculator', 'https://www.desmos.com/3d', 'https://www.desmos.com/3d', '3D function graphing; surfaces, parametric curves'),
                        createIframeTool('GeoGebra 3D', 'https://www.geogebra.org/3d', 'https://www.geogebra.org/3d', '3D geometry, surface plotting')
                    ]
                }
            }
        }
    },

    // ── 7. CODING & CS ────────────────────────────────────────────────────────
    programming: {
        subtopics: {
            web_dev: {
                intents: {
                    practice: [
                        {
                            name: 'Sandpack',
                            url: 'https://sandpack.codesandbox.io/',
                            embedType: 'component', // Will use @codesandbox/sandpack-react
                            description: 'Live-reloading in-browser JS/React sandbox',
                            licensing: 'open_source',
                            requiresApiKey: false,
                            iframeAllowed: false
                        }
                    ]
                }
            },
            algorithms: {
                intents: {
                    visualize: [
                        createIframeTool('See Algorithms', 'https://see-algorithms.com/', 'https://see-algorithms.com/', 'Embeddable sorting visualizers'),
                        createLinkTool('VisuAlgo', 'https://visualgo.net/', 'Step-by-step algorithm animations (No iframe support)')
                    ]
                }
            },
            data_structures: {
                intents: {
                    visualize: [
                        createIframeTool('USF Data Structure Visualizations', 'https://www.cs.usfca.edu/~galles/visualization/Algorithms.html', 'https://www.cs.usfca.edu/~galles/visualization/Algorithms.html', 'Classic DS animations: BST, AVL, heaps, graphs')
                    ]
                }
            }
        }
    },

    // ── 8. MUSIC ──────────────────────────────────────────────────────────────
    music: {
        subtopics: {
            piano_chords: {
                intents: {
                    practice: [
                        {
                            name: 'ToneJsPiano',
                            url: '',
                            embedType: 'component', // Custom Tone.js implementation
                            description: 'Interactive piano with audio synthesis',
                            licensing: 'open_source',
                            requiresApiKey: false,
                            iframeAllowed: false
                        },
                        createIframeTool('Interactive Piano', '/piano.html', '/piano.html', 'Custom AI-controlled interactive piano with bi-directional event bus')
                    ]
                }
            },
            guitar: {
                intents: {
                    practice: [
                        createIframeTool('Virtual Guitar', 'https://www.musicca.com/guitar', 'https://www.musicca.com/guitar', 'Play virtual guitar in browser')
                    ]
                }
            },
            composition: {
                intents: {
                    build: [
                        createLinkTool('Chrome Music Lab: Song Maker', 'https://musiclab.chromeexperiments.com/Song-Maker/', 'Compose simple melodies (X-Frame-Options blocked)'),
                        createIframeTool('OneMotion Chord Player', 'https://www.onemotion.com/chord-player/', 'https://www.onemotion.com/chord-player/', 'Build + play chord progressions')
                    ]
                }
            },
            instruments: {
                intents: {
                    practice: [
                        createIframeTool('Virtual Drum Kit', 'https://www.virtualdrumming.com/', 'https://www.virtualdrumming.com/drums/online-virtual-games/hip-hop-drum-kits.html', 'Play virtual drums in browser'),
                        createIframeTool('Virtual Guitar', 'https://www.musicca.com/guitar', 'https://www.musicca.com/guitar', 'Play virtual guitar in browser')
                    ]
                }
            }
        }
    },

    // ── 9. HISTORY ────────────────────────────────────────────────────────────
    history: {
        subtopics: {
            timelines: {
                intents: {
                    visualize: [
                        {
                            name: 'TimelineJS',
                            url: 'https://timeline.knightlab.com/',
                            embedType: 'component', // Or via iframe with specific source URL
                            description: 'Interactive timelines',
                            licensing: 'open_source',
                            requiresApiKey: false,
                            iframeAllowed: true
                        }
                    ]
                }
            },
            ancient_sites: {
                intents: {
                    explore: [
                        createIframeTool('Sketchfab Ancient Models', 'https://sketchfab.com/', 'https://sketchfab.com/models/embed', '1000s of 3D-scanned artifacts and ruins viewable in browser')
                    ]
                }
            }
        }
    },

    // ── 10. ARTS & DESIGN ─────────────────────────────────────────────────────
    visual_arts: {
        subtopics: {
            drawing: {
                intents: {
                    practice: [
                        createIframeTool('Kleki', 'https://kleki.com/', 'https://kleki.com/', 'Paint Tool SAI-inspired; layers, brushes'),
                        createIframeTool('Excalidraw', 'https://excalidraw.com/', 'https://excalidraw.com/', 'Collaborative whiteboard; hand-drawn style')
                    ]
                }
            },
            color_theory: {
                intents: {
                    visualize: [
                        createIframeTool('Paletton', 'https://paletton.com/', 'https://paletton.com/', 'Color scheme designer with preview modes'),
                        createIframeTool('Sessions College Color Calculator', 'https://www.sessions.edu/color-calculator/', 'https://www.sessions.edu/color-calculator/', 'Step-by-step harmony building')
                    ]
                }
            },
            sculpting_3d: {
                intents: {
                    practice: [
                        createIframeTool('SculptGL', 'https://stephaneginier.com/sculptgl/', 'https://stephaneginier.com/sculptgl/', 'Powerful WebGL organic sculpting')
                    ]
                }
            }
        }
    },

    // ── 11. ENGINEERING & ARCHITECTURE ────────────────────────────────────────
    architecture: {
        subtopics: {
            cad_3d: {
                intents: {
                    build: [
                        createIframeTool('Spline', 'https://spline.design/', 'https://my.spline.design/', 'Real-time collaborative 3D design'),
                        createIframeTool('Tinkercad', 'https://www.tinkercad.com/', 'https://www.tinkercad.com/embed', 'Beginner 3D modeling')
                    ]
                }
            }
        }
    },

    // ── 12. ECONOMICS ─────────────────────────────────────────────────────────
    economics: {
        subtopics: {
            data: {
                intents: {
                    analyze: [
                        createIframeTool('Our World In Data (Econ)', 'https://ourworldindata.org', 'https://ourworldindata.org/grapher/gdp-per-capita-maddison-2020', 'GDP, inequality, poverty, trade')
                    ]
                }
            },
            markets: {
                intents: {
                    analyze: [
                        createIframeTool('TradingView', 'https://www.tradingview.com/', 'https://s.tradingview.com/widgetembed/', 'Paper trading + charting; real-time data')
                    ]
                }
            }
        }
    },

    // ── 13. CULINARY & COOKING ────────────────────────────────────────────────
    culinary: {
        subtopics: {
            recipes_techniques: {
                intents: {
                    practice: [
                        createIframeTool('MyFridgeFood', 'https://myfridgefood.com/', 'https://myfridgefood.com/', 'Input ingredients, get recipes')
                    ]
                }
            },
            food_science: {
                intents: {
                    visualize: [
                        createIframeTool('Harvard Science & Cooking', 'https://www.edx.org/course/science-and-cooking', 'https://www.edx.org/course/science-and-cooking', 'Learn the chemistry and physics of cooking')
                    ]
                }
            }
        }
    }
};

/**
 * Given a domain and a subtopic keyword, tries to find the best intent and tool.
 * For now, just returns the first intent and tool available for a matching subtopic.
 */
export function resolveTool(domainKey: string, subtopicQuery: string): { intent: LearningIntent, tool: Tool } | null {
    const domainData = ToolsDB[domainKey];
    if (!domainData) return null;

    // Fuzzy match subtopic
    const subtopicKeys = Object.keys(domainData.subtopics);
    let bestMatchKey = subtopicKeys[0]; // fallback
    for (const key of subtopicKeys) {
        if (subtopicQuery.toLowerCase().includes(key.replace('_', ' '))) {
            bestMatchKey = key;
            break;
        }
    }

    const subtopicData = domainData.subtopics[bestMatchKey];
    if (!subtopicData) return null;

    // Pick first intent
    const intents = Object.keys(subtopicData.intents) as LearningIntent[];
    if (intents.length === 0) return null;

    const firstIntent = intents[0];
    const tools = subtopicData.intents[firstIntent];
    if (!tools || tools.length === 0) return null;

    // Prefer iframe tools if available, otherwise take the first
    const bestTool = tools.find(t => t.embedType === 'iframe') || tools[0];

    return {
        intent: firstIntent,
        tool: bestTool
    };
}
