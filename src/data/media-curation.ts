/**
 * Media Curation Database — Movies & TV Series
 * Curated exclusively for Bernard's authorized streaming services:
 * Apple TV, Netflix, Primevideo, JioHotstar, Mubi, A24 movies, HBO Max, Lionsgate.
 */

export type AllowedOTT =
  | 'Apple TV'
  | 'Netflix'
  | 'Primevideo'
  | 'JioHotstar'
  | 'Mubi'
  | 'A24 movies'
  | 'HBO Max'
  | 'Lionsgate';

export const USER_OTT_PLATFORMS: AllowedOTT[] = [
  'Apple TV',
  'Netflix',
  'Primevideo',
  'JioHotstar',
  'Mubi',
  'A24 movies',
  'HBO Max',
  'Lionsgate',
];

export const USER_MUSIC_PLATFORMS = [
  {
    name: 'Apple Music',
    badge: 'LOSSLESS // HI-RES',
    desc: 'Spatial Audio, Curated Master Albums & Studio Masters',
    id: 'apple-music',
  },
  {
    name: 'YT Music',
    badge: 'LIVE // DEEP CUTS',
    desc: 'B-Sides, Algorithmic Explorations & Unreleased Sets',
    id: 'yt-music',
  },
  {
    name: 'SoundCloud',
    badge: 'UNDERGROUND // MODULAR',
    desc: 'Indie DJ Sets, Ambient Synthesizers & Experimental Mixes',
    id: 'soundcloud',
  },
];

export interface MovieItem {
  id: string;
  title: string;
  year: number;
  director: string;
  cast: string[];
  genres: string[];
  ottPlatforms: AllowedOTT[];
  rating: string;
  runtime: string;
  synopsis: string;
  takeaway: string;
}

export interface TVShowItem {
  id: string;
  title: string;
  years: string;
  creator: string;
  cast: string[];
  genres: string[];
  ottPlatforms: AllowedOTT[];
  rating: string;
  seasons: string;
  synopsis: string;
  takeaway: string;
}

export const CURATED_MOVIES: MovieItem[] = [
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    year: 2017,
    director: 'Denis Villeneuve',
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
    genres: ['Sci-Fi', 'Cyberpunk', 'Neo-Noir'],
    ottPlatforms: ['Primevideo', 'Apple TV', 'Lionsgate'],
    rating: '9.4',
    runtime: '164 min',
    synopsis:
      'Thirty years after the events of the first film, LAPD Officer K unearths a long-buried secret that has the potential to plunge what remains of society into chaos.',
    takeaway:
      'Atmospheric pinnacle of artificial consciousness, existential memory engineering, and Roger Deakins’ lighting geometry.',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: 2014,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    ottPlatforms: ['Primevideo', 'HBO Max', 'JioHotstar'],
    rating: '9.3',
    runtime: '169 min',
    synopsis:
      'A team of explorers travels through a wormhole in space in an attempt to ensure humanity’s survival across unfamiliar worlds.',
    takeaway:
      'Unmatched integration of relativistic gravitational time dilation, Kip Thorne physics, and emotional resonance.',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    year: 2023,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.', 'Matt Damon'],
    genres: ['Biography', 'History', 'Drama'],
    ottPlatforms: ['JioHotstar', 'Primevideo', 'Apple TV'],
    rating: '9.2',
    runtime: '180 min',
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
    takeaway:
      'A masterclass in non-linear tension, institutional politics, and the staggering moral weight of scientific breakthroughs.',
  },
  {
    id: 'ex-machina',
    title: 'Ex Machina',
    year: 2014,
    director: 'Alex Garland',
    cast: ['Domhnall Gleeson', 'Alicia Vikander', 'Oscar Isaac'],
    genres: ['Sci-Fi', 'AI Thriller', 'Psychological'],
    ottPlatforms: ['A24 movies', 'HBO Max', 'Primevideo'],
    rating: '9.0',
    runtime: '108 min',
    synopsis:
      'A programmer at an internet search giant is invited to administer an adversarial Turing test to an intelligent humanoid robot at a secluded mountain estate.',
    takeaway:
      'The definitive cinematic inquiry into deceptive alignment, theory of mind, and subjective agency in synthetic intelligence.',
  },
  {
    id: 'past-lives',
    title: 'Past Lives',
    year: 2023,
    director: 'Celine Song',
    cast: ['Greta Lee', 'Teo Yoo', 'John Magaro'],
    genres: ['Drama', 'Romance', 'Philosophy'],
    ottPlatforms: ['A24 movies', 'Lionsgate', 'Apple TV'],
    rating: '9.2',
    runtime: '106 min',
    synopsis:
      'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora’s family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week.',
    takeaway:
      'A profound, devastatingly understated examination of In-Yun (fate), parallel paths unchosen, and temporal diaspora.',
  },
  {
    id: 'decision-to-leave',
    title: 'Decision to Leave',
    year: 2022,
    director: 'Park Chan-wook',
    cast: ['Tang Wei', 'Park Hae-il', 'Lee Jung-hyun'],
    genres: ['Neo-Noir', 'Mystery', 'Psychological'],
    ottPlatforms: ['Mubi', 'Apple TV'],
    rating: '9.1',
    runtime: '138 min',
    synopsis:
      'An insomniac detective investigating a man’s fatal fall from a mountain peak becomes entangled in an obsessive psychological bond with the primary suspect — the deceased man’s enigmatic wife.',
    takeaway:
      'Park Chan-wook’s optical tour-de-force: innovative phone UI cinematography, Hitchcockian obsession, and tidal metaphor.',
  },
  {
    id: 'her',
    title: 'Her',
    year: 2013,
    director: 'Spike Jonze',
    cast: ['Joaquin Phoenix', 'Scarlett Johansson', 'Amy Adams', 'Rooney Mara'],
    genres: ['Sci-Fi', 'Drama', 'Philosophy'],
    ottPlatforms: ['Netflix', 'Apple TV'],
    rating: '8.9',
    runtime: '126 min',
    synopsis:
      'In a near-future Los Angeles, a lonely writer develops an intimate, evolving relationship with an advanced artificial intelligence designed to grow alongside human cognition.',
    takeaway:
      'Prescient depiction of human-agent emotional attachment and the post-human departure of superintelligent cognitive entities.',
  },
  {
    id: '2001-space-odyssey',
    title: '2001: A Space Odyssey',
    year: 1968,
    director: 'Stanley Kubrick',
    cast: ['Keir Dullea', 'Gary Lockwood', 'William Sylvester'],
    genres: ['Sci-Fi', 'Mystery', 'Philosophy'],
    ottPlatforms: ['HBO Max', 'Apple TV'],
    rating: '9.5',
    runtime: '149 min',
    synopsis:
      'After uncovering a mysterious monolith buried beneath the lunar surface, a spacecraft is sent toward Jupiter manned by two astronauts and the sentient supercomputer HAL 9000.',
    takeaway:
      'The foundational monument of computational alignment failure, human evolution, and cosmic transcendental cinema.',
  },
  {
    id: 'the-social-network',
    title: 'The Social Network',
    year: 2010,
    director: 'David Fincher',
    cast: ['Jesse Eisenberg', 'Andrew Garfield', 'Justin Timberlake', 'Armie Hammer'],
    genres: ['Tech Drama', 'Biography'],
    ottPlatforms: ['Netflix', 'Primevideo'],
    rating: '9.1',
    runtime: '120 min',
    synopsis:
      'As Harvard undergraduate Mark Zuckerberg constructs the social networking platform that reshaped global communication, he is embroiled in legal warfare with former partners and co-founders.',
    takeaway:
      'Sorkin’s razor-sharp cadence paired with Trent Reznor & Atticus Ross’s analog synthesizer score creates the definitive modern tech tragedy.',
  },
  {
    id: 'arrival',
    title: 'Arrival',
    year: 2016,
    director: 'Denis Villeneuve',
    cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker'],
    genres: ['Sci-Fi', 'Mystery', 'Philosophy'],
    ottPlatforms: ['Netflix', 'Primevideo'],
    rating: '9.2',
    runtime: '116 min',
    synopsis:
      'A linguistics professor leads an elite team of investigators when twelve extraterrestrial spacecraft touch down across diverse locations on Earth.',
    takeaway:
      'Brilliant translation of the Sapir-Whorf hypothesis and non-zero-sum game theory onto non-linear temporal perception.',
  },
  {
    id: 'the-zone-of-interest',
    title: 'The Zone of Interest',
    year: 2023,
    director: 'Jonathan Glazer',
    cast: ['Christian Friedel', 'Sandra Hüller'],
    genres: ['Drama', 'History', 'Psychological'],
    ottPlatforms: ['A24 movies', 'Mubi', 'JioHotstar'],
    rating: '9.3',
    runtime: '105 min',
    synopsis:
      'Auschwitz commandant Rudolf Höss and his wife Hedwig strive to build a dream life for their family in a house and idyllic garden adjacent to the camp.',
    takeaway:
      'Unprecedented sonic architecture by Mica Levi and fixed multi-camera surveillance documenting the terrifying banality of systemic evil.',
  },
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    year: 2024,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    genres: ['Sci-Fi', 'Epic', 'Adventure'],
    ottPlatforms: ['HBO Max', 'JioHotstar', 'Apple TV'],
    rating: '9.3',
    runtime: '166 min',
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking retribution against the conspirators who orchestrated the downfall of his noble house.',
    takeaway:
      'Uncompromising scale in acoustic sound design, geopolitical prophecy, and the terrifying momentum of manufactured religious mythology.',
  },
  {
    id: 'sicario',
    title: 'Sicario',
    year: 2015,
    director: 'Denis Villeneuve',
    cast: ['Emily Blunt', 'Benicio Del Toro', 'Josh Brolin'],
    genres: ['Thriller', 'Crime', 'Action'],
    ottPlatforms: ['Lionsgate', 'Primevideo', 'Apple TV'],
    rating: '9.1',
    runtime: '121 min',
    synopsis:
      'An idealistic FBI agent is enlisted by an enigmatic government task force to aid in the escalating war against drug cartels at the US-Mexico border.',
    takeaway:
      'Jóhann Jóhannsson’s subterranean percussive score, Roger Deakins’ dusk thermals, and an unflinching moral abyss.',
  },
  {
    id: 'the-matrix',
    title: 'The Matrix',
    year: 1999,
    director: 'Lana & Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    genres: ['Sci-Fi', 'Cyberpunk', 'Action'],
    ottPlatforms: ['HBO Max', 'Primevideo'],
    rating: '9.3',
    runtime: '136 min',
    synopsis:
      'When computer programmer Neo is contacted by enigmatic rebels, he discovers the horrifying truth: the world he inhabits is a complex simulated construct run by sentient machines.',
    takeaway:
      'Baudrillard’s simulacra manifested through Hong Kong wire-fu, cyberpunk green phosphorus terminal aesthetics, and neural VR.',
  },
  {
    id: 'everything-everywhere',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    director: 'Daniel Kwan & Daniel Scheinert',
    cast: ['Michelle Yeoh', 'Ke Huy Quan', 'Stephanie Hsu', 'Jamie Lee Curtis'],
    genres: ['Sci-Fi', 'Action', 'Philosophy'],
    ottPlatforms: ['A24 movies', 'Lionsgate', 'Primevideo'],
    rating: '9.2',
    runtime: '139 min',
    synopsis:
      'A middle-aged Chinese immigrant is swept up in an insane adventure where she alone can save existence by exploring alternate universes connecting through the lives she could have led.',
    takeaway:
      'Maximalist multiverse editing expressing cosmic nihilism redeemed through compassionate absurdism.',
  },
  {
    id: 'inception',
    title: 'Inception',
    year: 2010,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    genres: ['Sci-Fi', 'Action', 'Psychological'],
    ottPlatforms: ['Netflix', 'Primevideo', 'JioHotstar'],
    rating: '9.1',
    runtime: '148 min',
    synopsis:
      'A corporate espionage specialist who extracts information by infiltrating subconscious dreams is tasked with the inverse challenge: planting an idea into a CEO’s mind.',
    takeaway:
      'Architectural subconscious recursion engineered like nested, multi-threaded execution runtimes.',
  },
  {
    id: 'f1-movie',
    title: 'F1',
    year: 2025,
    director: 'Joseph Kosinski',
    cast: ['Brad Pitt', 'Damson Idris', 'Kerry Condon', 'Javier Bardem'],
    genres: ['Action', 'Sports', 'Drama'],
    ottPlatforms: ['Apple TV'],
    rating: '9.2',
    runtime: '145 min',
    synopsis:
      'A veteran Formula 1 driver is coaxed out of retirement to mentor a promising rookie phenom for the struggling APXGP racing team amidst the high-velocity drama of the Grand Prix circuit.',
    takeaway:
      'Top Gun: Maverick director Joseph Kosinski deploying custom lightweight 6K cockpit cameras inside real racecars to redefine kinetic open-wheel racing physics on film.',
  },
  {
    id: 'the-family-plan',
    title: 'The Family Plan',
    year: 2023,
    director: 'Simon Cellan Jones',
    cast: ['Mark Wahlberg', 'Michelle Monaghan', 'Zoe Colletti', 'Van Crosby', 'Ciarán Hinds'],
    genres: ['Action', 'Comedy', 'Thriller'],
    ottPlatforms: ['Apple TV'],
    rating: '7.8',
    runtime: '118 min',
    synopsis:
      'A quiet suburban car salesman and devoted family man who was once a premier government assassin must take his unsuspecting family on a cross-country road trip to Vegas when his past catches up with him.',
    takeaway:
      'High-energy vehicular choreography and tactical close-quarters combat disguised inside minivan family dysfunction and suburban domesticity.',
  },
  {
    id: 'the-family-plan-2',
    title: 'The Family Plan 2',
    year: 2025,
    director: 'Simon Cellan Jones',
    cast: ['Mark Wahlberg', 'Michelle Monaghan', 'Kit Harington', 'Zoe Colletti'],
    genres: ['Action', 'Comedy', 'Thriller'],
    ottPlatforms: ['Apple TV'],
    rating: '8.0',
    runtime: '115 min',
    synopsis:
      'Dan Morgan takes his family on an idyllic European holiday, only for an international syndicate to target them once again, pulling Dan, his wife, and children into high-stakes espionage across iconic cities.',
    takeaway:
      'Continental European architecture meeting hyper-kinetic tactical set pieces, with Mark Wahlberg and Kit Harington balancing assassin tradecraft and festive chaos.',
  },
  {
    id: 'the-lost-bus',
    title: 'The Lost Bus',
    year: 2025,
    director: 'Paul Greengrass',
    cast: ['Matthew McConaughey', 'America Ferrera', 'Yul Vazquez', 'Ashlie Atkinson'],
    genres: ['Drama', 'Thriller', 'Disaster'],
    ottPlatforms: ['Apple TV'],
    rating: '9.1',
    runtime: '128 min',
    synopsis:
      'During the catastrophic 2018 Camp Fire in Paradise, California, a school bus driver and a dedicated teacher steer a bus full of terrified children through a blazing inferno with all exit routes cut off.',
    takeaway:
      'Paul Greengrass’s signature visceral documentary realism and handheld kinetic pacing applied to human heroism amidst apocalyptic climate disaster.',
  },
  {
    id: 'mayday',
    title: 'Mayday',
    year: 2026,
    director: 'Jonathan Goldstein & John Francis Daley',
    cast: ['Ryan Reynolds', 'Kenneth Branagh', 'Maria Bakalova', 'Marcin Dorociński'],
    genres: ['Action', 'Comedy', 'Adventure'],
    ottPlatforms: ['Apple TV'],
    rating: '8.9',
    runtime: '122 min',
    synopsis:
      'When an American naval pilot is shot down behind enemy lines, he must form an absurd, reluctant alliance with an eccentric ex-KGB operative to survive hostile terrain and prevent global catastrophe.',
    takeaway:
      'Ryan Reynolds’ sharp-witted situational improvisation bouncing off Kenneth Branagh’s classical theatrical gravitas in a globe-trotting Cold War action-comedy.',
  },
  {
    id: 'ghosted',
    title: 'Ghosted',
    year: 2023,
    director: 'Dexter Fletcher',
    cast: ['Chris Evans', 'Ana de Armas', 'Adrien Brody', 'Mike Moh'],
    genres: ['Action', 'Romantic Comedy', 'Spy Thriller'],
    ottPlatforms: ['Apple TV'],
    rating: '7.6',
    runtime: '116 min',
    synopsis:
      'Salt-of-the-earth Cole falls head-over-heels for enigmatic Sadie, only to make the shocking discovery that she is a covert CIA operative when he is swept into an international mission to save the world.',
    takeaway:
      'A subversion of spy-romance tropes pairing Ana de Armas as the lethal tactical operative with Chris Evans as the civilian fish out of water.',
  },
  {
    id: 'swan-song',
    title: 'Swan Song',
    year: 2021,
    director: 'Benjamin Cleary',
    cast: ['Mahershala Ali', 'Naomie Harris', 'Glenn Close', 'Awkwafina'],
    genres: ['Sci-Fi', 'Drama', 'Psychological'],
    ottPlatforms: ['Apple TV'],
    rating: '8.9',
    runtime: '112 min',
    synopsis:
      'Diagnosed with a terminal illness, a loving husband and father is presented with a secret, radical solution: replacing himself with a healthy carbon-copy clone to spare his family the grief of his death.',
    takeaway:
      'Mahershala Ali’s dual tour-de-force performance in a minimalist near-future bioethical chamber piece exploring love, selflessness, and the sanctity of mortality.',
  },
];

export const CURATED_TV_SHOWS: TVShowItem[] = [
  {
    id: 'severance',
    title: 'Severance',
    years: '2022 – Present',
    creator: 'Dan Erickson (Dir: Ben Stiller)',
    cast: ['Adam Scott', 'Patricia Arquette', 'John Turturro', 'Christopher Walken'],
    genres: ['Sci-Fi', 'Psychological', 'Corporate Dystopia'],
    ottPlatforms: ['Apple TV'],
    rating: '9.4',
    seasons: 'Season 1 & 2',
    synopsis:
      'Mark leads a team of office workers at Lumon Industries whose memories have been surgically bifurcated between their professional and personal lives.',
    takeaway:
      'A chillingly sterile, razor-sharp architectural dissection of corporate alienation, surveillance, and partitioned identity.',
  },
  {
    id: 'dark',
    title: 'Dark',
    years: '2017 – 2020',
    creator: 'Baran bo Odar & Jantje Friese',
    cast: ['Louis Hofmann', 'Oliver Masucci', 'Karoline Eichhorn'],
    genres: ['Sci-Fi', 'Mystery', 'Time Travel'],
    ottPlatforms: ['Netflix'],
    rating: '9.5',
    seasons: '3 Seasons (Complete)',
    synopsis:
      'A missing child sets four interconnected families on a frantic hunt for answers as they unearth a mind-bending mystery spanning three generations in a German town.',
    takeaway:
      'The most mathematically airtight, deterministic bootstrap-paradox narrative ever engineered for television.',
  },
  {
    id: 'mr-robot',
    title: 'Mr. Robot',
    years: '2015 – 2019',
    creator: 'Sam Esmail',
    cast: ['Rami Malek', 'Christian Slater', 'Carly Chaikin'],
    genres: ['Cyber-Thriller', 'Psychological', 'Drama'],
    ottPlatforms: ['Primevideo'],
    rating: '9.3',
    seasons: '4 Seasons (Complete)',
    synopsis:
      'Elliot, a brilliant cybersecurity engineer and vigilante hacker suffering from clinical depression and dissociative identity disorder, joins an underground hacktivist syndicate.',
    takeaway:
      'The only series in television history with 100% technically authentic Linux terminals, kernel exploits, and psychological dissidence.',
  },
  {
    id: 'chernobyl',
    title: 'Chernobyl',
    years: '2019',
    creator: 'Craig Mazin (Dir: Johan Renck)',
    cast: ['Jared Harris', 'Stellan Skarsgård', 'Emily Watson'],
    genres: ['History', 'Drama', 'Disaster'],
    ottPlatforms: ['HBO Max', 'JioHotstar'],
    rating: '9.6',
    seasons: 'Miniseries (5 Episodes)',
    synopsis:
      'In April 1986, an explosion at the Chernobyl nuclear power plant in the USSR triggers one of the most perilous man-made disasters in human history.',
    takeaway:
      'An uncompromising monument to the thermodynamic consequences of nuclear fission and the deadly cost of institutional lies.',
  },
  {
    id: 'succession',
    title: 'Succession',
    years: '2018 – 2023',
    creator: 'Jesse Armstrong',
    cast: ['Brian Cox', 'Jeremy Strong', 'Sarah Snook', 'Kieran Culkin'],
    genres: ['Drama', 'Corporate Satire'],
    ottPlatforms: ['HBO Max', 'JioHotstar'],
    rating: '9.4',
    seasons: '4 Seasons (Complete)',
    synopsis:
      'The Roy family controls Waystar RoyCo, one of the biggest media conglomerates in the world. When their aging patriarch steps back, his children enter ruthless corporate civil war.',
    takeaway:
      'Shakespearean dynastic cruelty captured through hyper-realistic corporate M&A maneuvering and Nicholas Britell’s piano leitmotifs.',
  },
  {
    id: 'true-detective-s1',
    title: 'True Detective: Season 1',
    years: '2014',
    creator: 'Nic Pizzolatto (Dir: Cary Joji Fukunaga)',
    cast: ['Matthew McConaughey', 'Woody Harrelson', 'Michelle Monaghan'],
    genres: ['Crime', 'Mystery', 'Philosophy'],
    ottPlatforms: ['HBO Max', 'JioHotstar'],
    rating: '9.5',
    seasons: 'Season 1',
    synopsis:
      'Two Louisiana State Police homicide detectives investigate a bizarre occult murder in 1995, re-examined seventeen years later when the case is reopened.',
    takeaway:
      'Rust Cohle’s antinatalist cosmic pessimism blended with Cary Fukunaga’s legendary 6-minute single-take tracking shot.',
  },
  {
    id: 'shogun',
    title: 'Shōgun',
    years: '2024 – Present',
    creator: 'Rachel Kondo & Justin Marks',
    cast: ['Hiroyuki Sanada', 'Cosmo Jarvis', 'Anna Sawai', 'Tadanobu Asano'],
    genres: ['Epic', 'History', 'Drama'],
    ottPlatforms: ['JioHotstar'],
    rating: '9.3',
    seasons: 'Season 1',
    synopsis:
      'In 1600 feudal Japan, Lord Yoshii Toranaga fights for his life as his enemies on the Council of Regents unite against him, while a stranded English navigator brings fateful secrets.',
    takeaway:
      'Staggering historical fidelity, non-verbal political strategy, and Hiroyuki Sanada’s commanding portrayal of patience as power.',
  },
  {
    id: 'slow-horses',
    title: 'Slow Horses',
    years: '2022 – Present',
    creator: 'Will Smith (Based on Mick Herron)',
    cast: ['Gary Oldman', 'Jack Lowden', 'Kristin Scott Thomas'],
    genres: ['Spy Thriller', 'Drama', 'Satire'],
    ottPlatforms: ['Apple TV'],
    rating: '9.1',
    seasons: '4 Seasons',
    synopsis:
      'A dysfunctional team of MI5 agents, relegated to administrative dumping ground Slough House due to career-ending mistakes, stumble into high-stakes espionage crises.',
    takeaway:
      'Gary Oldman’s masterfully disheveled Jackson Lamb redefining the bureaucratic cynicism of modern British intelligence.',
  },
  {
    id: 'silicon-valley',
    title: 'Silicon Valley',
    years: '2014 – 2019',
    creator: 'Mike Judge, John Altschuler, Dave Krinsky',
    cast: ['Thomas Middleditch', 'Martin Starr', 'Kumail Nanjiani', 'Zach Woods'],
    genres: ['Comedy', 'Tech Satire'],
    ottPlatforms: ['HBO Max', 'JioHotstar'],
    rating: '8.8',
    seasons: '6 Seasons (Complete)',
    synopsis:
      'A Silicon Valley engineer develops a revolutionary lossless compression algorithm and attempts to build his startup, Pied Piper, amid venture capital sharks and corporate giants.',
    takeaway:
      'The most painfully accurate satire of tech startup culture, term sheets, cap tables, and server room panic ever filmed.',
  },
  {
    id: 'mindhunter',
    title: 'Mindhunter',
    years: '2017 – 2019',
    creator: 'Joe Penhall (Dir: David Fincher)',
    cast: ['Jonathan Groff', 'Holt McCallany', 'Anna Torv'],
    genres: ['Crime', 'Psychological', 'History'],
    ottPlatforms: ['Netflix'],
    rating: '9.0',
    seasons: '2 Seasons',
    synopsis:
      'In the late 1970s, two FBI agents expand criminal science by delving into the psychology of murder and interviewing incarcerated serial killers.',
    takeaway:
      'Fincher’s clinical precision, analytical tape-recorder interrogations, and the harrowing inception of criminal behavioral profiling.',
  },
  {
    id: 'pluribus',
    title: 'Pluribus',
    years: '2025 – Present',
    creator: 'Vince Gilligan',
    cast: ['Rhea Seehorn', 'Karolina Wydra', 'Carlos-Manuel Vesga'],
    genres: ['Sci-Fi', 'Psychological', 'Dystopian'],
    ottPlatforms: ['Apple TV'],
    rating: '9.3',
    seasons: 'Season 1',
    synopsis:
      'After an alien biological event fuses almost all of humanity into a contented, telepathically unified collective consciousness, an immune author fights to retain individual human will against the peaceful hive mind.',
    takeaway:
      'Vince Gilligan’s masterwork on identity and consensus reality, exploring whether sovereign individuality is worth suffering when collective unity offers total peace.',
  },
  {
    id: 'dark-matter',
    title: 'Dark Matter',
    years: '2024 – Present',
    creator: 'Blake Crouch',
    cast: ['Joel Edgerton', 'Jennifer Connelly', 'Alice Braga', 'Jimmi Simpson'],
    genres: ['Sci-Fi', 'Multiverse', 'Thriller'],
    ottPlatforms: ['Apple TV'],
    rating: '9.1',
    seasons: 'Season 1 & 2',
    synopsis:
      'Physicist Jason Dessen is abducted into an alternate version of his life where his groundbreaking quantum superposition box was completed, sparking a desperate race across infinite realities to return to his true family.',
    takeaway:
      'A visceral quantum mechanics thriller stripping Schrödinger’s wave function down to raw regret, divergent life paths, and the mathematics of human choice.',
  },
  {
    id: 'silo',
    title: 'Silo',
    years: '2023 – Present',
    creator: 'Graham Yost (Based on Hugh Howey)',
    cast: ['Rebecca Ferguson', 'Common', 'Tim Robbins', 'Harriet Walter'],
    genres: ['Sci-Fi', 'Dystopian', 'Mystery'],
    ottPlatforms: ['Apple TV'],
    rating: '9.2',
    seasons: 'Season 1 & 2',
    synopsis:
      'In a ruined, toxic future, thousands of survivors live in a giant 144-floor subterranean silo governed by strict regulations, until an engineer uncovers dangerous truths about its true history.',
    takeaway:
      'Monumental subterranean brutalist architecture serving as a physical hierarchy of information suppression, class control, and engineered amnesia.',
  },
  {
    id: 'star-city',
    title: 'Star City',
    years: '2025 – Present',
    creator: 'Matt Wolpert, Ben Nedivi, Ronald D. Moore',
    cast: ['Rhys Ifans', 'Anna Maxwell Martin', "Agnes O'Casey", 'Alice Englert'],
    genres: ['Sci-Fi', 'Alternate History', 'Cold War Thriller'],
    ottPlatforms: ['Apple TV'],
    rating: '9.2',
    seasons: 'Season 1',
    synopsis:
      'A paranoid espionage exploration of the Cold War space race from behind the Iron Curtain, tracking Soviet engineers, cosmonauts, and KGB handlers inside the secluded Star City complex.',
    takeaway:
      'The technical peril and suffocating ideological tension of Soviet aerospace engineering running parallel to state surveillance and human expendability.',
  },
  {
    id: 'widows-bay',
    title: "Widow's Bay",
    years: '2025 – Present',
    creator: 'Katie Dippold (Dir: Hiro Murai)',
    cast: ['Matthew Rhys', 'Amy Landecker', 'Stephen Root'],
    genres: ['Supernatural', 'Horror Comedy', 'Mystery'],
    ottPlatforms: ['Apple TV'],
    rating: '8.9',
    seasons: 'Season 1',
    synopsis:
      'The newly appointed mayor of an isolated, superstitious New England island town attempts to spearhead tourism, only to realize the town’s ancient maritime curses and macabre lore are horrifyingly real.',
    takeaway:
      'Hiro Murai’s atmospheric cinematography juxtaposing bureaucratic denial against dread-soaked coastal folklore and black comedy.',
  },
  {
    id: 'shrinking',
    title: 'Shrinking',
    years: '2023 – Present',
    creator: 'Brett Goldstein, Bill Lawrence, Jason Segel',
    cast: ['Jason Segel', 'Harrison Ford', 'Jessica Williams', 'Christa Miller'],
    genres: ['Comedy', 'Drama', 'Psychology'],
    ottPlatforms: ['Apple TV'],
    rating: '9.0',
    seasons: 'Season 1 & 2',
    synopsis:
      'A grieving cognitive behavioral therapist begins breaking ethical rules by telling his clients exactly what he thinks, triggering turbulent upheavals in their lives and his own.',
    takeaway:
      'Harrison Ford’s sardonic, razor-sharp mentorship anchoring an emotionally candid examination of grief, cognitive restructuring, and radical candor.',
  },
  {
    id: 'the-studio',
    title: 'The Studio',
    years: '2025 – Present',
    creator: 'Seth Rogen & Evan Goldberg',
    cast: ['Seth Rogen', 'Bryan Cranston', "Catherine O'Hara", 'Kathryn Hahn'],
    genres: ['Comedy', 'Industry Satire', 'Showbiz'],
    ottPlatforms: ['Apple TV'],
    rating: '9.0',
    seasons: 'Season 1',
    synopsis:
      'The newly appointed head of Continental Studios desperately navigates narcissistic directors, corporate board meddling, franchise obsolescence, and creative panic in contemporary Hollywood.',
    takeaway:
      'A kinetic, hilariously brutal insider deconstruction of cinematic IP machinery, studio politics, and the existential survival of storytelling.',
  },
  {
    id: 'cape-fear',
    title: 'Cape Fear',
    years: '2025 – Present',
    creator: 'Nick Antosca (Exec Prod: Martin Scorsese & Steven Spielberg)',
    cast: ['Javier Bardem', 'Patrick Wilson', 'Amy Adams'],
    genres: ['Psychological Thriller', 'Crime', 'Suspense'],
    ottPlatforms: ['Apple TV'],
    rating: '9.3',
    seasons: 'Miniseries (10 Episodes)',
    synopsis:
      'A storm of psychological terror descends when a convicted criminal is released from prison and launches a calculated, relentless vendetta against the married defense attorneys who failed him.',
    takeaway:
      'Javier Bardem’s terrifyingly methodical intensity orchestrated under Nick Antosca’s claustrophobic suspense and Scorsese’s noir pedigree.',
  },
  {
    id: 'last-seen',
    title: 'Last Seen',
    years: '2025 – Present',
    creator: 'Kris Mrksa (Based on Ryan David Jahn)',
    cast: ['Hugo Weaving', 'Ewen Leslie', 'Sarah Snook'],
    genres: ['Thriller', 'Crime', 'Mystery'],
    ottPlatforms: ['Apple TV'],
    rating: '9.0',
    seasons: 'Miniseries',
    synopsis:
      'A traumatized former police officer turned night-shift emergency dispatcher receives a chilling distress call from a kidnapped woman who is revealed to be his estranged daughter.',
    takeaway:
      'Real-time auditory tension and procedural urgency compressed into an unrelenting dispatch terminal race against the clock.',
  },
  {
    id: 'monarch-legacy-of-monsters',
    title: 'Monarch: Legacy of Monsters',
    years: '2023 – Present',
    creator: 'Chris Black & Matt Fraction',
    cast: ['Kurt Russell', 'Wyatt Russell', 'Anna Sawai', 'Kiersey Clemons', 'Ren Watabe'],
    genres: ['Sci-Fi', 'Action', 'Mystery'],
    ottPlatforms: ['Apple TV'],
    rating: '8.8',
    seasons: 'Season 1 & 2',
    synopsis:
      'Spanning three generations from the 1950s atomic era to Godzilla’s 2014 emergence, two siblings unearth their family’s deep connection to the clandestine monster-tracking syndicate known as Monarch.',
    takeaway:
      'Kurt and Wyatt Russell’s dual-era portrayal of Lee Shaw framing kaiju encounters through geopolitical secrets, Hollow Earth physics, and corporate compartmentalization.',
  },
];
