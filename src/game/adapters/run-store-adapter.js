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

async function advanceTime() {
  return store.advanceTime();
}

async function resolveEvent(optionId) {
  return store.resolveEvent(optionId);
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

async function startAlchemy(recipeId, useSpiritSpring) {
  return store.startAlchemy(recipeId, useSpiritSpring);
}

async function consumeAlchemyItem(itemId, quality) {
  return store.consumeAlchemyItem(itemId, quality);
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
  breakthrough,
  sellResource,
  convertSpiritStoneToCultivation,
  buildDwellingFacility,
  upgradeDwellingFacility,
  startAlchemy,
  consumeAlchemyItem,
  rebirth,
};
