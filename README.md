# Hangman AI

The roles are reversed: **the human picks a secret word, and your program guesses it.**
Every wrong guess draws one more part of the hangman. Your AI must find the word before he is complete.

Pick **one** language. You only write the AI file. Reading the secret word, checking your guesses, drawing the hangman and the game loop are already done.

| | Python | Node.js + TypeScript |
|---|---|---|
| Folder | `python/` | `nodejs/` |
| **Your file** | **`ai.py`** | **`ai.ts`** |
| Needs | Python 3.9+ | Node.js 18+, then `npm install` once |
| Play | `python3 main.py` | `npm start` |
| Win rate over 200 random words | `python3 main.py --auto 200` | `npm start -- --auto 200` |
| Only 5-letter words | `python3 main.py --auto 200 --length 5` | `npm start -- --auto 200 --length 5` |

Before you start, the program runs, draws an empty gallows and tells you the AI is not written yet. That is expected.

## Rules

- The secret word is always in `words.txt` (55,900 lowercase words, from MIT 6.0001's hangman assignment) and has **at least 5 letters**.
- Your AI has **8 lives**. A wrong letter, a wrong whole-word guess or an invalid guess each cost one life.
- A repeated guess is ignored and costs nothing, but 5 repeats in a row stop the game as a loss.
- Your AI never sees the secret word. Each turn it only gets:
  - `pattern`: what is known so far, for example `_a__a`. That means `a` is at positions 1 and 4 **and nowhere else**.
  - wrong guesses: every wrong letter and wrong word so far.
- Each turn, return **one new letter**, or **the whole word** if you are confident.

## What to implement

| Python (`ai.py`) | TypeScript (`ai.ts`) | Called | Your job |
|---|---|---|---|
| `__init__(words)` | `constructor(words)` | once, at program start | receive the dictionary; preprocess it if you want |
| `new_game(word_length, max_wrong)` | `newGame(wordLength, maxWrong)` | at the start of each game | reset your state for a new game |
| `next_guess(pattern, wrong_guesses)` | `nextGuess(pattern, wrongGuesses)` | every turn | return your next guess |

## Goal

1. First, an AI that plays legal moves and can win sometimes.
2. Then make it **smart**: it should win nearly every game. Check this with `--auto 200`.
3. Keep it fast. The time your AI spends thinking is printed after every game.

## Expectations

- Think aloud. Explain your approach, and its time and memory cost, before and while you code.
- Run the program often.
- No AI assistants and no copying from the internet. Language docs are fine.
