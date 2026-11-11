'use strict';

/* ======================= Константы ======================= */
const CW = 1280, CH = 720;             // логический размер слайда
const MIN = 20;                        // минимальный размер объекта
const api = window.slidepar;           // мост из preload
const SVGNS = 'http://www.w3.org/2000/svg';

// Векторные фигуры (в системе координат 0..100)
const SHAPES = {
  triangle:      { points: '50,6 95,94 5,94' },
  diamond:       { points: '50,5 95,50 50,95 5,50' },
  star:          { points: '50,2 61,38 98,38 68,61 79,97 50,75 21,97 32,61 2,38 39,38' },
  pentagon:      { points: '50,4 96,38 78,94 22,94 4,38' },
  hexagon:       { points: '50,3 93,26 93,74 50,97 7,74 7,26' },
  'arrow-right': { points: '5,32 60,32 60,10 95,50 60,90 60,68 5,68' },
  'arrow-left':  { points: '95,32 40,32 40,10 5,50 40,90 40,68 95,68' },
  'arrow-up':    { points: '32,95 32,40 10,40 50,5 90,40 68,40 68,95' },
  'arrow-down':  { points: '32,5 32,60 10,60 50,95 90,60 68,60 68,5' },
  heart:         { d: 'M50,88 C18,64 6,44 6,28 C6,14 18,6 30,6 C40,6 47,13 50,22 C53,13 60,6 70,6 C82,6 94,14 94,28 C94,44 82,64 50,88 Z' }
};

// Список для меню «Фигуры» (включая линию)
const SHAPE_MENU = [
  ['triangle', 'Треугольник'], ['diamond', 'Ромб'], ['star', 'Звезда'], ['pentagon', 'Пятиугольник'],
  ['hexagon', 'Шестиугольник'], ['arrow-right', 'Стрелка вправо'], ['arrow-left', 'Стрелка влево'],
  ['arrow-up', 'Стрелка вверх'], ['arrow-down', 'Стрелка вниз'], ['heart', 'Сердце'], ['line', 'Линия']
];

// Значки (Material-подобные, viewBox 0 0 24 24, одноцветные)
const ICONS = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  check: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  close: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  gear: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  clock: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  calendar: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
  location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  like: 'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z',
  idea: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
  cloud: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
  bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  flag: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z',
  play: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
  folder: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  camera: 'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z',
  wifi: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z',
  trophy: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  rocket: 'M12 2.5s4.5 2.04 4.5 10.5c0 2.49-1.04 5.57-1.6 7H9.1c-.56-1.43-1.6-4.51-1.6-7C7.5 4.54 12 2.5 12 2.5zm2 8.5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-7 11l2-2v-2.5l-3 2V22zm10 0v-2.5l-3-2V20l2 2h1z'
};
const ICON_MENU = [
  ['home', 'Дом'], ['user', 'Пользователь'], ['star', 'Звезда'], ['heart', 'Сердце'],
  ['check', 'Галочка'], ['close', 'Крестик'], ['phone', 'Телефон'], ['mail', 'Почта'],
  ['gear', 'Настройки'], ['clock', 'Часы'], ['calendar', 'Календарь'], ['location', 'Локация'],
  ['like', 'Лайк'], ['idea', 'Идея'], ['cloud', 'Облако'], ['lock', 'Замок'],
  ['search', 'Поиск'], ['cart', 'Корзина'], ['bell', 'Колокол'], ['flag', 'Флаг'],
  ['play', 'Плей'], ['folder', 'Папка'], ['camera', 'Камера'], ['wifi', 'Wi-Fi'],
  ['trophy', 'Кубок'], ['rocket', 'Ракета']
];

// Стили WordArt (применяются к текстовым объектам)
const WORDART = {
  none: null,
  gold:    { gradient: 'linear-gradient(180deg,#fff2c0,#f6b43a 45%,#b9701a)', stroke: '#5a3a10', shadow: '2px 3px 4px rgba(0,0,0,.35)' },
  fire:    { gradient: 'linear-gradient(180deg,#ffe08a,#ff7a2f 50%,#e02a1a)', stroke: '#6a1a08', shadow: '2px 3px 5px rgba(0,0,0,.35)' },
  ocean:   { gradient: 'linear-gradient(180deg,#bff0ff,#38a8e8 50%,#1452a8)', stroke: '#0b2a55', shadow: '2px 3px 5px rgba(0,0,0,.3)' },
  purple:  { gradient: 'linear-gradient(180deg,#e9d6ff,#9a5be0 50%,#5a2ca0)', stroke: '#2e1255', shadow: '2px 3px 5px rgba(0,0,0,.3)' },
  outline: { gradient: null, stroke: '#E8833A', fillColor: 'transparent', shadow: 'none' },
  shadow:  { gradient: null, stroke: null, shadow: '4px 5px 0 rgba(0,0,0,.25)' }
};
const WORDART_MENU = [
  ['none', 'Нет'], ['gold', 'Золото'], ['fire', 'Огонь'], ['ocean', 'Океан'],
  ['purple', 'Фиолет'], ['outline', 'Контур'], ['shadow', 'Тень']
];

/* ======================= DOM ======================= */
const $ = (sel) => document.querySelector(sel);
const canvas = $('#canvas');
const canvasWrap = $('#canvasWrap');
const selectionBox = $('#selection');
const slidesList = $('#slidesList');

/* ======================= Состояние ======================= */
let deck = null;              // { title, slides: [...] }
let current = 0;              // индекс текущего слайда
let selectedId = null;       // id выбранного объекта
let projectPath = null;      // путь к .slidepar
let dirty = false;           // есть несохранённые изменения
const history = [];          // снимки для отмены
const future = [];           // снимки для повтора

/* ======================= Утилиты ======================= */
const uid = () => Math.random().toString(36).slice(2, 10);
const currentSlide = () => deck.slides[current];
const findEl = (id) => currentSlide().elements.find(e => e.id === id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clone = (o) => JSON.parse(JSON.stringify(o));

function toLogical(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const s = r.width / CW;
  return { x: (clientX - r.left) / s, y: (clientY - r.top) / s, s };
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2200);
}

function markDirty(v = true) {
  dirty = v;
  $('#savedState').textContent = v ? 'Не сохранено' : 'Сохранено';
}

/* ======================= История (undo/redo) ======================= */
function snapshot() {
  history.push({ deck: clone(deck), current, selectedId });
  if (history.length > 100) history.shift();
  future.length = 0;
}
function undo() {
  if (!history.length) return;
  future.push({ deck: clone(deck), current, selectedId });
  const s = history.pop();
  deck = s.deck; current = clamp(s.current, 0, deck.slides.length - 1); selectedId = s.selectedId;
  renderAll(); markDirty();
}
function redo() {
  if (!future.length) return;
  history.push({ deck: clone(deck), current, selectedId });
  const s = future.pop();
  deck = s.deck; current = clamp(s.current, 0, deck.slides.length - 1); selectedId = s.selectedId;
  renderAll(); markDirty();
}

/* ======================= Фабрики объектов ======================= */
function newSlide(background = '#ffffff') {
  return { id: uid(), background, transition: 'fade', elements: [], strokes: [] };
}

function newElement(type, pos) {
  const base = { id: uid(), type, x: pos ? pos.x : 120, y: pos ? pos.y : 120, anim: 'none' };
  switch (type) {
    case 'text':
      return { ...base, w: 520, h: 120, text: 'Введите текст',
        fontSize: 36, fontFamily: "Inter, system-ui, sans-serif",
        color: '#1a1a1a', bold: false, italic: false, underline: false, align: 'left' };
    case 'rect':
      return { ...base, w: 320, h: 200, fill: '#E8833A', stroke: '#C9622A', strokeWidth: 0, radius: 10 };
    case 'ellipse':
      return { ...base, w: 240, h: 240, fill: '#E8833A', stroke: '#C9622A', strokeWidth: 0 };
    case 'line':
      return { ...base, w: 420, h: 6, fill: '#C9622A', stroke: '#C9622A', strokeWidth: 0 };
    case 'image':
      return { ...base, w: 400, h: 300, src: pos.src };
    case 'chart':
      return { ...base, w: 560, h: 380, chartType: (pos && pos.chartType) || 'bar',
        title: 'Диаграмма',
        labels: ['Янв', 'Фев', 'Мар', 'Апр'],
        values: [40, 72, 55, 90] };
    case 'icon':
      return { ...base, w: 160, h: 160, icon: (pos && pos.icon) || 'star', fill: '#E8833A' };
    case 'table': {
      const rows = 3, cols = 3;
      const cells = [];
      for (let r = 0; r < rows; r++) {
        cells.push([]);
        for (let c = 0; c < cols; c++) cells[r].push(r === 0 ? 'Заголовок ' + (c + 1) : '');
      }
      return { ...base, w: 620, h: 260, rows, cols, cells, header: true,
        headerFill: '#E8833A', borderColor: '#c9b8a8', textColor: '#1a1a1a', fontSize: 20 };
    }
    default:
      if (SHAPES[type]) {
        const wide = type.startsWith('arrow-left') || type.startsWith('arrow-right');
        return { ...base, w: wide ? 300 : 220, h: wide ? 170 : 220,
          fill: '#E8833A', stroke: '#C9622A', strokeWidth: 0 };
      }
      return { ...base, w: 120, h: 120 };
  }
}

/* ======================= Диаграммы ======================= */
// Категориальная палитра (CVD-безопасная, из гайда dataviz)
const CHART_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const CHART_INK = '#333333';
const CHART_GRID = '#d9d9d9';

function svgEl(name, attrs) {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
function svgText(x, y, text, opts = {}) {
  const t = svgEl('text', {
    x, y, fill: opts.fill || CHART_INK, 'font-size': opts.size || 13,
    'font-family': 'Inter, system-ui, sans-serif',
    'text-anchor': opts.anchor || 'middle',
    'font-weight': opts.weight || 400,
    'dominant-baseline': opts.baseline || 'auto'
  });
  t.textContent = text;
  return t;
}

function renderChartSVG(el) {
  const W = el.w, H = el.h;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' });
  svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible;pointer-events:none;';
  const vals = el.values.map(v => +v || 0);
  const labels = el.labels;

  // Заголовок
  if (el.title) svg.appendChild(svgText(W / 2, 22, el.title, { size: 17, weight: 700 }));
  const topPad = el.title ? 42 : 18;

  if (el.chartType === 'pie') {
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    const legendW = 130;
    const cx = (W - legendW) / 2, cy = topPad + (H - topPad - 20) / 2;
    const r = Math.max(10, Math.min((W - legendW) / 2, (H - topPad - 20) / 2) - 8);
    let ang = -Math.PI / 2;
    vals.forEach((v, i) => {
      const slice = (v / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
      ang += slice;
      const x2 = cx + r * Math.cos(ang), y2 = cy + r * Math.sin(ang);
      const large = slice > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      svg.appendChild(svgEl('path', { d, fill: CHART_COLORS[i % CHART_COLORS.length], stroke: '#fff', 'stroke-width': 2 }));
    });
    // Легенда
    const lx = W - legendW + 16;
    labels.forEach((lab, i) => {
      const ly = topPad + 10 + i * 24;
      svg.appendChild(svgEl('rect', { x: lx, y: ly, width: 14, height: 14, rx: 3, fill: CHART_COLORS[i % CHART_COLORS.length] }));
      const pct = Math.round((vals[i] / total) * 100);
      svg.appendChild(svgText(lx + 20, ly + 11, `${lab} — ${pct}%`, { anchor: 'start', size: 13 }));
    });
    return svg;
  }

  // Столбцы и линия — общая координатная сетка
  const padL = 44, padR = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - topPad - padB;
  const maxV = Math.max(...vals, 1);
  const niceMax = niceCeil(maxV);
  const y0 = topPad + plotH;

  // Сетка + подписи оси Y (4 линии)
  for (let g = 0; g <= 4; g++) {
    const gy = topPad + plotH * (g / 4);
    svg.appendChild(svgEl('line', { x1: padL, y1: gy, x2: padL + plotW, y2: gy, stroke: CHART_GRID, 'stroke-width': 1 }));
    const val = Math.round(niceMax * (1 - g / 4));
    svg.appendChild(svgText(padL - 8, gy + 4, String(val), { anchor: 'end', fill: '#888', size: 12 }));
  }

  const n = vals.length;
  const slot = plotW / n;
  if (el.chartType === 'line') {
    const pts = vals.map((v, i) => [padL + slot * (i + 0.5), topPad + plotH * (1 - v / niceMax)]);
    const dline = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    svg.appendChild(svgEl('path', { d: dline, fill: 'none', stroke: CHART_COLORS[0], 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    pts.forEach(p => svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 5, fill: '#fff', stroke: CHART_COLORS[0], 'stroke-width': 3 })));
  } else {
    // bar
    const bw = Math.min(slot * 0.6, 80);
    vals.forEach((v, i) => {
      const bh = plotH * (v / niceMax);
      const bx = padL + slot * i + (slot - bw) / 2;
      svg.appendChild(svgEl('rect', { x: bx, y: y0 - bh, width: bw, height: bh, rx: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }));
    });
  }

  // Подписи оси X
  labels.forEach((lab, i) => {
    svg.appendChild(svgText(padL + slot * (i + 0.5), y0 + 20, lab, { fill: '#666', size: 12 }));
  });
  // Базовая ось
  svg.appendChild(svgEl('line', { x1: padL, y1: y0, x2: padL + plotW, y2: y0, stroke: '#aaa', 'stroke-width': 1 }));
  return svg;
}

function niceCeil(v) {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}

/* ======================= WordArt ======================= */
function applyWordArt(node, el) {
  const style = WORDART[el.wordartStyle || 'none'];
  // сброс
  node.style.backgroundImage = '';
  node.style.webkitBackgroundClip = '';
  node.style.webkitTextFillColor = '';
  node.style.webkitTextStroke = '';
  node.style.textShadow = '';
  if (!style) return;
  if (style.gradient) {
    node.style.backgroundImage = style.gradient;
    node.style.webkitBackgroundClip = 'text';
    node.style.backgroundClip = 'text';
    node.style.webkitTextFillColor = 'transparent';
  } else if (style.fillColor) {
    node.style.webkitTextFillColor = style.fillColor;
  }
  if (style.stroke) node.style.webkitTextStroke = Math.max(1, Math.round(el.fontSize / 28)) + 'px ' + style.stroke;
  if (style.shadow) node.style.textShadow = style.shadow;
}

/* ======================= Таблицы ======================= */
function buildTableDOM(el, interactive) {
  const table = document.createElement('table');
  table.className = 'el-table';
  table.style.borderColor = el.borderColor;
  table.style.fontSize = el.fontSize + 'px';
  table.style.color = el.textColor;
  for (let r = 0; r < el.rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < el.cols; c++) {
      const isHead = el.header && r === 0;
      const cell = document.createElement(isHead ? 'th' : 'td');
      cell.textContent = (el.cells[r] && el.cells[r][c]) || '';
      cell.style.borderColor = el.borderColor;
      if (isHead) { cell.style.background = el.headerFill; cell.style.color = '#fff'; }
      if (interactive) {
        cell.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          cell.setAttribute('contenteditable', 'true');
          cell.focus();
          const sel = window.getSelection(), range = document.createRange();
          range.selectNodeContents(cell); sel.removeAllRanges(); sel.addRange(range);
          const finish = () => {
            cell.removeAttribute('contenteditable');
            snapshot();
            if (!el.cells[r]) el.cells[r] = [];
            el.cells[r][c] = cell.innerText;
            markDirty(); renderThumb(current);
            cell.removeEventListener('blur', finish);
          };
          cell.addEventListener('blur', finish);
        });
      }
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  }
  return table;
}

function tableAddRow(d) {
  const el = selectedId && findEl(selectedId); if (!el || el.type !== 'table') return;
  snapshot();
  if (d > 0) { el.cells.push(new Array(el.cols).fill('')); el.rows++; }
  else if (el.rows > 1) { el.cells.pop(); el.rows--; }
  renderCanvas(); select(el.id); renderThumb(current); markDirty();
}
function tableAddCol(d) {
  const el = selectedId && findEl(selectedId); if (!el || el.type !== 'table') return;
  snapshot();
  if (d > 0) { el.cells.forEach(row => row.push('')); el.cols++; }
  else if (el.cols > 1) { el.cells.forEach(row => row.pop()); el.cols--; }
  renderCanvas(); select(el.id); renderThumb(current); markDirty();
}

/* ======================= Рисование (перо) ======================= */
function strokeToPath(pts) {
  if (!pts.length) return '';
  if (pts.length === 1) { const [x, y] = pts[0]; return `M ${x} ${y} L ${x + 0.01} ${y}`; }
  return 'M ' + pts.map(p => p[0] + ' ' + p[1]).join(' L ');
}
function buildInkSVG(strokes) {
  const svg = svgEl('svg', { viewBox: `0 0 ${CW} ${CH}`, width: CW, height: CH });
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
  (strokes || []).forEach(s => {
    svg.appendChild(svgEl('path', {
      d: strokeToPath(s.points), fill: 'none', stroke: s.color,
      'stroke-width': s.width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      opacity: s.tool === 'marker' ? 0.42 : 1
    }));
  });
  return svg;
}

/* ======================= Построение DOM объекта ======================= */
function buildElNode(el, { interactive } = {}) {
  const node = document.createElement('div');
  node.className = 'el el-' + el.type;
  node.dataset.id = el.id;
  node.style.left = el.x + 'px';
  node.style.top = el.y + 'px';
  node.style.width = el.w + 'px';
  node.style.height = el.h + 'px';

  if (el.type === 'text') {
    node.textContent = el.text;
    node.style.fontSize = el.fontSize + 'px';
    node.style.fontFamily = el.fontFamily;
    node.style.color = el.color;
    node.style.fontWeight = el.bold ? '700' : '400';
    node.style.fontStyle = el.italic ? 'italic' : 'normal';
    node.style.textDecoration = el.underline ? 'underline' : 'none';
    node.style.textAlign = el.align;
    node.style.lineHeight = '1.25';
    applyWordArt(node, el);
  } else if (el.type === 'rect') {
    node.style.background = el.fill;
    node.style.borderRadius = (el.radius || 0) + 'px';
    node.style.border = el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : 'none';
  } else if (el.type === 'ellipse') {
    node.style.background = el.fill;
    node.style.border = el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : 'none';
  } else if (el.type === 'line') {
    node.style.background = el.fill;
    node.style.borderRadius = '999px';
  } else if (SHAPES[el.type]) {
    const spec = SHAPES[el.type];
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible;pointer-events:none;';
    const shape = document.createElementNS(SVGNS, spec.d ? 'path' : 'polygon');
    if (spec.d) shape.setAttribute('d', spec.d);
    else shape.setAttribute('points', spec.points);
    shape.setAttribute('fill', el.fill);
    if (el.strokeWidth > 0) {
      shape.setAttribute('stroke', el.stroke);
      shape.setAttribute('stroke-width', el.strokeWidth);
      shape.setAttribute('vector-effect', 'non-scaling-stroke');
      shape.setAttribute('stroke-linejoin', 'round');
    }
    svg.appendChild(shape);
    node.appendChild(svg);
  } else if (el.type === 'image') {
    const img = document.createElement('img');
    img.src = el.src;
    node.appendChild(img);
  } else if (el.type === 'chart') {
    node.appendChild(renderChartSVG(el));
  } else if (el.type === 'icon') {
    const svg = svgEl('svg', { viewBox: '0 0 24 24', preserveAspectRatio: 'xMidYMid meet' });
    svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible;pointer-events:none;';
    svg.appendChild(svgEl('path', { d: ICONS[el.icon] || ICONS.star, fill: el.fill }));
    node.appendChild(svg);
  } else if (el.type === 'table') {
    node.appendChild(buildTableDOM(el, interactive));
  }

  if (interactive) {
    node.addEventListener('pointerdown', (e) => onElementPointerDown(e, el));
    if (el.type === 'text') {
      node.addEventListener('dblclick', () => startTextEdit(node, el));
    }
  }
  return node;
}

/* ======================= Рендер холста ======================= */
function renderCanvas() {
  [...canvas.querySelectorAll('.el')].forEach(n => n.remove());
  const oldInk = canvas.querySelector('#inkLayer'); if (oldInk) oldInk.remove();
  const slide = currentSlide();
  canvas.style.background = slide.background;
  slide.elements.forEach(el => canvas.appendChild(buildElNode(el, { interactive: true })));
  const ink = buildInkSVG(slide.strokes); ink.id = 'inkLayer';
  canvas.appendChild(ink);
  updateSelectionBox();
}

function fitCanvas() {
  const pad = 56;
  const s = Math.min(
    (canvasWrap.clientWidth - pad) / CW,
    (canvasWrap.clientHeight - pad) / CH,
    1.25
  );
  canvas.style.transform = `scale(${Math.max(s, 0.1)})`;
}

/* ======================= Выделение ======================= */
function select(id) {
  selectedId = id;
  renderPropsPanel();
  updateSelectionBox();
  syncToolbar();
  // подсветка не нужна — рамка делает работу
}

function updateSelectionBox() {
  const el = selectedId && findEl(selectedId);
  if (!el) { selectionBox.hidden = true; return; }
  selectionBox.hidden = false;
  selectionBox.style.left = el.x + 'px';
  selectionBox.style.top = el.y + 'px';
  selectionBox.style.width = el.w + 'px';
  selectionBox.style.height = el.h + 'px';
  // перенести рамку в конец, чтобы была поверх
  canvas.appendChild(selectionBox);
}

/* ======================= Перетаскивание и ресайз ======================= */
let drag = null;

function onElementPointerDown(e, el) {
  if (e.target.closest('[contenteditable="true"]')) return; // идёт правка текста
  e.stopPropagation();
  select(el.id);
  const start = toLogical(e.clientX, e.clientY);
  drag = { mode: 'move', el, startX: start.x, startY: start.y, ex: el.x, ey: el.y, moved: false };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

// хендлы ресайза
selectionBox.querySelectorAll('.handle').forEach(h => {
  h.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const el = findEl(selectedId);
    if (!el) return;
    const start = toLogical(e.clientX, e.clientY);
    drag = { mode: 'resize', handle: h.dataset.h, el,
      startX: start.x, startY: start.y,
      ex: el.x, ey: el.y, ew: el.w, eh: el.h, moved: false };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
});

function onPointerMove(e) {
  if (!drag) return;
  const p = toLogical(e.clientX, e.clientY);
  const dx = p.x - drag.startX, dy = p.y - drag.startY;
  if (!drag.moved) { snapshot(); drag.moved = true; }
  const el = drag.el;

  if (drag.mode === 'move') {
    el.x = Math.round(clamp(drag.ex + dx, -el.w + 40, CW - 40));
    el.y = Math.round(clamp(drag.ey + dy, -el.h + 40, CH - 40));
  } else {
    const h = drag.handle;
    let { ex, ey, ew, eh } = drag;
    if (h.includes('e')) ew = Math.max(MIN, drag.ew + dx);
    if (h.includes('s')) eh = Math.max(MIN, drag.eh + dy);
    if (h.includes('w')) { ew = Math.max(MIN, drag.ew - dx); ex = drag.ex + (drag.ew - ew); }
    if (h.includes('n')) { eh = Math.max(MIN, drag.eh - dy); ey = drag.ey + (drag.eh - eh); }
    el.x = Math.round(ex); el.y = Math.round(ey);
    el.w = Math.round(ew); el.h = Math.round(eh);
  }
  updateElNode(el);
  updateSelectionBox();
  markDirty();
}

function onPointerUp() {
  if (drag && drag.moved) {
    // диаграммы перерисовываем после ресайза (SVG зависит от размера)
    if (drag.mode === 'resize' && drag.el && drag.el.type === 'chart') {
      renderCanvas(); updateSelectionBox();
    }
    renderThumb(current); renderPropsPanel();
  }
  drag = null;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
}

function updateElNode(el) {
  const node = canvas.querySelector(`.el[data-id="${el.id}"]`);
  if (!node) return;
  node.style.left = el.x + 'px'; node.style.top = el.y + 'px';
  node.style.width = el.w + 'px'; node.style.height = el.h + 'px';
}

/* ======================= Правка текста ======================= */
function startTextEdit(node, el) {
  node.setAttribute('contenteditable', 'true');
  node.focus();
  // поставить курсор в конец
  const range = document.createRange();
  range.selectNodeContents(node); range.collapse(false);
  const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  selectionBox.hidden = true;

  const finish = () => {
    node.removeAttribute('contenteditable');
    snapshot();
    el.text = node.innerText;
    markDirty();
    renderThumb(current);
    updateSelectionBox();
    node.removeEventListener('blur', finish);
  };
  node.addEventListener('blur', finish);
}

/* ======================= Панель слайдов ======================= */
function renderSlidesList() {
  slidesList.innerHTML = '';
  deck.slides.forEach((slide, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'slide-thumb' + (i === current ? ' active' : '');
    thumb.dataset.index = i;

    const num = document.createElement('span');
    num.className = 'thumb-num'; num.textContent = i + 1;

    const del = document.createElement('button');
    del.className = 'thumb-del'; del.textContent = '×'; del.title = 'Удалить слайд';
    del.addEventListener('click', (e) => { e.stopPropagation(); deleteSlide(i); });

    const inner = document.createElement('div');
    inner.className = 'thumb-canvas';

    thumb.appendChild(inner);
    thumb.appendChild(num);
    thumb.appendChild(del);
    thumb.addEventListener('click', () => gotoSlide(i));
    slidesList.appendChild(thumb);
    paintThumbInner(inner, slide, thumb);
  });
}

function paintThumbInner(inner, slide, thumbEl) {
  inner.innerHTML = '';
  inner.style.width = CW + 'px';
  inner.style.height = CH + 'px';
  inner.style.background = slide.background;
  slide.elements.forEach(el => inner.appendChild(buildElNode(el, { interactive: false })));
  inner.appendChild(buildInkSVG(slide.strokes));
  requestAnimationFrame(() => {
    const s = thumbEl.clientWidth / CW;
    inner.style.transform = `scale(${s})`;
  });
}

function renderThumb(i) {
  const thumb = slidesList.children[i];
  if (!thumb) return;
  paintThumbInner(thumb.querySelector('.thumb-canvas'), deck.slides[i], thumb);
}

/* ======================= Операции со слайдами ======================= */
function gotoSlide(i) {
  current = clamp(i, 0, deck.slides.length - 1);
  selectedId = null;
  renderAll();
}

function addSlide() {
  snapshot();
  deck.slides.splice(current + 1, 0, newSlide());
  current += 1; selectedId = null;
  renderAll(); markDirty();
}

function duplicateSlide() {
  snapshot();
  const copy = clone(currentSlide());
  copy.id = uid();
  copy.elements.forEach(e => e.id = uid());
  deck.slides.splice(current + 1, 0, copy);
  current += 1; selectedId = null;
  renderAll(); markDirty();
}

function deleteSlide(i) {
  if (deck.slides.length === 1) { toast('Нельзя удалить единственный слайд'); return; }
  snapshot();
  deck.slides.splice(i, 1);
  if (current >= deck.slides.length) current = deck.slides.length - 1;
  selectedId = null;
  renderAll(); markDirty();
}

/* ======================= Добавление объектов ======================= */
function addElement(type, extra) {
  snapshot();
  const pos = { x: 140 + Math.random() * 60, y: 140 + Math.random() * 60, ...extra };
  const el = newElement(type, pos);
  currentSlide().elements.push(el);
  renderCanvas();
  select(el.id);
  renderThumb(current);
  markDirty();
}

async function addImage() {
  const res = await api.pickImage();
  if (res.canceled) return;
  addElement('image', { src: res.dataUrl });
}

function addChart() {
  addElement('chart', { chartType: 'bar' });
}
function addTable() {
  addElement('table');
}
function addIcon(name) {
  addElement('icon', { icon: name });
}
function addWordArt() {
  snapshot();
  const el = newElement('text', { x: 180, y: 260 });
  el.text = 'WordArt';
  el.fontSize = 96;
  el.bold = true;
  el.fontFamily = "Montserrat, sans-serif";
  el.w = 640; el.h = 160;
  el.wordartStyle = 'gold';
  currentSlide().elements.push(el);
  renderCanvas(); select(el.id); renderThumb(current); markDirty();
}

/* ======================= Панель свойств ======================= */
function renderPropsPanel() {
  const empty = $('#propsEmpty'), slideP = $('#propsSlide'), elP = $('#propsElement');
  const el = selectedId && findEl(selectedId);

  if (el) {
    empty.hidden = true; slideP.hidden = true; elP.hidden = false;
    const names = { text: 'Текст', rect: 'Прямоугольник', ellipse: 'Эллипс', image: 'Изображение',
      chart: 'Диаграмма', icon: 'Значок', table: 'Таблица' };
    SHAPE_MENU.forEach(([t, label]) => names[t] = label);
    $('#propsElType').textContent = (el.type === 'text' && el.wordartStyle && el.wordartStyle !== 'none')
      ? 'WordArt' : (names[el.type] || 'Фигура');
    $('#posX').value = el.x; $('#posY').value = el.y;
    $('#posW').value = el.w; $('#posH').value = el.h;
    $('#elAnim').value = el.anim || 'none';

    const fillBlock = elP.querySelector('.prop-fill');
    const textBlock = elP.querySelector('.prop-text');
    const chartBlock = elP.querySelector('.prop-chart');
    const tableBlock = elP.querySelector('.prop-table');
    fillBlock.hidden = true; textBlock.hidden = true; chartBlock.hidden = true; tableBlock.hidden = true;
    if (el.type === 'text') {
      textBlock.hidden = false;
      $('#elTextColor').value = el.color;
      $('#elWordart').value = el.wordartStyle || 'none';
    } else if (el.type === 'image') {
      // без заливки
    } else if (el.type === 'chart') {
      chartBlock.hidden = false;
      $('#chartType').value = el.chartType;
      $('#chartTitle').value = el.title;
      $('#chartData').value = el.labels.map((l, i) => `${l}, ${el.values[i]}`).join('\n');
    } else if (el.type === 'table') {
      tableBlock.hidden = false;
      $('#tableFont').value = el.fontSize;
      $('#tableHeader').checked = el.header;
      $('#tableHeaderFill').value = el.headerFill;
      $('#tableBorder').value = rgbToHex(el.borderColor);
      $('#tableText').value = rgbToHex(el.textColor);
    } else if (el.type === 'icon') {
      fillBlock.hidden = false;
      $('#elFill').value = el.fill;
      $('#elStroke').value = el.stroke || '#000000';
      $('#elStrokeW').value = 0;
    } else {
      fillBlock.hidden = false;
      $('#elFill').value = el.fill;
      $('#elStroke').value = el.stroke;
      $('#elStrokeW').value = el.strokeWidth;
    }
  } else {
    empty.hidden = false; slideP.hidden = false; elP.hidden = true;
    $('#slideBg').value = rgbToHex(currentSlide().background);
    $('#slideTransition').value = currentSlide().transition || 'none';
  }
}

function rgbToHex(c) {
  if (!c) return '#ffffff';
  if (c[0] === '#') return c.length === 4
    ? '#' + [...c.slice(1)].map(x => x + x).join('') : c;
  const m = c.match(/\d+/g);
  if (!m) return '#ffffff';
  return '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
}

/* ======================= Синхронизация тулбара ======================= */
function syncToolbar() {
  const el = selectedId && findEl(selectedId);
  const isText = el && el.type === 'text';
  ['bold', 'italic', 'underline'].forEach(f => {
    const btn = document.querySelector(`[data-fmt="${f}"]`);
    btn.classList.toggle('on', !!(isText && el[f]));
  });
  if (isText) {
    $('#fontFamily').value = el.fontFamily;
    $('#fontSize').value = el.fontSize;
  }
}

/* ======================= Полный рендер ======================= */
function renderAll() {
  fitCanvas();
  renderCanvas();
  renderSlidesList();
  renderPropsPanel();
  syncToolbar();
  $('#slideCounter').textContent = `Слайд ${current + 1} / ${deck.slides.length}`;
  $('#docTitle').value = deck.title;
}

/* ======================= Экспорт / режим показа — разметка слайда ======================= */
function slidePageHTML(slide) {
  const holder = document.createElement('div');
  holder.style.cssText = `position:relative;width:${CW}px;height:${CH}px;background:${slide.background};overflow:hidden;`;
  slide.elements.forEach(el => holder.appendChild(buildElNode(el, { interactive: false })));
  holder.appendChild(buildInkSVG(slide.strokes));
  return holder.outerHTML;
}

function buildExportHTML() {
  const pages = deck.slides.map(s => `
    <div class="page">${slidePageHTML(s)}</div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">
  <style>
    @page { size: ${CW}px ${CH}px; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }
    html,body { background:#fff; }
    .page { width:${CW}px; height:${CH}px; page-break-after: always; position:relative; overflow:hidden; }
    .page:last-child { page-break-after: auto; }
    .el { position:absolute; box-sizing:border-box; }
    .el.el-text { padding:6px 10px; white-space:pre-wrap; word-break:break-word; line-height:1.25; }
    .el.el-image img { width:100%; height:100%; object-fit:contain; display:block; }
  </style></head><body>${pages}</body></html>`;
}

async function exportPdf() {
  toast('Готовлю PDF…');
  const res = await api.exportPdf({ html: buildExportHTML(), defaultName: deck.title || 'Презентация' });
  if (res.canceled) return;
  if (res.error) { toast('Ошибка экспорта'); console.error(res.error); return; }
  toast('PDF сохранён');
}

/* ======================= Режим показа ======================= */
let presentIndex = 0;
function startPresent() {
  presentIndex = current;
  $('#presentOverlay').hidden = false;
  renderPresentSlide();
  window.addEventListener('keydown', presentKeys);
  window.addEventListener('resize', renderPresentSlide);
}
function stopPresent() {
  $('#presentOverlay').hidden = true;
  window.removeEventListener('keydown', presentKeys);
  window.removeEventListener('resize', renderPresentSlide);
}
function renderPresentSlide() {
  const stage = $('#presentStage');
  const slide = deck.slides[presentIndex];
  const s = Math.min(window.innerWidth / CW, window.innerHeight / CH);
  stage.style.width = CW + 'px';
  stage.style.height = CH + 'px';
  stage.style.transform = `scale(${s})`;
  stage.style.background = slide.background;
  stage.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'present-inner';
  stage.appendChild(inner);
  void inner.offsetWidth; // перезапуск анимации перехода

  let trans = slide.transition || 'none';
  if (trans === 'random') {
    const pool = ['fade', 'dissolve', 'slide', 'slide-up', 'push', 'cover', 'wipe',
      'flash', 'zoom', 'zoomin', 'rotate', 'cube', 'flip', 'gallery', 'fall', 'vortex'];
    trans = pool[Math.floor(Math.random() * pool.length)];
  }
  if (trans !== 'none') inner.classList.add('trans-' + trans);

  slide.elements.forEach((el, i) => {
    const node = buildElNode(el, { interactive: false });
    const a = el.anim || 'none';
    if (a !== 'none') {
      node.classList.add('anim-' + a);
      node.style.animationDelay = (0.15 + i * 0.12).toFixed(2) + 's';
    }
    inner.appendChild(node);
  });
  inner.appendChild(buildInkSVG(slide.strokes));
}
function presentKeys(e) {
  if (e.key === 'Escape') return stopPresent();
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
    if (presentIndex < deck.slides.length - 1) { presentIndex++; renderPresentSlide(); }
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (presentIndex > 0) { presentIndex--; renderPresentSlide(); }
  }
}

/* ======================= Рисование: состояние и действия ======================= */
let drawMode = false;
let drawTool = 'pencil';     // pencil | marker | eraser
let drawColor = '#E8833A';
let drawWidth = 5;
let curStroke = null;
let curPath = null;
let erasing = false;
let drawSnapTaken = false;

function toggleDrawMode(on) {
  drawMode = on;
  $('#btnDraw').classList.toggle('on', on);
  $('#drawToolbar').hidden = !on;
  const cap = $('#drawCapture');
  cap.classList.toggle('active', on);
  if (on) { select(null); } // снять выделение
  selectionBox.hidden = true;
}

function setDrawTool(tool) {
  drawTool = tool;
  document.querySelectorAll('.draw-tool').forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
  $('#drawCapture').style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
}

function inkPointerDown(e) {
  if (!drawMode) return;
  e.preventDefault(); e.stopPropagation();
  const slide = currentSlide();
  if (!slide.strokes) slide.strokes = [];
  const p = toLogical(e.clientX, e.clientY);
  drawSnapTaken = false;
  if (drawTool === 'eraser') {
    snapshot();
    erasing = true;
    eraseAt(p.x, p.y);
  } else {
    snapshot(); drawSnapTaken = true;
    curStroke = { id: uid(), tool: drawTool, color: drawColor, width: drawWidth, points: [[Math.round(p.x), Math.round(p.y)]] };
    slide.strokes.push(curStroke);
    const ink = canvas.querySelector('#inkLayer');
    curPath = svgEl('path', {
      d: strokeToPath(curStroke.points), fill: 'none', stroke: curStroke.color,
      'stroke-width': curStroke.width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      opacity: curStroke.tool === 'marker' ? 0.42 : 1
    });
    if (ink) ink.appendChild(curPath);
  }
  $('#drawCapture').setPointerCapture(e.pointerId);
}

function inkPointerMove(e) {
  if (!drawMode) return;
  const p = toLogical(e.clientX, e.clientY);
  if (erasing) { eraseAt(p.x, p.y); return; }
  if (!curStroke) return;
  curStroke.points.push([Math.round(p.x), Math.round(p.y)]);
  if (curPath) curPath.setAttribute('d', strokeToPath(curStroke.points));
}

function inkPointerUp() {
  if (curStroke) { renderThumb(current); markDirty(); }
  if (erasing) { renderThumb(current); markDirty(); }
  curStroke = null; curPath = null; erasing = false;
}

function eraseAt(x, y) {
  const slide = currentSlide();
  if (!slide.strokes || !slide.strokes.length) return;
  const before = slide.strokes.length;
  slide.strokes = slide.strokes.filter(s => {
    const thr = (s.width / 2) + 10;
    return !s.points.some(pt => Math.hypot(pt[0] - x, pt[1] - y) <= thr);
  });
  if (slide.strokes.length !== before) {
    if (!drawSnapTaken) { /* снимок уже должен быть */ }
    renderCanvas();
    markDirty();
  }
}

function clearSlideInk() {
  const slide = currentSlide();
  if (!slide.strokes || !slide.strokes.length) return;
  snapshot();
  slide.strokes = [];
  renderCanvas(); renderThumb(current); markDirty();
  toast('Рисунки удалены со слайда');
}

function buildDrawColors() {
  const colors = ['#E8833A', '#1a1a1a', '#ffffff', '#e34948', '#2a78d6', '#1baf7a', '#eda100', '#6250d6'];
  const box = $('#drawColors');
  colors.forEach((c, i) => {
    const sw = document.createElement('div');
    sw.className = 'dsw' + (i === 0 ? ' on' : '');
    sw.style.background = c; sw.title = c;
    sw.addEventListener('click', () => {
      drawColor = c;
      document.querySelectorAll('.draw-colors .dsw').forEach(s => s.classList.remove('on'));
      sw.classList.add('on');
      $('#drawColorPick').value = c;
      if (drawTool === 'eraser') setDrawTool('pencil');
    });
    box.appendChild(sw);
  });
}

/* ======================= Сохранение / открытие ======================= */
async function saveProject() {
  const res = await api.saveProject({ data: deck, currentPath: projectPath });
  if (res.canceled) return;
  projectPath = res.filePath;
  markDirty(false);
  toast('Сохранено');
}
async function openProject() {
  const res = await api.openProject();
  if (res.canceled) return;
  deck = res.data; projectPath = res.filePath;
  current = 0; selectedId = null;
  history.length = 0; future.length = 0;
  renderAll(); markDirty(false);
  toast('Открыто');
}
function newProject() {
  deck = { title: 'Без названия', slides: [newSlide()] };
  current = 0; selectedId = null; projectPath = null;
  history.length = 0; future.length = 0;
  renderAll(); markDirty(false);
}

/* ======================= Привязка UI ======================= */
function bindUI() {
  // тулбар — добавление объектов
  document.querySelectorAll('[data-add]').forEach(b =>
    b.addEventListener('click', () => addElement(b.dataset.add)));
  $('#btnAddImage').addEventListener('click', addImage);
  $('#btnAddChart').addEventListener('click', addChart);
  $('#btnAddTable').addEventListener('click', addTable);
  $('#btnWordArt').addEventListener('click', addWordArt);
  $('#btnAddSlide').addEventListener('click', addSlide);

  // меню «Значки»
  buildIconsMenu();
  $('#btnIcons').addEventListener('click', (e) => {
    e.stopPropagation();
    const m = $('#iconsMenu'); m.hidden = !m.hidden;
  });
  document.addEventListener('click', (e) => {
    const m = $('#iconsMenu');
    if (!m.hidden && !e.target.closest('#btnIcons') && !e.target.closest('#iconsMenu')) m.hidden = true;
  });

  // WordArt-стиль текста
  $('#elWordart').addEventListener('change', e => {
    const el = selectedId && findEl(selectedId); if (!el || el.type !== 'text') return;
    snapshot(); el.wordartStyle = e.target.value;
    renderCanvas(); select(el.id); renderThumb(current); markDirty();
  });

  // таблица
  $('#tblRowPlus').addEventListener('click', () => tableAddRow(1));
  $('#tblRowMinus').addEventListener('click', () => tableAddRow(-1));
  $('#tblColPlus').addEventListener('click', () => tableAddCol(1));
  $('#tblColMinus').addEventListener('click', () => tableAddCol(-1));
  const tblSet = (id, key, isColor) => $(id).addEventListener('input', e => {
    const el = selectedId && findEl(selectedId); if (!el || el.type !== 'table') return;
    el[key] = isColor === 'num' ? (parseInt(e.target.value) || 16)
      : (isColor === 'bool' ? e.target.checked : e.target.value);
    renderCanvas(); select(el.id); renderThumb(current); markDirty();
  });
  tblSet('#tableFont', 'fontSize', 'num');
  tblSet('#tableHeader', 'header', 'bool');
  tblSet('#tableHeaderFill', 'headerFill', 'color');
  tblSet('#tableBorder', 'borderColor', 'color');
  tblSet('#tableText', 'textColor', 'color');

  // рисование пером
  buildDrawColors();
  $('#btnDraw').addEventListener('click', () => toggleDrawMode(!drawMode));
  document.querySelectorAll('.draw-tool').forEach(b =>
    b.addEventListener('click', () => setDrawTool(b.dataset.tool)));
  $('#drawColorPick').addEventListener('input', e => {
    drawColor = e.target.value;
    document.querySelectorAll('.draw-colors .dsw').forEach(s => s.classList.remove('on'));
    if (drawTool === 'eraser') setDrawTool('pencil');
  });
  $('#drawWidth').addEventListener('input', e => {
    drawWidth = parseInt(e.target.value) || 5;
    $('#drawWidthVal').textContent = drawWidth;
  });
  $('#drawClear').addEventListener('click', clearSlideInk);
  $('#drawDone').addEventListener('click', () => toggleDrawMode(false));
  const cap = $('#drawCapture');
  cap.addEventListener('pointerdown', inkPointerDown);
  cap.addEventListener('pointermove', inkPointerMove);
  cap.addEventListener('pointerup', inkPointerUp);
  cap.addEventListener('pointercancel', inkPointerUp);

  // редактор диаграммы
  $('#chartType').addEventListener('change', e => {
    const el = selectedId && findEl(selectedId); if (!el || el.type !== 'chart') return;
    snapshot(); el.chartType = e.target.value;
    renderCanvas(); select(el.id); renderThumb(current); markDirty();
  });
  $('#chartTitle').addEventListener('input', e => {
    const el = selectedId && findEl(selectedId); if (!el || el.type !== 'chart') return;
    el.title = e.target.value;
    renderCanvas(); updateSelectionBox(); renderThumb(current); markDirty();
  });
  $('#chartData').addEventListener('input', e => {
    const el = selectedId && findEl(selectedId); if (!el || el.type !== 'chart') return;
    const rows = e.target.value.split('\n').map(r => r.trim()).filter(Boolean);
    const labels = [], values = [];
    rows.forEach(r => {
      const idx = r.lastIndexOf(',');
      if (idx === -1) { labels.push(r); values.push(0); }
      else { labels.push(r.slice(0, idx).trim()); values.push(parseFloat(r.slice(idx + 1)) || 0); }
    });
    if (!labels.length) return;
    el.labels = labels; el.values = values;
    renderCanvas(); updateSelectionBox(); renderThumb(current); markDirty();
  });

  // меню «Фигуры»
  buildShapesMenu();
  $('#btnShapes').addEventListener('click', (e) => {
    e.stopPropagation();
    const m = $('#shapesMenu'); m.hidden = !m.hidden;
  });
  document.addEventListener('click', (e) => {
    const m = $('#shapesMenu');
    if (!m.hidden && !e.target.closest('.shapes-wrap')) m.hidden = true;
  });

  // верхние кнопки
  $('#btnOpen').addEventListener('click', openProject);
  $('#btnSave').addEventListener('click', saveProject);
  $('#btnExport').addEventListener('click', exportPdf);
  $('#btnPresent').addEventListener('click', startPresent);

  // заголовок документа
  $('#docTitle').addEventListener('input', e => { deck.title = e.target.value; markDirty(); });

  // форматирование текста
  document.querySelectorAll('[data-fmt]').forEach(b =>
    b.addEventListener('click', () => {
      const el = selectedId && findEl(selectedId);
      if (!el || el.type !== 'text') return;
      snapshot();
      el[b.dataset.fmt] = !el[b.dataset.fmt];
      renderCanvas(); select(el.id); renderThumb(current); markDirty();
    }));
  document.querySelectorAll('[data-align]').forEach(b =>
    b.addEventListener('click', () => {
      const el = selectedId && findEl(selectedId);
      if (!el || el.type !== 'text') return;
      snapshot(); el.align = b.dataset.align;
      renderCanvas(); select(el.id); renderThumb(current); markDirty();
    }));
  $('#fontFamily').addEventListener('change', e => applyText('fontFamily', e.target.value));
  $('#fontSize').addEventListener('change', e => applyText('fontSize', parseInt(e.target.value) || 32));

  // панель свойств — геометрия
  const geo = (id, key) => $(id).addEventListener('change', e => {
    const el = selectedId && findEl(selectedId); if (!el) return;
    snapshot(); el[key] = Math.round(parseFloat(e.target.value) || 0);
    renderCanvas(); select(el.id); renderThumb(current); markDirty();
  });
  geo('#posX', 'x'); geo('#posY', 'y'); geo('#posW', 'w'); geo('#posH', 'h');

  // заливка/контур/текст
  $('#elFill').addEventListener('input', e => applyEl('fill', e.target.value));
  $('#elStroke').addEventListener('input', e => applyEl('stroke', e.target.value));
  $('#elStrokeW').addEventListener('change', e => applyEl('strokeWidth', parseInt(e.target.value) || 0));
  $('#elTextColor').addEventListener('input', e => applyEl('color', e.target.value));

  // фон слайда
  $('#slideBg').addEventListener('input', e => {
    snapshot(); currentSlide().background = e.target.value;
    renderCanvas(); renderThumb(current); markDirty();
  });
  $('#slideTransition').addEventListener('change', e => {
    snapshot(); currentSlide().transition = e.target.value; markDirty();
  });
  $('#btnTransAll').addEventListener('click', () => {
    snapshot();
    const t = currentSlide().transition || 'none';
    deck.slides.forEach(s => s.transition = t);
    markDirty();
    toast('Переход применён ко всем слайдам');
  });
  $('#elAnim').addEventListener('change', e => {
    const el = selectedId && findEl(selectedId); if (!el) return;
    snapshot(); el.anim = e.target.value; markDirty();
  });
  buildBgSwatches();

  // действия над объектом
  $('#btnDup').addEventListener('click', () => {
    const el = selectedId && findEl(selectedId); if (!el) return;
    snapshot();
    const copy = clone(el); copy.id = uid(); copy.x += 24; copy.y += 24;
    currentSlide().elements.push(copy);
    renderCanvas(); select(copy.id); renderThumb(current); markDirty();
  });
  $('#btnFront').addEventListener('click', () => reorder(1));
  $('#btnBack').addEventListener('click', () => reorder(-1));
  $('#btnDelEl').addEventListener('click', deleteSelected);

  // клик по пустому холсту — снять выделение
  canvas.addEventListener('pointerdown', (e) => {
    if (e.target === canvas) { select(null); }
  });

  // режим показа
  $('#presentHint');

  // мост с меню приложения
  api.onMenu('menu:new', newProject);
  api.onMenu('menu:open', openProject);
  api.onMenu('menu:save', saveProject);
  api.onMenu('menu:export-pdf', exportPdf);
  api.onMenu('menu:present', startPresent);
  api.onMenu('menu:delete-slide', () => deleteSlide(current));

  window.addEventListener('resize', () => { fitCanvas(); renderSlidesList(); });
  window.addEventListener('keydown', onKeydown);
}

function applyText(key, val) {
  const el = selectedId && findEl(selectedId);
  if (!el || el.type !== 'text') return;
  snapshot(); el[key] = val;
  renderCanvas(); select(el.id); renderThumb(current); markDirty();
}
function applyEl(key, val) {
  const el = selectedId && findEl(selectedId); if (!el) return;
  el[key] = val;
  renderCanvas(); select(el.id); renderThumb(current); markDirty();
}
function reorder(dir) {
  const el = selectedId && findEl(selectedId); if (!el) return;
  const arr = currentSlide().elements;
  const i = arr.indexOf(el);
  snapshot();
  if (dir > 0) { arr.splice(i, 1); arr.push(el); }
  else { arr.splice(i, 1); arr.unshift(el); }
  renderCanvas(); select(el.id); renderThumb(current); markDirty();
}
function deleteSelected() {
  const el = selectedId && findEl(selectedId); if (!el) return;
  snapshot();
  const arr = currentSlide().elements;
  arr.splice(arr.indexOf(el), 1);
  selectedId = null;
  renderCanvas(); renderPropsPanel(); renderThumb(current); markDirty();
}

function shapeIconSVG(type) {
  if (type === 'line')
    return '<svg viewBox="0 0 100 100"><line x1="14" y1="82" x2="86" y2="18" stroke="#E8833A" stroke-width="13" stroke-linecap="round"/></svg>';
  const spec = SHAPES[type];
  const inner = spec.d ? `<path d="${spec.d}" fill="#E8833A"/>` : `<polygon points="${spec.points}" fill="#E8833A"/>`;
  return `<svg viewBox="0 0 100 100">${inner}</svg>`;
}

function buildIconsMenu() {
  const menu = $('#iconsMenu');
  menu.style.gridTemplateColumns = 'repeat(6, 42px)';
  ICON_MENU.forEach(([name, label]) => {
    const b = document.createElement('button');
    b.className = 'shape-btn'; b.title = label;
    b.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ICONS[name]}" fill="#E8833A"/></svg>`;
    b.addEventListener('click', () => { addIcon(name); menu.hidden = true; });
    menu.appendChild(b);
  });
}

function buildShapesMenu() {
  const menu = $('#shapesMenu');
  SHAPE_MENU.forEach(([type, label]) => {
    const b = document.createElement('button');
    b.className = 'shape-btn'; b.title = label;
    b.innerHTML = shapeIconSVG(type);
    b.addEventListener('click', () => { addElement(type); menu.hidden = true; });
    menu.appendChild(b);
  });
}

function buildBgSwatches() {
  const colors = ['#ffffff', '#1c1512', '#241a15', '#E8833A', '#C9622A', '#2b4a6f', '#1f6f54', '#6f1f3a', '#f3e9e2'];
  const box = $('#bgSwatches');
  colors.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'sw'; sw.style.background = c; sw.title = c;
    sw.addEventListener('click', () => {
      snapshot(); currentSlide().background = c;
      renderCanvas(); renderThumb(current); renderPropsPanel(); markDirty();
    });
    box.appendChild(sw);
  });
}

/* ======================= Горячие клавиши ======================= */
function onKeydown(e) {
  if (!$('#presentOverlay').hidden) return; // в режиме показа свои клавиши
  if (drawMode) { if (e.key === 'Escape') toggleDrawMode(false); return; }
  const editing = document.activeElement &&
    (document.activeElement.isContentEditable ||
     ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName));

  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'z' && !editing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() === 'y' && !editing) { e.preventDefault(); redo(); return; }
  if (mod && e.key.toLowerCase() === 'd' && !editing) { e.preventDefault(); duplicateSlide(); return; }

  if (editing) return;

  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); deleteSelected(); return; }
  if (e.key === 'Escape') { select(null); return; }

  // стрелки — двигать объект
  if (selectedId && e.key.startsWith('Arrow')) {
    e.preventDefault();
    const el = findEl(selectedId); if (!el) return;
    const step = e.shiftKey ? 20 : 2;
    if (e.key === 'ArrowLeft') el.x -= step;
    if (e.key === 'ArrowRight') el.x += step;
    if (e.key === 'ArrowUp') el.y -= step;
    if (e.key === 'ArrowDown') el.y += step;
    updateElNode(el); updateSelectionBox(); markDirty();
  }
}

/* ======================= Стартовая презентация ======================= */
function demoDeck() {
  const title = newSlide('#1c1512');
  title.transition = 'fade';
  title.elements = [
    { id: uid(), type: 'rect', x: 0, y: 560, w: 1280, h: 10, fill: '#E8833A', stroke: '#E8833A', strokeWidth: 0, radius: 0, anim: 'fade' },
    { id: uid(), type: 'text', x: 110, y: 230, w: 900, h: 160, text: 'Slidepar',
      fontSize: 120, fontFamily: "Montserrat, sans-serif", color: '#ffb871',
      bold: true, italic: false, underline: false, align: 'left', anim: 'fly-up' },
    { id: uid(), type: 'text', x: 118, y: 390, w: 900, h: 80, text: 'Создавайте презентации красиво и быстро',
      fontSize: 34, fontFamily: "Inter, system-ui, sans-serif", color: '#f3e9e2',
      bold: false, italic: false, underline: false, align: 'left', anim: 'fade' }
  ];

  const second = newSlide('#ffffff');
  second.transition = 'slide';
  second.elements = [
    { id: uid(), type: 'text', x: 90, y: 70, w: 900, h: 90, text: 'С чего начать',
      fontSize: 56, fontFamily: "Playfair Display, serif", color: '#C9622A',
      bold: true, italic: false, underline: false, align: 'left', anim: 'fly-left' },
    { id: uid(), type: 'text', x: 90, y: 210, w: 1000, h: 360,
      text: '•  Добавляйте текст, фигуры и изображения из панели инструментов\n\n•  Двигайте и меняйте размер объектов мышью\n\n•  Нажмите «▶ Показ» для демонстрации\n\n•  Экспортируйте всё в PDF одной кнопкой',
      fontSize: 30, fontFamily: "Inter, system-ui, sans-serif", color: '#333333',
      bold: false, italic: false, underline: false, align: 'left', anim: 'fade' },
    { id: uid(), type: 'ellipse', x: 980, y: 430, w: 180, h: 180, fill: '#E8833A', stroke: '#C9622A', strokeWidth: 0, anim: 'pop' }
  ];

  return { title: 'Добро пожаловать в Slidepar', slides: [title, second] };
}

/* ======================= Инициализация ======================= */
function init() {
  deck = demoDeck();
  bindUI();
  renderAll();
  markDirty(false);
}
init();
