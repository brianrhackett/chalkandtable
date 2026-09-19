#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/a5b7be0bff1e8c67ba54bb71b558b3fa5a3496dfcd33a76956fd4cd57b132132/contract';
import endContract from '../../snapshots/a5b7be0bff1e8c67ba54bb71b558b3fa5a3496dfcd33a76956fd4cd57b132132/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'leagues',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('playerStatsEnabled', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'matches',
        columns: [
          col('awayScore', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('awayTeamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('homeScore', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('homeTeamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('scheduledAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('seasonId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('scheduled'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('week', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'matches_status_check_8115599a',
            "\"status\" IN ('scheduled', 'completed', 'postponed', 'cancelled')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'players',
        columns: [
          col('active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('firstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('leagueId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'roster_players',
        columns: [
          col('active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('joinedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('leftAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('playerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('seasonId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('teamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'season_teams',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('seasonId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('teamId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'seasons',
        columns: [
          col('active', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('endDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('leagueId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'teams',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('leagueId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'leagues',
        constraint: 'leagues_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'roster_players',
        constraint: 'roster_players_seasonId_playerId_key',
        columns: ['seasonId', 'playerId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'season_teams',
        constraint: 'season_teams_seasonId_teamId_key',
        columns: ['seasonId', 'teamId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'seasons',
        constraint: 'seasons_leagueId_name_key',
        columns: ['leagueId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'teams',
        constraint: 'teams_leagueId_slug_key',
        columns: ['leagueId', 'slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'matches',
        index: 'matches_awayTeamId_idx_17f82264',
        columns: ['awayTeamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'matches',
        index: 'matches_homeTeamId_idx_2a4bf710',
        columns: ['homeTeamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'matches',
        index: 'matches_seasonId_idx_aa50cbae',
        columns: ['seasonId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'matches',
        index: 'matches_seasonId_week_idx_2d40ddc2',
        columns: ['seasonId', 'week'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'players',
        index: 'players_leagueId_idx_1296e985',
        columns: ['leagueId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'roster_players',
        index: 'roster_players_playerId_idx_710cf1aa',
        columns: ['playerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'roster_players',
        index: 'roster_players_seasonId_idx_aa50cbae',
        columns: ['seasonId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'roster_players',
        index: 'roster_players_seasonId_teamId_idx_3ad84779',
        columns: ['seasonId', 'teamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'roster_players',
        index: 'roster_players_teamId_idx_f2b72ab3',
        columns: ['teamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'season_teams',
        index: 'season_teams_seasonId_idx_aa50cbae',
        columns: ['seasonId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'season_teams',
        index: 'season_teams_teamId_idx_f2b72ab3',
        columns: ['teamId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'seasons',
        index: 'seasons_leagueId_idx_1296e985',
        columns: ['leagueId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'teams',
        index: 'teams_leagueId_idx_1296e985',
        columns: ['leagueId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'matches',
        foreignKey: {
          name: 'matches_seasonId_fkey',
          columns: ['seasonId'],
          references: { schema: 'public', table: 'seasons', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'matches',
        foreignKey: {
          name: 'matches_homeTeamId_fkey',
          columns: ['homeTeamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'matches',
        foreignKey: {
          name: 'matches_awayTeamId_fkey',
          columns: ['awayTeamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'players',
        foreignKey: {
          name: 'players_leagueId_fkey',
          columns: ['leagueId'],
          references: { schema: 'public', table: 'leagues', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'roster_players',
        foreignKey: {
          name: 'roster_players_seasonId_fkey',
          columns: ['seasonId'],
          references: { schema: 'public', table: 'seasons', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'roster_players',
        foreignKey: {
          name: 'roster_players_teamId_fkey',
          columns: ['teamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'roster_players',
        foreignKey: {
          name: 'roster_players_playerId_fkey',
          columns: ['playerId'],
          references: { schema: 'public', table: 'players', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'season_teams',
        foreignKey: {
          name: 'season_teams_seasonId_fkey',
          columns: ['seasonId'],
          references: { schema: 'public', table: 'seasons', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'season_teams',
        foreignKey: {
          name: 'season_teams_teamId_fkey',
          columns: ['teamId'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'seasons',
        foreignKey: {
          name: 'seasons_leagueId_fkey',
          columns: ['leagueId'],
          references: { schema: 'public', table: 'leagues', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'teams',
        foreignKey: {
          name: 'teams_leagueId_fkey',
          columns: ['leagueId'],
          references: { schema: 'public', table: 'leagues', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
