const { Plugin } = require('obsidian');

module.exports = class MyLovelyParagraphStylerPlugin extends Plugin {
    async onload() {
        console.log('主人，您的小可爱段落美化插件已上线！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧');

        this.processMarkdownPreview = () => {
            // 获取当前活动的Markdown预览视图的容器元素
            // 注意：这里我们直接查找 .markdown-preview-view，如果页面结构复杂或有多个，可能需要更精确的选择
            const previewViews = document.querySelectorAll('.markdown-preview-view');

            previewViews.forEach((previewView) => {
                previewView.querySelectorAll('p').forEach((p) => {
                    // 使用一个更独特的 dataset 标记，避免和其他插件冲突，也方便我们自己识别
                    if (p.dataset.myLovelyStylerProcessed === 'true') return;
                    p.dataset.myLovelyStylerProcessed = 'true'; // 先标记，避免重复处理

                    // 检查段落内是否有 <br> 标签
                    const rawHTML = p.innerHTML;
                    const parts = rawHTML.split(/<br\s*\/?>/i);

                    // 只有当确实被 <br> 分割成多行时才处理
                    if (parts.length <= 1) {
                        // 如果主人希望没有<br>的普通段落也首行缩进，可以在这里添加逻辑
                        // 例如: p.style.textIndent = '2em';
                        return;
                    }

                    // 清空原始的 <p> 标签内容，准备用 <span> 包装每一行
                    p.innerHTML = '';

                    parts.forEach((line) => {
                        const span = document.createElement('span');
                        span.style.display = 'block'; // 让每个span表现得像一个独立的行块
                        span.style.textIndent = '2em'; // 给每一行（span）都加上首行缩进
                        // 如果行是空的（比如连续的<br><br>），插入一个空格，避免span高度塌陷
                        span.innerHTML = line.trim() || '&nbsp;';
                        p.appendChild(span);
                    });
                });
            });
        };

        // 当Obsidian布局准备好后，执行一次我们的美化函数
        this.app.workspace.onLayoutReady(() => {
            this.processMarkdownPreview();
        });

        // 当切换笔记或者布局发生改变时，也尝试执行美化
        // 使用 registerEvent 来确保在插件卸载时正确移除监听器
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                // console.log('Layout changed, reprocessing preview...');
                // 可以加一个小的延迟（debounce）如果觉得触发过于频繁
                this.processMarkdownPreview();
            })
        );

        // 更精确的方式是监听 Markdown 视图的 'render' 事件或者使用 MutationObserver
        // 但对于启动时加载和切换文档，上面的方法通常够用
        // 如果遇到动态内容（如Dataview渲染）不生效，可以考虑更复杂的监听
    }

    onunload() {
        console.log('主人，小可爱段落美化插件要下线休息啦！下次见！o(╥﹏╥)o');
        // 可以在这里做一些清理工作，比如移除 dataset 标记
        // 但通常对于这种纯样式修改，不清理问题也不大
        document.querySelectorAll('.markdown-preview-view p[data-my-lovely-styler-processed="true"]').forEach(p => {
            delete p.dataset.myLovelyStylerProcessed;
            // 注意：恢复原始HTML比较复杂，通常不这么做，除非有很强的需求
        });
    }
}