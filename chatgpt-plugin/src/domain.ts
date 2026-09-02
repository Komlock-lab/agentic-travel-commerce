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
};

export type TripOption = {
  id: string;
  title: string;
  subtitle: string;
  total: number;
  items: TripItem[];
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
  status: "mandate_created" | "options_ready" | "approval_required" | "reapproval_required" | "completed" | "denied";
  selectedOptionId?: string;
  options: TripOption[];
  paidAmount: number;
  paymentId?: string;
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
    options: [],
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

export function searchOptions(tripId: string): TripState {
  const state = getTrip(tripId);
  state.options = [
    {
      id: "plan_a",
      title: "A案｜移動が少ない王道プラン",
      subtitle: "京都駅から近く、初日も無理なく動けます",
      total: 108_400,
      items: [
        { id: "hotel_sora", category: "lodging", name: "Hotel Sora Kyoto", price: 64_000, cancellable: true, reason: "京都駅徒歩4分・変更可能" },
        { id: "pottery", category: "activity", name: "東山の陶芸体験", price: 9_400, cancellable: true, reason: "旅程の空き時間に一致" },
        { id: "dinner", category: "food", name: "祇園 季節のコース", price: 35_000, cancellable: false, reason: "希望した静かな和食" },
      ],
    },
    {
      id: "plan_b",
      title: "B案｜余白を残した安心プラン",
      subtitle: "すべて変更可能、予算に余裕があります",
      total: 101_600,
      items: [
        { id: "hotel_kamo", category: "lodging", name: "Kamo Riverside Inn", price: 61_000, cancellable: true, reason: "地下鉄駅徒歩2分・変更可能" },
        { id: "tea", category: "activity", name: "町家のお茶体験", price: 8_600, cancellable: true, reason: "雨天でも楽しめる" },
        { id: "dinner_flex", category: "food", name: "先斗町 旬菜ディナー", price: 32_000, cancellable: true, reason: "前日まで取消可能" },
      ],
    },
  ];
  state.status = "options_ready";
  audit(state, "search", "旅程を2件作成", "Simulated inventory / quote valid for 10 minutes");
  return state;
}

export function chooseOption(tripId: string, optionId: string): TripState {
  const state = getTrip(tripId);
  const option = state.options.find((item) => item.id === optionId);
  if (!option) throw new Error(`Option not found: ${optionId}`);
  state.selectedOptionId = optionId;
  state.status = "approval_required";
  const autoItems = option.items.filter((item) => item.price <= state.autoPayLimit && item.cancellable);
  const approvalItems = option.items.filter((item) => !autoItems.includes(item));
  audit(state, "policy", "支払いポリシーを評価", `${autoItems.length}件 ALLOW / ${approvalItems.length}件 REQUIRE_APPROVAL`);
  return state;
}

export function executeTrip(tripId: string): TripState {
  const state = getTrip(tripId);
  const option = state.options.find((item) => item.id === state.selectedOptionId);
  if (!option) throw new Error("Choose an itinerary before payment");

  if (state.scenario === "price_change") {
    const hotel = option.items.find((item) => item.category === "lodging");
    if (hotel && hotel.price < 69_000) hotel.price = 69_000;
    option.total = option.items.reduce((sum, item) => sum + item.price, 0);
    state.status = "reapproval_required";
    audit(state, "blocked", "価格変更で自動停止", "Hotel Sora Kyoto: ¥64,000 → ¥69,000 (+7.8%)");
    return state;
  }

  if (state.scenario === "denied") {
    state.status = "denied";
    audit(state, "denied", "決済を拒否", "Merchant is not in the approved travel inventory. Funds moved: ¥0");
    return state;
  }

  return completePayment(state, option.total, "ユーザー承認とポリシー検証が完了");
}

export function resolveException(tripId: string, action: "reapprove" | "alternative"): TripState {
  const state = getTrip(tripId);
  if (state.status !== "reapproval_required") throw new Error("No exception is waiting for resolution");
  const option = state.options.find((item) => item.id === state.selectedOptionId);
  if (!option) throw new Error("Selected option not found");

  if (action === "alternative") {
    const hotel = option.items.find((item) => item.category === "lodging");
    if (hotel) {
      hotel.name = "Kamo Riverside Inn";
      hotel.price = 65_500;
      hotel.reason = "価格変更後に選んだ代替ホテル";
    }
    option.total = option.items.reduce((sum, item) => sum + item.price, 0);
    audit(state, "replan", "代替ホテルを選択", "Hotel Sora Kyotoから変更");
  } else {
    audit(state, "approval", "変更後の金額を再承認", "¥69,000のホテル料金を承認");
  }
  return completePayment(state, option.total, action === "alternative" ? "代替案を承認" : "価格変更を再承認");
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
  audit(state, "booking", "予約を確定", "3件の予約番号を発行");
  return state;
}

export function toView(state: TripState) {
  const selected = state.options.find((item) => item.id === state.selectedOptionId);
  const view = state.status === "mandate_created"
    ? "mandate"
    : state.status === "options_ready"
      ? "options"
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
    options: state.options,
    selected,
    paidAmount: state.paidAmount,
    remainingBudget: state.budget - state.paidAmount,
    paymentId: state.paymentId,
    audit: state.audit,
    labels: {
      inventory: "SIMULATED INVENTORY",
      payment: "CARD SANDBOX",
    },
  };
}
