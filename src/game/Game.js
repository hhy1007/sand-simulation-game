/**
 * 游戏主逻辑模块
 * 系统架构师实现：模块集成、游戏状态管理、用户交互
 */

import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { CanvasRenderer } from '../rendering/CanvasRenderer.js';
import { materialManager, MaterialType } from '../materials/materials.js';
import { Particle } from '../physics/PhysicsEngine.js';

/**
 * 游戏主类
 */
export class Game {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = {
            initialGravity: 9.8,
            initialWind: 0,
            timeScale: 1.0,
            maxParticles: 10000,
            physicsSubSteps: 3,
            renderQuality: 'high',
            autoStart: true,
            debugMode: false,
            ...options
        };
        
        // 系统组件
        this.physicsEngine = null;
        this.renderer = null;
        this.materialManager = materialManager;
        
        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.currentMaterial = MaterialType.SAND;
        this.brushSize = 10;
        this.lastUpdateTime = 0;
        
        // 用户交互
        this.isDrawing = false;
        this.lastDrawX = 0;
        this.lastDrawY = 0;
        this.isErasing = false;
        
        // 工具系统
        this.tools = {
            BRUSH: 'brush',
            ERASER: 'eraser',
            LINE: 'line',
            CIRCLE: 'circle',
            RECTANGLE: 'rectangle',
            FLOOD: 'flood',
            EXPLOSION: 'explosion',
            GRAVITY: 'gravity'
        };
        this.currentTool = this.tools.BRUSH;
        
        // 统计数据
        this.stats = {
            totalParticles: 0,
            fps: 0,
            physicsTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            updateCount: 0,
            drawCount: 0
        };
        
        // 性能监控
        this.performanceMonitor = {
            fpsSamples: [],
            physicsSamples: [],
            renderSamples: [],
            sampleSize: 60 // 保留最近60帧的数据
        };
        
        // 事件监听器
        this.eventListeners = new Map();
        
        console.log('🎮 游戏实例创建');
    }
    
    /**
     * 初始化游戏
     */
    async init() {
        try {
            console.log('🔄 初始化游戏...');
            
            // 初始化物理引擎
            this.initPhysicsEngine();
            
            // 初始化渲染器
            this.initRenderer();
            
            // 初始化材质系统
            this.initMaterialSystem();
            
            // 初始化用户输入
            this.initInputHandlers();
            
            // 初始化工具系统
            this.initToolSystem();
            
            // 初始化事件系统
            this.initEventSystem();
            
            // 创建初始场景
            this.createInitialScene();
            
            console.log('✅ 游戏初始化完成！');
            
            // 自动开始游戏
            if (this.options.autoStart) {
                this.start();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ 游戏初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 初始化物理引擎
     */
    initPhysicsEngine() {
        this.physicsEngine = new PhysicsEngine(
            this.canvas.width,
            this.canvas.height
        );
        
        // 配置物理引擎
        this.physicsEngine.setGravity(this.options.initialGravity);
        this.physicsEngine.setWind(this.options.initialWind);
        this.physicsEngine.timeScale = this.options.timeScale;
        
        // 注册所有材质到物理引擎
        const allMaterials = this.materialManager.getAllMaterials();
        allMaterials.forEach(material => {
            this.physicsEngine.addMaterial(material);
        });
        
        console.log('🧠 物理引擎初始化完成');
    }
    
    /**
     * 初始化渲染器
     */
    initRenderer() {
        const renderOptions = {
            backgroundColor: '#0a0a0a',
            showGrid: true,
            gridSize: 32,
            showParticleOutline: false,
            particleSize: 4,
            smoothParticles: true,
            bloomEffect: true,
            bloomIntensity: 0.3,
            glowEffect: true,
            glowIntensity: 0.2,
            shadowEffect: true,
            shadowBlur: 2
        };
        
        this.renderer = new CanvasRenderer(this.canvas, renderOptions);
        this.renderer.start();
        
        console.log('🎨 渲染器初始化完成');
    }
    
    /**
     * 初始化材质系统
     */
    initMaterialSystem() {
        // 材质系统已在MaterialManager中初始化
        console.log('🎨 材质系统就绪');
    }
    
    /**
     * 初始化输入处理器
     */
    initInputHandlers() {
        this.setupMouseHandlers();
        this.setupKeyboardHandlers();
        this.setupTouchHandlers();
        
        console.log('🖱️ 输入处理器初始化完成');
    }
    
    /**
     * 设置鼠标处理器
     */
    setupMouseHandlers() {
        // 鼠标按下
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleMouseDown(x, y, e.button);
        });
        
        // 鼠标移动
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleMouseMove(x, y);
        });
        
        // 鼠标抬起
        this.canvas.addEventListener('mouseup', (e) => {
            this.handleMouseUp();
        });
        
        // 鼠标离开
        this.canvas.addEventListener('mouseleave', () => {
            this.handleMouseLeave();
        });
        
        // 鼠标滚轮
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleMouseWheel(e.deltaY);
        });
    }
    
    /**
     * 设置键盘处理器
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }
    
    /**
     * 设置触摸处理器
     */
    setupTouchHandlers() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.handleMouseDown(x, y, 0);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.handleMouseMove(x, y);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleMouseUp();
        });
    }
    
    /**
     * 初始化工具系统
     */
    initToolSystem() {
        // 工具配置
        this.toolConfig = {
            [this.tools.BRUSH]: {
                name: '画笔',
                icon: 'fas fa-paint-brush',
                description: '在画布上绘制粒子'
            },
            [this.tools.ERASER]: {
                name: '橡皮擦',
                icon: 'fas fa-eraser',
                description: '擦除粒子'
            },
            [this.tools.LINE]: {
                name: '直线工具',
                icon: 'fas fa-slash',
                description: '绘制直线'
            },
            [this.tools.CIRCLE]: {
                name: '圆形工具',
                icon: 'fas fa-circle',
                description: '绘制圆形'
            },
            [this.tools.RECTANGLE]: {
                name: '矩形工具',
                icon: 'fas fa-square',
                description: '绘制矩形'
            },
            [this.tools.FLOOD]: {
                name: '填充工具',
                icon: 'fas fa-fill',
                description: '填充区域'
            },
            [this.tools.EXPLOSION]: {
                name: '爆炸工具',
                icon: 'fas fa-bomb',
                description: '创建爆炸'
            },
            [this.tools.GRAVITY]: {
                name: '引力工具',
                icon: 'fas fa-magnet',
                description: '创建引力场'
            }
        };
        
        console.log('🛠️ 工具系统初始化完成');
    }
    
    /**
     * 初始化事件系统
     */
    initEventSystem() {
        // 创建事件总线
        this.eventBus = {
            listeners: new Map(),
            
            on(event, callback) {
                if (!this.listeners.has(event)) {
                    this.listeners.set(event, []);
                }
                this.listeners.get(event).push(callback);
            },
            
            emit(event, data) {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    callbacks.forEach(callback => callback(data));
                }
            },
            
            off(event, callback) {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            }
        };
        
        // 注册默认事件监听器
        this.registerDefaultEvents();
        
        console.log('📡 事件系统初始化完成');
    }
    
    /**
     * 注册默认事件
     */
    registerDefaultEvents() {
        // 粒子添加事件
        this.eventBus.on('particleAdded', (particle) => {
            this.stats.totalParticles = this.physicsEngine.getParticleCount();
            this.emit('statsUpdated', this.stats);
        });
        
        // 粒子移除事件
        this.eventBus.on('particleRemoved', () => {
            this.stats.totalParticles = this.physicsEngine.getParticleCount();
            this.emit('statsUpdated', this.stats);
        });
        
        // 材质变化事件
        this.eventBus.on('materialChanged', (materialType) => {
            console.log(`🎨 材质已切换为: ${materialType}`);
        });
        
        // 工具变化事件
        this.eventBus.on('toolChanged', (tool) => {
            console.log(`🛠️ 工具已切换为: ${tool}`);
        });
    }
    
    /**
     * 创建初始场景
     */
    createInitialScene() {
        // 添加一些示例粒子
        if (this.options.debugMode) {
            this.createDebugScene();
        } else {
            this.createDefaultScene();
        }
        
        console.log('🏞️ 初始场景创建完成');
    }
    
    /**
     * 创建调试场景
     */
    createDebugScene() {
        const materials = [
            MaterialType.SAND,
            MaterialType.WATER,
            MaterialType.STONE,
            MaterialType.FIRE
        ];
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        materials.forEach((materialType, index) => {
            const material = this.materialManager.getMaterial(materialType);
            if (material) {
                for (let i = 0; i < 50; i++) {
                    const angle = (index / materials.length) * Math.PI * 2;
                    const radius = 100;
                    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
                    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50;
                    
                    const particle = new Particle(x, y, material);
                    this.physicsEngine.addParticle(particle);
                }
            }
        });
    }
    
    /**
     * 创建默认场景
     */
    createDefaultScene() {
        // 创建地面
        this.createGround();
        
        // 创建一些示例粒子
        this.createExampleParticles();
    }
    
    /**
     * 创建地面
     */
    createGround() {
        const groundMaterial = this.materialManager.getMaterial(MaterialType.STONE);
        if (!groundMaterial) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const groundHeight = 50;
        
        for (let x = 0; x < width; x += 6) {
            for (let y = height - groundHeight; y < height; y += 6) {
                if (Math.random() > 0.7) {
                    const particle = new Particle(x, y, groundMaterial);
                    this.physicsEngine.addParticle(particle);
                }
            }
        }
    }
    
    /**
     * 创建示例粒子
     */
    createExampleParticles() {
        // 在中心创建一些沙子
        const sandMaterial = this.materialManager.getMaterial(MaterialType.SAND);
        if (sandMaterial) {
            for (let i = 0; i < 100; i++) {
                const x = this.canvas.width / 2 + (Math.random() - 0.5) * 100;
                const y = 100 + Math.random() * 50;
                const particle = new Particle(x, y, sandMaterial);
                this.physicsEngine.addParticle(particle);
            }
        }
        
        // 创建一些水
        const waterMaterial = this.materialManager.getMaterial(MaterialType.WATER);
        if (waterMaterial) {
            for (let i = 0; i < 50; i++) {
                const x = this.canvas.width / 3 + (Math.random() - 0.5) * 80;
                const y = 200 + Math.random() * 30;
                const particle = new Particle(x, y, waterMaterial);
                this.physicsEngine.addParticle(particle);
            }
        }
    }
    
    /**
     * 开始游戏
     */
    start() {
        if (this.isRunning) {
            console.warn('⚠️ 游戏已经在运行');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        
        // 启动游戏循环
        this.gameLoop();
        
        console.log('▶️ 游戏开始');
        this.emit('gameStarted');
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            console.warn('⚠️ 游戏已经暂停或未运行');
            return;
        }
        
        this.isPaused = true;
        console.log('⏸️ 游戏暂停');
        this.emit('gamePaused');
    }
    
    /**
     * 继续游戏
     */
    resume() {
        if (!this.isRunning || !this.isPaused) {
            console.warn('⚠️ 游戏未暂停或未运行');
            return;
        }
        
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        
        console.log('⏯️ 游戏继续');
        this.emit('gameResumed');
    }
    
    /**
     * 停止游戏
     */
    stop() {
        if (!this.isRunning) {
            console.warn('⚠️ 游戏未运行');
            return;
        }
        
        this.isRunning = false;
        this.isPaused = false;
        
        console.log('⏹️ 游戏停止');
        this.emit('gameStopped');
    }
    
    /**
     * 重置游戏
     */
    reset() {
        this.stop();
        
        // 清空所有粒子
        this.physicsEngine.clear();
        
        // 重置统计数据
        this.resetStats();
        
        // 重新创建初始场景
        this.createInitialScene();
        
        // 重新开始游戏
        this.start();
        
        console.log('🔄 游戏重置');
        this.emit('gameReset');
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastUpdateTime) / 1000, 0.1);
        
        // 更新游戏状态
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        // 渲染游戏
        this.render();
        
        // 更新最后更新时间
        this.lastUpdateTime = currentTime;
        
        // 继续下一帧
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        // 更新物理引擎
        this.physicsEngine.update();
        
        // 更新统计数据
        const physicsStats = this.physicsEngine.getStats();
        this.stats.physicsTime = physicsStats.updateTime;
        this.stats.totalParticles = physicsStats.activeParticles;
        this.stats.memoryUsage = physicsStats.memoryUsage;
        this.stats.updateCount++;
        
        // 更新性能监控
        this.updatePerformanceMonitor(startTime);
        
        // 触发更新事件
        this.emit('gameUpdated', {
            deltaTime,
            stats: this.stats
        });
    }
    
    /**
     * 更新性能监控
     */
    updatePerformanceMonitor(startTime) {
        const updateTime = performance.now() - startTime;
        
        // 添加FPS样本
        const fps = 1000 / (performance.now() - this.lastUpdateTime);
        this.performanceMonitor.fpsSamples.push(fps);
        if (this.performanceMonitor.fpsSamples.length > this.performanceMonitor.sampleSize) {
            this.performanceMonitor.fpsSamples.shift();
        }
        
        // 计算平均FPS
        const totalFps = this.performanceMonitor.fpsSamples.reduce((a, b) => a + b, 0);
        this.stats.fps = totalFps / this.performanceMonitor.fpsSamples.length;
    }
    
    /**
     * 渲染游戏
     */
    render() {
        const startTime = performance.now();
        
        // 获取所有粒子
        const particles = this.physicsEngine.getParticles();
        
        // 准备渲染统计信息
        const renderStats = {
            particleCount: particles.length,
            physicsTime: this.stats.physicsTime,
            memoryUsage: this.stats.memoryUsage
        };
        
        // 渲染粒子
        this.renderer.render(particles, renderStats);
        
        // 绘制工具预览
        if (this.isDrawing && this.lastDrawX && this.lastDrawY) {
            this.drawToolPreview(this.lastDrawX, this.lastDrawY);
        }
        
        // 更新渲染统计
        const rendererStats = this.renderer.getStats();
        this.stats.renderTime = rendererStats.renderTime;
        this.stats.drawCount++;
        
        // 触发渲染事件
        this.emit('gameRendered', {
            particlesCount: particles.length,
            renderTime: rendererStats.renderTime
        });
    }
    
    /**
     * 绘制工具预览
     */
    drawToolPreview(x, y) {
        const material = this.materialManager.getMaterial(this.currentMaterial);
        
        switch (this.currentTool) {
            case this.tools.BRUSH:
                this.renderer.drawBrushPreview(x, y, this.brushSize, material);
                break;
                
            case this.tools.ERASER:
                this.renderer.drawBrushPreview(x, y, this.brushSize, { color: '#ff0000' });
                break;
                
            case this.tools.EXPLOSION:
                this.renderer.drawExplosion(x, y, this.brushSize * 2, 0.5);
                break;
                
            case this.tools.GRAVITY:
                this.renderer.drawForceField(x, y, this.brushSize * 3, 0, -100);
                break;
        }
    }
    
    /**
     * 处理鼠标按下
     */
    handleMouseDown(x, y, button) {
        this.lastDrawX = x;
        this.lastDrawY = y;
        
        if (button === 0) { // 左键
            this.isDrawing = true;
            this.isErasing = false;
            this.handleToolAction(x, y, false);
        } else if (button === 2) { // 右键
            this.isDrawing = true;
            this.isErasing = true;
            this.handleToolAction(x, y, true);
        }
    }
    
    /**
     * 处理鼠标移动
     */
    handleMouseMove(x, y) {
        if (this.isDrawing) {
            // 绘制连续线条
            this.handleContinuousDraw(x, y);
        }
        
        this.lastDrawX = x;
        this.lastDrawY = y;
    }
    
    /**
     * 处理鼠标抬起
     */
    handleMouseUp() {
        this.isDrawing = false;
        this.isErasing = false;
    }
    
    /**
     * 处理鼠标离开
     */
    handleMouseLeave() {
        this.isDrawing = false;
        this.isErasing = false;
    }
    
    /**
     * 处理鼠标滚轮
     */
    handleMouseWheel(deltaY) {
        if (deltaY > 0) {
            this.brushSize = Math.max(1, this.brushSize - 1);
        } else {
            this.brushSize = Math.min(50, this.brushSize + 1);
        }
        
        console.log(`🎨 画笔大小: ${this.brushSize}`);
        this.emit('brushSizeChanged', this.brushSize);
    }
    
    /**
     * 处理连续绘制
     */
    handleContinuousDraw(x, y) {
        const dx = x - this.lastDrawX;
        const dy = y - this.lastDrawY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.brushSize / 2) {
            this.handleToolAction(x, y, this.isErasing);
        }
    }
    
    /**
     * 处理工具动作
     */
    handleToolAction(x, y, isErasing) {
        switch (this.currentTool) {
            case this.tools.BRUSH:
                if (isErasing) {
                    this.eraseParticles(x, y);
                } else {
                    this.addParticles(x, y);
                }
                break;
                
            case this.tools.ERASER:
                this.eraseParticles(x, y);
                break;
                
            case this.tools.LINE:
                // 直线工具需要起始点和结束点
                break;
                
            case this.tools.CIRCLE:
                this.addCircle(x, y);
                break;
                
            case this.tools.RECTANGLE:
                this.addRectangle(x, y);
                break;
                
            case this.tools.FLOOD:
                this.floodFill(x, y);
                break;
                
            case this.tools.EXPLOSION:
                this.createExplosion(x, y);
                break;
                
            case this.tools.GRAVITY:
                this.createGravityField(x, y);
                break;
        }
    }
    
    /**
     * 添加粒子
     */
    addParticles(x, y) {
        const material = this.materialManager.getMaterial(this.currentMaterial);
        if (!material) return;
        
        const particles = [];
        const radius = this.brushSize;
        const density = 0.7; // 粒子密度
        
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (dx * dx + dy * dy <= radius * radius) {
                    if (Math.random() < density) {
                        const particleX = x + dx;
                        const particleY = y + dy;
                        
                        // 检查边界
                        if (particleX >= 0 && particleX < this.canvas.width &&
                            particleY >= 0 && particleY < this.canvas.height) {
                            
                            const particle = new Particle(particleX, particleY, material);
                            particles.push(particle);
                        }
                    }
                }
            }
        }
        
        const added = this.physicsEngine.addParticles(particles);
        if (added > 0) {
            this.emit('particlesAdded', { count: added, material: this.currentMaterial });
        }
    }
    
    /**
     * 擦除粒子
     */
    eraseParticles(x, y) {
        const radius = this.brushSize * 1.5;
        const particles = this.physicsEngine.getParticles();
        let erased = 0;
        
        particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                this.physicsEngine.removeParticle(particle.id);
                erased++;
            }
        });
        
        if (erased > 0) {
            this.emit('particlesErased', { count: erased });
        }
    }
    
    /**
     * 添加圆形
     */
    addCircle(x, y) {
        const material = this.materialManager.getMaterial(this.currentMaterial);
        if (!material) return;
        
        const radius = this.brushSize;
        const particles = [];
        
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 20) {
            for (let r = 0; r < radius; r += 2) {
                if (Math.random() > 0.7) {
                    const particleX = x + Math.cos(angle) * r;
                    const particleY = y + Math.sin(angle) * r;
                    
                    if (particleX >= 0 && particleX < this.canvas.width &&
                        particleY >= 0 && particleY < this.canvas.height) {
                        
                        const particle = new Particle(particleX, particleY, material);
                        particles.push(particle);
                    }
                }
            }
        }
        
        this.physicsEngine.addParticles(particles);
        this.emit('circleAdded', { x, y, radius, material: this.currentMaterial });
    }
    
    /**
     * 添加矩形
     */
    addRectangle(x, y) {
        const material = this.materialManager.getMaterial(this.currentMaterial);
        if (!material) return;
        
        const size = this.brushSize * 2;
        const particles = [];
        
        for (let dx = -size; dx <= size; dx += 3) {
            for (let dy = -size; dy <= size; dy += 3) {
                if (Math.random() > 0.5) {
                    const particleX = x + dx;
                    const particleY = y + dy;
                    
                    if (particleX >= 0 && particleX < this.canvas.width &&
                        particleY >= 0 && particleY < this.canvas.height) {
                        
                        const particle = new Particle(particleX, particleY, material);
                        particles.push(particle);
                    }
                }
            }
        }
        
        this.physicsEngine.addParticles(particles);
        this.emit('rectangleAdded', { x, y, size, material: this.currentMaterial });
    }
    
    /**
     * 区域填充
     */
    floodFill(x, y) {
        // 简化版本：在区域内添加粒子
        this.addCircle(x, y);
        this.emit('areaFilled', { x, y, material: this.currentMaterial });
    }
    
    /**
     * 创建爆炸
     */
    createExplosion(x, y) {
        const radius = this.brushSize * 5;
        const force = 1000;
        
        this.physicsEngine.applyExplosion(x, y, radius, force);
        
        // 添加爆炸视觉效果
        this.renderer.drawExplosion(x, y, radius, 1.0);
        
        this.emit('explosionCreated', { x, y, radius });
    }
    
    /**
     * 创建引力场
     */
    createGravityField(x, y) {
        const radius = this.brushSize * 3;
        const forceY = -500; // 向上引力
        
        this.physicsEngine.applyForceField(x, y, radius, 0, forceY);
        
        this.emit('gravityFieldCreated', { x, y, radius });
    }
    
    /**
     * 处理键盘按下
     */
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
                
            case 'c':
                this.clearAllParticles();
                break;
                
            case 'r':
                this.reset();
                break;
                
            case 's':
                this.saveGame();
                break;
                
            case 'l':
                this.loadGame();
                break;
                
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                this.selectMaterialByKey(e.key);
                break;
                
            case 'b':
                this.selectTool(this.tools.BRUSH);
                break;
                
            case 'e':
                this.selectTool(this.tools.ERASER);
                break;
                
            case 'x':
                this.selectTool(this.tools.EXPLOSION);
                break;
                
            case 'g':
                this.selectTool(this.tools.GRAVITY);
                break;
                
            case '[':
                this.brushSize = Math.max(1, this.brushSize - 1);
                this.emit('brushSizeChanged', this.brushSize);
                break;
                
            case ']':
                this.brushSize = Math.min(50, this.brushSize + 1);
                this.emit('brushSizeChanged', this.brushSize);
                break;
        }
    }
    
    /**
     * 处理键盘抬起
     */
    handleKeyUp(e) {
        // 可以用于处理持续按下的键
    }
    
    /**
     * 切换暂停状态
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    /**
     * 清空所有粒子
     */
    clearAllParticles() {
        this.physicsEngine.clear();
        this.stats.totalParticles = 0;
        
        console.log('🧹 所有粒子已清空');
        this.emit('particlesCleared');
    }
    
    /**
     * 通过按键选择材质
     */
    selectMaterialByKey(key) {
        const index = parseInt(key) - 1;
        const baseMaterials = this.materialManager.getBaseMaterials();
        
        if (index >= 0 && index < baseMaterials.length) {
            this.setCurrentMaterial(baseMaterials[index].type);
        }
    }
    
    /**
     * 设置当前材质
     */
    setCurrentMaterial(materialType) {
        const material = this.materialManager.getMaterial(materialType);
        if (material) {
            this.currentMaterial = materialType;
            console.log(`🎨 切换材质为: ${material.name}`);
            this.emit('materialChanged', materialType);
        }
    }
    
    /**
     * 选择工具
     */
    selectTool(tool) {
        if (this.toolConfig[tool]) {
            this.currentTool = tool;
            console.log(`🛠️ 切换工具为: ${this.toolConfig[tool].name}`);
            this.emit('toolChanged', tool);
        }
    }
    
    /**
     * 保存游戏
     */
    saveGame() {
        const saveData = {
            gameState: this.saveState(),
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        const json = JSON.stringify(saveData, null, 2);
        
        // 触发保存事件
        this.emit('gameSaved', saveData);
        
        return json;
    }
    
    /**
     * 加载游戏
     */
    loadGame(saveData) {
        try {
            const data = typeof saveData === 'string' ? JSON.parse(saveData) : saveData;
            
            // 停止当前游戏
            this.stop();
            
            // 加载状态
            this.loadState(data.gameState);
            
            // 重新开始游戏
            this.start();
            
            console.log('📂 游戏加载成功');
            this.emit('gameLoaded', data);
            
            return true;
            
        } catch (error) {
            console.error('❌ 游戏加载失败:', error);
            this.emit('gameLoadFailed', error);
            return false;
        }
    }
    
    /**
     * 保存状态
     */
    saveState() {
        return {
            physicsState: this.physicsEngine.saveState(),
            currentMaterial: this.currentMaterial,
            brushSize: this.brushSize,
            currentTool: this.currentTool,
            stats: { ...this.stats }
        };
    }
    
    /**
     * 加载状态
     */
    loadState(state) {
        // 加载物理状态
        if (state.physicsState) {
            this.physicsEngine.loadState(state.physicsState);
        }
        
        // 加载游戏状态
        if (state.currentMaterial) {
            this.currentMaterial = state.currentMaterial;
        }
        
        if (state.brushSize) {
            this.brushSize = state.brushSize;
        }
        
        if (state.currentTool) {
            this.currentTool = state.currentTool;
        }
        
        if (state.stats) {
            this.stats = { ...state.stats };
        }
    }
    
    /**
     * 重置统计
     */
    resetStats() {
        this.stats = {
            totalParticles: 0,
            fps: 0,
            physicsTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            updateCount: 0,
            drawCount: 0
        };
    }
    
    /**
     * 获取当前材质
     */
    getCurrentMaterial() {
        return this.materialManager.getMaterial(this.currentMaterial);
    }
    
    /**
     * 获取粒子数量
     */
    getParticleCount() {
        return this.physicsEngine.getParticleCount();
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * 设置重力
     */
    setGravity(gravity) {
        this.physicsEngine.setGravity(gravity);
        this.emit('gravityChanged', gravity);
    }
    
    /**
     * 设置画笔大小
     */
    setBrushSize(size) {
        this.brushSize = Math.max(1, Math.min(50, size));
        this.emit('brushSizeChanged', this.brushSize);
    }
    
    /**
     * 调整画布大小
     */
    resize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.physicsEngine.resize(width, height);
        this.renderer.resize(width, height);
        
        this.emit('canvasResized', { width, height });
    }
    
    /**
     * 事件发射
     */
    emit(event, data) {
        this.eventBus.emit(event, data);
    }
    
    /**
     * 事件监听
     */
    on(event, callback) {
        this.eventBus.on(event, callback);
    }
    
    /**
     * 移除事件监听
     */
    off(event, callback) {
        this.eventBus.off(event, callback);
    }
    
    /**
     * 销毁游戏
     */
    destroy() {
        // 停止游戏
        this.stop();
        
        // 移除事件监听器
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.removeEventListener('wheel', this.handleMouseWheel);
        
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // 清空所有粒子
        this.physicsEngine.clear();
        
        // 清理渲染器
        this.renderer.pause();
        
        console.log('🗑️ 游戏实例已销毁');
        this.emit('gameDestroyed');
    }
}

export default Game;