// 敌人配置文件
// 这个文件定义了游戏中所有可遇到的敌人

// 敌人数据
const enemies = [
    // 初级敌人
    {
        id: 'goblin',
        name: '哥布林',
        level: 1,
        description: '弱小的哥布林，通常群体行动',
        // 基础属性
        baseStats: {
            hp: 20,
            attack: 15,
            defense: 5,
            speed: 1.0,
            critRate: 0.02,
            dodgeRate: 0.05
        },
        // 战斗行为和技能
        behavior: {
            attackPattern: 'normal',
            useSkills: false,
            aggroRange: 1
        },
        // 掉落配置
        drops: {
            gold: { min: 10, max: 30 },
            items: [
                { itemId: 'wooden_sword', chance: 0.2 },
                { itemId: 'blood_drain_blade', chance: 1 },
                { itemId: 'leather_armor', chance: 0.15 },
                { itemId: 'greater_healing_potion', chance: 1.1 },
                { itemId: 'skill_book_fireball', chance: 1 }
            ]
        },
        // 经验值奖励
        expReward: 20
    },
    {
        id: 'wolf',
        name: '野狼',
        level: 1,
        description: '饥饿的野狼，攻击速度快',
        baseStats: {
            hp: 30,
            attack: 12,
            defense: 3,
            speed: 1.3,
            critRate: 0.05,
            dodgeRate: 0.1
        },
        behavior: {
            attackPattern: 'quick',
            useSkills: false,
            aggroRange: 2
        },
        drops: {
            gold: { min: 15, max: 25 },
            items: [
                { itemId: 'cloth_boots', chance: 0.25 },
                { itemId: 'blood_drain_blade', chance: 1 },
                { itemId: 'skill_book_quick_attack', chance: 1 },
                { itemId: 'greater_healing_potion', chance: 1.1 }
            ]
        },
        expReward: 25
    },
    {
        id: 'slime',
        name: '史莱姆',
        level: 2,
        description: '黏糊糊的史莱姆，攻击力低但生命值较高',
        baseStats: {
            hp: 50,
            attack: 10,
            defense: 8,
            speed: 0.8,
            critRate: 0,
            dodgeRate: 0
        },
        behavior: {
            attackPattern: 'slow',
            useSkills: false,
            aggroRange: 1
        },
        drops: {
            gold: { min: 8, max: 20 },
            items: [
                { itemId: 'leather_armor', chance: 0.2 },
                { itemId: 'blood_drain_blade', chance: 1 },
                { itemId: 'skill_book_heal', chance: 1 },
                { itemId: 'greater_healing_potion', chance: 1.1 }
            ]
        },
        expReward: 15
    },
    
    // 中级敌人
    {
        id: 'orc_warrior',
        name: '兽人战士',
        level: 5,
        description: '强壮的兽人战士，防御力高',
        baseStats: {
            hp: 300,
            attack: 30,
            defense: 20,
            speed: 0.9,
            critRate: 0.03,
            dodgeRate: 0.02,
            blockRate: 0.1,
            blockValue: 15
        },
        behavior: {
            attackPattern: 'heavy',
            useSkills: true,
            skills: ['orc_bash']
        },
        drops: {
            gold: { min: 50, max: 100 },
            items: [
                { itemId: 'iron_sword', chance: 0.3 },
                { itemId: 'steel_shield', chance: 0.25 },
                { itemId: 'blood_drain_blade', chance: 0.15 },
                { itemId: 'skill_book_shield_master', chance: 1.1 },
                { itemId: 'greater_healing_potion', chance: 0.1 }
            ]
        },
        expReward: 60
    },
    {
        id: 'evil_wizard',
        name: '邪恶巫师',
        level: 5,
        description: '会使用魔法的巫师，攻击力高但防御力低',
        baseStats: {
            hp: 200,
            attack: 25,
            magic: 40,
            defense: 10,
            speed: 1.0,
            critRate: 0.08,
            dodgeRate: 0.05
        },
        behavior: {
            attackPattern: 'magic',
            useSkills: true,
            skills: ['fireball', 'curse']
        },
        drops: {
            gold: { min: 60, max: 120 },
            items: [
                { itemId: 'magic_hat', chance: 0.35 },
                { itemId: 'blood_drain_blade', chance: 0.2 },
                { itemId: 'skill_book_fireball', chance: 0.15 },
                { itemId: 'skill_book_mana_efficiency', chance: 0.1 }
            ]
        },
        expReward: 70
    },
    {
        id: 'elite_archer',
        name: '精英弓箭手',
        level: 5,
        description: '精准的弓箭手，攻击距离远，暴击率高',
        baseStats: {
            hp: 250,
            attack: 35,
            defense: 15,
            speed: 1.2,
            critRate: 0.15,
            dodgeRate: 0.12
        },
        behavior: {
            attackPattern: 'ranged',
            useSkills: true,
            skills: ['piercing_arrow']
        },
        drops: {
            gold: { min: 55, max: 110 },
            items: [
                { itemId: 'quick_boots', chance: 0.3 },
                { itemId: 'skill_book_evasion_master', chance: 0.12 }
            ]
        },
        expReward: 65
    },
    
    // 高级敌人
    {
        id: 'dragon_knight',
        name: '龙骑士',
        level: 10,
        description: '骑着龙的强大骑士，各方面属性都很优秀',
        baseStats: {
            hp: 600,
            attack: 60,
            defense: 40,
            speed: 1.1,
            critRate: 0.1,
            dodgeRate: 0.08,
            blockRate: 0.15,
            blockValue: 30
        },
        behavior: {
            attackPattern: 'balanced',
            useSkills: true,
            skills: ['dragon_cleave', 'dragon_roar', 'holy_shield']
        },
        drops: {
            gold: { min: 150, max: 300 },
            items: [
                { itemId: 'flame_sword', chance: 0.3 },
                { itemId: 'plate_armor', chance: 0.25 },
                { itemId: 'skill_book_thunder_strike', chance: 0.15 }
            ]
        },
        expReward: 150
    },
    {
        id: 'lich',
        name: '巫妖',
        level: 10,
        description: '强大的亡灵法师，拥有恐怖的魔法力量',
        baseStats: {
            hp: 400,
            attack: 40,
            magic: 80,
            defense: 25,
            speed: 0.9,
            critRate: 0.12,
            dodgeRate: 0.1
        },
        behavior: {
            attackPattern: 'caster',
            useSkills: true,
            skills: ['death_bolt', 'summon_undead', 'life_drain']
        },
        drops: {
            gold: { min: 200, max: 350 },
            items: [
                { itemId: 'wizard_hat', chance: 0.4 },
                { itemId: 'skill_book_elemental_mastery', chance: 0.2 }
            ]
        },
        expReward: 180
    },
    
    // Boss敌人
    {
        id: 'ancient_dragon',
        name: '远古巨龙',
        level: 15,
        description: '传说中的远古巨龙，拥有毁灭性的力量',
        baseStats: {
            hp: 2000,
            attack: 100,
            magic: 70,
            defense: 60,
            speed: 1.0,
            critRate: 0.2,
            dodgeRate: 0.05,
            blockRate: 0.2
        },
        behavior: {
            attackPattern: 'boss',
            useSkills: true,
            skills: ['dragon_fire', 'tail_swipe', 'wing_blast', 'dragon_rage'],
            enrageThreshold: 0.3 // 生命值低于30%时进入狂暴状态
        },
        drops: {
            gold: { min: 500, max: 1000 },
            items: [
                { itemId: 'dragon_slayer', chance: 0.5 },
                { itemId: 'eternal_armor', chance: 0.4 },
                { itemId: 'angel_wings', chance: 0.3 }
            ]
        },
        expReward: 500
    },
    {
        id: 'dark_lord',
        name: '黑暗领主',
        level: 20,
        description: '终极Boss，黑暗世界的统治者',
        baseStats: {
            hp: 3000,
            attack: 120,
            magic: 100,
            defense: 80,
            speed: 1.2,
            critRate: 0.25,
            dodgeRate: 0.1,
            blockRate: 0.25
        },
        behavior: {
            attackPattern: 'ultimate',
            useSkills: true,
            skills: ['dark_bolt', 'shadow_blade', 'inferno', 'dark_regeneration', 'doom'],
            enrageThreshold: 0.4,
            phaseChange: 0.5 // 生命值低于50%时进入第二阶段
        },
        drops: {
            gold: { min: 1000, max: 2000 },
            items: [
                { itemId: 'dragon_slayer', chance: 0.7 },
                { itemId: 'eternal_armor', chance: 0.6 },
                { itemId: 'angel_wings', chance: 0.5 }
            ]
        },
        expReward: 1000
    }
];

// 敌人专用技能
const enemySkills = {
    orc_bash: {
        name: '兽人猛击',
        type: 'active',
        description: '强力的一击，有几率击晕目标',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.attack * 1.5);
            target.takeDamage(damage, '物理');
            
            if (Math.random() < 0.3) {
                target.addStatusEffect('stunned', 1000);
                return { message: `${user.name} 使用了兽人猛击，对 ${target.name} 造成了 ${damage} 点伤害，并使其眩晕！` };
            }
            
            return { message: `${user.name} 使用了兽人猛击，对 ${target.name} 造成了 ${damage} 点伤害！` };
        },
        probability: 0.2
    },
    fireball: {
        name: '火球术',
        type: 'active',
        description: '投掷一个火球攻击敌人',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.magic * 1.8);
            target.takeDamage(damage, '魔法');
            
            if (Math.random() < 0.2) {
                target.addStatusEffect('burned', 3000);
                return { message: `${user.name} 释放了火球术，对 ${target.name} 造成了 ${damage} 点魔法伤害，并使其燃烧！` };
            }
            
            return { message: `${user.name} 释放了火球术，对 ${target.name} 造成了 ${damage} 点魔法伤害！` };
        },
        probability: 0.25
    },
    curse: {
        name: '诅咒',
        type: 'active',
        description: '诅咒目标，降低其属性',
        effect: (user, target) => {
            target.addStatusEffect('debuffed', 8000);
            return { message: `${user.name} 对 ${target.name} 施加了诅咒，降低了其属性！` };
        },
        probability: 0.2
    },
    piercing_arrow: {
        name: '穿刺箭',
        type: 'active',
        description: '射出一支穿透性的箭矢',
        effect: (user, target) => {
            // 确保属性存在且为有效数字
            const userAttack = Number(user.combatStats?.attack) || Number(user.baseStats?.attack) || 10;
            const targetDefense = Number(target.combatStats?.defense) || Number(target.baseStats?.defense) || 0;
            
            // 计算伤害
            const damage = Math.floor(userAttack * 1.3);
            // 忽略目标部分防御
            const effectiveDefense = targetDefense * 0.7;
            const actualDamage = Math.max(1, Math.floor(damage - effectiveDefense));
            
            target.takeDamage(actualDamage, '物理');
            return { message: `${user.name} 射出了穿刺箭，对 ${target.name} 造成了 ${actualDamage} 点伤害，穿透了其防御！` };
        },
        probability: 0.3
    },
    // Boss技能（简化版）
    dragon_fire: {
        name: '龙炎吐息',
        type: 'active',
        description: '喷出毁灭性的龙炎',
        effect: (user, target) => {
            const damage = Math.floor((user.baseStats.attack + user.baseStats.magic) * 2.0);
            target.takeDamage(damage, '火焰');
            target.addStatusEffect('burned', 5000);
            return { message: `${user.name} 喷出了龙炎吐息，对 ${target.name} 造成了 ${damage} 点火焰伤害，并使其燃烧！` };
        },
        probability: 0.15
    },
    dark_bolt: {
        name: '黑暗闪电',
        type: 'active',
        description: '射出黑暗能量闪电',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.magic * 2.5);
            target.takeDamage(damage, '魔法');
            return { message: `${user.name} 射出了黑暗闪电，对 ${target.name} 造成了 ${damage} 点魔法伤害！` };
        },
        probability: 0.2
    },
    dragon_cleave: {
        name: '龙爪撕裂',
        type: 'active',
        description: '用锋利的龙爪撕裂敌人',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.attack * 1.8);
            target.takeDamage(damage, '物理');
            return { message: `${user.name} 使用了龙爪撕裂，对 ${target.name} 造成了 ${damage} 点伤害！` };
        },
        probability: 0.35
    },
    dragon_roar: {
        name: '龙之咆哮',
        type: 'active',
        description: '震耳欲聋的龙吟，降低敌人防御',
        effect: (user, target) => {
            target.addStatusEffect('debuffed', 6000);
            return { message: `${user.name} 发出了震耳欲聋的咆哮，降低了 ${target.name} 的防御！` };
        },
        probability: 0.25
    },
    holy_shield: {
        name: '神圣护盾',
        type: 'active',
        description: '为自己施加神圣护盾，减少受到的伤害',
        effect: (user, target) => {
            user.addStatusEffect('buffed', 8000);
            return { message: `${user.name} 施展了神圣护盾，自身防御得到了提升！` };
        },
        probability: 0.2
    },
    death_bolt: {
        name: '死亡箭矢',
        type: 'active',
        description: '射出充满死亡力量的箭矢',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.magic * 2.2);
            target.takeDamage(damage, '魔法');
            if (Math.random() < 0.15) {
                target.addStatusEffect('poisoned', 4000);
                return { message: `${user.name} 射出了死亡箭矢，对 ${target.name} 造成了 ${damage} 点伤害，并使其中毒！` };
            }
            return { message: `${user.name} 射出了死亡箭矢，对 ${target.name} 造成了 ${damage} 点伤害！` };
        },
        probability: 0.3
    },
    summon_undead: {
        name: '召唤亡灵',
        type: 'active',
        description: '召唤亡灵协助作战',
        effect: (user, target) => {
            return { message: `${user.name} 召唤了亡灵生物协助作战！` };
        },
        probability: 0.15
    },
    life_drain: {
        name: '生命汲取',
        type: 'active',
        description: '汲取敌人的生命值',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.magic * 1.5);
            const actualDamage = target.takeDamage(damage, '魔法');
            const healAmount = Math.floor(actualDamage * 0.7);
            user.heal(healAmount);
            return { message: `${user.name} 汲取了 ${target.name} 的生命值，造成 ${actualDamage} 点伤害并恢复了 ${healAmount} 点生命值！` };
        },
        probability: 0.25
    },
    tail_swipe: {
        name: '龙尾横扫',
        type: 'active',
        description: '用强力的龙尾横扫攻击',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.attack * 1.6);
            target.takeDamage(damage, '物理');
            if (Math.random() < 0.2) {
                target.addStatusEffect('stunned', 1500);
                return { message: `${user.name} 发动了龙尾横扫，对 ${target.name} 造成了 ${damage} 点伤害，并使其眩晕！` };
            }
            return { message: `${user.name} 发动了龙尾横扫，对 ${target.name} 造成了 ${damage} 点伤害！` };
        },
        probability: 0.4
    },
    wing_blast: {
        name: '翼展风暴',
        type: 'active',
        description: '巨大的龙翼掀起风暴',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.attack * 1.4);
            target.takeDamage(damage, '物理');
            target.addStatusEffect('debuffed', 5000);
            return { message: `${user.name} 发动了翼展风暴，对 ${target.name} 造成了 ${damage} 点伤害，并降低了其攻击能力！` };
        },
        probability: 0.3
    },
    dragon_rage: {
        name: '龙之狂暴',
        type: 'active',
        description: '进入狂暴状态，攻击力和攻击速度大幅提升',
        effect: (user, target) => {
            user.addStatusEffect('buffed', 10000);
            return { message: `${user.name} 进入了龙之狂暴状态，自身能力大幅提升！` };
        },
        probability: 0.12
    },
    shadow_blade: {
        name: '暗影刀刃',
        type: 'active',
        description: '暗影凝聚而成的致命刀刃',
        effect: (user, target) => {
            const damage = Math.floor((user.baseStats.attack + user.baseStats.magic) * 1.9);
            target.takeDamage(damage, '物理');
            return { message: `${user.name} 挥舞着暗影刀刃，对 ${target.name} 造成了 ${damage} 点伤害！` };
        },
        probability: 0.28
    },
    inferno: {
        name: '地狱烈焰',
        type: 'active',
        description: '召唤地狱的恐怖烈焰',
        effect: (user, target) => {
            const damage = Math.floor(user.baseStats.magic * 2.8);
            target.takeDamage(damage, '火焰');
            target.addStatusEffect('burned', 6000);
            return { message: `${user.name} 召唤了地狱烈焰，对 ${target.name} 造成了 ${damage} 点火焰伤害，并使其燃烧！` };
        },
        probability: 0.18
    },
    dark_regeneration: {
        name: '黑暗再生',
        type: 'active',
        description: '黑暗力量恢复自身生命值',
        effect: (user, target) => {
            const healAmount = Math.floor(user.baseStats.hp * 0.25);
            user.heal(healAmount);
            return { message: `${user.name} 通过黑暗力量恢复了 ${healAmount} 点生命值！` };
        },
        probability: 0.22
    },
    doom: {
        name: '末日裁决',
        type: 'active',
        description: '毁灭性的终极技能',
        effect: (user, target) => {
            const damage = Math.floor((user.baseStats.attack + user.baseStats.magic) * 3.5);
            target.takeDamage(damage, '混合');
            if (Math.random() < 0.3) {
                target.addStatusEffect('paralyzed', 3000);
                return { message: `${user.name} 发动了末日裁决，对 ${target.name} 造成了 ${damage} 点毁灭性伤害，并使其麻痹！` };
            }
            return { message: `${user.name} 发动了末日裁决，对 ${target.name} 造成了 ${damage} 点毁灭性伤害！` };
        },
        probability: 0.1
    }
};

// 随机敌人生成器（根据玩家等级）
function generateEnemy(playerLevel) {
    // 过滤出适合玩家等级的敌人
    const suitableEnemies = enemies.filter(enemy => 
        enemy.level <= playerLevel + 0 && enemy.level >= Math.max(1, playerLevel - 2)
    );
    
    // 如果没有合适的敌人，就返回所有敌人
    const availableEnemies = suitableEnemies.length > 0 ? suitableEnemies : enemies;
    
    // 随机选择一个敌人
    const randomIndex = Math.floor(Math.random() * availableEnemies.length);
    const enemyTemplate = availableEnemies[randomIndex];
    
    // 创建敌人实例
    return {
        ...enemyTemplate,
        currentHp: enemyTemplate.baseStats.hp,
        isAlive: true,
        statusEffects: [],
        canAttack: true
    };
}

// 将敌人数据挂载到window对象供其他模块使用
if (typeof window !== 'undefined') {
    window.gameEnemies = enemies;
    window.enemySkills = enemySkills;
    window.generateEnemy = generateEnemy;
}