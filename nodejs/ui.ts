/** Terminal drawing and input. Already done, you do not need to change this. */

import { readFileSync } from "node:fs";
import * as readline from "node:readline";

export class NotImplementedError extends Error {}

// 9 drawings: 0 wrong guesses .. 8 wrong guesses (rope, head, body, arms, legs, dead)
const FRAMES: string[][] = [
  ["", "", "", "", ""],
  ["  |", "", "", "", ""],
  ["  |", "  O", "", "", ""],
  ["  |", "  O", "  |", "", ""],
  ["  |", "  O", " /|", "", ""],
  ["  |", "  O", " /|\\", "", ""],
  ["  |", "  O", " /|\\", " /", ""],
  ["  |", "  O", " /|\\", " / \\", ""],
  ["  |", "  X", " /|\\", " / \\", "  RIP"],
];
const GALLOWS = FRAMES.map((rows) =>
  ["", "  +---+", ...rows.map((r) => r.padEnd(6) + "|"), "========="].join("\n"),
);

/**
 * Read the dictionary: lowercase words separated by whitespace.
 * words.txt is the word list from MIT 6.0001 problem set 2 (hangman), 55,900 words.
 */
export function loadWords(path = new URL("./words.txt", import.meta.url)): string[] {
  return readFileSync(path, "utf-8").split(/\s+/).filter(Boolean);
}

// Line reader that also works when input is piped in.
const rl = readline.createInterface({ input: process.stdin });
const lines = rl[Symbol.asyncIterator]();

export class EndOfInput extends Error {}

export async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const next = await lines.next();
  if (next.done) throw new EndOfInput();
  return next.value;
}

export function closeInput(): void {
  rl.close();
}

/** Ask the human for a secret word until they type a valid one. */
export async function askSecretWord(dictionary: Set<string>, minLength: number): Promise<string> {
  while (true) {
    const word = (await ask(`Pick a secret word for the AI to guess (${minLength}+ letters): `))
      .trim()
      .toLowerCase();
    if (word.length < minLength) {
      console.log(`Too short, use at least ${minLength} letters.`);
    } else if (dictionary.has(word)) {
      console.log("\n".repeat(40)); // push the secret off the screen
      return word;
    } else {
      console.log(`'${word}' is not in the dictionary, try another one.`);
    }
  }
}

export function draw(pattern: string[], wrongGuesses: Set<string>, wrongCount: number, maxWrong: number): void {
  const stage = Math.floor((wrongCount * (GALLOWS.length - 1)) / maxWrong);
  console.log(GALLOWS[stage]);
  console.log();
  console.log("  Word:   " + pattern.join(" "));
  console.log("  Wrong:  " + ([...wrongGuesses].sort().join(", ") || "-"));
  console.log(`  Lives:  ${maxWrong - wrongCount}`);
  console.log();
}

export function showGuess(n: number, guess: unknown, verdict: string): void {
  console.log(`AI guess #${n}: '${String(guess)}'  ->  ${verdict}`);
}

export function showEnd(won: boolean, secret: string, guesses: number, wrongCount: number, ms: number): void {
  if (won) {
    console.log(`\nThe AI guessed '${secret}' in ${guesses} guesses (${wrongCount} wrong). AI wins!`);
  } else {
    console.log(`\nThe AI was hanged. The word was '${secret}'. You win!`);
  }
  console.log(`AI thinking time: ${ms.toFixed(1)} ms`);
}
