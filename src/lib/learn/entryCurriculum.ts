import type { World } from "./types";

/**
 * The Entry world. Each stage is a "village" on the map; lessons unlock in order.
 * Positions are king-less (loaded with skipValidation) so a pawn can stand alone
 * on an otherwise empty board, exactly as a beginner first meets it.
 *
 * Adding content = adding data here. No component changes required.
 */
export const ENTRY_WORLD: World = [
  {
    id: "pawn-village",
    name: "Pawn Village",
    tagline: "The soul of chess",
    icon: "♟",
    accent: "#769656",
    lessons: [
      {
        id: "pawn-march",
        title: "The Pawn's March",
        blurb: "How the humble pawn moves",
        icon: "♟",
        steps: [
          {
            kind: "say",
            text: "Meet the pawn — the soul of chess. It only ever marches forward, never backward.",
            board: "8/8/8/8/8/8/4P3/8 w - - 0 1",
            spotlight: ["e2"],
          },
          {
            kind: "do",
            text: "From its home square a pawn may step one or two squares forward. Walk it up to e5.",
            say: "From its home square a pawn may step one or two squares forward. Walk it up to e5.",
            board: "8/8/8/8/8/8/4P3/8 w - - 0 1",
            goal: { type: "reach", square: "e5" },
            spotlight: ["e3", "e4"],
            hint: "Click the pawn, then a square ahead. Its first move can be two squares: e2 to e4.",
          },
          {
            kind: "say",
            text: "After that first leap, a pawn only steps one square at a time.",
          },
        ],
        tip: "Pawns move straight forward — one square, or two on their very first move.",
      },
      {
        id: "pawn-promote",
        title: "Crowning Glory",
        blurb: "Reach the end, become a queen",
        icon: "♛",
        steps: [
          {
            kind: "say",
            text: "A pawn brave enough to reach the far side is rewarded — it transforms into a far stronger piece.",
            board: "8/4P3/8/8/8/8/8/8 w - - 0 1",
            spotlight: ["e7", "e8"],
          },
          {
            kind: "do",
            text: "Push the pawn to the last rank and let it become a Queen.",
            board: "8/4P3/8/8/8/8/8/8 w - - 0 1",
            goal: { type: "promote" },
            spotlight: ["e8"],
            hint: "Move the e7 pawn to e8 — here it promotes straight to a Queen.",
          },
          {
            kind: "say",
            text: "You usually choose a Queen, the most powerful piece — but a Rook, Bishop, or Knight are also allowed.",
          },
        ],
        tip: "Reach the last rank to promote — a new Queen is almost always the right choice.",
      },
      {
        id: "pawn-capture",
        title: "First Blood",
        blurb: "Pawns strike sideways",
        icon: "⚔",
        steps: [
          {
            kind: "say",
            text: "Pawns capture in a way all their own — not how they move.",
            board: "8/8/8/3p4/4P3/8/8/8 w - - 0 1",
            spotlight: ["d5"],
          },
          {
            kind: "do",
            text: "A pawn captures one square diagonally forward, never straight ahead. Take the enemy pawn on d5.",
            board: "8/8/8/3p4/4P3/8/8/8 w - - 0 1",
            goal: { type: "move", uci: ["e4d5"] },
            spotlight: ["d5"],
            hint: "Move your e4 pawn diagonally onto d5 to capture it.",
          },
          {
            kind: "say",
            text: "So a pawn moves straight but strikes sideways. Keep that difference in mind.",
          },
        ],
        tip: "Pawns move forward but capture diagonally.",
      },
      {
        id: "pawn-duel",
        title: "The Standoff",
        blurb: "Break a blocked pawn",
        icon: "⚑",
        steps: [
          {
            kind: "say",
            text: "When two pawns meet head-on, neither can pass — pawns can't capture straight ahead.",
            board: "8/8/8/3pp3/4P3/8/8/8 w - - 0 1",
            spotlight: ["e4", "e5"],
          },
          {
            kind: "do",
            text: "Your e4 pawn is blocked by e5. But a neighbour waits on d5 — break the deadlock with a diagonal capture.",
            board: "8/8/8/3pp3/4P3/8/8/8 w - - 0 1",
            goal: { type: "move", uci: ["e4d5"] },
            spotlight: ["d5"],
            hint: "Capture diagonally: the e4 pawn takes on d5.",
          },
        ],
        tip: "A pawn blocked head-on can still strike sideways to break through.",
      },
      {
        id: "pawn-enpassant",
        title: "In Passing",
        blurb: "Chess's trickiest rule",
        icon: "✦",
        steps: [
          {
            kind: "say",
            text: "Now the trickiest rule in all of chess: en passant — French for 'in passing'.",
          },
          {
            kind: "say",
            text: "Black's pawn just rushed two squares, from d7 to d5, sliding right past your pawn on e5 — as if to sneak by.",
            board: "8/8/8/3pP3/8/8/8/8 w - d6 0 1",
            spotlight: ["d5", "e5"],
          },
          {
            kind: "do",
            text: "You may capture it in passing: move your pawn onto the empty square it skipped — d6 — and the runaway pawn is removed.",
            board: "8/8/8/3pP3/8/8/8/8 w - d6 0 1",
            goal: { type: "move", uci: ["e5d6"] },
            spotlight: ["d6"],
            hint: "Move the e5 pawn diagonally to the empty d6 square. The black pawn on d5 vanishes — captured in passing.",
          },
          {
            kind: "say",
            text: "But you must do it at once. Wait even a single move and the chance is gone forever.",
          },
        ],
        tip: "En passant captures a pawn that just dashed two squares past yours — landing on the square it skipped, and only immediately.",
      },
    ],
  },
  {
    id: "piece-plaza",
    name: "Piece Plaza",
    tagline: "Meet the whole army",
    icon: "♞",
    accent: "#567a9e",
    lessons: [
      {
        id: "knight-leap",
        title: "The Cavalry",
        blurb: "The knight's L-shaped leap",
        icon: "♞",
        steps: [
          {
            kind: "say",
            text: "The knight is the cavalry. It leaps in an L — two squares one way, then one across — and alone among the pieces, it jumps over anything in its path.",
            board: "8/8/8/8/4N3/8/8/8 w - - 0 1",
            spotlight: ["e4"],
          },
          {
            kind: "do",
            text: "Hop the knight to f6 — an L-shaped jump: two up, one across.",
            board: "8/8/8/8/4N3/8/8/8 w - - 0 1",
            goal: { type: "reach", square: "f6" },
            spotlight: ["f6"],
            hint: "From e4 the knight reaches f6: two squares up, one to the right.",
          },
        ],
        tip: "Knights move in an L and can jump over other pieces.",
      },
      {
        id: "bishop-diagonal",
        title: "The Glider",
        blurb: "Bishops rule the diagonals",
        icon: "♝",
        steps: [
          {
            kind: "say",
            text: "The bishop glides along diagonals as far as the road is clear. Each bishop keeps to one square colour for the entire game.",
            board: "8/8/8/8/4B3/8/8/8 w - - 0 1",
            spotlight: ["e4"],
          },
          {
            kind: "do",
            text: "Slide the bishop up its diagonal to h7.",
            board: "8/8/8/8/4B3/8/8/8 w - - 0 1",
            goal: { type: "reach", square: "h7" },
            spotlight: ["h7"],
            hint: "The light diagonal runs e4–f5–g6–h7.",
          },
        ],
        tip: "Bishops move diagonally and never change square colour.",
      },
      {
        id: "rook-lines",
        title: "The Battering Ram",
        blurb: "Rooks charge in straight lines",
        icon: "♜",
        steps: [
          {
            kind: "say",
            text: "The rook is a battering ram — it charges in straight lines, along ranks and files, as far as it likes.",
            board: "8/8/8/8/4R3/8/8/8 w - - 0 1",
            spotlight: ["e4"],
          },
          {
            kind: "do",
            text: "Send the rook straight up the e-file to e8.",
            board: "8/8/8/8/4R3/8/8/8 w - - 0 1",
            goal: { type: "reach", square: "e8" },
            spotlight: ["e8"],
            hint: "Rooks move in straight lines — e4 straight up to e8.",
          },
        ],
        tip: "Rooks move in straight lines along ranks and files.",
      },
      {
        id: "queen-power",
        title: "Her Majesty",
        blurb: "The most powerful piece",
        icon: "♛",
        steps: [
          {
            kind: "say",
            text: "The queen is rook and bishop combined — she sweeps any straight or diagonal line. Treat her with respect.",
            board: "8/1p6/8/8/4Q3/8/8/8 w - - 0 1",
            spotlight: ["e4", "b7"],
          },
          {
            kind: "do",
            text: "Use the queen's long reach to capture the pawn on b7.",
            board: "8/1p6/8/8/4Q3/8/8/8 w - - 0 1",
            goal: { type: "capture" },
            spotlight: ["b7"],
            hint: "The queen travels any straight or diagonal line — e4 to b7 is one diagonal: e4–d5–c6–b7.",
          },
        ],
        tip: "The queen combines rook and bishop — guard her, and use her reach.",
      },
      {
        id: "king-steps",
        title: "The Precious King",
        blurb: "Slow, but everything",
        icon: "♚",
        steps: [
          {
            kind: "say",
            text: "The king is precious but slow — he steps just one square in any direction. Lose him and the game is over, so keep him safe.",
            board: "8/8/8/8/4K3/8/8/8 w - - 0 1",
            spotlight: ["e4"],
          },
          {
            kind: "do",
            text: "Take one careful step — move the king up to e5.",
            board: "8/8/8/8/4K3/8/8/8 w - - 0 1",
            goal: { type: "reach", square: "e5" },
            spotlight: ["e5"],
            hint: "The king moves one square in any direction: e4 to e5.",
          },
        ],
        tip: "The king moves one square at a time — protect him above all else.",
      },
    ],
  },
  {
    id: "coordinate-heights",
    name: "Coordinate Heights",
    tagline: "Read the board",
    icon: "▦",
    accent: "#8b5cf6",
    lessons: [
      {
        id: "board-files-ranks",
        title: "Every Square Has a Name",
        blurb: "Files, ranks & addresses",
        icon: "▦",
        steps: [
          {
            kind: "say",
            text: "Every square has an address. Columns are files, labelled a to h. Rows are ranks, numbered 1 to 8.",
            board: "8/8/8/8/8/8/8/N7 w - - 0 1",
            spotlight: ["a1"],
          },
          {
            kind: "do",
            text: "A square's name is its file letter then its rank number. Move the knight to c2.",
            board: "8/8/8/8/8/8/8/N7 w - - 0 1",
            goal: { type: "reach", square: "c2" },
            spotlight: ["c2"],
            hint: "Files run left to right a–h; ranks run bottom to top 1–8. c2 is the third file, second rank.",
          },
        ],
        tip: "A square's name is its file letter then its rank number, like e4.",
      },
      {
        id: "board-diagonals",
        title: "The Long Roads",
        blurb: "Diagonals corner to corner",
        icon: "⟋",
        steps: [
          {
            kind: "say",
            text: "Diagonals are the slanting roads bishops and queens love. The longest stretch from corner to corner.",
            board: "8/8/8/8/8/8/8/B7 w - - 0 1",
            spotlight: ["a1"],
          },
          {
            kind: "do",
            text: "Travel the long diagonal from a1 all the way to h8.",
            board: "8/8/8/8/8/8/8/B7 w - - 0 1",
            goal: { type: "reach", square: "h8" },
            spotlight: ["h8"],
            hint: "a1–b2–c3–d4–e5–f6–g7–h8 is the longest diagonal on the board.",
          },
        ],
        tip: "Diagonals run corner-ward; a1–h8 and a8–h1 are the longest.",
      },
    ],
  },
  {
    id: "teamwork-glade",
    name: "Teamwork Glade",
    tagline: "Pieces working together",
    icon: "✦",
    accent: "#C5A059",
    lessons: [
      {
        id: "combine-hanging",
        title: "Don't Hang a Piece",
        blurb: "Spot squares under fire",
        icon: "⚠",
        steps: [
          {
            kind: "say",
            text: "A piece sitting where the enemy can take it for nothing is 'hanging' — a gift you never meant to give.",
            board: "3r4/8/8/8/8/4N3/8/8 w - - 0 1",
            spotlight: ["d8"],
          },
          {
            kind: "say",
            text: "This rook on d8 guards the entire d-file. Any piece you place on that file is in danger.",
            board: "3r4/8/8/8/8/4N3/8/8 w - - 0 1",
            spotlight: ["d8", "d5", "d4", "d3", "d2", "d1"],
          },
          {
            kind: "do",
            text: "Develop your knight actively — but stay out of the rook's reach. Leap to f5.",
            board: "3r4/8/8/8/8/4N3/8/8 w - - 0 1",
            goal: { type: "move", uci: ["e3f5"] },
            spotlight: ["f5"],
            hangingHints: true,
            hint: "Choose f5 — active and safe. Avoid d-file squares like d5; the rook would snap your knight up.",
          },
        ],
        tip: "Before every move, ask: can the enemy take this piece for free? Don't leave pieces hanging.",
      },
    ],
  },
];
