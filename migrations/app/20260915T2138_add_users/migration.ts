#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1c739b28de698d21176bc21ad1c74251b677617638355672e241385f37d7519c/contract';
import startContract from '../../snapshots/1c739b28de698d21176bc21ad1c74251b677617638355672e241385f37d7519c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7abfe73664d68361b7d0899e33a9f728f10938c8da16d8e8ffe25f59550fc994/contract';
import endContract from '../../snapshots/7abfe73664d68361b7d0899e33a9f728f10938c8da16d8e8ffe25f59550fc994/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'league_users',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('leagueId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'league_users',
        constraint: 'league_users_userId_leagueId_key',
        columns: ['userId', 'leagueId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'league_users',
        index: 'league_users_leagueId_idx_1296e985',
        columns: ['leagueId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'league_users',
        index: 'league_users_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'league_users',
        foreignKey: {
          name: 'league_users_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'league_users',
        foreignKey: {
          name: 'league_users_leagueId_fkey',
          columns: ['leagueId'],
          references: { schema: 'public', table: 'leagues', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
