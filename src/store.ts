// https://stephanlangeveld.medium.com/simple-local-storage-implementation-using-vue-3-vueuse-and-pinia-with-zero-extra-lines-of-code-cb9ed2cce42a
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { differenceInDays, isSameDay } from "date-fns";
import { epoch, generateAnswerObjs, incrementDups } from "./utils";
import { Answer } from "./models/answer";

interface LocaleAnswerData {
  [locale: string]: Answer[];
}

interface LocaleAnswers {
  [locale: string]: string[];
}

interface LocaleLetters {
  [locale: string]: string;
}

interface LocaleMiddleLetters {
  [locale: string]: string;
}

interface LocaleCorrectGuesses {
  [locale: string]: Set<string>;
}

interface LocaleYesterdayAnswerObj {
  [locale: string]: Answer;
}

const correctGuesses = ['en', 'cs'].reduce((acc, curr) => {
  acc[curr] = new Set([]);
  return acc;
}, {} as LocaleCorrectGuesses);

export const useMainStore = defineStore("main", {
  state: () => ({
    correctGuesses: useStorage(
      "localeCorrectGuesses",
      correctGuesses as LocaleCorrectGuesses,
      undefined,
      {
        serializer: {
          read: (v: string): LocaleCorrectGuesses =>
            Object.fromEntries(
              Object.entries(JSON.parse(v)).map(([locale, arr]) => [
                locale,
                new Set(arr as string[]),
              ])
            ),
          write: (v: LocaleCorrectGuesses): string =>
            JSON.stringify(
              Object.fromEntries(
                Object.entries(v).map(([locale, set]) => [
                  locale,
                  Array.from(set),
                ])
              )
            ),
        },
      }
    ),
    answers: useStorage("localeAnswers", {} as LocaleAnswers),
    availableLetters: useStorage("localeLetters", {} as LocaleLetters),
    middleLetter: useStorage("localeMiddleLetters", {} as LocaleMiddleLetters),
    gameDate: useStorage("gameDate", epoch as Date),
    lastGameDate: useStorage("lastGameDate", new Date() as Date),
    yesterdaysAnswers: useStorage(
      "localeYesterdaysAnswers",
      {} as LocaleAnswers
    ),
    yesterdaysAvailableLetters: useStorage(
      "localeYesterdaysLetters",
      {} as LocaleLetters
    ),
    yesterdaysMiddleLetter: useStorage(
      "localeYesterdaysMiddleLetters",
      {} as LocaleMiddleLetters
    ),
    theme: useStorage("theme", "light" as string),
    language: useStorage("language", "en" as string),
    pointsMessages: {
        1: "good",
        5: "nice",
        6: "great",
        7: "excellent",
        8: "amazing",
    } as { [key: number]: string },
  }),
  getters: {
    // TODO: move getMaxScore, getScoreLevels to state? compute once at startGame
    getMaxScore(): number {
      return this.answers[this.language]?.reduce(
        (acc: number, word: string): number => {
          // @ts-ignore issue with this ref? says .calculatePoints is undefined here but not outside arrow funcs
          return acc + this.calculatePoints({ word });
        },
        0
      );
    },
    getMinScore(): number {
      // 19 4-letter words @ 1 point each, 1 pangram @ min 14 points.
      const minNumWords = 20;
      return minNumWords - 1 + 14; // 33
    },
    getScoreLevels(): Array<number> {
      // TODO: fix tests, getMaxScore 50 should produce dups
      // difficulty levels
      const levels = [
        // return [
        0,
        5,
        Math.floor(this.getMaxScore * 0.1),
        Math.floor(this.getMaxScore * 0.2),
        Math.floor(this.getMaxScore * 0.3),
        Math.floor(this.getMaxScore * 0.4),
        Math.floor(this.getMaxScore * 0.5),
        Math.floor(this.getMaxScore * 0.55),
        Math.floor(this.getMaxScore * 0.6),
      ].sort((a, b) => a - b);
      const uniqueLevels = incrementDups(levels);
      const minUniqueLevel = Math.min(...uniqueLevels);
      // ensure there are never any 2 levels with the same points requirements.
      // ensure the first level is 0.
      return uniqueLevels.map((l: number) => l - minUniqueLevel);
    },
    // as getter so result can be cached
    getCorrectGuesses(): Array<string> {
      return Array.from(this.correctGuesses[this.language]);
    },
    getProgressIndex(): number {
      return (
        this.getScoreLevels.filter((v) => v <= this.getUserScore).length - 1
      );
    },
    getProgressPercentage(): number {
      const progressPercentages = [0, 20, 40, 50, 60, 70, 80, 90, 100];
      return progressPercentages[this.getProgressIndex];
    },
    getUserScore(): number {
      return this.getCorrectGuesses.reduce(
        (acc: number, word: string): number => {
          // @ts-ignore issue with this ref? says .calculatePoints is undefined here but not outside arrow funcs
          return acc + this.calculatePoints({ word });
        },
        0
      );
    },
    getColor(): string {
      return this.theme === "light" ? "white" : "#1c1b22";
    },
    getGameDate(): Date {
      // handle case where gameDate may still be string in localStorage from previous code
      return this.gameDate;
    },
    getGameDateString(): string {
      const locales: Record<string, string> = {
        en: "en-gb",
        cs: "cs-cz",
      };
      return this.getGameDate.toLocaleDateString(locales[this.language]);
    },
  },
  actions: {
    showMessage(args: object) {
      return ElMessage({
        duration: 2000,
        // change width? seems too wide in inspector but looks ok on device
        appendTo: "#app",
        customClass: "toast-message",
        grouping: true,
        showClose: true,
        ...args,
      });
    },
    submitGuess({ $t, guess }: { $t: Function; guess: string }) {
      if (guess.length < 4) {
        return this.showMessage({
          message: $t("too short"),
        });
      }
      if (!guess.split("").includes(this.middleLetter[this.language])) {
        return this.showMessage({
          message: $t("missing middle letter"),
        });
      }
      if (!this.answers[this.language].includes(guess)) {
        return this.showMessage({
          message: $t("not in word list"),
        });
      }
      if (this.correctGuesses[this.language].has(guess)) {
        return this.showMessage({
          message: $t("already found"),
        });
      }

      this.correctGuesses[this.language].add(guess);
      const points = this.calculatePoints({ word: guess });
      if (this.isPangram({ word: guess })) {
        this.showMessage({
          type: "success",
          message: `Pangram! +${points}`,
        });
      } else {
        this.showMessage({
          type: "success",
          message: this.generatePointsMessage({ $t, points }),
        });
      }
    },
    startGame(answerObj: LocaleAnswerData) {
      const now = new Date();
      if (isSameDay(this.getGameDate, now)) return false;

      this.gameDate = now;

      const yesterdaysAnswerObjs: LocaleYesterdayAnswerObj = {};

      for (const [locale, localeAnswers] of Object.entries(answerObj)) {
        this.correctGuesses[locale] = new Set([]);

        const { todaysAnswerObj, yesterdaysAnswerObj } = generateAnswerObjs({
          allAnswers: localeAnswers,
          gameDate: this.gameDate,
        });

        yesterdaysAnswerObjs[locale] = yesterdaysAnswerObj;

        const { answers, availableLetters, middleLetter } = todaysAnswerObj;

        this.answers[locale] = answers;
        this.availableLetters[locale] = availableLetters;
        this.middleLetter[locale] = middleLetter;
      }
      this.setYesterdaysAnswersAndLastGameDate({ yesterdaysAnswerObjs });
    },
    setYesterdaysAnswersAndLastGameDate({
      yesterdaysAnswerObjs,
    }: {
      yesterdaysAnswerObjs: LocaleYesterdayAnswerObj;
    }): string {
      // note: must be run after gameDate is set and before answers, availableLetters, and middleLetter are set!
      // the algorithm used to pick todays and yesterday's answers may change.
      // e.g. https://github.com/ConorSheehan1/spelling-bee/issues/3
      // bug where yesterday's answers were always incorrect at the first of the month.
      // to avoid this, use today's answers from local storage as yesterday's answers if gamedate was yesterday
      for (const [locale, yesterdaysAnswerObj] of Object.entries(
        yesterdaysAnswerObjs
      )) {
        if (differenceInDays(this.gameDate, this.lastGameDate) === 1) {
          this.yesterdaysAnswers[locale] = this.answers[locale];
          this.yesterdaysAvailableLetters[locale] =
            this.availableLetters[locale];
          this.yesterdaysMiddleLetter[locale] = this.middleLetter[locale];
          return "local-storage-cache";
        } else {
          const {
            answers: yesterdaysAnswers,
            availableLetters: yesterdaysAvailableLetters,
            middleLetter: yesterdaysMiddleLetter,
          } = yesterdaysAnswerObj;
          this.yesterdaysAnswers[locale] = yesterdaysAnswers;
          this.yesterdaysAvailableLetters[locale] = yesterdaysAvailableLetters;
          this.yesterdaysMiddleLetter[locale] = yesterdaysMiddleLetter;
          this.lastGameDate = this.gameDate;
        }
      }
      return "cache-bust";
    },
    calculatePoints({ word }: { word: string }): number {
      if (word.length === 4) return 1;
      if (this.isPangram({ word })) return word.length + 7;
      return word.length;
    },
    // If word has 7 unique letters, assume pangram. Handles case where it is a pangram from yesterday.
    isPangram({ word }: { word: string }): boolean {
      return new Set(word).size === 7;
    },
    // points per word, score is total of points.
    generatePointsMessage({
      $t,
      points,
    }: {
      $t: Function;
      points: number;
    }): string {
      const message = this.pointsMessages[points] || "amazing";
      return `${$t(`points.${message}`)}! +${points}`;
    },
    cellClassName({ row, columnIndex }: { row: any; columnIndex: number }) {
      const word = row[columnIndex + 1];
      if (word && this.isPangram({ word })) {
        return "pangram";
      }
    },
  },
});
