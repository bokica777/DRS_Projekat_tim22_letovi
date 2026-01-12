import type { Purchase } from "../types/purchases";

let purchases: Purchase[] = [];
let nextId = 1;

export function getMyPurchases(): Promise<Purchase[]> {
  return Promise.resolve([...purchases].sort((a, b) => b.id - a.id));
}

export async function createPurchase(flightId: number): Promise<Purchase> {
  const p: Purchase = {
    id: nextId++,
    flightId,
    createdAt: new Date().toISOString(),
    status: "PROCESSING",
  };
  purchases = [p, ...purchases];

  // simulacija duže obrade
  await new Promise((r) => setTimeout(r, 3500));

  // završi kao completed
  purchases = purchases.map((x) =>
    x.id === p.id ? { ...x, status: "COMPLETED" } : x
  );

  return purchases.find((x) => x.id === p.id)!;
}
