export type CombineRegistrationCreated = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  eventId: string;
  userId: string;
};
