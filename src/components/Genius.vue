<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <div class="max-w-xl mx-auto">
  <img
    src="../assets/bee.png"
    height="150"
  />
  <h2>{{$t("GeniusTitle")}}</h2>
  </div>
</template>
