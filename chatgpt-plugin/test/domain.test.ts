import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseOption,
  createTrip,
  executeTrip,
  resetStore,
  resolveException,
  searchOptions,
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
  searchOptions(state.tripId);
  chooseOption(state.tripId, "plan_a");
  const completed = executeTrip(state.tripId);

  assert.equal(completed.status, "completed");
  assert.equal(completed.paidAmount, 108_400);
  assert.match(completed.paymentId ?? "", /^pay_demo_/);
  assert.equal(toView(completed).view, "audit");
});

test("price change pauses and requires an explicit resolution", () => {
  const state = create("price_change");
  searchOptions(state.tripId);
  chooseOption(state.tripId, "plan_a");
  const paused = executeTrip(state.tripId);

  assert.equal(paused.status, "reapproval_required");
  assert.equal(paused.paidAmount, 0);
  assert.equal(toView(paused).view, "exception");

  const completed = resolveException(state.tripId, "alternative");
  assert.equal(completed.status, "completed");
  assert.equal(completed.paidAmount, 109_900);
});

test("policy denial moves no funds", () => {
  const state = create("denied");
  searchOptions(state.tripId);
  chooseOption(state.tripId, "plan_a");
  const denied = executeTrip(state.tripId);

  assert.equal(denied.status, "denied");
  assert.equal(denied.paidAmount, 0);
  assert.equal(denied.paymentId, undefined);
  assert.match(denied.audit.at(-1)?.detail ?? "", /Funds moved: ¥0/);
});
