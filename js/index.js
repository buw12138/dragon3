// 游戏入口脚本
// 这个文件是游戏的主入口，负责加载所有必要的模块并初始化游戏

// 定义全局变量存储游戏数据和工具
window.gameSkills = [];
window.statusEffects = {};
window.Utils = {};

// 加载脚本的辅助函数
function loadScript(src, callback, errorCallback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = function() {
        if (callback) callback();
    };
    script.onerror = function(error) {
        console.error('加载脚本失败:', src, error);
        if (errorCallback) errorCallback(error);
    };
    document.head.appendChild(script);
}

// 加载样式的辅助函数
function loadStylesheet(href) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

// 主加载函数
async function loadGame() {
    try {
        // 显示加载状态
        console.log('正在加载游戏资源...');
        
        // 加载配置文件
        loadScript('config/constants.js', () => {
            loadScript('config/items.js', () => {
                loadScript('config/skills.js', () => {
                    loadScript('config/enemies.js', () => {
                        console.log('配置文件加载完成');
                        // 加载工具函数
                        loadScript('js/utils.js', () => {
                            console.log('工具函数加载完成');
                            // 加载核心模块
                            loadScript('js/character.js', () => {
                                loadScript('js/battleSystem.js', () => {
                                    console.log('游戏核心模块加载完成');
                                    // 加载游戏主逻辑
                                    loadScript('js/game.js', () => {
                                        console.log('游戏主逻辑加载完成');
                                        console.log('初始化游戏...');
                                        // 初始化游戏
                                        if (window.initGame) {
                                            window.initGame();
                                        } else {
                                            console.error('未找到游戏初始化函数');
                                        }
                                    }, onScriptError);
                                }, onScriptError);
                            }, onScriptError);
                        }, onScriptError);
                    }, onScriptError);
                }, onScriptError);
            }, onScriptError);
        }, onScriptError);
        
        // 错误处理函数
        function onScriptError(error) {
            console.error('游戏加载失败:', error);
            alert('游戏加载失败，请刷新页面重试。');
        }
        
    } catch (error) {
        console.error('游戏加载失败:', error);
        alert('游戏加载失败，请刷新页面重试。');
    }
}

// 当DOM加载完成后开始加载游戏
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGame);
} else {
    // 如果DOM已经加载完成，直接开始加载
    loadGame();
}

// 导出加载函数供外部调用
window.loadGame = loadGame;