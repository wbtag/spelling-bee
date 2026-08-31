<script setup lang="ts">
import Acknowledgments from "./Acknowledgments.vue";
</script>

<template>
  <div class="info-dialog">
    <h3>{{ $t("helpCreateWords") }}</h3>

    <ul>
      <li>{{ $t("helpWordRule1") }}.</li>
      <li>{{ $t("helpWordRule2") }}.</li>
      <li>{{ $t("helpWordRule3") }}.</li>
    </ul>

    <h3>{{ $t("helpScorePoints") }}</h3>

    <ul>
      <li>{{ $t("helpPointsRule1") }}.</li>
      <li>{{ $t("helpPointsRule2") }}.</li>
      <li>{{ $t("helpPointsRule3A") }}. {{ $t("helpPointsRule3B") }}!</li>
    </ul>

    <h3>{{ $t("AcknowledgementsTitle") }}</h3>
    <Acknowledgments />

    <h3>{{ $t("Bugs") }}</h3>
    <ul>
      <li>
        {{ $t("BugText") }}
        <el-link
          type="primary"
          href="https://github.com/wbtag/spelling-bee/issues"
          target="_blank"
          >GitHub</el-link
        >
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.info-dialog {
  text-align: left;
}
</style>
