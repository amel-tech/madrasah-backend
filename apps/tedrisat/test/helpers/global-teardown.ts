import { stopTestDatabase } from './test-app.helper';

/**
 * Global teardown for Jest tests
 * This will be called after all test suites have completed
 */
export default async function globalTeardown(): Promise<void> {
  console.log('Running global teardown...');
  await stopTestDatabase();
  console.log('Global teardown completed.');
}
