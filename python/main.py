"""Game engine. Already done, you do not need to change this.

    python3 main.py                  # you type a secret word, the AI guesses it
    python3 main.py --auto 200       # AI plays 200 random dictionary words, prints win rate
    python3 main.py --auto 200 --length 5
    python3 main.py --lives 10       # allow more wrong guesses (default 8)

Rules: secret words have at least 5 letters; the AI may make 8 wrong guesses.
"""

import argparse
import collections
import random
import time

import ui
from ai import HangmanAI

MIN_LENGTH = 5
MAX_WRONG = 8


def play(ai, secret, max_wrong, show):
    pattern = ["_"] * len(secret)
    wrong_guesses = set()
    guessed = set()
    wrong_count = 0
    n = 0
    thinking = 0.0
    repeats = 0  # consecutive repeated guesses; stop if the AI is stuck

    ai.new_game(len(secret), max_wrong)
    if show:
        ui.draw(pattern, wrong_guesses, wrong_count, max_wrong)

    while wrong_count < max_wrong and "_" in pattern:
        n += 1
        start = time.perf_counter()
        guess = ai.next_guess("".join(pattern), frozenset(wrong_guesses))
        thinking += time.perf_counter() - start

        g = guess.strip().lower() if isinstance(guess, str) else ""
        is_letter = len(g) == 1 and "a" <= g <= "z"
        is_word = len(g) == len(secret) and g.isascii() and g.isalpha()

        if not (is_letter or is_word):
            verdict = "INVALID guess, costs a life"
            wrong_count += 1
        elif g in guessed:
            verdict = "already guessed, ignored"
            repeats += 1
        elif is_letter and g in secret:
            guessed.add(g)
            for i, ch in enumerate(secret):
                if ch == g:
                    pattern[i] = g
            verdict = "correct"
        elif is_word and g == secret:
            guessed.add(g)
            pattern = list(secret)
            verdict = "correct, that's the word"
        else:
            guessed.add(g)
            wrong_guesses.add(g)
            wrong_count += 1
            verdict = "wrong"

        if not verdict.startswith("already"):
            repeats = 0

        if show:
            ui.show_guess(n, guess, verdict)
            ui.draw(pattern, wrong_guesses, wrong_count, max_wrong)

        if repeats >= 5:
            if show:
                print("The AI keeps repeating the same guess. Game stopped, counts as a loss.")
            break

    won = "_" not in pattern
    if show:
        ui.show_end(won, secret, n, wrong_count, thinking)
    return won, wrong_count, thinking


def interactive(ai, dictionary, max_wrong):
    while True:
        secret = ui.ask_secret_word(dictionary, MIN_LENGTH)
        play(ai, secret, max_wrong, show=True)
        if input("\nPlay again? (y/n): ").strip().lower() != "y":
            return


def auto(ai, words, count, length, max_wrong, seed):
    pool = [w for w in words if len(w) >= MIN_LENGTH and (length is None or len(w) == length)]
    secrets = random.Random(seed).sample(pool, min(count, len(pool)))
    by_len = collections.defaultdict(lambda: [0, 0])
    lost = []
    total_time = 0.0
    for secret in secrets:
        won, _, t = play(ai, secret, max_wrong, show=False)
        total_time += t
        by_len[len(secret)][0] += won
        by_len[len(secret)][1] += 1
        if not won:
            lost.append(secret)

    wins = sum(v[0] for v in by_len.values())
    print(f"AI won {wins}/{len(secrets)} games ({wins / len(secrets):.1%}) with {max_wrong} lives")
    for n, (w, t) in sorted(by_len.items()):
        print(f"  {n:2d} letters: {w}/{t}")
    if lost:
        print("Lost on: " + ", ".join(lost[:20]) + (" ..." if len(lost) > 20 else ""))
    print(f"Average thinking time per game: {total_time / len(secrets) * 1000:.1f} ms")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--auto", type=int, metavar="N", help="AI plays N random dictionary words")
    parser.add_argument("--length", type=int, help="with --auto: only words of this length")
    parser.add_argument("--lives", type=int, default=MAX_WRONG, help=f"wrong guesses allowed (default {MAX_WRONG})")
    parser.add_argument("--seed", type=int, default=1, help="with --auto: random seed")
    args = parser.parse_args()

    words = ui.load_words()
    start = time.perf_counter()
    ai = HangmanAI(list(words))
    print(f"Dictionary: {len(words)} words. AI setup took {(time.perf_counter() - start) * 1000:.0f} ms.\n")

    if args.auto:
        auto(ai, words, args.auto, args.length, args.lives, args.seed)
    else:
        interactive(ai, set(words), args.lives)


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nBye.")
    except NotImplementedError:
        print("\nThe AI is not written yet: implement next_guess() in ai.py, then run again.")
