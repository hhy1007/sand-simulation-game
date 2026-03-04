/**
 * 工具函数模块
 * 辅助函数、工具类、通用功能
 */

/**
 * 生成随机ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 限制数值范围
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 线性插值
 */
export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * 映射数值范围
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * 生成随机整数
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成随机浮点数
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 计算两点间距离
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算角度（弧度）
 */
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间
 */
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
            arr[i] = deepClone(item);
            return arr;
        }, []);
    }
    
    if (typeof obj === 'object') {
        return Object.keys(obj).reduce((newObj, key) => {
            newObj[key] = deepClone(obj[key]);
            return newObj;
        }, {});
    }
}

/**
 * 合并对象
 */
export function mergeObjects(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            mergeObjects(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

/**
 * 颜色工具类
 */
export class ColorUtils {
    /**
     * 十六进制转RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    /**
     * RGB转十六进制
     */
    static rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    /**
     * 调整颜色亮度
     */
    static adjustBrightness(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const adjust = (value) => {
            const newValue = value + (value * percent / 100);
            return Math.max(0, Math.min(255, Math.round(newValue)));
        };
        
        return this.rgbToHex(
            adjust(rgb.r),
            adjust(rgb.g),
            adjust(rgb.b)
        );
    }
    
    /**
     * 生成随机颜色
     */
    static randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }
    
    /**
     * 计算颜色对比度
     */
    static getContrastRatio(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 1;
        
        const luminance1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const luminance2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    /**
     * 计算亮度
     */
    static getLuminance(r, g, b) {
        const sRGB = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }
}

/**
 * 数学工具类
 */
export class MathUtils {
    /**
     * 生成正态分布随机数
     */
    static normalRandom(mean = 0, stdDev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * stdDev + mean;
    }
    
    /**
     * 计算平均值
     */
    static mean(numbers) {
        if (numbers.length === 0) return 0;
        const sum = numbers.reduce((a, b) => a + b, 0);
        return sum / numbers.length;
    }
    
    /**
     * 计算标准差
     */
    static standardDeviation(numbers) {
        if (numbers.length === 0) return 0;
        const mean = this.mean(numbers);
        const squareDiffs = numbers.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        const avgSquareDiff = this.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }
    
    /**
     * 计算中位数
     */
    static median(numbers) {
        if (numbers.length === 0) return 0;
        
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        
        return sorted[middle];
    }
    
    /**
     * 线性回归
     */
    static linearRegression(x, y) {
        const n = x.length;
        
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumXX += x[i] * x[i];
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }
}

/**
 * 性能监控类
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTime = performance.now();
    }
    
    /**
     * 开始测量
     */
    start(label) {
        this.metrics.set(label, {
            start: performance.now(),
            end: null,
            duration: null
        });
    }
    
    /**
     * 结束测量
     */
    end(label) {
        const metric = this.metrics.get(label);
        if (metric) {
            metric.end = performance.now();
            metric.duration = metric.end - metric.start;
        }
    }
    
    /**
     * 获取测量结果
     */
    getResult(label) {
        return this.metrics.get(label)?.duration || 0;
    }
    
    /**
     * 获取所有结果
     */
    getAllResults() {
        const results = {};
        this.metrics.forEach((value, key) => {
            results[key] = value.duration;
        });
        return results;
    }
    
    /**
     * 重置所有测量
     */
    reset() {
        this.metrics.clear();
        this.startTime = performance.now();
    }
    
    /**
     * 获取总运行时间
     */
    getTotalTime() {
        return performance.now() - this.startTime;
    }
}

/**
 * 本地存储工具
 */
export class StorageUtils {
    static prefix = 'sand_sim_';
    
    /**
     * 保存数据
     */
    static save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }
    
    /**
     * 加载数据
     */
    static load(key) {
        try {
            const serialized = localStorage.getItem(this.prefix + key);
            if (serialized === null) {
                return null;
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('加载数据失败:', error);
            return null;
        }
    }
    
    /**
     * 删除数据
     */
    static remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }
    
    /**
     * 清空所有数据
     */
    static clear() {
        try {
            // 只清除以prefix开头的数据
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }
    
    /**
     * 获取所有键
     */
    static getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }
}

/**
 * URL参数工具
 */
export class UrlUtils {
    /**
     * 获取URL参数
     */
    static getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    /**
     * 设置URL参数
     */
    static setQueryParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }
    
    /**
     * 移除URL参数
     */
    static removeQueryParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }
    
    /**
     * 获取所有URL参数
     */
    static getAllQueryParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        
        return params;
    }
}

/**
 * 动画工具类
 */
export class AnimationUtils {
    /**
     * 缓动函数
     */
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    static easeInOutBack(t) {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    }
    
    /**
     * 动画帧请求
     */
    static animate(options) {
        const {
            duration = 1000,
            update,
            easing = this.easeInOutQuad,
            onComplete
        } = options;
        
        const startTime = performance.now();
        let animationFrame;
        
        const animateFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            
            update(easedProgress);
            
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animateFrame);
            } else {
                if (onComplete) onComplete();
            }
        };
        
        animationFrame = requestAnimationFrame(animateFrame);
        
        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }
}

/**
 * 错误处理工具
 */
export class ErrorHandler {
    static logError(error, context = {}) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            error: error.toString(),
            stack: error.stack,
            context: context
        };
        
        console.error('应用程序错误:', errorInfo);
        
        // 可以在这里添加错误上报逻辑
        // 例如：发送到服务器、记录到本地存储等
        
        return errorInfo;
    }
    
    static tryCatch(fn, errorHandler = this.logError) {
        return function(...args) {
            try {
                return fn.apply(this, args);
            } catch (error) {
                errorHandler(error, { function: fn.name, arguments: args });
                throw error;
            }
        };
    }
}

export default {
    generateId,
    clamp,
    lerp,
    map,
    randomInt,
    randomFloat,
    distance,
    angle,
    formatFileSize,
    formatTime,
    debounce,
    throttle,
    deepClone,
    mergeObjects,
    ColorUtils,
    MathUtils,
    PerformanceMonitor,
    StorageUtils,
    UrlUtils,
    AnimationUtils,
    ErrorHandler
};