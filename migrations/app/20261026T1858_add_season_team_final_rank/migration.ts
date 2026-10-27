#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/345d429dbdd21bba536a1c971a8e1b64315f20aab092878eabc577bc1ebc57b5/contract';
import startContract from '../../snapshots/345d429dbdd21bba536a1c971a8e1b64315f20aab092878eabc577bc1ebc57b5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b83628187de11b6f0b3797a69cf9137d957e7cdb3bec0f45151d76f083266034/contract';
import endContract from '../../snapshots/b83628187de11b6f0b3797a69cf9137d957e7cdb3bec0f45151d76f083266034/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'season_teams',
        column: col('finalRank', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
