import { serve } from '../arcade/serve.mjs';
const value = flag => process.argv[process.argv.indexOf(flag) + 1];
const server = serve(process.argv.includes('--root') ? value('--root') : 'dist', { port: Number(process.env.PORT || 4173), host: process.env.HOST || '127.0.0.1', base: process.argv.includes('--base') ? value('--base') : '/' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
