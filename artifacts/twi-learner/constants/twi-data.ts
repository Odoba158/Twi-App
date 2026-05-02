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

const LETTER_COLORS = [
  '#E74C3C', '#E67E22', '#F39C12', '#27AE60', '#16A085',
  '#2980B9', '#8E44AD', '#D35400', '#C0392B', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#FF5722', '#607D8B',
  '#795548', '#FF9800', '#4CAF50', '#00BCD4', '#673AB7',
  '#F44336', '#2C3E50', '#1B7A4B',
];

export const TWI_ALPHABET: TwiLetter[] = [
  { id: 'A',   letter: 'A',  lowerCase: 'a',  twiName: 'A',     exampleWord: 'Adeɛ',    meaning: 'Thing',   color: LETTER_COLORS[0]  },
  { id: 'B',   letter: 'B',  lowerCase: 'b',  twiName: 'Bi',    exampleWord: 'Barima',  meaning: 'Man',     color: LETTER_COLORS[1]  },
  { id: 'D',   letter: 'D',  lowerCase: 'd',  twiName: 'Di',    exampleWord: 'Dua',     meaning: 'Tree',    color: LETTER_COLORS[2]  },
  { id: 'E',   letter: 'E',  lowerCase: 'e',  twiName: 'E',     exampleWord: 'Ewi',     meaning: 'Rat',     color: LETTER_COLORS[3]  },
  { id: 'EPS', letter: 'Ɛ',  lowerCase: 'ɛ',  twiName: 'Ɛ',     exampleWord: 'Ɛnam',    meaning: 'Meat',    color: LETTER_COLORS[4]  },
  { id: 'F',   letter: 'F',  lowerCase: 'f',  twiName: 'Ɛfi',   exampleWord: 'Fie',     meaning: 'House',   color: LETTER_COLORS[5]  },
  { id: 'G',   letter: 'G',  lowerCase: 'g',  twiName: 'Gi',    exampleWord: 'Gyata',   meaning: 'Lion',    color: LETTER_COLORS[6]  },
  { id: 'H',   letter: 'H',  lowerCase: 'h',  twiName: 'Eha',   exampleWord: 'Hyɛn',    meaning: 'Ship',    color: LETTER_COLORS[7]  },
  { id: 'I',   letter: 'I',  lowerCase: 'i',  twiName: 'I',     exampleWord: 'Ita',     meaning: 'Scar',    color: LETTER_COLORS[8]  },
  { id: 'K',   letter: 'K',  lowerCase: 'k',  twiName: 'Ka',    exampleWord: 'Kotoku',  meaning: 'Bag',     color: LETTER_COLORS[9]  },
  { id: 'L',   letter: 'L',  lowerCase: 'l',  twiName: 'Ɛli',   exampleWord: 'Lɛtɛ',    meaning: 'Plate',   color: LETTER_COLORS[10] },
  { id: 'M',   letter: 'M',  lowerCase: 'm',  twiName: 'Ɛmu',   exampleWord: 'Mame',    meaning: 'Mother',  color: LETTER_COLORS[11] },
  { id: 'N',   letter: 'N',  lowerCase: 'n',  twiName: 'Ɛnu',   exampleWord: 'Nipa',    meaning: 'Person',  color: LETTER_COLORS[12] },
  { id: 'O',   letter: 'O',  lowerCase: 'o',  twiName: 'O',     exampleWord: 'Obi',     meaning: 'Someone', color: LETTER_COLORS[13] },
  { id: 'OPS', letter: 'Ɔ',  lowerCase: 'ɔ',  twiName: 'Ɔ',     exampleWord: 'Ɔdɔ',     meaning: 'Love',    color: LETTER_COLORS[14] },
  { id: 'P',   letter: 'P',  lowerCase: 'p',  twiName: 'Pi',    exampleWord: 'Pata',    meaning: 'Forgive', color: LETTER_COLORS[15] },
  { id: 'R',   letter: 'R',  lowerCase: 'r',  twiName: 'Ar',    exampleWord: 'Rofua',   meaning: 'Soap',    color: LETTER_COLORS[16] },
  { id: 'S',   letter: 'S',  lowerCase: 's',  twiName: 'Ɛsu',   exampleWord: 'Sunsum',  meaning: 'Spirit',  color: LETTER_COLORS[17] },
  { id: 'T',   letter: 'T',  lowerCase: 't',  twiName: 'Ti',    exampleWord: 'Tuo',     meaning: 'Gun',     color: LETTER_COLORS[18] },
  { id: 'U',   letter: 'U',  lowerCase: 'u',  twiName: 'U',     exampleWord: 'Ufa',     meaning: 'Flour',   color: LETTER_COLORS[19] },
  { id: 'W',   letter: 'W',  lowerCase: 'w',  twiName: 'Wi',    exampleWord: 'Wura',    meaning: 'Owner',   color: LETTER_COLORS[20] },
  { id: 'Y',   letter: 'Y',  lowerCase: 'y',  twiName: 'Yi',    exampleWord: 'Yam',     meaning: 'Yam',     color: LETTER_COLORS[21] },
  { id: 'Z',   letter: 'Z',  lowerCase: 'z',  twiName: 'Zi',    exampleWord: 'Zibi',    meaning: 'Zebra',   color: LETTER_COLORS[22] },
];

const UNITS = ['', 'Baako', 'Mmienu', 'Mmiensa', 'Anan', 'Enum', 'Nsia', 'Nson', 'Nwotwe', 'Nkron'];
const TENS = ['', 'Du', 'Aduonu', 'Aduasa', 'Aduanan', 'Aduonum', 'Aduosia', 'Aduoson', 'Aduowotwe', 'Aduokron'];

function buildTwiWord(n: number): string {
  if (n === 100) return 'Ɔha';
  if (n < 10) return UNITS[n];
  if (n === 10) return 'Du';
  if (n < 20) return 'Du' + UNITS[n - 10].toLowerCase();
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  if (unit === 0) return TENS[ten];
  return TENS[ten] + ' ' + UNITS[unit].toLowerCase();
}

export const TWI_NUMBERS: TwiNumber[] = Array.from({ length: 100 }, (_, i) => ({
  number: i + 1,
  twi: buildTwiWord(i + 1),
}));

export const TWI_WORDS: TwiWord[] = [
  { id: 'fie',   word: 'Fie',   letters: ['F', 'i', 'e'],            meaning: 'House',   category: 'Places'  },
  { id: 'nsa',   word: 'Nsa',   letters: ['N', 's', 'a'],            meaning: 'Hand',    category: 'Body'    },
  { id: 'dua',   word: 'Dua',   letters: ['D', 'u', 'a'],            meaning: 'Tree',    category: 'Nature'  },
  { id: 'ewi',   word: 'Ewi',   letters: ['E', 'w', 'i'],            meaning: 'Rat',     category: 'Animals' },
  { id: 'obi',   word: 'Obi',   letters: ['O', 'b', 'i'],            meaning: 'Someone', category: 'People'  },
  { id: 'obaa',  word: 'Obaa',  letters: ['O', 'b', 'a', 'a'],       meaning: 'Woman',   category: 'People'  },
  { id: 'abaa',  word: 'Abaa',  letters: ['A', 'b', 'a', 'a'],       meaning: 'Stick',   category: 'Objects' },
  { id: 'akoa',  word: 'Akoa',  letters: ['A', 'k', 'o', 'a'],       meaning: 'Servant', category: 'People'  },
  { id: 'nipa',  word: 'Nipa',  letters: ['N', 'i', 'p', 'a'],       meaning: 'Person',  category: 'People'  },
  { id: 'adee',  word: 'Adeɛ',  letters: ['A', 'd', 'e', 'ɛ'],       meaning: 'Thing',   category: 'Objects' },
  { id: 'aboa',  word: 'Aboa',  letters: ['A', 'b', 'o', 'a'],       meaning: 'Animal',  category: 'Animals' },
  { id: 'kwan',  word: 'Kwan',  letters: ['K', 'w', 'a', 'n'],       meaning: 'Road',    category: 'Places'  },
  { id: 'akoko', word: 'Akoko', letters: ['A', 'k', 'o', 'k', 'o'], meaning: 'Chicken', category: 'Animals' },
  { id: 'ahoma', word: 'Ahoma', letters: ['A', 'h', 'o', 'm', 'a'], meaning: 'Rope',    category: 'Objects' },
  { id: 'aduan', word: 'Aduan', letters: ['A', 'd', 'u', 'a', 'n'], meaning: 'Food',    category: 'Food'    },
];
