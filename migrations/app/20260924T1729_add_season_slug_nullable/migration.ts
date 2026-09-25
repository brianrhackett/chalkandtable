#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8667a4229fd38a02a721ac71523ce68466fe593cd1a699adceb6bc5eafd37483/contract';
import endContract from '../../snapshots/8667a4229fd38a02a721ac71523ce68466fe593cd1a699adceb6bc5eafd37483/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a834130cf9709f2b89a3697428e9e88e57d9a53808c8b25c75b50cb5015463a7/contract';
import startContract from '../../snapshots/a834130cf9709f2b89a3697428e9e88e57d9a53808c8b25c75b50cb5015463a7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

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
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
