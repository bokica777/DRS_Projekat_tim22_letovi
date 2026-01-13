export type PurchaseStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type Purchase = {
  id: number;
  flightId: number;
  createdAt: string;
  status: PurchaseStatus;
};
