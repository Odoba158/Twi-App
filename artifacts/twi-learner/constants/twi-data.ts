export interface TwiLetter {
  id: string;
  letter: string;
  lowerCase: string;
  twiName: string;
  exampleWord: string;
  meaning: string;
  color: string;
}

export interface TwiNumber {
  number: number;
  twi: string;
}

export interface TwiWord {
  id: string;
  word: string;
  letters: string[];
  meaning: string;
  category: string;
}

export interface TwiPhrase {
  id: string;
  twi: string;
  english: string;
  category: string;
}

const LETTER_COLORS = [
  '#E74C3C', '#E67E22', '#F39C12', '#27AE60', '#16A085',
  '#2980B9', '#8E44AD', '#D35400', '#C0392B', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#FF5722', '#607D8B',
  '#795548', '#FF9800', '#4CAF50', '#00BCD4', '#673AB7',
  '#F44336', '#2C3E50', '#1B7A4B',
];

export const TWI_ALPHABET: TwiLetter[] = [
  { id: 'A',   letter: 'A',  lowerCase: 'a',  twiName: '[a]',     exampleWord: 'Adeɛ',    meaning: 'Thing',   color: LETTER_COLORS[0]  },
  { id: 'B',   letter: 'B',  lowerCase: 'b',  twiName: '[bə]',    exampleWord: 'Barima',  meaning: 'Man',     color: LETTER_COLORS[1]  },
  { id: 'D',   letter: 'D',  lowerCase: 'd',  twiName: '[də]',    exampleWord: 'Dua',     meaning: 'Tree',    color: LETTER_COLORS[2]  },
  { id: 'E',   letter: 'E',  lowerCase: 'e',  twiName: '[e]',     exampleWord: 'Efie',    meaning: 'House',   color: LETTER_COLORS[3]  },
  { id: 'EPS', letter: 'Ɛ',  lowerCase: 'ɛ',  twiName: '[ɛ]',     exampleWord: 'Ɛnam',    meaning: 'Meat',    color: LETTER_COLORS[4]  },
  { id: 'F',   letter: 'F',  lowerCase: 'f',  twiName: '[fə]',    exampleWord: 'Fie',     meaning: 'House',   color: LETTER_COLORS[5]  },
  { id: 'G',   letter: 'G',  lowerCase: 'g',  twiName: '[gə]',    exampleWord: 'Gyata',   meaning: 'Lion',    color: LETTER_COLORS[6]  },
  { id: 'H',   letter: 'H',  lowerCase: 'h',  twiName: '[hə]',    exampleWord: 'Hann',    meaning: 'Light',   color: LETTER_COLORS[7]  },
  { id: 'I',   letter: 'I',  lowerCase: 'i',  twiName: '[ɪ]',     exampleWord: 'Adiɛ',    meaning: 'Something', color: LETTER_COLORS[8]  },
  { id: 'K',   letter: 'K',  lowerCase: 'k',  twiName: '[kə]',    exampleWord: 'Kotoku',  meaning: 'Bag',     color: LETTER_COLORS[9]  },
  { id: 'L',   letter: 'L',  lowerCase: 'l',  twiName: '[l:]',    exampleWord: 'Lɛtɛ',    meaning: 'Letter',  color: LETTER_COLORS[10] },
  { id: 'M',   letter: 'M',  lowerCase: 'm',  twiName: '[m:]',    exampleWord: 'Maame',   meaning: 'Mother',  color: LETTER_COLORS[11] },
  { id: 'N',   letter: 'N',  lowerCase: 'n',  twiName: '[n:]',    exampleWord: 'Nipa',    meaning: 'Person',  color: LETTER_COLORS[12] },
  { id: 'O',   letter: 'O',  lowerCase: 'o',  twiName: '[o]',     exampleWord: 'Obi',     meaning: 'Someone', color: LETTER_COLORS[13] },
  { id: 'OPS', letter: 'Ɔ',  lowerCase: 'ɔ',  twiName: '[ɔ]',     exampleWord: 'Ɔdɔ',     meaning: 'Love',    color: LETTER_COLORS[14] },
  { id: 'P',   letter: 'P',  lowerCase: 'p',  twiName: '[pə]',    exampleWord: 'Papa',    meaning: 'Father',  color: LETTER_COLORS[15] },
  { id: 'R',   letter: 'R',  lowerCase: 'r',  twiName: '[rə]',    exampleWord: 'Rekɔ',    meaning: 'Going',   color: LETTER_COLORS[16] },
  { id: 'S',   letter: 'S',  lowerCase: 's',  twiName: '[s:]',    exampleWord: 'Sunsum',  meaning: 'Spirit',  color: LETTER_COLORS[17] },
  { id: 'T',   letter: 'T',  lowerCase: 't',  twiName: '[tə]',    exampleWord: 'Tuo',     meaning: 'Gun',     color: LETTER_COLORS[18] },
  { id: 'U',   letter: 'U',  lowerCase: 'u',  twiName: '[u]',     exampleWord: 'Fufuo',   meaning: 'Fufu',    color: LETTER_COLORS[19] },
  { id: 'W',   letter: 'W',  lowerCase: 'w',  twiName: '[wə]',    exampleWord: 'Wura',    meaning: 'Owner',   color: LETTER_COLORS[20] },
  { id: 'Y',   letter: 'Y',  lowerCase: 'y',  twiName: '[jə]',    exampleWord: 'Nyam',    meaning: 'Grind',   color: LETTER_COLORS[21] },
];

const UNITS = ['', 'Baako', 'Mmienu', 'Mmiɛnsa', 'Nnan', 'Enum', 'Nsia', 'Nson', 'Nwɔtwe', 'Nkron'];
const TENS = ['', 'Du', 'Aduonu', 'Aduasa', 'Aduanan', 'Aduonum', 'Aduosia', 'Aduoson', 'Aduowɔtwe', 'Aduokron'];

function buildTwiWord(n: number): string {
  if (n === 100) return 'Ɔha';
  if (n < 10) return UNITS[n];
  if (n === 10) return 'Du';
  
  const getSuffix = (u: number) => {
    if (u === 4) return 'nan';
    if (u === 5) return 'num';
    return UNITS[u].toLowerCase();
  };

  if (n < 20) return 'Du' + getSuffix(n - 10);
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  if (unit === 0) return TENS[ten];
  return TENS[ten] + ' ' + getSuffix(unit);
}

export const TWI_NUMBERS: TwiNumber[] = Array.from({ length: 100 }, (_, i) => ({
  number: i + 1,
  twi: buildTwiWord(i + 1),
}));

export const TWI_WORDS: TwiWord[] = [
  { id: 'me',     word: 'Me',     letters: ['M','e'],                  meaning: 'I / Me',   category: 'People'  },
  { id: 'wo',     word: 'Wo',     letters: ['W','o'],                  meaning: 'You',      category: 'People'  },
  { id: 'no',     word: 'No',     letters: ['N','o'],                  meaning: 'It / That',category: 'Objects' },
  { id: 'ko',     word: 'Kɔ',     letters: ['K','ɔ'],                  meaning: 'Go',       category: 'Body'    },
  { id: 'ba',     word: 'Ba',     letters: ['B','a'],                  meaning: 'Come',     category: 'Body'    },
  { id: 'di',     word: 'Di',     letters: ['D','i'],                  meaning: 'Eat',      category: 'Food'    },
  { id: 'da',     word: 'Da',     letters: ['D','a'],                  meaning: 'Sleep',    category: 'Body'    },
  { id: 'ka',     word: 'Ka',     letters: ['K','a'],                  meaning: 'Say / Speak', category: 'People' },
  { id: 'fie',    word: 'Fie',    letters: ['F','i','e'],              meaning: 'House',    category: 'Places'  },
  { id: 'nsa',    word: 'Nsa',    letters: ['N','s','a'],              meaning: 'Hand',     category: 'Body'    },
  { id: 'dua',    word: 'Dua',    letters: ['D','u','a'],              meaning: 'Tree',     category: 'Nature'  },
  { id: 'ewi',    word: 'Ewi',    letters: ['E','w','i'],              meaning: 'Theft',    category: 'Actions' },
  { id: 'obi',    word: 'Obi',    letters: ['O','b','i'],              meaning: 'Someone',  category: 'People'  },
  { id: 'obaa',   word: 'Obaa',   letters: ['O','b','a','a'],          meaning: 'Woman',    category: 'People'  },
  { id: 'abaa',   word: 'Abaa',   letters: ['A','b','a','a'],          meaning: 'Stick',    category: 'Objects' },
  { id: 'akoa',   word: 'Akoa',   letters: ['A','k','o','a'],          meaning: 'Servant',  category: 'People'  },
  { id: 'nipa',   word: 'Nipa',   letters: ['N','i','p','a'],          meaning: 'Person',   category: 'People'  },
  { id: 'adee',   word: 'Adeɛ',   letters: ['A','d','e','ɛ'],          meaning: 'Thing',    category: 'Objects' },
  { id: 'aboa',   word: 'Aboa',   letters: ['A','b','o','a'],          meaning: 'Animal',   category: 'Animals' },
  { id: 'kwan',   word: 'Kwan',   letters: ['K','w','a','n'],          meaning: 'Road',     category: 'Places'  },
  { id: 'akoko',  word: 'Akokɔ',  letters: ['A','k','o','k','ɔ'],      meaning: 'Chicken',  category: 'Animals' },
  { id: 'ahoma',  word: 'Ahoma',  letters: ['A','h','o','m','a'],      meaning: 'Rope',     category: 'Objects' },
  { id: 'aduan',  word: 'Aduan',  letters: ['A','d','u','a','n'],      meaning: 'Food',     category: 'Food'    },
  { id: 'barima', word: 'Barima', letters: ['B','a','r','i','m','a'],  meaning: 'Man',      category: 'People'  },
  { id: 'onipa',  word: 'Onipa',  letters: ['O','n','i','p','a'],      meaning: 'Human',    category: 'People'  },
  { id: 'sunsum', word: 'Sunsum', letters: ['S','u','n','s','u','m'],  meaning: 'Spirit',   category: 'Body'    },
  { id: 'gyata',  word: 'Gyata',  letters: ['G','y','a','t','a'],      meaning: 'Lion',     category: 'Animals' },
  { id: 'pataku', word: 'Pataku', letters: ['P','a','t','a','k','u'],  meaning: 'Wolf',     category: 'Animals' },
  { id: 'wura',   word: 'Wura',   letters: ['W','u','r','a'],          meaning: 'Owner',    category: 'People'  },
  { id: 'odo',    word: 'Ɔdɔ',    letters: ['Ɔ','d','ɔ'],             meaning: 'Love',     category: 'Body'    },
  { id: 'abofra', word: 'Abofra', letters: ['A','b','o','f','r','a'],  meaning: 'Child',    category: 'People'  },
  { id: 'kotoku', word: 'Kotoku', letters: ['K','o','t','o','k','u'],  meaning: 'Bag',      category: 'Objects' },
  { id: 'nam',    word: 'Nam',    letters: ['N','a','m'],              meaning: 'Fish',     category: 'Food'    },
  { id: 'aduane', word: 'Aduane', letters: ['A','d','u','a','n','e'],  meaning: 'Cooked food', category: 'Food' },
  { id: 'kookoo', word: 'Kookoo', letters: ['K','o','o','k','o','o'],  meaning: 'Cocoa',    category: 'Food'    },
  { id: 'nsuo',   word: 'Nsuo',   letters: ['N','s','u','o'],          meaning: 'Water',    category: 'Nature'  },
  { id: 'ewiem',  word: 'Ewiem',  letters: ['E','w','i','e','m'],      meaning: 'Sky',      category: 'Nature'  },
  { id: 'asase',  word: 'Asaase',  letters: ['A','s','a','a','s','e'],  meaning: 'Earth',    category: 'Nature'  },
];

export const TWI_PHRASES: TwiPhrase[] = [
  { id: 'p1', twi: 'Maakye', english: 'Good morning', category: 'Greetings' },
  { id: 'p2', twi: 'Maaha', english: 'Good afternoon', category: 'Greetings' },
  { id: 'p3', twi: 'Maadwo', english: 'Good evening', category: 'Greetings' },
  { id: 'p4', twi: 'Ete sɛn?', english: 'How are you?', category: 'Greetings' },
  { id: 'p5', twi: 'Me ho yɛ', english: 'I am fine', category: 'Greetings' },
  { id: 'p6', twi: 'Medaase', english: 'Thank you', category: 'Courtesy' },
  { id: 'p7', twi: 'Kafra', english: 'Sorry', category: 'Courtesy' },
  { id: 'p8', twi: 'Mepaakyɛw', english: 'Please', category: 'Courtesy' },
  { id: 'p9', twi: 'Aane', english: 'Yes', category: 'General' },
  { id: 'p10', twi: 'Daabi', english: 'No', category: 'General' },
  { id: 'p11', twi: 'Bra ha', english: 'Come here', category: 'Commands' },
  { id: 'p12', twi: 'Kɔ', english: 'Go', category: 'Commands' },
  { id: 'p13', twi: 'Tena ase', english: 'Sit down', category: 'Commands' },
  { id: 'p14', twi: 'Sɔre', english: 'Stand up', category: 'Commands' },
  { id: 'p15', twi: 'Nante yie', english: 'Safe journey / Goodbye', category: 'Greetings' },
];
