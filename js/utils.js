// 工具函数文件
// 这个文件包含了游戏中使用的各种通用函数和辅助方法

// 生成随机数（包含最小值，不包含最大值）
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// 生成随机整数（包含最小值和最大值）
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 概率检查（返回true的概率为probability）
function checkProbability(probability) {
    return Math.random() < probability;
}

// 格式化数字显示（例如：1000 -> 1k）
function formatNumber(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

// 计算伤害（考虑攻击、防御等因素）
function calculateDamage(attack, defense) {
    // 基础伤害计算
    let damage = Math.max(1, attack - defense * 0.5);
    
    // 添加一些随机性（85%到115%之间）
    const variance = getRandom(0.85, 1.15);
    damage = Math.floor(damage * variance);
    
    return damage;
}

// 检查暴击
function checkCritical(critRate) {
    return Math.random() < critRate;
}

// 应用暴击伤害
function applyCriticalDamage(baseDamage, critDamageMultiplier) {
    return Math.floor(baseDamage * critDamageMultiplier);
}

// 检查闪避
function checkDodge(dodgeRate) {
    return Math.random() < dodgeRate;
}

// 检查格挡
function checkBlock(blockRate) {
    return Math.random() < blockRate;
}

// 应用格挡减伤
function applyBlockDamage(damage, blockValue) {
    return Math.max(1, damage - blockValue);
}

// 深拷贝对象（简单实现）？是干嘛用的
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// 保存游戏数据到本地存储
function saveGame(gameData, saveKey = 'dragon3_game_save') {
    try {
        const serializedData = JSON.stringify(gameData);
        localStorage.setItem(saveKey, serializedData);
        return true;
    } catch (error) {
        console.error('保存游戏失败:', error);
        return false;
    }
}

// 保存数据到本地存储
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`保存数据到本地存储${key}失败:`, error);
        return false;
    }
}

// 从本地存储加载游戏数据
function loadGame(saveKey = 'dragon3_game_save') {
    try {
        const serializedData = localStorage.getItem(saveKey);
        if (serializedData === null) {
            return null;
        }
        return JSON.parse(serializedData);
    } catch (error) {
        console.error('加载游戏失败:', error);
        return null;
    }
}

// 从本地存储加载数据
function loadFromStorage(key) {
    try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error(`从本地存储加载${key}失败:`, error);
    }
    return null;
}

// 删除存档
function deleteSave(saveKey = 'dragon3_game_save') {
    try {
        localStorage.removeItem(saveKey);
        return true;
    } catch (error) {
        console.error('删除存档失败:', error);
        return false;
    }
}

// 根据品质获取颜色类名
function getQualityColorClass(quality) {
    const qualityMap = {
        0: 'quality-white',
        1: 'quality-green',
        2: 'quality-blue',
        3: 'quality-purple',
        4: 'quality-orange'
    };
    return qualityMap[quality] || 'quality-white';
}

// 根据品质获取名称
function getQualityName(quality) {
    const qualityMap = {
        0: '普通',
        1: '魔法',
        2: '稀有',
        3: '史诗',
        4: '传奇'
    };
    return qualityMap[quality] || '普通';
}

// 生成随机物品（根据品质权重）
function generateRandomItem() {
    // 获取物品库
    const allItems = window.gameItems || [];
    const equipmentItems = allItems.filter(item => item.type === 'equipment');
    
    if (equipmentItems.length === 0) return null;
    
    // 根据品质权重选择物品
    const weights = window.Constants?.LOOT_CONFIG?.QUALITY_WEIGHTS || {};
    let totalWeight = 0;
    
    // 创建品质权重映射
    const qualityMap = {};
    for (const item of equipmentItems) {
        if (!qualityMap[item.quality]) {
            qualityMap[item.quality] = [];
        }
        qualityMap[item.quality].push(item);
        totalWeight += weights[item.quality] || 1;
    }
    
    // 随机选择一个品质
    let randomWeight = Math.random() * totalWeight;
    let selectedQuality = 0;
    
    for (const quality in weights) {
        randomWeight -= weights[quality];
        if (randomWeight <= 0) {
            selectedQuality = parseInt(quality);
            break;
        }
    }
    
    // 从选定品质中随机选择一个物品
    const itemsOfQuality = qualityMap[selectedQuality] || [];
    if (itemsOfQuality.length === 0) {
        // 如果该品质没有物品，回退到白色品质
        return generateRandomItemOfQuality(0);
    }
    
    const randomIndex = Math.floor(Math.random() * itemsOfQuality.length);
    const selectedItemTemplate = itemsOfQuality[randomIndex];
    
    // 创建物品实例（深拷贝）
    const itemInstance = deepClone(selectedItemTemplate);
    
    // 生成随机ID
    itemInstance.instanceId = generateUniqueId();
    
    // 为装备添加随机词条（如果有额外属性配置）
    if (itemInstance.quality > 0 && window.itemAffixes) {
        addRandomAffixes(itemInstance);
    }
    
    return itemInstance;
}

// 为特定品质生成随机物品
function generateRandomItemOfQuality(quality) {
    const allItems = window.gameItems || [];
    const equipmentItems = allItems.filter(item => item.type === 'equipment' && item.quality === quality);
    
    if (equipmentItems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * equipmentItems.length);
    const selectedItemTemplate = equipmentItems[randomIndex];
    const itemInstance = deepClone(selectedItemTemplate);
    itemInstance.instanceId = generateUniqueId();
    
    return itemInstance;
}

// 为装备添加随机词条
function addRandomAffixes(item) {
    const affixes = window.itemAffixes || { prefixes: [], suffixes: [] };
    
    // 根据品质决定词条数量
    const affixCount = Math.min(item.quality, 3); // 最多3个词条
    
    // 尝试添加前缀
    const possiblePrefixes = affixes.prefixes.filter(p => p.minQuality <= item.quality);
    if (possiblePrefixes.length > 0 && Math.random() < 0.7) {
        const randomPrefix = possiblePrefixes[Math.floor(Math.random() * possiblePrefixes.length)];
        item.name = randomPrefix.name + ' ' + item.name;
        
        if (!item.extraStats) item.extraStats = [];
        item.extraStats.push({ stat: randomPrefix.stat, value: randomPrefix.value });
    }
    
    // 尝试添加后缀
    const possibleSuffixes = affixes.suffixes.filter(s => s.minQuality <= item.quality);
    if (possibleSuffixes.length > 0 && Math.random() < 0.6) {
        const randomSuffix = possibleSuffixes[Math.floor(Math.random() * possibleSuffixes.length)];
        item.name = item.name + ' of ' + randomSuffix.name;
        item.specialEffect = randomSuffix.effect;
    }
}

// 生成随机技能书
function generateRandomSkillBook() {
    const allItems = window.gameItems || [];
    const skillBooks = allItems.filter(item => item.type === 'skillBook');
    
    if (skillBooks.length === 0) return null;
    
    // 根据品质权重选择技能书
    const weights = window.Constants?.LOOT_CONFIG?.QUALITY_WEIGHTS || {};
    let totalWeight = 0;
    const qualityMap = {};
    
    for (const book of skillBooks) {
        if (!qualityMap[book.quality]) {
            qualityMap[book.quality] = [];
        }
        qualityMap[book.quality].push(book);
        totalWeight += weights[book.quality] || 1;
    }
    
    // 随机选择一个品质
    let randomWeight = Math.random() * totalWeight;
    let selectedQuality = 0;
    
    for (const quality in weights) {
        randomWeight -= weights[quality];
        if (randomWeight <= 0) {
            selectedQuality = parseInt(quality);
            break;
        }
    }
    
    // 从选定品质中随机选择一个技能书
    const booksOfQuality = qualityMap[selectedQuality] || [];
    if (booksOfQuality.length === 0) {
        // 如果该品质没有技能书，回退到绿色品质
        return generateRandomSkillBookOfQuality(1);
    }
    
    const randomIndex = Math.floor(Math.random() * booksOfQuality.length);
    const selectedBookTemplate = booksOfQuality[randomIndex];
    
    // 创建技能书实例
    const bookInstance = deepClone(selectedBookTemplate);
    bookInstance.instanceId = generateUniqueId();
    
    return bookInstance;
}

// 为特定品质生成随机技能书
function generateRandomSkillBookOfQuality(quality) {
    const allItems = window.gameItems || [];
    const skillBooks = allItems.filter(item => item.type === 'skillBook' && item.quality === quality);
    
    if (skillBooks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * skillBooks.length);
    const selectedBookTemplate = skillBooks[randomIndex];
    const bookInstance = deepClone(selectedBookTemplate);
    bookInstance.instanceId = generateUniqueId();
    
    return bookInstance;
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 获取技能对象
function getSkillById(skillId) {
    const allSkills = window.gameSkills || [];
    return allSkills.find(skill => skill.id === skillId) || null;
}

// 格式化战斗属性显示
function formatCombatStat(statName, value) {
    switch (statName) {
        case 'critRate':
        case 'dodgeRate':
        case 'blockRate':

        case 'cdr':
            return (value * 100).toFixed(1) + '%';
        case 'critDamage':
            return (value * 100).toFixed(0) + '%';
        case 'speed':
            return value.toFixed(2);
        default:
            return Math.floor(value).toString();
    }
}

// 工具函数导出
const Utils = {
    getRandom,
    getRandomInt,
    checkProbability,
    formatNumber,
    calculateDamage,
    checkCritical,
    applyCriticalDamage,
    checkDodge,
    checkBlock,
    applyBlockDamage,
    deepClone,
    saveGame,
    loadGame,
    saveToStorage,
    loadFromStorage,
    deleteSave,
    getQualityColorClass,
    getQualityName,
    generateRandomItem,
    generateRandomItemOfQuality,
    generateRandomSkillBook,
    generateRandomSkillBookOfQuality,
    generateUniqueId,
    getSkillById,
    formatCombatStat
};

// 挂载到window对象
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}