import React, { useEffect, useRef, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Heart, Coins, Gem, Zap, Shield, Play, RotateCcw, HelpCircle } from 'lucide-react';

// ─── FALLBACK QUESTIONS (used when backend API is unreachable e.g. on Vercel
//     without VITE_API_URL configured) ────────────────────────────────────────
const FALLBACK_QUESTIONS = [
  {
    question: 'Which ancient Indian stepwell is located in Patan, Gujarat?',
    options: ['Rani ki Vav', 'Chand Baori', 'Hampi Vav', 'Adalaj Vav'],
    answer: 'Rani ki Vav',
    category: 'heritage_sites',
  },
  {
    question: 'The Gupta Empire is often called the "Golden Age" of India. Which field did NOT flourish during this period?',
    options: ['Gunpowder and firearms', 'Mathematics and astronomy', 'Literature and poetry', 'Sculpture and painting'],
    answer: 'Gunpowder and firearms',
    category: 'history',
  },
  {
    question: 'Which Chola king commissioned the famous Brihadisvara Temple at Thanjavur?',
    options: ['Rajaraja I', 'Rajendra I', 'Kulottunga I', 'Vikramaditya II'],
    answer: 'Rajaraja I',
    category: 'architecture',
  },
  {
    question: 'What does the Sanskrit term "Dharma" broadly mean?',
    options: ['Cosmic order and moral duty', 'Devotion to a deity', 'The cycle of rebirth', 'The concept of non-violence'],
    answer: 'Cosmic order and moral duty',
    category: 'philosophy',
  },
  {
    question: 'The Mauryan Emperor Ashoka converted to which religion after the Kalinga War?',
    options: ['Buddhism', 'Jainism', 'Hinduism', 'Zoroastrianism'],
    answer: 'Buddhism',
    category: 'history',
  },
  {
    question: 'Nalanda University, one of the world\'s first universities, was located in which modern-day Indian state?',
    options: ['Bihar', 'Uttar Pradesh', 'Bengal', 'Odisha'],
    answer: 'Bihar',
    category: 'education',
  },
  {
    question: 'The concept of "Zero" as a number was formally developed by which Indian mathematician?',
    options: ['Brahmagupta', 'Aryabhata', 'Bhaskara II', 'Pingala'],
    answer: 'Brahmagupta',
    category: 'science',
  },
  {
    question: 'Bharatanatyam, one of India\'s oldest classical dance forms, originates from which state?',
    options: ['Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Karnataka'],
    answer: 'Tamil Nadu',
    category: 'arts',
  },
  {
    question: 'Which ancient text is considered the world\'s oldest surviving epic poem?',
    options: ['Mahabharata', 'Ramayana', 'Rigveda', 'Arthashastra'],
    answer: 'Mahabharata',
    category: 'literature',
  },
  {
    question: 'The "Silk Road" connected ancient India to which region at its western end?',
    options: ['Mediterranean and Rome', 'Egypt and Carthage', 'Persia only', 'Arabia and Ethiopia'],
    answer: 'Mediterranean and Rome',
    category: 'trade',
  },
  // ── 20 NEW QUESTIONS ────────────────────────────────────────────────────────
  {
    question: 'Which Indian astronomer first proposed that the Earth rotates on its own axis?',
    options: ['Aryabhata', 'Brahmagupta', 'Varahamihira', 'Bhaskara I'],
    answer: 'Aryabhata',
    category: 'science',
  },
  {
    question: 'The Ajanta Caves in Maharashtra are famous for their paintings depicting the life of whom?',
    options: ['Lord Buddha', 'Lord Shiva', 'Lord Vishnu', 'Emperor Ashoka'],
    answer: 'Lord Buddha',
    category: 'heritage_sites',
  },
  {
    question: 'Which ancient Indian text authored by Chanakya (Kautilya) deals with statecraft and political strategy?',
    options: ['Arthashastra', 'Manusmriti', 'Nitisara', 'Panchatantra'],
    answer: 'Arthashastra',
    category: 'literature',
  },
  {
    question: 'The Indus Valley Civilization\'s largest known city was:',
    options: ['Mohenjo-daro', 'Harappa', 'Dholavira', 'Lothal'],
    answer: 'Mohenjo-daro',
    category: 'history',
  },
  {
    question: 'Which classical language of India is considered the mother of many South Asian languages?',
    options: ['Sanskrit', 'Pali', 'Prakrit', 'Tamil'],
    answer: 'Sanskrit',
    category: 'language',
  },
  {
    question: 'The Kathakali dance form originates from which Indian state?',
    options: ['Kerala', 'Tamil Nadu', 'Odisha', 'Manipur'],
    answer: 'Kerala',
    category: 'arts',
  },
  {
    question: 'Who wrote the ancient Indian treatise on medicine called "Charaka Samhita"?',
    options: ['Charaka', 'Sushruta', 'Dhanvantari', 'Vagbhata'],
    answer: 'Charaka',
    category: 'science',
  },
  {
    question: 'The famous Iron Pillar of Delhi, which has not rusted for over 1600 years, was erected during which empire?',
    options: ['Gupta Empire', 'Mauryan Empire', 'Kushan Empire', 'Pallava Kingdom'],
    answer: 'Gupta Empire',
    category: 'science',
  },
  {
    question: 'Which Mughal emperor commissioned the building of the Taj Mahal?',
    options: ['Shah Jahan', 'Akbar', 'Jahangir', 'Aurangzeb'],
    answer: 'Shah Jahan',
    category: 'architecture',
  },
  {
    question: 'The sacred text "Bhagavad Gita" is a part of which larger epic?',
    options: ['Mahabharata', 'Ramayana', 'Puranas', 'Upanishads'],
    answer: 'Mahabharata',
    category: 'literature',
  },
  {
    question: 'Which ancient Indian port city was a major hub for maritime trade with Rome and Southeast Asia?',
    options: ['Lothal', 'Sopara', 'Tamralipta', 'Bharuch'],
    answer: 'Lothal',
    category: 'trade',
  },
  {
    question: 'The Hampi ruins, a UNESCO World Heritage Site, was the capital of which empire?',
    options: ['Vijayanagara Empire', 'Chola Empire', 'Rashtrakuta Empire', 'Pallava Kingdom'],
    answer: 'Vijayanagara Empire',
    category: 'heritage_sites',
  },
  {
    question: 'Which Indian philosopher founded the Advaita Vedanta school of philosophy?',
    options: ['Adi Shankaracharya', 'Ramanuja', 'Madhvacharya', 'Nimbarka'],
    answer: 'Adi Shankaracharya',
    category: 'philosophy',
  },
  {
    question: 'The ancient game of chess (Chaturanga) is believed to have originated in which country?',
    options: ['India', 'Persia', 'China', 'Arabia'],
    answer: 'India',
    category: 'culture',
  },
  {
    question: 'Which river is considered the most sacred in Hinduism?',
    options: ['Ganga', 'Yamuna', 'Saraswati', 'Godavari'],
    answer: 'Ganga',
    category: 'culture',
  },
  {
    question: 'The Ellora Caves contain temples carved for three different religions. Which three?',
    options: ['Hinduism, Buddhism, Jainism', 'Hinduism, Buddhism, Islam', 'Buddhism, Jainism, Sikhism', 'Hinduism, Jainism, Zoroastrianism'],
    answer: 'Hinduism, Buddhism, Jainism',
    category: 'heritage_sites',
  },
  {
    question: 'Panini, the ancient Sanskrit grammarian, wrote which foundational grammar text?',
    options: ['Ashtadhyayi', 'Nirukta', 'Vakyapadiya', 'Mahabhashya'],
    answer: 'Ashtadhyayi',
    category: 'language',
  },
  {
    question: 'The "Panchatantra", a collection of ancient Indian fables, was written for what purpose?',
    options: ['To teach princes wisdom and statecraft', 'To record Vedic hymns', 'To document trade routes', 'To catalog medical remedies'],
    answer: 'To teach princes wisdom and statecraft',
    category: 'literature',
  },
  {
    question: 'The ancient surgical text "Sushruta Samhita" describes which pioneering medical procedure?',
    options: ['Rhinoplasty (nose reconstruction)', 'Open heart surgery', 'Bone transplantation', 'Eye cataract removal'],
    answer: 'Rhinoplasty (nose reconstruction)',
    category: 'science',
  },
  {
    question: 'Which dynasty built the Shore Temple at Mahabalipuram, a UNESCO World Heritage Site?',
    options: ['Pallava', 'Chola', 'Pandya', 'Chalukya'],
    answer: 'Pallava',
    category: 'architecture',
  },
];

// Fisher-Yates shuffle for truly random question order each game session
const _shuffled = (() => {
  const arr = [...FALLBACK_QUESTIONS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
})();
let _fallbackIndex = 0;

// Cycles through all 30 questions in shuffled order before repeating
const getRandomFallbackQuestion = () => {
  if (_fallbackIndex >= _shuffled.length) {
    _fallbackIndex = 0;
    // Re-shuffle on wraparound so repetition order changes
    for (let i = _shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [_shuffled[i], _shuffled[j]] = [_shuffled[j], _shuffled[i]];
    }
  }
  return _shuffled[_fallbackIndex++];
};

// ─── MAP DATA ────────────────────────────────────────────────────────────────
// 1=wall  0=coin  2=memory-fragment  3=diamond  9=empty-path
const MAPS = {
  stepwell: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 9, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 9, 9, 9, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 9, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [9, 0, 0, 0, 0, 0, 0, 1, 0, 0, 9, 9, 9, 0, 0, 1, 0, 0, 0, 0, 0, 0, 9],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 9, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 9, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  fort: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 9, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 9, 9, 9, 9, 9, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 9, 1, 1, 1, 9, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 1, 0, 0, 9, 1, 9, 1, 9, 0, 0, 1, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 0, 9, 1, 9, 1, 9, 0, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 0, 9, 9, 9, 9, 9, 0, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 3, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  mandala: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 9, 9, 9, 9, 9, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 9, 1, 1, 1, 9, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 2, 1, 0, 1, 9, 1, 9, 1, 9, 1, 0, 1, 2, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 9, 1, 9, 1, 9, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 9, 9, 9, 9, 9, 9, 9, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 9, 9, 9, 9, 9, 9, 9, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 9, 1, 9, 1, 9, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 2, 1, 0, 1, 9, 1, 9, 1, 9, 1, 0, 1, 2, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 9, 1, 1, 1, 9, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 9, 9, 9, 9, 9, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
};

// ─── GHOST SPAWN POSITIONS ───────────────────────────────────────────────────
// All spawn coordinates verified to be '9' (open path) tiles in their respective maps.
const GHOST_SPAWNS = {
  stepwell: [
    { x: 10, y: 5, color: '#ec4899', baseSpeed: 0.035 },
    { x: 11, y: 5, color: '#a855f7', baseSpeed: 0.045 },
    { x: 12, y: 5, color: '#10b981', baseSpeed: 0.040 },
  ],
  fort: [
    { x: 9, y: 7, color: '#ec4899', baseSpeed: 0.035 },
    { x: 11, y: 7, color: '#a855f7', baseSpeed: 0.045 },
    { x: 13, y: 7, color: '#10b981', baseSpeed: 0.040 },
  ],
  mandala: [
    { x: 9, y: 8, color: '#ec4899', baseSpeed: 0.035 },
    { x: 11, y: 8, color: '#a855f7', baseSpeed: 0.045 },
    { x: 13, y: 8, color: '#10b981', baseSpeed: 0.040 },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const countTileType = (mapName, type) => {
  let n = 0;
  (MAPS[mapName] || []).forEach(row => row.forEach(v => { if (v === type) n++; }));
  return n;
};

const getSkinProperties = (skinId) => {
  switch (skinId) {
    case 'mauryan_warrior':
      return { color: '#ef4444', innerColor: '#991b1b', name: 'Mauryan Warrior', glow: 'rgba(239,68,68,0.6)' };
    case 'gupta_scholar':
      return { color: '#3b82f6', innerColor: '#1e40af', name: 'Gupta Scholar', glow: 'rgba(59,130,246,0.6)' };
    case 'chola_voyager':
      return { color: '#06b6d4', innerColor: '#0891b2', name: 'Chola Voyager', glow: 'rgba(6,182,212,0.6)' };
    case 'gold_sutradhar':
      return { color: '#fbbf24', innerColor: '#d97706', name: 'Golden Sutradhar', glow: 'rgba(251,191,36,0.9)' };
    default:
      return { color: '#f97316', innerColor: '#c2410c', name: 'Sutradhar Classic', glow: 'rgba(249,115,22,0.5)' };
  }
};

// Hex colour → "r,g,b" for rgba() usage
const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}` : '255,255,255';
};

// ─── LEVEL MAP THEME PROGRESSION ─────────────────────────────────────────────
const LEVEL_THEMES = {
  1: 'stepwell',
  2: 'fort',
  3: 'mandala'
};

const THEME_LEVELS = {
  stepwell: 1,
  fort: 2,
  mandala: 3
};

// ─── THEME CONFIGS ───────────────────────────────────────────────────────────
const THEME = {
  stepwell: { bg: '#020a18', wallFill: '#0c1d3e', wallBorder: 'rgba(212,175,55,0.5)', wallAccent: 'rgba(212,175,55,0.2)' },
  fort: { bg: '#0a0206', wallFill: '#2e0e10', wallBorder: 'rgba(160,80,40,0.55)', wallAccent: 'rgba(160,80,40,0.22)' },
  mandala: { bg: '#060412', wallFill: '#11103e', wallBorder: 'rgba(212,175,55,0.85)', wallAccent: 'rgba(212,175,55,0.32)' },
};

// ─── CANVAS DRAWING PRIMITIVES ────────────────────────────────────────────────

function drawWall(ctx, cx, cy, TS, theme) {
  const t = THEME[theme] || THEME.stepwell;
  ctx.fillStyle = t.wallFill;
  ctx.fillRect(cx, cy, TS, TS);

  ctx.lineWidth = 1;
  if (theme === 'stepwell') {
    // Outer gold border + two horizontal groove lines (stepped-well stone layers)
    ctx.strokeStyle = t.wallBorder;
    ctx.strokeRect(cx + 1, cy + 1, TS - 2, TS - 2);
    ctx.strokeStyle = t.wallAccent;
    ctx.beginPath();
    ctx.moveTo(cx + 3, cy + TS * 0.35); ctx.lineTo(cx + TS - 3, cy + TS * 0.35);
    ctx.moveTo(cx + 3, cy + TS * 0.65); ctx.lineTo(cx + TS - 3, cy + TS * 0.65);
    ctx.stroke();
  } else if (theme === 'fort') {
    // Sandstone block + diagonal grain (Rajput fort sandstone texture)
    ctx.strokeStyle = t.wallBorder;
    ctx.strokeRect(cx + 1, cy + 1, TS - 2, TS - 2);
    ctx.strokeStyle = t.wallAccent;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + TS, cy + TS);
    ctx.moveTo(cx + TS * 0.5, cy); ctx.lineTo(cx + TS, cy + TS * 0.5);
    ctx.moveTo(cx, cy + TS * 0.5); ctx.lineTo(cx + TS * 0.5, cy + TS);
    ctx.stroke();
  } else if (theme === 'mandala') {
    // Bright gold border + inner lotus/diamond motif (temple wall)
    ctx.strokeStyle = t.wallBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx + 1, cy + 1, TS - 2, TS - 2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + TS / 2, cy + 3);
    ctx.lineTo(cx + TS - 3, cy + TS / 2);
    ctx.lineTo(cx + TS / 2, cy + TS - 3);
    ctx.lineTo(cx + 3, cy + TS / 2);
    ctx.closePath();
    ctx.strokeStyle = t.wallAccent;
    ctx.stroke();
  }
}

function drawCoin(ctx, cx, cy, TS, frame) {
  const pulse = 0.72 + 0.28 * Math.sin(frame * 0.13);
  const r = 4 * pulse;
  ctx.beginPath();
  ctx.arc(cx + TS / 2, cy + TS / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = '#d4af37';
  ctx.shadowColor = 'rgba(212,175,55,0.85)';
  ctx.shadowBlur = 7 * pulse;
  ctx.fill();
  ctx.shadowBlur = 0;
  // Shine highlight
  ctx.beginPath();
  ctx.arc(cx + TS / 2 - 1, cy + TS / 2 - 1, r * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,253,200,0.65)';
  ctx.fill();
}

function drawFragment(ctx, cx, cy, TS, frame) {
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.07);
  const floatY = Math.sin(frame * 0.055) * 1.5;

  // Parchment scroll body
  ctx.fillStyle = `rgba(222,213,184,${pulse})`;
  ctx.fillRect(cx + 9, cy + 5 + floatY, 14, 22);

  // Top & bottom caps (rolled ends of scroll)
  ctx.fillStyle = `rgba(175,135,72,${pulse})`;
  ctx.fillRect(cx + 8, cy + 4 + floatY, 16, 4);
  ctx.fillRect(cx + 8, cy + 24 + floatY, 16, 4);

  // Heritage gold ribbon band
  ctx.fillStyle = `rgba(185,145,30,${pulse})`;
  ctx.fillRect(cx + 9, cy + 14 + floatY, 14, 3);

  // Glow outline
  ctx.shadowColor = 'rgba(222,213,160,0.7)';
  ctx.shadowBlur = 7 * pulse;
  ctx.strokeStyle = `rgba(212,175,55,${pulse * 0.7})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx + 9, cy + 5 + floatY, 14, 22);
  ctx.shadowBlur = 0;
}

function drawDiamond(ctx, cx, cy, TS, frame) {
  const pulse = 0.82 + 0.18 * Math.sin(frame * 0.09);
  const sparkleOn = Math.sin(frame * 0.22) > 0.65;

  ctx.beginPath();
  ctx.moveTo(cx + TS / 2, cy + 6);
  ctx.lineTo(cx + TS - 6, cy + TS / 2);
  ctx.lineTo(cx + TS / 2, cy + TS - 6);
  ctx.lineTo(cx + 6, cy + TS / 2);
  ctx.closePath();
  ctx.fillStyle = `rgba(34,211,238,${pulse})`;
  ctx.shadowColor = 'rgba(34,211,238,0.95)';
  ctx.shadowBlur = 14 * pulse;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Inner facet highlight
  ctx.beginPath();
  ctx.moveTo(cx + TS / 2, cy + 10);
  ctx.lineTo(cx + TS - 10, cy + TS / 2);
  ctx.lineTo(cx + TS / 2, cy + TS - 10);
  ctx.lineTo(cx + 10, cy + TS / 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();

  // Four-point sparkle
  if (sparkleOn) {
    const sx = cx + TS / 2, sy = cy + TS / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 5); ctx.lineTo(sx, sy + 5);
    ctx.moveTo(sx - 5, sy); ctx.lineTo(sx + 5, sy);
    ctx.stroke();
  }
}

// ─── PLAYER CHARACTER: Sutradhar (Royal Thread-Holder / Raj-Nata) ─────────────
function drawSutradhar(ctx, px, py, style, hasShield, speedBoost, frame) {
  // ── Shield aura (chakra-ring) ──────────────────────────────────────────────
  if (hasShield) {
    const ap = 0.55 + 0.45 * Math.sin(frame * 0.09);
    ctx.beginPath();
    ctx.arc(px, py, 21, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(34,211,238,${ap})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Six energy runes orbiting
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + frame * 0.045;
      ctx.fillStyle = `rgba(34,211,238,${ap * 0.75})`;
      ctx.beginPath();
      ctx.arc(px + Math.cos(a) * 18, py + Math.sin(a) * 18, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Speed flames (agni trail) ──────────────────────────────────────────────
  if (speedBoost) {
    [22, 18, 14].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251,191,36,${0.12 * (3 - i)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  // ── Body / Torso (King's Robe & Ornaments) ──────────────────────────────────
  // Robe Base
  ctx.beginPath();
  ctx.arc(px, py + 3, 11, 0, Math.PI * 2);
  ctx.fillStyle = style.innerColor; // Rich primary color for royal robe
  ctx.shadowColor = style.glow;
  ctx.shadowBlur = speedBoost ? 24 : 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Gold Sash / Angavastra (diagonal gold band clipped to robe)
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py + 3, 11, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#fbbf24'; // Majestic gold sash
  ctx.beginPath();
  ctx.moveTo(px - 11, py - 1);
  ctx.lineTo(px + 4, py - 1);
  ctx.lineTo(px + 11, py + 8);
  ctx.lineTo(px - 4, py + 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Royal Gold Necklace (Haar)
  ctx.beginPath();
  ctx.arc(px, py + 2, 8, 0, Math.PI);
  ctx.strokeStyle = '#ffd700'; // Bright Gold
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Necklace Pendant (Ruby Gem)
  ctx.beginPath();
  ctx.arc(px, py + 10, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444'; // Red ruby pendant
  ctx.fill();

  // ── Face ───────────────────────────────────────────────────────────────────
  // Head circle (Skin tone)
  ctx.beginPath();
  ctx.arc(px, py - 2, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd9b3'; // Indian royal skin tone
  ctx.fill();

  // Tilak — sacred forehead mark (vertical red line + dot)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(px - 1, py - 9, 2, 5);
  ctx.beginPath();
  ctx.arc(px, py - 10.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (white)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(px - 3, py - 2, 2, 0, Math.PI * 2);
  ctx.arc(px + 3, py - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(px - 3, py - 2, 1, 0, Math.PI * 2);
  ctx.arc(px + 3, py - 2, 1, 0, Math.PI * 2);
  ctx.fill();

  // Royal Curved Mustache (Proud Maharaja style)
  ctx.strokeStyle = '#2d1b10';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Left mustache curl
  ctx.moveTo(px, py + 2);
  ctx.quadraticCurveTo(px - 3, py + 3, px - 6, py + 1);
  // Right mustache curl
  ctx.moveTo(px, py + 2);
  ctx.quadraticCurveTo(px + 3, py + 3, px + 6, py + 1);
  ctx.stroke();

  // Royal Crown (Mukut) - 5 Golden Spires
  // Crown base band
  ctx.fillStyle = '#d4af37'; // Antique Gold
  ctx.fillRect(px - 8, py - 11, 16, 3);
  ctx.strokeStyle = '#8a6d1c';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(px - 8, py - 11, 16, 3);

  // 5 Spires
  const spires = [
    { ox: -6, h: 5 },
    { ox: -3, h: 8 },
    { ox: 0, h: 11 }, // Central spire (highest)
    { ox: 3, h: 8 },
    { ox: 6, h: 5 }
  ];
  spires.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(px + s.ox, py - 11);
    ctx.lineTo(px + s.ox, py - 11 - s.h);
    ctx.lineTo(px + s.ox - 1.8, py - 11);
    ctx.closePath();
    ctx.fillStyle = '#ffd700'; // Bright Gold
    ctx.fill();

    // Spire tip jewels (Ruby in center, Emeralds on sides)
    ctx.beginPath();
    ctx.arc(px + s.ox, py - 11 - s.h, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = s.ox === 0 ? '#ef4444' : '#10b981';
    ctx.fill();
  });
}

// ─── GHOST TARGET SELECTOR ──────────────────────────────────────────────────
const getGhostTarget = (ghost, player, state) => {
  if (state.enragedTimer > 0) {
    return { x: player.x, y: player.y };
  }
  if (!ghost.active) {
    return null; // Dormant/patrolling wanders randomly
  }
  if (ghost.type === 'chaser') {
    return { x: player.x, y: player.y };
  } else if (ghost.type === 'interceptor') {
    const pDirX = Math.sign(player.targetX - player.x);
    const pDirY = Math.sign(player.targetY - player.y);
    return {
      x: player.x + pDirX * 2,
      y: player.y + pDirY * 2
    };
  } else if (ghost.type === 'ambusher') {
    const distToPlayer = Math.hypot(ghost.x - player.x, ghost.y - player.y);
    if (distToPlayer <= 6) {
      return { x: player.x, y: player.y };
    } else {
      // Targets bottom-right quadrant of the maze to defend/ambush
      return { x: 17, y: 13 };
    }
  }
  return { x: player.x, y: player.y };
};

// ─── GHOST CHARACTER: Vismarana (Spirit of Forgetfulness) ────────────────────
// Inspired by Indian shamanistic spirits — three eyes, wispy smoky tendrils,
// and a Sanskrit-swirl pattern on the body.
function drawVismarana(ctx, gx, gy, color, frame, idx, active, enraged) {
  const wave = Math.sin(frame * 0.09 + idx * 1.3);
  const hover = Math.sin(frame * 0.065 + idx * 0.9) * 2;
  const fy = gy + hover;

  const displayColor = enraged ? '#ef4444' : color;
  const rgb = hexToRgb(displayColor);

  ctx.save();

  if (!active && !enraged) {
    ctx.globalAlpha = 0.45; // Dormant spirits are translucent
  }

  // ── Smoky aura base ────────────────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = enraged ? 0.38 : 0.22;
  ctx.beginPath();
  ctx.arc(gx, fy, 17, 0, Math.PI * 2);
  ctx.fillStyle = displayColor;
  ctx.fill();
  ctx.restore();

  // ── Main spirit body (dome + animated wispy tendrils) ─────────────────────
  ctx.beginPath();
  ctx.arc(gx, fy - 3, 11, Math.PI, 0, false);
  // Wispy tendrils at the bottom — each wavers independently
  ctx.lineTo(gx + 11, fy + 9 + wave * 1.8);
  ctx.lineTo(gx + 7, fy + 6);
  ctx.lineTo(gx + 4, fy + 11 - wave * 1.2);
  ctx.lineTo(gx + 0, fy + 7);
  ctx.lineTo(gx - 4, fy + 11 + wave * 1.2);
  ctx.lineTo(gx - 7, fy + 6);
  ctx.lineTo(gx - 11, fy + 9 - wave * 1.8);
  ctx.closePath();
  ctx.fillStyle = displayColor;
  ctx.shadowColor = displayColor;
  ctx.shadowBlur = enraged ? 22 : 16;
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── Sanskrit swirl / Trishul outline (cultural mysticism) ─────────────────
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  // Circular swirl on dome
  ctx.beginPath();
  ctx.arc(gx, fy - 4, 5, 0, Math.PI * 1.6);
  ctx.stroke();
  // Small curved mark (like OM accent)
  ctx.beginPath();
  ctx.arc(gx + 5, fy - 2, 2.5, Math.PI * 1.2, Math.PI * 0.2, false);
  ctx.stroke();
  ctx.restore();

  // ── Third eye (Teeja Netra) — the defining mark ────────────────────────────
  let ep;
  if (enraged) {
    ep = 0.85 + 0.15 * Math.sin(frame * 0.2 + idx);
  } else if (!active) {
    ep = 0.2; // Dim sleepy eye
  } else {
    ep = 0.68 + 0.32 * Math.sin(frame * 0.14 + idx);
  }

  ctx.beginPath();
  if (!active && !enraged) {
    // Dormant: closed eye (horizontal line)
    ctx.moveTo(gx - 3, fy - 7);
    ctx.lineTo(gx + 3, fy - 7);
    ctx.strokeStyle = 'rgba(239,68,68,0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    ctx.ellipse(gx, fy - 7, enraged ? 4 : 3, enraged ? 3 : 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = enraged ? '#ff0000' : `rgba(239,68,68,${ep})`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = enraged ? 14 : 9 * ep;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Pupil
    ctx.beginPath();
    ctx.arc(gx, fy - 7, enraged ? 1.5 : 1, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  // ── Regular eyes (white with offset pupils for menace) ────────────────────
  ctx.fillStyle = enraged ? '#ffcccc' : '#fff';
  ctx.beginPath();
  ctx.arc(gx - 4, fy - 2, 2.2, 0, Math.PI * 2);
  ctx.arc(gx + 4, fy - 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Pupils slightly inward (shifty look)
  ctx.fillStyle = enraged ? '#500' : '#0a0012';
  ctx.beginPath();
  ctx.arc(gx - 3.5, fy - 2, 1.1, 0, Math.PI * 2);
  ctx.arc(gx + 4.5, fy - 2, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // ── Wispy smoke trail below tendrils ──────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const sx = gx + (i - 1) * 6;
    const sy = fy + 13 + i * 3 + wave * (i % 2 === 0 ? 1.2 : -1.2);
    const a = 0.28 - i * 0.08;
    ctx.beginPath();
    ctx.arc(sx, sy, 2 - i * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},${a})`;
    ctx.fill();
  }

  ctx.restore();
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const SutradharMaze = ({ onBackToDashboard }) => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const { user, refreshUser } = useContext(AuthContext);

  const [level, setLevel] = useState(1);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const mapTheme = LEVEL_THEMES[level] || 'stepwell';

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [diamondsEarned, setDiamondsEarned] = useState(0);
  const [fragmentsCollected, setFragmentsCollected] = useState(0);
  const [hearts, setHearts] = useState(user?.hearts || 5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  // Question overlay
  const [questionModal, setQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(15);
  const [questionFeedback, setQuestionFeedback] = useState(null);

  // Power-ups
  const [speedBoost, setSpeedBoost] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [ownedShields, setOwnedShields] = useState(0);
  const [ownedHints, setOwnedHints] = useState(0);
  const [disabledOptions, setDisabledOptions] = useState([]);

  // ── Refs to fix stale-closure bugs in animation loop & timeouts ─────────────
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const diamondsRef = useRef(0);
  const heartsRef = useRef(user?.hearts || 5);

  const questionTimerInterval = useRef(null);

  // ── Game state ref (mutable, shared with rAF loop) ────────────────────────
  const gameStateRef = useRef({
    player: { x: 1, y: 1, targetX: 1, targetY: 1, speed: 0.1 },
    ghosts: [],
    grid: [],
    invincibilityTimer: 0,
    activeKeys: {},
    frame: 0,
    particles: [],
    floatingTexts: [],
    comboCount: 1,
    comboTimer: 0,
    screenFlashTimer: 0,
    enragedTimer: 0,
    shieldTimer: 0,
    isPausedForQuestion: false,
  });

  // ── Pre-render static walls offscreen ──────────────────────────────────────
  const renderWallsOffscreen = () => {
    const state = gameStateRef.current;
    if (!state.grid || state.grid.length === 0) return;

    const TS = 32;
    const width = 736;
    const height = 544;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    for (let r = 0; r < state.grid.length; r++) {
      for (let c = 0; c < state.grid[r].length; c++) {
        if (state.grid[r][c] === 1) {
          drawWall(ctx, c * TS, r * TS, TS, mapTheme);
        }
      }
    }
  };

  // ── Spawn particle bursts ──────────────────────────────────────────────────
  const spawnParticles = (x, y, type) => {
    const state = gameStateRef.current;
    if (!state.particles) state.particles = [];

    let colors = [];
    if (type === 'coin') {
      colors = ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'];
    } else if (type === 'fragment') {
      colors = ['#de8f3b', '#deae78', '#fff8e7', '#cfa15e'];
    } else if (type === 'diamond') {
      colors = ['#22d3ee', '#06b6d4', '#e0f7fa', '#ffffff'];
    }

    const count = type === 'coin' ? 6 : (type === 'fragment' ? 12 : 18);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 1.5 + Math.random() * 2.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const decay = 0.02 + Math.random() * 0.03;

      state.particles.push({
        x,
        y,
        vx,
        vy,
        size,
        color,
        alpha: 1.0,
        decay,
      });
    }
  };

  // ── Spawn floating text popup ──────────────────────────────────────────────
  const spawnFloatingText = (x, y, text, color) => {
    const state = gameStateRef.current;
    if (!state.floatingTexts) state.floatingTexts = [];
    state.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: 0.6 + Math.random() * 0.4,
      decay: 0.015,
    });
  };

  // ── Initialize level layout ────────────────────────────────────────────────
  const initLevelData = () => {
    const currentTheme = LEVEL_THEMES[level] || 'stepwell';
    gameStateRef.current.grid = JSON.parse(JSON.stringify(MAPS[currentTheme]));
    gameStateRef.current.player = { x: 1, y: 1, targetX: 1, targetY: 1, speed: 0.1 };
    gameStateRef.current.frame = 0;
    gameStateRef.current.invincibilityTimer = 0;
    gameStateRef.current.activeKeys = {};
    gameStateRef.current.particles = [];
    gameStateRef.current.floatingTexts = [];
    gameStateRef.current.comboCount = 1;
    gameStateRef.current.comboTimer = 0;
    gameStateRef.current.screenFlashTimer = 0;
    gameStateRef.current.enragedTimer = 0;
    gameStateRef.current.shieldTimer = 0;
    gameStateRef.current.isPausedForQuestion = false;

    const ghostConfigs = [
      { name: 'Bhrama', color: '#ec4899', baseSpeed: 0.035, type: 'chaser' },
      { name: 'Moha', color: '#a855f7', baseSpeed: 0.045, type: 'interceptor' },
      { name: 'Mada', color: '#10b981', baseSpeed: 0.040, type: 'ambusher' },
    ];
    const levelGhostSpawns = GHOST_SPAWNS[currentTheme];
    gameStateRef.current.ghosts = ghostConfigs.map((cfg, idx) => {
      const spawn = levelGhostSpawns[idx] || levelGhostSpawns[0];
      // All Vismaranas are active and chase the hero by default
      let active = true;

      return {
        name: cfg.name,
        type: cfg.type,
        color: cfg.color,
        baseSpeed: cfg.baseSpeed,
        speed: cfg.baseSpeed,
        x: spawn.x,
        y: spawn.y,
        targetX: spawn.x,
        targetY: spawn.y,
        active,
      };
    });

    setIsLevelCleared(false);
    setQuestionLoading(false);
    setTimeout(() => {
      renderWallsOffscreen();
    }, 0);
  };

  // ── Reset whole game (Level 1 start) ───────────────────────────────────────
  const resetGameData = () => {
    setLevel(1);
    scoreRef.current = 0;
    coinsRef.current = 0;
    diamondsRef.current = 0;
    heartsRef.current = user?.hearts || 5;

    setScore(0);
    setCoinsEarned(0);
    setDiamondsEarned(0);
    setFragmentsCollected(0);
    setHearts(user?.hearts || 5);
    setIsGameOver(false);
    setIsGameWon(false);
    setIsLevelCleared(false);
    setSpeedBoost(false);
    setShieldActive(false);

    setTimeout(() => {
      initLevelData();
    }, 0);
  };

  // Run initializer when level changes
  useEffect(() => {
    initLevelData();
  }, [level]);

  // Sync starting hearts when user updates/mounts
  useEffect(() => {
    if (user) {
      setHearts(user.hearts);
      heartsRef.current = user.hearts;
    }
  }, [user]);

  // Fetch boosters status on mount and when isPlaying changes
  const fetchMazeInventory = async () => {
    try {
      const res = await axios.get(`${API_URL}/shop/status`);
      if (res.data.success) {
        const boosters = res.data.inventory.boosters || [];
        setOwnedShields(boosters.filter(b => b === 'shield').length);
        setOwnedHints(boosters.filter(b => b === 'hint').length);
      }
    } catch (err) {
      console.error('Error fetching inventory for maze setup:', err);
    }
  };

  useEffect(() => {
    fetchMazeInventory();
  }, [isPlaying]);

  // Trigger trivia question on every 2nd collected memory fragment
  useEffect(() => {
    if (fragmentsCollected > 0 && fragmentsCollected % 2 === 0) {
      triggerTriviaQuestion();
    }
  }, [fragmentsCollected]);

  // ── Keyboard handlers ─────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => {
      if (!isPlaying || questionModal || isGameOver || isGameWon) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      gameStateRef.current.activeKeys[e.key] = true;
    };
    const up = (e) => { delete gameStateRef.current.activeKeys[e.key]; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [isPlaying, questionModal, isGameOver, isGameWon]);

  // ── Main animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying && !questionModal && !isGameOver && !isGameWon && !isLevelCleared) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    const TS = 32;
    const playerStyle = getSkinProperties(user?.activeSkin || 'default');

    // ── UPDATE ──────────────────────────────────────────────────────────────
    const update = () => {
      const state = gameStateRef.current;
      const player = state.player;

      // Tick invincibility, enrage, screen flash, and combo timers down
      if (state.invincibilityTimer > 0) state.invincibilityTimer--;
      if (state.enragedTimer > 0) state.enragedTimer--;
      if (state.screenFlashTimer > 0) state.screenFlashTimer--;
      if (state.shieldTimer > 0) {
        state.shieldTimer--;
        if (state.shieldTimer === 0) {
          setShieldActive(false);
        }
      }
      if (state.comboTimer > 0) {
        state.comboTimer--;
        if (state.comboTimer === 0) {
          state.comboCount = 1;
        }
      }

      // ── Update Particles ───────────────────────────────────────────────
      if (state.particles) {
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            state.particles.splice(i, 1);
          }
        }
      }

      // ── Update Floating Texts ──────────────────────────────────────────
      if (state.floatingTexts) {
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const t = state.floatingTexts[i];
          t.y -= t.vy;
          t.alpha -= t.decay;
          if (t.alpha <= 0) {
            state.floatingTexts.splice(i, 1);
          }
        }
      }

      // ── Player movement (grid-cell target system) ──────────────────────
      const spd = speedBoost ? player.speed * 1.5 : player.speed;
      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;

      if (Math.abs(dx) <= spd && Math.abs(dy) <= spd) {
        player.x = player.targetX;
        player.y = player.targetY;

        let ndx = 0, ndy = 0;
        const keys = state.activeKeys;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) ndy = -1;
        else if (keys['ArrowDown'] || keys['s'] || keys['S']) ndy = 1;
        else if (keys['ArrowLeft'] || keys['a'] || keys['A']) ndx = -1;
        else if (keys['ArrowRight'] || keys['d'] || keys['D']) ndx = 1;

        if (ndx !== 0 || ndy !== 0) {
          const nx = player.x + ndx;
          const ny = player.y + ndy;
          if (state.grid[ny] && state.grid[ny][nx] !== 1) {
            player.targetX = nx;
            player.targetY = ny;
          }
        }
      } else {
        player.x += Math.sign(dx) * spd;
        player.y += Math.sign(dy) * spd;
      }

      // ── Tile collection ────────────────────────────────────────────────
      const gx = Math.round(player.x);
      const gy = Math.round(player.y);
      const cell = state.grid[gy]?.[gx] ?? 1;

      let baseAdd = 0;
      let coinAdd = 0;
      let diamondAdd = 0;
      let itemType = '';

      if (cell === 0) {
        state.grid[gy][gx] = 9;
        baseAdd = 10;
        coinAdd = 1;
        itemType = 'coin';
        spawnParticles(gx * TS + TS / 2, gy * TS + TS / 2, 'coin');
      } else if (cell === 2) {
        state.grid[gy][gx] = 9;
        baseAdd = 50;
        itemType = 'fragment';
        spawnParticles(gx * TS + TS / 2, gy * TS + TS / 2, 'fragment');
      } else if (cell === 3) {
        state.grid[gy][gx] = 9;
        baseAdd = 150;
        diamondAdd = 1;
        itemType = 'diamond';
        spawnParticles(gx * TS + TS / 2, gy * TS + TS / 2, 'diamond');
      }

      if (baseAdd > 0) {
        if (state.comboTimer > 0) {
          state.comboCount++;
        } else {
          state.comboCount = 1;
        }
        state.comboTimer = 90; // 1.5 seconds

        const totalAdd = baseAdd * state.comboCount;

        setScore(prev => { const n = prev + totalAdd; scoreRef.current = n; return n; });

        if (coinAdd > 0) {
          setCoinsEarned(prev => { const n = prev + coinAdd; coinsRef.current = n; return n; });
        }
        if (diamondAdd > 0) {
          setDiamondsEarned(prev => { const n = prev + diamondAdd; diamondsRef.current = n; return n; });
        }

        if (itemType === 'fragment') {
          setFragmentsCollected(prev => prev + 1);
        }

        let displayColor = '#ffffff';
        if (itemType === 'coin') displayColor = '#fbbf24';
        else if (itemType === 'fragment') displayColor = '#de8f3b';
        else if (itemType === 'diamond') displayColor = '#22d3ee';

        let floatingMsg = `+${totalAdd}`;
        if (state.comboCount > 1) {
          floatingMsg += ` (×${state.comboCount})`;
        }
        spawnFloatingText(gx * TS + TS / 2, gy * TS, floatingMsg, displayColor);
      }

      // ── Win condition: all fragments (2) and diamonds (3) collected ─────
      let objectivesLeft = false;
      outer: for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[r].length; c++) {
          if (state.grid[r][c] === 2 || state.grid[r][c] === 3) {
            objectivesLeft = true;
            break outer;
          }
        }
      }
      if (!objectivesLeft) {
        setIsPlaying(false);
        if (level < 3) {
          setIsLevelCleared(true);
        } else {
          setIsGameWon(true);
          handleGameOverSubmit(true);
        }
        return;
      }

      // ── Ghost (Vismarana) AI ───────────────────────────────────────────
      state.ghosts.forEach(ghost => {
        // Dynamically adjust speed based on active/dormant/enraged states
        if (state.enragedTimer > 0) {
          ghost.speed = ghost.baseSpeed * 1.5;
        } else if (!ghost.active) {
          ghost.speed = ghost.baseSpeed * 0.5;
        } else {
          ghost.speed = ghost.baseSpeed;
        }

        const gdx = ghost.targetX - ghost.x;
        const gdy = ghost.targetY - ghost.y;

        if (Math.abs(gdx) <= ghost.speed && Math.abs(gdy) <= ghost.speed) {
          ghost.x = ghost.targetX;
          ghost.y = ghost.targetY;

          const dirs = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
          ];
          const open = dirs.filter(d => {
            const nx = ghost.x + d.dx;
            const ny = ghost.y + d.dy;
            return state.grid[ny] && state.grid[ny][nx] !== 1;
          });

          if (open.length > 0) {
            const target = getGhostTarget(ghost, player, state);

            let best = open[0];
            if (target === null) {
              // Dormant wander: pick a random open direction, prefer not reversing
              let validDirs = open;
              if (open.length > 1 && ghost.lastDir) {
                validDirs = open.filter(d => !(d.dx === -ghost.lastDir.dx && d.dy === -ghost.lastDir.dy));
                if (validDirs.length === 0) validDirs = open;
              }
              best = validDirs[Math.floor(Math.random() * validDirs.length)];
            } else {
              let minD = Infinity;
              open.forEach(d => {
                const tx = ghost.x + d.dx, ty = ghost.y + d.dy;
                const dist = Math.pow(tx - target.x, 2) + Math.pow(ty - target.y, 2);
                if (dist < minD) { minD = dist; best = d; }
              });
              if (state.enragedTimer === 0 && Math.random() < 0.10) {
                best = open[Math.floor(Math.random() * open.length)];
              }
            }

            ghost.targetX = ghost.x + best.dx;
            ghost.targetY = ghost.y + best.dy;
            ghost.lastDir = best;
          }
        } else {
          ghost.x += Math.sign(gdx) * ghost.speed;
          ghost.y += Math.sign(gdy) * ghost.speed;
        }

        // ── Collision: ghost ↔ player ──────────────────────────────────
        const dist = Math.hypot(player.x - ghost.x, player.y - ghost.y);
        if (dist < 0.7 && state.invincibilityTimer === 0) {
          if (state.shieldTimer > 0) {
            // Unharmable timed shield: ignore collision
          } else if (shieldActive) {
            setShieldActive(false);
            state.invincibilityTimer = 60;
            spawnParticles(player.x * TS + TS / 2, player.y * TS + TS / 2, 'diamond');
            spawnFloatingText(player.x * TS + TS / 2, player.y * TS, 'SHIELD BROKEN', '#22d3ee');
          } else {
            state.screenFlashTimer = 15;
            setHearts(prev => {
              const nh = prev - 1;
              heartsRef.current = nh;
              if (nh <= 0) {
                setIsGameOver(true);
                handleGameOverSubmit(false);
              }
              return nh;
            });
            player.x = 1; player.y = 1;
            player.targetX = 1; player.targetY = 1;
            state.invincibilityTimer = 90;
          }
        }
      });
    };

    // ── DRAW ────────────────────────────────────────────────────────────────
    const draw = () => {
      const state = gameStateRef.current;
      const player = state.player;
      const frame = state.frame;

      // Theme-appropriate background
      ctx.fillStyle = THEME[mapTheme]?.bg || '#0a0405';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw optimized offscreen walls
      if (offscreenCanvasRef.current) {
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);
      }

      // Draw other dynamic tiles (coins, fragments, diamonds)
      for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[r].length; c++) {
          const tile = state.grid[r][c];
          const cx = c * TS;
          const cy = r * TS;
          if (tile === 0) drawCoin(ctx, cx, cy, TS, frame);
          else if (tile === 2) drawFragment(ctx, cx, cy, TS, frame);
          else if (tile === 3) drawDiamond(ctx, cx, cy, TS, frame);
        }
      }

      // Draw Particles
      if (state.particles) {
        state.particles.forEach(p => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        });
      }

      // Player (Sutradhar)
      const px = player.x * TS + TS / 2;
      const py = player.y * TS + TS / 2;
      if (state.invincibilityTimer === 0 || Math.floor(state.invincibilityTimer / 4) % 2 === 0) {
        drawSutradhar(ctx, px, py, playerStyle, shieldActive, speedBoost, frame);
      }

      // Ghosts (Vismarana)
      state.ghosts.forEach((ghost, idx) => {
        const gx = ghost.x * TS + TS / 2;
        const gy = ghost.y * TS + TS / 2;
        drawVismarana(ctx, gx, gy, ghost.color, frame, idx, ghost.active, state.enragedTimer > 0);
      });

      // Draw Floating Texts
      if (state.floatingTexts) {
        state.floatingTexts.forEach(t => {
          ctx.save();
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillStyle = t.color;
          ctx.globalAlpha = t.alpha;
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 4;
          ctx.fillText(t.text, t.x, t.y);
          ctx.restore();
        });
      }

      // Draw Combo multiplier on HUD
      if (state.comboCount > 1 && state.comboTimer > 0) {
        ctx.save();
        ctx.font = 'italic bold 13px Inter, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 5;
        ctx.fillText(`COMBO ×${state.comboCount}`, canvas.width - 20, canvas.height - 15);
        ctx.restore();
      }

      // Draw Rage announcement
      if (state.enragedTimer > 0) {
        ctx.save();
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#ff3333';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(`✦ VISMARANA ENRAGED! ✦`, canvas.width / 2, 28);
        ctx.restore();
      }

      // Screen Flash (Hit effect)
      if (state.screenFlashTimer > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${0.35 * (state.screenFlashTimer / 15)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const loop = () => {
      const state = gameStateRef.current;
      state.frame = (state.frame + 1) % 3600;

      // Only update positions/collisions if the game is active (not paused for question or level transition)
      if (isPlaying && !questionModal && !isGameOver && !isGameWon && !isLevelCleared && !state.isPausedForQuestion) {
        update();
      }
      draw();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, questionModal, isGameOver, isGameWon, isLevelCleared, speedBoost, shieldActive, mapTheme]);

  // ── Trivia question fetch ─────────────────────────────────────────────────
  const triggerTriviaQuestion = async () => {
    if (isGameOver || isGameWon) return;

    // Pause physics/movement updates synchronously in the Ref to prevent ghost collision race conditions
    gameStateRef.current.isPausedForQuestion = true;
    setIsPlaying(false);
    setQuestionLoading(true);
    setSelectedOption(null);
    setQuestionFeedback(null);
    setQuestionTimer(15);
    setDisabledOptions([]);

    // Helper that starts the question timer once a question is ready
    const startQuestion = (question) => {
      setCurrentQuestion(question);
      setQuestionLoading(false);
      setQuestionModal(true);

      clearInterval(questionTimerInterval.current);
      questionTimerInterval.current = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 1) {
            clearInterval(questionTimerInterval.current);
            handleTriviaAnswer(null, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // If VITE_API_URL is not configured (API_URL still points to localhost),
    // skip the network call entirely and use the 30 built-in fallback questions.
    // This ensures questions always appear instantly on Vercel even without the env var set.
    const isLocalhost = API_URL.includes('localhost') || API_URL.includes('127.0.0.1');
    if (isLocalhost) {
      console.info('VITE_API_URL not configured — using built-in fallback question.');
      startQuestion(getRandomFallbackQuestion());
      return;
    }

    try {
      // 1.5-second timeout: fast fallback if backend is slow/unreachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await axios.get(`${API_URL}/questions/random?count=1`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.data.success && res.data.questions.length > 0) {
        startQuestion(res.data.questions[0]);
      } else {
        // Backend returned but with no questions — use fallback
        console.warn('No questions from API, using fallback question.');
        startQuestion(getRandomFallbackQuestion());
      }
    } catch (err) {
      // Network error, timeout, or API unreachable
      console.warn('Question API unreachable — using fallback question. Error:', err.message);
      startQuestion(getRandomFallbackQuestion());
    }
  };

  // ── Trivia answer handler ─────────────────────────────────────────────────
  const handleTriviaAnswer = (option, isTimeout = false) => {
    clearInterval(questionTimerInterval.current);
    setSelectedOption(option);

    const isCorrect = !isTimeout && option === currentQuestion?.answer;

    if (isCorrect) {
      setQuestionFeedback('correct');
      setScore(prev => { const n = prev + 250; scoreRef.current = n; return n; });
      setCoinsEarned(prev => { const n = prev + 20; coinsRef.current = n; return n; });
      setSpeedBoost(true);
      setTimeout(() => setSpeedBoost(false), 5000);
      setShieldActive(true);
      gameStateRef.current.shieldTimer = 420; // 7 seconds at 60 FPS
    } else {
      setQuestionFeedback('wrong');
      gameStateRef.current.enragedTimer = 480; // 8 seconds of absolute fury
      gameStateRef.current.screenFlashTimer = 15; // Visual flash cue

      setHearts(prev => {
        const nh = prev - 1;
        heartsRef.current = nh;
        if (nh <= 0) {
          setIsGameOver(true);
          handleGameOverSubmit(false);
        }
        return nh;
      });
    }

    setTimeout(() => {
      setQuestionModal(false);
      setCurrentQuestion(null);
      gameStateRef.current.isPausedForQuestion = false; // Reset the pause Ref!
      if (heartsRef.current > 0 && !isGameOver && !isGameWon) {
        setIsPlaying(true);
      }
    }, 2500);
  };

  // ── Game-over backend sync ────────────────────────────────────────────────
  // BUG FIX: use refs for score/coins/diamonds — state may not have flushed yet
  const handleGameOverSubmit = async (won) => {
    setIsPlaying(false);
    try {
      await axios.post(`${API_URL}/user/game-over`, {
        score: scoreRef.current,
        coinsEarned: coinsRef.current,
        diamondsEarned: diamondsRef.current,
        didWin: won,
      });
      refreshUser();
    } catch (err) {
      console.error('Error saving game over statistics:', err);
    }
  };

  // ── Revive ────────────────────────────────────────────────────────────────
  const handleRevive = async () => {
    if ((user?.coins || 0) < 50) return;
    try {
      const res = await axios.post(`${API_URL}/user/revive`);
      if (res.data.success) {
        heartsRef.current = 5;
        setHearts(5);
        setIsGameOver(false);
        setIsPlaying(true);
        refreshUser();
      }
    } catch (err) {
      console.error('Error reviving user:', err);
    }
  };

  // ── Total fragments in selected map (for correct X/Y display) ────────────
  const totalFragments = countTileType(mapTheme, 2);

  // ── Theme display labels ──────────────────────────────────────────────────
  const themeLabels = { stepwell: 'Stepwell (Vav)', fort: 'Rajput Fort (Qila)', mandala: 'Temple Mandala' };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[80vh]">

      {/* ── 1. Pre-game Config Screen ─────────────────────────────────────── */}
      {!isPlaying && !isGameOver && !isGameWon && !questionModal && !questionLoading && (
        <div className="heritage-card p-8 rounded-lg max-w-lg w-full text-center border gold-border">
          <h2 className="text-3xl text-gold font-display mb-2">Sutradhar's Maze</h2>
          <p className="text-sm text-parchment-dark mb-6 leading-relaxed font-sans">
            Help the <strong className="text-gold">Sutradhar</strong> (storyteller) walk through the maze to collect glowing <strong className="text-amber-300">memory fragments</strong>. 
            Run away from the pink <span className="text-pink-500 font-bold">spirits of forgetfulness</span>—if they touch you, you will lose a heart! 
            Every 2 fragments you collect will give you a history question to help you earn coins!
          </p>

          {/* Map Theme Selector / Starting Level */}
          <div className="mb-6">
            <label className="block text-gold font-display text-sm mb-2 text-left">Select Starting Realm:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(themeLabels).map(([key, label]) => {
                const targetLvl = THEME_LEVELS[key] || 1;
                return (
                  <button
                    key={key}
                    onClick={() => setLevel(targetLvl)}
                    className={`px-3 py-2 border rounded text-xs font-display transition-all leading-tight ${level === targetLvl
                      ? 'bg-gold text-maroon-dark border-gold font-bold gold-glow'
                      : 'bg-royal-blue-dark text-parchment border-royal-blue-light hover:border-gold'
                      }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup Summary */}
          <div className="bg-maroon-dark border border-maroon-light p-4 rounded text-left mb-6 text-sm">
            <h4 className="text-gold font-display mb-2">Single Player Setup:</h4>
            <div className="flex items-center justify-between py-1 border-b border-maroon-light">
              <span>Hearts:</span>
              <span className="flex items-center text-red-500 font-bold">
                <Heart size={13} className="fill-red-500 mr-1" /> {hearts}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-maroon-light">
              <span>Memory Fragments:</span>
              <span className="text-amber-300 font-semibold">{totalFragments} in this realm</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-maroon-light">
              <span>Active Skin:</span>
              <span className="text-gold font-semibold capitalize">
                {getSkinProperties(user?.activeSkin || 'default').name}
              </span>
            </div>
            <div className="flex flex-col gap-2 py-1.5">
              <div className="flex items-center justify-between">
                <span>Dharma Shield (one-hit absorb):</span>
                <span className="text-xs text-parchment-dark">({ownedShields} owned)</span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={shieldActive || ownedShields <= 0}
                  onClick={async () => {
                    try {
                      const res = await axios.post(`${API_URL}/shop/use-booster`, { boosterType: 'shield' });
                      if (res.data.success) {
                        setShieldActive(true);
                        setOwnedShields(prev => Math.max(0, prev - 1));
                        refreshUser();
                      }
                    } catch (err) {
                      console.error('Error using shield booster:', err);
                    }
                  }}
                  className="flex-1 py-1 bg-cyan-950/40 border border-cyan-500 text-xs text-cyan-400 rounded hover:bg-cyan-500 hover:text-maroon-dark transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  {shieldActive ? '✓ Active' : 'Use Owned Shield'}
                </button>
                <button
                  disabled={shieldActive || (user?.coins || 0) < 25}
                  onClick={async () => {
                    try {
                      const res = await axios.post(`${API_URL}/shop/buy-item`, { itemType: 'shield', quantity: 1 });
                      if (res.data.success) {
                        // Immediately use it
                        const useRes = await axios.post(`${API_URL}/shop/use-booster`, { boosterType: 'shield' });
                        if (useRes.data.success) {
                          setShieldActive(true);
                          refreshUser();
                        }
                      }
                    } catch (err) {
                      console.error('Error buying and using shield:', err);
                    }
                  }}
                  className="flex-1 py-1 bg-royal-blue-light border border-gold text-xs text-gold rounded hover:bg-gold hover:text-maroon-dark transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  Buy & Use (25 Coins)
                </button>
              </div>
            </div>
          </div>

          {/* Win objective note */}
          <p className="text-xs text-parchment-dark mb-5 bg-royal-blue-dark/40 border border-royal-blue-light/40 rounded p-2 font-sans">
            🎯 <strong className="text-gold">How to Win:</strong> Find all the yellow memory fragments and grab the blue diamond to escape and win the level!
          </p>

          <div className="flex gap-4">
            <button onClick={onBackToDashboard} className="flex-1 btn-heritage-outline py-2">
              Back
            </button>
            <button
              onClick={() => setIsPlaying(true)}
              className="flex-1 btn-heritage py-2 flex items-center justify-center gap-2"
            >
              <Play size={16} /> Enter Realm
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Active Game Screen ─────────────────────────────────────────── */}
      {(isPlaying || questionModal || isGameOver || isGameWon || isLevelCleared || questionLoading) && (
        <div className="flex flex-col items-center">

          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-[736px] bg-royal-blue-dark border border-royal-blue-light px-4 py-2 sm:py-3 rounded-t-lg text-sm mb-0">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="flex items-center text-red-500 font-semibold gap-1">
                <Heart size={15} className="fill-red-500" /> {hearts}
              </span>
              <span className="flex items-center text-gold font-semibold gap-1">
                <Coins size={15} /> {coinsEarned}
              </span>
              <span className="flex items-center text-cyan-400 font-semibold gap-1">
                <Gem size={15} /> {diamondsEarned}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {speedBoost && (
                <span className="flex items-center text-yellow-400 font-semibold text-xs gap-0.5 animate-pulse">
                  <Zap size={13} /> Speed
                </span>
              )}
              {shieldActive && (
                <span className="flex items-center text-cyan-400 font-semibold text-xs gap-0.5">
                  <Shield size={13} /> Shield
                </span>
              )}
              <span className="text-parchment-dark text-xs">
                Score: <strong className="text-parchment">{score}</strong>
              </span>
              {/* BUG FIX: show actual fragment count instead of hardcoded /10 */}
              <span className="text-parchment-dark text-xs">
                Fragments: <strong className="text-amber-300">{fragmentsCollected}/{totalFragments}</strong>
              </span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative w-full max-w-[736px] border-x border-b border-royal-blue-light p-1 rounded-b-lg shadow-2xl overflow-hidden"
            style={{ background: THEME[mapTheme]?.bg || '#0a0405' }}>
            <canvas
              ref={canvasRef}
              width={736}
              height={544}
              className="block rounded w-full h-auto object-contain mx-auto"
              style={{ background: THEME[mapTheme]?.bg || '#0a0405' }}
            />

            {/* Loading Question Overlay */}
            {questionLoading && (
              <div className="fixed inset-0 bg-maroon-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
                <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin mb-4"></div>
                <div className="text-amber-300 text-xs font-display tracking-widest uppercase mb-1 animate-pulse">
                  ✦ Loading Trivia Question ✦
                </div>
                <p className="text-xs text-parchment-dark">Consulting the archives...</p>
              </div>
            )}

            {/* Mobile D-Pad */}
            <div className="flex justify-center gap-2 mt-4 md:hidden">
              <div className="grid grid-cols-3 gap-2 w-44">
                <div></div>
                <button
                  onMouseDown={() => { gameStateRef.current.activeKeys['ArrowUp'] = true; }}
                  onMouseUp={() => { delete gameStateRef.current.activeKeys['ArrowUp']; }}
                  onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.activeKeys['ArrowUp'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); delete gameStateRef.current.activeKeys['ArrowUp']; }}
                  className="bg-royal-blue border border-gold text-gold font-bold p-3 text-center rounded active:bg-gold active:text-maroon-dark text-lg select-none shadow-lg cursor-pointer"
                >
                  ▲
                </button>
                <div></div>

                <button
                  onMouseDown={() => { gameStateRef.current.activeKeys['ArrowLeft'] = true; }}
                  onMouseUp={() => { delete gameStateRef.current.activeKeys['ArrowLeft']; }}
                  onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.activeKeys['ArrowLeft'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); delete gameStateRef.current.activeKeys['ArrowLeft']; }}
                  className="bg-royal-blue border border-gold text-gold font-bold p-3 text-center rounded active:bg-gold active:text-maroon-dark text-lg select-none shadow-lg cursor-pointer"
                >
                  ◀
                </button>
                <div className="flex items-center justify-center text-xs text-parchment-dark font-display select-none">Keys</div>
                <button
                  onMouseDown={() => { gameStateRef.current.activeKeys['ArrowRight'] = true; }}
                  onMouseUp={() => { delete gameStateRef.current.activeKeys['ArrowRight']; }}
                  onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.activeKeys['ArrowRight'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); delete gameStateRef.current.activeKeys['ArrowRight']; }}
                  className="bg-royal-blue border border-gold text-gold font-bold p-3 text-center rounded active:bg-gold active:text-maroon-dark text-lg select-none shadow-lg cursor-pointer"
                >
                  ▶
                </button>

                <div></div>
                <button
                  onMouseDown={() => { gameStateRef.current.activeKeys['ArrowDown'] = true; }}
                  onMouseUp={() => { delete gameStateRef.current.activeKeys['ArrowDown']; }}
                  onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.activeKeys['ArrowDown'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); delete gameStateRef.current.activeKeys['ArrowDown']; }}
                  className="bg-royal-blue border border-gold text-gold font-bold p-3 text-center rounded active:bg-gold active:text-maroon-dark text-lg select-none shadow-lg cursor-pointer"
                >
                  ▼
                </button>
                <div></div>
              </div>
            </div>

            <p className="text-xs text-center text-parchment-dark mt-2 hidden md:block font-sans">
              ⌨️ <strong>Controls:</strong> Use your keyboard's <strong>Arrow Keys</strong> or <strong>WASD</strong> to move the character.
            </p>

            {/* ── 3. Trivia Question Modal ─────────────────────────────────── */}
            {questionModal && currentQuestion && (
              <div className="fixed inset-0 bg-maroon-dark/98 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-50 overflow-y-auto">
                <div className="flex justify-between items-center w-full max-w-md mb-3">
                  <span className="text-gold font-display text-xs border border-gold/30 px-2 py-0.5 rounded capitalize">
                    {currentQuestion.category?.replace('_', ' ')}
                  </span>
                  <span className={`text-sm font-bold font-display px-2 py-0.5 rounded ${questionTimer <= 5 ? 'text-red-500 animate-bounce' : 'text-gold'
                    }`}>
                    ⏱ {questionTimer}s
                  </span>
                </div>

                <div className="mb-3 text-amber-300 text-xs font-display tracking-widest uppercase">
                  ✦ Ancient Wisdom Unlocked ✦
                </div>

                <h3 className="text-lg text-parchment font-display mb-6 px-4 leading-snug">
                  {currentQuestion.question}
                </h3>

                {ownedHints > 0 && !questionFeedback && (
                  <button
                    disabled={disabledOptions.length > 0}
                    onClick={async () => {
                      try {
                        const res = await axios.post(`${API_URL}/shop/use-booster`, { boosterType: 'hint' });
                        if (res.data.success) {
                          setOwnedHints(prev => Math.max(0, prev - 1));
                          refreshUser();
                          // Eliminate 2 wrong choices
                          const wrongOpts = currentQuestion.options.filter(opt => opt !== currentQuestion.answer);
                          const shuffled = [...wrongOpts].sort(() => 0.5 - Math.random());
                          setDisabledOptions(shuffled.slice(0, 2));
                        }
                      } catch (err) {
                        console.error('Error using hint booster:', err);
                      }
                    }}
                    className="mb-4 px-3 py-1.5 bg-amber-950/40 border border-amber-500 rounded text-xs text-amber-400 font-bold hover:bg-amber-500 hover:text-maroon-dark transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <HelpCircle size={14} /> Use Hint Token ({ownedHints} owned)
                  </button>
                )}

                <div className="grid grid-cols-1 gap-3 w-full max-w-md mb-6">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isCorrectOpt = opt === currentQuestion.answer;
                    const isDisabled = disabledOptions.includes(opt);
                    let btnStyle = 'border-royal-blue-light hover:border-gold bg-royal-blue-dark text-parchment';
                    if (isDisabled) {
                      btnStyle = 'opacity-30 border-transparent bg-gray-950/50 text-gray-500 cursor-not-allowed';
                    } else if (questionFeedback) {
                      if (isCorrectOpt) btnStyle = 'bg-emerald-800 border-emerald-400 text-white font-bold';
                      else if (isSelected) btnStyle = 'bg-red-800 border-red-400 text-white';
                    } else if (isSelected) btnStyle = 'border-gold bg-royal-blue text-gold font-semibold';

                    return (
                      <button
                        key={idx}
                        disabled={questionFeedback !== null || isDisabled}
                        onClick={() => handleTriviaAnswer(opt)}
                        className={`px-4 py-2.5 border rounded text-sm transition-all text-left cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {questionFeedback === 'correct' && (
                  <div className="text-emerald-400 font-display font-semibold animate-pulse text-sm">
                    ✓ Dharma restored! Speed Boost +20 Coins!
                  </div>
                )}
                {questionFeedback === 'wrong' && (
                  <div className="text-red-400 font-display font-semibold text-sm">
                    ✗ Adharma! Heart lost — Vismarana awakens!
                  </div>
                )}
              </div>
            )}

            {/* ── 4. Game Over Overlay ─────────────────────────────────────── */}
            {isGameOver && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-50 overflow-y-auto">
                <h3 className="text-4xl text-red-500 font-display font-black mb-1">GAME OVER</h3>
                <p className="text-sm text-parchment-dark mb-6">Vismarana has consumed all memories…</p>

                <div className="bg-maroon-dark/60 border border-maroon-light p-4 rounded max-w-xs w-full mb-6 text-left text-sm">
                  <div className="flex justify-between py-1 border-b border-maroon-light">
                    <span>Coins Earned:</span>
                    <span className="text-gold font-semibold">+{coinsEarned}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-maroon-light">
                    <span>Diamonds Earned:</span>
                    <span className="text-cyan-400 font-semibold">+{diamondsEarned}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Final Score:</span>
                    <span className="text-white font-bold">{score}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button
                    disabled={(user?.coins || 0) < 50}
                    onClick={handleRevive}
                    className="btn-heritage py-2 w-full flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw size={15} /> Revive for 50 Coins
                  </button>
                  <p className="text-[10px] text-parchment-dark">
                    You have <strong className="text-gold">{user?.coins || 0}</strong> coins.
                  </p>
                  <button
                    onClick={() => { resetGameData(); onBackToDashboard(); }}
                    className="btn-heritage-outline py-2 w-full cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* ── 5. Victory Overlay ───────────────────────────────────────── */}
            {isGameWon && (
              <div className="fixed inset-0 bg-maroon-dark/98 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-50 overflow-y-auto animate-fade-in">
                <div className="text-amber-300 text-xs font-display tracking-widest uppercase mb-2 animate-pulse">
                  ✦ Ancient Heritage Restored ✦
                </div>
                <h3 className="text-4xl text-gold font-display font-black mb-1 gold-text-glow animate-pulse">
                  VICTORY
                </h3>
                <p className="text-sm text-emerald-400 font-semibold mb-6">
                  The Sutradhar has reclaimed all lost threads of Bharat!
                </p>

                <div className="bg-royal-blue-dark border border-gold/30 p-4 rounded max-w-xs w-full mb-6 text-left text-sm animate-slide-up">
                  <div className="flex justify-between py-1 border-b border-royal-blue-light">
                    <span>Coins Earned:</span>
                    <span className="text-gold font-semibold">+{coinsEarned}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-royal-blue-light">
                    <span>Diamonds Earned:</span>
                    <span className="text-cyan-400 font-semibold">+{diamondsEarned}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Final Score:</span>
                    <span className="text-white font-bold">{score}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full max-w-xs">
                  <button
                    onClick={() => { resetGameData(); setIsPlaying(true); }}
                    className="flex-1 btn-heritage py-2 text-xs cursor-pointer"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => { resetGameData(); onBackToDashboard(); }}
                    className="flex-1 btn-heritage-outline py-2 text-xs cursor-pointer"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* ── 6. Level Transition Overlay ────────────────────────────── */}
            {isLevelCleared && (
              <div className="fixed inset-0 bg-maroon-dark/98 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-50 overflow-y-auto animate-fade-in">
                <div className="text-amber-300 text-xs font-display tracking-widest uppercase mb-2 animate-pulse">
                  ✦ Realm Restored ✦
                </div>
                <h3 className="text-4xl text-gold font-display font-black mb-1 gold-text-glow">
                  LEVEL {level} CLEARED
                </h3>
                <p className="text-sm text-emerald-400 font-semibold mb-6">
                  Reclaimed all memory fragments of the {themeLabels[mapTheme]}!
                </p>

                <div className="bg-royal-blue-dark border border-gold/30 p-4 rounded max-w-xs w-full mb-6 text-left text-sm animate-slide-up">
                  <h4 className="text-gold font-display text-xs mb-2 border-b border-royal-blue-light pb-1">Realm Loot:</h4>
                  <div className="flex justify-between py-1 border-b border-royal-blue-light/50">
                    <span>Coins Collected:</span>
                    <span className="text-gold font-semibold">+{coinsEarned}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-royal-blue-light/50">
                    <span>Diamonds Collected:</span>
                    <span className="text-cyan-400 font-semibold">+{diamondsEarned}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Current Score:</span>
                    <span className="text-white font-bold">{score}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setLevel(prev => prev + 1);
                      setIsPlaying(true);
                    }}
                    className="btn-heritage py-2 w-full flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Advance to Level {level + 1} →
                  </button>
                  <button
                    onClick={() => { resetGameData(); onBackToDashboard(); }}
                    className="btn-heritage-outline py-2 w-full text-xs cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SutradharMaze;
