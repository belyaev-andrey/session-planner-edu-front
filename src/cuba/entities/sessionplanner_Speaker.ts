import { StandardEntity } from "./base/sys$StandardEntity";
export class Speaker extends StandardEntity {
  static NAME = "sessionplanner_Speaker";
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}
export type SpeakerViewName = "_base" | "_local" | "_minimal";
export type SpeakerView<V extends SpeakerViewName> = V extends "_base"
  ? Pick<Speaker, "id" | "firstName" | "lastName" | "email">
  : V extends "_local"
  ? Pick<Speaker, "id" | "firstName" | "lastName" | "email">
  : V extends "_minimal"
  ? Pick<Speaker, "id" | "firstName" | "lastName">
  : never;
