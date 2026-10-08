"""The hangman AI. THIS is the only file you write.

The human picks a secret word from the dictionary. Your AI must guess it.
Every wrong guess draws one more part of the hangman. Win before he is complete.

main.py and ui.py are done: they read the secret word, call your methods,
check your guesses and draw the hangman. Do not change the method names
or their arguments. Add any helpers, classes or data structures you need.
"""


class HangmanAI:
    def __init__(self, words):
        """Called ONCE when the program starts.

        words - the whole dictionary: a list of lowercase words (a-z only).

        Do any preprocessing you want here; it is not counted per game.
        """
        pass

    def new_game(self, word_length, max_wrong):
        """Called at the start of every game.

        word_length - number of letters in the secret word
        max_wrong   - wrong guesses allowed; reaching it means you lose
        """
        pass

    def next_guess(self, pattern, wrong_guesses):
        """Return your next guess.

        pattern       - what is known so far, '_' for unknown letters.
                        e.g. '_a__a' : 'a' is at positions 1 and 4, and nowhere else.
        wrong_guesses - set of everything you guessed that was wrong:
                        letters (e.g. 'e') and whole words (e.g. 'banana').

        Return EITHER:
          - one letter you have not guessed yet, e.g. 'e'
          - OR a whole word of the right length, if you think you know it.
        A wrong letter or a wrong word both cost one life.
        """
        raise NotImplementedError("write your AI here")
