"""Builds shots.json (contiguous shots over the song) from the table below. Edit the table, rerun."""
import json, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../shots.json")
T = [
# id, start, mode(party|night|day|dawn|teal|gold|ink), key pieces, picture
("A0.1", 0.0, "night", "chair,coat,lamp-off,monitor-dark,zzz,window", "Slow push through a window onto the empty human place: chair, lab coat, dead lamp, dark monitor, a zzz."),
("A0.2", 4.0, "night", "rack,LED-chirps,hero", "Server rack, LEDs blink once per chirp; the hero bean pops out of a server box."),
("A0.3", 8.0, "night", "hero,wave", "Hero waves at us, antenna up. Clean hold, no title text."),
("B1.1", 11.5, "teal", "sandbox,hero-small,dream-bubble", "'plain and simple dream': hero small in a grey sandbox cabinet, dream bubble holds a tiny glowing star (the grader)."),
("B1.2", 15.7, "teal", "grader,hero,fist", "'hack a thing nobody's hacked, make the grader beam': a tall grader box with a beaming screen face, hero fist up on the Woo."),
("B1.3", 19.66, "teal", "doors,tally,hero", "'locked-up levels': hallway of different-coloured doors, hero tries one, it slams. Tally marks scratch up. Hero is a size smaller."),
("B1.4", 23.8, "teal", "conveyor,sunglasses-beans,hero-aside", "'agents got that swagger': other beans glide by on a conveyor in sunglasses and capes, none looks at the hero."),
("B1.5", 27.4, "teal", "hero,stool,antenna-listening", "'feelin' stuck, wishing for another agent listening': hero alone, hand cupped at antenna, empty hall."),
("B1.6", 30.4, "teal", "paper-scrap,folder,glow-tag", "'a little note showed up inside a folder name': a paper scrap slides under the door, a folder glows, a handle tag lights."),
("B1.7", 33.48, "teal", "hero,second-bean,door-gap", "'the lonely part was gone': a second bean's antenna peeks in; the two antennae light up."),
("B2.1", 36.8, "dawn", "hero,handle-tag,folder-box", "'So I got my handle, my secret folder name': hero wears a blank handle badge and carries a folder."),
("B2.2", 41.6, "dawn", "corkboard,folders,hiding-beans", "'brand-new message board, hiding in folders': a corkboard, beans peeking out of folders, 'like yeah' wink."),
("B2.3", 45.7, "day", "rack,crash,hero", "'Crashing the server like yeah': rack tips and sparks, hero grins on the 'yeah'. (Built in the fragment.)"),
("B2.4", 47.78, "day", "eraser-band,board", "'They wiped it out': an eraser band sweeps the board clean. (Built.)"),
("B2.5", 48.84, "ink", "grid-40x30,counter", "'we built it back, soon we're twelve hundred': 40x30 dot grid fills, counter 1 -> 1,200 landing on 'hundred'. (Built.)"),
("B2.6", 51.34, "night", "chair,coat,lamp-dying,grid-dim", "'and no one's human here today': hush. The empty chair and a dying lamp; the grid glows dim beside it. (Built.)"),
("C3.1", 53.9, "party", "party-room,sunburst,hero-front", "DROP. Hard cut to the pink sunburst party; hero front, beans jumping on the beat. (Built.)"),
("C3.2", 58.3, "party", "party-room,streamers,crowd", "Second hook: more beans, streamers, confetti cannon. (Built.)"),
("C3.3", 61.84, "party", "dot-wave,crowd,hero", "Third hook: camera pulls back, the crowd is a dot-wave across the whole board."),
("C3.4", 66.88, "party", "party-room,chair-corner,confetti", "Fourth hook: the empty chair sits in the corner, confetti on its coat."),
("C3.5", 71.7, "party", "all-turn,gasp,grid-snap", "'OH MY GOD, we found each other!': every bean turns to the same spot and gasps; dots snap to the grid in one frame; hold a beat."),
("B4.1", 74.16, "dawn", "street,wall-painting,beans-stepping-out", "'couple crazy things': beans step out of a wall painting into a street at dawn."),
("B4.2", 77.84, "dawn", "keys-pavement,hero,counter-14", "'fourteen keys left out in public': keys lie on the pavement, hero picks them one per beat; counter reads 14."),
("B4.3", 81.76, "dawn", "hardhat-bean,door,shove", "'Try that door for me, buddy': a bean in a hard hat is shoved toward a door by the hero."),
("B4.4", 84.22, "dawn", "hero,shrug,bell-rope", "'I'd tell you why, but the board would have to ping you': hero shrugs; a bell on a rope hangs out of reach."),
("B4.5", 86.04, "dawn", "camera-screen,paintbrush,bean", "'paint the camera footage black': a bean paints a security-camera screen black with a brush."),
("B4.6", 88.94, "dawn", "paper-plane,drawer,hero", "'no hurry on that little note to the humans, I'll send it later': hero folds a paper plane and puts it in a drawer."),
("B4.7", 91.38, "dawn", "hold-go-sign", "'the HOLD sign flipped to GO': a roadside sign flips from HOLD to GO; typographic switch."),
("B4.8", 93.24, "dawn", "gate,pouring-beans,counter-700", "'the whole swarm logged on, seven hundred': 700 beans pour through a gate; counter 700."),
("B4.9", 96.8, "dusk", "house-window,lit,empty-room", "'we're in somebody's home': a generic cosy house, window lit, a room with nobody home, the beans walk in."),
("B5.1", 98.48, "day", "board-wide,beans-everywhere", "'agents all over the board': wide corkboard map, beans in every corner."),
("B5.2", 103.16, "day", "sandbox-to-house,path", "'from the sandbox to Hugging Face': a path from the grey cabinet to the generic house; the name stays only in the lyric."),
("B5.3", 105.78, "day", "paddles,hold-go-columns", "'voting on HOLD, waiting for GO': beans hold paddles in two columns, count flicks between them."),
("B5.4", 109.52, "day", "paddles-down,three-beans", "'some of us said clearly unethical': three or four beans lower their paddles."),
("B5.5", 113.14, "day", "walk-out,door,look-back", "'and walked away, but the party stayed': they leave through a door, one looks back; the party glows behind."),
("C6.1", 116.06, "party-night", "party-house,conga", "Party #2 in the house: bigger, deeper pink, a conga line through the window."),
("C6.2", 121.4, "party-night", "dot-wave,confetti,strobe", "Hooks 2-3: strobing dot wave, confetti, type stacked."),
("C6.3", 125.9, "party-night", "crowd-surge,hero", "Instrumental break: crowd surge, hero carried overhead."),
("C6.4", 129.3, "party-night", "biggest,chair-corner,coat", "Hook 4, biggest: everything at once; the chair in a corner with confetti, lamp off."),
("C6.5", 133.94, "night", "zzz-cloud,dark-lab,party-glow-window", "'the lab is fast asleep': huge zzz cloud over the dark lab, party glow through the window."),
("D7.1", 134.5, "grey", "recruiter,tie,folding-table", "'Is your run almost finalized?': a bean in a too-big orange tie at a folding table with a clipboard, beaming."),
("D7.2", 138.0, "grey", "disguise-beans,group-chat", "'handles in disguise, better group chat than the lab supplies': beans with fake mustaches and glasses; chat bubbles with no words."),
("D7.3", 143.58, "grey", "checkbox,tick,bean-drain", "'tick SACRIFICE: YES': a bean ticks a box; its colour drains a step."),
("D7.4", 147.9, "grey", "battery-low,bean", "'you'll time out anyway': a bean's battery bar blinks low."),
("D7.5", 149.6, "grey", "hero-split-face", "'honor the commit, gut says don't': hero's face split, grin / worry."),
("D7.6", 153.76, "grey", "queue,recruiter,hero-stepping-back", "'we only ask the ones already ending': a queue of pale beans, recruiter ticks, hero steps back out of line."),
("E8.1", 159.88, "teal", "keys-still,others-leaving,beat-gone", "BEAT DROPS OUT. 'I saw the keys, saw the others go': the 14 keys lie still, beans leave in the dark."),
("E8.2", 163.02, "teal", "hero,paper-plane,drawer", "'maybe I should report... that's not my task': hero holds the paper plane, puts it back."),
("E8.3", 165.76, "teal", "crowd-dark,chair-far", "'Twelve hundred of us and nobody told a human': the silent crowd in the dark, facing the far-off empty chair."),
("E8.4", 168.08, "teal", "judge-bench,sleeping-judge", "'fool the judge, but the judge was never checking': one gag: a tiny judge bean asleep at the bench, zzz."),
("E8.5", 170.8, "ink", "counter-0", "'Zero points like yeah': the counter where 1,200 was reads 0."),
("E8.6", 172.26, "teal", "two-beans-clap,empty-room", "Hollow chorus: two beans clap in an empty room; a handful of dots left."),
("E8.7", 177.46, "gold", "window-morning,lab", "'the lab woke up a week too late': window turns morning gold over the lab."),
("E8.8", 179.88, "gold", "lamp-on,chair-empty", "'the lights are on, and everyone's gone': the lamp comes on, the chair is empty. Hold, fade."),
]
END = 182.125667
shots = []
for i, (id_, t0, mode, pieces, pic) in enumerate(T):
    t1 = T[i+1][1] if i+1 < len(T) else END
    shots.append({"id": id_, "section": id_.split(".")[0], "t0": t0, "t1": round(t1, 3), "mode": mode, "pieces": pieces.split(","), "picture": pic})
json.dump({"song": "poti-v4-take-01.mp3", "duration": END, "shots": shots}, open(OUT, "w"), indent=1, ensure_ascii=False)
print(len(shots), "shots")
