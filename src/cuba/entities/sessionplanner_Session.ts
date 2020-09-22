import { StandardEntity } from "./base/sys$StandardEntity";
import { Speaker } from "./sessionplanner_Speaker";
import { Category } from "./base/sys$Category";
export class Session extends StandardEntity {
  static NAME = "sessionplanner_Session";
  topic?: string | null;
  startDate?: any | null;
  duration?: number | null;
  speaker?: Speaker | null;
  description?: string | null;
  category?: Category | null;
  endDate?: any | null;
}
export type SessionViewName = "_base" | "_local" | "_minimal";
export type SessionView<V extends SessionViewName> = V extends "_base"
  ? Pick<Session, "id" | "topic" | "startDate" | "duration" | "description">
  : V extends "_local"
  ? Pick<Session, "id" | "topic" | "startDate" | "duration" | "description">
  : V extends "_minimal"
  ? Pick<Session, "id" | "topic">
  : never;
