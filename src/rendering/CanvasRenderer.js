/**
 * Canvas渲染引擎模块
 * 前端开发专家实现：粒子渲染、特效绘制、性能优化
 */

/**
 * Canvas渲染器类
 */
export class CanvasRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        
        // 配置选项
        this.options = {
            backgroundColor: '#000000',
            showGrid: false,
            gridSize: 16,
            gridColor: 'rgba(255, 255, 255, 0.05)',
            showParticleOutline: false,
            outlineColor: 'rgba(0, 0, 0, 0.3)',
            particleSize: 4,
            smoothParticles: true,
            bloomEffect: true,
            bloomIntensity: 0.3,
            glowEffect: true,
            glowIntensity: 0.5,
            shadowEffect: true,
            shadowBlur: 3,
            ...options
        };
        
        // 渲染状态
        this.isRendering = false;
        this.lastRenderTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        // 性能统计
        this.stats = {
            renderTime: 0,
            particlesRendered: 0,
            drawCalls: 0,
            memoryUsage: 0
        };
        
        // 特效缓存
        this.effects = {
            bloom: null,
            glow: null,
            shadow: null
        };
        
        // 离屏Canvas（用于特效）
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化渲染器
     */
    init() {
        // 设置Canvas尺寸
        this.resize(this.canvas.width, this.canvas.height);
        
        // 初始化离屏Canvas
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        
        // 设置渲染质量
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.offscreenCtx.imageSmoothingEnabled = true;
        this.offscreenCtx.imageSmoothingQuality = 'high';
        
        // 创建特效缓存
        this.createEffectBuffers();
        
        console.log('🎨 Canvas渲染器初始化完成');
    }
    
    /**
     * 创建特效缓存
     */
    createEffectBuffers() {
        // 创建Bloom特效缓存
        if (this.options.bloomEffect) {
            this.effects.bloom = document.createElement('canvas');
            this.effects.bloom.width = this.canvas.width;
            this.effects.bloom.height = this.canvas.height;
        }
        
        // 创建Glow特效缓存
        if (this.options.glowEffect) {
            this.effects.glow = document.createElement('canvas');
            this.effects.glow.width = this.canvas.width;
            this.effects.glow.height = this.canvas.height;
        }
    }
    
    /**
     * 调整Canvas大小
     */
    resize(width, height) {
        // 设置Canvas尺寸
        this.canvas.width = width;
        this.canvas.height = height;
        
        // 更新离屏Canvas
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
        
        // 更新特效缓存
        Object.values(this.effects).forEach(buffer => {
            if (buffer) {
                buffer.width = width;
                buffer.height = height;
            }
        });
        
        console.log(`📐 Canvas尺寸调整为: ${width}x${height}`);
    }
    
    /**
     * 开始渲染
     */
    start() {
        this.isRendering = true;
        console.log('▶️ 开始渲染');
    }
    
    /**
     * 暂停渲染
     */
    pause() {
        this.isRendering = false;
        console.log('⏸️ 暂停渲染');
    }
    
    /**
     * 渲染一帧
     * @param {Array} particles - 要渲染的粒子数组
     * @param {Object} stats - 统计信息
     */
    render(particles, stats = {}) {
        if (!this.isRendering) return;
        
        const startTime = performance.now();
        
        // 清除画布
        this.clear();
        
        // 绘制网格（如果启用）
        if (this.options.showGrid) {
            this.drawGrid();
        }
        
        // 渲染粒子
        this.renderParticles(particles);
        
        // 应用特效
        this.applyEffects();
        
        // 绘制统计信息
        this.drawStats(stats);
        
        // 更新性能统计
        this.updateStats(startTime, particles.length);
        
        // 更新FPS计算
        this.updateFPS();
    }
    
    /**
     * 清除画布
     */
    clear() {
        // 使用纯色填充背景
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 清除离屏Canvas
        this.offscreenCtx.fillStyle = this.options.backgroundColor;
        this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }
    
    /**
     * 绘制网格
     */
    drawGrid() {
        this.ctx.strokeStyle = this.options.gridColor;
        this.ctx.lineWidth = 0.5;
        
        const gridSize = this.options.gridSize;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 绘制垂直线
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * 渲染粒子
     */
    renderParticles(particles) {
        if (!particles || particles.length === 0) return;
        
        // 使用离屏Canvas进行粒子渲染
        this.renderParticlesToOffscreen(particles);
        
        // 将离屏Canvas绘制到主Canvas
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        this.stats.drawCalls = particles.length;
    }
    
    /**
     * 渲染粒子到离屏Canvas
     */
    renderParticlesToOffscreen(particles) {
        const ctx = this.offscreenCtx;
        
        // 批量绘制粒子（性能优化）
        particles.forEach(particle => {
            this.drawParticle(ctx, particle);
        });
    }
    
    /**
     * 绘制单个粒子
     */
    drawParticle(ctx, particle) {
        const size = this.options.particleSize;
        const x = particle.x;
        const y = particle.y;
        
        // 获取粒子颜色
        const color = particle.getColor ? particle.getColor() : particle.material?.color || '#ffffff';
        
        // 绘制阴影（如果启用）
        if (this.options.shadowEffect) {
            ctx.shadowColor = color;
            ctx.shadowBlur = this.options.shadowBlur;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
        }
        
        // 绘制粒子主体
        ctx.fillStyle = color;
        
        if (this.options.smoothParticles) {
            // 使用圆形粒子（更平滑）
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制轮廓（如果启用）
            if (this.options.showParticleOutline) {
                ctx.strokeStyle = this.options.outlineColor;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        } else {
            // 使用方形粒子（性能更好）
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        
        // 重置阴影
        if (this.options.shadowEffect) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // 绘制火焰特效
        if (particle.burning) {
            this.drawFireEffect(ctx, particle);
        }
        
        // 绘制温度特效
        if (particle.temperature > 100) {
            this.drawHeatEffect(ctx, particle);
        }
    }
    
    /**
     * 绘制火焰特效
     */
    drawFireEffect(ctx, particle) {
        const size = this.options.particleSize;
        const x = particle.x;
        const y = particle.y;
        const intensity = Math.sin(particle.burnTime * 10) * 0.5 + 0.5;
        
        // 火焰核心
        ctx.beginPath();
        ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        
        // 火焰渐变
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(0, `rgba(255, 255, 100, ${0.8 * intensity})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.6 * intensity})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 火焰火花
        if (Math.random() < 0.3) {
            const sparkX = x + (Math.random() - 0.5) * size * 2;
            const sparkY = y - Math.random() * size * 3;
            const sparkSize = size * (0.5 + Math.random() * 0.5);
            
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 200, ${0.7 * intensity})`;
            ctx.fill();
        }
    }
    
    /**
     * 绘制热效应
     */
    drawHeatEffect(ctx, particle) {
        const size = this.options.particleSize;
        const x = particle.x;
        const y = particle.y;
        
        // 根据温度计算热效应强度
        const heatIntensity = Math.min(1, (particle.temperature - 100) / 500);
        
        // 热浪扭曲效果
        if (heatIntensity > 0.3) {
            ctx.beginPath();
            ctx.arc(x, y, size * (1 + heatIntensity), 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            gradient.addColorStop(0, `rgba(255, 200, 100, ${0.3 * heatIntensity})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }
    
    /**
     * 应用特效
     */
    applyEffects() {
        if (this.options.bloomEffect) {
            this.applyBloomEffect();
        }
        
        if (this.options.glowEffect) {
            this.applyGlowEffect();
        }
    }
    
    /**
     * 应用Bloom特效（光晕）
     */
    applyBloomEffect() {
        const bloomCtx = this.effects.bloom?.getContext('2d');
        if (!bloomCtx) return;
        
        // 复制当前内容到Bloom缓存
        bloomCtx.drawImage(this.canvas, 0, 0);
        
        // 应用高斯模糊
        bloomCtx.filter = `blur(${this.options.bloomIntensity * 10}px) brightness(${1 + this.options.bloomIntensity})`;
        bloomCtx.drawImage(this.effects.bloom, 0, 0);
        bloomCtx.filter = 'none';
        
        // 叠加Bloom效果
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = this.options.bloomIntensity * 0.5;
        this.ctx.drawImage(this.effects.bloom, 0, 0);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
    }
    
    /**
     * 应用Glow特效（发光）
     */
    applyGlowEffect() {
        // 简化版本：使用阴影实现发光效果
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        this.ctx.shadowBlur = this.options.glowIntensity * 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // 重绘高亮区域
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        // 这里可以添加特定的发光区域绘制逻辑
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * 绘制统计信息
     */
    drawStats(stats) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        
        // 保存当前状态
        ctx.save();
        
        // 设置文字样式
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        
        // 绘制FPS
        ctx.fillText(`FPS: ${Math.round(this.fps)}`, width - 10, 10);
        
        // 绘制粒子数量
        if (stats.particleCount !== undefined) {
            ctx.fillText(`粒子: ${stats.particleCount}`, width - 10, 30);
        }
        
        // 绘制物理更新时间
        if (stats.physicsTime !== undefined) {
            ctx.fillText(`物理: ${stats.physicsTime.toFixed(1)}ms`, width - 10, 50);
        }
        
        // 绘制渲染时间
        ctx.fillText(`渲染: ${this.stats.renderTime.toFixed(1)}ms`, width - 10, 70);
        
        // 绘制内存使用
        if (stats.memoryUsage !== undefined) {
            ctx.fillText(`内存: ${stats.memoryUsage.toFixed(1)}MB`, width - 10, 90);
        }
        
        // 恢复状态
        ctx.restore();
    }
    
    /**
     * 更新统计信息
     */
    updateStats(startTime, particlesRendered) {
        this.stats.renderTime = performance.now() - startTime;
        this.stats.particlesRendered = particlesRendered;
        this.stats.drawCalls = particlesRendered;
    }
    
    /**
     * 更新FPS计算
     */
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastRenderTime;
        
        if (elapsed >= 1000) {
            this.fps = (this.frameCount * 1000) / elapsed;
            this.frameCount = 0;
            this.lastRenderTime = now;
        }
    }
    
    /**
     * 绘制粒子放置预览
     */
    drawBrushPreview(x, y, size, material) {
        const ctx = this.ctx;
        
        // 保存当前状态
        ctx.save();
        
        // 绘制圆形预览
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.strokeStyle = material?.color || '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制半透明填充
        ctx.fillStyle = material?.color ? `${material.color}40` : 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        
        // 绘制中心点
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // 恢复状态
        ctx.restore();
    }
    
    /**
     * 绘制力场效果
     */
    drawForceField(x, y, radius, forceX, forceY) {
        const ctx = this.ctx;
        
        // 保存当前状态
        ctx.save();
        
        // 绘制力场范围
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制力方向箭头
        const forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);
        if (forceMagnitude > 0) {
            const arrowLength = Math.min(radius * 0.5, forceMagnitude * 10);
            const angle = Math.atan2(forceY, forceX);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * arrowLength,
                y + Math.sin(angle) * arrowLength
            );
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 绘制箭头头部
            ctx.beginPath();
            const headX = x + Math.cos(angle) * arrowLength;
            const headY = y + Math.sin(angle) * arrowLength;
            ctx.moveTo(headX, headY);
            ctx.lineTo(
                headX - Math.cos(angle - Math.PI / 6) * 10,
                headY - Math.sin(angle - Math.PI / 6) * 10
            );
            ctx.lineTo(
                headX - Math.cos(angle + Math.PI / 6) * 10,
                headY - Math.sin(angle + Math.PI / 6) * 10
            );
            ctx.closePath();
            ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
            ctx.fill();
        }
        
        // 恢复状态
        ctx.restore();
    }
    
    /**
     * 绘制爆炸效果
     */
    drawExplosion(x, y, radius, intensity) {
        const ctx = this.ctx;
        
        // 保存当前状态
        ctx.save();
        
        // 绘制爆炸冲击波
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 200, 0, ${0.8 * intensity})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.6 * intensity})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 绘制爆炸碎片
        for (let i = 0; i < 10 * intensity; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const fragmentSize = 2 + Math.random() * 4;
            
            const fragmentX = x + Math.cos(angle) * distance;
            const fragmentY = y + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(fragmentX, fragmentY, fragmentSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${Math.floor(150 + Math.random() * 100)}, 0, ${0.7 * intensity})`;
            ctx.fill();
        }
        
        // 恢复状态
        ctx.restore();
    }
    
    /**
     * 获取渲染统计信息
     */
    getStats() {
        return {
            ...this.stats,
            fps: this.fps,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        };
    }
    
    /**
     * 设置渲染选项
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
        
        // 如果启用了新特效，重新创建缓存
        if ((options.bloomEffect && !this.effects.bloom) || 
            (options.glowEffect && !this.effects.glow)) {
            this.createEffectBuffers();
        }
    }
    
    /**
     * 导出当前帧为图片
     */
    exportToImage(format = 'image/png', quality = 0.92) {
        return this.canvas.toDataURL(format, quality);
    }
    
    /**
     * 保存当前帧
     */
    saveFrame(filename = `sand-simulation-${Date.now()}.png`) {
        const dataUrl = this.exportToImage();
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }
}

export default CanvasRenderer;