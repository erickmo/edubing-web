/**
 * MSW (Mock Service Worker) server setup for Vitest tests.
 * Import this in test files or configure via setup.ts.
 */
import { setupServer } from "msw/node";
import type { RequestHandler } from "msw";

export function createMswServer(...handlers: RequestHandler[]) {
  return setupServer(...handlers);
}

/** Shared server instance used across all test suites. */
export const server = setupServer();
