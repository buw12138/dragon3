// 技能配置文件
// 这个文件定义了游戏中所有可学习和使用的技能

// 技能数据
const skills = [
    // 主动技能
    {
        id: 'slash',
        name: '横扫千军',
        type: 'active',
        description: '对敌人造成150%攻击力的伤害',
        requirements: {intelligence: 5}, // 智力达到5才能学习
        // 技能效果函数，在战斗系统中调用
        effect: (user, target) => {
            // 计算基础伤害
            let damage = user.combatStats.attack * 1.5;
            
            // 应用伤害波动范围
            const damageVariance = Number(user.combatStats?.damageVariance) || 0.1;
            const varianceMultiplier = 1 + (Math.random() - 0.5) * 2 * damageVariance;
            damage = damage * varianceMultiplier;
            
            // 应用伤害
            const actualDamage = target.takeDamage(damage, '物理');
            
            return { 
                message: `${user.name} 使用了横扫千军，对 ${target.name} 造成了 ${Math.floor(actualDamage)} 点伤害！`,
                actualDamage: actualDamage
            };
        },
        // 技能使用条件
        canUse: (user) => {
            // 这个技能不需要消耗魔力或体力
            return true;
        },
        // 释放概率基础值
        baseProbability: 0.2
    },
    {
        id: 'fireball',
        name: '火球术',
        type: 'active',
        description: '投掷一个火球，造成180%魔力的伤害',
        requirements: { intelligence: 15 }, // 需要15点智力
        effect: (user, target) => {
            // 计算基础伤害
            let damage = user.combatStats.magic * 1.8;
            
            // 应用伤害波动范围
            const damageVariance = Number(user.combatStats?.damageVariance) || 0.1;
            const varianceMultiplier = 1 + (Math.random() - 0.5) * 2 * damageVariance;
            damage = damage * varianceMultiplier;
            
            // 应用伤害
            const actualDamage = target.takeDamage(damage, '魔法');
            
            return { 
                message: `${user.name} 释放了火球术，对 ${target.name} 造成了 ${Math.floor(actualDamage)} 点魔法伤害！`,
                damageType: 'fire',
                actualDamage: actualDamage
            };
        },
        canUse: (user) => {
            // 消耗一定魔力
            return user.currentMp >= 20;
        },
        baseProbability: 0.15,
        mpCost: 20
    },
    {
        id: 'heal',
        name: '治疗术',
        type: 'active',
        description: '恢复自身最大生命值20%的血量',
        requirements: { intelligence: 5 }, // 需要5点智力
        effect: (user, target) => {
            const healAmount = Math.floor(user.combatStats.hp * 0.2);
            const actualHeal = user.heal(healAmount);
            return { 
                message: `${user.name} 使用了治疗术，恢复了 ${actualHeal} 点生命值！`,
                healAmount: actualHeal
            };
        },
        canUse: (user) => {
            // 消耗魔力且生命值未满
            return user.currentMp >= 15 && user.currentHp < user.combatStats.hp;
        },
        baseProbability: 0.25,
        mpCost: 15
    },
    {
        id: 'thunder_strike',
        name: '雷击',
        type: 'active',
        description: '召唤雷电攻击敌人，造成200%魔力的伤害，并可能使其麻痹',
        requirements: { intelligence: 25 }, // 需要25点智力
        effect: (user, target) => {
            // 计算基础伤害
            let damage = user.combatStats.magic * 2.0;
            
            // 应用伤害波动范围
            const damageVariance = Number(user.combatStats?.damageVariance) || 0.1;
            const varianceMultiplier = 1 + (Math.random() - 0.5) * 2 * damageVariance;
            damage = damage * varianceMultiplier;
            
            // 应用伤害
            const actualDamage = target.takeDamage(damage, '魔法');
            
            // 30%几率使敌人麻痹
            if (Math.random() < 0.3) {
                target.addStatusEffect('paralyzed', 2000); // 麻痹2秒
                return { 
                    message: `${user.name} 召唤了雷击，对 ${target.name} 造成了 ${Math.floor(actualDamage)} 点魔法伤害，并使其麻痹！`,
                    damageType: 'thunder',
                    statusEffect: 'paralyzed',
                    actualDamage: actualDamage
                };
            }
            
            return { 
                message: `${user.name} 召唤了雷击，对 ${target.name} 造成了 ${Math.floor(actualDamage)} 点魔法伤害！`,
                damageType: 'thunder',
                actualDamage: actualDamage
            };
        },
        canUse: (user) => {
            return user.currentMp >= 30;
        },
        baseProbability: 0.1,
        mpCost: 30
    },
    {
        id: 'whirlwind',
        name: '旋风斩',
        type: 'active',
        description: '旋转攻击周围敌人，造成120%攻击力的伤害',
        requirements: { strength: 20 }, // 需要20点力量
        effect: (user, target) => {
            let damage = user.combatStats.attack * 1.2;
            
            // 应用伤害波动
            const damageVariance = user.combatStats.damageVariance || 0.1;
            const varianceMultiplier = 1 + (Math.random() - 0.5) * 2 * damageVariance;
            damage = damage * varianceMultiplier;
            
            // 应用伤害
            const actualDamage = target.takeDamage(damage, '物理');
            
            // 可以攻击多个目标（在当前版本简化为单体）
            return { 
                message: `${user.name} 使用了旋风斩，对 ${target.name} 造成了 ${Math.floor(actualDamage)} 点伤害！`,
                actualDamage: actualDamage
            };
        },
        canUse: (user) => {
            // 不再消耗体力
        return true;
        },
        baseProbability: 0.18,

    },
    
    // 被动技能
    {
        id: 'critical',
        name: '致命一击',
        type: 'passive',
        description: '增加10%暴击率和20%暴击伤害',
        requirements: {intelligence: 15},
        // 被动技能效果在计算战斗属性时应用
        statModifiers: {
            critRate: 0.1,
            critDamage: 0.2
        }
    },
    {
        id: 'shield_master',
        name: '盾牌大师',
        type: 'passive',
        description: '装备盾牌时，格挡率提升15%，格挡值提升30%',
        requirements: {intelligence: 15},
        // 这个被动效果需要特殊判断是否装备盾牌
        equipmentBasedModifiers: {
            offHand: {
                blockRate: 0.15,
                blockValue: 30
            }
        }
    },
    {
        id: 'evasion_master',
        name: '闪避大师',
        type: 'passive',
        description: '闪避率提升10%，闪避成功后下次攻击必定暴击',
        requirements: { agility: 30 },
        statModifiers: {
            dodgeRate: 0.1
        },
        // 特殊效果在战斗系统中处理
        specialEffect: 'evasion_crit'
    },
    {
        id: 'mana_efficiency',
        name: '魔力效率',
        type: 'passive',
        description: '所有魔法技能的魔力消耗减少20%',
        requirements: { intelligence: 25 },
        statModifiers: {
            mpCostReduction: 0.2
        }
    },
    {
        id: 'vampirism',
        name: '吸血鬼之触',
        type: 'passive',
        description: '攻击时将造成伤害的5%转化为自己的生命值',
        requirements: {},
        specialEffect: 'lifesteal'
    },
    {
        id: 'toughness',
        name: '坚韧不拔',
        type: 'passive',
        description: '最大生命值提升15%，受到的暴击伤害减少20%',
        requirements: {}, // 移除体力需求
        statModifiers: {
            hp: 0.15,
            critDamageTaken: -0.2
        }
    },
    {
        id: 'quick_attack',
        name: '快速攻击',
        type: 'passive',
        description: '攻击速度提升20%',
        requirements: { agility: 20 },
        statModifiers: {
            speed: 0.2
        }
    },
    {
        id: 'battle_focus',
        name: '战斗专注',
        type: 'passive',
        description: '战斗开始时，攻击力和魔力提升10%，持续10秒',
        requirements: {},
        specialEffect: 'battle_start_buff'
    },
    {
        id: 'elemental_mastery',
        name: '元素精通',
        type: 'passive',
        description: '所有元素伤害提升30%',
        requirements: { intelligence: 40 },
        specialEffect: 'elemental_damage_bonus'
    },
    {
        id: 'second_wind',
        name: '第二次风',
        type: 'passive',
        description: '生命值低于30%时，攻击速度提升50%，持续5秒，每场战斗只能触发一次',
        requirements: {},
        specialEffect: 'low_health_buff'
    }
];

// 状态效果配置
const statusEffects = {
    poisoned: {
        name: '中毒',
        description: '每秒受到最大生命值2%的伤害，持续5秒',
        duration: 5000,
        tickInterval: 1000,
        onTick: (target) => {
            const damage = Math.floor(target.combatStats.hp * 0.02);
            target.takeDamage(damage, '毒素');
            return `中毒造成 ${damage} 点伤害`;
        }
    },
    burned: {
        name: '燃烧',
        description: '每秒受到攻击力10%的伤害，持续3秒',
        duration: 3000,
        tickInterval: 1000,
        onTick: (target) => {
            const damage = Math.floor(target.combatStats.attack * 0.1);
            target.takeDamage(damage, '火焰');
            return `燃烧造成 ${damage} 点伤害`;
        }
    },
    frozen: {
        name: '冰冻',
        description: '无法攻击，持续2秒',
        duration: 2000,
        onApply: (target) => {
            target.canAttack = false;
        },
        onRemove: (target) => {
            target.canAttack = true;
        }
    },
    paralyzed: {
        name: '麻痹',
        description: '50%几率无法攻击，持续3秒',
        duration: 3000,
        specialEffect: 'attack_chance_reduction',
        attackChanceMultiplier: 0.5
    },
    stunned: {
        name: '眩晕',
        description: '无法攻击和移动，持续1秒',
        duration: 1000,
        onApply: (target) => {
            target.canAttack = false;
        },
        onRemove: (target) => {
            target.canAttack = true;
        }
    },
    buffed: {
        name: '增益',
        description: '攻击力提升20%，持续10秒',
        duration: 10000,
        statModifiers: {
            attack: 0.2
        }
    },
    debuffed: {
        name: '减益',
        description: '防御力降低20%，持续8秒',
        duration: 8000,
        statModifiers: {
            defense: -0.2
        }
    }
};

// 将技能数据挂载到window对象供其他模块使用
if (typeof window !== 'undefined') {
    window.gameSkills = skills;
    window.statusEffects = statusEffects;
}