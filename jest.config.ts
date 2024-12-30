import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from './tsconfig.json'

const config: JestConfigWithTsJest = {
  watch: false,
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  testTimeout: 10000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>',
    }),
    '^.+\\.png$': '<rootDir>/__mocks__/fileMock.ts',
    '^bymax-react-select$': '<rootDir>/__mocks__/bymaxReactSelectMock.tsx',
  },
  setupFilesAfterEnv: [
    'jest-localstorage-mock',
    '@testing-library/jest-dom',
    '<rootDir>/jest.setup.ts',
  ],
}

export default config
