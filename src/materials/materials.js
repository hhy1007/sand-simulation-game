/**
 * 材质系统模块
 * 游戏设计师实现：材质属性定义、化学反应规则、游戏平衡设计
 */

/**
 * 材质类型枚举
 */
export const MaterialType = {
    SAND: 'SAND',
    WATER: 'WATER',
    STONE: 'STONE',
    FIRE: 'FIRE',
    OIL: 'OIL',
    METAL: 'METAL',
    PLANT: 'PLANT',
    WOOD: 'WOOD',
    STEAM: 'STEAM',
    SMOKE: 'SMOKE',
    LAVA: 'LAVA',
    ICE: 'ICE',
    ACID: 'ACID',
    SALT: 'SALT',
    GUNPOWDER: 'GUNPOWDER',
    ELECTRICITY: 'ELECTRICITY'
};

/**
 * 化学反应类型
 */
export const ReactionType = {
    COMBUSTION: 'COMBUSTION',      // 燃烧
    EXTINGUISH: 'EXTINGUISH',      // 熄灭
    TRANSFORM: 'TRANSFORM',        // 转化
    DISSOLVE: 'DISSOLVE',          // 溶解
    ELECTRICITY: 'ELECTRICITY',    // 导电
    EXPLOSION: 'EXPLOSION',        // 爆炸
    FREEZE: 'FREEZE',              // 冻结
    MELT: 'MELT',                  // 融化
    NEUTRALIZE: 'NEUTRALIZE'       // 中和
};

/**
 * 基础材质定义
 */
export const BASE_MATERIALS = [
    // 沙子 - 基础材质
    {
        type: MaterialType.SAND,
        name: '沙子',
        description: '自然下落，形成沙堆',
        color: '#e9c46a',
        density: 1.5,              // 密度
        friction: 0.8,             // 摩擦力
        bounce: 0.2,               // 弹跳系数
        gravityMultiplier: 1.0,    // 重力乘数
        maxSpeed: 300,             // 最大速度
        life: Infinity,            // 生命周期
        flammable: false,          // 可燃性
        ignitionPoint: 1000,       // 燃点
        burnRate: 0.1,             // 燃烧速率
        maxBurnTime: 10,           // 最大燃烧时间
        burnResult: null,          // 燃烧产物
        conductive: false,         // 导电性
        magnetic: false,           // 磁性
        heatCapacity: 0.01,        // 热容量
        initialTemperature: 20,    // 初始温度
        reactions: {
            [MaterialType.WATER]: {
                type: ReactionType.TRANSFORM,
                probability: 0.01,
                resultMaterial: MaterialType.SALT,
                description: '沙子和水反应生成盐'
            },
            [MaterialType.LAVA]: {
                type: ReactionType.TRANSFORM,
                probability: 0.5,
                resultMaterial: MaterialType.STONE,
                description: '沙子被熔岩加热形成石头'
            }
        }
    },
    
    // 水 - 流体材质
    {
        type: MaterialType.WATER,
        name: '水',
        description: '流动扩散，寻找最低点',
        color: '#457b9d',
        density: 1.0,
        friction: 0.1,
        bounce: 0.05,
        gravityMultiplier: 1.0,
        maxSpeed: 200,
        life: Infinity,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: MaterialType.STEAM,
        conductive: true,
        magnetic: false,
        heatCapacity: 0.1,
        initialTemperature: 20,
        reactions: {
            [MaterialType.FIRE]: {
                type: ReactionType.EXTINGUISH,
                probability: 1.0,
                description: '水可以灭火'
            },
            [MaterialType.LAVA]: {
                type: ReactionType.TRANSFORM,
                probability: 0.8,
                resultMaterial: MaterialType.STONE,
                description: '水和熔岩反应生成石头'
            },
            [MaterialType.ACID]: {
                type: ReactionType.NEUTRALIZE,
                probability: 0.3,
                description: '水可以稀释酸'
            }
        }
    },
    
    // 石头 - 固体障碍物
    {
        type: MaterialType.STONE,
        name: '石头',
        description: '静止不动，作为障碍物',
        color: '#6c757d',
        density: 2.5,
        friction: 0.9,
        bounce: 0.1,
        gravityMultiplier: 1.0,
        maxSpeed: 50,
        life: Infinity,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: null,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.05,
        initialTemperature: 20,
        reactions: {
            [MaterialType.LAVA]: {
                type: ReactionType.TRANSFORM,
                probability: 0.1,
                resultMaterial: MaterialType.LAVA,
                description: '石头被熔岩熔化'
            },
            [MaterialType.ACID]: {
                type: ReactionType.DISSOLVE,
                probability: 0.05,
                description: '酸可以缓慢溶解石头'
            }
        }
    },
    
    // 火 - 能量材质
    {
        type: MaterialType.FIRE,
        name: '火',
        description: '向上燃烧，需要燃料',
        color: '#e63946',
        density: 0.1,
        friction: 0.0,
        bounce: 0.8,
        gravityMultiplier: -0.5,   // 负值表示向上
        maxSpeed: 500,
        life: 5,                   // 火焰有寿命
        flammable: true,
        ignitionPoint: 100,
        burnRate: 0.5,
        maxBurnTime: 3,
        burnResult: MaterialType.SMOKE,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.02,
        initialTemperature: 500,
        reactions: {
            [MaterialType.WATER]: {
                type: ReactionType.EXTINGUISH,
                probability: 1.0,
                description: '水可以灭火'
            },
            [MaterialType.WOOD]: {
                type: ReactionType.COMBUSTION,
                probability: 0.8,
                description: '火可以点燃木头'
            },
            [MaterialType.OIL]: {
                type: ReactionType.COMBUSTION,
                probability: 1.0,
                description: '火可以点燃油'
            },
            [MaterialType.GUNPOWDER]: {
                type: ReactionType.EXPLOSION,
                probability: 1.0,
                description: '火可以引爆炸药'
            }
        }
    },
    
    // 油 - 易燃流体
    {
        type: MaterialType.OIL,
        name: '油',
        description: '浮在水面，易燃',
        color: '#264653',
        density: 0.8,
        friction: 0.05,
        bounce: 0.1,
        gravityMultiplier: 0.7,
        maxSpeed: 150,
        life: Infinity,
        flammable: true,
        ignitionPoint: 300,
        burnRate: 0.3,
        maxBurnTime: 15,
        burnResult: MaterialType.SMOKE,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.03,
        initialTemperature: 20,
        reactions: {
            [MaterialType.FIRE]: {
                type: ReactionType.COMBUSTION,
                probability: 1.0,
                description: '油易燃'
            },
            [MaterialType.WATER]: {
                type: ReactionType.TRANSFORM,
                probability: 0,
                resultMaterial: MaterialType.OIL,
                description: '油浮在水上'
            }
        }
    },
    
    // 金属 - 导电材质
    {
        type: MaterialType.METAL,
        name: '金属',
        description: '导电，可被磁铁吸引',
        color: '#adb5bd',
        density: 7.8,
        friction: 0.7,
        bounce: 0.4,
        gravityMultiplier: 1.2,
        maxSpeed: 100,
        life: Infinity,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: null,
        conductive: true,
        magnetic: true,
        heatCapacity: 0.08,
        initialTemperature: 20,
        reactions: {
            [MaterialType.ACID]: {
                type: ReactionType.DISSOLVE,
                probability: 0.2,
                description: '酸可以腐蚀金属'
            },
            [MaterialType.ELECTRICITY]: {
                type: ReactionType.ELECTRICITY,
                probability: 1.0,
                description: '金属导电'
            }
        }
    },
    
    // 植物 - 生长材质
    {
        type: MaterialType.PLANT,
        name: '植物',
        description: '缓慢生长，吸收水分',
        color: '#2a9d8f',
        density: 0.6,
        friction: 0.6,
        bounce: 0.3,
        gravityMultiplier: 1.0,
        maxSpeed: 50,
        life: 30,                  // 植物有寿命
        flammable: true,
        ignitionPoint: 200,
        burnRate: 0.4,
        maxBurnTime: 8,
        burnResult: MaterialType.SMOKE,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.04,
        initialTemperature: 20,
        reactions: {
            [MaterialType.WATER]: {
                type: ReactionType.TRANSFORM,
                probability: 0.01,
                resultMaterial: MaterialType.PLANT,
                description: '植物吸收水分生长'
            },
            [MaterialType.FIRE]: {
                type: ReactionType.COMBUSTION,
                probability: 0.9,
                description: '植物易燃'
            }
        }
    },
    
    // 木头 - 可燃固体
    {
        type: MaterialType.WOOD,
        name: '木头',
        description: '可燃烧，提供燃料',
        color: '#8b4513',
        density: 0.7,
        friction: 0.7,
        bounce: 0.3,
        gravityMultiplier: 1.0,
        maxSpeed: 80,
        life: Infinity,
        flammable: true,
        ignitionPoint: 250,
        burnRate: 0.2,
        maxBurnTime: 20,
        burnResult: MaterialType.SMOKE,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.06,
        initialTemperature: 20,
        reactions: {
            [MaterialType.FIRE]: {
                type: ReactionType.COMBUSTION,
                probability: 0.95,
                description: '木头易燃'
            },
            [MaterialType.WATER]: {
                type: ReactionType.TRANSFORM,
                probability: 0.001,
                resultMaterial: MaterialType.PLANT,
                description: '湿润的木头可能长出植物'
            }
        }
    }
];

/**
 * 特殊材质定义
 */
export const SPECIAL_MATERIALS = [
    // 蒸汽
    {
        type: MaterialType.STEAM,
        name: '蒸汽',
        description: '水蒸发产生，向上飘散',
        color: '#a8dadc',
        density: 0.2,
        friction: 0.0,
        bounce: 0.9,
        gravityMultiplier: -0.3,
        maxSpeed: 100,
        life: 3,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: null,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.02,
        initialTemperature: 100
    },
    
    // 烟雾
    {
        type: MaterialType.SMOKE,
        name: '烟雾',
        description: '燃烧产物，向上飘散',
        color: '#495057',
        density: 0.3,
        friction: 0.0,
        bounce: 0.8,
        gravityMultiplier: -0.2,
        maxSpeed: 80,
        life: 5,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: null,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.015,
        initialTemperature: 80
    },
    
    // 熔岩
    {
        type: MaterialType.LAVA,
        name: '熔岩',
        description: '高温熔融岩石，缓慢流动',
        color: '#d62828',
        density: 3.0,
        friction: 0.4,
        bounce: 0.1,
        gravityMultiplier: 1.0,
        maxSpeed: 50,
        life: Infinity,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: MaterialType.STONE,
        conductive: true,
        magnetic: false,
        heatCapacity: 0.12,
        initialTemperature: 1200,
        reactions: {
            [MaterialType.WATER]: {
                type: ReactionType.EXPLOSION,
                probability: 0.5,
                description: '熔岩遇水爆炸'
            },
            [MaterialType.WOOD]: {
                type: ReactionType.COMBUSTION,
                probability: 1.0,
                description: '熔岩点燃木头'
            }
        }
    },
    
    // 冰
    {
        type: MaterialType.ICE,
        name: '冰',
        description: '冻结的水，遇热融化',
        color: '#caf0f8',
        density: 0.9,
        friction: 0.2,
        bounce: 0.4,
        gravityMultiplier: 1.0,
        maxSpeed: 30,
        life: Infinity,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: MaterialType.WATER,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.15,
        initialTemperature: -10,
        reactions: {
            [MaterialType.FIRE]: {
                type: ReactionType.MELT,
                probability: 1.0,
                description: '火融化冰'
            }
        }
    },
    
    // 酸
    {
        type: MaterialType.ACID,
        name: '酸',
        description: '腐蚀性液体，溶解其他材质',
        color: '#9ef01a',
        density: 1.2,
        friction: 0.1,
        bounce: 0.1,
        gravityMultiplier: 1.0,
        maxSpeed: 100,
        life: 10,                   // 酸会逐渐中和
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: MaterialType.WATER,
        conductive: true,
        magnetic: false,
        heatCapacity: 0.07,
        initialTemperature: 20,
        reactions: {
            [MaterialType.METAL]: {
                type: ReactionType.DISSOLVE,
                probability: 0.2,
                description: '酸腐蚀金属'
            },
            [MaterialType.STONE]: {
                type: ReactionType.DISSOLVE,
                probability: 0.05,
                description: '酸溶解石头'
            }
        }
    },
    
    // 盐
    {
        type: MaterialType.SALT,
        name: '盐',
        description: '沙子和水的产物',
        color: '#f8f9fa',
        density: 2.2,
        friction: 0.6,
        bounce: 0.3,
        gravityMultiplier: 1.0,
        maxSpeed: 100,
        life: Infinity,
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: null,
        conductive: true,
        magnetic: false,
        heatCapacity: 0.04,
        initialTemperature: 20
    },
    
    // 火药
    {
        type: MaterialType.GUNPOWDER,
        name: '火药',
        description: '遇火爆炸',
        color: '#343a40',
        density: 1.1,
        friction: 0.7,
        bounce: 0.2,
        gravityMultiplier: 1.0,
        maxSpeed: 80,
        life: Infinity,
        flammable: true,
        ignitionPoint: 150,
        burnRate: 1.0,
        maxBurnTime: 0.1,
        burnResult: MaterialType.SMOKE,
        conductive: false,
        magnetic: false,
        heatCapacity: 0.03,
        initialTemperature: 20,
        reactions: {
            [MaterialType.FIRE]: {
                type: ReactionType.EXPLOSION,
                probability: 1.0,
                description: '火药遇火爆炸'
            }
        }
    },
    
    // 电
    {
        type: MaterialType.ELECTRICITY,
        name: '电',
        description: '能量传导，激活电路',
        color: '#ffd60a',
        density: 0.0,
        friction: 0.0,
        bounce: 0.9,
        gravityMultiplier: 0.0,
        maxSpeed: 1000,
        life: 0.5,                  // 电很快消失
        flammable: false,
        ignitionPoint: Infinity,
        burnRate: 0,
        maxBurnTime: 0,
        burnResult: null,
        conductive: true,
        magnetic: false,
        heatCapacity: 0.01,
        initialTemperature: 50
    }
];

/**
 * 材质管理类
 */
export class MaterialManager {
    constructor() {
        this.materials = new Map();
        this.reactions = new Map();
        this.initMaterials();
        this.initReactions();
    }
    
    /**
     * 初始化所有材质
     */
    initMaterials() {
        // 添加基础材质
        BASE_MATERIALS.forEach(material => {
            this.addMaterial(material);
        });
        
        // 添加特殊材质
        SPECIAL_MATERIALS.forEach(material => {
            this.addMaterial(material);
        });
        
        console.log(`✅ 材质系统初始化完成，共加载 ${this.materials.size} 种材质`);
    }
    
    /**
     * 初始化化学反应
     */
    initReactions() {
        // 收集所有材质间的反应
        BASE_MATERIALS.forEach(material => {
            if (material.reactions) {
                Object.entries(material.reactions).forEach(([otherType, reaction]) => {
                    this.addReaction(material.type, otherType, reaction);
                });
            }
        });
        
        SPECIAL_MATERIALS.forEach(material => {
            if (material.reactions) {
                Object.entries(material.reactions).forEach(([otherType, reaction]) => {
                    this.addReaction(material.type, otherType, reaction);
                });
            }
        });
        
        console.log(`✅ 化学反应系统初始化完成`);
    }
    
    /**
     * 添加材质
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
     * 获取所有材质
     */
    getAllMaterials() {
        return Array.from(this.materials.values());
    }
    
    /**
     * 获取基础材质（用于UI显示）
     */
    getBaseMaterials() {
        return BASE_MATERIALS;
    }
    
    /**
     * 获取特殊材质
     */
    getSpecialMaterials() {
        return SPECIAL_MATERIALS;
    }
    
    /**
     * 添加反应
     */
    addReaction(materialTypeA, materialTypeB, reaction) {
        const key = this.getReactionKey(materialTypeA, materialTypeB);
        this.reactions.set(key, {
            materialA: materialTypeA,
            materialB: materialTypeB,
            ...reaction
        });
    }
    
    /**
     * 获取反应
     */
    getReaction(materialTypeA, materialTypeB) {
        const key1 = this.getReactionKey(materialTypeA, materialTypeB);
        const key2 = this.getReactionKey(materialTypeB, materialTypeA);
        
        return this.reactions.get(key1) || this.reactions.get(key2);
    }
    
    /**
     * 生成反应键
     */
    getReactionKey(typeA, typeB) {
        return `${typeA}_${typeB}`;
    }
    
    /**
     * 检查并执行反应
     */
    checkAndExecuteReaction(particleA, particleB, engine) {
        const reaction = this.getReaction(particleA.material.type, particleB.material.type);
        
        if (!reaction) return false;
        
        const probability = reaction.probability || 1.0;
        
        if (Math.random() < probability) {
            this.executeReaction(reaction, particleA, particleB, engine);
            return true;
        }
        
        return false;
    }
    
    /**
     * 执行反应
     */
    executeReaction(reaction, particleA, particleB, engine) {
        switch (reaction.type) {
            case ReactionType.COMBUSTION:
                // 点燃粒子
                if (!particleA.burning && particleA.flammable) {
                    particleA.burning = true;
                }
                if (!particleB.burning && particleB.flammable) {
                    particleB.burning = true;
                }
                break;
                
            case ReactionType.EXTINGUISH:
                // 熄灭火焰
                if (particleA.burning) {
                    particleA.burning = false;
                    particleA.burnTime = 0;
                }
                if (particleB.burning) {
                    particleB.burning = false;
                    particleB.burnTime = 0;
                }
                break;
                
            case ReactionType.TRANSFORM:
                // 材质转化
                if (reaction.resultMaterial) {
                    const newMaterial = this.getMaterial(reaction.resultMaterial);
                    if (newMaterial) {
                        particleA.material = newMaterial;
                        particleB.material = newMaterial;
                    }
                }
                break;
                
            case ReactionType.DISSOLVE:
                // 溶解反应，减少粒子寿命
                particleA.life *= 0.9;
                particleB.life *= 0.9;
                break;
                
            case ReactionType.EXPLOSION:
                // 爆炸反应
                const explosionX = (particleA.x + particleB.x) / 2;
                const explosionY = (particleA.y + particleB.y) / 2;
                const explosionRadius = 50 + Math.random() * 50;
                const explosionForce = 500 + Math.random() * 500;
                
                engine.applyExplosion(explosionX, explosionY, explosionRadius, explosionForce);
                
                // 移除爆炸粒子
                engine.removeParticle(particleA.id);
                engine.removeParticle(particleB.id);
                break;
                
            case ReactionType.ELECTRICITY:
                // 导电反应
                if (particleA.conductive && particleB.conductive) {
                    // 产生电火花
                    const sparkMaterial = this.getMaterial(MaterialType.ELECTRICITY);
                    if (sparkMaterial) {
                        const sparkParticle = new Particle(
                            (particleA.x + particleB.x) / 2,
                            (particleA.y + particleB.y) / 2,
                            sparkMaterial
                        );
                        engine.addParticle(sparkParticle);
                    }
                }
                break;
                
            case ReactionType.MELT:
                // 融化反应
                if (particleA.material.type === MaterialType.ICE) {
                    particleA.material = this.getMaterial(MaterialType.WATER);
                }
                if (particleB.material.type === MaterialType.ICE) {
                    particleB.material = this.getMaterial(MaterialType.WATER);
                }
                break;
                
            case ReactionType.NEUTRALIZE:
                // 中和反应
                particleA.life *= 0.8;
                particleB.life *= 0.8;
                break;
        }
        
        console.log(`🧪 发生反应: ${reaction.description || reaction.type}`);
    }
    
    /**
     * 获取材质描述
     */
    getMaterialDescription(type) {
        const material = this.getMaterial(type);
        return material ? material.description : '未知材质';
    }
    
    /**
     * 获取材质颜色
     */
    getMaterialColor(type) {
        const material = this.getMaterial(type);
        return material ? material.color : '#ffffff';
    }
    
    /**
     * 获取所有反应描述
     */
    getAllReactions() {
        const reactionsList = [];
        
        this.reactions.forEach(reaction => {
            reactionsList.push({
                materials: `${reaction.materialA} + ${reaction.materialB}`,
                type: reaction.type,
                description: reaction.description || '无描述',
                probability: reaction.probability || 1.0
            });
        });
        
        return reactionsList;
    }
    
    /**
     * 创建自定义材质
     */
    createCustomMaterial(config) {
        const defaultConfig = {
            density: 1.0,
            friction: 0.5,
            bounce: 0.3,
            gravityMultiplier: 1.0,
            maxSpeed: 200,
            life: Infinity,
            flammable: false,
            conductive: false,
            magnetic: false,
            heatCapacity: 0.05,
            initialTemperature: 20
        };
        
        const material = { ...defaultConfig, ...config };
        this.addMaterial(material);
        
        return material;
    }
}

// 导出默认实例
export const materialManager = new MaterialManager();

export default MaterialManager;