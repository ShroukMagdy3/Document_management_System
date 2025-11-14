import { config } from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

// List of critical env keys used by the app. We prefer values already set
// in `process.env` (e.g. set by Vercel). Only when any of these are missing
// we attempt to read `config/.env` and populate the missing keys.
const CRITICAL_KEYS = ['DB_URL', 'DB_HOST', 'DB_MONGO'];

const missing = CRITICAL_KEYS.filter((k) => !process.env[k]);
if (missing.length > 0) {
	const envPath = resolve(process.cwd(), 'config', '.env');
	if (fs.existsSync(envPath)) {
		const result = config({ path: envPath });
		if (result.parsed) {
			for (const [key, value] of Object.entries(result.parsed)) {
				if (!process.env[key]) {
					process.env[key] = value;
				}
			}
		}
	}
}

export {};
