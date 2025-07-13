import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
require('dotenv').config();

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'npx nx run bourgad-front:serve',
        production: 'npx nx run bourgad-front:serve-static',
      },
      ciWebServerCommand: 'npx nx run bourgad-front:serve-static',
      ciBaseUrl: 'http://localhost:4200',
    }),
    baseUrl: 'http://localhost:4200',
    supportFile: './src/e2e/support/e2e.ts'
  },
  env: {
    googleRefreshToken: process.env['GOOGLE_REFRESH_TOKEN'],
    googleClientId: process.env['BOURGAD_GOOGLE_CLIENTID'],
    googleClientSecret: process.env['BOURGAD_GOOGLE_CLIENT_SECRET'],
  },
});
