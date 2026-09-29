#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6ad5163bd72ebee3ea8a2dc3b73b34dbb4a5259297811f05021c58355c4b6a85/contract';
import startContract from '../../snapshots/6ad5163bd72ebee3ea8a2dc3b73b34dbb4a5259297811f05021c58355c4b6a85/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e3d6d875c872984850683ba97c7a279a27ec156c9b52b24f865614d43e377d8c/contract';
import endContract from '../../snapshots/e3d6d875c872984850683ba97c7a279a27ec156c9b52b24f865614d43e377d8c/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'playoffs',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('reseed', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('seasonId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('teamCount', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'playoff_series',
        column: col('playoffId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'playoffs',
        constraint: 'playoffs_seasonId_key',
        columns: ['seasonId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'playoff_series',
        index: 'playoff_series_playoffId_idx_15ca42b5',
        columns: ['playoffId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'playoffs',
        foreignKey: {
          name: 'playoffs_seasonId_fkey',
          columns: ['seasonId'],
          references: { schema: 'public', table: 'seasons', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'playoff_series',
        foreignKey: {
          name: 'playoff_series_playoffId_fkey',
          columns: ['playoffId'],
          references: { schema: 'public', table: 'playoffs', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
