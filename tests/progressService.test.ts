import test from "node:test";
import assert from "node:assert/strict";
import { getLevelFromXP } from "../src/services/progressService";
import { getProgressionSnapshot } from "../src/services/missionSystem";

test("levels scale by the configured XP ladder and cap at level 99", () => {
  assert.equal(getLevelFromXP(0), 1);
  assert.equal(getLevelFromXP(499), 1);
  assert.equal(getLevelFromXP(500), 2);
  assert.equal(getLevelFromXP(1499), 2);
  assert.equal(getLevelFromXP(1500), 3);
  assert.equal(getLevelFromXP(3000), 4);
  assert.equal(getLevelFromXP(50000), 99);
  assert.equal(getLevelFromXP(500000), 99);
});

test("progression snapshot reflects the current level and caps the tower", () => {
  const snapshot = getProgressionSnapshot(
    { level: 3, xp: 1500, pp: 0, streak: 0, redState: false, overclockCount: 0, protocolArchetypeName: "", protocolStatusEffect: "NONE" },
    "en",
  );

  assert.equal(snapshot.nextLevelProgress.percent, 100);
  assert.ok(snapshot.towerFloors.some((floor) => floor.floor === 3 && floor.active));
  assert.equal(snapshot.towerFloors[snapshot.towerFloors.length - 1].floor, 99);
});
