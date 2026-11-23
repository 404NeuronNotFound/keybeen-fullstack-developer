import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { handleEmailValidation } from './api/validate-email'
import { handleMixtape } from './api/mixtape'
import type { MixtapeConfig } from './server/mixtapeStorage'
import { resolve } from 'node:path'

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

function mixtapeApi(config: MixtapeConfig): Plugin {
  const middleware: NonNullable<Plugin['configureServer']> = server => {
    server.middlewares.use('/api/mixtape', (req, res) => { void handleMixtape(req, res, config); });
  };
  return { name: 'visitor-mixtape-api', configureServer: middleware, configurePreviewServer(server) {
    server.middlewares.use('/api/mixtape', (req, res) => { void handleMixtape(req, res, config); });
  } };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const value = (name: string) => process.env[name] ?? env[name];
  const supabaseUrl = value('SUPABASE_URL');
  const supabaseKey = value('SUPABASE_SERVICE_ROLE_KEY');
  return { plugins: [react(), emailValidationApi(value('ABSTRACT_EMAIL_VALIDATION_API_KEY')), mixtapeApi({
    supabaseUrl, supabaseKey, youtubeKey: value('YOUTUBE_API_KEY'), secret: value('MIXTAPE_VISITOR_SECRET'),
    localFile: supabaseUrl || supabaseKey ? undefined : resolve('.data/mixtape.json'),
  })] };
})
