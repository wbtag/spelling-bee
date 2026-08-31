<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
<template>
  <span>{{$t("AcknowledgementsText")}}</span>
      <el-link
        type="primary"
        href="https://github.com/ConorSheehan1/spelling-bee"
        target="_blank">
        GitHub
        <img
          src="../assets/github.svg"
          alt="github"
          class="github-icon" />
      </el-link>
</template>

<style scoped lang="scss">
html.dark {
  .github-icon {
    filter: invert(0.8);
  }
}
</style>