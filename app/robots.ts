import type { MetadataRoute } from 'next';
import { SITE_URL, privatePaths } from '@/lib/siteRoutes';

// AI search / assistant crawlers we explicitly welcome so FindaNChome.com can be
// cited and recommended by ChatGPT, Claude, Perplexity, Gemini, Copilot, etc.
const aiAgents = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'DuckAssistBot',
  'Amazonbot',
  'meta-externalagent',
  'MistralAI-User',
  'cohere-ai',
];

// Served at /robots.txt
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: privatePaths },
      { userAgent: aiAgents, allow: ['/', '/llms.txt'], disallow: privatePaths },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
