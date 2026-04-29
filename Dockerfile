# ---------- 构建阶段 ----------
# 构建阶段，使用 Node.js 18 镜像作为构建环境
FROM node:18 AS builder

# 设置工作目录为 /app
WORKDIR /app

# 复制依赖文件 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install
    
# 复制项目文件到工作目录
COPY . .

# 构建项目，生成 dist 目录（前端静态文件）
RUN npm run build

# ---------- 运行阶段 ----------
FROM nginx:alpine

# 删除默认配置
RUN rm -rf /usr/share/nginx/html/*

# 拷贝构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 可选：自定义 nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]