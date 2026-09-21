import test from "node:test";
import assert from "node:assert/strict";
import {
  createTrip,
  executeTrip,
  resetStore,
  reviewSelection,
  resolveException,
  searchInventory,
  toView,
} from "../src/domain.js";

const create = (scenario: "happy" | "price_change" | "denied") => createTrip({
  destination: "京都",
  startDate: "2026-10-12",
  endDate: "2026-10-14",
  travelers: 2,
  budget: 120_000,
  autoPayLimit: 20_000,
  scenario,
});

test.beforeEach(() => resetStore());

test("happy path completes a sandbox card payment", () => {
  const state = create("happy");
  searchInventory(state.tripId);
  reviewSelection(state.tripId, ["hotel_sora", "pottery", "dinner"]);
  const completed = executeTrip(state.tripId);

  assert.equal(completed.status, "completed");
  assert.equal(completed.paidAmount, 108_400);
  assert.match(completed.paymentId ?? "", /^pay_demo_/);
  assert.equal(toView(completed).view, "audit");
});

test("price change pauses and requires an explicit resolution", () => {
  const state = create("price_change");
  searchInventory(state.tripId);
  reviewSelection(state.tripId, ["hotel_sora", "pottery", "dinner"]);
  const paused = executeTrip(state.tripId);

  assert.equal(paused.status, "reapproval_required");
  assert.equal(paused.paidAmount, 0);
  assert.equal(toView(paused).view, "exception");

  const completed = resolveException(state.tripId, "alternative");
  assert.equal(completed.status, "completed");
  assert.equal(completed.paidAmount, 105_400);
});

test("policy denial moves no funds", () => {
  const state = create("denied");
  searchInventory(state.tripId);
  reviewSelection(state.tripId, ["hotel_sora", "pottery", "dinner"]);
  const denied = executeTrip(state.tripId);

  assert.equal(denied.status, "denied");
  assert.equal(denied.paidAmount, 0);
  assert.equal(denied.paymentId, undefined);
  assert.match(denied.audit.at(-1)?.detail ?? "", /Funds moved: ¥0/);
});

test("user can build a custom trip from individual items", () => {
  const state = create("happy");
  searchInventory(state.tripId);
  const reviewed = reviewSelection(state.tripId, ["hotel_kamo", "tea"]);

  assert.deepEqual(reviewed.selectedItemIds, ["hotel_kamo", "tea"]);
  assert.equal(toView(reviewed).selectedTotal, 69_600);
  assert.equal(toView(reviewed).view, "approval");
});

test("payment requires review and repeated approval does not duplicate payment events", () => {
  const state = create("happy");
  searchInventory(state.tripId);
  assert.throws(() => executeTrip(state.tripId), /Review a selection/);
  reviewSelection(state.tripId, ["hotel_kamo", "tea"]);
  executeTrip(state.tripId);
  const eventCount = state.audit.length;
  executeTrip(state.tripId);
  assert.equal(state.audit.length, eventCount);
  assert.equal(state.paidAmount, 69_600);
});
