import { ROLES } from '../config/constants';

const mockDecks = [
  {
    id: 'd1',
    title: 'Biology - Cells',
    description: 'Learn about cell structure and function',
    tags: ['biology', 'cells', 'science'],
    category: 'science',
    difficulty: 'beginner',
    ownerRole: ROLES.Teacher,
    ownerId: 1,
    views: 120,
    likes: 45,
    completionRate: 0.62,
    createdAt: '2024-01-15T10:00:00Z',
    lastStudied: '2024-01-20T14:30:00Z',
    premium: false,
    stats: { views: 120, likes: 45, completionRate: 0.62 },
    cards: [
      { 
        id: 'c1', 
        question: 'What is the powerhouse of the cell?', 
        answer: 'Mitochondria',
        explanation: 'Mitochondria produce ATP, the energy currency of cells',
        questionImage: '/public/q1.png', 
        answerImage: '/public/a1.png' 
      },
      { 
        id: 'c2', 
        question: 'What controls what enters and exits the cell?', 
        answer: 'Cell membrane',
        explanation: 'The cell membrane is selectively permeable',
        questionImage: '/public/q2.png', 
        answerImage: '/public/a2.png' 
      },
      { 
        id: 'c3', 
        question: 'Where is DNA stored in the cell?', 
        answer: 'Nucleus',
        explanation: 'The nucleus contains the cell\'s genetic material',
        questionImage: '/public/q3.png', 
        answerImage: '/public/a3.png' 
      },
      { 
        id: 'c4', 
        question: 'What is the jelly-like substance inside the cell?', 
        answer: 'Cytoplasm',
        explanation: 'Cytoplasm is the gel-like substance that fills the cell',
        questionImage: null, 
        answerImage: null 
      },
      { 
        id: 'c5', 
        question: 'What organelle is responsible for protein synthesis?', 
        answer: 'Ribosomes',
        explanation: 'Ribosomes are the protein factories of the cell',
        questionImage: null, 
        answerImage: null 
      },
    ],
  },
  {
    id: 'd2',
    title: 'JavaScript Basics',
    description: 'Fundamental JavaScript concepts for beginners',
    tags: ['javascript', 'programming', 'web'],
    category: 'programming',
    difficulty: 'beginner',
    ownerRole: ROLES.Teacher,
    ownerId: 1,
    views: 89,
    likes: 32,
    completionRate: 0.45,
    createdAt: '2024-01-10T09:00:00Z',
    lastStudied: '2024-01-18T16:20:00Z',
    premium: false,
    stats: { views: 89, likes: 32, completionRate: 0.45 },
    cards: [
      { 
        id: 'c6', 
        question: 'How do you declare a variable in JavaScript?', 
        answer: 'var, let, or const',
        explanation: 'var is function-scoped, let and const are block-scoped'
      },
      { 
        id: 'c7', 
        question: 'What is the difference between == and ===?', 
        answer: '== compares values, === compares values and types',
        explanation: '=== is stricter and generally preferred'
      },
      { 
        id: 'c8', 
        question: 'What is a closure in JavaScript?', 
        answer: 'A function that has access to variables in its outer scope',
        explanation: 'Closures allow functions to access variables from their lexical environment'
      },
    ],
  },
  {
    id: 'd3',
    title: 'React Hooks Mastery',
    description: 'Master React hooks: useState, useEffect, useContext and more',
    tags: ['react', 'hooks', 'frontend'],
    category: 'programming',
    difficulty: 'intermediate',
    ownerRole: ROLES.Teacher,
    ownerId: 2,
    views: 156,
    likes: 78,
    completionRate: 0.73,
    createdAt: '2024-01-20T11:30:00Z',
    lastStudied: '2024-01-22T10:15:00Z',
    premium: true,
    stats: { views: 156, likes: 78, completionRate: 0.73 },
    cards: [
      { 
        id: 'c9', 
        question: 'What does useState return?', 
        answer: 'An array with the current state and a setter function',
        explanation: 'useState returns [state, setState] where setState updates the state'
      },
      { 
        id: 'c10', 
        question: 'When does useEffect run?', 
        answer: 'After every render by default',
        explanation: 'useEffect runs after the DOM has been updated'
      },
      { 
        id: 'c11', 
        question: 'How do you prevent infinite loops in useEffect?', 
        answer: 'Use dependency array or cleanup function',
        explanation: 'Dependency array controls when effect runs, cleanup prevents memory leaks'
      },
      { 
        id: 'c12', 
        question: 'What is useContext used for?', 
        answer: 'Accessing context values without prop drilling',
        explanation: 'useContext allows components to consume context values directly'
      },
      { 
        id: 'c13', 
        question: 'What does useMemo do?', 
        answer: 'Memoizes expensive calculations',
        explanation: 'useMemo returns memoized value that only changes when dependencies change'
      },
    ],
  },
  {
    id: 'd4',
    title: 'Vietnamese History',
    description: 'Important events and figures in Vietnamese history',
    tags: ['history', 'vietnam', 'culture'],
    category: 'history',
    difficulty: 'intermediate',
    ownerRole: ROLES.Teacher,
    ownerId: 3,
    views: 203,
    likes: 95,
    completionRate: 0.68,
    createdAt: '2024-01-12T14:00:00Z',
    lastStudied: '2024-01-21T09:45:00Z',
    premium: false,
    stats: { views: 203, likes: 95, completionRate: 0.68 },
    cards: [
      { 
        id: 'c14', 
        question: 'Who was the first emperor of Vietnam?', 
        answer: 'Lý Thái Tổ',
        explanation: 'Lý Thái Tổ founded the Lý dynasty in 1009'
      },
      { 
        id: 'c15', 
        question: 'When did Vietnam gain independence from France?', 
        answer: '1954',
        explanation: 'The Geneva Accords ended French colonial rule in 1954'
      },
      { 
        id: 'c16', 
        question: 'What was the capital of Vietnam during the Nguyễn dynasty?', 
        answer: 'Huế',
        explanation: 'Huế served as the imperial capital from 1802 to 1945'
      },
      { 
        id: 'c17', 
        question: 'Who led the August Revolution in 1945?', 
        answer: 'Hồ Chí Minh',
        explanation: 'Hồ Chí Minh led the revolution that established the Democratic Republic of Vietnam'
      },
    ],
  },
  {
    id: 'd5',
    title: 'Advanced Mathematics',
    description: 'Calculus, linear algebra, and advanced mathematical concepts',
    tags: ['mathematics', 'calculus', 'algebra'],
    category: 'mathematics',
    difficulty: 'advanced',
    ownerRole: ROLES.Teacher,
    ownerId: 4,
    views: 78,
    likes: 42,
    completionRate: 0.35,
    createdAt: '2024-01-08T16:20:00Z',
    lastStudied: '2024-01-19T13:10:00Z',
    premium: true,
    stats: { views: 78, likes: 42, completionRate: 0.35 },
    cards: [
      { 
        id: 'c18', 
        question: 'What is the derivative of x²?', 
        answer: '2x',
        explanation: 'Using the power rule: d/dx(x²) = 2x'
      },
      { 
        id: 'c19', 
        question: 'What is the integral of 1/x?', 
        answer: 'ln|x| + C',
        explanation: 'The integral of 1/x is the natural logarithm of the absolute value of x'
      },
      { 
        id: 'c20', 
        question: 'What is the determinant of a 2x2 matrix [[a,b],[c,d]]?', 
        answer: 'ad - bc',
        explanation: 'For matrix [[a,b],[c,d]], det = ad - bc'
      },
    ],
  },
  {
    id: 'd6',
    title: 'English Vocabulary',
    description: 'Essential English words for daily communication',
    tags: ['english', 'vocabulary', 'language'],
    category: 'language',
    difficulty: 'beginner',
    ownerRole: ROLES.Teacher,
    ownerId: 5,
    views: 234,
    likes: 112,
    completionRate: 0.82,
    createdAt: '2024-01-05T08:30:00Z',
    lastStudied: '2024-01-22T15:30:00Z',
    premium: false,
    stats: { views: 234, likes: 112, completionRate: 0.82 },
    cards: [
      { 
        id: 'c21', 
        question: 'What does "serendipity" mean?', 
        answer: 'The occurrence of happy or beneficial events by chance',
        explanation: 'Serendipity is finding something good without looking for it'
      },
      { 
        id: 'c22', 
        question: 'What is the opposite of "ubiquitous"?', 
        answer: 'Rare or scarce',
        explanation: 'Ubiquitous means present everywhere, so the opposite is rare'
      },
      { 
        id: 'c23', 
        question: 'What does "ephemeral" mean?', 
        answer: 'Lasting for a very short time',
        explanation: 'Ephemeral describes something that is temporary or fleeting'
      },
      { 
        id: 'c24', 
        question: 'What is a "paradigm"?', 
        answer: 'A typical example or pattern of something',
        explanation: 'A paradigm is a model or example that serves as a pattern'
      },
      { 
        id: 'c25', 
        question: 'What does "meticulous" mean?', 
        answer: 'Showing great attention to detail',
        explanation: 'Meticulous means being very careful and precise'
      },
    ],
  },
  {
    id: 'd7',
    title: 'Chemistry Fundamentals',
    description: 'Basic chemistry concepts and periodic table',
    tags: ['chemistry', 'science', 'elements'],
    category: 'science',
    difficulty: 'intermediate',
    ownerRole: ROLES.Teacher,
    ownerId: 6,
    views: 145,
    likes: 67,
    completionRate: 0.58,
    createdAt: '2024-01-18T12:15:00Z',
    lastStudied: '2024-01-20T11:20:00Z',
    premium: false,
    stats: { views: 145, likes: 67, completionRate: 0.58 },
    cards: [
      { 
        id: 'c26', 
        question: 'What is the chemical symbol for gold?', 
        answer: 'Au',
        explanation: 'Au comes from the Latin word "aurum" meaning gold'
      },
      { 
        id: 'c27', 
        question: 'What is the pH of pure water?', 
        answer: '7',
        explanation: 'Pure water has a neutral pH of 7 at 25°C'
      },
      { 
        id: 'c28', 
        question: 'What is Avogadro\'s number?', 
        answer: '6.022 × 10²³',
        explanation: 'Avogadro\'s number is the number of particles in one mole'
      },
      { 
        id: 'c29', 
        question: 'What is the most abundant element in the Earth\'s atmosphere?', 
        answer: 'Nitrogen (N₂)',
        explanation: 'Nitrogen makes up about 78% of the Earth\'s atmosphere'
      },
    ],
  },
  {
    id: 'd8',
    title: 'Data Structures & Algorithms',
    description: 'Essential data structures and algorithms for coding interviews',
    tags: ['algorithms', 'data-structures', 'programming'],
    category: 'programming',
    difficulty: 'advanced',
    ownerRole: ROLES.Teacher,
    ownerId: 7,
    views: 189,
    likes: 89,
    completionRate: 0.41,
    createdAt: '2024-01-14T10:45:00Z',
    lastStudied: '2024-01-21T14:15:00Z',
    premium: true,
    stats: { views: 189, likes: 89, completionRate: 0.41 },
    cards: [
      { 
        id: 'c30', 
        question: 'What is the time complexity of binary search?', 
        answer: 'O(log n)',
        explanation: 'Binary search eliminates half the search space in each iteration'
      },
      { 
        id: 'c31', 
        question: 'What is the difference between a stack and a queue?', 
        answer: 'Stack is LIFO, Queue is FIFO',
        explanation: 'Stack (Last In First Out) vs Queue (First In First Out)'
      },
      { 
        id: 'c32', 
        question: 'What is a hash table?', 
        answer: 'A data structure that maps keys to values using hash functions',
        explanation: 'Hash tables provide average O(1) lookup time'
      },
      { 
        id: 'c33', 
        question: 'What is the time complexity of quicksort?', 
        answer: 'O(n log n) average, O(n²) worst case',
        explanation: 'Quicksort has good average performance but poor worst-case performance'
      },
    ],
  },
];

export const flashcardService = {
  getFeatured: async () => {
    return [...mockDecks].sort((a, b) => b.views + b.likes + b.completionRate - (a.views + a.likes + a.completionRate));
  },
  listDecks: async () => {
    return mockDecks;
  },
  getDeck: async (id) => {
    const found = mockDecks.find(d => d.id === id);
    if (!found) throw new Error('Deck not found');
    return found;
  },
  createDeck: async (deck) => {
    const id = `d${Date.now()}`;
    const newDeck = { ...deck, id, cards: [], views: 0, likes: 0, completionRate: 0 };
    mockDecks.push(newDeck);
    return newDeck;
  },
  updateDeck: async (id, payload) => {
    const idx = mockDecks.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Deck not found');
    mockDecks[idx] = { ...mockDecks[idx], ...payload };
    return mockDecks[idx];
  },
  deleteDeck: async (id) => {
    const idx = mockDecks.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Deck not found');
    const [removed] = mockDecks.splice(idx, 1);
    return removed;
  },
  addFlashcard: async (deckId, card) => {
    const deck = mockDecks.find(d => d.id === deckId);
    if (!deck) throw new Error('Deck not found');
    if (deck.cards.length >= 200) throw new Error('Maximum 200 flashcards per deck');
    const newCard = { ...card, id: `c${Date.now()}` };
    deck.cards.push(newCard);
    return newCard;
  },
  updateFlashcard: async (deckId, cardId, payload) => {
    const deck = mockDecks.find(d => d.id === deckId);
    if (!deck) throw new Error('Deck not found');
    const idx = deck.cards.findIndex(c => c.id === cardId);
    if (idx === -1) throw new Error('Card not found');
    deck.cards[idx] = { ...deck.cards[idx], ...payload };
    return deck.cards[idx];
  },
  deleteFlashcard: async (deckId, cardId) => {
    const deck = mockDecks.find(d => d.id === deckId);
    if (!deck) throw new Error('Deck not found');
    const idx = deck.cards.findIndex(c => c.id === cardId);
    if (idx === -1) throw new Error('Card not found');
    const [removed] = deck.cards.splice(idx, 1);
    return removed;
  },
  search: async (keyword) => {
    const key = (keyword || '').toLowerCase();
    return mockDecks.filter(d => d.title.toLowerCase().includes(key) || d.tags.some(t => t.toLowerCase().includes(key)));
  },
  markCardAsKnown: async (cardId) => {
    // mock: no-op, could persist to localStorage per user
    return { cardId, status: 'known' };
  },
  markCardForReview: async (cardId) => {
    // mock: no-op, could persist to localStorage per user
    return { cardId, status: 'review' };
  },
};
