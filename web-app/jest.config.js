module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/*.d.ts', '!**/node_modules/**'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/__tests__/utils.tsx'],
  moduleNameMapper: {
    // https://github.com/facebook/jest/issues/3094
    // https://jestjs.io/docs/en/webpack#handling-static-assets
    '\\.(jpg|jpeg|png)$': '<rootDir>/__mocks__/fileMock.ts',
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.ts',
  },
  globals: {
    // https://github.com/kulshekhar/ts-jest/issues/937#issuecomment-509736680
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.test.json',
    },
  },
};
