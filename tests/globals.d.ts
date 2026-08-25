// Necessary so the declare module augments instead of defines
import type {} from "vitest";

interface PypressMatchers {
  toHaveSelector(selector: string): Promise<void>;
}

declare module "vitest" {
  interface Matchers<T = any> extends PypressMatchers {}
}

declare global {
  export const it: typeof import("vitest").it;
  export const expect: typeof import("vitest").expect;
  export const FIXTURES: string;
  export const py: ReturnType<typeof import("..").makePypress>;
}
