<template>
    <div class="app-container">
        <h2>性能监控</h2>
        <div class="desc">监控<a style="color: #409eff;" href="https://web.developers.google.cn/articles?hl=zh-cn"
                target="_blank">核心网页指标</a>，优化用户体验
        </div>
        <el-form ref="ruleFormRef" inline :model="ruleForm" status-icon :rules="rules" label-width="auto"
            class="performance-ruleForm">
            <el-form-item label="时间范围" prop="datetimeRange">
                <el-date-picker v-model="ruleForm.datetimeRange" type="datetimerange" :shortcuts="shortcuts"
                    range-separator="To" start-placeholder="Start date" end-placeholder="End date" />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="ruleForm.username" autocomplete="off" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    查询
                </el-button>
                <el-button @click="resetForm(ruleFormRef)">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="vitals-row">
            <!-- 页面加载时间 -->
            <div class="vital-card warm">
                <div class="title">
                    页面加载时间
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                </div>
                <div class="value">{{ performanceMetricsAgg.LOAD / 1000 }} <span>s</span></div>
                <div class="sparkline wave"></div>
            </div>

            <!-- 白屏时间 -->
            <div class="vital-card warm">
                <div class="title">
                    白屏时间
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                </div>
                <div class="value">{{ performanceMetricsAgg.FPT }} <span>ms</span></div>
                <div class="sparkline wave"></div>
            </div>

            <!-- TTFB -->
            <div class="vital-card blue">
                <div class="title">首字节时间 (TTFB)</div>
                <div class="value"> {{ performanceMetricsAgg.TTFB }} <span>ms</span></div>
                <div class="sparkline line"></div>
            </div>

            <!-- LCP -->
            <div class="vital-card green">
                <div class="title">最大内容绘制 (LCP)</div>
                <div class="value"> {{ performanceMetricsAgg.LCP }} <span>ms</span></div>
                <div class="sparkline area"></div>
            </div>

            <!-- TTI -->
            <div class="vital-card blue">
                <div class="title">交互时间 (TTI)</div>
                <div class="value">{{ performanceMetricsAgg.TTI / 1000 }} <span>s</span></div>
                <div class="sparkline wave"></div>
            </div>

            <!-- FID -->
            <div class="vital-card purple">
                <div class="title">输入延迟 (FID)</div>
                <div class="value">{{ performanceMetricsAgg.FID }} <span>ms</span></div>
                <div class="sparkline peak"></div>
            </div>

            <!-- CLS -->
            <div class="vital-card danger">
                <div class="title">累计布局偏移 (CLS)</div>
                <div class="value">{{ performanceMetricsAgg.CLS }}</div>
                <div class="donut"></div>
            </div>
        </div>
        <div class="performance-putu">
            <el-card shadow="never">
                <div ref="loadMetricsChartRef" style="width: 100%; height: 300px"></div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { InfoFilled } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getPerformanceMetricsAgg } from "@/api/sdk-monitor/performance"
import { reactive } from 'vue';

const ruleFormRef = ref()

const ruleForm = reactive({
    datetimeRange: [
        // new Date(2000, 10, 10, 10, 10),
        // new Date(2000, 10, 11, 10, 10),
    ],
    username: ''
})

const rules = reactive({
    // pass: [{ validator: validatePass, trigger: 'blur' }],
    // userId: [{ validator: validatePass2, trigger: 'blur' }],
})

const submitForm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!', ruleForm)
        } else {
            console.log('error submit!')
        }
    })
}

const resetForm = (formEl) => {
    if (!formEl) return
    formEl.resetFields()
}

const shortcuts = [
    {
        text: 'Last week',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 7)
            return [start, end]
        },
    },
    {
        text: 'Last month',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 1)
            return [start, end]
        },
    },
    {
        text: 'Last 3 months',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            return [start, end]
        },
    },
]

/**
 * ===== 模拟采集数据（你的实际数据）=====
 */
const timing = {
    fetchStart: 0,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    responseStart: 7,
    responseEnd: 8,
    domInteractive: 508,
    domContentLoadedEventEnd: 511,
    loadEventStart: 511
}

/**
 * ===== 构建瀑布阶段数据 =====
 */
const stages = [
    {
        name: 'DNS 查询',
        start: timing.domainLookupStart,
        end: timing.domainLookupEnd,
        color: '#f6c85f'
    },
    {
        name: 'TCP 建连',
        start: timing.connectStart,
        end: timing.connectEnd,
        color: '#ef6f6c'
    },
    {
        name: 'SSL 建连',
        start:
            timing.secureConnectionStart > 0
                ? timing.secureConnectionStart
                : timing.connectEnd,
        end: timing.connectEnd,
        color: '#6cc4a1'
    },
    {
        name: '请求响应 TTFB',
        start: timing.fetchStart,
        end: timing.responseStart,
        color: '#5b8ff9'
    },
    {
        name: '内容传输',
        start: timing.responseStart,
        end: timing.responseEnd,
        color: '#73c0de'
    },
    {
        name: 'DOM 解析',
        start: timing.responseEnd,
        end: timing.domInteractive,
        color: '#f9e17c'
    },
    {
        name: '资源加载',
        start: timing.domContentLoadedEventEnd,
        end: timing.loadEventStart,
        color: '#9a60b4'
    }
]

/**
 * ===== ECharts 渲染 =====
 */
const loadMetricsChartRef = ref()
let loadMetricsEChart = null

const performanceMetricsAgg = reactive({

});

onMounted(() => {
    getPerformanceMetricsAgg().then(res => {
        const metricsAgg = {};
        for (let i = 0; i < res.data.length; i++) {
            performanceMetricsAgg[res.data[i].type] = res.data[i].p50Value.toFixed(2)
        }
        Object.assign(performanceMetricsAgg, metricsAgg)
    })
    
    initLoadMetrics();
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    loadMetricsEChart?.dispose()
})

function initLoadMetrics() {
    loadMetricsEChart = echarts.init(loadMetricsChartRef.value)

    const yAxisData = stages.map(i => i.name)

    const offsetData = stages.map(i => i.start)
    const durationData = stages.map(i => i.end - i.start)

    const option = {
        title: {
            text: '页面加载性能瀑图',
            left: 'left',
            top: 0,
            textStyle: {
                fontSize: 14,
                fontWeight: 500,
                color: '#1f2329'
            }
        },
        grid: {
            left: 120,
            right: 40,
            top: 40,
            bottom: 30
        },
        xAxis: {
            type: 'value',
            name: 'ms',
            axisLabel: {
                formatter: '{value}'
            }
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            inverse: true
        },
        tooltip: {
            formatter: ({ name, value }) =>
                `${name}<br/>耗时：${value.toFixed(2)} ms`
        },
        series: [
            // 占位（用于偏移）
            {
                type: 'bar',
                stack: 'total',
                itemStyle: {
                    color: 'transparent'
                },
                emphasis: {
                    itemStyle: {
                        color: 'transparent'
                    }
                },
                data: offsetData
            },
            // 实际耗时
            {
                type: 'bar',
                stack: 'total',
                barHeight: 18,
                data: durationData.map((v, i) => ({
                    value: v,
                    itemStyle: {
                        color: stages[i].color
                    },
                    label: {
                        show: v > 0,
                        position: 'right',
                        formatter: `${v.toFixed(2)} ms`
                    }
                }))
            }
        ]
    }

    loadMetricsEChart.setOption(option)
}

function resizeChart() {
    loadMetricsEChart?.resize()
}
</script>

<style lang="scss" scoped>
.app-container {
    .desc {
        color: #999;
        padding-bottom: 16px;
    }

    $v-blue: #409eff;
    $v-green: #67c23a;
    $v-warm: #e6a23c;
    $v-purple: #7a6cff;
    $v-danger: #f56c6c;

    .vitals-row {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 16px;
        margin-bottom: 16px;
    }

    /* 通用卡片 */
    .vital-card {
        position: relative;
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        height: 110px;
        box-shadow: 0 0 0 1px #ebeef5 inset;
        overflow: hidden;

        .title {
            font-size: 13px;
            font-weight: 600;
            color: #606266;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .value {
            font-size: 30px;
            font-weight: 700;
            margin-top: 8px;

            span {
                font-size: 14px;
                font-weight: normal;
                margin-left: 2px;
            }
        }
    }

    /* 颜色主题 */
    .blue .value {
        color: $v-blue
    }

    .green .value {
        color: $v-green
    }

    .warm .value {
        color: $v-warm
    }

    .purple .value {
        color: $v-purple
    }

    .danger .value {
        color: $v-danger
    }

    /* 折线 / 面积 */
    .sparkline {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 40%;
        opacity: 0.35;
    }

    /* 不同形态 */
    .wave {
        background: linear-gradient(135deg, currentColor 25%, transparent 25%) left,
            linear-gradient(225deg, currentColor 25%, transparent 25%) left;
        background-size: 20px 20px;
    }

    .line {
        background: linear-gradient(to right, transparent, currentColor);
        height: 3px;
        bottom: 16px;
    }

    .area {
        clip-path: polygon(0 80%, 20% 60%, 40% 75%, 60% 40%, 80% 55%, 100% 35%, 100% 100%, 0 100%);
        background: currentColor;
    }

    .peak {
        clip-path: polygon(0 80%, 60% 70%, 80% 30%, 100% 60%, 100% 100%, 0 100%);
        background: currentColor;
    }

    /* CLS 圆环 */
    .donut {
        position: absolute;
        right: 14px;
        bottom: 14px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background:
            conic-gradient($v-danger 0 22%, #f3d1cd 22% 100%);
    }
}
</style>