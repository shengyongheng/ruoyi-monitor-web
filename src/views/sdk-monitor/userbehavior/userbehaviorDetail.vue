<template>
    <div class="userbehavior-detail">
        <el-card class="side-card">
            <div class="side-header">行为详情</div>

            <div class="side-body">
                <div class="section-title">{{ transformBehaviorType(props.activeDetail.behaviorType) }}</div>

                <div class="kv">
                    <span>时间：</span>
                    <b>{{ parseTime(props.activeDetail.timestamp) }}</b>
                </div>
                <div class="kv">
                    <span>页面：</span>
                    <span class="link">{{ props.activeDetail.pageView }}</span>
                </div>
                <div class="kv" v-if="props.activeDetail.description">
                    <span>描述：</span>
                    <span class="tag">{{ props.activeDetail.description }}</span>
                </div>
                <div class="kv" v-if="props.activeDetail.stayTime">
                    <span>描述：</span>
                    <span class="tag">页面停留时长：{{ props.activeDetail.stayTime }}</span>
                </div>
                <template v-if="['history', 'hashchange'].includes(props.activeDetail.behaviorType)">
                    <div class="kv">
                        <span>从哪来：</span>
                        <span>{{ props.activeDetail.oldUrl }}</span>
                    </div>
                    <div class="kv">
                        <span>到哪去：</span>
                        <span>{{ props.activeDetail.newUrl }}</span>
                    </div>
                    <div class="kv" v-if="props.activeDetail.hashStayTime">
                        <span>hash 页面停留时长：</span>
                        <span>{{ props.activeDetail.hashStayTime }}</span>
                    </div>
                    <div class="kv" v-if="props.activeDetail.trigerType">
                        <span>浏览器 history 类型：</span>
                        <span>{{ props.activeDetail.trigerType }}</span>
                    </div>
                </template>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { parseTime } from "@/utils/ruoyi";
const props = defineProps({
    activeDetail: {
        type: Object,
        default: () => ({
            behaviorId: null,
            behaviorType: null,
            description: null,
            hashStayTime: null,
            newUrl: null,
            oldUrl: null,
            stayTime: null,
            timestamp: null,
            trigerType: null,
            pageView: "",
        })
    }
});

function transformBehaviorType(type) {
    switch (type) {
        case "click":
            return "点击行为";
        case "scroll":
            return "滚动行为";
        case "input":
            return "输入行为";
        case "pageStay":
            return "页面停留时长";
        case "history":
            return "history 路由跳转";
        case "hashchange": {
            return "hash 路由跳转";
        }
        default:
            return "未知类型";
    }
}
</script>

<style lang="scss" scoped>
.side-card {
    padding: 0;

    .side-header {
        background: #409eff;
        color: #fff;
        padding: 10px 12px;
        font-weight: 600;
        border-radius: 12px 12px 0 0;
    }

    .side-body {
        padding: 12px;

        .section-title {
            font-weight: 600;
            margin-bottom: 8px;
        }

        .kv {
            font-size: 12px;
            margin-bottom: 6px;

            span {
                color: #606266;
            }

            b {
                color: #303133;
            }

            .link {
                color: #409eff;
            }

            .tag {
                background: #ecf5ff;
                color: #409eff;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
            }
        }
    }
}
</style>