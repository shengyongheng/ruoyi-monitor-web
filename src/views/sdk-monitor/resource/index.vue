<template>
    <div class="app-container">
        <h2>资源监控</h2>
        <div class="desc">分析 JS、CSS、图片、字体等资源的加载性能</div>
        <div class="resource-monitor">
            <el-card class="session-list" shadow="always">
                <!-- Header -->
                <div class="panel-header">会话列表</div>

                <!-- List -->
                <div class="list">
                    <div v-for="item in conversations" :key="item.sessionId" class="list-item"
                        :class="{ active: item.active }" @click="setActive(item)">
                        <!-- Left Content -->
                        <div class="item-content">
                            <div class="username">{{ item.username }}</div>
                            <div class="meta">Session ID: {{ item.sessionId }}</div>
                            <div class="meta">最近访问：{{ item.lastVisit }}</div>
                            <div class="meta">{{ item.actions }} 次行为</div>
                        </div>
                    </div>
                </div>
            </el-card>
            <div class="resource-details">
                <div class="chart-wrapper">
                    <el-card class="chart-card" shadow="never">
                        <div class="chart-title">资源加载时间（ms）</div>
                        <div ref="resourceChartRef" class="chart-container"></div>
                    </el-card>
                    <el-card class="chart-card" shadow="never">
                        <div class="title">资源错误趋势</div>
                        <div ref="errorEhartRef" class="chart-container"></div>
                    </el-card>
                </div>
                <el-card class="resource-card" shadow="never">
                    <!-- Header -->
                    <div class="card-header">
                        <span class="title">详细资源列表</span>
                    </div>

                    <!-- Table -->
                    <el-table :data="tableData" border stripe class="resource-table">
                        <el-table-column prop="name" label="全称" min-width="160">
                            <template #default="{ row }">
                                <el-link type="primary" :underline="false">
                                    {{ row.name }}
                                </el-link>
                            </template>
                        </el-table-column>

                        <el-table-column prop="type" label="类型" width="80" sortable />
                        <el-table-column prop="time" label="耗时" width="90" sortable>
                            <template #default="{ row }">
                                {{ row.time }} ms
                            </template>
                        </el-table-column>

                        <el-table-column prop="status" label="状态码" width="90" sortable />
                        <el-table-column prop="initiator" label="来源" width="120" />
                        <el-table-column prop="cache" label="缓存命中" width="120" sortable>
                            <template #default="{ row }">
                                <div class="cache-flag">
                                    <el-icon :class="row.cache ? 'ok' : 'fail'">
                                        <CircleCheck v-if="row.cache" />
                                        <CircleClose v-else />
                                    </el-icon>
                                    <span>{{ row.cache ? '是' : '否' }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column prop="size" label="大小" width="110" sortable />
                        <!-- <el-table-column prop="transfer" label="传输量" width="110" sortable />
                <el-table-column prop="speed" label="带宽量" width="120" sortable /> -->
                    </el-table>

                    <!-- Pagination -->
                    <div class="pager">
                        <el-pagination background layout="prev, pager, next" :total="50" :page-size="10" />
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const conversations = ref([])

const tableData = ref([
    {
        name: 'main.js',
        type: 'JS',
        time: 523,
        status: 200,
        initiator: 'script',
        cache: true,
        size: '201.3 KB',
        transfer: '201.3 KB',
        speed: '385.0 KB/s'
    },
    {
        name: 'style.css',
        type: 'JS',
        time: 455,
        status: 200,
        initiator: 'link',
        cache: false,
        size: '309.9 KB',
        transfer: '217.1 KB',
        speed: '783.3 KB/s'
    },
    {
        name: 'logo.png',
        type: 'Image',
        time: 408,
        status: 200,
        initiator: 'img',
        cache: true,
        size: '253.9 KB',
        transfer: '251.9 KB',
        speed: '292.0 KB/s'
    },
    {
        name: 'iconfont.woff2',
        type: 'Img',
        time: 108,
        status: 304,
        initiator: 'script',
        cache: true,
        size: '25.3 KB',
        transfer: '304.3 KB',
        speed: '493.0 KB/s'
    },
    {
        name: 'app.js',
        type: 'JS',
        time: 532,
        status: 200,
        initiator: 'mainDocument',
        cache: true,
        size: '28.4 KB',
        transfer: '126.9 KB',
        speed: '295.5 KB/s'
    },
    {
        name: 'index.html',
        type: 'HTML',
        time: 132,
        status: 304,
        initiator: 'css',
        cache: false,
        size: '11.1 KB',
        transfer: '11.1 KB',
        speed: '383.8 KB/s'
    }
])

const resourceChartRef = ref(null)
let resourceEChart = null

const errorEhartRef = ref(null)
let errorEhart = null

const resourceXData = [
    '10:20', '10:25', '10:30', '10:40',
    '10:50', '11:00', '11:10', '11:20'
]

const resourceYData = [380, 460, 540, 530, 450, 460, 400, 430]

// X 轴时间
const errorXData = ['10:20', '10:30', '10:40', '10:50', '11:00', '11:10']

// 三类错误示例数据（与设计稿趋势相近）
const error404 = [2, 2, 3, 4, 5, 3]   // 红
const error500 = [1, 1, 1, 3, 4, 2]   // 黄
const timeout = [0, 0, 1, 2, 6, 3]   // 蓝

function initResourceChart() {
    resourceEChart = echarts.init(resourceChartRef.value)

    const option = {
        grid: {
            left: 36,
            right: 16,
            top: 30,
            bottom: 28
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: resourceXData,
            boundaryGap: false,
            axisLine: {
                lineStyle: { color: '#e4e7ed' }
            },
            axisTick: { show: false },
            axisLabel: {
                color: '#909399',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 700,
            interval: 170,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#909399',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#f2f6fc'
                }
            }
        },
        series: [
            {
                name: '加载时间',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 7,
                data: resourceYData,
                lineStyle: {
                    width: 3,
                    color: '#409EFF'
                },
                itemStyle: {
                    color: '#409EFF',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64,158,255,0.35)' },
                        { offset: 1, color: 'rgba(64,158,255,0.05)' }
                    ])
                }
            }
        ]
    }

    resourceEChart.setOption(option)
}

function initErrorChart() {
    errorEhart = echarts.init(errorEhartRef.value)

    const option = {
        grid: {
            left: 36,
            right: 16,
            top: 24,
            bottom: 28
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        xAxis: {
            type: 'category',
            data: errorXData,
            axisTick: { show: false },
            axisLine: {
                lineStyle: { color: '#e4e7ed' }
            },
            axisLabel: {
                color: '#909399',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 20,
            interval: 5,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#909399',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#f2f6fc'
                }
            }
        },
        series: [
            {
                name: '404 错误',
                type: 'bar',
                stack: 'total',
                barWidth: 18,
                data: error404,
                itemStyle: {
                    color: '#F56C6C',
                    borderRadius: [4, 4, 0, 0]
                }
            },
            {
                name: '500 错误',
                type: 'bar',
                stack: 'total',
                barWidth: 18,
                data: error500,
                itemStyle: {
                    color: '#E6A23C'
                }
            },
            {
                name: '超时错误',
                type: 'bar',
                stack: 'total',
                barWidth: 18,
                data: timeout,
                itemStyle: {
                    color: '#409EFF'
                }
            }
        ]
    }

    errorEhart.setOption(option)
}

onMounted(() => {
    initResourceChart()
    initErrorChart()
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    resourceEChart?.dispose()
    errorEhart?.dispose()
})

function resizeChart() {
    resourceEChart?.resize()
    errorEhart?.resize()
}
</script>

<style lang="scss" scoped>
.app-container {
    .desc {
        color: #999;
        padding-bottom: 16px;
    }

    .resource-monitor {
        display: flex;
        gap: 20px;

        .session-list {
            flex: 1;
            padding: 0;
            border-radius: 12px;

            .panel-header {
                padding: 14px 16px;
                font-size: 16px;
                font-weight: 600;
                border-bottom: 1px solid #ebeef5;
            }

            .list {
                padding: 8px 0;
            }

            .list-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 14px;
                margin: 0 8px 8px;
                border-radius: 10px;
                cursor: pointer;
                transition: background-color 0.2s ease;

                &:hover {
                    background-color: #f5f9ff;
                }

                &.active {
                    background-color: #eaf2ff;
                }

                .item-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;

                    .username {
                        font-size: 14px;
                        font-weight: 600;
                        color: #303133;
                    }

                    .meta {
                        font-size: 12px;
                        color: #909399;
                        line-height: 1.4;
                    }
                }
            }
        }

        .resource-details {
            flex: 3;

            .chart-wrapper {
                display: flex;
                gap: 16px;

                .chart-card {
                    flex: 1;
                    border-radius: 12px;
                    padding: 12px 12px 16px;

                    .chart-title {
                        font-size: 14px;
                        font-weight: 600;
                        color: #303133;
                        margin-bottom: 8px;
                    }

                    .chart-container {
                        width: 100%;
                        height: 200px;
                    }
                }
            }

            .resource-card {
                margin-top: 24px;
                border-radius: 12px;
                padding: 0 0 12px;

                .card-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #ebeef5;

                    .title {
                        font-size: 14px;
                        font-weight: 600;
                        color: #303133;
                    }
                }

                /* -------- table -------- */
                .resource-table {
                    --el-table-border-color: #ebeef5;
                    font-size: 12px;

                    th {
                        background: linear-gradient(#fafbfc, #f5f7fa);
                        color: #606266;
                        font-weight: 500;
                    }

                    td {
                        color: #303133;
                    }

                    .el-link {
                        font-weight: 500;
                    }
                }

                /* -------- cache flag -------- */
                .cache-flag {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .el-icon {
                        font-size: 16px;

                        &.ok {
                            color: #67c23a;
                        }

                        &.fail {
                            color: #f56c6c;
                        }
                    }
                }

                /* -------- pager -------- */
                .pager {
                    margin-top: 12px;
                    padding: 0 12px;
                    display: flex;
                    justify-content: flex-end;
                }
            }
        }
    }
}
</style>