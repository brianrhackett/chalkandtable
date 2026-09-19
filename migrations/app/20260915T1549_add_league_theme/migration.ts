#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1c739b28de698d21176bc21ad1c74251b677617638355672e241385f37d7519c/contract';
import endContract from '../../snapshots/1c739b28de698d21176bc21ad1c74251b677617638355672e241385f37d7519c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/53e382978bfc38b02c342b0d21066a0c267137c33167783040d88cd34b7e3d8b/contract';
import startContract from '../../snapshots/53e382978bfc38b02c342b0d21066a0c267137c33167783040d88cd34b7e3d8b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'leagues',
        column: col('theme', 'text', {
          notNull: true,
          default: lit('green-dark'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'seasons',
        column: col('theme', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
