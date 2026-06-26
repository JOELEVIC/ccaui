/**
 * Endgame / checkmate techniques — guided, instructive walkthroughs that start
 * from a given position (startFen) and play out a forced technique move-by-move.
 *
 * This first batch is the essential FORCED MATES (every line ends in #), so they
 * are 100% correct and easy to verify. Classic technical endgames (Lucena,
 * Philidor, K+Q vs K, B+N mate) are best added with engine-verified lines later.
 *
 * Validate every line with chess.js (legality + isCheckmate on the final move)
 * before shipping.
 */

export interface EndgameMove {
  san: string;
  note?: string;
}

export interface EndgameLine {
  id: string;
  name: string;
  blurb: string;
  moves: EndgameMove[];
}

export interface Endgame {
  slug: string;
  name: string;
  glyph: string;
  /** Short result tag, e.g. "White mates in 5". */
  result: string;
  startFen: string;
  orientation: "white" | "black";
  summary: string;
  idea: string;
  lines: EndgameLine[];
}

export const ENDGAME_TECHNIQUES: Endgame[] = [
  {
    slug: "two-rook-mate",
    name: "Two-Rook Mate (Lawnmower)",
    glyph: "♖",
    result: "White mates in 5",
    startFen: "8/8/8/8/4k3/8/R7/1R2K3 w - - 0 1",
    orientation: "white",
    summary: "The 'ladder': two rooks walk the lone king to the edge and mate.",
    idea: "With two rooks you don't even need your king. One rook fences the enemy king onto a rank; the other checks to push it back one rank; then they swap roles and climb like a ladder (a 'lawnmower') until the king is mated on the edge. Keep the rooks far apart so the king can never attack them.",
    lines: [
      {
        id: "ladder",
        name: "The ladder to the edge",
        blurb: "Alternate rook checks, climbing one rank at a time, until mate on the 8th.",
        moves: [
          { san: "Ra4+", note: "The first rung: this rook fences the king onto the 4th rank — it must step up." },
          { san: "Ke5" },
          { san: "Rb5+", note: "Now the OTHER rook checks from the next rank, driving the king up again. Notice the rooks are far apart, safe from the king." },
          { san: "Ke6" },
          { san: "Ra6+", note: "Swap roles: the a-rook climbs and checks. Always check with the rook the king isn't near." },
          { san: "Ke7" },
          { san: "Rb7+", note: "Up another rank. The king is running out of board." },
          { san: "Ke8" },
          { san: "Ra8#", note: "Mate! The king is pinned to the 8th rank by one rook while the other seals the 7th. The lawnmower is complete." },
        ],
      },
    ],
  },
  {
    slug: "smothered-mate",
    name: "Smothered Mate",
    glyph: "♞",
    result: "White mates in 4",
    startFen: "5r1k/6pp/4Q3/6N1/8/8/8/6K1 w - - 0 1",
    orientation: "white",
    summary: "Philidor's Legacy: a knight mates a king buried by its own pieces.",
    idea: "When a king is hemmed in by its own pawns and pieces, a lone knight can deliver mate — because the knight can't be blocked. The famous combination uses a double check and a queen sacrifice to force the king into the corner and slam its own rook beside it.",
    lines: [
      {
        id: "philidors-legacy",
        name: "Philidor's Legacy",
        blurb: "Nf7+, Nh6+ (double check!), Qg8+!! Rxg8, Nf7#.",
        moves: [
          { san: "Nf7+", note: "The knight checks from f7. The king must step to g8 — its only flight square." },
          { san: "Kg8" },
          { san: "Nh6+", note: "Double check! The knight checks from h6 AND uncovers the queen on the e6–g8 diagonal. In a double check the king MUST move — and g8's only legal retreat is back to h8 (f8 is blocked by its own rook)." },
          { san: "Kh8" },
          { san: "Qg8+", note: "The stunning queen sacrifice! It can't be taken by the king (the h6-knight guards g8), so the rook is forced to capture — plugging the king's last escape." },
          { san: "Rxg8" },
          { san: "Nf7#", note: "Smothered mate. The knight returns to f7; the h8-king is buried by its own rook on g8 and pawns on g7/h7, with no way to block a knight." },
        ],
      },
    ],
  },
  {
    slug: "back-rank-mate",
    name: "Back-Rank Mate",
    glyph: "♜",
    result: "White mates in 1",
    startFen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    orientation: "white",
    summary: "A king trapped behind its own pawns is mated along the back rank.",
    idea: "A castled king is safe — until the back rank becomes a weakness. If the three pawns in front of the king never move, a rook or queen arriving on the back rank is checkmate: the king has no escape. The lesson cuts both ways — give your own king 'luft' (a little air, e.g. h3 or g3) so this can't happen to you.",
    lines: [
      {
        id: "the-mate",
        name: "The trap behind the pawns",
        blurb: "The rook lands on the 8th; the king is fenced in by f7/g7/h7.",
        moves: [
          { san: "Ra8#", note: "Mate. The rook controls the whole 8th rank, and the king's own pawns on f7, g7 and h7 leave it nowhere to run. Had a pawn made luft (say ...h6), there'd be no mate — that's the defensive lesson." },
        ],
      },
    ],
  },
];

export function findEndgame(slug: string): Endgame | undefined {
  return ENDGAME_TECHNIQUES.find((e) => e.slug === slug);
}
