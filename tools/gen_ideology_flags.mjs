/**
 * Generate ideology flag variants for DEC tags (HOI4: TAG_ideology.tga).
 * Designs inspired by historical / TFR-warlord aesthetics — not TFR file copies.
 * Sizes: 82x52, medium 41x26, small 10x7.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'gfx', 'flags');

const IDEOS = ['democratic', 'communism', 'fascism', 'neutrality', 'nationalist'];

const SIZES = [
  { dir: '', w: 82, h: 52 },
  { dir: 'medium', w: 41, h: 26 },
  { dir: 'small', w: 10, h: 7 },
];

/** Cool ideology SVGs — only where we want something different from the base flag */
const VARIANTS = {
  // --- Caucasus ---
  CAU: {
    // Ichkeria green (TFR Greater Ichkeria vibe)
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#009B3A"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#D52B1E"/><g fill="#FFD700" transform="translate(160,300)"><polygon points="0,-70 16,-22 70,-22 26,8 42,60 0,28 -42,60 -26,8 -70,-22 -16,-22"/></g></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="0" width="900" height="80" fill="#FFD700"/><circle cx="180" cy="280" r="70" fill="none" stroke="#FFD700" stroke-width="14"/><path d="M180 220 L195 265 L245 265 L205 292 L220 340 L180 312 L140 340 L155 292 L115 265 L165 265 Z" fill="#FFD700"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect y="220" width="900" height="160" fill="#009B3A"/><polygon points="80,80 200,300 80,520" fill="#D52B1E"/></svg>`,
  },
  RYS: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0A0A0A"/><text x="450" y="340" text-anchor="middle" font-size="220" fill="#FFFFFF" font-family="Arial">☪</text></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#009B3A"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#D52B1E"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><circle cx="200" cy="300" r="90" fill="none" stroke="#FFD700" stroke-width="18"/><path d="M320 240 L380 300 L320 360" fill="none" stroke="#FFD700" stroke-width="18"/></svg>`,
  },
  CIR: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><g fill="#FFD700" transform="translate(450,300)"><circle r="20"/><g id="a"><rect x="-6" y="-90" width="12" height="50"/><rect x="-6" y="40" width="12" height="50"/><rect x="-90" y="-6" width="50" height="12"/><rect x="40" y="-6" width="50" height="12"/></g><use href="#a" transform="rotate(45)"/></g></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0D1B2A"/><g fill="#FFD700" transform="translate(450,260)"><circle cy="-40" r="28"/><circle cx="-70" cy="20" r="22"/><circle cx="70" cy="20" r="22"/><circle cx="-40" cy="90" r="18"/><circle cx="40" cy="90" r="18"/><circle cy="130" r="16"/><rect x="-10" y="20" width="20" height="160"/></g></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#007A3D"/><g fill="#FFD700" transform="translate(450,280)"><circle cy="-50" r="30"/><circle cx="-75" cy="15" r="24"/><circle cx="75" cy="15" r="24"/><circle cx="-45" cy="95" r="20"/><circle cx="45" cy="95" r="20"/><circle cy="140" r="18"/><rect x="-12" y="10" width="24" height="180"/></g></svg>`,
  },
  KBC: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#C9A227"/><rect y="400" width="900" height="200" fill="#8B0000"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#0039A6"/><rect y="200" width="900" height="200" fill="#C9A227"/><rect y="400" width="900" height="200" fill="#D52B1E"/><path d="M80 80 L160 300 L80 520" fill="#FFFFFF"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect x="0" y="0" width="220" height="600" fill="#0039A6"/><polygon points="450,180 480,260 570,260 500,310 525,400 450,345 375,400 400,310 330,260 420,260" fill="#FFD700"/></svg>`,
  },
  NOG: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><path d="M420 220 a90 90 0 1 0 0 160 a70 70 0 1 1 0 -160" fill="#FFD700"/><polygon points="540,300 555,285 575,300 555,315" fill="#FFD700"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><path d="M400 200 a100 100 0 1 0 0 200 a80 80 0 1 1 0 -200" fill="#FFD700"/><polygon points="560,300 590,255 620,300 590,345" fill="#FFD700"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0A7A3E"/><path d="M400 200 a100 100 0 1 0 0 200 a80 80 0 1 1 0 -200" fill="#FFFFFF"/><polygon points="560,300 590,255 620,300 590,345" fill="#FFFFFF"/></svg>`,
  },
  // --- Volga / Ural / Far East ---
  IDL: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="0" width="900" height="100" fill="#0039A6"/><rect y="500" width="900" height="100" fill="#0039A6"/><polygon points="450,160 490,280 620,280 515,350 555,480 450,400 345,480 385,350 280,280 410,280" fill="#FFD700"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect y="180" width="900" height="240" fill="#0A7A3E"/><polygon points="450,200 480,280 570,280 500,330 525,420 450,365 375,420 400,330 330,280 420,280" fill="#FFD700"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#0039A6"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#0A7A3E"/><circle cx="200" cy="300" r="70" fill="#FFD700"/></svg>`,
  },
  VBG: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><path d="M360 220 a110 110 0 1 0 0 200 a85 85 0 1 1 0 -200" fill="none" stroke="#FFD700" stroke-width="28"/><polygon points="560,200 590,300 690,300 610,360 640,470 560,400 480,470 510,360 430,300 530,300" fill="#FFD700"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#FFCC00"/><g fill="#CC0000" transform="translate(450,320)"><rect x="-18" y="-20" width="36" height="160"/><circle cy="-80" r="55"/><circle cx="-90" cy="-20" r="40"/><circle cx="90" cy="-20" r="40"/><circle cx="-55" cy="-130" r="32"/><circle cx="55" cy="-130" r="32"/><circle cy="-175" r="28"/></g></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><path d="M360 220 a110 110 0 1 0 0 200 a85 85 0 1 1 0 -200" fill="none" stroke="#FFD700" stroke-width="28"/><polygon points="620,300 650,270 690,300 650,330" fill="#FFD700"/></svg>`,
  },
  BCF: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><g fill="#FFD700" transform="translate(450,320)"><rect x="-18" y="-20" width="36" height="160"/><circle cy="-80" r="55"/><circle cx="-90" cy="-20" r="40"/><circle cx="90" cy="-20" r="40"/><circle cx="-55" cy="-130" r="32"/><circle cx="55" cy="-130" r="32"/><circle cy="-175" r="28"/></g></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><g fill="#FFCC00" transform="translate(450,320)"><rect x="-18" y="-20" width="36" height="160"/><circle cy="-80" r="55"/><circle cx="-90" cy="-20" r="40"/><circle cx="90" cy="-20" r="40"/><circle cx="-55" cy="-130" r="32"/><circle cx="55" cy="-130" r="32"/><circle cy="-175" r="28"/></g></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#FFCC00"/><rect y="0" width="120" height="600" fill="#CC0000"/><g fill="#CC0000" transform="translate(480,320)"><rect x="-18" y="-20" width="36" height="160"/><circle cy="-80" r="55"/><circle cx="-90" cy="-20" r="40"/><circle cx="90" cy="-20" r="40"/><circle cy="-175" r="28"/></g></svg>`,
  },
  ZKL: {
    // Far Eastern Republic — red with blue canton (TFR FER / Levchenko vibe)
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#CE1126"/><rect width="360" height="300" fill="#0039A6"/><polygon points="180,60 205,130 280,130 220,170 240,245 180,195 120,245 140,170 80,130 155,130" fill="#FFFFFF"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect y="0" width="900" height="200" fill="#0057B8"/><rect y="200" width="900" height="200" fill="#FFD700"/><polygon points="0,0 280,300 0,600" fill="#009639"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="300" fill="#0057B8"/><rect y="300" width="900" height="300" fill="#FFD700"/><polygon points="0,0 300,300 0,600" fill="#1A1A1A"/></svg>`,
  },
  VYK: {
    // Uralic People's Alliance / Roizman vibe — green-white
    democratic: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="300" fill="#2E8B57"/><rect y="300" width="900" height="300" fill="#FFFFFF"/><circle cx="220" cy="300" r="90" fill="#FFD700" stroke="#2E8B57" stroke-width="10"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect x="380" width="140" height="600" fill="#FFD700"/><rect y="230" width="900" height="140" fill="#FFD700"/><circle cx="450" cy="300" r="50" fill="#8B0000"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#FFD700"/><rect y="400" width="900" height="200" fill="#FFFFFF"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#2E8B57"/><rect x="380" width="140" height="600" fill="#FFD700"/><rect y="230" width="900" height="140" fill="#FFD700"/></svg>`,
  },
  VOR: {
    // Patriotic Union / RNS vibe — black-gold / imperial
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#C9A227"/><rect y="400" width="900" height="200" fill="#FFFFFF"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect y="220" width="900" height="160" fill="#C9A227"/><polygon points="450,120 480,210 580,210 500,265 530,360 450,300 370,360 400,265 320,210 420,210" fill="#C9A227"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="0" width="900" height="90" fill="#FFD700"/><text x="450" y="340" text-anchor="middle" font-size="160" fill="#FFD700" font-family="serif">В</text></svg>`,
    neutrality: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#0039A6"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#D52B1E"/></svg>`,
  },
  SEV: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#C9A227"/><rect y="400" width="900" height="200" fill="#FFFFFF"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0D1B2A"/><rect y="0" width="900" height="120" fill="#C9A227"/><circle cx="200" cy="340" r="80" fill="#C9A227"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><polygon points="450,140 490,260 620,260 515,335 555,470 450,385 345,470 385,335 280,260 410,260" fill="#FFD700"/></svg>`,
  },
  BGR: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="0" width="900" height="100" fill="#0039A6"/><text x="450" y="360" text-anchor="middle" font-size="140" fill="#FFD700" font-family="serif">С</text></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#C9A227"/><rect y="400" width="900" height="200" fill="#FFFFFF"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#0039A6"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#D52B1E"/></svg>`,
  },
  SMO: {
    // NSR / Katz liberal — green-white; fascism black-gold
    democratic: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="300" fill="#0A7A3E"/><rect y="300" width="900" height="300" fill="#FFFFFF"/><circle cx="250" cy="300" r="100" fill="#FFD700"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#C9A227"/><rect y="400" width="900" height="200" fill="#FFFFFF"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect x="0" width="280" height="600" fill="#0039A6"/><polygon points="520,160 555,270 680,270 580,340 615,460 520,385 425,460 460,340 360,270 485,270" fill="#FFD700"/></svg>`,
  },
  // --- North / Finno-Ugric ---
  IGR: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="550"><rect width="900" height="550" fill="#1A1A1A"/><rect y="180" width="900" height="190" fill="#D52B1E"/><rect width="300" height="550" fill="#0033A0"/><rect x="120" width="60" height="550" fill="#F7D117"/><rect y="245" width="300" height="60" fill="#F7D117"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="550"><rect width="900" height="550" fill="#8B0000"/><rect width="300" height="550" fill="#0033A0"/><rect x="120" width="60" height="550" fill="#FFD700"/><rect y="245" width="300" height="60" fill="#FFD700"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="550"><rect width="900" height="550" fill="#F7D117"/><rect y="183" width="900" height="184" fill="#1A1A1A"/><rect width="300" height="550" fill="#0033A0"/><rect x="120" width="60" height="550" fill="#F7D117"/><rect y="245" width="300" height="60" fill="#F7D117"/></svg>`,
  },
  ERZ: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#8B0000"/><rect y="160" width="600" height="80" fill="#FFFFFF"/><circle cx="140" cy="200" r="58" fill="none" stroke="#FFD700" stroke-width="16"/><circle cx="140" cy="200" r="20" fill="#FFD700"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#1A1A1A"/><rect y="160" width="600" height="80" fill="#C8102E"/><circle cx="140" cy="200" r="58" fill="none" stroke="#C8102E" stroke-width="16"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#FFFFFF"/><rect y="160" width="600" height="80" fill="#1A1A1A"/><circle cx="140" cy="200" r="58" fill="none" stroke="#C8102E" stroke-width="16"/><circle cx="140" cy="200" r="20" fill="#C8102E"/></svg>`,
  },
  MOK: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="500" height="100" fill="#8B0000"/><rect y="100" width="500" height="100" fill="#FFD700"/><rect y="200" width="500" height="100" fill="#1A1A1A"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="500" height="100" fill="#1A1A1A"/><rect y="100" width="500" height="100" fill="#C41E3A"/><rect y="200" width="500" height="100" fill="#1A1A1A"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="500" height="100" fill="#C41E3A"/><rect y="100" width="500" height="100" fill="#FFFFFF"/><rect y="200" width="500" height="100" fill="#1A1A1A"/><circle cx="250" cy="150" r="35" fill="#C41E3A"/></svg>`,
  },
  BJA: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect y="240" width="900" height="120" fill="#FFD700"/><circle cx="220" cy="300" r="70" fill="#8B0000"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="240" width="900" height="120" fill="#FFFFFF"/><circle cx="220" cy="300" r="70" fill="#FFD700"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0039A6"/><rect y="240" width="900" height="120" fill="#1A1A1A"/><circle cx="220" cy="300" r="70" fill="#FFD700"/></svg>`,
  },
  LAP: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect x="0" y="260" width="900" height="80" fill="#C41E3A"/><rect x="260" y="0" width="80" height="600" fill="#C41E3A"/><circle cx="300" cy="300" r="55" fill="#FFD700"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect x="0" y="260" width="900" height="80" fill="#0039A6"/><rect x="260" y="0" width="80" height="600" fill="#0039A6"/><circle cx="300" cy="300" r="55" fill="#FFD700"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0039A6"/><rect x="0" y="260" width="900" height="80" fill="#C41E3A"/><rect x="260" y="0" width="80" height="600" fill="#C41E3A"/><circle cx="300" cy="300" r="55" fill="#FFD700"/></svg>`,
  },
  OSA: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#FFD700"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#C9A227"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#FFFFFF"/><rect y="200" width="900" height="200" fill="#C41E3A"/><rect y="400" width="900" height="200" fill="#FFD700"/></svg>`,
  },
  BLK: {
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="0" width="900" height="100" fill="#0039A6"/><circle cx="200" cy="340" r="80" fill="#FFD700"/></svg>`,
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#0039A6"/><rect y="400" width="900" height="200" fill="#C9A227"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#0039A6"/><rect y="200" width="900" height="200" fill="#FFFFFF"/><rect y="400" width="900" height="200" fill="#0A7A3E"/></svg>`,
  },
  // megas
  WBR: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect x="0" y="250" width="900" height="100" fill="#FFFFFF"/><rect x="400" y="0" width="100" height="600" fill="#FFFFFF"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#FFD700"/><rect y="400" width="900" height="200" fill="#FFFFFF"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect x="0" y="250" width="900" height="100" fill="#0039A6"/><rect x="400" y="0" width="100" height="600" fill="#0039A6"/></svg>`,
  },
  KHF: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0A0A0A"/><text x="450" y="360" text-anchor="middle" font-size="240" fill="#FFFFFF" font-family="Arial">☪</text><rect y="0" width="900" height="40" fill="#FFFFFF"/><rect y="560" width="900" height="40" fill="#FFFFFF"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#0A0A0A"/><path d="M380 200 a120 120 0 1 0 0 240 a95 95 0 1 1 0 -240" fill="#FFFFFF"/><polygon points="560,300 600,240 640,300 600,360" fill="#FFFFFF"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><rect y="0" width="900" height="80" fill="#8B0000"/><text x="450" y="360" text-anchor="middle" font-size="200" fill="#8B0000" font-family="Arial">☪</text></svg>`,
  },
  CBN: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#1A1A1A"/><rect y="200" width="900" height="200" fill="#C41E3A"/><rect y="400" width="900" height="200" fill="#0A7A3E"/></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><rect y="0" width="900" height="120" fill="#1A1A1A"/><rect y="480" width="900" height="120" fill="#0A7A3E"/><polygon points="450,180 485,290 610,290 510,355 545,470 450,395 355,470 390,355 290,290 415,290" fill="#FFD700"/></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="200" fill="#FFD700"/><rect y="200" width="900" height="200" fill="#C41E3A"/><rect y="400" width="900" height="200" fill="#0A7A3E"/><circle cx="200" cy="300" r="70" fill="#1A1A1A"/></svg>`,
  },
  ASN: {
    fascism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#1A1A1A"/><circle cx="450" cy="300" r="90" fill="#CE1126"/><g stroke="#CE1126" stroke-width="28" stroke-linecap="butt">${Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8;
      const x2 = 450 + Math.cos(a) * 280;
      const y2 = 300 + Math.sin(a) * 280;
      return `<line x1="450" y1="300" x2="${x2}" y2="${y2}"/>`;
    }).join('')}</g></svg>`,
    communism: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#8B0000"/><circle cx="450" cy="300" r="80" fill="#FFD700"/><g stroke="#FFD700" stroke-width="22">${Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return `<line x1="450" y1="300" x2="${450 + Math.cos(a) * 260}" y2="${300 + Math.sin(a) * 260}"/>`;
    }).join('')}</g></svg>`,
    nationalist: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#FFFFFF"/><circle cx="200" cy="200" r="70" fill="#CE1126"/><g stroke="#CE1126" stroke-width="20">${Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8;
      return `<line x1="200" y1="200" x2="${200 + Math.cos(a) * 360}" y2="${200 + Math.sin(a) * 360}"/>`;
    }).join('')}</g></svg>`,
  },
};

function writeTga(filePath, width, height, rgba) {
  const header = Buffer.alloc(18);
  header[2] = 2;
  header.writeUInt16LE(width, 12);
  header.writeUInt16LE(height, 14);
  header[16] = 32;
  header[17] = 8;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const si = (srcY * width + x) * 4;
      const di = (y * width + x) * 4;
      pixels[di] = rgba[si + 2];
      pixels[di + 1] = rgba[si + 1];
      pixels[di + 2] = rgba[si];
      pixels[di + 3] = rgba[si + 3];
    }
  }
  fs.writeFileSync(filePath, Buffer.concat([header, pixels]));
}

async function writeAllSizes(tag, ideology, svg) {
  const name = `${tag}_${ideology}`;
  for (const { dir, w, h } of SIZES) {
    const outDir = dir ? path.join(OUT, dir) : OUT;
    fs.mkdirSync(outDir, { recursive: true });
    const { data } = await sharp(Buffer.from(svg))
      .resize(w, h, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    writeTga(path.join(outDir, `${name}.tga`), w, h, data);
  }
}

/** For tags with variants: also fill missing ideologies by copying base TAG.tga */
async function fillMissingFromBase(tag, have) {
  const basePath = path.join(OUT, `${tag}.tga`);
  if (!fs.existsSync(basePath)) return;
  const base = fs.readFileSync(basePath);
  for (const ideo of IDEOS) {
    if (have.has(ideo)) continue;
    for (const { dir } of SIZES) {
      const outDir = dir ? path.join(OUT, dir) : OUT;
      const src = dir ? path.join(OUT, dir, `${tag}.tga`) : basePath;
      const dst = path.join(outDir, `${tag}_${ideo}.tga`);
      if (fs.existsSync(src) && !fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
      }
    }
  }
}

async function main() {
  let made = 0;
  const report = [];
  for (const [tag, map] of Object.entries(VARIANTS)) {
    const have = new Set();
    for (const [ideo, svg] of Object.entries(map)) {
      // strip accidental invalid tags in SVG like <crescent/>
      const clean = svg.replace(/<crescent\s*\/>/g, '');
      await writeAllSizes(tag, ideo, clean);
      have.add(ideo);
      made++;
      report.push(`${tag}_${ideo}`);
    }
    await fillMissingFromBase(tag, have);
  }
  const srcNote = path.join(OUT, 'DEC_IDEOLOGY_FLAGS.txt');
  fs.writeFileSync(
    srcNote,
    `DEC ideology flag variants (generated)\n` +
      `${new Date().toISOString()}\n` +
      `Count: ${made}\n` +
      `Inspired by historical + TFR-warlord aesthetics (not TFR file dumps).\n\n` +
      report.map((r) => `OK\t${r}`).join('\n') +
      '\n'
  );
  console.log(`Wrote ${made} ideology flag sets (3 sizes each).`);
  console.log(report.join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
