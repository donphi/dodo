/**
 * Mock implementation for Neo4j driver/session for use in backend tests.
 * Extend as needed for specific test scenarios.
 */
declare const jest: any;

export const mockNeo4jSession = {
  run: jest.fn().mockResolvedValue({ records: [] }),
  close: jest.fn(),
  beginTransaction: jest.fn().mockReturnThis(),
  commit: jest.fn(),
  rollback: jest.fn(),
};

export const mockNeo4jDriver = {
  session: jest.fn(() => mockNeo4jSession),
  close: jest.fn(),
  // Add more methods as needed for your test cases
};