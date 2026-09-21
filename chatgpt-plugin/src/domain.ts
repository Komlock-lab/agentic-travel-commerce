export type DemoScenario = "happy" | "price_change" | "denied";

export type AuditEvent = {
  at: string;
  type: string;
  label: string;
  detail: string;
};

export type TripItem = {
  id: string;
  category: "lodging" | "activity" | "food";
  name: string;
  price: number;
  cancellable: boolean;
  reason: string;
  recommended?: boolean;
};

export type PriceException = {
  itemId: string;
  previousPrice: number;
  currentPrice: number;
  deltaPercent: number;
  alternativeId: string;
};

export type TripState = {
  tripId: string;
  scenario: DemoScenario;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  autoPayLimit: number;
  status: "mandate_created" | "inventory_ready" | "approval_required" | "reapproval_required" | "completed" | "denied";
  inventory: TripItem[];
  selectedItemIds: string[];
  paidAmount: number;
  paymentId?: string;
  exception?: PriceException;
  audit: AuditEvent[];
};

const stores = new Map<string, TripState>();
let sequence = 1;

const now = () => new Date().toISOString();

const audit = (state: TripState, type: string, label: string, detail: string) => {
  state.audit.push({ at: now(), type, label, detail });
};

export function resetStore() {
  stores.clear();
  sequence = 1;
}

export function createTrip(input: {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  autoPayLimit: number;
  scenario: DemoScenario;
}): TripState {
  const tripId = `trip_demo_${String(sequence++).padStart(3, "0")}`;
  const state: TripState = {
    tripId,
    scenario: input.scenario,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    travelers: input.travelers,
    budget: input.budget,
    autoPayLimit: input.autoPayLimit,
    status: "mandate_created",
    inventory: [],
    selectedItemIds: [],
    paidAmount: 0,
    audit: [],
  };
  audit(state, "mandate", "支払い条件を作成", `総予算 ¥${input.budget.toLocaleString("ja-JP")} / 自動決済上限 ¥${input.autoPayLimit.toLocaleString("ja-JP")}`);
  stores.set(tripId, state);
  return state;
}

export function getTrip(tripId: string): TripState {
  const state = stores.get(tripId);
  if (!state) throw new Error(`Trip not found: ${tripId}`);
  return state;
}

export function searchInventory(tripId: string): TripState {
  const state = getTrip(tripId);
  state.inventory = [
    { id: "hotel_sora", category: "lodging", name: "Hotel Sora Kyoto", price: 64_000, cancellable: true, reason: "京都駅徒歩4分・朝食付き", recommended: true },
    { id: "hotel_kamo", category: "lodging", name: "Kamo Riverside Inn", price: 61_000, cancellable: true, reason: "地下鉄駅徒歩2分・静かな川沿い" },
    { id: "hotel_machi", category: "lodging", name: "Machi Stay Gion", price: 56_000, cancellable: false, reason: "祇園中心・町家タイプ" },
    { id: "pottery", category: "activity", name: "東山の陶芸体験", price: 9_400, cancellable: true, reason: "13日 14:00・所要90分", recommended: true },
    { id: "tea", category: "activity", name: "町家のお茶体験", price: 8_600, cancellable: true, reason: "13日 10:30・雨天可" },
    { id: "cycling", category: "activity", name: "鴨川サイクリング", price: 7_200, cancellable: true, reason: "14日 09:00・所要2時間" },
    { id: "dinner", category: "food", name: "祇園 季節のコース", price: 35_000, cancellable: false, reason: "13日 19:00・静かな和食", recommended: true },
    { id: "dinner_flex", category: "food", name: "先斗町 旬菜ディナー", price: 32_000, cancellable: true, reason: "13日 19:30・前日まで取消可" },
  ];
  state.selectedItemIds = ["hotel_sora", "pottery", "dinner"];
  state.status = "inventory_ready";
  audit(state, "search", "条件に合う候補を検索", "宿3件・体験3件・夕食2件 / Simulated inventory");
  return state;
}

export function reviewSelection(tripId: string, itemIds: string[]): TripState {
  const state = getTrip(tripId);
  const uniqueIds = [...new Set(itemIds)];
  const selected = uniqueIds.map((id) => state.inventory.find((item) => item.id === id));
  if (selected.some((item) => !item)) throw new Error("One or more selected items do not exist");
  const items = selected as TripItem[];
  if (items.filter((item) => item.category === "lodging").length !== 1) throw new Error("Select exactly one hotel");
  if (items.filter((item) => item.category === "food").length > 1) throw new Error("Select at most one dinner");
  const total = items.reduce((sum, item) => sum + item.price, 0);
  if (total > state.budget) throw new Error("Selected items exceed the trip budget");

  state.selectedItemIds = uniqueIds;
  state.status = "approval_required";
  const autoItems = items.filter((item) => item.price <= state.autoPayLimit && item.cancellable);
  const approvalItems = items.filter((item) => !autoItems.includes(item));
  audit(state, "selection", "ユーザーが組み合わせを選択", `${items.length}件 / 合計 ¥${total.toLocaleString("ja-JP")}`);
  audit(state, "policy", "支払いポリシーを評価", `${autoItems.length}件 ALLOW / ${approvalItems.length}件 REQUIRE_APPROVAL`);
  return state;
}

export function executeTrip(tripId: string): TripState {
  const state = getTrip(tripId);
  if (state.status === "completed" || state.status === "denied" || state.status === "reapproval_required") return state;
  if (state.status !== "approval_required") throw new Error("Review a selection before payment");
  const items = selectedItems(state);
  if (!items.length) throw new Error("Review a selection before payment");

  if (state.scenario === "price_change") {
    const hotel = items.find((item) => item.category === "lodging")!;
    const previousPrice = hotel.price;
    const currentPrice = previousPrice + 5_000;
    hotel.price = currentPrice;
    const alternative = state.inventory.find((item) => item.category === "lodging" && item.id !== hotel.id && item.cancellable) ?? hotel;
    state.exception = {
      itemId: hotel.id,
      previousPrice,
      currentPrice,
      deltaPercent: Math.round(((currentPrice - previousPrice) / previousPrice) * 1_000) / 10,
      alternativeId: alternative.id,
    };
    state.status = "reapproval_required";
    audit(state, "blocked", "価格変更で自動停止", `${hotel.name}: ¥${previousPrice.toLocaleString("ja-JP")} → ¥${currentPrice.toLocaleString("ja-JP")}`);
    return state;
  }

  if (state.scenario === "denied") {
    state.status = "denied";
    audit(state, "denied", "決済を拒否", "Merchant is not in the approved travel inventory. Funds moved: ¥0");
    return state;
  }

  return completePayment(state, selectedTotal(state), "ユーザー承認とポリシー検証が完了");
}

export function resolveException(tripId: string, action: "reapprove" | "alternative"): TripState {
  const state = getTrip(tripId);
  if (state.status !== "reapproval_required" || !state.exception) throw new Error("No exception is waiting for resolution");
  const changed = state.inventory.find((item) => item.id === state.exception!.itemId);
  if (!changed) throw new Error("Changed item not found");

  if (action === "alternative") {
    const alternative = state.inventory.find((item) => item.id === state.exception!.alternativeId);
    if (!alternative) throw new Error("Alternative item not found");
    state.selectedItemIds = state.selectedItemIds.map((id) => id === changed.id ? alternative.id : id);
    audit(state, "replan", "代替ホテルを選択", `${changed.name}から${alternative.name}へ変更`);
  } else {
    audit(state, "approval", "変更後の金額を再承認", `¥${changed.price.toLocaleString("ja-JP")}のホテル料金を承認`);
  }
  state.exception = undefined;
  return completePayment(state, selectedTotal(state), action === "alternative" ? "代替案を承認" : "価格変更を再承認");
}

function selectedItems(state: TripState) {
  return state.selectedItemIds
    .map((id) => state.inventory.find((item) => item.id === id))
    .filter((item): item is TripItem => Boolean(item));
}

function selectedTotal(state: TripState) {
  return selectedItems(state).reduce((sum, item) => sum + item.price, 0);
}

function completePayment(state: TripState, amount: number, reason: string): TripState {
  if (amount > state.budget) {
    state.status = "denied";
    audit(state, "denied", "予算超過で拒否", `Amount ¥${amount.toLocaleString("ja-JP")} exceeds mandate budget`);
    return state;
  }
  state.status = "completed";
  state.paidAmount = amount;
  state.paymentId = `pay_demo_${state.tripId.slice(-3)}_001`;
  audit(state, "approval", "ユーザー承認", reason);
  audit(state, "payment", "Sandbox決済完了", `${state.paymentId} / ¥${amount.toLocaleString("ja-JP")}`);
  audit(state, "booking", "予約を確定", `${state.selectedItemIds.length}件の予約番号を発行`);
  return state;
}

export function toView(state: TripState) {
  const items = selectedItems(state);
  const exceptionItem = state.exception ? state.inventory.find((item) => item.id === state.exception!.itemId) : undefined;
  const alternative = state.exception ? state.inventory.find((item) => item.id === state.exception!.alternativeId) : undefined;
  const view = state.status === "mandate_created"
    ? "mandate"
    : state.status === "inventory_ready"
      ? "inventory"
      : state.status === "approval_required"
        ? "approval"
        : state.status === "reapproval_required"
          ? "exception"
          : "audit";
  return {
    view,
    tripId: state.tripId,
    scenario: state.scenario,
    status: state.status,
    trip: {
      destination: state.destination,
      dates: `${state.startDate} — ${state.endDate}`,
      travelers: state.travelers,
      budget: state.budget,
      autoPayLimit: state.autoPayLimit,
    },
    inventory: state.inventory,
    selectedItemIds: state.selectedItemIds,
    selectedItems: items,
    selectedTotal: selectedTotal(state),
    paidAmount: state.paidAmount,
    remainingBudget: state.budget - state.paidAmount,
    paymentId: state.paymentId,
    exception: state.exception && exceptionItem && alternative ? { ...state.exception, item: exceptionItem, alternative } : undefined,
    audit: state.audit,
    labels: { inventory: "SIMULATED INVENTORY", payment: "CARD SANDBOX" },
  };
}
