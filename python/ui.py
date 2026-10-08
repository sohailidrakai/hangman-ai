"""Terminal drawing and input. Already done, you do not need to change this."""

import os

# 9 drawings: 0 wrong guesses .. 8 wrong guesses (rope, head, body, arms, legs, dead)
GALLOWS = [
    """
  +---+
      |
      |
      |
      |
      |
=========""",
    """
  +---+
  |   |
      |
      |
      |
      |
=========""",
    """
  +---+
  |   |
  O   |
      |
      |
      |
=========""",
    """
  +---+
  |   |
  O   |
  |   |
      |
      |
=========""",
    """
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========""",
    """
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========""",
    """
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========""",
    """
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========""",
    """
  +---+
  |   |
  X   |
 /|\\  |
 / \\  |
  RIP |
=========""",
]


def load_words(path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "words.txt")):
    """Read the dictionary: lowercase words separated by whitespace.

    words.txt is the word list from MIT 6.0001 problem set 2 (hangman), 55,900 words.
    """
    with open(path, encoding="utf-8") as f:
        return f.read().split()


def ask_secret_word(dictionary, min_length):
    """Ask the human for a secret word until they type a valid one."""
    while True:
        word = input(f"Pick a secret word for the AI to guess ({min_length}+ letters): ").strip().lower()
        if len(word) < min_length:
            print(f"Too short, use at least {min_length} letters.")
        elif word in dictionary:
            print("\n" * 40)  # push the secret off the screen
            return word
        print(f"'{word}' is not in the dictionary, try another one.")


def draw(pattern, wrong_guesses, wrong_count, max_wrong):
    stage = wrong_count * (len(GALLOWS) - 1) // max_wrong
    print(GALLOWS[stage])
    print()
    print("  Word:   " + " ".join(pattern))
    print("  Wrong:  " + (", ".join(sorted(wrong_guesses)) or "-"))
    print(f"  Lives:  {max_wrong - wrong_count}")
    print()


def show_guess(n, guess, verdict):
    print(f"AI guess #{n}: '{guess}'  ->  {verdict}")


def show_end(won, secret, guesses, wrong_count, seconds):
    if won:
        print(f"\nThe AI guessed '{secret}' in {guesses} guesses ({wrong_count} wrong). AI wins!")
    else:
        print(f"\nThe AI was hanged. The word was '{secret}'. You win!")
    print(f"AI thinking time: {seconds * 1000:.1f} ms")
