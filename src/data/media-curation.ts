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
    ottPlatforms: ['Lionsgate'],
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
    ottPlatforms: ['Primevideo'],
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
    ottPlatforms: ['JioHotstar'],
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
    ottPlatforms: ['A24 movies'],
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
    ottPlatforms: ['A24 movies'],
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
    ottPlatforms: ['Mubi'],
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
    ottPlatforms: ['Netflix'],
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
    ottPlatforms: ['HBO Max'],
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
    ottPlatforms: ['Netflix'],
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
    ottPlatforms: ['Primevideo'],
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
    ottPlatforms: ['A24 movies'],
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
    ottPlatforms: ['HBO Max'],
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
    ottPlatforms: ['Lionsgate'],
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
    ottPlatforms: ['HBO Max'],
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
    ottPlatforms: ['A24 movies'],
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
    ottPlatforms: ['Netflix'],
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
  {
    id: 'fight-club',
    title: 'Fight Club',
    year: 1999,
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter', 'Meat Loaf'],
    genres: ['Psychological', 'Drama', 'Satire'],
    ottPlatforms: ['Netflix'],
    rating: '9.4',
    runtime: '139 min',
    synopsis:
      'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and forms an underground fight club that evolves into something much more dangerous.',
    takeaway:
      'Fincher’s visceral deconstruction of consumerist alienation, toxic corporate emasculation, and fractured psychological identity.',
  },
  {
    id: 'american-psycho',
    title: 'American Psycho',
    year: 2000,
    director: 'Mary Harron',
    cast: ['Christian Bale', 'Willem Dafoe', 'Jared Leto', 'Chloë Sevigny'],
    genres: ['Psychological', 'Thriller', 'Drama'],
    ottPlatforms: ['Netflix'],
    rating: '9.1',
    runtime: '102 min',
    synopsis:
      'A wealthy New York City investment banking executive hides his alternate psychopathic ego from his co-workers and friends as he escalates into violent, hedonistic fantasies.',
    takeaway:
      'Mary Harron’s razor-sharp satire of Wall Street commodification, surface aesthetics, and hollow narcissistic psychopathy.',
  },
  {
    id: 'american-made',
    title: 'American Made',
    year: 2017,
    director: 'Doug Liman',
    cast: ['Tom Cruise', 'Domhnall Gleeson', 'Sarah Wright', 'Jesse Plemons'],
    genres: ['Action', 'Drama', 'History'],
    ottPlatforms: ['Netflix'],
    rating: '8.7',
    runtime: '115 min',
    synopsis:
      'The story of Barry Seal, an American pilot who became a drug runner for the Medellín Cartel in the 1980s and was subsequently recruited by the CIA for covert reconnaissance.',
    takeaway:
      'Doug Liman’s kinetic, sun-drenched satire of clandestine Cold War geopolitics, illicit cartel logistics, and opportunistic American capitalism.',
  },
  {
    id: 'scarface',
    title: 'Scarface',
    year: 1983,
    director: 'Brian De Palma',
    cast: ['Al Pacino', 'Michelle Pfeiffer', 'Steven Bauer', 'Robert Loggia'],
    genres: ['Drama', 'Action', 'Thriller'],
    ottPlatforms: ['Netflix'],
    rating: '9.2',
    runtime: '170 min',
    synopsis:
      'In 1980 Miami, a determined Cuban immigrant takes over a drug cartel and succumbs to greed, paranoia, and catastrophic excess.',
    takeaway:
      'De Palma and Oliver Stone crafting the mythic opera of ruthless immigrant ambition, synthesizer grandeur, and the inevitable entropy of unchecked power.',
  },
  {
    id: 'devils-advocate',
    title: "The Devil's Advocate",
    year: 1997,
    director: 'Taylor Hackford',
    cast: ['Keanu Reeves', 'Al Pacino', 'Charlize Theron', 'Jeffrey Jones'],
    genres: ['Drama', 'Mystery', 'Psychological'],
    ottPlatforms: ['Netflix'],
    rating: '8.8',
    runtime: '144 min',
    synopsis:
      'An exceptionally adept Florida defense attorney is offered a lucrative job at a high-end New York City law firm run by an enigmatic patriarch who harbors infernal secrets.',
    takeaway:
      'Pacino’s legendary theatrical tour-de-force exploring moral vanity, corporate hubris, and Milton’s free will paradox.',
  },
  {
    id: 'the-irishman',
    title: 'The Irishman',
    year: 2019,
    director: 'Martin Scorsese',
    cast: ['Robert De Niro', 'Al Pacino', 'Joe Pesci', 'Harvey Keitel'],
    genres: ['Drama', 'History', 'Biography'],
    ottPlatforms: ['Netflix'],
    rating: '9.3',
    runtime: '209 min',
    synopsis:
      'An old truck driver turned hitman reflects on his life in organized crime, his close friendship with Jimmy Hoffa, and the heavy moral price of lifelong loyalty.',
    takeaway:
      'Scorsese’s elegiac masterwork dismantling mob romanticism into lonely geriatric silence, temporal regret, and historical guilt.',
  },
  {
    id: 'el-camino',
    title: 'El Camino: A Breaking Bad Movie',
    year: 2019,
    director: 'Vince Gilligan',
    cast: ['Aaron Paul', 'Jesse Plemons', 'Krysten Ritter', 'Robert Forster'],
    genres: ['Drama', 'Action', 'Thriller'],
    ottPlatforms: ['Netflix'],
    rating: '8.9',
    runtime: '122 min',
    synopsis:
      'In the wake of his dramatic escape from captivity, Jesse Pinkman must wrestle with the scars of his past in order to forge some kind of future.',
    takeaway:
      'Vince Gilligan’s meticulous cinematic epilogue granting hard-won catharsis through precision neo-Western shootouts and trauma reconciliation.',
  },
  {
    id: 'texas-chainsaw-massacre',
    title: 'Texas Chainsaw Massacre',
    year: 2022,
    director: 'David Blue Garcia',
    cast: ['Sarah Yarkin', 'Elsie Fisher', 'Mark Burnham', 'Jacob Latimore'],
    genres: ['Horror', 'Action', 'Thriller'],
    ottPlatforms: ['Netflix'],
    rating: '7.3',
    runtime: '83 min',
    synopsis:
      'After nearly 50 years of hiding, Leatherface returns to terrorize a group of idealistic young influencers who accidentally disrupt his carefully shielded world in a remote Texas ghost town.',
    takeaway:
      'A visceral, unapologetic industrial slaughterhouse thrill-ride contrasting gentrification influencer culture with raw grindhouse butchery.',
  },
  {
    id: '28-days-later',
    title: '28 Days Later',
    year: 2002,
    director: 'Danny Boyle',
    cast: ['Cillian Murphy', 'Naomie Harris', 'Christopher Eccleston', 'Brendan Gleeson'],
    genres: ['Sci-Fi', 'Horror', 'Psychological'],
    ottPlatforms: ['Netflix'],
    rating: '9.2',
    runtime: '113 min',
    synopsis:
      'Four weeks after a mysterious, incurable virus spreads throughout the UK, a bicycle courier awakens from a coma to discover London desolate and overrun by infected rage victims.',
    takeaway:
      'Danny Boyle’s pioneering digital DV cinematography that radically reimagined modern pandemic cinema and kinetic viral panic.',
  },
  {
    id: '28-years-later',
    title: '28 Years Later',
    year: 2025,
    director: 'Danny Boyle',
    cast: ['Cillian Murphy', 'Jodie Comer', 'Aaron Taylor-Johnson', 'Ralph Fiennes'],
    genres: ['Sci-Fi', 'Horror', 'Action'],
    ottPlatforms: ['Netflix'],
    rating: '9.1',
    runtime: '118 min',
    synopsis:
      'Nearly three decades after the initial outbreak, society on the British Isles has mutated into fortified enclave survivalism as a new evolutionary strain of the Rage virus surfaces.',
    takeaway:
      'Alex Garland and Danny Boyle returning to their seminal apocalypse with large-format kinetic optics exploring intergenerational trauma and viral permanence.',
  },
  {
    id: '28-years-later-part-2',
    title: '28 Years Later: The Bone Temple',
    year: 2026,
    director: 'Nia DaCosta',
    cast: ['Ralph Fiennes', 'Jack O’Connell', 'Alfie Williams', 'Aaron Taylor-Johnson'],
    genres: ['Sci-Fi', 'Horror', 'Drama'],
    ottPlatforms: ['Netflix'],
    rating: '9.0',
    runtime: '115 min',
    synopsis:
      'The direct sequel following 28 Years Later, tracking survivors deeper into the contaminated ruins of the British interior where rival survivor enclaves and mutated threats clash.',
    takeaway:
      'Nia DaCosta bringing psychological claustrophobia and visceral gothic dread into the expanding post-Rage mythos.',
  },
  {
    id: 'no-country-for-old-men',
    title: 'No Country for Old Men',
    year: 2007,
    director: 'Joel & Ethan Coen',
    cast: ['Javier Bardem', 'Tommy Lee Jones', 'Josh Brolin', 'Woody Harrelson'],
    genres: ['Drama', 'Thriller', 'Neo-Noir'],
    ottPlatforms: ['Netflix'],
    rating: '9.6',
    runtime: '122 min',
    synopsis:
      'Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande.',
    takeaway:
      'The Coen brothers’ cold mathematical masterpiece on stochastic fate, Anton Chigurh’s coin toss fatalism, and the vanishing certainty of moral order.',
  },
  {
    id: 'the-cloverfield-paradox',
    title: 'The Cloverfield Paradox',
    year: 2018,
    director: 'Julius Onah',
    cast: ['Gugu Mbatha-Raw', 'David Oyelowo', 'Daniel Brühl', 'Elizabeth Debicki'],
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    ottPlatforms: ['Netflix'],
    rating: '7.6',
    runtime: '102 min',
    synopsis:
      'Orbiting a planet on the brink of war, scientists test a particle accelerator to solve an energy crisis, only to rip apart spacetime and discover Earth has vanished.',
    takeaway:
      'High-concept spatial entanglement, interdimensional anomaly physics, and paranoid orbital containment.',
  },
  {
    id: '10-cloverfield-lane',
    title: '10 Cloverfield Lane',
    year: 2016,
    director: 'Dan Trachtenberg',
    cast: ['Mary Elizabeth Winstead', 'John Goodman', 'John Gallagher Jr.'],
    genres: ['Psychological', 'Sci-Fi', 'Mystery'],
    ottPlatforms: ['Netflix'],
    rating: '9.0',
    runtime: '103 min',
    synopsis:
      'After surviving a car crash, a young woman wakes up in an underground bunker with two men who claim the outside world has been rendered uninhabitable by a widespread chemical attack.',
    takeaway:
      'A claustrophobic pressure-cooker triumph of unreliable narrators, bunker survivalism, and apocalyptic sleight-of-hand.',
  },
  {
    id: 'a-quiet-place',
    title: 'A Quiet Place',
    year: 2018,
    director: 'John Krasinski',
    cast: ['Emily Blunt', 'John Krasinski', 'Millicent Simmonds', 'Noah Jupe'],
    genres: ['Sci-Fi', 'Drama', 'Horror'],
    ottPlatforms: ['Netflix'],
    rating: '9.1',
    runtime: '90 min',
    synopsis:
      'A family must navigate their lives in silence while hiding from blind extraterrestrial creatures with ultra-sensitive acoustic tracking capabilities.',
    takeaway:
      'Revolutionary acoustic sound engineering where decibel dynamics serve as the core life-or-death narrative engine.',
  },
  {
    id: 'a-quiet-place-part-ii',
    title: 'A Quiet Place Part II',
    year: 2020,
    director: 'John Krasinski',
    cast: ['Emily Blunt', 'Cillian Murphy', 'Millicent Simmonds', 'Noah Jupe'],
    genres: ['Sci-Fi', 'Action', 'Drama'],
    ottPlatforms: ['Netflix'],
    rating: '8.9',
    runtime: '97 min',
    synopsis:
      'Following the events at home, the Abbott family must now face the terrors of the outside world as they continue their fight for survival in silence.',
    takeaway:
      'Masterful cross-cut parallel editing and tactile tension expanding the sonic warfare survival parameters.',
  },
  {
    id: 'the-revenant',
    title: 'The Revenant',
    year: 2015,
    director: 'Alejandro G. Iñárritu',
    cast: ['Leonardo DiCaprio', 'Tom Hardy', 'Domhnall Gleeson', 'Will Poulter'],
    genres: ['Adventure', 'Drama', 'History'],
    ottPlatforms: ['Netflix'],
    rating: '9.4',
    runtime: '156 min',
    synopsis:
      'A frontiersman on a fur trading expedition in the 1820s fights for survival after being mauled by a bear and left for dead by members of his own hunting team.',
    takeaway:
      'Emmanuel Lubezki’s natural light tracking shots creating an elemental, brutalist survival epic of raw human willpower.',
  },
  {
    id: 'hotel-transylvania',
    title: 'Hotel Transylvania',
    year: 2012,
    director: 'Genndy Tartakovsky',
    cast: ['Adam Sandler', 'Andy Samberg', 'Selena Gomez', 'Kevin James'],
    genres: ['Adventure', 'Comedy', 'Animation'],
    ottPlatforms: ['Netflix'],
    rating: '8.2',
    runtime: '89 min',
    synopsis:
      'Dracula, who operates a high-end resort away from the human world, goes into overprotective mode when a human boy stumbles onto the resort and falls for his teenage daughter.',
    takeaway:
      'Genndy Tartakovsky applying classic 2D squash-and-stretch animation timing and elastic kinetic energy to 3D computer graphics.',
  },
  {
    id: 'hotel-transylvania-2',
    title: 'Hotel Transylvania 2',
    year: 2015,
    director: 'Genndy Tartakovsky',
    cast: ['Adam Sandler', 'Andy Samberg', 'Selena Gomez', 'Mel Brooks'],
    genres: ['Adventure', 'Comedy', 'Animation'],
    ottPlatforms: ['Netflix'],
    rating: '8.0',
    runtime: '89 min',
    synopsis:
      'Dracula and his monster squad try to bring out the inner monster in his half-human, half-vampire grandson Dennis, while his old-school father Vlad pays a surprise visit.',
    takeaway:
      'Tartakovsky’s physical comedy choreography elevated by Mel Brooks’ veteran comedic presence and frantic character animation.',
  },
  {
    id: 'hotel-transylvania-3',
    title: 'Hotel Transylvania 3: Summer Vacation',
    year: 2018,
    director: 'Genndy Tartakovsky',
    cast: ['Adam Sandler', 'Andy Samberg', 'Selena Gomez', 'Kathryn Hahn'],
    genres: ['Adventure', 'Comedy', 'Animation'],
    ottPlatforms: ['Netflix'],
    rating: '7.9',
    runtime: '97 min',
    synopsis:
      'Dracula falls for a mysterious ship captain on a luxury monster cruise, unaware that she is the great-granddaughter of his archenemy, monster hunter Van Helsing.',
    takeaway:
      'Maximalist slapstick staging, vibrant nautical color theory, and Looney Tunes-inspired physical gag mechanics.',
  },
  {
    id: 'the-lord-of-the-rings',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    year: 2001,
    director: 'Peter Jackson',
    cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen', 'Orlando Bloom', 'Sean Astin'],
    genres: ['Adventure', 'Drama', 'Epic'],
    ottPlatforms: ['Netflix'],
    rating: '9.8',
    runtime: '178 min',
    synopsis:
      'A meek Hobbit from the Shire and eight companions set out on a perilous journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    takeaway:
      'The absolute summit of practical physical miniatures, Wētā prosthetic crafts, Howard Shore orchestral leitmotifs, and worldbuilding fidelity.',
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
    ottPlatforms: ['HBO Max'],
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
    ottPlatforms: ['HBO Max'],
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
    ottPlatforms: ['HBO Max'],
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
    ottPlatforms: ['HBO Max'],
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
  {
    id: 'adolescence',
    title: 'Adolescence',
    years: '2025',
    creator: 'Jack Thorne & Stephen Graham (Dir: Philip Barantini)',
    cast: ['Stephen Graham', 'Owen Cooper', 'Christine Tremarco', 'Ashley Walters'],
    genres: ['Drama', 'Psychological', 'Crime'],
    ottPlatforms: ['Netflix'],
    rating: '9.5',
    seasons: 'Miniseries (4 Episodes)',
    synopsis:
      'When a 13-year-old boy is arrested for the murder of a female classmate, his family and community unravel in a real-time, four-part continuous single-take exploration of grief, modern youth, and social media radicalization.',
    takeaway:
      'Philip Barantini’s revolutionary continuous single-take cinematography transforming real-time domestic grief into an unflinching, claustrophobic psychological tour-de-force.',
  },
  {
    id: 'midnight-mass',
    title: 'Midnight Mass',
    years: '2021',
    creator: 'Mike Flanagan',
    cast: ['Kate Siegel', 'Zach Gilford', 'Hamish Linklater', 'Samantha Sloyan'],
    genres: ['Drama', 'Mystery', 'Psychological'],
    ottPlatforms: ['Netflix'],
    rating: '9.3',
    seasons: 'Miniseries (7 Episodes)',
    synopsis:
      'The arrival of a charismatic young priest revitalizes a dying isolated island community, bringing about miraculous occurrences and frightening religious fervor.',
    takeaway:
      'Hamish Linklater’s mesmerizing homilies anchoring a transcendent meditation on mortality, religious dogma, addiction, and the biological terror of eternal life.',
  },
  {
    id: 'chucky',
    title: 'Chucky',
    years: '2021 – Present',
    creator: 'Don Mancini',
    cast: ['Zackary Arthur', 'Björgvin Arnarson', 'Alyvia Alyn Lind', 'Brad Dourif'],
    genres: ['Comedy', 'Mystery', 'Psychological'],
    ottPlatforms: ['Netflix'],
    rating: '8.6',
    seasons: '3 Seasons',
    synopsis:
      'After a vintage Chucky doll turns up at a suburban yard sale, an idyllic American town is thrown into chaos as a series of horrifying murders begin to expose the town’s hypocrisies and secrets.',
    takeaway:
      'Don Mancini ingeniously revitalizing franchise lore through practical puppet animatronics, queer coming-of-age storytelling, and unapologetic camp-slasher subversion.',
  },
  {
    id: 'tiger-king',
    title: 'Tiger King',
    years: '2020 – 2021',
    creator: 'Eric Goode & Rebecca Chaiklin',
    cast: ['Joe Exotic', 'Carole Baskin', 'Bhagavan Antle', 'John Finlay'],
    genres: ['Crime', 'History', 'Comedy'],
    ottPlatforms: ['Netflix'],
    rating: '8.5',
    seasons: '2 Seasons',
    synopsis:
      'A rivalry between eccentric big cat collectors takes a dark turn when Joe Exotic, a controversial Oklahoma zoo owner, is embroiled in a murder-for-hire plot.',
    takeaway:
      'A surreal, captivating sociological snapshot of fringe Americana, private zoo commercialism, and sensationalist unscripted warfare.',
  },
  {
    id: 'breaking-bad',
    title: 'Breaking Bad',
    years: '2008 – 2013',
    creator: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Giancarlo Esposito', 'Dean Norris'],
    genres: ['Crime', 'Drama', 'Psychological'],
    ottPlatforms: ['Netflix'],
    rating: '9.8',
    seasons: '5 Seasons (Complete)',
    synopsis:
      'A chemistry teacher diagnosed with terminal lung cancer teams up with a former student to manufacture and sell crystal meth in order to secure his family’s financial future.',
    takeaway:
      'The pinnacle of dramatic causal architecture, moral decay physics, and Bryan Cranston’s transformative descent into Heisenberg.',
  },
  {
    id: 'better-call-saul',
    title: 'Better Call Saul',
    years: '2015 – 2022',
    creator: 'Vince Gilligan & Peter Gould',
    cast: [
      'Bob Odenkirk',
      'Rhea Seehorn',
      'Jonathan Banks',
      'Giancarlo Esposito',
      'Patrick Fabian',
    ],
    genres: ['Crime', 'Drama', 'Corporate Satire'],
    ottPlatforms: ['Netflix'],
    rating: '9.7',
    seasons: '6 Seasons (Complete)',
    synopsis:
      'The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.',
    takeaway:
      'Unsurpassed character study pacing, intricate procedural legal writing, and Rhea Seehorn & Bob Odenkirk’s tragic moral devolution.',
  },
  {
    id: 'peaky-blinders',
    title: 'Peaky Blinders',
    years: '2013 – 2022',
    creator: 'Steven Knight',
    cast: ['Cillian Murphy', 'Paul Anderson', 'Helen McCrory', 'Tom Hardy', 'Sophie Rundle'],
    genres: ['Crime', 'Drama', 'History'],
    ottPlatforms: ['Netflix'],
    rating: '9.3',
    seasons: '6 Seasons (Complete)',
    synopsis:
      'A notorious gang in 1919 Birmingham, England, is led by the fierce Tommy Shelby, a crime boss set on moving up in the world no matter the cost.',
    takeaway:
      'Cillian Murphy’s razor-calm tactical mastermind Tommy Shelby contrasted with anachronistic rock soundtracks and industrialized post-WWI smoke and brimstone.',
  },
  {
    id: 'wednesday',
    title: 'Wednesday',
    years: '2022 – Present',
    creator: 'Alfred Gough & Miles Millar (Dir: Tim Burton)',
    cast: ['Jenna Ortega', 'Gwendoline Christie', 'Emma Myers', 'Christina Ricci'],
    genres: ['Mystery', 'Comedy', 'Psychological'],
    ottPlatforms: ['Netflix'],
    rating: '8.8',
    seasons: 'Season 1 & 2',
    synopsis:
      'While attending Nevermore Academy, Wednesday Addams attempts to master her emerging psychic ability, thwart a monstrous killing spree, and solve a 25-year-old mystery.',
    takeaway:
      'Jenna Ortega’s deadpan physical precision and Tim Burton’s gothic visual architecture re-energizing the macabre Addams mythos.',
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    years: '2016 – 2025',
    creator: 'The Duffer Brothers',
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    ottPlatforms: ['Netflix'],
    rating: '9.2',
    seasons: '5 Seasons',
    synopsis:
      'When a young boy vanishes, a small Indiana town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl with telekinetic powers.',
    takeaway:
      'Masterful synthesis of Spielbergian childhood camaraderie, Carpenter synth scores, and Lovecraftian multidimensional horror.',
  },
  {
    id: 'lucifer',
    title: 'Lucifer',
    years: '2016 – 2021',
    creator: 'Tom Kapinos',
    cast: ['Tom Ellis', 'Lauren German', 'Lesley-Ann Brandt', 'D.B. Woodside'],
    genres: ['Crime', 'Mystery', 'Comedy'],
    ottPlatforms: ['Netflix'],
    rating: '8.7',
    seasons: '6 Seasons (Complete)',
    synopsis:
      'Bored and unhappy as the Lord of Hell, Lucifer Morningstar abandons his throne and retires to Los Angeles, where he ends up teaming with an LAPD detective to solve homicides.',
    takeaway:
      'Tom Ellis’s charismatic theatrical charm steering an irresistible blend of celestial psychology, Freudian therapy, and detective casework.',
  },
  {
    id: 'rick-and-morty',
    title: 'Rick and Morty',
    years: '2013 – Present',
    creator: 'Dan Harmon & Justin Roiland',
    cast: ['Justin Roiland', 'Chris Parnell', 'Spencer Grammer', 'Sarah Chalke'],
    genres: ['Sci-Fi', 'Comedy', 'Cyber-Thriller'],
    ottPlatforms: ['Netflix'],
    rating: '9.3',
    seasons: '7 Seasons',
    synopsis:
      'An eccentric sociopathic scientist and his easily influenced grandson embark on insane interdimensional adventures across infinite parallel universes.',
    takeaway:
      'Dan Harmon’s airtight story circle mechanics dismantling narrative tropes through nihilistic quantum absurdity and existential dread.',
  },
  {
    id: 'trailer-park-boys',
    title: 'Trailer Park Boys',
    years: '2001 – 2018',
    creator: 'Mike Clattenburg',
    cast: ['Robb Wells', 'John Paul Tremblay', 'Mike Smith', 'John Dunsworth'],
    genres: ['Comedy', 'Crime'],
    ottPlatforms: ['Netflix'],
    rating: '8.7',
    seasons: '12 Seasons',
    synopsis:
      'Three petty felons living in a Dartmouth, Nova Scotia trailer park constantly concoct get-rich-quick schemes while dodging alcoholic trailer park supervisor Jim Lahey.',
    takeaway:
      'Pioneering mockumentary low-fi authenticity, improvised chaotic gold, and John Dunsworth’s masterclass in physical character acting.',
  },
  {
    id: 'pantheon',
    title: 'Pantheon',
    years: '2022 – 2023',
    creator: 'Craig Silverstein (Based on Ken Liu)',
    cast: ['Katie Chang', 'Paul Dano', 'Daniel Dae Kim', 'Rosemarie DeWitt'],
    genres: ['Sci-Fi', 'Cyber-Thriller', 'Psychological'],
    ottPlatforms: ['Netflix'],
    rating: '9.4',
    seasons: '2 Seasons (Complete)',
    synopsis:
      'A bullied teen receives mysterious online help from her deceased father, uncovering a global corporate conspiracy surrounding Uploaded Intelligence (UI) and digital immortality.',
    takeaway:
      'The most intellectually uncompromising hard sci-fi exploration of whole brain emulation, cognitive substrate independence, and post-human Dyson megastructures ever animated.',
  },
  {
    id: '3-body-problem',
    title: '3 Body Problem',
    years: '2024 – Present',
    creator: 'David Benioff, D.B. Weiss, Alexander Woo (Based on Liu Cixin)',
    cast: ['Benedict Wong', 'Jess Hong', 'Jovan Adepo', 'Eiza González', 'Liam Cunningham'],
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    ottPlatforms: ['Netflix'],
    rating: '9.0',
    seasons: 'Season 1',
    synopsis:
      'A fateful decision made in 1960s China reverberates across space and time to a group of brilliant scientists in the present day as the laws of physics unspool and an alien fleet approaches.',
    takeaway:
      'Liu Cixin’s Dark Forest cosmic pessimism brought to life with terrifying scale: nanofiber canal ambushes, sophon proton unfoldings, and existential human vulnerability.',
  },
];
