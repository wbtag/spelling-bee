## Build Setup

```shell
# current versions are:
# node 24.14.0
# npm  11.7.0
# pnpm 11.1.1

# install dependencies
pnpm install

# dev server
pnpm dev
# production build (fails to open locally with file:// protocol due to cors)
pnpm build
```

### Create derivative files

_Warning_: this operation may result in the same puzzle repeating too often.
This operation is not idempotent. Re-creating allAnswers.json will change the order of the puzzles, which could result in the same puzzle twice in a row on deploy in the worst case. 
As of version 2.2.0 `createRandomGenerator` produces pseudo-random numbers but can be given a seed to produce the same sequence of random numbers. This should make the operation idempotent.

The file creation script is located in the data folder. The locale to generate files for is determined by the value of the
`--locale` flag. 

   ```shell
   pnpm files:create:{locale}
   ```

   `words.txt` must already exist. It must contain a single word per line.
   `answers.txt` and `pangrams.txt` are optionally created for debugging.
   `allAnswers.json` is created for use in the game.
   Optionally, `suppressedCombinations.json` can be created in each of the locale folders to 
   control how often a particular letter or combination of letters appears. 
   The file's structure is as follows:

```json
[
   {
      "letters": ["e", "r"],
      "sampling": 0
   },
   {
      "letters": ["s"],
      "sampling": 10
   }
]
```

Setting the sampling parameter to 10 will result in 10 per cent of puzzles containing the letter(s) being included in allAnswers.json, 
while a value of 0 will exclude such puzzles altogether.

## Adding new locales

Each new locale needs a separate folder whose name matches its code. The folder must contain `words.txt`,
same format as described above. `data/createFiles.ts` then needs to be run over the folder to generate answer files. 

A new locale needs to be declared in the following places:
* `src/App.vue` - import answer file
* `src/locales/` - add JSON file with translations
* `src/i18n.ts` - import JSON translation
* `src/utils.ts` - add to locales object

Currently, locale selection governs both the language of the game and the UI, but a separation of the two is planned.

## Favicon

Favicons created with http://faviconer.com
http://faviconer.com/user/17914
