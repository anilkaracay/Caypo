/**
 * CLI formatting helpers.
 */

import chalk from "chalk";

export const label = (text: string) => chalk.gray(text);
export const value = (text: string) => chalk.white.bold(text);
export const success = (text: string) => chalk.green(text);
export const warn = (text: string) => chalk.yellow(text);
export const fail = (text: string) => chalk.red(text);
export const accent = (text: string) => chalk.cyan(text);
export const dim = (text: string) => chalk.dim(text);

export function banner(): void {
  console.log(chalk.cyan.bold("\n  CAYPO") + chalk.gray(" — Agent finance on institutional rails\n"));
}

export function keyValue(key: string, val: string): void {
  console.log(`  ${label(key + ":")} ${value(val)}`);
}

export function errorMessage(msg: string): void {
  console.log(`\n  ${fail("✗")} ${msg}\n`);
}

export function successMessage(msg: string): void {
  console.log(`\n  ${success("✓")} ${msg}\n`);
}

export function line(width = 36): void {
  console.log(chalk.gray("  " + "─".repeat(width)));
}

export function sectionHeader(title: string): void {
  console.log(chalk.white.bold(`\n  ${title}\n`));
}
