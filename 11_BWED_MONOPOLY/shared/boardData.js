// ============================================================================
// MONOPOLY — ORIGINAL 40-TILE BOARD DATA (NATIVE ENGLISH)
// Standard official rules, prices, rents, mortgage and building costs
// ============================================================================

export const BOARD_TILES = [
  // 0 : GO
  {
    index: 0,
    id: 'go',
    name: 'GO',
    shortName: 'GO',
    type: 'GO',
    group: 'SPECIAL',
    icon: '➡️',
    description: 'Collect $200 salary as you pass.'
  },
  // 1 : BROWN 1
  {
    index: 1,
    id: 'mediterranean_ave',
    name: 'Mediterranean Avenue',
    shortName: 'Mediterranean',
    type: 'PROPERTY',
    group: 'BROWN',
    price: 60,
    rents: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
    mortgage: 30
  },
  // 2 : COMMUNITY CHEST
  {
    index: 2,
    id: 'community_chest_1',
    name: 'Community Chest',
    shortName: 'Community',
    type: 'COMMUNITY',
    group: 'SPECIAL',
    icon: '📦',
    description: 'Follow instructions on top card.'
  },
  // 3 : BROWN 2
  {
    index: 3,
    id: 'baltic_ave',
    name: 'Baltic Avenue',
    shortName: 'Baltic Ave',
    type: 'PROPERTY',
    group: 'BROWN',
    price: 60,
    rents: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
    mortgage: 30
  },
  // 4 : INCOME TAX
  {
    index: 4,
    id: 'income_tax',
    name: 'Income Tax',
    shortName: 'Income Tax',
    type: 'TAX',
    group: 'SPECIAL',
    amount: 200,
    icon: '💰',
    description: 'Pay $200 to the Bank.'
  },
  // 5 : RAILROAD 1
  {
    index: 5,
    id: 'reading_railroad',
    name: 'Reading Railroad',
    shortName: 'Reading RR',
    type: 'RAILROAD',
    group: 'RAILROAD',
    price: 200,
    rents: [25, 50, 100, 200],
    mortgage: 100,
    icon: '🚂'
  },
  // 6 : LIGHT BLUE 1
  {
    index: 6,
    id: 'oriental_ave',
    name: 'Oriental Avenue',
    shortName: 'Oriental Ave',
    type: 'PROPERTY',
    group: 'LIGHT_BLUE',
    price: 100,
    rents: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    mortgage: 50
  },
  // 7 : CHANCE 1
  {
    index: 7,
    id: 'chance_1',
    name: 'Chance',
    shortName: 'Chance',
    type: 'CHANCE',
    group: 'SPECIAL',
    icon: '❓',
    description: 'Follow instructions on top card.'
  },
  // 8 : LIGHT BLUE 2
  {
    index: 8,
    id: 'vermont_ave',
    name: 'Vermont Avenue',
    shortName: 'Vermont Ave',
    type: 'PROPERTY',
    group: 'LIGHT_BLUE',
    price: 100,
    rents: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    mortgage: 50
  },
  // 9 : LIGHT BLUE 3
  {
    index: 9,
    id: 'connecticut_ave',
    name: 'Connecticut Avenue',
    shortName: 'Connecticut',
    type: 'PROPERTY',
    group: 'LIGHT_BLUE',
    price: 120,
    rents: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
    mortgage: 60
  },
  // 10 : IN JAIL / JUST VISITING
  {
    index: 10,
    id: 'jail',
    name: 'In Jail / Just Visiting',
    shortName: 'Jail',
    type: 'JAIL',
    group: 'SPECIAL',
    icon: '🔒',
    description: 'Visiting or in lockup.'
  },
  // 11 : PINK 1
  {
    index: 11,
    id: 'st_charles_place',
    name: 'St. Charles Place',
    shortName: 'St. Charles',
    type: 'PROPERTY',
    group: 'PINK',
    price: 140,
    rents: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    mortgage: 70
  },
  // 12 : UTILITY 1
  {
    index: 12,
    id: 'electric_company',
    name: 'Electric Company',
    shortName: 'Electric Co',
    type: 'UTILITY',
    group: 'UTILITY',
    price: 150,
    mortgage: 75,
    icon: '💡',
    description: 'Rent is 4x (or 10x) dice roll.'
  },
  // 13 : PINK 2
  {
    index: 13,
    id: 'states_ave',
    name: 'States Avenue',
    shortName: 'States Ave',
    type: 'PROPERTY',
    group: 'PINK',
    price: 140,
    rents: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    mortgage: 70
  },
  // 14 : PINK 3
  {
    index: 14,
    id: 'virginia_ave',
    name: 'Virginia Avenue',
    shortName: 'Virginia Ave',
    type: 'PROPERTY',
    group: 'PINK',
    price: 160,
    rents: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
    mortgage: 80
  },
  // 15 : RAILROAD 2
  {
    index: 15,
    id: 'pennsylvania_railroad',
    name: 'Pennsylvania Railroad',
    shortName: 'Penn RR',
    type: 'RAILROAD',
    group: 'RAILROAD',
    price: 200,
    rents: [25, 50, 100, 200],
    mortgage: 100,
    icon: '🚂'
  },
  // 16 : ORANGE 1
  {
    index: 16,
    id: 'st_james_place',
    name: 'St. James Place',
    shortName: 'St. James',
    type: 'PROPERTY',
    group: 'ORANGE',
    price: 180,
    rents: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    mortgage: 90
  },
  // 17 : COMMUNITY CHEST 2
  {
    index: 17,
    id: 'community_chest_2',
    name: 'Community Chest',
    shortName: 'Community',
    type: 'COMMUNITY',
    group: 'SPECIAL',
    icon: '📦'
  },
  // 18 : ORANGE 2
  {
    index: 18,
    id: 'tennessee_ave',
    name: 'Tennessee Avenue',
    shortName: 'Tennessee',
    type: 'PROPERTY',
    group: 'ORANGE',
    price: 180,
    rents: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    mortgage: 90
  },
  // 19 : ORANGE 3
  {
    index: 19,
    id: 'new_york_ave',
    name: 'New York Avenue',
    shortName: 'New York Ave',
    type: 'PROPERTY',
    group: 'ORANGE',
    price: 200,
    rents: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
    mortgage: 100
  },
  // 20 : FREE PARKING
  {
    index: 20,
    id: 'free_parking',
    name: 'Free Parking',
    shortName: 'Free Parking',
    type: 'FREE_PARKING',
    group: 'SPECIAL',
    icon: '🚗',
    description: 'No penalty or cash jackpot.'
  },
  // 21 : RED 1
  {
    index: 21,
    id: 'kentucky_ave',
    name: 'Kentucky Avenue',
    shortName: 'Kentucky',
    type: 'PROPERTY',
    group: 'RED',
    price: 220,
    rents: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    mortgage: 110
  },
  // 22 : CHANCE 2
  {
    index: 22,
    id: 'chance_2',
    name: 'Chance',
    shortName: 'Chance',
    type: 'CHANCE',
    group: 'SPECIAL',
    icon: '❓'
  },
  // 23 : RED 2
  {
    index: 23,
    id: 'indiana_ave',
    name: 'Indiana Avenue',
    shortName: 'Indiana Ave',
    type: 'PROPERTY',
    group: 'RED',
    price: 220,
    rents: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    mortgage: 110
  },
  // 24 : RED 3
  {
    index: 24,
    id: 'illinois_ave',
    name: 'Illinois Avenue',
    shortName: 'Illinois Ave',
    type: 'PROPERTY',
    group: 'RED',
    price: 240,
    rents: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
    mortgage: 120
  },
  // 25 : RAILROAD 3
  {
    index: 25,
    id: 'bo_railroad',
    name: 'B. & O. Railroad',
    shortName: 'B. & O. RR',
    type: 'RAILROAD',
    group: 'RAILROAD',
    price: 200,
    rents: [25, 50, 100, 200],
    mortgage: 100,
    icon: '🚂'
  },
  // 26 : YELLOW 1
  {
    index: 26,
    id: 'atlantic_ave',
    name: 'Atlantic Avenue',
    shortName: 'Atlantic Ave',
    type: 'PROPERTY',
    group: 'YELLOW',
    price: 260,
    rents: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    mortgage: 130
  },
  // 27 : YELLOW 2
  {
    index: 27,
    id: 'ventnor_ave',
    name: 'Ventnor Avenue',
    shortName: 'Ventnor Ave',
    type: 'PROPERTY',
    group: 'YELLOW',
    price: 260,
    rents: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    mortgage: 130
  },
  // 28 : UTILITY 2
  {
    index: 28,
    id: 'water_works',
    name: 'Water Works',
    shortName: 'Water Works',
    type: 'UTILITY',
    group: 'UTILITY',
    price: 150,
    mortgage: 75,
    icon: '🚰',
    description: 'Rent is 4x (or 10x) dice roll.'
  },
  // 29 : YELLOW 3
  {
    index: 29,
    id: 'marvin_gardens',
    name: 'Marvin Gardens',
    shortName: 'Marvin Grdns',
    type: 'PROPERTY',
    group: 'YELLOW',
    price: 280,
    rents: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
    mortgage: 140
  },
  // 30 : GO TO JAIL
  {
    index: 30,
    id: 'go_to_jail',
    name: 'Go to Jail',
    shortName: 'Go to Jail',
    type: 'GO_TO_JAIL',
    group: 'SPECIAL',
    icon: '👮',
    description: 'Go directly to jail. Do not pass GO.'
  },
  // 31 : GREEN 1
  {
    index: 31,
    id: 'pacific_ave',
    name: 'Pacific Avenue',
    shortName: 'Pacific Ave',
    type: 'PROPERTY',
    group: 'GREEN',
    price: 300,
    rents: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    mortgage: 150
  },
  // 32 : GREEN 2
  {
    index: 32,
    id: 'north_carolina_ave',
    name: 'North Carolina Avenue',
    shortName: 'North Carolina',
    type: 'PROPERTY',
    group: 'GREEN',
    price: 300,
    rents: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    mortgage: 150
  },
  // 33 : COMMUNITY CHEST 3
  {
    index: 33,
    id: 'community_chest_3',
    name: 'Community Chest',
    shortName: 'Community',
    type: 'COMMUNITY',
    group: 'SPECIAL',
    icon: '📦'
  },
  // 34 : GREEN 3
  {
    index: 34,
    id: 'pennsylvania_ave',
    name: 'Pennsylvania Avenue',
    shortName: 'Pennsylvania',
    type: 'PROPERTY',
    group: 'GREEN',
    price: 320,
    rents: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
    mortgage: 160
  },
  // 35 : RAILROAD 4
  {
    index: 35,
    id: 'short_line',
    name: 'Short Line',
    shortName: 'Short Line',
    type: 'RAILROAD',
    group: 'RAILROAD',
    price: 200,
    rents: [25, 50, 100, 200],
    mortgage: 100,
    icon: '🚂'
  },
  // 36 : CHANCE 3
  {
    index: 36,
    id: 'chance_3',
    name: 'Chance',
    shortName: 'Chance',
    type: 'CHANCE',
    group: 'SPECIAL',
    icon: '❓'
  },
  // 37 : DARK BLUE 1
  {
    index: 37,
    id: 'park_place',
    name: 'Park Place',
    shortName: 'Park Place',
    type: 'PROPERTY',
    group: 'DARK_BLUE',
    price: 350,
    rents: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    mortgage: 175
  },
  // 38 : LUXURY TAX
  {
    index: 38,
    id: 'luxury_tax',
    name: 'Luxury Tax',
    shortName: 'Luxury Tax',
    type: 'TAX',
    group: 'SPECIAL',
    amount: 100,
    icon: '💎',
    description: 'Pay $100 to the Bank.'
  },
  // 39 : DARK BLUE 2
  {
    index: 39,
    id: 'boardwalk',
    name: 'Boardwalk',
    shortName: 'Boardwalk',
    type: 'PROPERTY',
    group: 'DARK_BLUE',
    price: 400,
    rents: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
    mortgage: 200
  }
];
