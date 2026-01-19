const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^firebase-admin/storage$': '<rootDir>/__mocks__/firebase-admin/storage.js',
    '^firebase-admin/firestore$': '<rootDir>/__mocks__/firebase-admin/firestore.js',
    '^firebase-admin/app$': '<rootDir>/__mocks__/firebase-admin/app.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(firebase-admin)/)',
  ],
}

module.exports = createJestConfig(customJestConfig)