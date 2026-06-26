/**
 * Openings curriculum — data-driven, instructive opening lines.
 *
 * Each opening has a short "idea" (the plan), a MAIN line, and one or more
 * side lines (variations). A line is a full sequence of SAN moves from move 1
 * (variations repeat the shared prefix — simple and robust); the player computes
 * the board positions by applying the SAN moves with chess.js. Attach a `note`
 * to the moves worth explaining.
 *
 * To add an opening: add an entry here. Run the validator in openings.test-ish
 * (or `node` with chess.js) to confirm every SAN is legal.
 */

export interface OpeningMove {
  san: string;
  /** Shown when the line reaches this move. Keep it to one instructive idea. */
  note?: string;
}

export interface OpeningLine {
  id: string;
  /** e.g. "Main line — Giuoco Piano", "Two Knights Defence". */
  name: string;
  /** One-line gist of what this line is about. */
  blurb: string;
  moves: OpeningMove[];
}

export interface Opening {
  slug: string;
  name: string;
  color: "White" | "Black";
  eco: string;
  glyph: string;
  /** One-liner for the catalogue card. */
  summary: string;
  /** The plan: what this side is trying to achieve. A short paragraph. */
  idea: string;
  /** lines[0] is the main line; the rest are side lines. */
  lines: OpeningLine[];
}

export const OPENINGS: Opening[] = [
  {
    slug: "italian-game",
    name: "Italian Game",
    color: "White",
    eco: "C50–C54",
    glyph: "♗",
    summary: "1.e4 e5 2.Nf3 Nc6 3.Bc4 — rapid development, eyes on f7.",
    idea: "One of the oldest openings. White develops naturally, points the bishop at Black's weakest square (f7), castles quickly, and builds a big centre with c3 and d4. It's friendly for beginners because every piece has an obvious, good square.",
    lines: [
      {
        id: "giuoco-piano",
        name: "Main line — Giuoco Piano",
        blurb: "The 'quiet game': both sides develop and fight for the centre with c3 + d4.",
        moves: [
          { san: "e4", note: "Claim the centre and open lines for the bishop and queen." },
          { san: "e5", note: "Black answers symmetrically, staking an equal claim in the centre." },
          { san: "Nf3", note: "Develop with a threat — the knight attacks the e5 pawn." },
          { san: "Nc6", note: "Black defends e5 and develops a piece. Natural and best." },
          { san: "Bc4", note: "The Italian bishop. It aims straight at f7 — the only square defended just by Black's king." },
          { san: "Bc5", note: "Black mirrors, pointing the bishop at White's f2." },
          { san: "c3", note: "The key idea: prepare d4 to build a strong pawn centre. It also makes a home for the bishop on c2 later." },
          { san: "Nf6", note: "Black develops and attacks e4." },
          { san: "d3", note: "The modern, solid choice (the 'Giuoco Pianissimo'): support e4 and plan a slow build-up rather than an early d4 clash." },
          { san: "d6", note: "Black supports e5 and frees the light-squared bishop. The position is symmetric and balanced." },
          { san: "O-O", note: "King safety first. White will follow with Re1, Nbd2–f1–g3, and a kingside build-up." },
          { san: "O-O", note: "Both kings are safe. From here it's a rich, manoeuvring middlegame — exactly what the Italian aims for." },
        ],
      },
      {
        id: "two-knights",
        name: "Two Knights Defence",
        blurb: "Black plays ...Nf6 early, inviting the sharp 4.Ng5 attack on f7.",
        moves: [
          { san: "e4" },
          { san: "e5" },
          { san: "Nf3" },
          { san: "Nc6" },
          { san: "Bc4" },
          { san: "Nf6", note: "Instead of ...Bc5, Black counter-attacks e4 at once. This is the fighting Two Knights Defence." },
          { san: "Ng5", note: "The aggressive try — White piles on f7. It looks crude, but it's genuinely dangerous." },
          { san: "d5", note: "The only good reply: hit the bishop and open the centre before White's attack lands." },
          { san: "exd5", note: "White grabs the pawn." },
          { san: "Na5", note: "The main line — Black chases the strong c4-bishop instead of recapturing, accepting a gambit for fast development and initiative." },
          { san: "Bb5+", note: "White keeps the extra pawn for now. Black gets fast development and the initiative in return — a sharp, double-edged battle for theory lovers." },
        ],
      },
    ],
  },
  {
    slug: "ruy-lopez",
    name: "Ruy López (Spanish)",
    color: "White",
    eco: "C60–C99",
    glyph: "♔",
    summary: "1.e4 e5 2.Nf3 Nc6 3.Bb5 — pressure the knight that guards e5.",
    idea: "The most respected 1.e4 e5 opening. The bishop pins the c6-knight against Black's centre. White castles, plays c3 and d4, and slowly squeezes. It rewards understanding of long-term pressure over quick tactics.",
    lines: [
      {
        id: "closed",
        name: "Main line — Closed Ruy López",
        blurb: "The classical squeeze: a3-retreat, ...a6/...b5, and a slow central build-up.",
        moves: [
          { san: "e4" },
          { san: "e5" },
          { san: "Nf3" },
          { san: "Nc6" },
          { san: "Bb5", note: "The Spanish bishop pins the knight that defends e5 — indirect pressure on the centre." },
          { san: "a6", note: "The Morphy Defence: 'put the question' to the bishop right away." },
          { san: "Ba4", note: "White keeps the pin alive rather than trading on c6." },
          { san: "Nf6", note: "Develop and attack e4 — Black plays actively." },
          { san: "O-O", note: "White calmly castles, offering the e4-pawn (it's safe — tactics favour White)." },
          { san: "Be7", note: "Solid development, preparing to castle." },
          { san: "Re1", note: "Defend e4 and put the rook on the half-open file to come." },
          { san: "b5", note: "Now Black gains space and finally shoos the bishop." },
          { san: "Bb3", note: "The bishop swings to its best diagonal, aiming again at f7. White will follow with c3 and d4 — the famous Spanish squeeze." },
        ],
      },
      {
        id: "berlin",
        name: "Berlin Defence",
        blurb: "The rock-solid ...Nf6 line that trades into a famous tough endgame.",
        moves: [
          { san: "e4" },
          { san: "e5" },
          { san: "Nf3" },
          { san: "Nc6" },
          { san: "Bb5" },
          { san: "Nf6", note: "The Berlin — instead of ...a6, Black hits e4 immediately. Famous as a fortress at the top level." },
          { san: "O-O", note: "White castles and offers e4." },
          { san: "Nxe4", note: "Black grabs it; the point is that White can't win the piece back cleanly with advantage." },
          { san: "d4", note: "Open the centre to exploit the lead in development." },
          { san: "Nd6", note: "The knight retreats to hit the bishop and stay solid." },
          { san: "Bxc6", note: "White trades to damage Black's pawns and head for the well-known Berlin endgame — small but lasting pressure." },
          { san: "dxc6" },
          { san: "dxe5" },
          { san: "Nf5", note: "Queens come off next (Qxd8+); the resulting endgame is the Berlin 'Wall' — extremely solid for Black, a long grind for White." },
        ],
      },
    ],
  },
  {
    slug: "sicilian-defence",
    name: "Sicilian Defence",
    color: "Black",
    eco: "B20–B99",
    glyph: "♛",
    summary: "1.e4 c5 — the sharpest, most popular answer to 1.e4.",
    idea: "Black declines symmetry and fights for the centre from the side with the c-pawn. Black accepts an open, unbalanced game where the half-open c-file and queenside play give real winning chances — which is why it's the choice of attackers.",
    lines: [
      {
        id: "najdorf",
        name: "Main line — Najdorf",
        blurb: "The most famous Sicilian: ...a6 keeps options flexible before deciding on a plan.",
        moves: [
          { san: "e4" },
          { san: "c5", note: "The Sicilian. Black meets a centre pawn with a flank pawn, heading for an unbalanced fight." },
          { san: "Nf3", note: "White develops and prepares d4." },
          { san: "d6", note: "Black supports a future ...e5/...Nf6 and opens the c8-bishop's diagonal later." },
          { san: "d4", note: "White strikes in the centre — the Open Sicilian." },
          { san: "cxd4", note: "Black trades the flank pawn for a centre pawn and gets the half-open c-file." },
          { san: "Nxd4", note: "White recaptures with the knight, reaching the main Open Sicilian tabiya." },
          { san: "Nf6", note: "Attack e4 and develop." },
          { san: "Nc3", note: "Defend e4 and develop. Both sides are fully mobilised for battle." },
          { san: "a6", note: "The Najdorf move! Tiny but deep: it stops Nb5/Bb5 ideas and keeps every plan open (...e5, ...e6, ...b5)." },
          { san: "Be2", note: "A calm, classical setup. White will castle and choose a plan; Black gets active queenside play. One of chess's richest battlegrounds." },
        ],
      },
      {
        id: "dragon",
        name: "Dragon Variation",
        blurb: "Black fianchettoes the bishop to g7 — fierce opposite-side castling races.",
        moves: [
          { san: "e4" },
          { san: "c5" },
          { san: "Nf3" },
          { san: "d6" },
          { san: "d4" },
          { san: "cxd4" },
          { san: "Nxd4" },
          { san: "Nf6" },
          { san: "Nc3" },
          { san: "g6", note: "The Dragon — Black will fianchetto the bishop on g7, aiming it down the long diagonal at White's queenside." },
          { san: "Be3", note: "White prepares the Yugoslav Attack: Qd2, O-O-O, and a pawn storm with h4-h5." },
          { san: "Bg7", note: "The Dragon bishop is a monster. Both sides castle opposite and race to mate — one of the sharpest openings in all of chess." },
        ],
      },
    ],
  },
  {
    slug: "caro-kann",
    name: "Caro-Kann Defence",
    color: "Black",
    eco: "B10–B19",
    glyph: "♝",
    summary: "1.e4 c6 — solid, sound, and hard to break down.",
    idea: "Black prepares ...d5 to challenge the centre while keeping a healthy pawn structure (unlike the French, the light-squared bishop gets out first). A favourite of players who want a rock-solid, low-risk defence with real endgame chances.",
    lines: [
      {
        id: "classical",
        name: "Main line — Classical",
        blurb: "Black develops the 'good' bishop to f5 before locking the centre.",
        moves: [
          { san: "e4" },
          { san: "c6", note: "Quietly preparing ...d5 with support, without blocking the light-squared bishop." },
          { san: "d4", note: "White builds the big centre." },
          { san: "d5", note: "Black challenges it immediately." },
          { san: "Nc3", note: "Defend e4 and develop, inviting the trade." },
          { san: "dxe4", note: "Black clears the centre." },
          { san: "Nxe4", note: "White has a lead in development and more space." },
          { san: "Bf5", note: "The whole point of the Caro-Kann: the light-squared bishop gets active OUTSIDE the pawn chain before ...e6 shuts it in." },
          { san: "Ng3", note: "Hit the bishop." },
          { san: "Bg6", note: "It retreats to a safe, useful diagonal. Black will play ...e6, ...Nd7, ...Ngf6 with a solid, resilient position." },
        ],
      },
      {
        id: "advance",
        name: "Advance Variation",
        blurb: "White grabs space with e5; Black chips away at the chain with ...c5/...Nc6.",
        moves: [
          { san: "e4" },
          { san: "c6" },
          { san: "d4" },
          { san: "d5" },
          { san: "e5", note: "The Advance — White gains space and closes the centre instead of trading." },
          { san: "Bf5", note: "Again, the bishop escapes the pawn chain first. This is the key difference from the French Defence." },
          { san: "Nf3", note: "Develop naturally; White will support the centre with Be2, O-O, and c3." },
          { san: "e6", note: "Now Black builds the chain and prepares to undermine d4." },
          { san: "Be2", note: "Solid development." },
          { san: "c5", note: "Black strikes at the base of White's chain (d4) — the standard plan to free the position." },
        ],
      },
    ],
  },
  {
    slug: "queens-gambit",
    name: "Queen's Gambit",
    color: "White",
    eco: "D06–D69",
    glyph: "♕",
    summary: "1.d4 d5 2.c4 — offer a pawn to dominate the centre.",
    idea: "Not a true gambit: if Black grabs c4, White regains it easily and gains time. The point is to deflect Black's d5-pawn so White can plant a pawn on e4 or pile pressure down the c-file. Classical, strategic, and hugely respected.",
    lines: [
      {
        id: "qgd",
        name: "Main line — Queen's Gambit Declined",
        blurb: "Black holds the centre with ...e6; a classical strategic battle.",
        moves: [
          { san: "d4" },
          { san: "d5" },
          { san: "c4", note: "The gambit: offer the c-pawn to pull Black's d5-pawn away from the centre." },
          { san: "e6", note: "Declining solidly — Black supports d5 and opens the dark-squared bishop. The most classical reply." },
          { san: "Nc3", note: "Develop and add a third attacker to d5." },
          { san: "Nf6", note: "Defend d5 and develop." },
          { san: "Bg5", note: "Pin the f6-knight to increase pressure on d5." },
          { san: "Be7", note: "Break the pin's sting and prepare to castle." },
          { san: "e3", note: "Modest but strong: open the bishop and keep a rock-solid centre." },
          { san: "O-O", note: "Both sides are solid. White will develop Nf3, Bd3, castle, and play for the central break or minority attack on the queenside." },
        ],
      },
      {
        id: "qga",
        name: "Queen's Gambit Accepted",
        blurb: "Black takes the pawn, gives up the centre for quick piece play.",
        moves: [
          { san: "d4" },
          { san: "d5" },
          { san: "c4" },
          { san: "dxc4", note: "Accepting. Black won't try to hold the pawn — the goal is fast, free development." },
          { san: "Nf3", note: "Calm and best: stop ...e5 and develop before recapturing." },
          { san: "Nf6", note: "Develop and control the centre squares." },
          { san: "e3", note: "Open the bishop's path to c4." },
          { san: "e6", note: "Free the f8-bishop and prepare ...c5." },
          { san: "Bxc4", note: "White regains the pawn with a strong centre and easy development — exactly what the gambit promised." },
          { san: "c5", note: "Black hits d4 at once to free the game. A sound, active way to meet the Queen's Gambit." },
        ],
      },
    ],
  },
  {
    slug: "kings-indian-defence",
    name: "King's Indian Defence",
    color: "Black",
    eco: "E60–E99",
    glyph: "♞",
    summary: "1.d4 Nf6 2.c4 g6 — let White build the centre, then blow it up.",
    idea: "A hypermodern defence: Black hands White a big pawn centre, fianchettoes the bishop to g7, then counter-attacks with ...e5 (and often a kingside pawn storm ...f5-f4-g4). High-risk, high-reward — the choice of fighters like Fischer and Kasparov.",
    lines: [
      {
        id: "classical",
        name: "Main line — Classical",
        blurb: "Black strikes the centre with ...e5; White expands with d5 and the fight is on.",
        moves: [
          { san: "d4" },
          { san: "Nf6", note: "Control e4 without committing a centre pawn — the hypermodern idea." },
          { san: "c4" },
          { san: "g6", note: "Prepare the fianchetto: the g7-bishop will rake the long diagonal." },
          { san: "Nc3" },
          { san: "Bg7", note: "The King's Indian bishop. It eyes d4 and the whole queenside." },
          { san: "e4", note: "White accepts the invitation and builds a broad pawn centre." },
          { san: "d6", note: "Support the coming ...e5 break." },
          { san: "Nf3" },
          { san: "O-O", note: "King safety before the storm." },
          { san: "Be2" },
          { san: "e5", note: "The thematic strike! Black challenges the centre. White usually answers d5, closing it — then both sides attack on opposite wings." },
        ],
      },
      {
        id: "fianchetto",
        name: "Fianchetto Variation",
        blurb: "White also fianchettoes (g3, Bg2) for a calmer, safer setup.",
        moves: [
          { san: "d4" },
          { san: "Nf6" },
          { san: "c4" },
          { san: "g6" },
          { san: "Nf3" },
          { san: "Bg7" },
          { san: "g3", note: "White meets the fianchetto with a fianchetto — the safest, most positional way to handle the King's Indian." },
          { san: "O-O" },
          { san: "Bg2" },
          { san: "d6" },
          { san: "O-O", note: "Both kings tucked away behind fianchettoed bishops. The game is calmer and more strategic than the sharp Classical lines." },
        ],
      },
    ],
  },
  {
    slug: "french-defence",
    name: "French Defence",
    color: "Black",
    eco: "C00–C19",
    glyph: "♟",
    summary: "1.e4 e6 — solid, with a fierce counter-attack on the centre.",
    idea: "Black invites White to build a big centre, then strikes back at it with ...c5 and ...f6. The one drawback is the 'bad' light-squared bishop, hemmed in by the ...e6/...d5 pawns — so much of French strategy is about activating or trading that bishop.",
    lines: [
      {
        id: "advance",
        name: "Main line — Advance Variation",
        blurb: "White grabs space with e5; Black hammers the d4 base with ...c5.",
        moves: [
          { san: "e4" },
          { san: "e6", note: "Preparing ...d5 with a solid pawn — but it shuts in the c8-bishop, the French's eternal problem child." },
          { san: "d4" },
          { san: "d5", note: "Challenging the centre at once." },
          { san: "e5", note: "The Advance: White gains space and locks the centre, gambling that the extra room outweighs the closed structure." },
          { san: "c5", note: "The thematic break — Black attacks the base of the chain (d4) immediately." },
          { san: "c3", note: "Defend d4 and keep the chain intact." },
          { san: "Nc6", note: "Pile a second attacker onto d4." },
          { san: "Nf3", note: "Develop and defend d4 a third time." },
          { san: "Qb6", note: "A third hit on d4 and pressure on b2 — the classic French queen sortie. The whole game revolves around the d4 point." },
        ],
      },
      {
        id: "winawer",
        name: "Winawer Variation",
        blurb: "Black pins with ...Bb4 and damages White's pawns for sharp, unbalanced play.",
        moves: [
          { san: "e4" },
          { san: "e6" },
          { san: "d4" },
          { san: "d5" },
          { san: "Nc3", note: "Defending e4 and developing — the most ambitious try." },
          { san: "Bb4", note: "The Winawer pin: Black attacks the knight that guards e4 and threatens to wreck White's queenside pawns." },
          { san: "e5", note: "White gains space and asks the bishop what it intends." },
          { san: "c5", note: "Strike the centre — typical French counterplay." },
          { san: "a3", note: "Put the question to the bishop." },
          { san: "Bxc3+", note: "Black trades, doubling White's c-pawns. Black gets the bishop pair and pawn targets; White gets the centre and attacking chances — one of the most double-edged openings around." },
        ],
      },
    ],
  },
  {
    slug: "scandinavian-defence",
    name: "Scandinavian Defence",
    color: "Black",
    eco: "B01",
    glyph: "♛",
    summary: "1.e4 d5 — challenge the centre on move one.",
    idea: "Black hits e4 immediately. White usually takes, and Black recaptures with the queen (then tucks it to safety) or with a knight after a gambit. It's easy to learn — Black reaches a sound, familiar structure without much theory.",
    lines: [
      {
        id: "mainline",
        name: "Main line — 3...Qa5",
        blurb: "Recapture with the queen, retreat to a5, then develop solidly.",
        moves: [
          { san: "e4" },
          { san: "d5", note: "The Scandinavian — a direct challenge to e4 on the very first move." },
          { san: "exd5", note: "White accepts; declining gives Black an easy game." },
          { san: "Qxd5", note: "The classical recapture. The downside: the queen is exposed." },
          { san: "Nc3", note: "Develop with tempo — the knight attacks the queen." },
          { san: "Qa5", note: "The main retreat: the queen stays active and eyes the kingside, while sidestepping the knight." },
          { san: "d4", note: "White takes the full centre." },
          { san: "Nf6", note: "Develop and prepare ...c6, ...Bf5/...Bg4." },
          { san: "Nf3", note: "Natural development." },
          { san: "c6", note: "A useful little move: it gives the a5-queen a retreat square (c7) and supports ...d5 ideas. Black will follow with ...Bf5, ...e6, ...Be7 — solid and easy to play." },
        ],
      },
      {
        id: "modern",
        name: "Modern (3...Nf6)",
        blurb: "Don't recapture yet — develop the knight and win the pawn back later.",
        moves: [
          { san: "e4" },
          { san: "d5" },
          { san: "exd5" },
          { san: "Nf6", note: "The Modern Scandinavian: instead of ...Qxd5, Black develops and will regain the pawn without exposing the queen." },
          { san: "d4", note: "White tries to hold the extra pawn with support (the Portuguese/main lines branch here)." },
          { san: "Nxd5", note: "Black simply takes it back. The knight sits well centralised on d5." },
          { san: "Nf3", note: "Develop sensibly." },
          { san: "g6", note: "A flexible setup — Black fianchettoes the bishop to g7, pressuring the centre. A comfortable, low-theory way to play the Scandinavian." },
        ],
      },
    ],
  },
  {
    slug: "scotch-game",
    name: "Scotch Game",
    color: "White",
    eco: "C44–C45",
    glyph: "♘",
    summary: "1.e4 e5 2.Nf3 Nc6 3.d4 — open the centre early.",
    idea: "Instead of the slow Italian/Spanish, White strikes in the centre at once with d4. The early trade opens lines and leads to clear, piece-driven play — a great practical weapon that sidesteps heavy Ruy López theory.",
    lines: [
      {
        id: "mainline",
        name: "Main line — 4...Nf6",
        blurb: "Both knights out; White accepts doubled pawns for a strong centre and bishop pair.",
        moves: [
          { san: "e4" },
          { san: "e5" },
          { san: "Nf3" },
          { san: "Nc6" },
          { san: "d4", note: "The Scotch — strike the centre immediately rather than building up slowly." },
          { san: "exd4", note: "Black accepts the trade; otherwise White takes on e5 with a fine game." },
          { san: "Nxd4", note: "White recaptures, with a big, free position and a lead in development." },
          { san: "Nf6", note: "Develop and hit e4." },
          { san: "Nc3", note: "Defend e4 and develop — the solid Four Knights Scotch." },
          { san: "Bb4", note: "Pin the knight to keep e4 under fire." },
          { san: "Nxc6", note: "A key idea: trade on c6 to damage Black's pawns before they can be untangled." },
          { san: "bxc6", note: "Black gets doubled c-pawns but a half-open b-file and the centre; White has the bishop pair and a healthier structure. A balanced, instructive middlegame." },
        ],
      },
      {
        id: "classical",
        name: "Classical (4...Bc5)",
        blurb: "Black develops the bishop actively, hitting the d4-knight.",
        moves: [
          { san: "e4" },
          { san: "e5" },
          { san: "Nf3" },
          { san: "Nc6" },
          { san: "d4" },
          { san: "exd4" },
          { san: "Nxd4" },
          { san: "Bc5", note: "The Classical Scotch — the bishop eyes d4 and f2 and provokes White to commit." },
          { san: "Be3", note: "Defend the knight and offer to trade off the active bishop." },
          { san: "Qf6", note: "Add pressure to d4 and prepare ...Nge7. White typically plays c3 and Nc2, untangling with a small space edge — rich, balanced positions." },
        ],
      },
    ],
  },
  {
    slug: "english-opening",
    name: "English Opening",
    color: "White",
    eco: "A10–A39",
    glyph: "♖",
    summary: "1.c4 — flank pressure on the centre, flexible and positional.",
    idea: "White starts on the wing, controlling the central light square d5 from the side and keeping options open (it can transpose to many systems). A favourite of positional players who like to out-manoeuvre rather than out-calculate.",
    lines: [
      {
        id: "reversed-sicilian",
        name: "Main line — Reversed Sicilian",
        blurb: "Black plays ...e5; it's a Sicilian with colours reversed and White a tempo up.",
        moves: [
          { san: "c4" },
          { san: "e5", note: "Black grabs the centre — this becomes a Sicilian Defence with reversed colours, White enjoying an extra tempo." },
          { san: "Nc3", note: "Develop and reinforce control of d5." },
          { san: "Nf6", note: "Black mirrors." },
          { san: "Nf3", note: "Develop and pressure e5." },
          { san: "Nc6", note: "Defend e5 and develop." },
          { san: "g3", note: "The signature English plan: fianchetto the bishop to g2, where it rakes the long light-square diagonal toward Black's queenside." },
          { san: "d5", note: "Black strikes back in the centre." },
          { san: "cxd5", note: "Open the position." },
          { san: "Nxd5", note: "A balanced, manoeuvring game follows: White will play Bg2, O-O, and press on the long diagonal and the c-file." },
        ],
      },
      {
        id: "symmetrical",
        name: "Symmetrical Variation",
        blurb: "Black copies with ...c5 — a slow, strategic double-fianchetto battle.",
        moves: [
          { san: "c4" },
          { san: "c5", note: "The Symmetrical English — Black answers flank with flank, keeping the game balanced and flexible." },
          { san: "Nc3" },
          { san: "Nc6" },
          { san: "g3", note: "Fianchetto the bishop." },
          { san: "g6", note: "Black does the same — both sides aim their bishops down the long diagonals." },
          { san: "Bg2" },
          { san: "Bg7", note: "A patient, positional struggle for the d4/d5 squares and the central break. Pure strategy — ideal for learning manoeuvring." },
        ],
      },
    ],
  },
];

export function findOpening(slug: string): Opening | undefined {
  return OPENINGS.find((o) => o.slug === slug);
}
