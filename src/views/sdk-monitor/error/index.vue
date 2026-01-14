<template>
    <div class="app-container">
        <h2>错误监控</h2>
        <div class="desc">
            追踪 JS Error/Promise Rejection 上下文、Ajax/Fetch 请求错误
        </div>
        <sourcemap-cxt-code />
    </div>
</template>

<script setup>
import SourcemapCxtCode from "./sourcemapCxtCode.vue";

</script>

<style lang="scss" scoped>
.app-container {
    .desc {
        color: #999;
        padding-bottom: 16px;
    }
}
</style>