import type { TopicContent } from "../types";
import { CORE_CONTENT } from "./core";
import { THEORETICAL_CONTENT } from "./theoretical";
import { SOFTWARE_CONTENT } from "./software";
import { DATABASES_CONTENT } from "./databases";
import { NETWORKS_CONTENT } from "./networks";
import { OS_CONTENT } from "./os";

const all: TopicContent[] = [
  ...CORE_CONTENT,
  ...THEORETICAL_CONTENT,
  ...SOFTWARE_CONTENT,
  ...DATABASES_CONTENT,
  ...NETWORKS_CONTENT,
  ...OS_CONTENT,
];

export const CONTENT: Record<string, TopicContent> = Object.fromEntries(
  all.map((c) => [c.id, c])
);
