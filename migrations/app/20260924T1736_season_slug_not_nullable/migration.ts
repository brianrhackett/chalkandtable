#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3a81f7510cd041b1e8e3e80adf7c0f69770b73cc6830a5e0dcd7e1bdfcf3428f/contract';
import endContract from '../../snapshots/3a81f7510cd041b1e8e3e80adf7c0f69770b73cc6830a5e0dcd7e1bdfcf3428f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a834130cf9709f2b89a3697428e9e88e57d9a53808c8b25c75b50cb5015463a7/contract';
import startContract from '../../snapshots/a834130cf9709f2b89a3697428e9e88e57d9a53808c8b25c75b50cb5015463a7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, placeholder } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'seasons',
        column: col('slug', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-seasons-slug', {
        check: () => 'TEMP',
        run: () => 'TEMP',
      }),
      this.setNotNull({ schema: 'public', table: 'seasons', column: 'slug' }),
      this.addUnique({
        schema: 'public',
        table: 'seasons',
        constraint: 'seasons_leagueId_slug_key',
        columns: ['leagueId', 'slug'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
