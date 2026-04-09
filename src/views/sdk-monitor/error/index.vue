<template>
  <div class="app-container">
    <h2>错误监控</h2>
    <div class="desc">
      追踪 JS Error / Promise Rejection 源代码上下文、Ajax / Fetch 请求错误
    </div>
    <div class="error-metric-row">
      <!-- 错误数 -->
      <div class="metric-card warning">
        <div class="title">错误数</div>
        <div class="value">
          {{ errorCount.allErrorCount }}
        </div>
        <div class="bg-shape"></div>
        <div class="icon-circle">!</div>
      </div>

      <!-- JS 错误数 -->
      <div class="metric-card success">
        <div class="title">JS 错误数</div>
        <div class="value">
          {{ errorCount.jsErrorCount }}
        </div>
        <div class="bg-shape wave"></div>
        <div class="icon lightning"></div>
      </div>

      <!-- 资源错误数 -->
      <div class="metric-card primary">
        <div class="title">资源错误数</div>
        <div class="value">
          {{ errorCount.resourceErrorCount }}
        </div>
        <div class="bg-shape mountain"></div>
        <div class="icon image"></div>
      </div>

      <!-- 请求错误数 -->
      <div class="metric-card danger">
        <div class="title">请求错误数</div>
        <div class="value">
          {{ errorCount.requestErrorCount }}
        </div>
        <div class="bg-shape"></div>
        <div class="http-badge">HTTP</div>
      </div>
    </div>
    <div class="error-echarts-container">
      <el-card class="chart-card" shadow="never">
        <div class="card-header">
          <div class="title">错误趋势</div>
        </div>
        <div ref="errorTrendChartRef" class="chart-container"></div>
      </el-card>
    </div>
    <div class="error-list-container">
      <div class="header">
        <h2>详细错误列表</h2>
      </div>
      <el-button-group>
        <el-button type="primary">Js 错误</el-button>
        <el-button type="primary">资源错误</el-button>
        <el-button type="primary">请求错误</el-button>
      </el-button-group>
      <el-table :data="errorList" style="width: 100%" stripe border :row-class-name="rowClassName">
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="small" class="type-tag">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="message" label="错误信息" min-width="300">
          <template #default="scope">
            <div class="error-message">
              <span class="error-text">{{ scope.row.message }}</span>
              <el-button type="text" size="small" @click="showErrorDetails(scope.row)" class="detail-btn">
                查看详情
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="severity" label="严重程度" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.severity === '重' ? 'danger' : 'warning'" effect="dark" class="severity-tag">
              {{ scope.row.severity }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="url" label="URL" min-width="200">
          <template #default="scope">
            <div class="url-cell">
              <span class="url-text">{{ scope.row.url }}</span>
              <el-button type="text" size="small" @click="copyUrl(scope.row.url)" class="copy-btn">
                <el-icon>
                  <CopyDocument />
                </el-icon>
              </el-button>
              <el-button type="text" size="small" @click="openUrl(scope.row.url)" class="open-btn">
                <el-icon>
                  <Link />
                </el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="time" label="时间" width="180" align="center">
          <template #default="scope">
            <span class="time-text">{{ parseTime(scope.row.timestamp) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="summary">
          共 {{ errorList.length }} 条错误，其中
          <span class="critical-count">{{ criticalCount }}</span> 条严重错误
        </div>
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
    <error-detail-dialog v-if="showErrorDetailDialog" v-model:showErrorDetailDialog="showErrorDetailDialog"
      :errorDetail="errorDetail" />
  </div>
</template>

<script setup>
import { getJsErrorList, getErrorCount, getErrorCountTrend } from "@/api/sdk-monitor/error";
import { CopyDocument, Link } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { computed, onBeforeUnmount, onMounted, ref, reactive, watch } from "vue";
import errorDetailDialog from "./errorDetailDialog.vue";

const errorCount = reactive({
  allErrorCount: 0,
  jsErrorCount: 0,
  resourceErrorCount: 0,
  requestErrorCount: 0,
})

const errorTrendCount = ref({
  xdata: [],
  jsErrorCount: [],
  resourceErrorCount: [],
  requestErrorCount: []
})

const errorList = ref([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const showErrorDetailDialog = ref(false);
const errorDetail = ref({});

watch(() => errorTrendCount.value, () => {
  initErrorTrendChart();
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  errorTrendchart?.dispose();
});

onMounted(() => {
  getJsErrorList()
    .then((response) => {
      errorList.value = response.data;
      total.value = response.data.length;
    })
    .catch((error) => {
      ElMessage.error("加载错误列表失败:", error);
    });

  getErrorCount()
    .then((response) => {
      Object.assign(errorCount, response.data)
    })
    .catch((error) => {
      ElMessage.error("加载错误数失败:", error);
    });
  initErrorTrendChart();
  getErrorCountTrend({
    startDate: new Date("2026-01-05 11:21:29").getTime(),
    endDate: new Date("2026-01-12 15:34:41").getTime(),
  }).then(res => {
    console.log(res.data);
    errorTrendCount.value = res.data
  }).catch((error) => {
    ElMessage.error("加载错误趋势数失败:", error);
  });
  window.addEventListener("resize", resizeChart);
});

// 计算属性
const criticalCount = computed(() => {
  return errorList.value.filter((item) => item.severity === "重").length;
});

const errorTrendChartRef = ref(null);
let errorTrendchart = null;

function initErrorTrendChart() {
  errorTrendchart = echarts.init(errorTrendChartRef.value);

  const option = {
    grid: {
      left: 36,
      right: 16,
      top: 20,
      bottom: 36,
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      bottom: 0,
      itemWidth: 14,
      itemHeight: 4,
      textStyle: {
        color: "#606266",
        fontSize: 12,
      },
      data: ["JS错误", "资源错误", "请求错误"],
    },
    xAxis: {
      type: "category",
      data: errorTrendCount.value.xdata,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: {
        lineStyle: { color: "#e4e7ed" },
      },
      axisLabel: {
        interval: 'auto',
        rotate: 45,
        color: "#909399",
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: "#909399",
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: "#f2f6fc",
        },
      },
    },
    series: [
      {
        name: "JS错误",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: errorTrendCount.value.jsErrorCount,
        lineStyle: { width: 2, color: "#F7BA2A" },
        itemStyle: { color: "#F7BA2A" },
      },
      {
        name: "资源错误",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: errorTrendCount.value.resourceErrorCount,
        lineStyle: { width: 2, color: "#409EFF" },
        itemStyle: { color: "#409EFF" },
      },
      {
        name: "请求错误",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: errorTrendCount.value.requestErrorCount,
        lineStyle: { width: 2, color: "#67C23A" },
        itemStyle: { color: "#67C23A" },
      },
    ],
  };

  errorTrendchart.setOption(option);
}


function resizeChart() {
  errorTrendchart?.resize();
}

// 根据错误类型返回对应的tag类型
const getTypeTagType = (type) => {
  const typeMap = {
    js: "warning",
    promise: "warning",
    超时: "danger",
    fetch: "primary",
  };
  return typeMap[type] || "info";
};

// 交替行背景色
const rowClassName = ({ rowIndex }) => (rowIndex % 2 === 0 ? "even-row" : "odd-row");

// 方法
const showErrorDetails = (row) => {
  showErrorDetailDialog.value = true;
  errorDetail.value = row;
};

const copyUrl = (url) => {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      ElMessage.success("URL已复制到剪贴板");
    })
    .catch(() => {
      ElMessage.error("复制失败");
    });
};

const openUrl = (url) => {
  window.open(url, "_blank");
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  // 这里可以调用API重新获取数据
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  // 这里可以调用API重新获取数据
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .desc {
    color: #7a7a7a;
    padding-bottom: 16px;
    font-size: 13px;
  }

  $error-warning: #e6a23c;
  $error-success: #67c23a;
  $error-primary: #409eff;
  $error-danger: #f56c6c;

  .error-metric-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  /* 通用卡片 */
  .metric-card {
    position: relative;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    height: 120px;
    overflow: hidden;
    box-shadow: 0 0 0 1px #ebeef5 inset;

    .title {
      font-size: 14px;
      color: #606266;
      font-weight: 600;
    }

    .value {
      margin-top: 12px;
      font-size: 36px;
      font-weight: 700;

      .up {
        font-size: 16px;
        margin-left: 4px;
      }
    }

    .bg-shape {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 40%;
      opacity: 0.15;
      border-radius: 0 0 12px 12px;
    }
  }

  /* 颜色主题 */
  .warning {
    .value {
      color: $error-warning;
    }

    .bg-shape {
      background: $error-warning;
    }
  }

  .success {
    .value {
      color: $error-success;
    }

    .bg-shape {
      background: linear-gradient(120deg, $error-success, transparent);
    }
  }

  .primary {
    .value {
      color: $error-primary;
    }

    .bg-shape {
      background: linear-gradient(120deg, $error-primary, transparent);
    }
  }

  .danger {
    .value {
      color: $error-danger;
    }

    .bg-shape {
      background: $error-danger;
    }
  }

  /* 特殊背景形态 */
  .wave {
    clip-path: polygon(0 60%, 15% 55%, 30% 65%, 45% 50%, 60% 60%, 75% 45%, 100% 55%, 100% 100%, 0 100%);
  }

  .mountain {
    clip-path: polygon(0 100%, 25% 60%, 40% 75%, 60% 40%, 80% 70%, 100% 55%, 100% 100%);
  }

  /* 图标 */
  .icon-circle {
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $error-warning;
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon.lightning {
    position: absolute;
    right: 18px;
    bottom: 18px;
    width: 20px;
    height: 32px;
    background: $error-success;
    clip-path: polygon(40% 0, 100% 0, 60% 45%, 85% 45%, 30% 100%, 45% 55%, 15% 55%);
  }

  .icon.image {
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 42px;
    height: 30px;
    border-radius: 6px;
    background: $error-primary;

    &:before {
      content: '';
      position: absolute;
      left: 6px;
      bottom: 6px;
      width: 12px;
      height: 12px;
      background: #fff;
      border-radius: 2px;
    }
  }

  /* HTTP 标签 */
  .http-badge {
    position: absolute;
    right: 16px;
    bottom: 16px;
    background: $error-danger;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    padding: 6px 10px;
    border-radius: 6px;
  }

  .error-echarts-container {
    display: flex;
    gap: 16px;
    align-items: stretch;
    flex-wrap: wrap;

    .chart-card {
      flex: 1;
      border-radius: 12px;
      padding: 12px 12px 16px;
      border: 1px solid #eef0f3;
      box-shadow: 0 6px 18px rgba(31, 45, 61, 0.08);
      background: #fff;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px rgba(31, 45, 61, 0.12);
      }

      .card-header {
        margin-bottom: 8px;

        .title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          letter-spacing: 0.3px;

          .info-icon {
            font-size: 14px;
            color: #909399;
            cursor: pointer;
          }
        }
      }

      .chart-container {
        width: 100%;
        height: 260px;
      }
    }
  }

  .error-list-container {
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(31, 45, 61, 0.08);
    border: 1px solid #eef0f3;

    .header {
      margin-bottom: 12px;

      h2 {
        margin: 0;
        color: #303133;
        font-size: 20px;
        font-weight: 700;
        border-left: 4px solid #409eff;
        padding-left: 12px;
      }
    }

    :deep(.el-button-group) {
      margin-bottom: 12px;

      .el-button {
        min-width: 96px;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      .error-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: "Monaco", "Consolas", monospace;
        font-size: 13px;
        color: #1f2d3d;
      }

      .detail-btn {
        margin-left: 8px;
        flex-shrink: 0;
      }
    }

    .type-tag {
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .severity-tag {
      font-weight: 600;
      min-width: 60px;
    }

    .url-cell {
      display: flex;
      align-items: center;

      .url-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #409eff;
        font-family: "Monaco", "Consolas", monospace;
        font-size: 12px;
      }

      .copy-btn,
      .open-btn {
        margin-left: 4px;
        padding: 4px;
        color: #606266;

        &:hover {
          color: #409eff;
        }
      }
    }

    .time-text {
      font-weight: 500;
      color: #909399;
    }

    .analyze-btn {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: #b3d8ff;

      &:hover {
        background-color: #409eff;
        color: #fff;
      }
    }

    .ignore-btn {
      &:hover {
        opacity: 0.8;
      }
    }

    .table-footer {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;

      .summary {
        color: #606266;
        font-size: 14px;

        .critical-count {
          color: #f56c6c;
          font-weight: 600;
        }
      }
    }
  }

  // 全局样式，需要放在非scoped样式或使用deep选择器
  :deep(.even-row) {
    background-color: #fafafa;
  }

  :deep(.odd-row) {
    background-color: #ffffff;
  }

  :deep(.el-table) {
    .cell {
      padding: 12px 0;
    }

    th.el-table__cell {
      background-color: #f5f7fa;
    }

    .el-table__row:hover>td {
      background: #f0f6ff !important;
    }
  }

  :deep(.error-detail-dialog) {
    .el-message-box__content {
      pre {
        font-family: "Monaco", "Consolas", monospace;
        font-size: 13px;
        line-height: 1.5;
        background-color: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
      }
    }
  }
}

@media (max-width: 1200px) {
  .app-container {
    .error-echarts-container {
      flex-direction: column;

      .chart-card .chart-container {
        height: 220px;
      }
    }
  }
}
</style>
