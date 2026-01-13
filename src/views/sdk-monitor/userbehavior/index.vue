<template>
    <div class="app-container">
        <h2>用户行为监控</h2>
        <div class="desc">追踪用户交互、会话</div>
        <el-form ref="ruleFormRef" inline :model="ruleForm" status-icon :rules="rules" label-width="auto"
            class="userbehavior-ruleForm">
            <el-form-item label="时间范围" prop="datetimeRange">
                <el-date-picker v-model="ruleForm.datetimeRange" type="datetimerange" :shortcuts="shortcuts"
                    range-separator="To" start-placeholder="Start date" end-placeholder="End date" />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="ruleForm.username" autocomplete="off" />
            </el-form-item>
            <el-form-item label="会话ID" prop="sessionId">
                <el-input v-model="ruleForm.sessionId" autocomplete="off" />
            </el-form-item>
            <el-form-item label="行为类型" prop="type">
                <el-select v-model="ruleForm.type" placeholder="选择行为类型">
                    <el-option v-for="item in behaviorTypeOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    查询
                </el-button>
                <el-button @click="resetForm(ruleFormRef)">重置</el-button>
            </el-form-item>
        </el-form>
        <div class="userbehavior-monitor">
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
            <div class="session-detail">

                <!-- ================= Header ================= -->
                <el-card class="header-card">
                    <div class="title">会话详情</div>

                    <div class="session-info">
                        <div class="row">
                            <span class="label">Session ID：</span>
                            <span class="value">{{ session.sessionId }}</span>
                        </div>

                        <div class="stats">
                            <div class="stat">
                                <span class="label">用户名：</span>
                                <span class="link">{{ session.username }}</span>
                            </div>
                            <div class="stat">
                                <span class="label">会话开始：</span>
                                <span class="link">{{ session.startAt }}</span>
                            </div>
                            <div class="stat">
                                <span class="label">会话结束：</span>
                                <span class="link">{{ session.endAt }}</span>
                            </div>
                            <div class="stat">
                                <span class="label">停留时长：</span>
                                <span class="value">{{ session.durationCN }}</span>
                            </div>
                            <div class="stat">
                                <span class="label">页面跳转次数：</span>
                                <span class="value">{{ session.pageViews }}</span>
                            </div>
                            <div class="stat">
                                <span class="label">点击次数：</span>
                                <span class="value">{{ session.clicks }}</span>
                            </div>
                            <div class="stat">
                                <span class="label">输入次数：</span>
                                <span class="value">{{ session.inputs }}</span>
                            </div>
                            <div class="stat">
                                <span class="label">滚动次数：</span>
                                <span class="value">{{ session.scrolls }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>

                <!-- ================= Main ================= -->
                <div class="main">

                    <!-- ===== Timeline ===== -->
                    <el-card class="timeline-card">
                        <div class="card-title">行为时间轴</div>

                        <el-timeline>
                            <el-timeline-item v-for="item in behaviorTimeline" :key="item.timestamp"
                                :timestamp="parseTime(item.timestamp)" placement="top" :type="item.type"
                                :color="item.color || '#0bbd87'"
                                @click="activeBehaviorDetail(item.behaviorId, item.behaviorType)">
                                <div class="timeline-content">
                                    <span class="text">{{ item.behaviorType }}</span>
                                    <span v-if="item.description" class="tag">{{ item.description }}</span>
                                </div>
                            </el-timeline-item>
                        </el-timeline>
                    </el-card>

                    <!-- ===== Side Detail ===== -->
                    <userbehavior-detail :activeDetail="activeDetail"></userbehavior-detail>
                </div>

                <!-- ================= Footer ================= -->
                <el-card class="footer-card">
                    <div class="card-title">页面轨迹</div>
                    <div class="route-flow">
                        <el-tag type="info">/home</el-tag>
                        <el-icon>
                            <ArrowRight />
                        </el-icon>
                        <el-tag type="info">/order</el-tag>
                        <el-icon>
                            <ArrowRight />
                        </el-icon>
                        <el-tag type="info">/order#details</el-tag>
                    </div>
                </el-card>

            </div>
        </div>
    </div>
</template>

<script setup>
import { getBehaviorDetail, getBehaviorTimeline, listSessions, sessionsDetail } from '@/api/sdk-monitor/userbehavior'
import { parseTime } from "@/utils/ruoyi"
import { onMounted, reactive, ref } from 'vue'
import userbehaviorDetail from './userbehaviorDetail.vue'

const ruleFormRef = ref()

const checkAge = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('Please input the age'))
    }
    setTimeout(() => {
        if (!Number.isInteger(value)) {
            callback(new Error('Please input digits'))
        } else {
            if (value < 18) {
                callback(new Error('Age must be greater than 18'))
            } else {
                callback()
            }
        }
    }, 1000)
}

const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else {
        if (ruleForm.checkPass !== '') {
            if (!ruleFormRef.value) return
            ruleFormRef.value.validateField('checkPass')
        }
        callback()
    }
}
const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('Please input the password again'))
    } else if (value !== ruleForm.pass) {
        callback(new Error("Two inputs don't match!"))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    datetimeRange: [
        // new Date(2000, 10, 10, 10, 10),
        // new Date(2000, 10, 11, 10, 10),
    ],
    username: '',
    sessionId: '',
    type: ""
})

const behaviorTypeOptions = [
    {
        value: 'click',
        label: 'click',
    },
    {
        value: 'input',
        label: 'input',
    },
    {
        value: 'scroll',
        label: 'scroll',
    },
    {
        value: 'pageStay',
        label: 'pageStay',
    },
    {
        value: 'history',
        label: 'history',
    },
    {
        value: 'hashchange',
        label: 'hashchange',
    },
]

const conversations = ref([])

const session = ref({})

const behaviorTimeline = ref([])

const sessionDetail = ref({
    username: "",
    sessionId: "",
})

const activeDetail = ref({
    behaviorId: null,
    behaviorType: null,
    description: null,
    hashStayTime: null,
    newUrl: null,
    oldUrl: null,
    stayTime: null,
    timestamp: null,
    trigerType: null,
})

onMounted(() => {
    listSessions({
        username: ruleForm.username,
        sessionId: ruleForm.sessionId,
        type: ruleForm.type,
    }).then((res) => {
        conversations.value = res.data;
        conversations.value[0].active = true;

        const sessionsDetailParams = {
            username: conversations.value[0]?.username,
            sessionId: conversations.value[0]?.sessionId,
        }
        sessionsDetail(sessionsDetailParams).then((res) => {
            session.value = res.data;
            getBehaviorTimeline({
                username: res.data.username,
                sessionId: res.data.sessionId,
            }).then((res) => {
                behaviorTimeline.value = res.data;
            }).catch((err) => {
                console.error('Failed to fetch behavior timeline:', err);
            });
        }).catch((err) => {
            console.error('Failed to fetch session details:', err);
        });
    }).catch((err) => {
        console.error('Failed to fetch sessions:', err);
    });
})

function activeBehaviorDetail(behaviorId, behaviorType) {
    getBehaviorDetail({
        behaviorId: behaviorId,
        behaviorType: behaviorType,
    }).then((res) => {
        activeDetail.value = res.data;
    }).catch((err) => {
        console.error('Failed to fetch behavior detail:', err);
    });
}

function setActive(target) {
    conversations.value.forEach(i => {
        i.active = i === target
    })
    sessionDetail.value = {
        username: target.username,
        sessionId: target.sessionId,
    }
    sessionsDetail(sessionDetail.value).then((res) => {
        session.value = res.data;
        getBehaviorTimeline({
            username: res.data.username,
            sessionId: res.data.sessionId,
        }).then((res) => {
            behaviorTimeline.value = res.data;
        }).catch((err) => {
            console.error('Failed to fetch behavior timeline:', err);
        });
    }).catch((err) => {
        console.error('Failed to fetch session details:', err);
    });
}

const rules = reactive({
    // pass: [{ validator: validatePass, trigger: 'blur' }],
    // userId: [{ validator: validatePass2, trigger: 'blur' }],
    // sessionId: [{ validator: checkAge, trigger: 'blur' }],
    // type: [{ validator: checkAge, trigger: 'blur' }],
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
</script>

<style lang="scss" scoped>
.app-container {
    .desc {
        color: #999;
        padding-bottom: 16px;
    }

    .userbehavior-monitor {
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

        .session-detail {
            padding: 16px;
            background: #f5f7fa;
            flex: 3;

            .el-card {
                border-radius: 12px;
            }

            /* ---------- Header ---------- */
            .header-card {
                margin-bottom: 16px;

                .title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .session-info {
                    background: #f9fafc;
                    border-radius: 8px;
                    padding: 12px 16px;

                    .row {
                        font-size: 14px;
                        margin-bottom: 8px;

                        .value {
                            font-weight: 600;
                        }
                    }

                    .stats {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 8px 16px;

                        .stat {
                            font-size: 12px;
                            color: #606266;

                            .link {
                                color: #409eff;
                                cursor: pointer;
                            }
                        }
                    }
                }
            }

            /* ---------- Main ---------- */
            .main {
                display: grid;
                grid-template-columns: 1fr 260px;
                gap: 16px;
            }

            /* ---------- Timeline ---------- */
            .timeline-card {
                .card-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #409eff;
                }

                .timeline-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .text {
                        font-size: 13px;
                        color: #303133;
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

            /* ---------- Footer ---------- */
            .footer-card {
                margin-top: 16px;

                .card-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .route-flow {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .el-icon {
                        color: #c0c4cc;
                    }
                }
            }
        }
    }
}
</style>