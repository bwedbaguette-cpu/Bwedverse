// ============================================================================
// MONOPOLY ENGINE — COMPLETE AUTHORITATIVE RULES (NATIVE ENGLISH)
// Full state machine, rent calculations, doubles, jail, decks & bots
// ============================================================================

import { BOARD_TILES } from '../../shared/boardData.js';
import { COLOR_GROUPS, GAME_CONFIG } from '../../shared/constants.js';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '../../shared/cardsData.js';

export class MonopolyEngine {
  constructor(config = {}) {
    this.startingCash = config.startingCash || GAME_CONFIG.STARTING_CASH;
    this.jackpotRule = config.jackpotRule ?? true; // Free parking collects fines
    this.doubleGoBonus = config.doubleGoBonus ?? false; // $400 on exact landing
    
    this.players = [];
    this.activePlayerIndex = 0;
    this.turnState = 'SETUP'; // 'SETUP' | 'AWAITING_ROLL' | 'MOVING' | 'TILE_ACTION' | 'AWAITING_END_TURN' | 'GAME_OVER'
    this.consecutiveDoubles = 0;
    this.lastDice = [1, 2];
    this.jackpotPool = 500;
    this.roundCount = 1;

    // Property state: tileIndex -> { ownerId, houses: 0, isMortgaged: false }
    this.properties = {};
    for (let i = 0; i < 40; i++) {
      if (['PROPERTY', 'RAILROAD', 'UTILITY'].includes(BOARD_TILES[i].type)) {
        this.properties[i] = {
          ownerId: null,
          houses: 0, // 0 = unimproved, 1-4 = houses, 5 = hotel
          isMortgaged: false
        };
      }
    }

    // Shuffled card decks
    this.chanceDeck = this.shuffleDeck([...CHANCE_CARDS]);
    this.communityChestDeck = this.shuffleDeck([...COMMUNITY_CHEST_CARDS]);

    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  emit(eventType, data = {}) {
    this.listeners.forEach((cb) => cb(eventType, data, this.getSnapshot()));
  }

  getSnapshot() {
    return {
      players: this.players.map(p => ({ ...p })),
      activePlayer: this.getActivePlayer(),
      properties: { ...this.properties },
      turnState: this.turnState,
      lastDice: [...this.lastDice],
      jackpotPool: this.jackpotPool,
      roundCount: this.roundCount
    };
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  initPlayers(roster) {
    this.players = roster.map((p, idx) => ({
      id: p.id || `p${idx + 1}`,
      name: p.name || `Player ${idx + 1}`,
      characterId: p.characterId || 'toast-tycoon',
      color: p.color || 0xf5a623,
      model: p.model || './assets/pawns/toast-tycoon.glb',
      cash: this.startingCash,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      isBot: p.isBot || false,
      isBankrupt: false
    }));

    this.activePlayerIndex = 0;
    this.turnState = 'AWAITING_ROLL';
    this.emit('GAME_STARTED');
  }

  getActivePlayer() {
    return this.players[this.activePlayerIndex];
  }

  // ==========================================================================
  // TURN LOGIC & DICE
  // ==========================================================================

  rollDice() {
    const player = this.getActivePlayer();
    if (!player || this.turnState !== 'AWAITING_ROLL') return null;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const isDouble = (d1 === d2);
    this.lastDice = [d1, d2];

    this.emit('DICE_ROLLED', { player, d1, d2, total, isDouble });

    // Handle in Jail
    if (player.inJail) {
      if (isDouble) {
        player.inJail = false;
        player.jailTurns = 0;
        this.emit('JAIL_ESCAPED', { player, reason: 'DOUBLES' });
        this.executeMove(player, total);
      } else {
        player.jailTurns++;
        if (player.jailTurns >= GAME_CONFIG.MAX_JAIL_TURNS) {
          player.cash -= GAME_CONFIG.JAIL_FINE;
          this.addToJackpot(GAME_CONFIG.JAIL_FINE);
          player.inJail = false;
          player.jailTurns = 0;
          this.emit('JAIL_PAID_FINE', { player, amount: GAME_CONFIG.JAIL_FINE });
          this.executeMove(player, total);
        } else {
          this.turnState = 'AWAITING_END_TURN';
          this.emit('JAIL_STAYED', { player, turnsRemaining: GAME_CONFIG.MAX_JAIL_TURNS - player.jailTurns });
        }
      }
      return { d1, d2, total, isDouble };
    }

    // Check 3 consecutive doubles
    if (isDouble) {
      this.consecutiveDoubles++;
      if (this.consecutiveDoubles === 3) {
        this.sendToJail(player, '3_DOUBLES');
        return { d1, d2, total, isDouble };
      }
    } else {
      this.consecutiveDoubles = 0;
    }

    this.executeMove(player, total, isDouble);
    return { d1, d2, total, isDouble };
  }

  executeMove(player, steps, isDouble = false) {
    this.turnState = 'MOVING';
    const prevPos = player.position;
    const targetPos = (prevPos + steps + 40) % 40;

    let passedGo = false;
    if (targetPos < prevPos && steps > 0) {
      passedGo = true;
      const salary = (targetPos === 0 && this.doubleGoBonus) ? 400 : GAME_CONFIG.GO_SALARY;
      player.cash += salary;
      this.emit('PASSED_GO', { player, salary });
    }

    player.position = targetPos;
    this.emit('PLAYER_MOVED', { player, from: prevPos, to: targetPos, passedGo });

    this.turnState = 'TILE_ACTION';
    this.handleLanding(player, targetPos, isDouble);
  }

  handleLanding(player, tileIndex, isDouble = false) {
    const tile = BOARD_TILES[tileIndex];
    this.emit('LANDED_ON_TILE', { player, tile });

    switch (tile.type) {
      case 'PROPERTY':
      case 'RAILROAD':
      case 'UTILITY': {
        const prop = this.properties[tileIndex];
        if (!prop.ownerId) {
          // Unowned: Player can buy
          this.emit('CAN_BUY_PROPERTY', { player, tile });
        } else if (prop.ownerId === player.id) {
          // Own property
          this.finishTileAction(isDouble);
        } else {
          // Pay Rent
          const owner = this.players.find(p => p.id === prop.ownerId);
          if (owner && !prop.isMortgaged && !owner.inJail) {
            const diceTotal = this.lastDice[0] + this.lastDice[1];
            const rent = this.calculateRent(tileIndex, diceTotal);
            this.payRent(player, owner, rent, tile);
          }
          this.finishTileAction(isDouble);
        }
        break;
      }
      case 'TAX': {
        player.cash -= tile.amount;
        this.addToJackpot(tile.amount);
        this.emit('TAX_PAID', { player, amount: tile.amount, tile });
        this.checkBankruptcy(player);
        this.finishTileAction(isDouble);
        break;
      }
      case 'FREE_PARKING': {
        if (this.jackpotRule && this.jackpotPool > 0) {
          const award = this.jackpotPool;
          player.cash += award;
          this.jackpotPool = 100; // Reset base seed
          this.emit('JACKPOT_WON', { player, amount: award });
        }
        this.finishTileAction(isDouble);
        break;
      }
      case 'GO_TO_JAIL': {
        this.sendToJail(player, 'GO_TO_JAIL_TILE');
        break;
      }
      case 'CHANCE': {
        const card = this.drawChanceCard();
        this.executeCard(player, card, isDouble);
        break;
      }
      case 'COMMUNITY': {
        const card = this.drawCommunityChestCard();
        this.executeCard(player, card, isDouble);
        break;
      }
      default: {
        this.finishTileAction(isDouble);
        break;
      }
    }
  }

  finishTileAction(isDouble = false) {
    if (isDouble && !this.getActivePlayer().inJail) {
      this.turnState = 'AWAITING_ROLL';
      this.emit('DOUBLE_ROLLED_AGAIN', { player: this.getActivePlayer() });
    } else {
      this.turnState = 'AWAITING_END_TURN';
      this.emit('READY_TO_END_TURN', { player: this.getActivePlayer() });
    }
  }

  // ==========================================================================
  // PROPERTY TRANSACTIONS & RENTS
  // ==========================================================================

  buyProperty(player, tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];

    if (!prop || prop.ownerId || player.cash < tile.price) return false;

    player.cash -= tile.price;
    prop.ownerId = player.id;

    this.emit('PROPERTY_BOUGHT', { player, tile, price: tile.price });
    this.finishTileAction(this.lastDice[0] === this.lastDice[1]);
    return true;
  }

  calculateRent(tileIndex, diceTotal = 7) {
    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];
    if (!prop || !prop.ownerId || prop.isMortgaged) return 0;

    const ownerId = prop.ownerId;

    if (tile.type === 'PROPERTY') {
      if (prop.houses > 0) {
        return tile.rents[prop.houses];
      }
      // Unimproved: Check monopoly
      const hasMonopoly = this.checkMonopoly(ownerId, tile.group);
      return hasMonopoly ? tile.rents[0] * 2 : tile.rents[0];
    }

    if (tile.type === 'RAILROAD') {
      const ownedRailroads = [5, 15, 25, 35].filter(idx => this.properties[idx].ownerId === ownerId && !this.properties[idx].isMortgaged).length;
      return tile.rents[Math.max(0, ownedRailroads - 1)] || 25;
    }

    if (tile.type === 'UTILITY') {
      const ownedUtilities = [12, 28].filter(idx => this.properties[idx].ownerId === ownerId && !this.properties[idx].isMortgaged).length;
      const multiplier = (ownedUtilities >= 2) ? 10 : 4;
      return multiplier * diceTotal;
    }

    return 0;
  }

  payRent(payer, owner, amount, tile) {
    payer.cash -= amount;
    owner.cash += amount;
    this.emit('RENT_PAID', { payer, owner, amount, tile });
    this.checkBankruptcy(payer, owner);
  }

  checkMonopoly(playerId, groupKey) {
    const group = COLOR_GROUPS[groupKey];
    if (!group) return false;

    const tilesInGroup = BOARD_TILES.filter(t => t.group === groupKey);
    return tilesInGroup.every(t => this.properties[t.index]?.ownerId === playerId);
  }

  canBuildHouse(player, tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];
    if (!prop || prop.ownerId !== player.id || tile.type !== 'PROPERTY') return false;
    if (prop.houses >= 5) return false;
    if (player.cash < tile.houseCost) return false;

    // Must have full monopoly
    if (!this.checkMonopoly(player.id, tile.group)) return false;

    // Check no properties in group are mortgaged
    const tilesInGroup = BOARD_TILES.filter(t => t.group === tile.group);
    if (tilesInGroup.some(t => this.properties[t.index].isMortgaged)) return false;

    // Even building rule: cannot build if current house count > min house count in group
    const currentHouses = prop.houses;
    const minHouses = Math.min(...tilesInGroup.map(t => this.properties[t.index].houses));
    return currentHouses === minHouses;
  }

  buildHouse(player, tileIndex) {
    if (!this.canBuildHouse(player, tileIndex)) return false;

    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];

    player.cash -= tile.houseCost;
    prop.houses++;

    this.emit('HOUSE_BUILT', { player, tile, houses: prop.houses, cost: tile.houseCost });
    return true;
  }

  canSellHouse(player, tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];
    if (!prop || prop.ownerId !== player.id || prop.houses <= 0) return false;

    const tilesInGroup = BOARD_TILES.filter(t => t.group === tile.group);
    const currentHouses = prop.houses;
    const maxHouses = Math.max(...tilesInGroup.map(t => this.properties[t.index].houses));
    return currentHouses === maxHouses;
  }

  sellHouse(player, tileIndex) {
    if (!this.canSellHouse(player, tileIndex)) return false;

    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];

    const refund = Math.floor(tile.houseCost / 2);
    player.cash += refund;
    prop.houses--;

    this.emit('HOUSE_SOLD', { player, tile, houses: prop.houses, refund });
    return true;
  }

  mortgageProperty(player, tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];
    if (!prop || prop.ownerId !== player.id || prop.isMortgaged) return false;
    if (prop.houses > 0) return false; // Must sell houses first

    prop.isMortgaged = true;
    player.cash += tile.mortgage;

    this.emit('PROPERTY_MORTGAGED', { player, tile, amount: tile.mortgage });
    return true;
  }

  unmortgageProperty(player, tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    const prop = this.properties[tileIndex];
    if (!prop || prop.ownerId !== player.id || !prop.isMortgaged) return false;

    const cost = Math.round(tile.mortgage * 1.1);
    if (player.cash < cost) return false;

    player.cash -= cost;
    prop.isMortgaged = false;

    this.emit('PROPERTY_UNMORTGAGED', { player, tile, cost });
    return true;
  }

  // ==========================================================================
  // CARDS (CHANCE & COMMUNITY CHEST)
  // ==========================================================================

  drawChanceCard() {
    const card = this.chanceDeck.shift();
    this.chanceDeck.push(card);
    return card;
  }

  drawCommunityChestCard() {
    const card = this.communityChestDeck.shift();
    this.communityChestDeck.push(card);
    return card;
  }

  executeCard(player, card, isDouble = false) {
    this.emit('CARD_DRAWN', { player, card });

    const act = card.action;
    switch (act.type) {
      case 'MOVE_TO': {
        const prev = player.position;
        const target = act.target;
        if (act.passGo && target < prev) {
          player.cash += GAME_CONFIG.GO_SALARY;
          this.emit('PASSED_GO', { player, salary: GAME_CONFIG.GO_SALARY });
        }
        player.position = target;
        this.emit('PLAYER_MOVED', { player, from: prev, to: target });
        this.handleLanding(player, target, isDouble);
        break;
      }
      case 'MOVE_STEPS': {
        this.executeMove(player, act.steps, isDouble);
        break;
      }
      case 'CASH': {
        player.cash += act.amount;
        if (act.amount < 0) {
          this.addToJackpot(-act.amount);
          this.checkBankruptcy(player);
        }
        this.finishTileAction(isDouble);
        break;
      }
      case 'GET_OUT_OF_JAIL_FREE': {
        player.jailCards++;
        this.finishTileAction(isDouble);
        break;
      }
      case 'GO_TO_JAIL': {
        this.sendToJail(player, 'CARD');
        break;
      }
      case 'PAY_EACH': {
        const others = this.players.filter(p => p.id !== player.id && !p.isBankrupt);
        const totalPaid = act.amount * others.length;
        player.cash -= totalPaid;
        others.forEach(p => { p.cash += act.amount; });
        this.checkBankruptcy(player);
        this.finishTileAction(isDouble);
        break;
      }
      case 'COLLECT_FROM_EACH': {
        const others = this.players.filter(p => p.id !== player.id && !p.isBankrupt);
        others.forEach(p => {
          p.cash -= act.amount;
          player.cash += act.amount;
          this.checkBankruptcy(p, player);
        });
        this.finishTileAction(isDouble);
        break;
      }
      case 'REPAIRS': {
        let totalHouses = 0;
        let totalHotels = 0;
        Object.entries(this.properties).forEach(([idx, p]) => {
          if (p.ownerId === player.id) {
            if (p.houses === 5) totalHotels++;
            else totalHouses += p.houses;
          }
        });
        const fee = totalHouses * act.perHouse + totalHotels * act.perHotel;
        player.cash -= fee;
        this.addToJackpot(fee);
        this.checkBankruptcy(player);
        this.finishTileAction(isDouble);
        break;
      }
      case 'NEAREST_RAILROAD': {
        const rrs = [5, 15, 25, 35];
        const nextRR = rrs.find(r => r > player.position) || rrs[0];
        if (nextRR < player.position) {
          player.cash += GAME_CONFIG.GO_SALARY;
        }
        player.position = nextRR;
        this.emit('PLAYER_MOVED', { player, from: player.position, to: nextRR });
        const prop = this.properties[nextRR];
        if (!prop.ownerId) {
          this.emit('CAN_BUY_PROPERTY', { player, tile: BOARD_TILES[nextRR] });
        } else if (prop.ownerId !== player.id) {
          const owner = this.players.find(p => p.id === prop.ownerId);
          const standardRent = this.calculateRent(nextRR);
          const doubleRent = standardRent * 2;
          this.payRent(player, owner, doubleRent, BOARD_TILES[nextRR]);
          this.finishTileAction(isDouble);
        } else {
          this.finishTileAction(isDouble);
        }
        break;
      }
      case 'NEAREST_UTILITY': {
        const utils = [12, 28];
        const nextUtil = utils.find(u => u > player.position) || utils[0];
        if (nextUtil < player.position) {
          player.cash += GAME_CONFIG.GO_SALARY;
        }
        player.position = nextUtil;
        this.emit('PLAYER_MOVED', { player, from: player.position, to: nextUtil });
        const prop = this.properties[nextUtil];
        if (!prop.ownerId) {
          this.emit('CAN_BUY_PROPERTY', { player, tile: BOARD_TILES[nextUtil] });
        } else if (prop.ownerId !== player.id) {
          const owner = this.players.find(p => p.id === prop.ownerId);
          const roll = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
          const rent = roll * 10;
          this.payRent(player, owner, rent, BOARD_TILES[nextUtil]);
          this.finishTileAction(isDouble);
        } else {
          this.finishTileAction(isDouble);
        }
        break;
      }
      default: {
        this.finishTileAction(isDouble);
        break;
      }
    }
  }

  // ==========================================================================
  // JAIL & SPECIAL ACTIONS
  // ==========================================================================

  sendToJail(player, reason = 'RULE') {
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    this.consecutiveDoubles = 0;
    this.turnState = 'AWAITING_END_TURN';
    this.emit('SENT_TO_JAIL', { player, reason });
  }

  payJailFine(player) {
    if (!player.inJail || player.cash < GAME_CONFIG.JAIL_FINE) return false;
    player.cash -= GAME_CONFIG.JAIL_FINE;
    this.addToJackpot(GAME_CONFIG.JAIL_FINE);
    player.inJail = false;
    player.jailTurns = 0;
    this.turnState = 'AWAITING_ROLL';
    this.emit('JAIL_PAID_FINE', { player, amount: GAME_CONFIG.JAIL_FINE });
    return true;
  }

  useJailCard(player) {
    if (!player.inJail || player.jailCards <= 0) return false;
    player.jailCards--;
    player.inJail = false;
    player.jailTurns = 0;
    this.turnState = 'AWAITING_ROLL';
    this.emit('JAIL_USED_CARD', { player });
    return true;
  }

  addToJackpot(amount) {
    if (this.jackpotRule && amount > 0) {
      this.jackpotPool += amount;
      this.emit('JACKPOT_UPDATED', { pool: this.jackpotPool });
    }
  }

  checkBankruptcy(player, creditor = null) {
    if (player.cash >= 0) return;

    // Check if player can liquidate assets
    const netWorth = this.getPlayerNetWorth(player.id);
    if (netWorth < 0) {
      this.declareBankruptcy(player, creditor);
    } else {
      this.emit('LOW_CASH_WARNING', { player, deficit: -player.cash });
    }
  }

  declareBankruptcy(player, creditor = null) {
    player.isBankrupt = true;
    this.emit('PLAYER_BANKRUPT', { player, creditor });

    // Transfer or auction properties
    Object.entries(this.properties).forEach(([idx, prop]) => {
      if (prop.ownerId === player.id) {
        if (creditor) {
          prop.ownerId = creditor.id;
        } else {
          prop.ownerId = null;
          prop.houses = 0;
          prop.isMortgaged = false;
        }
      }
    });

    const activeRemaining = this.players.filter(p => !p.isBankrupt);
    if (activeRemaining.length === 1) {
      this.turnState = 'GAME_OVER';
      this.emit('GAME_WON', { winner: activeRemaining[0] });
    }
  }

  getPlayerNetWorth(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return 0;

    let worth = player.cash;
    Object.entries(this.properties).forEach(([idx, prop]) => {
      if (prop.ownerId === playerId) {
        const tile = BOARD_TILES[idx];
        worth += prop.isMortgaged ? tile.mortgage : tile.price;
        if (prop.houses > 0) {
          worth += prop.houses * (tile.houseCost || 50);
        }
      }
    });
    return worth;
  }

  getPlayerProperties(playerId) {
    return Object.entries(this.properties)
      .filter(([_, prop]) => prop.ownerId === playerId)
      .map(([idx, prop]) => ({
        tile: BOARD_TILES[idx],
        houses: prop.houses,
        isMortgaged: prop.isMortgaged
      }));
  }

  // ==========================================================================
  // END TURN & BOT ORCHESTRATION
  // ==========================================================================

  endTurn() {
    if (this.turnState !== 'AWAITING_END_TURN') return;

    this.consecutiveDoubles = 0;

    // Find next non-bankrupt player
    let nextIdx = (this.activePlayerIndex + 1) % this.players.length;
    while (this.players[nextIdx].isBankrupt) {
      nextIdx = (nextIdx + 1) % this.players.length;
    }

    if (nextIdx <= this.activePlayerIndex) {
      this.roundCount++;
    }

    this.activePlayerIndex = nextIdx;
    this.turnState = 'AWAITING_ROLL';

    const nextPlayer = this.getActivePlayer();
    this.emit('TURN_CHANGED', { player: nextPlayer, round: this.roundCount });

    // If next player is bot, automate turn
    if (nextPlayer.isBot) {
      this.runBotTurn(nextPlayer);
    }
  }

  runBotTurn(bot) {
    setTimeout(() => {
      if (bot.inJail) {
        if (bot.jailCards > 0) {
          this.useJailCard(bot);
        } else if (bot.cash > 300) {
          this.payJailFine(bot);
        }
      }

      this.rollDice();

      // Bot buy decision
      setTimeout(() => {
        const tile = BOARD_TILES[bot.position];
        const prop = this.properties[bot.position];
        if (prop && !prop.ownerId && bot.cash >= tile.price + 100) {
          this.buyProperty(bot, bot.position);
        }

        // Bot house building check
        const owned = this.getPlayerProperties(bot.id);
        owned.forEach(({ tile: t }) => {
          if (this.canBuildHouse(bot, t.index) && bot.cash >= t.houseCost + 200) {
            this.buildHouse(bot, t.index);
          }
        });

        setTimeout(() => {
          if (this.turnState === 'AWAITING_END_TURN') {
            this.endTurn();
          }
        }, 800);
      }, 1200);
    }, 1000);
  }
}
