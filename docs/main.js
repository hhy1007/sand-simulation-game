// 落沙模拟游戏 - 主应用程序
// Claude Code Agent Teams 协作开发

import { Game } from '../src/game/Game.js';
import { MaterialType } from '../src/materials/materials.js';

// 全局变量
let game = null;
let currentMaterial = MaterialType.SAND;
let brushSize = 10;
let isSimulationRunning = false;

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const playPauseBtn = document.getElementById('playPauseBtn');
const clearBtn = document.getElementById('clearBtn');
const resetBtn = document.getElementById('resetBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const gravitySlider = document.getElementById('gravity');
const gravityValue = document.getElementById('gravityValue');
const speedSlider = document.getElementById('simulationSpeed');
const speedValue = document.getElementById('speedValue');
const particleCountEl = document.getElementById('particleCount');
const fpsCounterEl = document.getElementById('fpsCounter');
const physicsUpdateEl = document.getElementById('physicsUpdate');
const memoryUsageEl = document.getElementById('memoryUsage');
const materialsGrid = document.getElementById('materialsGrid');

// 材质配置
const materialsConfig = [
    { type: MaterialType.SAND, name: '沙子', icon: 'fas fa-mountain', color: '#e9c46a' },
    { type: MaterialType.WATER, name: '水', icon: 'fas fa-tint', color: '#457b9d' },
    { type: MaterialType.STONE, name: '石头', icon: 'fas fa-gem', color: '#6c757d' },
    { type: MaterialType.FIRE, name: '火', icon: 'fas fa-fire', color: '#e63946' },
    { type: MaterialType.OIL, name: '油', icon: 'fas fa-oil-can', color: '#264653' },
    { type: MaterialType.METAL, name: '金属', icon: 'fas fa-magnet', color: '#adb5bd' },
    { type: MaterialType.PLANT, name: '植物', icon: 'fas fa-leaf', color: '#2a9d8f' },
    { type: MaterialType.WOOD, name: '木头', icon: 'fas fa-tree', color: '#8b4513' }
];

// 性能统计
let fps = 0;
let frameCount = 0;
let lastTime = performance.now();
let physicsUpdateTime = 0;

/**
 * 初始化游戏
 */
async function initGame() {
    console.log('🎮 初始化落沙模拟游戏...');
    
    try {
        // 初始化游戏引擎
        game = new Game(canvas);
        await game.init();
        
        // 初始化材质选择
        initMaterials();
        
        // 初始化事件监听器
        initEventListeners();
        
        // 初始化UI更新
        initUIUpdates();
        
        // 开始游戏循环
        requestAnimationFrame(gameLoop);
        
        console.log('✅ 游戏初始化完成！');
        
        // 显示欢迎消息
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        alert('游戏初始化失败，请刷新页面重试。');
    }
}

/**
 * 初始化材质选择界面
 */
function initMaterials() {
    materialsGrid.innerHTML = '';
    
    materialsConfig.forEach(material => {
        const button = document.createElement('button');
        button.className = 'material-btn';
        button.dataset.type = material.type;
        button.innerHTML = `
            <i class="${material.icon} material-icon"></i>
            <span>${material.name}</span>
        `;
        
        // 设置样式
        button.style.setProperty('--material-color', material.color);
        
        // 点击事件
        button.addEventListener('click', () => {
            selectMaterial(material.type);
            
            // 更新激活状态
            document.querySelectorAll('.material-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        });
        
        materialsGrid.appendChild(button);
    });
    
    // 默认选择沙子
    selectMaterial(MaterialType.SAND);
    document.querySelector(`[data-type="${MaterialType.SAND}"]`).classList.add('active');
}

/**
 * 选择材质
 */
function selectMaterial(type) {
    currentMaterial = type;
    console.log(`🎨 选择材质: ${getMaterialName(type)}`);
    
    // 更新游戏当前材质
    if (game) {
        game.setCurrentMaterial(type);
    }
}

/**
 * 获取材质名称
 */
function getMaterialName(type) {
    const material = materialsConfig.find(m => m.type === type);
    return material ? material.name : '未知材质';
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 播放/暂停按钮
    playPauseBtn.addEventListener('click', toggleSimulation);
    
    // 清空按钮
    clearBtn.addEventListener('click', () => {
        if (game) {
            game.clear();
            updateParticleCount(0);
        }
    });
    
    // 重置按钮
    resetBtn.addEventListener('click', () => {
        if (confirm('确定要重置游戏吗？所有进度将丢失。')) {
            location.reload();
        }
    });
    
    // 保存按钮
    saveBtn.addEventListener('click', saveGame);
    
    // 加载按钮
    loadBtn.addEventListener('click', loadGame);
    
    // 画笔大小滑块
    brushSizeSlider.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        brushSizeValue.textContent = brushSize;
        if (game) {
            game.setBrushSize(brushSize);
        }
    });
    
    // 重力滑块
    gravitySlider.addEventListener('input', (e) => {
        const gravity = parseFloat(e.target.value);
        gravityValue.textContent = gravity.toFixed(1);
        if (game) {
            game.setGravity(gravity);
        }
    });
    
    // 速度滑块
    speedSlider.addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        speedValue.textContent = speed;
        if (game) {
            game.setSimulationSpeed(speed);
        }
    });
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 窗口调整
    window.addEventListener('resize', handleResize);
    
    // 帮助和关于按钮
    document.getElementById('helpBtn').addEventListener('click', showHelp);
    document.getElementById('aboutBtn').addEventListener('click', showAbout);
    document.getElementById('githubBtn').addEventListener('click', () => {
        window.open('https://github.com/yourusername/sand-simulation-game', '_blank');
    });
    
    // 模态框关闭
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('helpModal').style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('helpModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * 切换模拟状态
 */
function toggleSimulation() {
    isSimulationRunning = !isSimulationRunning;
    
    if (game) {
        if (isSimulationRunning) {
            game.start();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停模拟';
            playPauseBtn.classList.remove('btn-primary');
            playPauseBtn.classList.add('btn-warning');
        } else {
            game.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> 开始模拟';
            playPauseBtn.classList.remove('btn-warning');
            playPauseBtn.classList.add('btn-primary');
        }
    }
}

/**
 * 处理键盘按键
 */
function handleKeyPress(e) {
    switch (e.key.toLowerCase()) {
        case ' ':
            e.preventDefault();
            toggleSimulation();
            break;
            
        case 'c':
            if (game) {
                game.clear();
                updateParticleCount(0);
            }
            break;
            
        case 'r':
            if (confirm('确定要重置游戏吗？所有进度将丢失。')) {
                location.reload();
            }
            break;
            
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
            const index = parseInt(e.key) - 1;
            if (index < materialsConfig.length) {
                selectMaterial(materialsConfig[index].type);
                document.querySelectorAll('.material-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-type="${materialsConfig[index].type}"]`).classList.add('active');
            }
            break;
            
        case '[':
            brushSize = Math.max(1, brushSize - 1);
            brushSizeSlider.value = brushSize;
            brushSizeValue.textContent = brushSize;
            if (game) game.setBrushSize(brushSize);
            break;
            
        case ']':
            brushSize = Math.min(50, brushSize + 1);
            brushSizeSlider.value = brushSize;
            brushSizeValue.textContent = brushSize;
            if (game) game.setBrushSize(brushSize);
            break;
    }
}

/**
 * 处理窗口调整
 */
function handleResize() {
    if (game) {
        game.resize();
    }
}

/**
 * 保存游戏
 */
function saveGame() {
    if (game) {
        const saveData = game.save();
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sand-simulation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('游戏已保存！');
    }
}

/**
 * 加载游戏
 */
function loadGame() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const saveData = JSON.parse(e.target.result);
                if (game) {
                    game.load(saveData);
                    updateParticleCount(game.getParticleCount());
                    alert('游戏加载成功！');
                }
            } catch (error) {
                alert('加载失败：文件格式错误');
                console.error('加载错误:', error);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * 初始化UI更新
 */
function initUIUpdates() {
    // 定期更新统计信息
    setInterval(updateStats, 1000);
}

/**
 * 更新统计信息
 */
function updateStats() {
    if (!game) return;
    
    // 更新粒子数量
    updateParticleCount(game.getParticleCount());
    
    // 更新FPS
    fpsCounterEl.textContent = Math.round(fps);
    
    // 更新物理更新时间
    physicsUpdateEl.textContent = `${physicsUpdateTime.toFixed(1)}ms`;
    
    // 更新内存使用（估算）
    const memory = (performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0).toFixed(1);
    memoryUsageEl.textContent = `${memory}MB`;
}

/**
 * 更新粒子数量显示
 */
function updateParticleCount(count) {
    particleCountEl.textContent = count.toLocaleString();
    
    // 根据数量改变颜色
    if (count > 5000) {
        particleCountEl.style.color = '#e63946'; // 红色
    } else if (count > 2000) {
        particleCountEl.style.color = '#ff9f1c'; // 橙色
    } else {
        particleCountEl.style.color = '#4fc3a1'; // 绿色
    }
}

/**
 * 游戏主循环
 */
function gameLoop(currentTime) {
    // 计算FPS
    frameCount++;
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime >= 1000) {
        fps = (frameCount * 1000) / deltaTime;
        frameCount = 0;
        lastTime = currentTime;
    }
    
    // 更新游戏状态
    if (game && isSimulationRunning) {
        const startTime = performance.now();
        game.update();
        physicsUpdateTime = performance.now() - startTime;
    }
    
    // 渲染游戏
    if (game) {
        game.render();
    }
    
    // 继续循环
    requestAnimationFrame(gameLoop);
}

/**
 * 显示欢迎消息
 */
function showWelcomeMessage() {
    console.log(`
    🎮 落沙模拟游戏已启动！
    ===========================
    操作方法：
    - 点击/拖动: 放置材质
    - 空格键: 暂停/继续
    - C键: 清空画布
    - R键: 重置游戏
    - 1-8键: 切换材质
    - 鼠标滚轮: 调整画笔大小
    
    祝你玩得开心！ 🎉
    `);
    
    // 显示浮动提示
    showToast('欢迎来到落沙模拟游戏！', 'info');
}

/**
 * 显示帮助信息
 */
function showHelp() {
    const modal = document.getElementById('helpModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <h3><i class="fas fa-gamepad"></i> 游戏操作指南</h3>
        <div class="help-section">
            <h4><i class="fas fa-mouse-pointer"></i> 鼠标操作</h4>
            <ul>
                <li><strong>左键点击/拖动</strong>: 在画布上放置当前选择的材质</li>
                <li><strong>鼠标滚轮</strong>: 调整画笔大小</li>
                <li><strong>右键点击</strong>: 擦除粒子</li>
            </ul>
        </div>
        
        <div class="help-section">
            <h4><i class="fas fa-keyboard"></i> 键盘快捷键</h4>
            <table class="shortcuts-table">
                <tr><td><kbd>空格键</kbd></td><td>暂停/继续模拟</td></tr>
                <tr><td><kbd>C</kbd></td><td>清空画布</td></tr>
                <tr><td><kbd>R</kbd></td><td>重置游戏</td></tr>
                <tr><td><kbd>1-8</kbd></td><td>快速切换材质</td></tr>
                <tr><td><kbd>[</kbd> <kbd>]</kbd></td><td>减小/增大画笔大小</td></tr>
            </table>
        </div>
        
        <div class="help-section">
            <h4><i class="fas fa-palette"></i> 材质介绍</h4>
            <div class="materials-help">
                ${materialsConfig.map(material => `
                    <div class="material-help-item">
                        <span class="material-color" style="background-color: ${material.color}"></span>
                        <strong>${material.name}</strong>: ${getMaterialDescription(material.type)}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="help-section">
            <h4><i class="fas fa-lightbulb"></i> 物理特性说明</h4>
            <ul>
                <li>沙子会自然下落并堆积</li>
                <li>水会流动并寻找最低点</li>
                <li>火会向上燃烧并蔓延</li>
                <li>油浮在水面上</li>
                <li>不同材质之间会发生化学反应</li>
            </ul>
        </div>
    `;
    
    modal.style.display = 'block';
}

/**
 * 获取材质描述
 */
function getMaterialDescription(type) {
    const descriptions = {
        [MaterialType.SAND]: '自然下落，形成沙堆',
        [MaterialType.WATER]: '流动扩散，寻找最低点',
        [MaterialType.STONE]: '静止不动，作为障碍物',
        [MaterialType.FIRE]: '向上燃烧，需要燃料',
        [MaterialType.OIL]: '浮在水面，易燃',
        [MaterialType.METAL]: '导电，可被磁铁吸引',
        [MaterialType.PLANT]: '缓慢生长，吸收水分',
        [MaterialType.WOOD]: '可燃烧，提供燃料'
    };
    
    return descriptions[type] || '未知材质';
}

/**
 * 显示关于信息
 */
function showAbout() {
    const modal = document.getElementById('helpModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> 关于落沙模拟游戏</h3>
        
        <div class="about-section">
            <h4>项目简介</h4>
            <p>落沙模拟游戏是一个基于物理引擎的粒子模拟系统，使用HTML5 Canvas和JavaScript实现。游戏模拟了多种材质的物理行为和化学反应。</p>
        </div>
        
        <div class="about-section">
            <h4>技术特性</h4>
            <ul>
                <li><strong>物理引擎</strong>: 自定义粒子物理系统</li>
                <li><strong>渲染引擎</strong>: HTML5 Canvas 2D加速</li>
                <li><strong>材质系统</strong>: 8种不同物理特性的材质</li>
                <li><strong>化学系统</strong>: 材质之间的反应机制</li>
                <li><strong>性能优化</strong>: 支持10,000+粒子实时模拟</li>
            </ul>
        </div>
        
        <div class="about-section">
            <h4>开发团队</h4>
            <p>本项目由 Claude Code Agent Teams 协作开发：</p>
            <ul>
                <li><strong>物理引擎专家</strong>: 负责粒子物理和碰撞系统</li>
                <li><strong>前端开发专家</strong>: 负责界面设计和Canvas渲染</li>
                <li><strong>游戏设计师</strong>: 负责游戏机制和用户体验</li>
                <li><strong>系统架构师</strong>: 负责项目结构和代码组织</li>
                <li><strong>质量保证工程师</strong>: 负责测试和性能优化</li>
            </ul>
        </div>
        
        <div class="about-section">
            <h4>开源协议</h4>
            <p>本项目采用 MIT 开源协议，欢迎贡献代码和提出建议。</p>
        </div>
        
        <div class="about-section">
            <h4>版本信息</h4>
            <p>当前版本: 1.0.0</p>
            <p>构建时间: ${new Date().toLocaleDateString()}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

/**
 * 显示Toast通知
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // 自动消失
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * 获取Toast图标
 */
function getToastIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle'
    };
    return icons[type] || 'info-circle';
}

// 添加Toast样式
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bg-dark);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        max-width: 300px;
        border-left: 4px solid var(--accent-color);
    }
    
    .toast-info { border-left-color: var(--info-color); }
    .toast-success { border-left-color: var(--success-color); }
    .toast-warning { border-left-color: var(--warning-color); }
    .toast-error { border-left-color: var(--danger-color); }
    
    .toast i { font-size: 1.2rem; }
    
    .fade-out {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(toastStyles);

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);

// 防止右键菜单
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// 导出给测试使用
export { initGame, selectMaterial, toggleSimulation };