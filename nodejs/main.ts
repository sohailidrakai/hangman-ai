/**
 * Game engine. Already done, you do not need to change this.
 *
 *   npm start                                 # you type a secret word, the AI guesses it
 *   npm start -- --auto 200                   # AI plays 200 random dictionary words, prints win rate
 *   npm start -- --auto 200 --length 5
 *   npm start -- --lives 10                   # allow more wrong guesses (default 8)
 *
 * Rules: secret words have at least 5 letters; the AI may make 8 wrong guesses.
 */

import { performance } from "node:perf_hooks";
import { parseArgs } from "node:util";

import { HangmanAI } from "./ai.ts";
import * as ui from "./ui.ts";

const MIN_LENGTH = 5;
const MAX_WRONG = 8;

type Result = { won: boolean; wrongCount: number; ms: number };

function play(ai: HangmanAI, secret: string, maxWrong: number, show: boolean): Result {
  let pattern = Array<string>(secret.length).fill("_");
  const wrongGuesses = new Set<string>();
  const guessed = new Set<string>();
  let wrongCount = 0;
  let n = 0;
  let ms = 0;
  let repeats = 0; // consecutive repeated guesses; stop if the AI is stuck

  ai.newGame(secret.length, maxWrong);
  if (show) ui.draw(pattern, wrongGuesses, wrongCount, maxWrong);

  while (wrongCount < maxWrong && pattern.includes("_")) {
    n += 1;
    const start = performance.now();
    const guess: unknown = ai.nextGuess(pattern.join(""), new Set(wrongGuesses));
    ms += performance.now() - start;

    const g = typeof guess === "string" ? guess.trim().toLowerCase() : "";
    const isLetter = /^[a-z]$/.test(g);
    const isWord = g.length === secret.length && /^[a-z]+$/.test(g);

    let verdict: string;
    if (!isLetter && !isWord) {
      verdict = "INVALID guess, costs a life";
      wrongCount += 1;
    } else if (guessed.has(g)) {
      verdict = "already guessed, ignored";
      repeats += 1;
    } else if (isLetter && secret.includes(g)) {
      guessed.add(g);
      pattern = pattern.map((ch, i) => (secret[i] === g ? g : ch));
      verdict = "correct";
    } else if (isWord && g === secret) {
      guessed.add(g);
      pattern = secret.split("");
      verdict = "correct, that's the word";
    } else {
      guessed.add(g);
      wrongGuesses.add(g);
      wrongCount += 1;
      verdict = "wrong";
    }

    if (!verdict.startsWith("already")) repeats = 0;

    if (show) {
      ui.showGuess(n, guess, verdict);
      ui.draw(pattern, wrongGuesses, wrongCount, maxWrong);
    }

    if (repeats >= 5) {
      if (show) console.log("The AI keeps repeating the same guess. Game stopped, counts as a loss.");
      break;
    }
  }

  const won = !pattern.includes("_");
  if (show) ui.showEnd(won, secret, n, wrongCount, ms);
  return { won, wrongCount, ms };
}

async function interactive(ai: HangmanAI, dictionary: Set<string>, maxWrong: number): Promise<void> {
  while (true) {
    const secret = await ui.askSecretWord(dictionary, MIN_LENGTH);
    play(ai, secret, maxWrong, true);
    const again = await ui.ask("\nPlay again? (y/n): ");
    if (again.trim().toLowerCase() !== "y") return;
  }
}

/** Small seeded random generator so --auto runs are repeatable. */
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function auto(ai: HangmanAI, words: string[], count: number, length: number | undefined, maxWrong: number, seed: number): void {
  const pool = words.filter((w) => w.length >= MIN_LENGTH && (length === undefined || w.length === length));
  const rand = mulberry32(seed);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const secrets = pool.slice(0, Math.min(count, pool.length));

  const byLen = new Map<number, [number, number]>();
  const lost: string[] = [];
  let totalMs = 0;
  for (const secret of secrets) {
    const { won, ms } = play(ai, secret, maxWrong, false);
    totalMs += ms;
    const entry = byLen.get(secret.length) ?? [0, 0];
    entry[0] += won ? 1 : 0;
    entry[1] += 1;
    byLen.set(secret.length, entry);
    if (!won) lost.push(secret);
  }

  const wins = secrets.length - lost.length;
  console.log(`AI won ${wins}/${secrets.length} games (${((wins / secrets.length) * 100).toFixed(1)}%) with ${maxWrong} lives`);
  for (const [n, [w, t]] of [...byLen.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${String(n).padStart(2)} letters: ${w}/${t}`);
  }
  if (lost.length) console.log("Lost on: " + lost.slice(0, 20).join(", ") + (lost.length > 20 ? " ..." : ""));
  console.log(`Average thinking time per game: ${(totalMs / secrets.length).toFixed(1)} ms`);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      auto: { type: "string" },
      length: { type: "string" },
      lives: { type: "string" },
      seed: { type: "string" },
    },
  });
  const lives = values.lives ? Number(values.lives) : MAX_WRONG;

  const words = ui.loadWords();
  const start = performance.now();
  const ai = new HangmanAI([...words]);
  console.log(`Dictionary: ${words.length} words. AI setup took ${(performance.now() - start).toFixed(0)} ms.\n`);

  if (values.auto) {
    auto(ai, words, Number(values.auto), values.length ? Number(values.length) : undefined, lives, values.seed ? Number(values.seed) : 1);
  } else {
    await interactive(ai, new Set(words), lives);
  }
}

main()
  .catch((e) => {
    if (e instanceof ui.EndOfInput) console.log("\nBye.");
    else if (e instanceof ui.NotImplementedError) console.log("\nThe AI is not written yet: implement nextGuess() in ai.ts, then run again.");
    else throw e;
  })
  .finally(() => ui.closeInput());
