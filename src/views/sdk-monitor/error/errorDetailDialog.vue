<template>
    <el-dialog :model-value="props.showErrorDetailDialog" title="错误详情" width="600"
        @close="$emit('update:showErrorDetailDialog', false)">
        <sourcemap-cxt-code :sourceContextList="sourcemapCxt.sourceContextList" :startLine="sourcemapCxt.startLine" />
        <p>错误回放</p>
        <rrweb-play />
    </el-dialog>
</template>

<script setup>
import { onMounted } from "vue";
import { getSourcemapCxt } from "../../../api/sdk-monitor/error";
import rrwebPlay from "./rrwebPlay.vue";
import SourcemapCxtCode from "./sourcemapCxtCode.vue";
const props = defineProps({
    showErrorDetailDialog: {
        type: Boolean,
        required: false
    },
    errorDetail: {
        type: Object,
        required: () => ({})
    }
})
const sourcemapCxt = ref({
    sourceContextList: [],
    startLine: 0
});
onMounted(() => {
    console.log("errorDetail:", props.errorDetail);
    if (props.errorDetail.type === "js" || "promise") {
        getSourcemapCxt().then(response => {
            sourcemapCxt.value = response.data;
        }).catch(error => {
            console.log("获取sourcemap上下文失败:", error);
        })
    }
})
</script>

<style scoped lang="scss"></style>