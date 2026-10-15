/**
 * Media Curation Database — Movies & TV Series
 * Curated cinema and television records with genres, director/creator, cast, OTT platforms, and analysis.
 */

export interface MovieItem {
  id: string;
  title: string;
  year: number;
  director: string;
  cast: string[];
  genres: string[];
  ottPlatforms: string[];
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
  ottPlatforms: string[];
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
    genres: ['Sci-Fi', 'Cyberpunk', 'Neo-Noir', 'Drama'],
    ottPlatforms: ['Prime Video', 'Apple TV+'],
    rating: '9.4',
    runtime: '164 min',
    synopsis:
      'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what is left of society into chaos.',
    takeaway:
      'Masterpiece in atmospheric world-building, artificial consciousness, and existential memory engineering.',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: 2014,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    ottPlatforms: ['Prime Video', 'Max'],
    rating: '9.3',
    runtime: '169 min',
    synopsis:
      'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    takeaway:
      'Unmatched integration of general relativity, Kip Thorne gravitational lensing physics, and emotional gravity.',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    year: 2023,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.', 'Matt Damon'],
    genres: ['Biography', 'Drama', 'History'],
    ottPlatforms: ['JioCinema', 'Apple TV+'],
    rating: '9.2',
    runtime: '180 min',
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    takeaway:
      'A masterclass in non-linear editing, ethical weight of transformative scientific breakthrough, and institutional politics.',
  },
  {
    id: 'ex-machina',
    title: 'Ex Machina',
    year: 2014,
    director: 'Alex Garland',
    cast: ['Domhnall Gleeson', 'Alicia Vikander', 'Oscar Isaac'],
    genres: ['Sci-Fi', 'Psychological Thriller', 'AI'],
    ottPlatforms: ['Prime Video', 'Max'],
    rating: '9.0',
    runtime: '108 min',
    synopsis:
      'A programmer at an internet search giant wins a competition to spend a week at the private mountain estate of the company CEO to administer a Turing test to an intelligent humanoid robot.',
    takeaway:
      'The quintessential cinematic inquiry into adversarial Turing tests, theory of mind, and deception in synthetic intelligence.',
  },
  {
    id: 'her',
    title: 'Her',
    year: 2013,
    director: 'Spike Jonze',
    cast: ['Joaquin Phoenix', 'Scarlett Johansson', 'Amy Adams', 'Rooney Mara'],
    genres: ['Sci-Fi', 'Romance', 'Drama'],
    ottPlatforms: ['Netflix', 'Apple TV+'],
    rating: '8.9',
    runtime: '126 min',
    synopsis:
      'In a near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.',
    takeaway:
      'Prescient depiction of human-LLM emotional bonding and the asymptotic departure of superintelligent cognitive entities.',
  },
  {
    id: '2001-space-odyssey',
    title: '2001: A Space Odyssey',
    year: 1968,
    director: 'Stanley Kubrick',
    cast: ['Keir Dullea', 'Gary Lockwood', 'William Sylvester'],
    genres: ['Sci-Fi', 'Mystery', 'Philosophy'],
    ottPlatforms: ['Max', 'Prime Video'],
    rating: '9.5',
    runtime: '149 min',
    synopsis:
      'After uncovering a mysterious artifact buried beneath the lunar surface, a spacecraft is sent to Jupiter to find its origins - a spacecraft manned by two men and the supercomputer HAL 9000.',
    takeaway:
      'The foundational monument of computational alignment failure, human evolution, and cosmic transcendental cinema.',
  },
  {
    id: 'the-social-network',
    title: 'The Social Network',
    year: 2010,
    director: 'David Fincher',
    cast: ['Jesse Eisenberg', 'Andrew Garfield', 'Justin Timberlake', 'Armie Hammer'],
    genres: ['Biography', 'Drama', 'Tech'],
    ottPlatforms: ['Netflix', 'Prime Video'],
    rating: '9.1',
    runtime: '120 min',
    synopsis:
      'As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by the twins who claimed he stole their idea, and by the co-founder who was later squeezed out.',
    takeaway:
      'Sorkin’s razor-sharp dialogue paired with Trent Reznor’s analog synthesizer score creates the definitive modern tech origin tragedy.',
  },
  {
    id: 'arrival',
    title: 'Arrival',
    year: 2016,
    director: 'Denis Villeneuve',
    cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker', 'Michael Stuhlbarg'],
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    ottPlatforms: ['Netflix', 'Prime Video'],
    rating: '9.2',
    runtime: '116 min',
    synopsis:
      'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
    takeaway:
      'Brilliant translation of the Sapir-Whorf hypothesis and non-zero-sum game theory onto non-linear temporal perception.',
  },
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    year: 2024,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    genres: ['Sci-Fi', 'Adventure', 'Epic'],
    ottPlatforms: ['JioCinema', 'Max', 'Apple TV+'],
    rating: '9.3',
    runtime: '166 min',
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    takeaway:
      'Uncompromising scale in geopolitical prophecy, acoustic design, and weaponized religious mythology.',
  },
  {
    id: 'the-matrix',
    title: 'The Matrix',
    year: 1999,
    director: 'Lana & Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    ottPlatforms: ['Max', 'Prime Video'],
    rating: '9.3',
    runtime: '136 min',
    synopsis:
      'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth - the life he knows is the elaborate deception of an evil cyber-intelligence.',
    takeaway:
      'Baudrillard’s simulacra realized through Hong Kong wire-fu, cyberpunk terminal aesthetics, and neural VR.',
  },
  {
    id: 'inception',
    title: 'Inception',
    year: 2010,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    genres: ['Action', 'Sci-Fi', 'Heist'],
    ottPlatforms: ['Netflix', 'Prime Video'],
    rating: '9.1',
    runtime: '148 min',
    synopsis:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    takeaway:
      'Architectural subconscious recursion modeled like hierarchical multi-threaded execution environments.',
  },
  {
    id: 'ghost-in-the-shell',
    title: 'Ghost in the Shell',
    year: 1995,
    director: 'Mamoru Oshii',
    cast: ['Atsuko Tanaka', 'Akio Ōtsuka', 'Iemasa Kayumi'],
    genres: ['Anime', 'Cyberpunk', 'Philosophy'],
    ottPlatforms: ['Prime Video', 'Crunchyroll'],
    rating: '9.1',
    runtime: '83 min',
    synopsis:
      'A cyborg public-security agent hunts a mysterious hacker known as the Puppet Master who hacks into human cyberbrains.',
    takeaway:
      'The definitive treatise on post-biological identity, cybernetic bodies, and informational self-organization.',
  },
];

export const CURATED_TV_SHOWS: TVShowItem[] = [
  {
    id: 'severance',
    title: 'Severance',
    years: '2022 – Present',
    creator: 'Dan Erickson (Dir: Ben Stiller)',
    cast: ['Adam Scott', 'Patricia Arquette', 'John Turturro', 'Christopher Walken'],
    genres: ['Sci-Fi', 'Psychological Thriller', 'Corporate Dystopia'],
    ottPlatforms: ['Apple TV+'],
    rating: '9.4',
    seasons: 'Season 1 & 2',
    synopsis:
      'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.',
    takeaway:
      'A horrifyingly hilarious, chillingly precise architectural dissection of corporate alienation and partitioned consciousness.',
  },
  {
    id: 'dark',
    title: 'Dark',
    years: '2017 – 2020',
    creator: 'Baran bo Odar & Jantje Friese',
    cast: ['Louis Hofmann', 'Oliver Masucci', 'Karoline Eichhorn', 'Maja Schöne'],
    genres: ['Sci-Fi', 'Mystery', 'Time Travel'],
    ottPlatforms: ['Netflix'],
    rating: '9.5',
    seasons: '3 Seasons (Complete)',
    synopsis:
      'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families across three generations.',
    takeaway:
      'The most mathematically airtight, deterministic bootstrap-paradox narrative ever committed to television.',
  },
  {
    id: 'mr-robot',
    title: 'Mr. Robot',
    years: '2015 – 2019',
    creator: 'Sam Esmail',
    cast: ['Rami Malek', 'Christian Slater', 'Carly Chaikin', 'Martin Wallström'],
    genres: ['Cyber-Thriller', 'Drama', 'Psychology'],
    ottPlatforms: ['Prime Video'],
    rating: '9.3',
    seasons: '4 Seasons (Complete)',
    synopsis:
      'Elliot, a brilliant but highly unstable cybersecurity engineer and vigilante hacker, becomes a key figure in a complex game of global chaos when he and his shadowy allies try to take down the corrupt corporation his company is paid to protect.',
    takeaway:
      'The only series in television history with 100% technically accurate Kali Linux terminal payloads, kernel exploits, and psychological dissidence.',
  },
  {
    id: 'chernobyl',
    title: 'Chernobyl',
    years: '2019',
    creator: 'Craig Mazin (Dir: Johan Renck)',
    cast: ['Jared Harris', 'Stellan Skarsgård', 'Emily Watson', 'Paul Ritter'],
    genres: ['History', 'Drama', 'Disaster'],
    ottPlatforms: ['JioCinema', 'Max'],
    rating: '9.6',
    seasons: 'Miniseries (5 Episodes)',
    synopsis:
      'In April 1986, an explosion at the Chernobyl nuclear power plant in the Union of Soviet Socialist Republics becomes one of the world’s worst man-made catastrophes.',
    takeaway:
      'An uncompromising monument to the cost of systemic institutional lies and the thermodynamics of nuclear fission failure.',
  },
  {
    id: 'succession',
    title: 'Succession',
    years: '2018 – 2023',
    creator: 'Jesse Armstrong',
    cast: ['Brian Cox', 'Jeremy Strong', 'Sarah Snook', 'Kieran Culkin', 'Matthew Macfadyen'],
    genres: ['Drama', 'Corporate Satire'],
    ottPlatforms: ['JioCinema', 'Max'],
    rating: '9.4',
    seasons: '4 Seasons (Complete)',
    synopsis:
      'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their aging father steps down from the company.',
    takeaway:
      'Shakespearean dynastic cruelty captured through hyper-realistic corporate M&A maneuvering and Nicholas Britell’s piano score.',
  },
  {
    id: 'true-detective-s1',
    title: 'True Detective: Season 1',
    years: '2014',
    creator: 'Nic Pizzolatto (Dir: Cary Joji Fukunaga)',
    cast: ['Matthew McConaughey', 'Woody Harrelson', 'Michelle Monaghan'],
    genres: ['Crime', 'Mystery', 'Southern Gothic', 'Philosophy'],
    ottPlatforms: ['JioCinema', 'Max'],
    rating: '9.5',
    seasons: 'Season 1',
    synopsis:
      'Seasonal anthology series in which police investigations unearth the personal and professional secrets of those involved, both within and outside the law.',
    takeaway:
      'Rust Cohle’s antinatalist cosmic pessimism blended with Cary Fukunaga’s legendary 6-minute single-take tracking shot.',
  },
  {
    id: 'silicon-valley',
    title: 'Silicon Valley',
    years: '2014 – 2019',
    creator: 'Mike Judge, John Altschuler, Dave Krinsky',
    cast: ['Thomas Middleditch', 'Martin Starr', 'Kumail Nanjiani', 'Zach Woods'],
    genres: ['Comedy', 'Tech', 'Startup'],
    ottPlatforms: ['JioCinema', 'Max'],
    rating: '8.8',
    seasons: '6 Seasons (Complete)',
    synopsis:
      'Follows the struggle of Richard Hendricks, a Silicon Valley engineer trying to build his company, Pied Piper, around a revolutionary lossless data compression algorithm.',
    takeaway:
      'The most painfully accurate satire of venture capital term sheets, middle-out compression algorithms, and server room panic ever filmed.',
  },
  {
    id: 'mindhunter',
    title: 'Mindhunter',
    years: '2017 – 2019',
    creator: 'Joe Penhall (Dir: David Fincher)',
    cast: ['Jonathan Groff', 'Holt McCallany', 'Anna Torv', 'Cameron Britton'],
    genres: ['Crime', 'Psychological Thriller', 'History'],
    ottPlatforms: ['Netflix'],
    rating: '9.0',
    seasons: '2 Seasons',
    synopsis:
      'In the late 1970s two FBI agents expand criminal science by delving into the psychology of murder and awkwardly getting too close to all-too-real monsters.',
    takeaway:
      'Fincher’s clinical obsession with analytical methodology, forensic tape recordings, and the inception of criminal behavioral profiling.',
  },
];
