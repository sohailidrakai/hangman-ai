/**
 * The hangman AI. THIS is the only file you write.
 *
 * The human picks a secret word from the dictionary. Your AI must guess it.
 * Every wrong guess draws one more part of the hangman. Win before he is complete.
 *
 * main.ts and ui.ts are done: they read the secret word, call your methods,
 * check your guesses and draw the hangman. Do not change the method names
 * or their parameters. Add any helpers, classes or data structures you need.
 */

import { NotImplementedError } from "./ui.ts";

export class HangmanAI {
  /**
   * Called ONCE when the program starts.
   *
   * words - the whole dictionary: an array of lowercase words (a-z only).
   *
   * Do any preprocessing you want here; it is not counted per game.
   */
  constructor(words: string[]) {}

  /**
   * Called at the start of every game.
   *
   * wordLength - number of letters in the secret word
   * maxWrong   - wrong guesses allowed; reaching it means you lose
   */
  newGame(wordLength: number, maxWrong: number): void {}

  /**
   * Return your next guess.
   *
   * pattern      - what is known so far, '_' for unknown letters.
   *                e.g. '_a__a' : 'a' is at positions 1 and 4, and nowhere else.
   * wrongGuesses - everything you guessed that was wrong:
   *                letters (e.g. 'e') and whole words (e.g. 'banana').
   *
   * Return EITHER:
   *   - one letter you have not guessed yet, e.g. 'e'
   *   - OR a whole word of the right length, if you think you know it.
   * A wrong letter or a wrong word both cost one life.
   */
  nextGuess(pattern: string, wrongGuesses: ReadonlySet<string>): string {
    throw new NotImplementedError("write your AI here");
  }
}
