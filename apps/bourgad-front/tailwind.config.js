import { createGlobPatternsForDependencies } from '@nx/angular/tailwind';
import { join } from 'path';
const sharedTailwindConfig = require('../../libs/front/tailwind-preset/tailwind.config');

/** @type {import('tailwindcss').Config} */
export const presets = [sharedTailwindConfig];
export const content = [
  join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
  ...createGlobPatternsForDependencies(__dirname),
];
