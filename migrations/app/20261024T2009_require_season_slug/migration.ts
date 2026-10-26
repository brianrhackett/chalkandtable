#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/345d429dbdd21bba536a1c971a8e1b64315f20aab092878eabc577bc1ebc57b5/contract';
import endContract from '../../snapshots/345d429dbdd21bba536a1c971a8e1b64315f20aab092878eabc577bc1ebc57b5/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e22e3f49b1f37ebdb9d1588670965c16b3ba5f353c842d922c5023705620f022/contract';
import startContract from '../../snapshots/e22e3f49b1f37ebdb9d1588670965c16b3ba5f353c842d922c5023705620f022/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
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
