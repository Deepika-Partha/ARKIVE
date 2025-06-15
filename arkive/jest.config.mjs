import fs from 'fs';
import { pathsToModuleNameMapper } from 'ts-jest';

const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

export default {
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.(ts|js)?$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testEnvironment: 'jsdom',
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions?.paths || {}, {
    prefix: '<rootDir>/',
  }),
};



