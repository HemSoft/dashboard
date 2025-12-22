export type BillingCycle = "monthly" | "yearly";

export interface ExpenditureSource {
  id: string;
  userId: string;
  name: string;
  baseCost: number;
  billingCycle: BillingCycle;
  billingDayOfMonth: number;
  consumptionCost: number;
  detailsUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenditureSourceInput {
  name: string;
  baseCost: number;
  billingCycle: BillingCycle;
  billingDayOfMonth: number;
  consumptionCost?: number;
  detailsUrl?: string | null;
}

export interface FetchExpendituresResult {
  sources: ExpenditureSource[];
  error?: string;
}

export interface UpdateResult {
  success: boolean;
  error?: string;
}

export function calculateTotalCost(source: ExpenditureSource): number {
  return source.baseCost + source.consumptionCost;
}

export function calculateNextBillingDate(source: ExpenditureSource): Date {
  const now = new Date();
  const currentDay = now.getDate();
  const billingDay = source.billingDayOfMonth;

  let nextBilling: Date;

  if (source.billingCycle === "yearly") {
    // For yearly, assume billing month is the current month of creation
    // Set to next occurrence of billing day
    nextBilling = new Date(now.getFullYear(), now.getMonth(), billingDay);
    if (nextBilling <= now) {
      nextBilling = new Date(now.getFullYear() + 1, now.getMonth(), billingDay);
    }
  } else if (currentDay < billingDay) {
    // Billing day is later this month
    nextBilling = new Date(now.getFullYear(), now.getMonth(), billingDay);
  } else {
    // Billing day has passed, next month
    nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
  }

  return nextBilling;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatBillingCycle(cycle: BillingCycle): string {
  return cycle === "monthly" ? "/mo" : "/yr";
}
