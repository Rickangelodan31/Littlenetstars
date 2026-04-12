export default function NetballShadowScene() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <style>{`
        /* ─── jump animations ─── */
        @keyframes jumpMain {
          0%,100% { transform: translate(0,0); }
          10%      { transform: translate(0,5px); }
          28%      { transform: translate(0,-75px); }
          50%      { transform: translate(0,-125px); }
          72%      { transform: translate(0,-75px); }
          88%      { transform: translate(0,3px); }
        }
        @keyframes jumpSecond {
          0%,100% { transform: translate(0,0); }
          15%     { transform: translate(0,4px); }
          35%     { transform: translate(0,-55px); }
          55%     { transform: translate(0,-95px); }
          75%     { transform: translate(0,-55px); }
          90%     { transform: translate(0,2px); }
        }
        @keyframes jumpThird {
          0%,100% { transform: translate(0,0); }
          40%     { transform: translate(0,3px); }
          58%     { transform: translate(0,-45px); }
          66%     { transform: translate(0,-68px); }
          78%     { transform: translate(0,-45px); }
          93%     { transform: translate(0,1px); }
        }
        /* ─── ground shadows (scale from center) ─── */
        @keyframes shMain {
          0%,100% { transform: scale(1,1);     opacity:0.38; }
          10%     { transform: scale(1.1,1.1); opacity:0.42; }
          50%     { transform: scale(0.48,0.5); opacity:0.15; }
          88%     { transform: scale(1.1,1.1); opacity:0.42; }
        }
        @keyframes shSecond {
          0%,100% { transform: scale(1,1);     opacity:0.32; }
          15%     { transform: scale(1.08,1.08); opacity:0.36; }
          55%     { transform: scale(0.52,0.55); opacity:0.14; }
          90%     { transform: scale(1.08,1.08); opacity:0.36; }
        }
        @keyframes shThird {
          0%,100% { transform: scale(1,1);     opacity:0.26; }
          66%     { transform: scale(0.58,0.6); opacity:0.1; }
        }
        /* ─── umpire arm switch ─── */
        @keyframes armDown {
          0%,28%,86%,100% { opacity:1; }
          34%,80%         { opacity:0; }
        }
        @keyframes armUp {
          0%,28%,86%,100% { opacity:0; }
          34%,80%         { opacity:1; }
        }
        /* ─── ball arc ─── */
        @keyframes ballFly {
          0%,6%,94%,100% { transform:translate(0px,0px); opacity:0; }
          10%            { transform:translate(0px,0px); opacity:0.9; }
          32%            { transform:translate(-110px,-72px); opacity:0.9; }
          54%            { transform:translate(-225px,-105px); opacity:0.85; }
          73%            { transform:translate(-300px,-50px); opacity:0.7; }
          88%            { transform:translate(-330px,8px); opacity:0; }
        }

        .j1 { animation: jumpMain   10s cubic-bezier(0.4,0,0.6,1) infinite; }
        .j2 { animation: jumpSecond 10s cubic-bezier(0.4,0,0.6,1) infinite; }
        .j3 { animation: jumpThird  10s cubic-bezier(0.4,0,0.6,1) infinite; }
        .sh1 { transform-box:fill-box; transform-origin:center center;
                animation: shMain   10s cubic-bezier(0.4,0,0.6,1) infinite; }
        .sh2 { transform-box:fill-box; transform-origin:center center;
                animation: shSecond 10s cubic-bezier(0.4,0,0.6,1) infinite; }
        .sh3 { transform-box:fill-box; transform-origin:center center;
                animation: shThird  10s cubic-bezier(0.4,0,0.6,1) infinite; }
        .ump-arm-down { animation: armDown 10s ease-in-out infinite; }
        .ump-arm-up   { animation: armUp   10s ease-in-out infinite; }
        .ball-anim    { animation: ballFly 10s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 1200 490"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        <defs>
          <filter id="nbs-blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="nbs-glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="nbs-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(109,40,217,0)" />
            <stop offset="100%" stopColor="rgba(109,40,217,0.08)" />
          </linearGradient>
        </defs>

        {/* ground fade */}
        <rect x="0" y="390" width="1200" height="100" fill="url(#nbs-ground)" />
        <line x1="0" y1="448" x2="1200" y2="448" stroke="rgba(139,92,246,0.1)" strokeWidth="1.5" />

        {/* ─── NETBALL POST (right) ─── */}
        <g transform="translate(970,448)" fill="rgba(76,29,149,0.32)" stroke="none">
          <rect x="-5" y="-248" width="10" height="258" rx="3" />
          {/* horizontal arm */}
          <rect x="-5" y="-248" width="64" height="8" rx="2" />
          {/* ring */}
          <circle cx="59" cy="-244" r="19" fill="none" stroke="rgba(76,29,149,0.32)" strokeWidth="8" />
          {/* net hint */}
          <path d="M43,-244 L39,-213 L79,-213 L75,-244" fill="none" stroke="rgba(76,29,149,0.2)" strokeWidth="3" />
        </g>

        {/* ─── UMPIRE (left) ─── */}
        <g transform="translate(182,448)" fill="rgba(76,29,149,0.34)">
          {/* shadow */}
          <ellipse cx="0" cy="-1" rx="18" ry="5" fill="rgba(60,0,120,0.3)" filter="url(#nbs-blur)" />
          {/* head */}
          <circle cx="0" cy="-133" r="13" />
          {/* hair */}
          <ellipse cx="-8" cy="-143" rx="9" ry="6" />
          {/* neck */}
          <path d="M-4,-120 L4,-120 L5,-111 L-5,-111 Z" />
          {/* torso */}
          <path d="M-13,-111 L-11,-74 L11,-74 L13,-111 Z" />
          {/* arm DOWN */}
          <path className="ump-arm-down" d="M13,-103 L18,-77 L12,-75 L7,-101 Z" />
          {/* arm UP (raised) */}
          <path className="ump-arm-up" d="M-13,-103 L-38,-128 L-32,-134 L-7,-109 Z" />
          {/* whistle */}
          <rect x="-19" y="-132" width="9" height="5" rx="1" fill="rgba(255,210,0,0.85)" />
          {/* lower body */}
          <path d="M-11,-74 L-14,-37 L14,-37 L11,-74 Z" />
          {/* legs */}
          <rect x="-10" y="-37" width="8" height="39" rx="3" />
          <rect x="2" y="-37" width="8" height="39" rx="3" />
        </g>

        {/* ─── PLAYER 3 (left, background, 80 % scale) ─── */}
        <g transform="translate(395,448)">
          <ellipse className="sh3" cx="0" cy="-1" rx="19" ry="6" fill="rgba(60,0,120,0.26)" filter="url(#nbs-blur)" />
          <g className="j3" fill="rgba(76,29,149,0.24)">
            {/* head */}
            <circle cx="0" cy="-147" r="12" />
            {/* hair bun */}
            <circle cx="9" cy="-157" r="7" />
            {/* neck */}
            <path d="M-4,-135 L4,-135 L5,-127 L-5,-127 Z" />
            {/* torso */}
            <path d="M-15,-127 C-18,-104 -16,-87 -13,-67 L13,-67 C16,-87 18,-104 15,-127 Z" />
            {/* arms raised */}
            <path d="M-15,-117 L-37,-140 L-32,-146 L-10,-123 Z" />
            <path d="M-37,-140 L-31,-159 L-25,-156 L-31,-137 Z" />
            <path d="M15,-117 L37,-140 L32,-146 L10,-123 Z" />
            <path d="M37,-140 L31,-159 L25,-156 L31,-137 Z" />
            {/* skirt */}
            <path d="M-13,-67 L-22,-35 L22,-35 L13,-67 Z" />
            {/* legs bent */}
            <path d="M-7,-35 L-20,-9 L-14,-6 L-1,-32 Z" />
            <path d="M-20,-9 L-13,13 L-7,10 L-14,-11 Z" />
            <path d="M7,-35 L20,-9 L14,-6 L1,-32 Z" />
            <path d="M20,-9 L13,13 L7,10 L14,-11 Z" />
          </g>
        </g>

        {/* ─── PLAYER 2 (center) ─── */}
        <g transform="translate(568,448)">
          <ellipse className="sh2" cx="0" cy="-1" rx="22" ry="7" fill="rgba(60,0,120,0.3)" filter="url(#nbs-blur)" />
          <g className="j2" fill="rgba(76,29,149,0.27)">
            <circle cx="0" cy="-155" r="13" />
            <circle cx="-9" cy="-165" r="7" />
            <path d="M-5,-142 L5,-142 L6,-132 L-6,-132 Z" />
            <path d="M-17,-132 C-21,-108 -19,-90 -15,-70 L15,-70 C19,-90 21,-108 17,-132 Z" />
            <path d="M-17,-122 L-42,-146 L-37,-152 L-12,-128 Z" />
            <path d="M-42,-146 L-37,-166 L-30,-163 L-35,-143 Z" />
            <path d="M17,-122 L42,-146 L37,-152 L12,-128 Z" />
            <path d="M42,-146 L37,-166 L30,-163 L35,-143 Z" />
            <path d="M-15,-70 L-25,-35 L25,-35 L15,-70 Z" />
            <path d="M-8,-35 L-23,-7 L-17,-4 L-2,-32 Z" />
            <path d="M-23,-7 L-16,16 L-10,13 L-17,-9 Z" />
            <path d="M8,-35 L23,-7 L17,-4 L2,-32 Z" />
            <path d="M23,-7 L16,16 L10,13 L17,-9 Z" />
          </g>
        </g>

        {/* ─── PLAYER 1 (main, center-right, full jump) ─── */}
        <g transform="translate(748,448)">
          <ellipse className="sh1" cx="0" cy="-1" rx="26" ry="9" fill="rgba(60,0,120,0.35)" filter="url(#nbs-blur)" />
          <g className="j1" fill="rgba(76,29,149,0.30)">
            {/* head */}
            <circle cx="0" cy="-162" r="15" />
            {/* hair bun */}
            <circle cx="11" cy="-173" r="8" />
            {/* neck */}
            <path d="M-5,-147 L5,-147 L7,-136 L-7,-136 Z" />
            {/* torso – feminine taper */}
            <path d="M-19,-136 C-23,-110 -21,-92 -17,-72 L17,-72 C21,-92 23,-110 19,-136 Z" />
            {/* left arm fully extended up */}
            <path d="M-19,-125 L-48,-153 L-42,-160 L-13,-132 Z" />
            <path d="M-48,-153 L-43,-176 L-36,-173 L-41,-150 Z" />
            {/* right arm fully extended up */}
            <path d="M19,-125 L48,-153 L42,-160 L13,-132 Z" />
            <path d="M48,-153 L43,-176 L36,-173 L41,-150 Z" />
            {/* skirt flared */}
            <path d="M-17,-72 L-30,-33 L30,-33 L17,-72 Z" />
            {/* legs tucked in jump */}
            <path d="M-10,-33 L-27,-4 L-21,-1 L-4,-30 Z" />
            <path d="M-27,-4 L-19,20 L-12,17 L-20,-6 Z" />
            <path d="M10,-33 L27,-4 L21,-1 L4,-30 Z" />
            <path d="M27,-4 L19,20 L12,17 L20,-6 Z" />
          </g>
        </g>

        {/* ─── BALL (arcs from ring toward player 1) ─── */}
        <g transform="translate(1029,204)" className="ball-anim">
          <circle cx="0" cy="0" r="12" fill="rgba(251,191,36,0.8)" filter="url(#nbs-glow)" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="rgba(160,100,0,0.5)" strokeWidth="1.5" />
          {/* seam lines */}
          <path d="M-4,-11 Q0,-4 -4,11" fill="none" stroke="rgba(140,80,0,0.4)" strokeWidth="1.5" />
          <path d="M4,-11 Q0,-4 4,11" fill="none" stroke="rgba(140,80,0,0.4)" strokeWidth="1.5" />
        </g>

        {/* subtle court arc */}
        <ellipse cx="600" cy="448" rx="330" ry="20" fill="none" stroke="rgba(139,92,246,0.05)" strokeWidth="2" />
      </svg>
    </div>
  );
}
