#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/9627d8c927be0fe952a42b39f35cfd202ff3c34d079bdc5ac290910181f21ee3/contract';
import startContract from '../../snapshots/9627d8c927be0fe952a42b39f35cfd202ff3c34d079bdc5ac290910181f21ee3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ed72662cf1def42a398839591b5517e12fabd60a685c6c027256af4bfaf5ac50/contract';
import endContract from '../../snapshots/ed72662cf1def42a398839591b5517e12fabd60a685c6c027256af4bfaf5ac50/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'players',
        column: col('userId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'players',
        constraint: 'players_leagueId_userId_key',
        columns: ['leagueId', 'userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'players',
        index: 'players_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'players',
        foreignKey: {
          name: 'players_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
