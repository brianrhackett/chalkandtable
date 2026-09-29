#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6ad5163bd72ebee3ea8a2dc3b73b34dbb4a5259297811f05021c58355c4b6a85/contract';
import endContract from '../../snapshots/6ad5163bd72ebee3ea8a2dc3b73b34dbb4a5259297811f05021c58355c4b6a85/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/8667a4229fd38a02a721ac71523ce68466fe593cd1a699adceb6bc5eafd37483/contract';
import startContract from '../../snapshots/8667a4229fd38a02a721ac71523ce68466fe593cd1a699adceb6bc5eafd37483/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'playoff_series',
        columns: [
          col('bestOf', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('higherSeed', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('higherSeedTeamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lowerSeed', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lowerSeedTeamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('round', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('seasonId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('seriesNumber', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'playoff_series_round_check_59ed4e16',
            "\"round\" IN ('Quarterfinal', 'Semifinal', 'Final')",
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'matches',
        column: col('playoffSeriesId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'matches',
        column: col('seriesMatch', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.dropNotNull({ schema: 'public', table: 'matches', column: 'week' }),
      this.addUnique({
        schema: 'public',
        table: 'playoff_series',
        constraint: 'playoff_series_seasonId_round_seriesNumber_key',
        columns: ['seasonId', 'round', 'seriesNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'matches',
        index: 'matches_playoffSeriesId_idx_e438d1a0',
        columns: ['playoffSeriesId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'playoff_series',
        index: 'playoff_series_higherSeedTeamId_idx_c260ad05',
        columns: ['higherSeedTeamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'playoff_series',
        index: 'playoff_series_lowerSeedTeamId_idx_1987badf',
        columns: ['lowerSeedTeamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'playoff_series',
        index: 'playoff_series_seasonId_idx_aa50cbae',
        columns: ['seasonId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'playoff_series',
        foreignKey: {
          name: 'playoff_series_seasonId_fkey',
          columns: ['seasonId'],
          references: { schema: 'public', table: 'seasons', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'playoff_series',
        foreignKey: {
          name: 'playoff_series_higherSeedTeamId_fkey',
          columns: ['higherSeedTeamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'playoff_series',
        foreignKey: {
          name: 'playoff_series_lowerSeedTeamId_fkey',
          columns: ['lowerSeedTeamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'matches',
        foreignKey: {
          name: 'matches_playoffSeriesId_fkey',
          columns: ['playoffSeriesId'],
          references: { schema: 'public', table: 'playoff_series', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
