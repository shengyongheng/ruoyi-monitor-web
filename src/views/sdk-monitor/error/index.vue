<template>
  <div class="app-container">
    <h2>错误监控</h2>
    <div class="desc">
      追踪 JS Error / Promise Rejection 源代码上下文、Ajax / Fetch 请求错误
    </div>
    <div class="error-echarts-container">
      <el-card class="chart-card" shadow="never">
        <div class="card-header">
          <div class="title">错误趋势</div>
        </div>
        <div ref="errorTrendChartRef" class="chart-container"></div>
      </el-card>
      <el-card class="chart-card" shadow="never">
        <div class="card-header">
          <span class="title">错误分布</span>
        </div>
        <div ref="errorDistributionChartRef" class="chart-container"></div>
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
        <el-button type="primary">跨域错误</el-button>
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
import { getJsErrorList } from "@/api/sdk-monitor/error";
import { CopyDocument, Link } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import errorDetailDialog from "./errorDetailDialog.vue";

const errorList = ref([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const showErrorDetailDialog = ref(false);
const errorDetail = ref({});

onMounted(() => {
  getJsErrorList()
    .then((response) => {
      errorList.value = response.data;
      total.value = response.data.length;
    })
    .catch((error) => {
      ElMessage.error("加载错误列表失败:", error);
    });
});

// 计算属性
const criticalCount = computed(() => {
  return errorList.value.filter((item) => item.severity === "重").length;
});

const errorTrendChartRef = ref(null);
let errorTrendchart = null;

const xData = ["10:20", "10:30", "10:40", "10:50", "11:00", "11:10"];

// 按设计稿趋势构造的数据
const corsErr = [3, 5, 3, 6, 4, 6]; // 橙
const jsErr = [1, 2, 1, 2, 1, 3]; // 黄
const assetErr = [0, 1, 1, 4, 2, 3]; // 蓝
const httpErr = [1, 2, 1, 2, 2, 4]; // 绿

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
      data: ["跨域", "JS错误", "资源错误", "Fetch/XHR"],
    },
    xAxis: {
      type: "category",
      data: xData,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: {
        lineStyle: { color: "#e4e7ed" },
      },
      axisLabel: {
        color: "#909399",
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 10,
      interval: 5,
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
        name: "跨域",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: corsErr,
        lineStyle: { width: 2, color: "#E6A23C" },
        itemStyle: { color: "#E6A23C" },
      },
      {
        name: "JS错误",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: jsErr,
        lineStyle: { width: 2, color: "#F7BA2A" },
        itemStyle: { color: "#F7BA2A" },
      },
      {
        name: "资源错误",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: assetErr,
        lineStyle: { width: 2, color: "#409EFF" },
        itemStyle: { color: "#409EFF" },
      },
      {
        name: "Fetch/XHR",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: httpErr,
        lineStyle: { width: 2, color: "#67C23A" },
        itemStyle: { color: "#67C23A" },
      },
    ],
  };

  errorTrendchart.setOption(option);
}

const errorDistributionChartRef = ref(null);
let errorDistributionChart = null;

function initErrorDistributionChart() {
  errorDistributionChart = echarts.init(errorDistributionChartRef.value);

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: "Js 错误" },
          { value: 735, name: "资源错误" },
          { value: 580, name: "请求错误" },
          { value: 484, name: "跨域错误" },
        ],
      },
    ],
  };

  errorDistributionChart.setOption(option);
}

function resizeChart() {
  errorTrendchart?.resize();
  errorDistributionChart?.resize();
}

onMounted(() => {
  initErrorTrendChart();
  initErrorDistributionChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  errorTrendchart?.dispose();
  errorDistributionChart?.dispose();
});

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

  .error-echarts-container {
    display: flex;
    gap: 16px;
    align-items: stretch;
    flex-wrap: wrap;

    .chart-card {
      flex: 5;
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

    .chart-card:last-child {
      flex: 3;
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

    .el-table__row:hover > td {
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

      .chart-card,
      .chart-card:last-child {
        flex: 1;
      }

      .chart-card .chart-container {
        height: 220px;
      }
    }
  }
}
</style>
