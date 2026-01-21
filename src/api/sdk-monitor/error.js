import request from '@/utils/request'

// 查询 js 错误列表
export function getJsErrorList(query) {
    return request({
        url: '/monitor-error/error_detail_list',
        method: 'get',
        params: query
    })
}

// 查询 sourcemap 错误上下文
export function getSourcemapCxt(query) {
    return request({
        url: '/monitor-error/error_sourcemap',
        method: 'get',
        params: query
    })
}

// 查询错误回放 events
export function getRRwebPlayEvents(query) {
    return request({
        url: '/monitor-error/rrweb-events',
        method: 'get',
        params: query
    })
}

// 新增参数配置
export function addConfig(data) {
    return request({
        url: '/system/config',
        method: 'post',
        data: data
    })
}