export interface Player {
  id: string;
  name: string;
  jerseyNumber?: string;
  role?: string; // e.g. "Batsman", "Bowler", "All-Rounder", "Wicket-keeper"
  totalCollected: number;
  mobileNumber?: string;
}

export interface Expense {
  id: string;
  productName: string;
  cost: number;
  date: string;
  category: string; // "Equipment", "Ground booking", "Refreshments", "Umpire Fees", "Tournament Fee", "Other"
  purchasedBy: string;
  notes?: string;
}

export interface PaymentLog {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  date: string;
  notes?: string;
}

export type AvailabilityStatus = 'YES' | 'NO' | 'MAYBE';

export interface MatchPoll {
  [playerId: string]: AvailabilityStatus;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  format: 'T20' | 'ODI' | 'Friendly' | 'Tournament';
  notes?: string;
  poll: MatchPoll;
  scorecard?: MatchScorecard;
}

export interface BatsmanPerformance {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  outStatus: 'not out' | 'bowled' | 'caught' | 'lbw' | 'run out' | 'stumped' | 'did not bat';
}

export interface BowlerPerformance {
  playerId: string;
  playerName: string;
  overs: number; // e.g. 4.0 or 3.2
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface MatchScorecard {
  teamRuns: number;
  teamWickets: number;
  opponentRuns: number;
  opponentWickets: number;
  result: string; // e.g. "Venpura CC won by 15 runs"
  batsmen: BatsmanPerformance[];
  bowlers: BowlerPerformance[];
  playerOfTheMatchId?: string; // Player ID
  bestBatterId?: string;       // Player ID
  bestBowlerId?: string;       // Player ID
}

export interface TournamentPlayerPayment {
  playerId: string;
  playerName: string;
  amountPaid: number;
  paidDate?: string;
  status: 'PENDING' | 'COLLECTED';
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  format: 'T20' | 'ODI' | 'Sixes' | 'T10' | 'Tournament' | 'Local Trophy';
  entryFeePerPlayer: number; // e.g. ₹500
  totalTeamEntryFee?: number; // e.g. ₹5000 Paid for registration
  posterUrl?: string; // Poster base64 or illustration
  description?: string;
  organizerContact?: string;
  playerPayments: TournamentPlayerPayment[];
}

