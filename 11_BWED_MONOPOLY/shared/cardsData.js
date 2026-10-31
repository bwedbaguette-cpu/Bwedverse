// ============================================================================
// MONOPOLY — ORIGINAL CHANCE & COMMUNITY CHEST DECKS (NATIVE ENGLISH)
// Full programmatic action triggers for gameplay engine
// ============================================================================

export const COMMUNITY_CHEST_CARDS = [
  {
    id: 'cc_advance_go',
    title: 'Advance to GO',
    text: 'Advance to GO. (Collect $200)',
    action: { type: 'MOVE_TO', target: 0, passGo: true }
  },
  {
    id: 'cc_bank_error',
    title: 'Bank Error',
    text: 'Bank error in your favor. Collect $200.',
    action: { type: 'CASH', amount: 200 }
  },
  {
    id: 'cc_doctor_fee',
    title: "Doctor's Fee",
    text: "Doctor's fee. Pay $50.",
    action: { type: 'CASH', amount: -50 }
  },
  {
    id: 'cc_stock_sale',
    title: 'Sale of Stock',
    text: 'From sale of stock you get $50.',
    action: { type: 'CASH', amount: 50 }
  },
  {
    id: 'cc_jail_free',
    title: 'Get Out of Jail Free',
    text: 'Get Out of Jail Free. This card may be kept until needed or sold.',
    action: { type: 'GET_OUT_OF_JAIL_FREE' }
  },
  {
    id: 'cc_go_to_jail',
    title: 'Go to Jail',
    text: 'Go to Jail. Go directly to jail, do not pass GO, do not collect $200.',
    action: { type: 'GO_TO_JAIL' }
  },
  {
    id: 'cc_holiday_fund',
    title: 'Holiday Fund',
    text: 'Holiday fund matures. Receive $100.',
    action: { type: 'CASH', amount: 100 }
  },
  {
    id: 'cc_income_refund',
    title: 'Income Tax Refund',
    text: 'Income tax refund. Collect $20.',
    action: { type: 'CASH', amount: 20 }
  },
  {
    id: 'cc_birthday',
    title: 'Birthday',
    text: 'It is your birthday. Collect $10 from every player.',
    action: { type: 'COLLECT_FROM_EACH', amount: 10 }
  },
  {
    id: 'cc_life_insurance',
    title: 'Life Insurance',
    text: 'Life insurance matures. Collect $100.',
    action: { type: 'CASH', amount: 100 }
  },
  {
    id: 'cc_hospital',
    title: 'Hospital Fees',
    text: 'Hospital fees. Pay $100.',
    action: { type: 'CASH', amount: -100 }
  },
  {
    id: 'cc_school',
    title: 'School Fees',
    text: 'School fees. Pay $50.',
    action: { type: 'CASH', amount: -50 }
  },
  {
    id: 'cc_consultancy',
    title: 'Consultancy Fee',
    text: 'Receive $25 consultancy fee.',
    action: { type: 'CASH', amount: 25 }
  },
  {
    id: 'cc_street_repairs',
    title: 'Street Repairs',
    text: 'You are assessed for street repairs. $40 per house, $115 per hotel.',
    action: { type: 'REPAIRS', perHouse: 40, perHotel: 115 }
  },
  {
    id: 'cc_beauty_contest',
    title: 'Beauty Contest',
    text: 'You have won second prize in a beauty contest. Collect $10.',
    action: { type: 'CASH', amount: 10 }
  },
  {
    id: 'cc_inherit',
    title: 'Inheritance',
    text: 'You inherit $100.',
    action: { type: 'CASH', amount: 100 }
  }
];

export const CHANCE_CARDS = [
  {
    id: 'ch_boardwalk',
    title: 'Advance to Boardwalk',
    text: 'Advance to Boardwalk.',
    action: { type: 'MOVE_TO', target: 39, passGo: false }
  },
  {
    id: 'ch_advance_go',
    title: 'Advance to GO',
    text: 'Advance to GO. (Collect $200)',
    action: { type: 'MOVE_TO', target: 0, passGo: true }
  },
  {
    id: 'ch_illinois',
    title: 'Advance to Illinois Ave',
    text: 'Advance to Illinois Avenue. If you pass GO, collect $200.',
    action: { type: 'MOVE_TO', target: 24, passGo: true }
  },
  {
    id: 'ch_st_charles',
    title: 'Advance to St. Charles Place',
    text: 'Advance to St. Charles Place. If you pass GO, collect $200.',
    action: { type: 'MOVE_TO', target: 11, passGo: true }
  },
  {
    id: 'ch_nearest_rr_1',
    title: 'Nearest Railroad',
    text: 'Advance to nearest Railroad. If unowned, you may buy it. If owned, pay owner twice the rental.',
    action: { type: 'NEAREST_RAILROAD', multiplier: 2 }
  },
  {
    id: 'ch_nearest_rr_2',
    title: 'Nearest Railroad',
    text: 'Advance to nearest Railroad. If unowned, you may buy it. If owned, pay owner twice the rental.',
    action: { type: 'NEAREST_RAILROAD', multiplier: 2 }
  },
  {
    id: 'ch_nearest_utility',
    title: 'Nearest Utility',
    text: 'Advance to nearest Utility. If unowned, buy it. If owned, roll dice and pay 10 times the roll.',
    action: { type: 'NEAREST_UTILITY', multiplier: 10 }
  },
  {
    id: 'ch_dividend',
    title: 'Bank Dividend',
    text: 'Bank pays you dividend of $50.',
    action: { type: 'CASH', amount: 50 }
  },
  {
    id: 'ch_jail_free',
    title: 'Get Out of Jail Free',
    text: 'Get Out of Jail Free. This card may be kept until needed or traded.',
    action: { type: 'GET_OUT_OF_JAIL_FREE' }
  },
  {
    id: 'ch_back_3',
    title: 'Go Back 3 Spaces',
    text: 'Go back 3 spaces.',
    action: { type: 'MOVE_STEPS', steps: -3 }
  },
  {
    id: 'ch_go_to_jail',
    title: 'Go to Jail',
    text: 'Go directly to Jail. Do not pass GO, do not collect $200.',
    action: { type: 'GO_TO_JAIL' }
  },
  {
    id: 'ch_general_repairs',
    title: 'General Repairs',
    text: 'Make general repairs on all your property. For each house pay $25, for each hotel pay $100.',
    action: { type: 'REPAIRS', perHouse: 25, perHotel: 100 }
  },
  {
    id: 'ch_speeding_fine',
    title: 'Speeding Fine',
    text: 'Speeding fine. Pay $15.',
    action: { type: 'CASH', amount: -15 }
  },
  {
    id: 'ch_reading_rr',
    title: 'Reading Railroad',
    text: 'Take a trip to Reading Railroad. If you pass GO, collect $200.',
    action: { type: 'MOVE_TO', target: 5, passGo: true }
  },
  {
    id: 'ch_chairman',
    title: 'Chairman of the Board',
    text: 'You have been elected Chairman of the Board. Pay each player $50.',
    action: { type: 'PAY_EACH', amount: 50 }
  },
  {
    id: 'ch_loan_matures',
    title: 'Building Loan Matures',
    text: 'Your building loan matures. Collect $150.',
    action: { type: 'CASH', amount: 150 }
  }
];
