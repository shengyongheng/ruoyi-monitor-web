/**
* v-heightlight 代码高亮
* Copyright (c) 2026 ruoyi
*/
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 选择你喜欢的样式

export default {
    mounted(el) {
        const blocks = el.querySelectorAll('pre div');
        blocks.forEach((block) => {
            hljs.highlightBlock(block);

            // // 创建行号容器
            // const ul = document.createElement('ul');
            // ul.className = 'pre-numbering';

            // // 获取代码行数
            // const lines = block.innerHTML.split('\n').length;
            // for (let i = 1; i <= lines; i++) {
            //     const li = document.createElement('li');
            //     li.textContent = i;
            //     ul.appendChild(li);
            // }

            // // 将行号容器添加到代码块
            // block.parentNode.insertBefore(ul, block);
        });
    }
}