import 'dotenv/config';

import { Temporal } from '@js-temporal/polyfill';
if (!globalThis.Temporal) {
	globalThis.Temporal = Temporal;
}

const { default: postgres } = await import('@prisma/orm-postgres/runtime');

import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres<Contract>({
	contractJson,
	url: process.env['DATABASE_URL']!,
});
