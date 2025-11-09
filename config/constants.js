// 游戏常量配置文件
// 这个文件包含了游戏中使用的所有常量和初始值配置

// 游戏中的品质等级
const ITEM_QUALITY = {
    WHITE: { name: '普通', color: 'quality-white', value: 0 },
    GREEN: { name: '魔法', color: 'quality-green', value: 1 },
    BLUE: { name: '稀有', color: 'quality-blue', value: 2 },
    PURPLE: { name: '史诗', color: 'quality-purple', value: 3 },
    ORANGE: { name: '传奇', color: 'quality-orange', value: 4 }
};

// 装备部位
const EQUIPMENT_SLOTS = {
    MAIN_HAND: 'mainHand',
    OFF_HAND: 'offHand',
    HELMET: 'helmet',
    CHEST: 'chest',
    BOOTS: 'boots',
    ACCESSORY1: 'accessory1',
    ACCESSORY2: 'accessory2',
    ACCESSORY3: 'accessory3',
    ACCESSORY4: 'accessory4'
};

// 装备部位中文名称映射
const SLOT_NAMES = {
    mainHand: '主手',
    offHand: '副手',
    helmet: '头盔',
    chest: '胸甲',
    boots: '靴子',
    accessory1: '饰品1',
    accessory2: '饰品2',
    accessory3: '饰品3',
    accessory4: '饰品4'
};

// 技能类型
const SKILL_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive'
};

// 角色基础属性名称
const BASE_STATS = {
    STRENGTH: 'strength',    // 力量
    AGILITY: 'agility',      // 敏捷
    INTELLIGENCE: 'intelligence',  // 智力
    STAMINA: 'stamina'       // 耐力
};

// 角色战斗属性计算公式
const COMBAT_STATS_FORMULAS = {
    // 攻击 = 基础攻击 + 力量 * 2
    attack: (baseAttack, stats) => baseAttack + (stats.strength * 2),
    
    // 魔力 = 基础魔力 + 智力 * 2
    magic: (baseMagic, stats) => baseMagic + (stats.intelligence * 2),
    
    // 攻速 = 基础攻速 + 敏捷 * 0.01
    speed: (baseSpeed, stats) => baseSpeed + (stats.agility * 0.01),
    
    // 暴击率 = 基础暴击率 + 敏捷 * 0.1%
    critRate: (baseCritRate, stats) => baseCritRate + (stats.agility * 0.001),
    
    // 暴击伤害 = 基础暴击伤害 + 敏捷 * 0.1%
    critDamage: (baseCritDamage, stats) => baseCritDamage + (stats.agility * 0.001),
    
    // 生命值 = 基础生命值 + 耐力 * 10
    hp: (baseHp, stats) => baseHp + (stats.stamina * 10),
    
    // 防御 = 基础防御 + 耐力 * 1
    defense: (baseDefense, stats) => baseDefense + (stats.stamina * 1),
    
    // 闪避率 = 基础闪避 + 敏捷 * 0.1%
    dodgeRate: (baseDodgeRate, stats) => baseDodgeRate + (stats.agility * 0.001),
    
    // 格挡率 = 基础格挡率 + 力量 * 0.1%
    blockRate: (baseBlockRate, stats) => baseBlockRate + (stats.strength * 0.001),
    
    // 格挡值 = 基础格挡值 + 力量 * 1
    blockValue: (baseBlockValue, stats) => baseBlockValue + (stats.strength * 1),
    

    
    // 技能冷却缩减 = 基础冷却缩减 + 智力 * 0.1%
    cdr: (baseCdr, stats) => baseCdr + (stats.intelligence * 0.001)
};

// 角色初始属性
const INITIAL_CHARACTER = {
    // 基础属性
    baseStats: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        stamina: 10
    },
    
    // 战斗基础值（不计算属性加成）
    baseCombatStats: {
        attack: 10,
        magic: 10,
        speed: 1.0,
        critRate: 0.01,
        critDamage: 1.0,
        hp: 100,
        defense: 10,
        dodgeRate: 0.01,
        blockRate: 0.01,
        blockValue: 10,
    
        cdr: 0
    },
    
    // 当前状态
    currentHp: 100,
    currentMp: 50,
    
    // 可用属性点
    availablePoints: 0,
    
    // 装备
    equipment: {
        mainHand: null,
        offHand: null,
        helmet: null,
        chest: null,
        boots: null,
        accessory1: null,
        accessory2: null,
        accessory3: null,
        accessory4: null
    },
    
    // 背包
    inventory: [],
    
    // 学习的技能
    learnedSkills: [],
    
    // 记忆栏位（已装备技能）
    memorySlots: [null, null, null, null, null],
    
    // 战斗胜场数
    wins: 0
};

// 战斗配置
const BATTLE_CONFIG = {
    // 每次胜利获得的属性点
    STAT_POINTS_PER_VICTORY: 3,
    
    // 战斗日志最大行数
    MAX_LOG_LINES: 20,
    
    // 战斗间隔（毫秒）
    BATTLE_TICK_INTERVAL: 100,
    
    // 技能释放概率基础值
    BASE_SKILL_PROBABILITY: 0.3
};

// 随机掉落配置
const LOOT_CONFIG = {
    // 基础掉落概率
    BASE_DROP_RATE: 0.7,
    
    // 品质掉落概率权重
    QUALITY_WEIGHTS: {
        [ITEM_QUALITY.WHITE.value]: 10,
        [ITEM_QUALITY.GREEN.value]: 5,
        [ITEM_QUALITY.BLUE.value]: 2,
        [ITEM_QUALITY.PURPLE.value]: 0.5,
        [ITEM_QUALITY.ORANGE.value]: 0.1
    },
    
    // 每次战斗可能掉落的物品数量范围
    LOOT_COUNT_RANGE: { min: 0, max: 3 }
};

// 导出所有常量供其他模块使用
const Constants = {
    ITEM_QUALITY,
    EQUIPMENT_SLOTS,
    SLOT_NAMES,
    SKILL_TYPES,
    BASE_STATS,
    COMBAT_STATS_FORMULAS,
    INITIAL_CHARACTER,
    BATTLE_CONFIG,
    LOOT_CONFIG
};

// 为了支持在浏览器中直接使用，将Constants挂载到window对象
if (typeof window !== 'undefined') {
    window.Constants = Constants;
}