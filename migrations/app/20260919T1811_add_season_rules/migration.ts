#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/7abfe73664d68361b7d0899e33a9f728f10938c8da16d8e8ffe25f59550fc994/contract';
import startContract from '../../snapshots/7abfe73664d68361b7d0899e33a9f728f10938c8da16d8e8ffe25f59550fc994/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a834130cf9709f2b89a3697428e9e88e57d9a53808c8b25c75b50cb5015463a7/contract';
import endContract from '../../snapshots/a834130cf9709f2b89a3697428e9e88e57d9a53808c8b25c75b50cb5015463a7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'seasons',
        column: col('rules', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
