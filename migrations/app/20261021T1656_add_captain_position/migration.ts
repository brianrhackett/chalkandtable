#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/e926d160cedfc883a948c2e7000244f24b8dc5f56d9dd95d1bb639cc73003168/contract';
import endContract from '../../snapshots/e926d160cedfc883a948c2e7000244f24b8dc5f56d9dd95d1bb639cc73003168/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ed72662cf1def42a398839591b5517e12fabd60a685c6c027256af4bfaf5ac50/contract';
import startContract from '../../snapshots/ed72662cf1def42a398839591b5517e12fabd60a685c6c027256af4bfaf5ac50/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'roster_players',
        column: col('captainPosition', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'roster_players',
        constraint: 'roster_players_captainPosition_check_6cc4391e',
        expression: "\"captainPosition\" IN ('primary', 'co_captain')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
