<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <img
    src="../assets/bee.png"
    height="250"
  />
  <h2>{{$t("GeniusTitle")}}</h2>
</template>
