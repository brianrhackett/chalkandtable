#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/53e382978bfc38b02c342b0d21066a0c267137c33167783040d88cd34b7e3d8b/contract';
import endContract from '../../snapshots/53e382978bfc38b02c342b0d21066a0c267137c33167783040d88cd34b7e3d8b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a5b7be0bff1e8c67ba54bb71b558b3fa5a3496dfcd33a76956fd4cd57b132132/contract';
import startContract from '../../snapshots/a5b7be0bff1e8c67ba54bb71b558b3fa5a3496dfcd33a76956fd4cd57b132132/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'venues',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('leagueId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'teams',
        column: col('venueId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'venues',
        constraint: 'venues_leagueId_name_key',
        columns: ['leagueId', 'name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'teams',
        index: 'teams_venueId_idx_b49e8dab',
        columns: ['venueId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'venues',
        index: 'venues_leagueId_idx_1296e985',
        columns: ['leagueId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'venues',
        foreignKey: {
          name: 'venues_leagueId_fkey',
          columns: ['leagueId'],
          references: { schema: 'public', table: 'leagues', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'teams',
        foreignKey: {
          name: 'teams_venueId_fkey',
          columns: ['venueId'],
          references: { schema: 'public', table: 'venues', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
