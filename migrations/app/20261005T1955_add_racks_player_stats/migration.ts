#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/9080cff0788680d9dabd66f5f5a2576911dc30253252f90517b5b2f4c5490e27/contract';
import startContract from '../../snapshots/9080cff0788680d9dabd66f5f5a2576911dc30253252f90517b5b2f4c5490e27/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9627d8c927be0fe952a42b39f35cfd202ff3c34d079bdc5ac290910181f21ee3/contract';
import endContract from '../../snapshots/9627d8c927be0fe952a42b39f35cfd202ff3c34d079bdc5ac290910181f21ee3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'match_lineups',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('matchId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('position', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('rosterPlayerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('teamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'racks',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('matchId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('rackNumber', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('winnerTeamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'league_users',
        column: col('teamId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'players',
        column: col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'season_teams',
        column: col('playerStatsEnabled', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'seasons',
        column: col('matchFormat', 'text', {
          notNull: true,
          default: lit('Doubles'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'match_lineups',
        constraint: 'match_lineups_matchId_rosterPlayerId_key',
        columns: ['matchId', 'rosterPlayerId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'match_lineups',
        constraint: 'match_lineups_matchId_teamId_position_key',
        columns: ['matchId', 'teamId', 'position'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'racks',
        constraint: 'racks_matchId_rackNumber_key',
        columns: ['matchId', 'rackNumber'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'seasons',
        constraint: 'seasons_matchFormat_check_11dde912',
        expression: "\"matchFormat\" IN ('Singles', 'Doubles')",
      }),
      this.createIndex({
        schema: 'public',
        table: 'league_users',
        index: 'league_users_teamId_idx_f2b72ab3',
        columns: ['teamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'match_lineups',
        index: 'match_lineups_matchId_idx_4caf5ecc',
        columns: ['matchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'match_lineups',
        index: 'match_lineups_matchId_teamId_idx_87b3ae19',
        columns: ['matchId', 'teamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'match_lineups',
        index: 'match_lineups_rosterPlayerId_idx_97403fec',
        columns: ['rosterPlayerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'match_lineups',
        index: 'match_lineups_teamId_idx_f2b72ab3',
        columns: ['teamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'racks',
        index: 'racks_matchId_idx_4caf5ecc',
        columns: ['matchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'racks',
        index: 'racks_winnerTeamId_idx_a56a801d',
        columns: ['winnerTeamId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'league_users',
        foreignKey: {
          name: 'league_users_teamId_fkey',
          columns: ['teamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'match_lineups',
        foreignKey: {
          name: 'match_lineups_matchId_fkey',
          columns: ['matchId'],
          references: { schema: 'public', table: 'matches', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'match_lineups',
        foreignKey: {
          name: 'match_lineups_teamId_fkey',
          columns: ['teamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'match_lineups',
        foreignKey: {
          name: 'match_lineups_rosterPlayerId_fkey',
          columns: ['rosterPlayerId'],
          references: { schema: 'public', table: 'roster_players', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'racks',
        foreignKey: {
          name: 'racks_matchId_fkey',
          columns: ['matchId'],
          references: { schema: 'public', table: 'matches', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'racks',
        foreignKey: {
          name: 'racks_winnerTeamId_fkey',
          columns: ['winnerTeamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
