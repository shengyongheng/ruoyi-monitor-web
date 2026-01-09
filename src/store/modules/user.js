import { getInfo, login, logout } from '@/api/login'
import defAva from '@/assets/images/profile.jpg'
import router from '@/router'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { isEmpty, isHttp } from "@/utils/validate"
import { ElMessageBox, } from 'element-plus'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      nickName: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid).then(res => {
            setToken(res.token)
            this.token = res.token
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const resMock = {
              "msg": "操作成功",
              "code": 200,
              "permissions": [
                "*:*:*"
              ],
              "roles": [
                "admin"
              ],
              "user": {
                "createBy": "admin",
                "createTime": "2025-03-12 16:48:54",
                "updateBy": null,
                "updateTime": null,
                "remark": "管理员",
                "params": {
                  "@type": "java.util.HashMap"
                },
                "userId": 1,
                "deptId": 103,
                "userName": "admin",
                "nickName": "若依",
                "email": "ry@163.com",
                "phonenumber": "15888888888",
                "sex": "1",
                "avatar": null,
                "password": "$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2",
                "status": "0",
                "delFlag": "0",
                "loginIp": "127.0.0.1",
                "loginDate": "2026-01-08T17:28:05.000+08:00",
                "dept": {
                  "createBy": null,
                  "createTime": null,
                  "updateBy": null,
                  "updateTime": null,
                  "remark": null,
                  "params": {
                    "@type": "java.util.HashMap"
                  },
                  "deptId": 103,
                  "parentId": 101,
                  "ancestors": "0,100,101",
                  "deptName": "研发部门",
                  "orderNum": 1,
                  "leader": "若依",
                  "phone": null,
                  "email": null,
                  "status": "0",
                  "delFlag": null,
                  "parentName": null,
                  "children": []
                },
                "roles": [
                  {
                    "createBy": null,
                    "createTime": null,
                    "updateBy": null,
                    "updateTime": null,
                    "remark": null,
                    "params": {
                      "@type": "java.util.HashMap"
                    },
                    "roleId": 1,
                    "roleName": "超级管理员",
                    "roleKey": "admin",
                    "roleSort": 1,
                    "dataScope": "1",
                    "menuCheckStrictly": false,
                    "deptCheckStrictly": false,
                    "status": "0",
                    "delFlag": null,
                    "flag": false,
                    "menuIds": null,
                    "deptIds": null,
                    "permissions": null,
                    "admin": true
                  }
                ],
                "roleIds": null,
                "postIds": null,
                "roleId": null,
                "admin": true
              }
            }
            res = resMock;
            const user = res.user;
            let avatar = user.avatar || ""

            if (!isHttp(avatar)) {
              avatar = (isEmpty(avatar)) ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
            }
            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.nickName = user.nickName
            this.avatar = avatar
            /* 初始密码提示 */
            if (res.isDefaultModifyPwd) {
              ElMessageBox.confirm('您的密码还是初始密码，请修改密码！', '安全提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
                router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
              }).catch(() => { })
            }
            /* 过期密码提示 */
            if (!res.isDefaultModifyPwd && res.isPasswordExpired) {
              ElMessageBox.confirm('您的密码已过期，请尽快修改密码！', '安全提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
                router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
              }).catch(() => { })
            }
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }
    }
  })

export default useUserStore
