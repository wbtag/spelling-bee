<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
<template>
  <ul>
    <li>
      <span>{{ $t("AcknowledgementsText") }}</span>
      <el-link
        type="primary"
        href="https://github.com/ConorSheehan1/spelling-bee"
        target="_blank">
        GitHub repo
      </el-link>
    </li>
    <li>
      <span>{{ $t("WordListSource") }}</span>
      <el-link type="primary" href="$t('WordListLink')" target="_blank">
        Github repo
      </el-link>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.el-link {
  vertical-align: top;
}
html.dark {
  .github-icon {
    filter: invert(0.8);
  }
}
</style>