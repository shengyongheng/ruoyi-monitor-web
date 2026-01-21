<template>
    <div class="sourcecode-ctx"><strong>源代码上下文</strong></div>
    <div class="code-view">
        <div v-for="(sourceContext, index) in props.sourceContextList" :key="index"
            :class="['code-line', { error: sourceContext.isHeightlight }]">
            <span class="line-no">{{ props.startLine + index }}</span>
            <span class="code">{{ sourceContext.sourceCode }}</span>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    sourceContextList: {
        type: Array,
        default: () => ([])
    },
    startLine: {
        type: Number,
        default: 42
    }
})

</script>

<style lang="scss">
.sourcecode-ctx {
    margin-bottom: 8px;
}

.code-view {
    margin: 0;
    padding-left: 8px;
    border: #d9d4d4 1px solid;
    border-radius: 4px;

    .code-line {
        display: flex;
        font-family: monospace;
        line-height: 20px;

        .line-no {
            text-align: right;
            margin-right: 12px;
            color: #999;
        }

        &.error {
            background: #fff3f3;
        }

        &.error .code {
            color: #c41d1d;
            font-weight: 600;
        }
    }
}
</style>