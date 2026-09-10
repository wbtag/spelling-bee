<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Hive from "./components/Hive.vue";
import CorrectGuesses from "./components/CorrectGuesses.vue";
import Progress from "./components/Progress.vue";
import YesterdaysAnswers from "./components/YesterdaysAnswers.vue";
import Info from "./components/Info.vue";
import Genius from "./components/Genius.vue";
import allAnswersEn from "../data/en/allAnswers.json";
import allAnswersCs from "../data/cs/allAnswers.json";
import { useMainStore } from "./store";
import { InfoFilled, Calendar, Sunny, Moon } from "@element-plus/icons-vue";
import { locales } from "./utils";

const answers: Record<string, any> = {
  'en': allAnswersEn,
  'cs': allAnswersCs,
}

const store = useMainStore();
const showYesterdaysAnswers = ref(false);
const showInfo = ref(false);
const zindex = ref(0);
const gameWonModalShown = ref(false); // only show gameWon modal once
let timer: any;

const darkmode = ref(store.theme === "dark");
const { locale } = useI18n();

const languages = Object.entries(locales).map(([k,v]) => ({
  code: k,
  label: v.label,
  flag: v.flag,
}));

const onToggleDarkMode = () => {
  if (darkmode.value === true) {
    store.theme = "dark";
    document.documentElement.classList.add("dark");
  } else {
    store.theme = "light";
    document.documentElement.classList.remove("dark");
  }
};

const onChangeLanguage = (code: string) => {
  store.language = code;
  locale.value = code;
};

const showGameWonModal = computed(
  () => store.getProgressPercentage === 100 && gameWonModalShown.value === false
);

const onOpenCorrectGuesses = () => {
  // without clearing timer, if user toggles correct guesses quickly, it will fade to background after timeout
  clearTimeout(timer);
  zindex.value = -1;
};

const onCloseCorrectGuesses = () => {
  timer = setTimeout(() => {
    zindex.value = 0;
  }, 2000);
};

onMounted(() => {
  onToggleDarkMode();
  locale.value = store.language;
});

store.startGame( answers );
// TODO: extra not in spellingbee: track scores across days
// TODO: add shake animation on incorrect submission?
// https://www.reddit.com/r/webdev/comments/su6y4r/what_animations_are_used_in_wordle/
// need setTimeout to wait for animation before removing guess
</script>

<template>
  <el-dialog
    v-model="showGameWonModal"
    @closed="gameWonModalShown = true">
    <Genius />
  </el-dialog>
  <el-dialog v-model="showYesterdaysAnswers" :title="$t('Yesterdays Answers')">
    <YesterdaysAnswers />
  </el-dialog>
  <el-dialog v-model="showInfo" :title="$t('How to play')">
    <Info />
  </el-dialog>
  <div class="common-layout fireworks">
    <div class="beforeFireworks" v-if="showGameWonModal" />
    <div class="afterFireworks" v-if="showGameWonModal" />
    <el-header height="3em" id="title-header">
      <h2 class="title-flex">
        <strong> {{$t('title')}} </strong>
        <span> {{ store.getGameDateString }} </span>
      </h2>
    </el-header>
    <el-menu mode="horizontal" :ellipsis="false">
      <el-menu-item index="0">
        <el-dropdown trigger="click" @command="onChangeLanguage">
          <span class="language-switcher">
            {{ languages.find((lang) => lang.code === store.language)?.label }}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="lang in languages"
                :key="lang.code"
                :command="lang.code"
                :disabled="lang.code === store.language">
                {{ lang.flag }} {{ lang.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-menu-item>
      <el-menu-item index="1" @click="showInfo = true">
        <el-tooltip :content="$t('Info')" placement="top">
          <el-icon class="menu-icon">
            <InfoFilled />
          </el-icon>
        </el-tooltip>
        <span class="responsive-menu-text">{{ $t("Info") }}</span>
      </el-menu-item>
      <el-menu-item index="2" @click="showYesterdaysAnswers = true">
        <el-tooltip :content="$t('Yesterday')" placement="top">
          <el-icon class="menu-icon">
            <Calendar />
          </el-icon>
        </el-tooltip>
        <span class="responsive-menu-text">{{ $t("Yesterday") }}</span>
      </el-menu-item>
      <el-menu-item index="3">
        <el-switch
          v-model="darkmode"
          @change="onToggleDarkMode"
          class="darkmode-switch"
          inline-prompt
          size="large"
          :active-icon="Sunny"
          :inactive-icon="Moon" />
      </el-menu-item>
    </el-menu>
    <Progress />
    <CorrectGuesses
      @open="onOpenCorrectGuesses"
      @close="onCloseCorrectGuesses" />
    <Hive :ZIndex="zindex" />
  </div>
</template>

<style lang="scss">
@use "element-plus/dist/index.css";
@use "element-plus/theme-chalk/dark/css-vars.css";
@use "./assets/styles/fireworks.scss";
@use "./assets/styles/_variables.scss";

* {
  // stop double tap zoom on safari. often double tap keys in game.
  // TODO: register multiple click events when holding down button?
  // https://stackoverflow.com/a/53236027/6305204
  touch-action: manipulation;
  // https://stackoverflow.com/a/66103439/6305204
  -webkit-tap-highlight-color: transparent;
}

// https://element-plus.org/en-US/guide/theming.html#by-css-variable
:root {
  --el-color-success: variables.$bl-yellow;
  --el-primary-color: variables.$bl-yellow;
  --el-font-size-base: 1em;
}

@font-face {
  font-family: "Garamond";
  src: url("/garamond.ttf") format("truetype");
}

html {
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}

// don't allow words to be split. split on space between words
div {
  white-space: pre-wrap;
  word-break: break-word;
}

.title-flex {
  display: flex;
  flex-direction: row;
  column-gap: 5px;
  justify-content: center;
}

.darkmode-switch {
  --el-switch-on-color: variables.$bl-yellow;
  margin-top: 5px;
}

.language-switcher {
  cursor: pointer;
  font-weight: bold;
}

h2 span {
  color: #bebebe;
  font-weight: lighter;
}

.main-container {
  padding-top: 3em;
}

.common-layout {
  max-width: 1000px;
  margin: auto;
}

.el-header h2 {
  padding: 0;
  margin: 0;
}
.el-menu--horizontal {
  border-top: solid 1px var(--el-menu-border-color);
  justify-content: space-between;
  .el-menu-item {
    padding: 0;
  }
  // these menu items are one-off actions (open dialog, toggle, pick language),
  // not persistent tabs, so never show them as "selected" after a click
  .el-menu-item.is-active {
    color: var(--el-menu-text-color) !important;
    border-bottom-color: transparent !important;
  }
}
.is-focused {
  border-color: variables.$bl-yellow !important;
}
.is-selected {
  color: variables.$bl-yellow !important;
  &::after {
    color: variables.$bl-yellow;
    background-color: variables.$bl-yellow !important;
  }
}
.el-dialog {
  width: 80%;
}
.el-table {
  --el-table-header-bg-color: unset;
}
.el-message--success {
  --el-message-bg-color: unset;
  --el-message-text-color: unset;
  background-color: variables.$bl-yellow !important;
  color: black !important;
}

#app {
  font-family: "Garamond", Avenir, Helvetica, Arial, sans-serif;
  font-size: 1.15em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 40px auto 0;
  padding: 0 10px;

  // account for 10px padding on either side of #app
  max-width: calc(100% - 20px);
  max-height: 100vh;
  #title-header {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
}

// pangram highlight used in multiple components
.pangram {
  font-weight: bold;
}

.toast-message {
  max-width: 80%;
  margin: 0 1em;
  margin-top: 25vh;
}

html.dark {
  header strong {
    color: variables.$bl-yellow;
  }
  .pangram {
    color: variables.$bl-yellow;
  }
}

@media only screen and (max-height: 500px) {
  .toast-message {
    margin-top: 50px;
  }
}

@media only screen and (max-width: 700px) {
  #app {
    margin-top: 10px;
  }
  .menu-icon {
    margin: 19px 5px;
  }
}

@media only screen and (max-width: 400px) {
  .responsive-menu-text {
    display: none;
  }
}
</style>
