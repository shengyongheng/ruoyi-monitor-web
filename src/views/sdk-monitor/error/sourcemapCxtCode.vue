<template>
    <pre class="code-view">
        <div 
            v-highlight
            v-for="(line, index) in lines"
            :key="index"
            :class="['code-line', { error: line.isHeightlight }]"
        >
            <span class="line-no">{{ startLine + index }}</span>
            <span class="code">{{ line.sourceCode }}</span>
        </div>
    </pre>
</template>

<script setup>
defineProps({
    lines: {
        type: Array,
        default: () => {
            return [
                {
                    "sourceCode": "// Tree Shaking 参考链接：http://zhuanlan.zhihu.com/p/403901557",
                    "isHeightlight": false
                },
                {
                    "sourceCode": "console.log(bar, \"<--log\");",
                    "isHeightlight": false
                },
                {
                    "sourceCode": "",
                    "isHeightlight": false
                },
                {
                    "sourceCode": "setTimeout(() => {",
                    "isHeightlight": false
                },
                {
                    "sourceCode": "  Promise.reject(new Error(\"something broke\"));",
                    "isHeightlight": false
                },
                {
                    "sourceCode": "  console.log(foo);",
                    "isHeightlight": true
                },
                {
                    "sourceCode": "}, 3000)",
                    "isHeightlight": false
                }
            ]
        }
    },
    startLine: {
        type: Number,
        default: 42
    }
})
</script>

<style lang="scss">
.code-line {
    display: flex;
    font-family: monospace;
    line-height: 20px;

    .line-no {
        width: 48px;
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
</style>