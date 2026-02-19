// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect'

// Mock global dependencies if needed
global.console = {
  ...console,
  // Uncomment to ignore console.log during tests
  // log: jest.fn(),
  // error: jest.fn(),
}

// Global Environment Mock
process.env.JWT_SECRET = 'secret';
process.env.MYSQL_USER = 'user';
process.env.MYSQL_PASSWORD = 'password';
process.env.MYSQL_DATABASE = 'db';
