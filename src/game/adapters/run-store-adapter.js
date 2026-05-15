const store = require("../../../utils/run-store");

function getSnapshot() {
  return store.getState();
}

async function createRun(playerId) {
  return store.createRun(playerId);
}

async function refreshRun() {
  return store.refreshRun();
}

async function advanceTime(allowCultivationPenalty = false) {
  return store.advanceTime(allowCultivationPenalty);
}

async function resolveEvent(optionId) {
  return store.resolveEvent(optionId);
}

async function performBattleAction(action) {
  return store.performBattleAction(action);
}

async function breakthrough() {
  return store.breakthrough();
}

async function sellResource(resourceKey, amount) {
  return store.sellResource(resourceKey, amount);
}

async function convertSpiritStoneToCultivation(amount) {
  return store.convertSpiritStoneToCultivation(amount);
}

async function buildDwellingFacility(facilityId) {
  return store.buildDwellingFacility(facilityId);
}

async function upgradeDwellingFacility(facilityId) {
  return store.upgradeDwellingFacility(facilityId);
}

async function equipItem(itemId) {
  return store.equipItem(itemId);
}

async function unequipItem(itemId) {
  return store.unequipItem(itemId);
}

async function startAlchemy(recipeId) {
  return store.startAlchemy(recipeId);
}

async function consumeAlchemyItem(itemId, quality, amount = 1) {
  return store.consumeAlchemyItem(itemId, quality, amount);
}

async function rebirth() {
  return store.rebirth();
}

module.exports = {
  getSnapshot,
  createRun,
  refreshRun,
  advanceTime,
  resolveEvent,
  performBattleAction,
  breakthrough,
  sellResource,
  convertSpiritStoneToCultivation,
  buildDwellingFacility,
  upgradeDwellingFacility,
  equipItem,
  unequipItem,
  startAlchemy,
  consumeAlchemyItem,
  rebirth,
};
