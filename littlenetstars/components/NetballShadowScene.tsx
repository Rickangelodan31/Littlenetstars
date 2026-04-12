export default function NetballShadowScene() {
  /* ─────────────────────────────────────────────
     All figures drawn with feet at local y = 0.
     Ellipses used for every limb – rotate() arg
     tilts each one from its midpoint so limbs
     look like rounded muscle cylinders, not sticks.
     ───────────────────────────────────────────── */
  const F1 = "rgba(52,8,134,0.34)";   // player 1 – most prominent
  const F2 = "rgba(52,8,134,0.30)";   // player 2
  const F3 = "rgba(52,8,134,0.26)";   // player 3 – wing
  const FU = "rgba(52,8,134,0.38)";   // umpire
  const FP = "rgba(52,8,134,0.42)";   // post

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        /* ── whole-body jump translations ── */
        @keyframes p1 {
          0%,100% { transform:translate(0,0) scaleY(1); }
          5%      { transform:translate(0,6px) scaleY(0.97); }
          20%     { transform:translate(12px,-62px) scaleY(0.96); }
          38%     { transform:translate(24px,-120px) scaleY(0.93); }
          48%,52% { transform:translate(28px,-148px) scaleY(0.91); }
          65%     { transform:translate(18px,-108px) scaleY(0.94); }
          82%     { transform:translate(6px,-48px) scaleY(0.97); }
          92%     { transform:translate(0,2px) scaleY(1); }
        }
        @keyframes p2 {
          0%,100% { transform:translate(0,0) scaleY(1); }
          8%      { transform:translate(0,6px) scaleY(0.97); }
          24%     { transform:translate(-14px,-55px) scaleY(0.96); }
          42%     { transform:translate(-26px,-110px) scaleY(0.93); }
          52%,56% { transform:translate(-30px,-138px) scaleY(0.92); }
          68%     { transform:translate(-22px,-102px) scaleY(0.94); }
          84%     { transform:translate(-8px,-44px) scaleY(0.97); }
          93%     { transform:translate(0,2px) scaleY(1); }
        }
        @keyframes p3 {
          0%,100% { transform:translate(-55px,0) scaleY(1); }
          12%     { transform:translate(-32px,0) scaleY(1); }
          24%     { transform:translate(-8px,5px) scaleY(0.98); }
          38%     { transform:translate(8px,-50px) scaleY(0.96); }
          50%     { transform:translate(16px,-95px) scaleY(0.93); }
          58%,62% { transform:translate(20px,-116px) scaleY(0.92); }
          74%     { transform:translate(12px,-82px) scaleY(0.94); }
          86%     { transform:translate(4px,-34px) scaleY(0.97); }
          95%     { transform:translate(-8px,2px) scaleY(1); }
        }
        /* ── ground shadow scale ── */
        @keyframes sh1 {
          0%,100% { transform:scale(1); opacity:0.44; }
          5%      { transform:scale(1.2); opacity:0.48; }
          50%     { transform:scale(0.28); opacity:0.09; }
          92%     { transform:scale(1.2); opacity:0.48; }
        }
        @keyframes sh2 {
          0%,100% { transform:scale(1); opacity:0.40; }
          8%      { transform:scale(1.16); opacity:0.44; }
          54%     { transform:scale(0.30); opacity:0.10; }
          93%     { transform:scale(1.16); opacity:0.44; }
        }
        @keyframes sh3 {
          0%,100% { transform:scale(0.88); opacity:0.32; }
          12%     { transform:scale(1.08); opacity:0.36; }
          60%     { transform:scale(0.32); opacity:0.09; }
          88%     { transform:scale(1.08); opacity:0.36; }
        }
        /* ── umpire: runs in then stands pointing ── */
        @keyframes umpMove {
          0%,1%   { transform:translateX(-270px); opacity:0; }
          4%      { opacity:0.65; }
          36%     { transform:translateX(0); }
          38%,86% { transform:translateX(0); opacity:0.72; }
          92%     { transform:translateX(0); opacity:0; }
          100%    { transform:translateX(-270px); opacity:0; }
        }
        @keyframes runShow  { 0%,33%{opacity:1} 40%,100%{opacity:0} }
        @keyframes standShow{ 0%,36%{opacity:0} 44%,84%{opacity:1} 90%,100%{opacity:0} }
        /* ── ball: bounces off ring, players contest it ── */
        @keyframes ball {
          0%,7%,88%,100% { transform:translate(0,0); opacity:0; }
          10%            { transform:translate(0,0); opacity:1; }
          15%            { transform:translate(4px,-26px); opacity:1; }
          26%            { transform:translate(-38px,-58px); opacity:1; }
          38%            { transform:translate(-62px,-72px); opacity:1; }
          50%            { transform:translate(-38px,-36px); opacity:0.96; }
          62%            { transform:translate(-24px,-12px); opacity:0.9; }
          72%            { transform:translate(-22px,-10px); opacity:0.6; }
          82%            { transform:translate(-22px,-10px); opacity:0; }
        }
        .p1  { animation: p1   10s cubic-bezier(0.45,0.05,0.55,0.95) infinite; }
        .p2  { animation: p2   10s cubic-bezier(0.45,0.05,0.55,0.95) infinite; }
        .p3  { animation: p3   10s cubic-bezier(0.45,0.05,0.55,0.95) infinite; }
        .sh1 { transform-box:fill-box; transform-origin:50% 50%;
               animation: sh1 10s cubic-bezier(0.45,0.05,0.55,0.95) infinite; }
        .sh2 { transform-box:fill-box; transform-origin:50% 50%;
               animation: sh2 10s cubic-bezier(0.45,0.05,0.55,0.95) infinite; }
        .sh3 { transform-box:fill-box; transform-origin:50% 50%;
               animation: sh3 10s cubic-bezier(0.45,0.05,0.55,0.95) infinite; }
        .ump-pos   { animation: umpMove  10s ease-in-out infinite; }
        .ump-run   { animation: runShow  10s ease-in-out infinite; }
        .ump-stand { animation: standShow 10s ease-in-out infinite; }
        .ball      { animation: ball     10s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 1400 520"
        width="100%" height="100%"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        <defs>
          <filter id="sb"><feGaussianBlur stdDeviation="3.5"/></filter>
          <filter id="bg">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(109,40,217,0)"/>
            <stop offset="100%" stopColor="rgba(109,40,217,0.09)"/>
          </linearGradient>
        </defs>

        {/* ground */}
        <rect x="0" y="405" width="1400" height="115" fill="url(#grd)"/>
        <line x1="0" y1="470" x2="1400" y2="470" stroke="rgba(139,92,246,0.1)" strokeWidth="1.5"/>

        {/* ── POST & RING  (ring SVG centre = 820, 136) ── */}
        <g transform="translate(820,470)" fill={FP} stroke="none">
          <rect x="-6" y="-334" width="12" height="344" rx="5"/>
          {/* ring sits directly on top of post */}
          <circle cx="0" cy="-334" r="23" fill="none" stroke={FP} strokeWidth="10"/>
          <circle cx="0" cy="-334" r="23" fill="none" stroke="rgba(139,92,246,0.22)" strokeWidth="18"/>
          {/* net */}
          <path d="M-18,-334 L-22,-295 L22,-295 L18,-334" fill="none" stroke="rgba(52,8,134,0.28)" strokeWidth="2.5"/>
          <path d="M0,-334 L0,-295" fill="none" stroke="rgba(52,8,134,0.2)" strokeWidth="1.5"/>
          <ellipse cx="0" cy="-2" rx="24" ry="6" fill="rgba(20,0,70,0.28)" filter="url(#sb)"/>
        </g>

        {/* ── UMPIRE ── */}
        <g className="ump-pos" transform="translate(435,470)">
          <ellipse cx="0" cy="-2" rx="18" ry="5" fill="rgba(20,0,70,0.28)" filter="url(#sb)"/>

          {/* ── RUNNING POSE (0–38 %) ── */}
          <g className="ump-run" fill={FU}>
            <ellipse cx="0" cy="-190" rx="12" ry="14"/>{/* head */}
            <circle cx="8" cy="-202" r="8"/>{/* bun */}
            <path d="M-5,-176 C-6,-170 -6,-166 -5,-163 L5,-163 C6,-166 6,-170 5,-176 Z"/>{/* neck */}
            {/* torso leaning forward */}
            <path d="M-22,-162 C-28,-154 -27,-142 -23,-130 C-19,-118 -15,-110 -13,-100 C-11,-90 -13,-82 -17,-76 L17,-76 C13,-82 11,-90 13,-100 C15,-110 19,-118 23,-130 C27,-142 28,-154 22,-162 Z"/>
            <circle cx="-22" cy="-162" r="8"/><circle cx="22" cy="-162" r="8"/>
            {/* L arm swinging BACK (running) */}
            <ellipse cx="32" cy="-154" rx="6" ry="18" transform="rotate(132,32,-154)"/>
            <circle cx="22" cy="-162" r="5"/>
            <ellipse cx="44" cy="-138" rx="5" ry="13" transform="rotate(120,44,-138)"/>
            {/* R arm swinging FORWARD */}
            <ellipse cx="-32" cy="-154" rx="6" ry="18" transform="rotate(-130,-32,-154)"/>
            <circle cx="-22" cy="-162" r="5"/>
            <ellipse cx="-44" cy="-140" rx="5" ry="13" transform="rotate(-118,-44,-140)"/>
            {/* pants */}
            <path d="M-18,-76 C-22,-60 -26,-40 -28,-24 L28,-24 C26,-40 22,-60 18,-76 Z"/>
            {/* L leg FORWARD stride */}
            <ellipse cx="-16" cy="-52" rx="9" ry="24" transform="rotate(-20,-16,-52)"/>
            <circle cx="-23" cy="-29" r="7"/>
            <ellipse cx="-15" cy="-8" rx="7" ry="18" transform="rotate(22,-15,-8)"/>
            <ellipse cx="-10" cy="8" rx="11" ry="5" transform="rotate(-10,-10,8)"/>
            {/* R leg BACK stride */}
            <ellipse cx="16" cy="-56" rx="9" ry="24" transform="rotate(18,16,-56)"/>
            <circle cx="22" cy="-33" r="7"/>
            <ellipse cx="14" cy="-13" rx="7" ry="18" transform="rotate(-16,14,-13)"/>
            <ellipse cx="10" cy="5" rx="11" ry="5" transform="rotate(8,10,5)"/>
          </g>

          {/* ── STANDING / POINTING POSE (44–84 %) ── */}
          <g className="ump-stand" fill={FU}>
            <ellipse cx="0" cy="-190" rx="12" ry="14"/>
            <circle cx="8" cy="-202" r="8"/>
            <path d="M-5,-176 C-6,-170 -6,-166 -5,-163 L5,-163 C6,-166 6,-170 5,-176 Z"/>
            <path d="M-22,-162 C-28,-154 -27,-142 -23,-130 C-19,-118 -15,-110 -13,-100 C-11,-90 -13,-82 -17,-76 L17,-76 C13,-82 11,-90 13,-100 C15,-110 19,-118 23,-130 C27,-142 28,-154 22,-162 Z"/>
            <circle cx="-22" cy="-162" r="8"/><circle cx="22" cy="-162" r="8"/>
            {/* L arm raised — WHISTLE to mouth */}
            <ellipse cx="-22" cy="-177" rx="6" ry="15" transform="rotate(180,-22,-177)"/>
            <circle cx="-22" cy="-162" r="5"/>
            <ellipse cx="-14" cy="-188" rx="5" ry="11" transform="rotate(120,-14,-188)"/>
            <circle cx="-6" cy="-192" r="5"/>
            {/* whistle (yellow) */}
            <rect x="-12" y="-196" width="10" height="5" rx="2" fill="rgba(255,210,0,0.95)"/>
            <path d="M-12,-194 L-18,-190" stroke="rgba(255,160,0,0.7)" strokeWidth="1.5" fill="none"/>
            {/* R arm extended POINTING right */}
            <ellipse cx="34" cy="-162" rx="6" ry="20" transform="rotate(108,34,-162)"/>
            <circle cx="22" cy="-162" r="5"/>
            <circle cx="46" cy="-158" r="5"/>
            <ellipse cx="58" cy="-155" rx="5" ry="15" transform="rotate(104,58,-155)"/>
            <ellipse cx="70" cy="-152" rx="7" ry="5" transform="rotate(104,70,-152)"/>
            {/* extended pointing finger */}
            <path d="M66,-150 L78,-148" stroke={FU} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            {/* pants */}
            <path d="M-18,-76 C-22,-60 -26,-40 -28,-24 L28,-24 C26,-40 22,-60 18,-76 Z"/>
            {/* standing legs */}
            <ellipse cx="-10" cy="-52" rx="9" ry="26"/>
            <circle cx="-10" cy="-25" r="7"/>
            <ellipse cx="-10" cy="-6" rx="7" ry="20"/>
            <ellipse cx="-10" cy="10" rx="12" ry="5"/>
            <ellipse cx="10" cy="-52" rx="9" ry="26" transform="rotate(5,10,-52)"/>
            <circle cx="10" cy="-25" r="7"/>
            <ellipse cx="10" cy="-6" rx="7" ry="20" transform="rotate(-3,10,-6)"/>
            <ellipse cx="10" cy="10" rx="12" ry="5" transform="rotate(4,10,10)"/>
          </g>
        </g>

        {/* ── PLAYER 3 — wing, runs in from left then jumps ── */}
        <g transform="translate(602,470)">
          <ellipse className="sh3" cx="0" cy="-2" rx="22" ry="7" fill="rgba(20,0,70,0.34)" filter="url(#sb)"/>
          <g className="p3" fill={F3}>
            <ellipse cx="0" cy="-190" rx="13" ry="15"/>
            <circle cx="11" cy="-203" r="9"/>
            <path d="M-5,-176 C-6,-170 -6,-166 -5,-162 L5,-162 C6,-166 6,-170 5,-176 Z"/>
            {/* torso */}
            <path d="M-25,-161 C-31,-153 -30,-141 -26,-129 C-22,-117 -18,-108 -16,-98 C-14,-88 -16,-80 -20,-74 L20,-74 C16,-80 14,-88 16,-98 C18,-108 22,-117 26,-129 C30,-141 31,-153 25,-161 Z"/>
            <circle cx="-25" cy="-161" r="8"/><circle cx="25" cy="-161" r="8"/>
            {/* L arm up */}
            <ellipse cx="-33" cy="-176" rx="7" ry="19" transform="rotate(-150,-33,-176)"/>
            <circle cx="-25" cy="-161" r="6"/>
            <circle cx="-41" cy="-191" r="5"/>
            <ellipse cx="-50" cy="-206" rx="5.5" ry="16" transform="rotate(-150,-50,-206)"/>
            <ellipse cx="-60" cy="-222" rx="7" ry="5" transform="rotate(-140,-60,-222)"/>
            {/* R arm up */}
            <ellipse cx="33" cy="-176" rx="7" ry="19" transform="rotate(150,33,-176)"/>
            <circle cx="25" cy="-161" r="6"/>
            <circle cx="41" cy="-191" r="5"/>
            <ellipse cx="50" cy="-206" rx="5.5" ry="16" transform="rotate(150,50,-206)"/>
            <ellipse cx="60" cy="-222" rx="7" ry="5" transform="rotate(140,60,-222)"/>
            {/* skirt */}
            <path d="M-20,-74 C-26,-60 -32,-44 -36,-28 L36,-28 C32,-44 26,-60 20,-74 Z"/>
            {/* L thigh */}
            <ellipse cx="-18" cy="-51" rx="10" ry="23" transform="rotate(-16,-18,-51)"/>
            <circle cx="-24" cy="-28" r="8"/>
            {/* L shin */}
            <ellipse cx="-17" cy="-10" rx="8" ry="19" transform="rotate(22,-17,-10)"/>
            <ellipse cx="-12" cy="7" rx="11" ry="5" transform="rotate(-13,-12,7)"/>
            {/* R thigh */}
            <ellipse cx="18" cy="-51" rx="10" ry="23" transform="rotate(16,18,-51)"/>
            <circle cx="24" cy="-28" r="8"/>
            {/* R shin */}
            <ellipse cx="17" cy="-10" rx="8" ry="19" transform="rotate(-22,17,-10)"/>
            <ellipse cx="12" cy="7" rx="11" ry="5" transform="rotate(13,12,7)"/>
          </g>
        </g>

        {/* ── PLAYER 2 — challenger, reaches across toward ring ── */}
        <g transform="translate(870,470)">
          <ellipse className="sh2" cx="0" cy="-2" rx="26" ry="8" fill="rgba(20,0,70,0.40)" filter="url(#sb)"/>
          <g className="p2" fill={F2}>
            <ellipse cx="0" cy="-192" rx="13" ry="16"/>
            {/* ponytail */}
            <ellipse cx="-10" cy="-204" rx="8" ry="6"/>
            <path d="M-3,-208 C-7,-220 -15,-226 -19,-221 C-16,-215 -11,-209 -4,-206 Z"/>
            <path d="M-5,-178 C-6,-172 -6,-168 -5,-164 L5,-164 C6,-168 6,-172 5,-178 Z"/>
            {/* torso — body leans toward ring (left) */}
            <path d="M-27,-163 C-33,-155 -32,-143 -28,-131 C-24,-119 -20,-110 -18,-100 C-16,-90 -18,-82 -22,-76 L22,-76 C18,-82 16,-90 18,-100 C20,-110 24,-119 28,-131 C32,-143 33,-155 27,-163 Z"/>
            <circle cx="-27" cy="-163" r="8"/><circle cx="27" cy="-163" r="8"/>
            {/* L arm — aggressive reach toward ring (left and high) */}
            <ellipse cx="-37" cy="-175" rx="7" ry="19" transform="rotate(-138,-37,-175)"/>
            <circle cx="-27" cy="-163" r="6"/>
            <circle cx="-47" cy="-187" r="5"/>
            <ellipse cx="-58" cy="-201" rx="5.5" ry="16" transform="rotate(-133,-58,-201)"/>
            <ellipse cx="-69" cy="-216" rx="7" ry="5" transform="rotate(-128,-69,-216)"/>
            {/* L hand spread fingers */}
            <path d="M-73,-214 L-79,-217 M-71,-220 L-75,-225 M-65,-218 L-67,-224" stroke={F2} strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* R arm also up */}
            <ellipse cx="36" cy="-178" rx="7" ry="19" transform="rotate(148,36,-178)"/>
            <circle cx="27" cy="-163" r="6"/>
            <circle cx="45" cy="-193" r="5"/>
            <ellipse cx="53" cy="-208" rx="5.5" ry="16" transform="rotate(148,53,-208)"/>
            <ellipse cx="63" cy="-223" rx="7" ry="5" transform="rotate(140,63,-223)"/>
            {/* skirt */}
            <path d="M-22,-76 C-28,-62 -34,-46 -38,-30 L38,-30 C34,-46 28,-62 22,-76 Z"/>
            {/* L thigh */}
            <ellipse cx="-19" cy="-53" rx="10" ry="23" transform="rotate(-17,-19,-53)"/>
            <circle cx="-25" cy="-30" r="8"/>
            <ellipse cx="-18" cy="-11" rx="8" ry="20" transform="rotate(23,-18,-11)"/>
            <ellipse cx="-13" cy="7" rx="12" ry="5" transform="rotate(-13,-13,7)"/>
            {/* R thigh */}
            <ellipse cx="19" cy="-53" rx="10" ry="23" transform="rotate(17,19,-53)"/>
            <circle cx="25" cy="-30" r="8"/>
            <ellipse cx="18" cy="-11" rx="8" ry="20" transform="rotate(-23,18,-11)"/>
            <ellipse cx="13" cy="7" rx="12" ry="5" transform="rotate(13,13,7)"/>
          </g>
        </g>

        {/* ── PLAYER 1 — main attacker, peaks at ring height ── */}
        <g transform="translate(758,470)">
          <ellipse className="sh1" cx="0" cy="-2" rx="29" ry="9" fill="rgba(20,0,70,0.44)" filter="url(#sb)"/>
          <g className="p1" fill={F1}>
            {/* head */}
            <ellipse cx="2" cy="-192" rx="14" ry="16"/>
            {/* hair bun */}
            <circle cx="13" cy="-207" r="10"/>
            <path d="M2,-208 C8,-216 14,-214 16,-209" stroke={F1} strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* neck */}
            <path d="M-6,-176 C-7,-170 -7,-166 -6,-162 L6,-162 C7,-166 7,-170 6,-176 Z"/>
            {/* torso — S-curve female athletic */}
            <path d="M-27,-161 C-33,-153 -32,-141 -28,-129 C-24,-117 -20,-108 -18,-98 C-16,-88 -18,-80 -22,-74 L22,-74 C18,-80 16,-88 18,-98 C20,-108 24,-117 28,-129 C32,-141 33,-153 27,-161 Z"/>
            <circle cx="-27" cy="-161" r="9"/><circle cx="27" cy="-161" r="9"/>
            {/* L upper arm — raised up-left at 150° */}
            <ellipse cx="-36" cy="-175" rx="7.5" ry="20" transform="rotate(-150,-36,-175)"/>
            <circle cx="-27" cy="-161" r="6"/>
            <circle cx="-45" cy="-189" r="6"/>
            {/* L forearm */}
            <ellipse cx="-54" cy="-205" rx="6" ry="17" transform="rotate(-150,-54,-205)"/>
            {/* L hand with spread fingers */}
            <ellipse cx="-64" cy="-222" rx="7.5" ry="5.5" transform="rotate(-140,-64,-222)"/>
            <path d="M-68,-220 L-74,-223 M-66,-226 L-70,-232 M-60,-224 L-62,-230" stroke={F1} strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* R upper arm — raised up-right */}
            <ellipse cx="36" cy="-175" rx="7.5" ry="20" transform="rotate(150,36,-175)"/>
            <circle cx="27" cy="-161" r="6"/>
            <circle cx="45" cy="-189" r="6"/>
            {/* R forearm */}
            <ellipse cx="54" cy="-205" rx="6" ry="17" transform="rotate(150,54,-205)"/>
            {/* R hand */}
            <ellipse cx="64" cy="-222" rx="7.5" ry="5.5" transform="rotate(140,64,-222)"/>
            <path d="M68,-220 L74,-223 M66,-226 L70,-232 M60,-224 L62,-230" stroke={F1} strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* skirt flared in jump */}
            <path d="M-22,-74 C-29,-60 -36,-44 -40,-28 L40,-28 C36,-44 29,-60 22,-74 Z"/>
            {/* L thigh */}
            <ellipse cx="-19" cy="-52" rx="11" ry="24" transform="rotate(-18,-19,-52)"/>
            <circle cx="-25" cy="-28" r="9"/>
            {/* L shin */}
            <ellipse cx="-18" cy="-9" rx="9" ry="20" transform="rotate(24,-18,-9)"/>
            <ellipse cx="-13" cy="8" rx="13" ry="5.5" transform="rotate(-14,-13,8)"/>
            {/* R thigh */}
            <ellipse cx="19" cy="-52" rx="11" ry="24" transform="rotate(18,19,-52)"/>
            <circle cx="25" cy="-28" r="9"/>
            {/* R shin */}
            <ellipse cx="18" cy="-9" rx="9" ry="20" transform="rotate(-24,18,-9)"/>
            <ellipse cx="13" cy="8" rx="13" ry="5.5" transform="rotate(14,13,8)"/>
          </g>
        </g>

        {/* ── BALL — bounces off ring, arcs between players ──
             origin = ring SVG centre (820, 136)               */}
        <g transform="translate(820,136)" className="ball">
          {/* outer soft halo */}
          <circle cx="0" cy="0" r="18" fill="rgba(251,191,36,0.12)"/>
          {/* ball body */}
          <circle cx="0" cy="0" r="13" fill="rgba(251,191,36,0.92)" filter="url(#bg)"/>
          <circle cx="0" cy="0" r="13" fill="none" stroke="rgba(180,100,0,0.5)" strokeWidth="2"/>
          {/* seam lines */}
          <path d="M-5,-12 Q0,-4 -5,12" fill="none" stroke="rgba(140,70,0,0.45)" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M5,-12 Q0,-4 5,12" fill="none" stroke="rgba(140,70,0,0.45)" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M-12,-4 Q-4,0 12,-4" fill="none" stroke="rgba(140,70,0,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
        </g>

        {/* subtle court markings */}
        <ellipse cx="760" cy="470" rx="265" ry="18" fill="none" stroke="rgba(139,92,246,0.05)" strokeWidth="2"/>
        <ellipse cx="820" cy="470" rx="130" ry="12" fill="none" stroke="rgba(139,92,246,0.07)" strokeWidth="1.5" strokeDasharray="8,6"/>
        <ellipse cx="820" cy="478" rx="108" ry="28" fill="rgba(139,92,246,0.05)"/>
      </svg>
    </div>
  );
}
