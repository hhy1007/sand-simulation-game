/**
 * 物理引擎模块
 * 物理引擎专家实现：粒子物理、碰撞检测、重力模拟、流体动力学
 */

/**
 * 粒子类 - 表示游戏中的一个物理粒子
 */
export class Particle {
    constructor(x, y, material, id) {
        this.id = id || `particle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.x = x;
        this.y = y;
        this.material = material;
        this.velocityX = 0;
        this.velocityY = 0;
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.mass = material.density; // 质量基于密度
        this.size = 4; // 粒子大小（像素）
        this.life = material.life || Infinity; // 粒子生命周期
        this.age = 0; // 当前年龄
        this.temperature = material.initialTemperature || 20; // 温度（摄氏度）
        this.flammable = material.flammable || false;
        this.burning = false;
        this.burnTime = 0;
        this.conductive = material.conductive || false;
        this.magnetic = material.magnetic || false;
        this.lastUpdated = performance.now();
        
        // 网格位置（用于空间分割优化）
        this.gridX = Math.floor(x / GRID_SIZE);
        this.gridY = Math.floor(y / GRID_SIZE);
    }

    /**
     * 更新粒子物理状态
     * @param {number} deltaTime - 时间增量（秒）
     * @param {PhysicsEngine} engine - 物理引擎实例
     */
    update(deltaTime, engine) {
        // 增加年龄
        this.age += deltaTime;
        
        // 检查生命周期
        if (this.age >= this.life) {
            return false; // 粒子死亡
        }

        // 应用重力
        this.accelerationY += engine.gravity * this.material.gravityMultiplier;

        // 应用摩擦力
        const friction = this.material.friction;
        this.velocityX *= (1 - friction * deltaTime);
        this.velocityY *= (1 - friction * deltaTime);

        // 更新速度（v = v0 + a * t）
        this.velocityX += this.accelerationX * deltaTime;
        this.velocityY += this.accelerationY * deltaTime;

        // 限制最大速度
        const maxSpeed = this.material.maxSpeed;
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (speed > maxSpeed) {
            const ratio = maxSpeed / speed;
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }

        // 计算新位置
        const newX = this.x + this.velocityX * deltaTime;
        const newY = this.y + this.velocityY * deltaTime;

        // 更新网格位置
        const oldGridX = this.gridX;
        const oldGridY = this.gridY;
        this.gridX = Math.floor(newX / GRID_SIZE);
        this.gridY = Math.floor(newY / GRID_SIZE);

        // 检查边界碰撞
        const { canvasWidth, canvasHeight } = engine;
        let finalX = newX;
        let finalY = newY;
        let collided = false;

        // 水平边界
        if (newX < this.size) {
            finalX = this.size;
            this.velocityX = -this.velocityX * this.material.bounce;
            collided = true;
        } else if (newX > canvasWidth - this.size) {
            finalX = canvasWidth - this.size;
            this.velocityX = -this.velocityX * this.material.bounce;
            collided = true;
        }

        // 垂直边界
        if (newY < this.size) {
            finalY = this.size;
            this.velocityY = -this.velocityY * this.material.bounce;
            collided = true;
        } else if (newY > canvasHeight - this.size) {
            finalY = canvasHeight - this.size;
            this.velocityY = -this.velocityY * this.material.bounce;
            collided = true;
        }

        // 更新位置
        this.x = finalX;
        this.y = finalY;

        // 重置加速度
        this.accelerationX = 0;
        this.accelerationY = 0;

        // 更新燃烧状态
        if (this.burning) {
            this.updateBurning(deltaTime, engine);
        }

        // 更新温度
        this.updateTemperature(deltaTime, engine);

        // 更新最后更新时间
        this.lastUpdated = performance.now();

        // 返回网格变化信息用于空间分割更新
        return {
            moved: oldGridX !== this.gridX || oldGridY !== this.gridY,
            oldGridX,
            oldGridY,
            newGridX: this.gridX,
            newGridY: this.gridY
        };
    }

    /**
     * 更新燃烧状态
     */
    updateBurning(deltaTime, engine) {
        this.burnTime += deltaTime;
        this.temperature += 100 * deltaTime; // 燃烧时温度上升

        // 消耗生命
        this.life -= deltaTime * this.material.burnRate;

        // 随机产生火焰粒子
        if (Math.random() < 0.1 * deltaTime) {
            this.createFireParticle(engine);
        }

        // 检查燃烧结束
        if (this.burnTime >= this.material.maxBurnTime) {
            this.burning = false;
            this.burnTime = 0;
            // 燃烧结束后可能变为其他材质（如灰烬）
            if (this.material.burnResult) {
                this.material = engine.getMaterial(this.material.burnResult);
            }
        }
    }

    /**
     * 创建火焰粒子
     */
    createFireParticle(engine) {
        const fireMaterial = engine.getMaterial('FIRE');
        if (fireMaterial) {
            const fireParticle = new Particle(
                this.x + (Math.random() - 0.5) * 10,
                this.y - Math.random() * 5,
                fireMaterial
            );
            // 火焰向上飘
            fireParticle.velocityY = -20 - Math.random() * 30;
            fireParticle.velocityX = (Math.random() - 0.5) * 10;
            engine.addParticle(fireParticle);
        }
    }

    /**
     * 更新温度
     */
    updateTemperature(deltaTime, engine) {
        // 温度自然冷却
        const ambientTemp = 20;
        const coolingRate = this.material.heatCapacity * deltaTime;
        this.temperature += (ambientTemp - this.temperature) * coolingRate;

        // 检查自燃温度
        if (!this.burning && this.flammable && this.temperature >= this.material.ignitionPoint) {
            this.burning = true;
        }
    }

    /**
     * 应用力
     */
    applyForce(fx, fy) {
        this.accelerationX += fx / this.mass;
        this.accelerationY += fy / this.mass;
    }

    /**
     * 获取颜色（根据材质和状态）
     */
    getColor() {
        let color = this.material.color;
        
        // 根据温度调整颜色
        if (this.temperature > 100) {
            const heatRatio = Math.min(1, (this.temperature - 100) / 500);
            const r = Math.min(255, parseInt(color.slice(1, 3), 16) + 200 * heatRatio);
            const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 100 * heatRatio);
            const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 100 * heatRatio);
            color = `rgb(${r}, ${g}, ${b})`;
        }
        
        // 燃烧时显示火焰颜色
        if (this.burning) {
            const intensity = Math.sin(this.burnTime * 10) * 0.3 + 0.7;
            color = `rgb(255, ${Math.floor(100 * intensity)}, 0)`;
        }
        
        return color;
    }

    /**
     * 检查与另一个粒子的碰撞
     */
    checkCollision(otherParticle) {
        const dx = this.x - otherParticle.x;
        const dy = this.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.size + otherParticle.size;
        
        return distance < minDistance;
    }

    /**
     * 处理碰撞
     */
    handleCollision(otherParticle) {
        const dx = this.x - otherParticle.x;
        const dy = this.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const overlap = (this.size + otherParticle.size) - distance;
        const nx = dx / distance;
        const ny = dy / distance;
        
        // 分离粒子
        const separation = overlap * 0.5;
        this.x += nx * separation;
        this.y += ny * separation;
        otherParticle.x -= nx * separation;
        otherParticle.y -= ny * separation;
        
        // 更新网格位置
        this.gridX = Math.floor(this.x / GRID_SIZE);
        this.gridY = Math.floor(this.y / GRID_SIZE);
        otherParticle.gridX = Math.floor(otherParticle.x / GRID_SIZE);
        otherParticle.gridY = Math.floor(otherParticle.y / GRID_SIZE);
        
        // 动量交换（简化版本）
        const vx1 = this.velocityX;
        const vy1 = this.velocityY;
        const vx2 = otherParticle.velocityX;
        const vy2 = otherParticle.velocityY;
        
        const dotProduct = (vx2 - vx1) * nx + (vy2 - vy1) * ny;
        
        if (dotProduct > 0) return; // 粒子正在分离
        
        const impulse = 2 * dotProduct / (this.mass + otherParticle.mass);
        
        this.velocityX += impulse * otherParticle.mass * nx * this.material.bounce;
        this.velocityY += impulse * otherParticle.mass * ny * this.material.bounce;
        otherParticle.velocityX -= impulse * this.mass * nx * otherParticle.material.bounce;
        otherParticle.velocityY -= impulse * this.mass * ny * otherParticle.material.bounce;
        
        // 处理材质反应
        this.handleMaterialReaction(otherParticle);
    }

    /**
     * 处理材质反应
     */
    handleMaterialReaction(otherParticle) {
        const reaction = this.material.reactions?.[otherParticle.material.type];
        if (reaction) {
            switch (reaction.type) {
                case 'COMBUSTION':
                    if (!this.burning && this.flammable) {
                        this.burning = true;
                    }
                    if (!otherParticle.burning && otherParticle.flammable) {
                        otherParticle.burning = true;
                    }
                    break;
                    
                case 'EXTINGUISH':
                    if (this.burning) {
                        this.burning = false;
                        this.burnTime = 0;
                    }
                    if (otherParticle.burning) {
                        otherParticle.burning = false;
                        otherParticle.burnTime = 0;
                    }
                    break;
                    
                case 'TRANSFORM':
                    if (Math.random() < reaction.probability) {
                        this.material = reaction.resultMaterial;
                    }
                    if (Math.random() < reaction.probability) {
                        otherParticle.material = reaction.resultMaterial;
                    }
                    break;
                    
                case 'ELECTRICITY':
                    // 导电反应
                    if (this.conductive && otherParticle.conductive) {
                        // 传递电荷或激活电路
                    }
                    break;
            }
        }
    }
}

/**
 * 空间分割网格（优化碰撞检测）
 */
class SpatialGrid {
    constructor(gridSize, width, height) {
        this.gridSize = gridSize;
        this.cols = Math.ceil(width / gridSize);
        this.rows = Math.ceil(height / gridSize);
        this.grid = new Array(this.cols * this.rows).fill().map(() => []);
    }

    /**
     * 添加粒子到网格
     */
    add(particle) {
        const index = this.getIndex(particle.gridX, particle.gridY);
        if (index >= 0 && index < this.grid.length) {
            this.grid[index].push(particle);
        }
    }

    /**
     * 从网格移除粒子
     */
    remove(particle, oldGridX, oldGridY) {
        const oldIndex = this.getIndex(oldGridX, oldGridY);
        if (oldIndex >= 0 && oldIndex < this.grid.length) {
            const cell = this.grid[oldIndex];
            const particleIndex = cell.indexOf(particle);
            if (particleIndex > -1) {
                cell.splice(particleIndex, 1);
            }
        }
    }

    /**
     * 获取网格索引
     */
    getIndex(gridX, gridY) {
        if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
            return -1;
        }
        return gridY * this.cols + gridX;
    }

    /**
     * 获取粒子附近的粒子（3x3网格）
     */
    getNeighbors(particle) {
        const neighbors = [];
        const { gridX, gridY } = particle;
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const neighborX = gridX + dx;
                const neighborY = gridY + dy;
                const index = this.getIndex(neighborX, neighborY);
                
                if (index >= 0 && index < this.grid.length) {
                    neighbors.push(...this.grid[index]);
                }
            }
        }
        
        // 移除自身
        const selfIndex = neighbors.indexOf(particle);
        if (selfIndex > -1) {
            neighbors.splice(selfIndex, 1);
        }
        
        return neighbors;
    }

    /**
     * 清空网格
     */
    clear() {
        this.grid = new Array(this.cols * this.rows).fill().map(() => []);
    }
}

// 全局常量
const GRID_SIZE = 16; // 网格大小（像素）
const MAX_PARTICLES = 10000; // 最大粒子数

/**
 * 物理引擎主类
 */
export class PhysicsEngine {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.particles = new Map(); // 使用Map存储粒子
        this.spatialGrid = new SpatialGrid(GRID_SIZE, canvasWidth, canvasHeight);
        this.gravity = 9.8; // 重力加速度（像素/秒²）
        this.wind = 0; // 风力
        this.airResistance = 0.01; // 空气阻力
        this.subSteps = 3; // 子步数（提高模拟精度）
        this.timeScale = 1.0; // 时间缩放
        this.materials = new Map(); // 材质定义
        
        // 性能统计
        this.stats = {
            updateTime: 0,
            collisionChecks: 0,
            activeParticles: 0
        };
        
        this.lastUpdateTime = performance.now();
        
        // 初始化默认材质
        this.initDefaultMaterials();
    }

    /**
     * 初始化默认材质
     */
    initDefaultMaterials() {
        // 基础材质将在材质模块中定义
        // 这里只创建占位符
        this.addMaterial({
            type: 'SAND',
            name: '沙子',
            color: '#e9c46a',
            density: 1.5,
            friction: 0.8,
            bounce: 0.2,
            gravityMultiplier: 1.0,
            maxSpeed: 300,
            life: Infinity,
            flammable: false,
            conductive: false,
            magnetic: false,
            heatCapacity: 0.01
        });
    }

    /**
     * 添加材质定义
     */
    addMaterial(material) {
        this.materials.set(material.type, material);
    }

    /**
     * 获取材质
     */
    getMaterial(type) {
        return this.materials.get(type);
    }

    /**
     * 添加粒子
     */
    addParticle(particle) {
        if (this.particles.size >= MAX_PARTICLES) {
            console.warn('达到最大粒子数限制');
            return false;
        }
        
        this.particles.set(particle.id, particle);
        this.spatialGrid.add(particle);
        return true;
    }

    /**
     * 移除粒子
     */
    removeParticle(particleId) {
        const particle = this.particles.get(particleId);
        if (particle) {
            this.spatialGrid.remove(particle, particle.gridX, particle.gridY);
            this.particles.delete(particleId);
        }
    }

    /**
     * 批量添加粒子
     */
    addParticles(particles) {
        let added = 0;
        for (const particle of particles) {
            if (this.addParticle(particle)) {
                added++;
            } else {
                break;
            }
        }
        return added;
    }

    /**
     * 清空所有粒子
     */
    clear() {
        this.particles.clear();
        this.spatialGrid.clear();
        this.stats.activeParticles = 0;
    }

    /**
     * 更新物理引擎
     */
    update() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastUpdateTime) / 1000, 0.1); // 限制最大deltaTime
        
        if (deltaTime <= 0) return;
        
        const startTime = performance.now();
        
        // 使用子步提高模拟精度
        const subDelta = deltaTime / this.subSteps;
        for (let i = 0; i < this.subSteps; i++) {
            this.updateStep(subDelta);
        }
        
        // 移除死亡的粒子
        this.removeDeadParticles();
        
        // 更新统计信息
        this.stats.updateTime = performance.now() - startTime;
        this.stats.activeParticles = this.particles.size;
        this.lastUpdateTime = currentTime;
    }

    /**
     * 单步更新
     */
    updateStep(deltaTime) {
        const scaledDelta = deltaTime * this.timeScale;
        
        // 更新所有粒子
        const gridUpdates = [];
        this.particles.forEach(particle => {
            const updateInfo = particle.update(scaledDelta, this);
            if (updateInfo === false) {
                // 粒子死亡
                this.spatialGrid.remove(particle, particle.gridX, particle.gridY);
                this.particles.delete(particle.id);
            } else if (updateInfo.moved) {
                gridUpdates.push({
                    particle,
                    ...updateInfo
                });
            }
        });
        
        // 更新空间网格
        gridUpdates.forEach(({ particle, oldGridX, oldGridY, newGridX, newGridY }) => {
            this.spatialGrid.remove(particle, oldGridX, oldGridY);
            this.spatialGrid.add(particle);
        });
        
        // 处理碰撞
        this.handleCollisions();
    }

    /**
     * 处理碰撞检测
     */
    handleCollisions() {
        let collisionChecks = 0;
        
        this.particles.forEach(particle => {
            // 获取附近的粒子
            const neighbors = this.spatialGrid.getNeighbors(particle);
            collisionChecks += neighbors.length;
            
            // 检查碰撞
            for (const neighbor of neighbors) {
                if (particle.checkCollision(neighbor)) {
                    particle.handleCollision(neighbor);
                }
            }
        });
        
        this.stats.collisionChecks = collisionChecks;
    }

    /**
     * 移除死亡的粒子
     */
    removeDeadParticles() {
        const deadParticles = [];
        this.particles.forEach(particle => {
            if (particle.age >= particle.life) {
                deadParticles.push(particle.id);
            }
        });
        
        deadParticles.forEach(id => this.removeParticle(id));
    }

    /**
     * 应用力场
     */
    applyForceField(x, y, radius, forceX, forceY) {
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const forceFactor = 1 - (distance / radius);
                particle.applyForce(forceX * forceFactor, forceY * forceFactor);
            }
        });
    }

    /**
     * 应用爆炸
     */
    applyExplosion(x, y, radius, force) {
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const forceFactor = 1 - (distance / radius);
                const angle = Math.atan2(dy, dx);
                const fx = Math.cos(angle) * force * forceFactor;
                const fy = Math.sin(angle) * force * forceFactor;
                particle.applyForce(fx, fy);
            }
        });
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            totalParticles: this.particles.size,
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * 获取内存使用情况（估算）
     */
    getMemoryUsage() {
        const particleSize = 200; // 每个粒子大约占用的字节数（估算）
        return (this.particles.size * particleSize) / 1024 / 1024; // MB
    }

    /**
     * 设置重力
     */
    setGravity(gravity) {
        this.gravity = gravity;
    }

    /**
     * 设置风力
     */
    setWind(wind) {
        this.wind = wind;
    }

    /**
     * 设置时间缩放
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(5.0, scale));
    }

    /**
     * 调整画布大小
     */
    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.spatialGrid = new SpatialGrid(GRID_SIZE, width, height);
        
        // 重新添加所有粒子到新网格
        this.spatialGrid.clear();
        this.particles.forEach(particle => {
            // 确保粒子在边界内
            particle.x = Math.max(particle.size, Math.min(width - particle.size, particle.x));
            particle.y = Math.max(particle.size, Math.min(height - particle.size, particle.y));
            particle.gridX = Math.floor(particle.x / GRID_SIZE);
            particle.gridY = Math.floor(particle.y / GRID_SIZE);
            this.spatialGrid.add(particle);
        });
    }

    /**
     * 获取所有粒子（用于渲染）
     */
    getParticles() {
        return Array.from(this.particles.values());
    }

    /**
     * 获取粒子数量
     */
    getParticleCount() {
        return this.particles.size;
    }

    /**
     * 保存状态（用于游戏保存）
     */
    saveState() {
        const particlesData = [];
        this.particles.forEach(particle => {
            particlesData.push({
                x: particle.x,
                y: particle.y,
                material: particle.material.type,
                velocityX: particle.velocityX,
                velocityY: particle.velocityY,
                temperature: particle.temperature,
                burning: particle.burning,
                age: particle.age
            });
        });
        
        return {
            particles: particlesData,
            gravity: this.gravity,
            wind: this.wind,
            timeScale: this.timeScale
        };
    }

    /**
     * 加载状态
     */
    loadState(state) {
        this.clear();
        
        // 恢复设置
        this.gravity = state.gravity || 9.8;
        this.wind = state.wind || 0;
        this.timeScale = state.timeScale || 1.0;
        
        // 恢复粒子
        if (state.particles && Array.isArray(state.particles)) {
            state.particles.forEach((particleData, index) => {
                const material = this.getMaterial(particleData.material);
                if (material) {
                    const particle = new Particle(
                        particleData.x,
                        particleData.y,
                        material,
                        `loaded_${index}`
                    );
                    particle.velocityX = particleData.velocityX || 0;
                    particle.velocityY = particleData.velocityY || 0;
                    particle.temperature = particleData.temperature || 20;
                    particle.burning = particleData.burning || false;
                    particle.age = particleData.age || 0;
                    
                    this.addParticle(particle);
                }
            });
        }
    }
}

export default PhysicsEngine;