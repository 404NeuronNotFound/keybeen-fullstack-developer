import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { handleEmailValidation } from './api/validate-email'

function emailValidationApi(apiKey: string | undefined): Plugin {
  const middleware: NonNullable<Plugin['configureServer']> = (server) => {
    server.middlewares.use('/api/validate-email', (req, res) => {
      void handleEmailValidation(req, res, apiKey);
    });
  };
  return {
    name: 'local-email-validation',
    configureServer: middleware,
    configurePreviewServer(server) {
      server.middlewares.use('/api/validate-email', (req, res) => {
        void handleEmailValidation(req, res, apiKey);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), emailValidationApi(process.env.ABSTRACT_EMAIL_VALIDATION_API_KEY ?? env.ABSTRACT_EMAIL_VALIDATION_API_KEY)],
  };
})
