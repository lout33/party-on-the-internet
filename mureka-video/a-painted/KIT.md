# Style A kit cheat sheet (`a-painted/kit.js`, `window.KIT`)

Register shots as `R('X1.1', (ctx, shot, S, t, api, kit) => {...})`. The stage already ran `kit.frame(ctx, shot.mode)` (wall + paper washes) and runs `kit.caption(...)` after you (grain + vignette + lyric). Do not paint a full-frame opaque background unless you mean to replace the mode wall; do not add grain or vignette.

**Always pass `S` in opts.** Jitter ("boil") is `hash(seed, floor(S*12))`, so every piece wobbles at 12 fps like the fragment. No `S` = frozen.
Sizes: `s` is the piece's main size in px (height for upright things, width for wide things); stated per piece. `mode` darkens colours (night 0.55 .. day 0) so pieces match the room.

## Modes: `KIT.MODES[mode]`
`{ bg, ink, paper, accent, accent2, dim, floor, dk, vig, lits, glass, dark? }`. Modes: night, teal, dawn, day, dusk, party, party-night, grey, gold, ink.
bg = wall, dim = wash blobs, floor = ground, dk = darkening of lit objects, lits = sung-word colours, ink = outline colour (always `#2b2233`).
Arc: night/teal (A0, B1, E8) -> day/dawn cream (board) -> party (C3 only) -> dawn/dusk (B4) -> day (B5) -> party-night (C6) -> grey (D7) -> teal -> gold (E8 end). `ink` = near-black warm (E8.5 zero).

## Frame, ground, caption
- `KIT.frame(ctx, mode)` wall + washes (stage calls it for you). `KIT.floor(ctx, mode, {y=800, color, planks=true, skirting=true})` floor band to the bottom. `KIT.rug(ctx,x,y,w,{mode})`.
- `KIT.caption(ctx, line, S, api, mode)` stage-only. Lives in y ~ 900..1080 (one row baseline 1006, two rows 962/1032 for long lines). Keep your picture's focus above y 900.
- `KIT.post(ctx, mode)` grain + vignette (already inside caption; do not call).

## Agents
- `KIT.bean(ctx, x, y, size, o)`: **(x,y) = FEET centre** (o.origin:'center' = body centre; the old hybrid kit used centre). `size` = body height in px (~88 at scale 1; hero in the fragment is ~170-220). Antenna adds ~0.5*size above.
  - `body` hex (hero default `#d8503b`, others `#2b7f84`), `S`, `seed` (stable face/wobble per bean), `hero:true` (red, headband, antenna bulb that pulses on the beat), `drain` 0..1 (to graphite), `tilt` rad, `squash` (>0 flatter+wider, <0 taller; feet stay put), `flip`, `walk:true` (legs step).
  - `mood`: smile | grin | gasp | worry | flat | asleep | wink | split (left grin, right worry) | happy (closed smiling eyes).
  - `look` -1..1 (pupils/face shift), `lookY`, `blink` (default auto blink from S).
  - `arm`: 'down' | 'wave' | 'point' | 'up' | 'hold' or `[left, right]`. wave/point use the right arm (screen right; `flip` mirrors). 'hold' puts both hands in front of the belly (place the held thing at `(x, y - 0.45*size)`). Raw angles: `armL`, `armR` rad. `pointUp` raises a point.
  - `acc`: `{ shades, glasses, hardhat (true|hex), tie (hex | {col,size}), mustache (true|hex), cape (hex), battery (0..1, blinks red <0.3), badge (true|hex) }`. `antenna` (hex) gives a non-hero a bulb; `band` (hex|false) headband; `sway`, `bulb` (0..1).
  - e.g. `kit.bean(c, 960, 900, 200, {hero:true, S, mood:'grin', arm:'wave', squash:0.1*api.pulse(S,6)})`
- `KIT.crowd(ctx, {x,y,w,h,rows,n,seed,S,mood,...})`: cheap beans on the ground patch x..x+w, feet from y (back row) to y+h (front row). `mood`: smile | grin | gasp | worry | flat | asleep | dance (jump + arms up on the beat, hot palette). Also `look`, `target:{x}` (everyone looks at x), `scale`, `bounce` 0..1, `palette`, `reveal` 0..1 (beans pop in, hash order), `drain`, `antennas` 0..1, `hero:true|{x,y,size,...bean opts}` (full hero drawn in front). 300 beans: ~9 ms (smile) / ~15 ms (dance) per frame.

## Place (all take `{mode, S}`)
- `chair(ctx,x,y,s,{phi=0.45,coat=true,confetti 0..1,sway})` (x,y) = floor centre, s = height (back top to floor).
- `lamp(ctx,x,y,s,{on 0..1,cone=true,reach})` (x,y) = base, s = height. `monitor(ctx,x,y,s,{on 0..1,color,face:'sleep'|'smile',led})` (x,y) = bottom centre of stand, s = screen width. `desk(ctx,x,y,s,{open 0..1,mug,drawers})` (x,y) = tabletop top-left, s = width (fragment = 910).
- `humanRoom(ctx,{mode,S,phi,lamp,monitor,monitorFace,monitorColor,led,coat,confetti,sway,view,windowDraw,light,zzz,dust,dim,clock,mug,drawer})` the full-frame fragment room (window left, desk right, chair at 1300). Use it for every "the empty human place" shot so the room is identical. For night add `dim:0.85, zzz:1, dust:1`; for the morning `mode:'gold', lamp:1, light:1`.
- `window(ctx,x,y,w,h,{view,draw,light 0..1,beamTo,plant=true,mullions})` (x,y,w,h) = glass. view night|dawn|day|dusk|gold|party|grey|dark (default from mode); `draw(ctx,x,y,w,h)` fills the glass (already clipped).
- `rack(ctx,x,y,s,{part:'all'|'back'|'front',tilt,sparks,boxes:[{mood,leds:[6],dx,dy,rot,hide,lid}]})` (x,y) = bottom centre, s = height. Box moods 0 smile, 1 worry, 2 dead (X eyes), 3 asleep. `lid` 0..1 opens a flap. Returns `{boxes:[{x,y,w,h}] top->bottom, w, top}`. Draw `part:'back'`, then a bean, then `part:'front'` to make a bean come out of a box. Also `serverBox(ctx,x,y,w,h,{mood,leds,stripe,seed,S})`.
- `corkboard(ctx,x,y,w,h,{notes:n|[{x,y,col,rot,k}],seed})` (x,y,w,h) = outer frame; note x,y are 0..1 in the cork, k = pop-in.
- `folder(ctx,x,y,s,{color,open,glow})` (x,y) = bottom centre, s = width; glow lights the tag.
- `door(ctx,x,y,s,{color,open 0..1,glow:true,slam})` (x,y) = bottom centre, s = height. `slam` = seconds since the slam (shake + impact ticks for 0.28 s); `open`+`glow` = warm light behind.
- `house(ctx,x,y,s,{lit:0..1|[a,b],smoke,wall,roof})` (x,y) = ground centre, s = height. No marks.
- `keyGlyph(ctx,x,y,s,{rot,color,glint})` s = length. `plane(ctx,x,y,s,{rot,fold 0..1,color})` s = length, fold 0 = flat sheet.
- `paddle(ctx,x,y,s,{word:'HOLD'|'GO',down 0..1})` (x,y) = hand point, s = face width. `sign(ctx,x,y,s,{flip 0..1})` (x,y) = post base, s = total height; flip turns HOLD into GO (card-flip at 0.5).

## Counting
- `tag(ctx,x,y,value,{scale=1,rot,color,raw})` (x,y) = the nail the tag hangs from; fragment size 1 = 380 px wide. `raw:'0'` overrides the number. Red at >= 1200, teal otherwise (`color` overrides).
- `lights(ctx,x,y,w,h,{lit 0..1,wave 0..1,cell=56,colors,seed})` painted string-lights (the dot-matrix stand-in). `lit` = share lit, `wave` = travelling pulse on the beat. Returns `{cols,rows,cells}`.

## Atmosphere
`zzz(ctx,x,y,s,{S,alpha,cloud})`, `confetti(ctx,S,seed,{n,x,y,w,h,colors,still,alpha})` (falls; `still` = scatter), `sunburst(ctx,x,y,r0,r1,{n,S,spin,alpha,colors})`, `star(ctx,x,y,r,{col,kind:'star'|'sparkle',rot,spin,twinkle,S})`, `bubble(ctx,x,y,w,h,{tail:{x,y},color,S})` returns `{cx,cy,w,h}` of the inner area, `discoBall(ctx,x,y,r,{S,spots})`, `sticker(ctx,text,x,y,{size,col,rot,scale})` (lyric words only).

## Helpers
`KIT.h1(n)` 0..1 hash, `boil(S,seed,fps=12)` -1..1, `mix(a,b,k)` hex/rgb mix, `rgba(hex,a)`, `fmt(n)`, `clamp/lerp/seg`, `beat(S)`, `pulse(S,k)` (same as api), `K(hex,k)` mix to navy, `tone(hex,mode)`, `wobLine/wobRect(c,...,S,seed,amp)`, `useS(S)`.
Low-level painted shapes: `blob(c,cx,cy,rx,ry,id,amt,n,rot)`, `wrect(c,x,y,w,h,id,amt,step)`, `fillInk(c,pathFn,fill,lw,{rim,inside})`, `wash`, `glow(c,x,y,r,hex|'rgba(..,A)',a)`, `shadow(c,x,y,rx,ry,a)`, `letter(c,text,x,y,size,fill,{sticker})`. Call `kit.useS(S)` first when you use blob/wrect directly. Constants: `PAL`, `HOT`, `BHOT`, `BEANCOLS`, `INK`, `FONT`.

## House rules
1. The hero is always the red headband + antenna bean (`hero:true`). Other beans use `BEANCOLS` (teal, ochre, rose, tomato, sage, straw). Never give another bean a headband in the same shot as the hero.
2. Palette: stay in the mode. Hot magenta / yellow / sky / lime only in `party` and `party-night` (C3, C6). D7 is `grey` plus one orange accent (the tie, the tick). E8 drains to teal, then `gold`.
3. The caption owns y > ~900. Compose the picture in y 60..880; ground line around y 800-860 so feet clear the caption.
4. Text in the picture: only the lyric caption, the numbers 1,200 / 700 / 14 / 0, and HOLD / GO faces. No humans, no logos, no handle names. The chair, coat, lamp and window stand in for people.
5. Motion vocabulary: boil (always pass S), squash on the beat (`squash: 0.1*pulse(S,6)` or a hop with `Math.sin(Math.PI*f)`), entrances with `api.ease.back`, exits with `ease.in`, holds with a slow push (scale 1 -> 1.05 about the focus) so no frame is dead.
6. Something moves in every part of a shot: blink is automatic, the antenna bulb pulses, add a second mover (dust, LEDs, sparkles, zzz, confetti).
7. Build the same room with `humanRoom`; build the same crowd with `crowd`; do not redraw the chair by hand.
8. Pure functions only: no Math.random, Date, state between frames. Randomness from `kit.h1(n)` / `api.rng(seed)`.
9. A0.js is a worked example of chirp-driven LEDs (`ledLevels`), pop-out of a box (`rack` part back/front), a window push into `humanRoom`.
