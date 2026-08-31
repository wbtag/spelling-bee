<script setup lang="ts">
import { computed } from "vue";
import { useMainStore } from "../store";
import { gridify } from "../utils";

const store = useMainStore();
const gridData = computed(() =>
  gridify({ arr: Array.from(store.yesterdaysAnswers[store.language].sort()), size: 3 })
);
</script>

<template>
  <strong>
    <span
      v-for="letter in store.yesterdaysAvailableLetters[store.language]"
      :key="`ydayLetter${letter}`"
      :class="{ 'middle-letter': letter === store.yesterdaysMiddleLetter[store.language] }">
      {{ letter }}
    </span>
  </strong>
  <el-table :data="gridData" :cell-class-name="store.cellClassName">
    <el-table-column property="1" label="" />
    <el-table-column property="2" label="" />
    <el-table-column property="3" label="" />
  </el-table>
</template>

<style scoped lang="scss">
@use "../assets/styles/_variables";

.middle-letter {
  font-weight: bold;
  color: variables.$bl-yellow;
}
</style>
