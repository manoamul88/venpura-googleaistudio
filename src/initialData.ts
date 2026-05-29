import { Player, Expense, PaymentLog, Match, Tournament } from './types';

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p0', name: 'Mano', jerseyNumber: '7', role: 'Club Chairman (Admin)', totalCollected: 250, mobileNumber: '9566510045' },
  { id: 'p1', name: 'Rohit Sharma', jerseyNumber: '45', role: 'Batsman (Captain)', totalCollected: 150, mobileNumber: '9000000045' },
  { id: 'p2', name: 'Virat Kohli', jerseyNumber: '18', role: 'Batsman', totalCollected: 150, mobileNumber: '9000000018' },
  { id: 'p3', name: 'Jasprit Bumrah', jerseyNumber: '93', role: 'Bowler', totalCollected: 120, mobileNumber: '9000000093' },
  { id: 'p4', name: 'Ravindra Jadeja', jerseyNumber: '8', role: 'All-Rounder', totalCollected: 120, mobileNumber: '9000000008' },
  { id: 'p5', name: 'Rishabh Pant', jerseyNumber: '17', role: 'Wicket-Keeper', totalCollected: 150, mobileNumber: '9000000017' },
  { id: 'p6', name: 'Hardik Pandya', jerseyNumber: '33', role: 'All-Rounder', totalCollected: 100, mobileNumber: '9000000033' },
  { id: 'p7', name: 'Suryakumar Yadav', jerseyNumber: '63', role: 'Batsman', totalCollected: 120, mobileNumber: '9000000063' },
  { id: 'p8', name: 'KL Rahul', jerseyNumber: '1', role: 'Batsman', totalCollected: 100, mobileNumber: '9000000001' },
  { id: 'p9', name: 'Shubman Gill', jerseyNumber: '77', role: 'Batsman', totalCollected: 120, mobileNumber: '9000000077' },
  { id: 'p10', name: 'Shreyas Iyer', jerseyNumber: '41', role: 'Batsman', totalCollected: 80, mobileNumber: '9000000041' },
  { id: 'p11', name: 'Axar Patel', jerseyNumber: '20', role: 'All-Rounder', totalCollected: 90, mobileNumber: '9000000020' },
  { id: 'p12', name: 'Ravichandran Ashwin', jerseyNumber: '99', role: 'All-Rounder', totalCollected: 150, mobileNumber: '9000000099' },
  { id: 'p13', name: 'Kuldeep Yadav', jerseyNumber: '23', role: 'Bowler', totalCollected: 100, mobileNumber: '9000000023' },
  { id: 'p14', name: 'Yuzvendra Chahal', jerseyNumber: '3', role: 'Bowler', totalCollected: 80, mobileNumber: '9000000003' },
  { id: 'p15', name: 'Mohammed Siraj', jerseyNumber: '73', role: 'Bowler', totalCollected: 90, mobileNumber: '9000000073' },
  { id: 'p16', name: 'Mohammed Shami', jerseyNumber: '11', role: 'Bowler', totalCollected: 120, mobileNumber: '9000000011' },
  { id: 'p17', name: 'Arshdeep Singh', jerseyNumber: '2', role: 'Bowler', totalCollected: 100, mobileNumber: '9000000002' },
  { id: 'p18', name: 'Shardul Thakur', jerseyNumber: '54', role: 'All-Rounder', totalCollected: 80, mobileNumber: '9000000054' },
  { id: 'p19', name: 'Ishan Kishan', jerseyNumber: '32', role: 'Batsman', totalCollected: 100, mobileNumber: '9000000032' },
  { id: 'p20', name: 'Sanju Samson', jerseyNumber: '9', role: 'Wicket-Keeper', totalCollected: 150, mobileNumber: '9000000009' },
  { id: 'p21', name: 'Deepak Chahar', jerseyNumber: '90', role: 'Bowler', totalCollected: 60, mobileNumber: '9000000090' },
  { id: 'p22', name: 'Washington Sundar', jerseyNumber: '5', role: 'All-Rounder', totalCollected: 100, mobileNumber: '9566510005' },
  { id: 'p23', name: 'Ruturaj Gaikwad', jerseyNumber: '31', role: 'Batsman', totalCollected: 120, mobileNumber: '9566510031' },
  { id: 'p24', name: 'Yashasvi Jaiswal', jerseyNumber: '64', role: 'Batsman', totalCollected: 100, mobileNumber: '9566510064' },
  { id: 'p25', name: 'Rinku Singh', jerseyNumber: '35', role: 'Batsman', totalCollected: 120, mobileNumber: '9566510035' },
  { id: 'p26', name: 'Tilak Varma', jerseyNumber: '75', role: 'Batsman', totalCollected: 80, mobileNumber: '9566510075' },
  { id: 'p27', name: 'Prasidh Krishna', jerseyNumber: '24', role: 'Bowler', totalCollected: 80, mobileNumber: '9566510024' },
  { id: 'p28', name: 'Ravi Bishnoi', jerseyNumber: '56', role: 'Bowler', totalCollected: 100, mobileNumber: '9566510056' },
  { id: 'p29', name: 'Avesh Khan', jerseyNumber: '12', role: 'Bowler', totalCollected: 80, mobileNumber: '9566510012' },
  { id: 'p30', name: 'Mukesh Kumar', jerseyNumber: '49', role: 'Bowler', totalCollected: 80, mobileNumber: '9566510049' },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    productName: 'Leather Cricket Balls (Box of 12)',
    cost: 180,
    date: '2026-05-10',
    category: 'Equipment',
    purchasedBy: 'Rohit Sharma',
    notes: 'Kookaburra Red Turf Match Balls',
  },
  {
    id: 'e2',
    productName: 'Ground Rental (Main Stadium)',
    cost: 450,
    date: '2026-05-15',
    category: 'Ground booking',
    purchasedBy: 'Virat Kohli',
    notes: 'Booking for 3 weekend matches',
  },
  {
    id: 'e3',
    productName: 'Energy Drinks & Bananas',
    cost: 65,
    date: '2026-05-18',
    category: 'Refreshments',
    purchasedBy: 'Hardik Pandya',
    notes: 'For the opening friendly match',
  },
  {
    id: 'e4',
    productName: 'Kookaburra Cricket Bats (2 Non-custom)',
    cost: 320,
    date: '2026-05-22',
    category: 'Equipment',
    purchasedBy: 'KL Rahul',
    notes: 'Club equipment for general batting practice',
  },
  {
    id: 'e5',
    productName: 'Umpire Match Fees',
    cost: 120,
    date: '2026-05-24',
    category: 'Umpire Fees',
    purchasedBy: 'Jasprit Bumrah',
    notes: 'Paid 2 official local league umpires',
  },
];

export const INITIAL_PAYMENT_LOGS: PaymentLog[] = [
  { id: 'l1', playerId: 'p1', playerName: 'Rohit Sharma', amount: 150, date: '2026-05-01', notes: 'Initial season registration' },
  { id: 'l2', playerId: 'p2', playerName: 'Virat Kohli', amount: 150, date: '2026-05-01', notes: 'Registration' },
  { id: 'l3', playerId: 'p3', playerName: 'Jasprit Bumrah', amount: 120, date: '2026-05-02', notes: 'Registration' },
  { id: 'l4', playerId: 'p4', playerName: 'Ravindra Jadeja', amount: 120, date: '2026-05-02', notes: 'Registration' },
  { id: 'l5', playerId: 'p5', playerName: 'Rishabh Pant', amount: 150, date: '2026-05-02', notes: 'Full pay registration' },
  { id: 'l6', playerId: 'p6', playerName: 'Hardik Pandya', amount: 100, date: '2026-05-03', notes: 'Partial registrationfee' },
  { id: 'l7', playerId: 'p20', playerName: 'Sanju Samson', amount: 150, date: '2026-05-04', notes: 'Season registration' },
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm_past_3',
    opponent: 'Sunset Lions CC',
    date: '2026-05-24',
    time: '14:30',
    venue: 'Sunset Cricket Oval (Pitch A)',
    format: 'T20',
    notes: 'Friendly kickoff match. Great win under pressure.',
    poll: {
      p1: 'YES',
      p2: 'YES',
      p3: 'YES',
      p4: 'YES',
      p5: 'YES',
      p7: 'YES'
    },
    scorecard: {
      teamRuns: 165,
      teamWickets: 2,
      opponentRuns: 161,
      opponentWickets: 8,
      result: 'Venpura CC won by 8 wickets',
      playerOfTheMatchId: 'p3', // Jasprit Bumrah
      bestBatterId: 'p2',       // Virat Kohli
      bestBowlerId: 'p3',       // Jasprit Bumrah
      batsmen: [
        { playerId: 'p1', playerName: 'Rohit Sharma', runs: 45, balls: 30, fours: 4, sixes: 2, outStatus: 'caught' },
        { playerId: 'p2', playerName: 'Virat Kohli', runs: 82, balls: 53, fours: 6, sixes: 4, outStatus: 'not out' },
        { playerId: 'p5', playerName: 'Rishabh Pant', runs: 22, balls: 12, fours: 2, sixes: 1, outStatus: 'bowled' },
        { playerId: 'p7', playerName: 'Suryakumar Yadav', runs: 12, balls: 6, fours: 1, sixes: 1, outStatus: 'not out' }
      ],
      bowlers: [
        { playerId: 'p3', playerName: 'Jasprit Bumrah', overs: 4, maidens: 1, runsConceded: 18, wickets: 4 },
        { playerId: 'p4', playerName: 'Ravindra Jadeja', overs: 4, maidens: 0, runsConceded: 22, wickets: 2 },
        { playerId: 'p15', playerName: 'Mohammed Siraj', overs: 4, maidens: 0, runsConceded: 35, wickets: 1 },
        { playerId: 'p13', playerName: 'Kuldeep Yadav', overs: 4, maidens: 0, runsConceded: 40, wickets: 1 }
      ]
    }
  },
  {
    id: 'm_past_2',
    opponent: 'Camberwell Legends CC',
    date: '2026-05-17',
    time: '11:00',
    venue: 'Camberwell Sports Ground',
    format: 'Friendly',
    notes: 'Epic away match. High scoring venue!',
    poll: {
      p1: 'YES',
      p2: 'YES',
      p3: 'YES',
      p4: 'YES'
    },
    scorecard: {
      teamRuns: 205,
      teamWickets: 3,
      opponentRuns: 172,
      opponentWickets: 9,
      result: 'Venpura CC won by 33 runs',
      playerOfTheMatchId: 'p1', // Rohit Sharma
      bestBatterId: 'p1',       // Rohit Sharma
      bestBowlerId: 'p13',      // Kuldeep Yadav
      batsmen: [
        { playerId: 'p1', playerName: 'Rohit Sharma', runs: 104, balls: 61, fours: 11, sixes: 5, outStatus: 'not out' },
        { playerId: 'p9', playerName: 'Shubman Gill', runs: 52, balls: 35, fours: 6, sixes: 1, outStatus: 'lbw' },
        { playerId: 'p2', playerName: 'Virat Kohli', runs: 30, balls: 18, fours: 3, sixes: 0, outStatus: 'caught' },
        { playerId: 'p6', playerName: 'Hardik Pandya', runs: 15, balls: 6, fours: 2, sixes: 1, outStatus: 'not out' }
      ],
      bowlers: [
        { playerId: 'p13', playerName: 'Kuldeep Yadav', overs: 4, maidens: 0, runsConceded: 28, wickets: 3 },
        { playerId: 'p17', playerName: 'Arshdeep Singh', overs: 4, maidens: 0, runsConceded: 24, wickets: 2 },
        { playerId: 'p3', playerName: 'Jasprit Bumrah', overs: 4, maidens: 0, runsConceded: 30, wickets: 2 },
        { playerId: 'p4', playerName: 'Ravindra Jadeja', overs: 4, maidens: 0, runsConceded: 45, wickets: 1 }
      ]
    }
  },
  {
    id: 'm_past_1',
    opponent: 'Geelong Warriors CC',
    date: '2026-05-10',
    time: '13:00',
    venue: 'Warriors Field Oval',
    format: 'T20',
    notes: 'First warm-up league fixture.',
    poll: {
      p1: 'YES',
      p4: 'YES',
      p6: 'YES',
      p7: 'YES'
    },
    scorecard: {
      teamRuns: 188,
      teamWickets: 6,
      opponentRuns: 180,
      opponentWickets: 7,
      result: 'Venpura CC won by 8 runs',
      playerOfTheMatchId: 'p7', // Suryakumar Yadav
      bestBatterId: 'p7',       // Suryakumar Yadav
      bestBowlerId: 'p3',       // Jasprit Bumrah
      batsmen: [
        { playerId: 'p7', playerName: 'Suryakumar Yadav', runs: 68, balls: 32, fours: 5, sixes: 5, outStatus: 'caught' },
        { playerId: 'p6', playerName: 'Hardik Pandya', runs: 42, balls: 20, fours: 3, sixes: 3, outStatus: 'not out' },
        { playerId: 'p1', playerName: 'Rohit Sharma', runs: 28, balls: 15, fours: 3, sixes: 1, outStatus: 'bowled' },
        { playerId: 'p10', playerName: 'Shreyas Iyer', runs: 18, balls: 14, fours: 1, sixes: 0, outStatus: 'caught' }
      ],
      bowlers: [
        { playerId: 'p3', playerName: 'Jasprit Bumrah', overs: 4, maidens: 0, runsConceded: 20, wickets: 3 },
        { playerId: 'p14', playerName: 'Yuzvendra Chahal', overs: 4, maidens: 0, runsConceded: 30, wickets: 2 },
        { playerId: 'p16', playerName: 'Mohammed Shami', overs: 4, maidens: 0, runsConceded: 44, wickets: 1 },
        { playerId: 'p4', playerName: 'Ravindra Jadeja', overs: 4, maidens: 0, runsConceded: 36, wickets: 1 }
      ]
    }
  },
  {
    id: 'm1',
    opponent: 'Pretoria Titans CC',
    date: '2026-06-06',
    time: '14:00',
    venue: 'Sunset Cricket Oval (Pitch B)',
    format: 'T20',
    notes: 'Season Opening Derby. Please arrive 45 minutes prior for warmups.',
    poll: {
      p1: 'YES',
      p2: 'YES',
      p3: 'YES',
      p4: 'YES',
      p5: 'YES',
      p7: 'YES',
      p9: 'YES',
      p11: 'YES',
      p12: 'YES',
      p13: 'YES',
      p15: 'YES',
      p20: 'YES',
      p6: 'NO',
      p8: 'NO',
      p14: 'NO',
      p10: 'MAYBE',
      p16: 'MAYBE',
    },
  },
  {
    id: 'm2',
    opponent: 'Melbourne Stars Academy',
    date: '2026-06-13',
    time: '10:00',
    venue: 'County Ground Stadium',
    format: 'Tournament',
    notes: 'Semi-final qualifier. Coloured uniforms mandatory.',
    poll: {
      p1: 'YES',
      p2: 'YES',
      p3: 'YES',
      p4: 'YES',
      p5: 'YES',
      p6: 'YES',
      p7: 'YES',
      p9: 'YES',
      p25: 'YES',
      p12: 'YES',
      p16: 'YES',
      p17: 'YES',
      p14: 'NO',
      p8: 'MAYBE',
    },
  },
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 't1',
    name: 'Tamil Nadu Super League Trophy',
    startDate: '2026-06-20',
    endDate: '2026-06-28',
    venue: 'MA Chidambaram Stadium, Chennai',
    format: 'T20',
    entryFeePerPlayer: 500,
    totalTeamEntryFee: 6000,
    description: 'The mega annual state club championship of the summer. Top-tier teams compete under lights. Standard colored jerseys and white ball play.',
    organizerContact: 'TN Cricket Board (+91 9444012345)',
    posterUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600&auto=format&fit=crop',
    playerPayments: [
      { playerId: 'p0', playerName: 'Mano', amountPaid: 500, paidDate: '2026-05-25', status: 'COLLECTED' },
      { playerId: 'p1', playerName: 'Rohit Sharma', amountPaid: 500, paidDate: '2026-05-26', status: 'COLLECTED' },
      { playerId: 'p2', playerName: 'Virat Kohli', amountPaid: 500, paidDate: '2026-05-26', status: 'COLLECTED' },
      { playerId: 'p3', playerName: 'Jasprit Bumrah', amountPaid: 0, status: 'PENDING' },
      { playerId: 'p4', playerName: 'Ravindra Jadeja', amountPaid: 500, paidDate: '2026-05-27', status: 'COLLECTED' },
      { playerId: 'p5', playerName: 'Rishabh Pant', amountPaid: 0, status: 'PENDING' },
      { playerId: 'p6', playerName: 'Hardik Pandya', amountPaid: 0, status: 'PENDING' },
      { playerId: 'p7', playerName: 'Suryakumar Yadav', amountPaid: 500, paidDate: '2026-05-27', status: 'COLLECTED' }
    ]
  },
  {
    id: 't2',
    name: 'Chennai Club Sixes Tournament 2026',
    startDate: '2026-07-05',
    endDate: '2026-07-06',
    venue: 'Marina Cricket Ground Pitch B',
    format: 'Sixes',
    entryFeePerPlayer: 250,
    totalTeamEntryFee: 3000,
    description: 'Exciting weekend 6-a-side slugfest. Fast matches, high boundaries, maximum action in 5 overs! Heavy tennis ball tournament.',
    organizerContact: 'Marina Sports Corp (+91 9884098765)',
    posterUrl: 'https://images.unsplash.com/photo-1540747737956-378724044282?q=80&w=600&auto=format&fit=crop',
    playerPayments: [
      { playerId: 'p0', playerName: 'Mano', amountPaid: 250, paidDate: '2026-05-28', status: 'COLLECTED' },
      { playerId: 'p1', playerName: 'Rohit Sharma', amountPaid: 0, status: 'PENDING' },
      { playerId: 'p2', playerName: 'Virat Kohli', amountPaid: 0, status: 'PENDING' },
      { playerId: 'p3', playerName: 'Jasprit Bumrah', amountPaid: 0, status: 'PENDING' }
    ]
  }
];

