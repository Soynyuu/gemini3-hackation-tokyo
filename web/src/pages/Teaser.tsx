import { useState, useEffect, useRef, createContext, useContext } from 'react';

type Lang = 'ja' | 'en';

const LangContext = createContext<{ lang: Lang; toggle: () => void }>({
  lang: 'ja',
  toggle: () => { },
});

function useLang() {
  return useContext(LangContext);
}

function t(ja: string, en: string) {
  return { ja, en };
}

const VIBE_WORDS = {
  ja: [
    '孤高の塔に差す朝焼け',
    'ネオン横丁の残響',
    '枯山水、ただし重力なし',
    '溶けかけの記憶装置',
    '深海に沈んだ祝祭',
  ],
  en: [
    'Dawn breaking on a solitary tower',
    'Echoes of a neon alley',
    'Zen garden, but without gravity',
    'A half-melted memory device',
    'A festival sunken in the deep sea',
  ],
};

const ROTATING_ROLES = {
  ja: ['ディレクター', 'アーキテクト', 'キュレーター', 'コンポーザー'],
  en: ['Director', 'Architect', 'Curator', 'Composer'],
};

const TEXT = {
  badge: t('Gemini3 Hackathon Tokyo', 'Gemini3 Hackathon Tokyo'),
  heroDesc: {
    ja: (role: React.ReactNode) => (
      <>
        AIが{role}になり、
        <br className="hidden sm:block" />
        人間がその「バイブス」を<span className="text-white font-semibold">建築</span>する。
      </>
    ),
    en: (role: React.ReactNode) => (
      <>
        The AI becomes the {role},
        <br className="hidden sm:block" />
        and humans <span className="text-white font-semibold">build</span> its vibes.
      </>
    ),
  },
  conceptLabel: t('The Concept', 'The Concept'),
  conceptTitle: {
    ja: (
      <>
        LLMが指示し、
        <br />
        <span className="text-cyber-accent">人間</span>が構築する
      </>
    ),
    en: (
      <>
        The LLM directs.
        <br />
        <span className="text-cyber-accent">Humans</span> build.
      </>
    ),
  },
  conceptP1: {
    ja: (
      <>
        普段、私たちはAIに言葉で指示を出す。
        <br />
        このゲームでは、その関係が<span className="text-white font-semibold">逆転</span>する。
      </>
    ),
    en: (
      <>
        Normally, we give instructions to AI with words.
        <br />
        In this game, that relationship is <span className="text-white font-semibold">reversed</span>.
      </>
    ),
  },
  conceptP2: t(
    'AIディレクターが提示するのは、言語化しにくい抽象的な「バイブス」。あなたはそれを感知し、3Dボクセルの彫刻として解釈する。正解は一つではない。感性が問われるのは、あなたの方だ。',
    'The AI director presents abstract "vibes" that resist verbalisation. You sense them and interpret them as 3D voxel sculptures. There is no single correct answer. It is your sensibility that is being tested.',
  ),
  howLabel: t('How it works', 'How it works'),
  howTitle: {
    ja: (
      <>
        <span className="text-cyber-primary">120</span>秒の感性チャレンジ
      </>
    ),
    en: (
      <>
        A <span className="text-cyber-primary">120</span>-second sensibility challenge
      </>
    ),
  },
  steps: [
    {
      title: t('受信', 'Receive'),
      subtitle: t('Receive', 'Receive'),
      desc: t(
        'AIディレクターが秘密の3D構造を生成し、抽象的な「バイブス」だけをあなたに伝える。',
        'The AI director generates a secret 3D structure and conveys only an abstract "vibe" to you.',
      ),
    },
    {
      title: t('構築', 'Build'),
      subtitle: t('Build', 'Build'),
      desc: t(
        '制限時間120秒。5x5x5のボクセルグリッド上に、感じ取ったバイブスを形にする。',
        '120 seconds on the clock. Shape the vibes you sense on a 5x5x5 voxel grid.',
      ),
    },
    {
      title: t('解析', 'Reveal'),
      subtitle: t('Reveal', 'Reveal'),
      desc: t(
        'ディレクターの理想とあなたの構築を並べ、構造一致とバイブス適合度をAIが評価する。',
        "Your build is placed side by side with the director's ideal. The AI scores structural match and vibe compatibility.",
      ),
    },
  ],
  vibeLabel: t('Vibe Transmission', 'Vibe Transmission'),
  vibeDesc: t('AIディレクターが送信するバイブスの一例:', 'Sample vibes transmitted by the AI director:'),
  ctaTitle: {
    ja: (
      <>
        感性の<span className="text-cyber-primary">逆転</span>を、
        <br />
        体験せよ。
      </>
    ),
    en: (
      <>
        Experience the
        <br />
        <span className="text-cyber-primary">inversion</span> of sensibility.
      </>
    ),
  },
  ctaDesc: t('LLMがVibeコーディングするために、\n人間が働く世界へようこそ。', 'Welcome to a world where humans work\nso that LLMs can vibe-code.'),
  ctaButton: t('接続を開始する', 'Initiate Connection'),
};

function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 z-50 px-3 py-1.5 rounded-full border border-cyber-border bg-cyber-surface/80 backdrop-blur-sm font-mono text-xs tracking-wider text-cyber-muted hover:text-cyber-primary hover:border-cyber-primary/50 transition-colors"
    >
      {lang === 'ja' ? 'EN' : 'JA'}
    </button>
  );
}

function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchChars = '01_/\\|<>[]{}#$%&@!?~';
    let timeout: ReturnType<typeof setTimeout>;

    const glitch = () => {
      setIsGlitching(true);
      let iterations = 0;
      const maxIterations = 8;
      const interval = setInterval(() => {
        setDisplay(
          text
            .split('')
            .map((char, i) => {
              if (char === ' ' || char === '\n') return char;
              if (i < iterations) return text[i];
              return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            })
            .join(''),
        );
        iterations += 1;
        if (iterations > maxIterations + text.length) {
          clearInterval(interval);
          setDisplay(text);
          setIsGlitching(false);
        }
      }, 40);

      return () => clearInterval(interval);
    };

    const scheduleGlitch = () => {
      timeout = setTimeout(
        () => {
          glitch();
          scheduleGlitch();
        },
        4000 + Math.random() * 3000,
      );
    };

    scheduleGlitch();
    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <span className={`${className} ${isGlitching ? 'text-cyber-accent' : ''} transition-colors duration-100`}>
      {display}
    </span>
  );
}

function VibeStream() {
  const { lang } = useLang();
  const words = VIBE_WORDS[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % words.length);
        setFade(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="h-8 overflow-hidden">
      <span
        className={`font-mono text-cyber-primary transition-all duration-400 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
      >
        &gt; {words[currentIndex]}
      </span>
    </div>
  );
}

function RoleRotator() {
  const { lang } = useLang();
  const roles = ROTATING_ROLES[lang];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % roles.length);
        setFade(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <span
      className={`inline-block text-cyber-accent transition-all duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
    >
      {roles[index]}
    </span>
  );
}

function VoxelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#FF6B00', '#52525B', '#0891B2', '#E5E7EB', '#26282E'];
    const voxels: { x: number; y: number; z: number; color: string; delay: number }[] = [];

    for (let i = 0; i < 20; i++) {
      voxels.push({
        x: Math.floor(Math.random() * 5),
        y: Math.floor(Math.random() * 5),
        z: Math.floor(Math.random() * 5),
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2000,
      });
    }

    let animId: number;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const cellSize = 18;
      const isoX = (x: number, z: number) => (x - z) * cellSize * 0.866;
      const isoY = (x: number, y: number, z: number) => (x + z) * cellSize * 0.5 - y * cellSize;

      const sorted = [...voxels].sort((a, b) => {
        const da = a.x + a.z - a.y;
        const db = b.x + b.z - b.y;
        return da - db;
      });

      for (const v of sorted) {
        const elapsed = (time - v.delay) % 4000;
        if (elapsed < 0) continue;
        const progress = Math.min(elapsed / 800, 1);
        const alpha = progress * (0.5 + 0.3 * Math.sin(time / 1000 + v.x + v.z));

        const px = cx + isoX(v.x - 2, v.z - 2);
        const py = cy + isoY(v.x - 2, v.y - 2, v.z - 2);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = v.color;
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 1;

        const s = cellSize * 0.8;
        const topPath = new Path2D();
        topPath.moveTo(px, py - s * 0.5);
        topPath.lineTo(px + s * 0.866, py);
        topPath.lineTo(px, py + s * 0.5);
        topPath.lineTo(px - s * 0.866, py);
        topPath.closePath();

        ctx.fillStyle = v.color + '88';
        ctx.fill(topPath);
        ctx.stroke(topPath);

        const leftPath = new Path2D();
        leftPath.moveTo(px - s * 0.866, py);
        leftPath.lineTo(px, py + s * 0.5);
        leftPath.lineTo(px, py + s * 1.2);
        leftPath.lineTo(px - s * 0.866, py + s * 0.7);
        leftPath.closePath();

        ctx.fillStyle = v.color + '44';
        ctx.fill(leftPath);
        ctx.stroke(leftPath);

        const rightPath = new Path2D();
        rightPath.moveTo(px + s * 0.866, py);
        rightPath.lineTo(px, py + s * 0.5);
        rightPath.lineTo(px, py + s * 1.2);
        rightPath.lineTo(px + s * 0.866, py + s * 0.7);
        rightPath.closePath();

        ctx.fillStyle = v.color + '66';
        ctx.fill(rightPath);
        ctx.stroke(rightPath);
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="w-[280px] h-[280px]" />;
}

function FlowDiagram() {
  return (
    <div className="flex items-center justify-center gap-3 font-mono text-sm">
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-lg bg-cyber-secondary/20 border border-cyber-secondary/50 flex items-center justify-center text-2xl">
          AI
        </div>
        <span className="text-cyber-secondary text-xs">LLM</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <svg width="60" height="24" viewBox="0 0 60 24" className="text-cyber-primary">
          <defs>
            <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#52525B" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="12"
            x2="48"
            y2="12"
            stroke="url(#arrowGrad)"
            strokeWidth="2"
            className="animate-dash"
          />
          <polygon points="48,6 60,12 48,18" fill="#FF6B00" />
        </svg>
        <span className="text-cyber-muted text-[10px] tracking-wider">VIBE</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-lg bg-cyber-primary/20 border border-cyber-primary/50 flex items-center justify-center text-2xl">
          You
        </div>
        <span className="text-cyber-primary text-xs">Human</span>
      </div>
    </div>
  );
}

export default function Teaser() {
  const [loaded, setLoaded] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('vibe-lang');
    if (stored === 'en' || stored === 'ja') return stored;
    return navigator.language.startsWith('ja') ? 'ja' : 'en';
  });

  const toggle = () => {
    setLang((prev) => {
      const next = prev === 'ja' ? 'en' : 'ja';
      localStorage.setItem('vibe-lang', next);
      return next;
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const l = <T,>(v: { ja: T; en: T }): T => v[lang];

  return (
    <LangContext.Provider value={{ lang, toggle }}>
      <div className="min-h-screen w-screen bg-cyber-background text-cyber-text overflow-x-hidden">
        <LangToggle />

        {/* Grid background */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,theme('colors.cyber.border')_1px,transparent_1px),linear-gradient(to_bottom,theme('colors.cyber.border')_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,theme('colors.cyber.primary')_0.1,transparent)] opacity-10 pointer-events-none" />

        {/* Hero */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
          <div
            className={`text-center transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-cyber-border bg-cyber-surface/60 backdrop-blur-sm">
              <span className="font-mono text-xs tracking-widest text-cyber-muted uppercase">
                {l(TEXT.badge)}
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-6">
              <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-500 bg-clip-text text-transparent">
                VIBE
              </span>
              <br />
              <GlitchText
                text="ARCHITECT"
                className="text-white"
              />
            </h1>

            <p className="max-w-lg mx-auto text-lg sm:text-xl text-cyber-muted leading-relaxed mb-8">
              {TEXT.heroDesc[lang](<RoleRotator />)}
            </p>

            <FlowDiagram />
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce-slow">
            <span className="text-cyber-muted text-xs font-mono tracking-widest">SCROLL</span>
            <svg width="16" height="24" viewBox="0 0 16 24" className="text-cyber-muted">
              <path d="M8 4 L8 18 M3 14 L8 19 L13 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </section>

        {/* Concept */}
        <section className="relative py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-xs font-mono text-cyber-primary tracking-[0.3em] uppercase mb-4">
                  {l(TEXT.conceptLabel)}
                </h2>
                <h3 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
                  {l(TEXT.conceptTitle)}
                </h3>
                <p className="text-cyber-muted leading-relaxed mb-6">{l(TEXT.conceptP1)}</p>
                <p className="text-cyber-muted leading-relaxed">{l(TEXT.conceptP2)}</p>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-8 bg-cyber-primary/5 rounded-2xl blur-xl" />
                  <VoxelCanvas />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-mono text-cyber-secondary tracking-[0.3em] uppercase mb-4 text-center">
              {l(TEXT.howLabel)}
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black mb-16 text-center">{l(TEXT.howTitle)}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative p-8 rounded-xl border border-cyber-border bg-cyber-surface/30 backdrop-blur-sm hover:border-cyber-primary/50 transition-all duration-300">
                <div className="text-cyber-secondary font-mono text-5xl font-black opacity-20 absolute top-4 right-6">
                  01
                </div>
                <h4 className="text-2xl font-black mb-1">{l(TEXT.steps[0].title)}</h4>
                <p className="text-cyber-secondary font-mono text-xs tracking-widest uppercase mb-4">
                  {l(TEXT.steps[0].subtitle)}
                </p>
                <p className="text-cyber-muted text-sm leading-relaxed">{l(TEXT.steps[0].desc)}</p>
              </div>

              <div className="group relative p-8 rounded-xl border border-cyber-border bg-cyber-surface/30 backdrop-blur-sm hover:border-cyber-primary/50 transition-all duration-300">
                <div className="text-cyber-primary font-mono text-5xl font-black opacity-20 absolute top-4 right-6">
                  02
                </div>
                <h4 className="text-2xl font-black mb-1">{l(TEXT.steps[1].title)}</h4>
                <p className="text-cyber-primary font-mono text-xs tracking-widest uppercase mb-4">
                  {l(TEXT.steps[1].subtitle)}
                </p>
                <p className="text-cyber-muted text-sm leading-relaxed">{l(TEXT.steps[1].desc)}</p>
              </div>

              <div className="group relative p-8 rounded-xl border border-cyber-border bg-cyber-surface/30 backdrop-blur-sm hover:border-cyber-primary/50 transition-all duration-300">
                <div className="text-cyber-accent font-mono text-5xl font-black opacity-20 absolute top-4 right-6">
                  03
                </div>
                <h4 className="text-2xl font-black mb-1">{l(TEXT.steps[2].title)}</h4>
                <p className="text-cyber-accent font-mono text-xs tracking-widest uppercase mb-4">
                  {l(TEXT.steps[2].subtitle)}
                </p>
                <p className="text-cyber-muted text-sm leading-relaxed">{l(TEXT.steps[2].desc)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vibe stream */}
        <section className="relative py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xs font-mono text-cyber-accent tracking-[0.3em] uppercase mb-6">
              {l(TEXT.vibeLabel)}
            </h2>
            <p className="text-cyber-muted mb-8">{l(TEXT.vibeDesc)}</p>
            <div className="p-8 rounded-xl border border-cyber-border bg-black/40 backdrop-blur-sm">
              <div className="font-mono text-xs text-cyber-muted mb-3">$ director --transmit</div>
              <div className="text-2xl sm:text-3xl font-black">
                <VibeStream />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-32 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">{l(TEXT.ctaTitle)}</h2>
            <p className="text-cyber-muted text-lg mb-12 whitespace-pre-line">{l(TEXT.ctaDesc)}</p>

            <a
              href="#/game"
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-transparent font-bold text-white uppercase tracking-widest overflow-hidden rounded-md border border-cyber-border hover:border-cyber-primary transition-colors"
            >
              <div className="absolute inset-0 w-0 bg-cyber-primary transition-all duration-300 ease-out group-hover:w-full opacity-20" />
              <span className="relative text-xl group-hover:text-cyber-primary transition-colors">
                {l(TEXT.ctaButton)}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                className="relative text-cyber-primary transition-transform group-hover:translate-x-1"
              >
                <path d="M4 10 H14 M10 5 L15 10 L10 15" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-cyber-border py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-xs text-cyber-muted">
              <span className="text-cyber-primary">VIBE ARCHITECT</span> / Gemini3 Hackathon Tokyo 2025
            </div>
            <div className="font-mono text-xs text-cyber-muted">LLM → Human Project</div>
          </div>
        </footer>
      </div>
    </LangContext.Provider>
  );
}
