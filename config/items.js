// 装备配置文件
// 这个文件定义了游戏中所有可获得的装备

// 装备数据
const items = [
    // 白色品质装备
    {
        id: 'wooden_sword',
        name: '木剑',
        type: 'equipment',
        slot: 'mainHand',
        quality: 0, // 白色品质
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            attack: 5
        },
        description: '一把简单的木剑，攻击力较低'
    },
    {
        id: 'leather_armor',
        name: '皮甲',
        type: 'equipment',
        slot: 'chest',
        quality: 0,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            defense: 3,
            hp: 10
        },
        description: '基本的皮革护甲'
    },
    {
        id: 'cloth_boots',
        name: '布鞋',
        type: 'equipment',
        slot: 'boots',
        quality: 0,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            speed: 0.05
        },
        description: '舒适的布制鞋子'
    },
    
    // 药水物品
    {        id: 'small_healing_potion',
        name: '小型治疗药水',
        type: 'consumable',
        quality: 0,
        canEquip: false,
        canUse: true,
        canDrop: true,
        healAmount: 30,
        description: '恢复30点生命值'
    },
    {
        id: 'medium_healing_potion',
        name: '中型治疗药水',
        type: 'consumable',
        quality: 1,
        canEquip: false,
        canUse: true,
        canDrop: true,
        healAmount: 60,
        description: '恢复60点生命值'
    },
    {
        id: 'large_healing_potion',
        name: '大型治疗药水',
        type: 'consumable',
        quality: 2,
        canEquip: false,
        canUse: true,
        canDrop: true,
        healAmount: 100,
        description: '恢复100点生命值'
    },
    {
        id: 'greater_healing_potion',
        name: '强效治疗药水',
        type: 'consumable',
        quality: 3,
        canEquip: false,
        canUse: true,
        canDrop: true,
        healAmount: 150,
        description: '恢复150点生命值'
    },
    
    // 绿色品质装备
    {
        id: 'iron_sword',
        name: '铁剑',
        type: 'equipment',
        slot: 'mainHand',
        quality: 1,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            attack: 12
        },
        extraStats: [
            { stat: 'critRate', value: 0.02 }
        ],
        description: '坚固的铁剑，有一定几率暴击'
    },
    {
        id: 'steel_shield',
        name: '钢盾',
        type: 'equipment',
        slot: 'offHand',
        quality: 1,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            defense: 8,
            blockRate: 0.05
        },
        description: '提供良好防御的钢盾'
    },
    {
        id: 'magic_hat',
        name: '魔法帽',
        type: 'equipment',
        slot: 'helmet',
        quality: 1,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            magic: 8,
            intelligence: 2
        },
        description: '增强魔法能力的帽子'
    },
      
     // 蓝色品质装备
     {
         id: 'blood_drain_blade',
         name: '吸血之刃',
         type: 'equipment',
         slot: 'mainHand',
         quality: 2,
         canEquip: true,
         canUse: false,
         canDrop: true,
         baseStats: {
             attack: 15,
             magic: 5
         },
         extraStats: [
             { stat: 'attack', value: 8 },
             { stat: 'critRate', value: 0.05 }
         ],
         specialAttributes: {
             lifesteal: 0.15
         },
         description: '邪恶的武器，攻击敌人时能吸取他们的生命精华'
     },
    {
        id: 'flame_sword',
        name: '火焰剑',
        type: 'equipment',
        slot: 'mainHand',
        quality: 2,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            attack: 20
        },
        extraStats: [
            { stat: 'attack', value: 5 },
            { stat: 'critDamage', value: 0.1 }
        ],
        specialEffect: 'fire_damage',
        description: '剑身缠绕着火焰的神奇武器'
    },
    {
        id: 'plate_armor',
        name: '板甲',
        type: 'equipment',
        slot: 'chest',
        quality: 2,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            defense: 15,
            hp: 50
        },
        extraStats: [
            { stat: 'blockValue', value: 10 }
        ],
        description: '厚重的板甲，提供出色的防御'
    },
    {
        id: 'quick_boots',
        name: '疾风靴',
        type: 'equipment',
        slot: 'boots',
        quality: 2,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            speed: 0.2,
            dodgeRate: 0.05
        },
        description: '让穿戴者行动如风的靴子'
    },
    
    // 紫色品质装备
    {
        id: 'thunder_blade',
        name: '雷霆之刃',
        type: 'equipment',
        slot: 'mainHand',
        quality: 3,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            attack: 35
        },
        extraStats: [
            { stat: 'attack', value: 10 },
            { stat: 'critRate', value: 0.08 },
            { stat: 'speed', value: 0.1 }
        ],
        specialEffect: 'thunder_damage',
        description: '蕴含雷电之力的强大武器'
    },
    {
        id: 'divine_shield',
        name: '神圣护盾',
        type: 'equipment',
        slot: 'offHand',
        quality: 3,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            defense: 25,
            blockRate: 0.15,
            hp: 100
        },
        specialEffect: 'holy_protection',
        description: '散发神圣光芒的护盾'
    },
    {
        id: 'wizard_hat',
        name: '巫师帽',
        type: 'equipment',
        slot: 'helmet',
        quality: 3,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            magic: 30,
            intelligence: 10
        },
        extraStats: [
            { stat: 'cdr', value: 0.15 }
        ],
        description: '高级巫师所佩戴的魔法帽子'
    },
    
    // 橙色品质装备
    {
        id: 'dragon_slayer',
        name: '屠龙剑',
        type: 'equipment',
        slot: 'mainHand',
        quality: 4,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            attack: 60
        },
        extraStats: [
            { stat: 'attack', value: 20 },
            { stat: 'critRate', value: 0.15 },
            { stat: 'critDamage', value: 0.3 },
            { stat: 'strength', value: 15 }
        ],
        specialEffect: 'dragon_bane',
        description: '传说中能屠龙的神器'
    },
    {
        id: 'eternal_armor',
        name: '永恒护甲',
        type: 'equipment',
        slot: 'chest',
        quality: 4,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            defense: 50,
            hp: 200,
    
        },
        extraStats: [
            { stat: 'blockRate', value: 0.2 },
            { stat: 'blockValue', value: 30 },

        ],
        specialEffect: 'eternal_protection',
        description: '近乎不朽的神奇护甲'
    },
    {
        id: 'angel_wings',
        name: '天使之翼',
        type: 'equipment',
        slot: 'accessory1',
        quality: 4,
        canEquip: true,
        canUse: false,
        canDrop: true,
        baseStats: {
            speed: 0.5,
            dodgeRate: 0.2
        },
        extraStats: [
            { stat: 'allStats', value: 10 },
            { stat: 'hp', value: 150 }
        ],
        specialEffect: 'angel_bless',
        description: '传说中天使遗留的翅膀'
    },
    
    // 技能书
    {
        id: 'skill_book_slash',
        name: '技能书：横扫千军',
        type: 'skillBook',
        skillId: 'slash',
        quality: 1,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '学习主动技能：横扫千军'
    },
    {
        id: 'skill_book_fireball',
        name: '技能书：火球术',
        type: 'skillBook',
        skillId: 'fireball',
        quality: 1,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '学习主动技能：火球术'
    },
    {
        id: 'skill_book_heal',
        name: '技能书：治疗术',
        type: 'skillBook',
        skillId: 'heal',
        quality: 1,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '学习主动技能：治疗术'
    },
    {
        id: 'skill_book_critical',
        name: '技能书：致命一击',
        type: 'skillBook',
        skillId: 'critical',
        quality: 1,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '学习被动技能：致命一击'
    },
    {
        id: 'skill_book_shield_master',
        name: '技能书：盾牌大师',
        type: 'skillBook',
        skillId: 'shield_master',
        quality: 2,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '学习被动技能：盾牌大师'
    },
    
    // 背包扩展物品
    {
        id: 'small_backpack',
        name: '小型背包',
        type: 'consumable',
        quality: 1,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '增加8个背包格子',
        backpackSlotsBonus: 8
    },
    {
        id: 'medium_backpack',
        name: '中型背包',
        type: 'consumable',
        quality: 2,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '增加12个背包格子',
        backpackSlotsBonus: 12
    },
    {
        id: 'large_backpack',
        name: '大型背包',
        type: 'consumable',
        quality: 3,
        canEquip: false,
        canUse: true,
        canDrop: true,
        description: '增加20个背包格子',
        backpackSlotsBonus: 20
    }
];

// 装备词条配置
const itemAffixes = {
    // 前缀（提升主属性）
    prefixes: [
        { name: '坚固的', stat: 'defense', value: 5, minQuality: 1 },
        { name: '锋利的', stat: 'attack', value: 5, minQuality: 1 },
        { name: '敏捷的', stat: 'speed', value: 0.1, minQuality: 1 },
        { name: '强壮的', stat: 'strength', value: 3, minQuality: 1 },
        { name: '智慧的', stat: 'intelligence', value: 3, minQuality: 1 },

        { name: '精准的', stat: 'critRate', value: 0.05, minQuality: 2 },
        { name: '致命的', stat: 'critDamage', value: 0.1, minQuality: 2 },
        { name: '神圣的', stat: 'hp', value: 50, minQuality: 3 },
        { name: '传奇的', stat: 'allStats', value: 5, minQuality: 4 }
    ],
    
    // 后缀（特殊效果）
    suffixes: [
        { name: '火焰', effect: 'fire_damage', minQuality: 2 },
        { name: '冰霜', effect: 'ice_damage', minQuality: 2 },
        { name: '雷电', effect: 'thunder_damage', minQuality: 3 },
        { name: '吸血', effect: 'lifesteal', minQuality: 2 },
        { name: '守护', effect: 'damage_reduction', minQuality: 2 },
        { name: '速度', effect: 'attack_speed', minQuality: 2 },
        { name: '闪避', effect: 'dodge_bonus', minQuality: 2 },
        { name: '格挡', effect: 'block_bonus', minQuality: 2 },
        { name: '幸运', effect: 'luck_bonus', minQuality: 3 },
        { name: '永恒', effect: 'eternal_blessing', minQuality: 4 }
    ]
};

// 特殊效果描述
const specialEffects = {
    fire_damage: '攻击时有20%几率造成额外的火焰伤害',
    ice_damage: '攻击时有15%几率冰冻敌人，减缓其攻击速度',
    thunder_damage: '攻击时有10%几率麻痹敌人，使其无法攻击',
    lifesteal: '将造成伤害的5%转化为生命值',
    damage_reduction: '受到的伤害降低10%',
    attack_speed: '攻击速度提升15%',
    dodge_bonus: '闪避率提升10%',
    block_bonus: '格挡率提升10%，格挡值提升20%',
    luck_bonus: '提升所有物品掉落几率',
    dragon_bane: '对龙类敌人造成200%伤害',
    holy_protection: '受到伤害时有5%几率完全免疫',
    eternal_protection: '每30秒获得一个吸收伤害的护盾',
    angel_bless: '战斗开始时获得神圣祝福，提升所有属性10%',
    eternal_blessing: '装备者不会被一击必杀'
};

// 将items数据挂载到window对象供其他模块使用
if (typeof window !== 'undefined') {
    window.gameItems = items;
    window.itemAffixes = itemAffixes;
    window.specialEffects = specialEffects;
}