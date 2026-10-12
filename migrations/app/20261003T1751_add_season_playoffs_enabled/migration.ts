#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/8cc2b3c920f58cb18c5f142ff259ce2389a2e41bc832737759dacdecfc752dd9/contract';
import startContract from '../../snapshots/8cc2b3c920f58cb18c5f142ff259ce2389a2e41bc832737759dacdecfc752dd9/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9080cff0788680d9dabd66f5f5a2576911dc30253252f90517b5b2f4c5490e27/contract';
import endContract from '../../snapshots/9080cff0788680d9dabd66f5f5a2576911dc30253252f90517b5b2f4c5490e27/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'seasons',
        column: col('playoffsEnabled', 'bool', { codecRef: { codecId: 'pg/bool@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
