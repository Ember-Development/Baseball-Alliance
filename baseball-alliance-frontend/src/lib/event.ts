export type EventType = "TOURNAMENT" | "COMBINE" | "SHOWCASE";
export type CreateEventInput = {
  title: string;
  type: EventType;
  startDate: string | Date;
  endDate: string | Date;
  city: string;
  state: string; // "TX" etc
  venue?: string;
  isPublished?: boolean;
  startTime?: string; // required for COMBINE
};
export type EventPublic = {
  id: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  city: string;
  state: string;
  venue?: string | null;
  isPublished: boolean;
};
