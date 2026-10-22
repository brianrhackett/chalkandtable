#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/e22e3f49b1f37ebdb9d1588670965c16b3ba5f353c842d922c5023705620f022/contract';
import endContract from '../../snapshots/e22e3f49b1f37ebdb9d1588670965c16b3ba5f353c842d922c5023705620f022/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e926d160cedfc883a948c2e7000244f24b8dc5f56d9dd95d1bb639cc73003168/contract';
import startContract from '../../snapshots/e926d160cedfc883a948c2e7000244f24b8dc5f56d9dd95d1bb639cc73003168/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'season_teams',
        column: 'playerStatsEnabled',
        defaultSql: 'DEFAULT false',
        operationClass: 'widening',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
