#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8cc2b3c920f58cb18c5f142ff259ce2389a2e41bc832737759dacdecfc752dd9/contract';
import endContract from '../../snapshots/8cc2b3c920f58cb18c5f142ff259ce2389a2e41bc832737759dacdecfc752dd9/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e3d6d875c872984850683ba97c7a279a27ec156c9b52b24f865614d43e377d8c/contract';
import startContract from '../../snapshots/e3d6d875c872984850683ba97c7a279a27ec156c9b52b24f865614d43e377d8c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'playoff_round_configs',
        columns: [
          col('bestOf', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('playoffId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('round', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'playoff_round_configs',
        constraint: 'playoff_round_configs_playoffId_round_key',
        columns: ['playoffId', 'round'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'playoff_round_configs',
        index: 'playoff_round_configs_playoffId_idx_15ca42b5',
        columns: ['playoffId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'playoff_round_configs',
        foreignKey: {
          name: 'playoff_round_configs_playoffId_fkey',
          columns: ['playoffId'],
          references: { schema: 'public', table: 'playoffs', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
