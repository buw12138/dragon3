// 角色类文件
// 这个文件定义了角色类和相关的属性计算逻辑

// 角色类
class Character {
    constructor(name, initialData = null) {
        this.name = name;
        
        // 使用初始数据或默认数据
        const defaultData = window.Constants?.INITIAL_CHARACTER || {};
        const data = initialData || defaultData;
        
        // 基础属性
        this.baseStats = { 
            strength: 10,
            agility: 10,
            intelligence: 10,
            stamina: 10,
            ...data.baseStats 
        };
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.statPoints = data.statPoints || 0;
        
        // 战斗基础值
        this.baseCombatStats = { 
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
            cdr: 0,
            ...data.baseCombatStats 
        };
        
        // 当前状态
        this.currentHp = data.currentHp || 100;
        this.currentMp = data.currentMp || 50;

        
        // 可用属性点
        this.availablePoints = data.availablePoints || 0;
        
        // 装备
        this.equipment = { ...data.equipment };
        
        // 背包
        this.inventory = [...(data.inventory || [])];
        
        // 学习的技能
        this.learnedSkills = [...(data.learnedSkills || [])];
        
        // 记忆栏位
        this.memorySlots = [...(data.memorySlots || [null, null, null, null, null])];
        
        // 战斗胜场数
        this.wins = data.wins || 0;
        
        // 战斗相关状态
        this.isAlive = true;
        this.statusEffects = [];
        this.canAttack = true;
        this.lastAttackTime = 0;
        
        // 计算战斗属性
        this.combatStats = this.calculateCombatStats();
    }
    
    // 计算战斗属性（考虑基础属性、装备和技能）
    calculateCombatStats() {
        const formulas = window.Constants?.COMBAT_STATS_FORMULAS || {};
        const baseCombatStats = this.baseCombatStats;
        const baseStats = this.baseStats;
        
        // 基础战斗属性计算
        const combatStats = {
            attack: formulas.attack ? formulas.attack(baseCombatStats.attack, baseStats) : 10,
            magic: formulas.magic ? formulas.magic(baseCombatStats.magic, baseStats) : 10,
            speed: formulas.speed ? formulas.speed(baseCombatStats.speed, baseStats) : 1.0,
            critRate: formulas.critRate ? formulas.critRate(baseCombatStats.critRate, baseStats) : 0.01,
            critDamage: formulas.critDamage ? formulas.critDamage(baseCombatStats.critDamage, baseStats) : 1.0,
            hp: formulas.hp ? formulas.hp(baseCombatStats.hp, baseStats) : 100,
            defense: formulas.defense ? formulas.defense(baseCombatStats.defense, baseStats) : 10,
            dodgeRate: formulas.dodgeRate ? formulas.dodgeRate(baseCombatStats.dodgeRate, baseStats) : 0.01,
            blockRate: formulas.blockRate ? formulas.blockRate(baseCombatStats.blockRate, baseStats) : 0.01,
            blockValue: formulas.blockValue ? formulas.blockValue(baseCombatStats.blockValue, baseStats) : 10,
            
            // 伤害波动范围
            damageVariance: formulas.damageVariance ? formulas.damageVariance(baseCombatStats.damageVariance, baseStats) : 0.1,
            
            cdr: formulas.cdr ? formulas.cdr(baseCombatStats.cdr, baseStats) : 0
        };
        
        // 应用装备加成
        this.applyEquipmentBonuses(combatStats);
        
        // 应用技能加成
        this.applySkillBonuses(combatStats);
        
        // 确保属性不会超出合理范围
        this.normalizeStats(combatStats);
        
        return combatStats;
    }
    
    // 应用装备加成
    applyEquipmentBonuses(stats) {
        for (const slot in this.equipment) {
            const item = this.equipment[slot];
            if (!item) continue;
            
            // 应用基础属性加成
            if (item.baseStats) {
                for (const stat in item.baseStats) {
                    if (stats.hasOwnProperty(stat)) {
                        stats[stat] += item.baseStats[stat];
                    } else if (this.baseStats.hasOwnProperty(stat)) {
                        // 如果是基础属性，我们在计算战斗属性时已经考虑了
                        // 这里只是记录，不直接修改战斗属性
                    }
                }
            }
            
            // 应用额外属性加成
            if (item.extraStats) {
                for (const extraStat of item.extraStats) {
                    if (extraStat.stat === 'allStats') {
                        // 全属性加成
                        for (const stat in stats) {
                            if (typeof stats[stat] === 'number') {
                                stats[stat] += extraStat.value;
                            }
                        }
                    } else if (stats.hasOwnProperty(extraStat.stat)) {
                        stats[extraStat.stat] += extraStat.value;
                    } else if (this.baseStats.hasOwnProperty(extraStat.stat)) {
                        // 同样，基础属性在计算战斗属性时考虑
                    }
                }
            }
        }
    }
    
    // 应用技能加成
    applySkillBonuses(stats) {
        // 获取已装备的被动技能
        const passiveSkills = this.getEquippedPassiveSkills();
        
        for (const skill of passiveSkills) {
            // 应用属性修改器
            if (skill.statModifiers) {
                for (const stat in skill.statModifiers) {
                    if (stats.hasOwnProperty(stat)) {
                        const modifier = skill.statModifiers[stat];
                        
                        // 判断是百分比加成还是固定加成
                        if (Math.abs(modifier) < 1 && stat !== 'speed') {
                            // 百分比加成
                            stats[stat] *= (1 + modifier);
                        } else {
                            // 固定加成
                            stats[stat] += modifier;
                        }
                    }
                }
            }
            
            // 处理装备相关的修饰符
            if (skill.equipmentBasedModifiers) {
                for (const slot in skill.equipmentBasedModifiers) {
                    if (this.equipment[slot]) {
                        // 如果装备了对应部位，应用加成
                        const modifiers = skill.equipmentBasedModifiers[slot];
                        for (const stat in modifiers) {
                            if (stats.hasOwnProperty(stat)) {
                                stats[stat] += modifiers[stat];
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 获取已装备的被动技能
    getEquippedPassiveSkills() {
        const passiveSkills = [];
        const allSkills = window.gameSkills || [];
        
        // 遍历记忆栏位
        for (const skillId of this.memorySlots) {
            if (!skillId) continue;
            
            // 查找技能
            const skill = allSkills.find(s => s.id === skillId);
            if (skill && skill.type === 'passive') {
                passiveSkills.push(skill);
            }
        }
        
        return passiveSkills;
    }
    
    // 规范化属性值
    normalizeStats(stats) {
        // 确保概率类属性在合理范围内
        stats.critRate = Math.min(Math.max(stats.critRate, 0), 0.8); // 最高80%暴击率
        stats.dodgeRate = Math.min(Math.max(stats.dodgeRate, 0), 0.5); // 最高50%闪避率
        stats.blockRate = Math.min(Math.max(stats.blockRate, 0), 0.5); // 最高50%格挡率

        stats.cdr = Math.min(Math.max(stats.cdr, 0), 0.5); // 最高50%冷却缩减
        
        // 确保攻速不会太快或太慢
        stats.speed = Math.min(Math.max(stats.speed, 0.2), 5.0); // 0.2到5.0之间
        
        // 确保暴击伤害至少为100%
        stats.critDamage = Math.max(stats.critDamage, 1.0);
    }
    
    // 分配属性点
    allocateStatPoint(statName) {
        if (this.availablePoints <= 0) return false;
        if (!this.baseStats.hasOwnProperty(statName)) return false;
        
        // 增加基础属性
        this.baseStats[statName] += 1;
        this.availablePoints -= 1;
        
        // 重新计算战斗属性
        this.combatStats = this.calculateCombatStats();
        
        // 如果当前生命值低于最大生命值，可能需要调整
        if (this.currentHp > this.combatStats.hp) {
            this.currentHp = this.combatStats.hp;
        }
        
        return true;
    }
    
    // 装备物品
    equipItem(item) {
        if (!item || item.type !== 'equipment') return false;
        
        const slot = item.slot;
        if (!this.equipment.hasOwnProperty(slot)) return false;
        
        // 保存当前装备（如果有）
        const oldItem = this.equipment[slot];
        
        // 装备新物品
        this.equipment[slot] = item;
        
        // 重新计算战斗属性
        this.combatStats = this.calculateCombatStats();
        
        // 更新当前生命值（如果最大生命值改变）
        const maxHpDifference = this.combatStats.hp - (this.currentHp + (oldItem?.baseStats?.hp || 0));
        if (maxHpDifference > 0) {
            this.currentHp += maxHpDifference;
        }
        
        return oldItem; // 返回被替换的旧装备
    }
    
    // 卸下装备
    unequipItem(slot) {
        if (!this.equipment.hasOwnProperty(slot) || !this.equipment[slot]) return null;
        
        const item = this.equipment[slot];
        this.equipment[slot] = null;
        
        // 重新计算战斗属性
        this.combatStats = this.calculateCombatStats();
        
        // 更新当前生命值
        if (this.currentHp > this.combatStats.hp) {
            this.currentHp = this.combatStats.hp;
        }
        
        return item;
    }
    
    // 学习技能
    learnSkill(skillId) {
        // 检查是否已经学习
        if (this.learnedSkills.includes(skillId)) return false;
        
        // 检查技能是否存在
        const allSkills = window.gameSkills || [];
        const skill = allSkills.find(s => s.id === skillId);
        if (!skill) return false;
        
        // 检查学习条件
        if (skill.requirements) {
            for (const req in skill.requirements) {
                if (this.baseStats[req] < skill.requirements[req]) {
                    return false; // 不满足学习条件
                }
            }
        }
        
        // 学习技能
        this.learnedSkills.push(skillId);
        
        // 重新计算战斗属性（因为可能有被动技能）
        this.combatStats = this.calculateCombatStats();
        
        return true;
    }
    
    // 装备技能到记忆栏位
    equipSkillToMemory(skillId, slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.memorySlots.length) return false;
        if (!this.learnedSkills.includes(skillId)) return false;
        
        const oldSkillId = this.memorySlots[slotIndex];
        this.memorySlots[slotIndex] = skillId;
        
        // 重新计算战斗属性
        this.combatStats = this.calculateCombatStats();
        
        return oldSkillId; // 返回被替换的旧技能
    }
    
    // 从记忆栏位卸下技能
    unequipSkillFromMemory(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.memorySlots.length) return false;
        
        const skillId = this.memorySlots[slotIndex];
        this.memorySlots[slotIndex] = null;
        
        // 重新计算战斗属性
        this.combatStats = this.calculateCombatStats();
        
        return skillId;
    }
    
    // 显示伤害/治疗飘字
    showFloatingText(value, type = 'damage') {
        // 获取专门的飘字容器
        let floatingContainer;
        
        // 检查name属性来区分玩家和敌人
        if (this.name === '玩家') {
            floatingContainer = document.querySelector('.player-floating-container');
        } else {
            floatingContainer = document.querySelector('.enemy-floating-container');
        }
        
        if (!floatingContainer) return;
        
        // 创建飘字元素
        const floatElement = document.createElement('div');
        floatElement.className = `damage-number ${type}`;
        // 确保显示整数
        const displayValue = Math.floor(Math.abs(value));
        floatElement.textContent = type === 'damage' ? `-${displayValue}` : `+${displayValue}`;
        
        // 设置飘字样式
        floatElement.style.position = 'absolute';
        floatElement.style.bottom = '0';
        floatElement.style.left = '40%';
        floatElement.style.transform = 'translateX(-40%)';
        floatElement.style.margin = '0';
        
        // 添加到飘字容器中（血条下方）
        floatingContainer.appendChild(floatElement);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (floatElement.parentNode) {
                floatElement.parentNode.removeChild(floatElement);
            }
        }, 1000);
    }
    
    // 受到伤害
    takeDamage(damage, damageType = '物理') {
        // 检查是否可以攻击
        if (!this.isAlive) return 0;
        
        // 检查闪避
        if (Utils.checkDodge(this.combatStats.dodgeRate)) {
            return 0; // 闪避，没有受到伤害
        }
        
        // 应用防御减伤
        let actualDamage = damage;
        if (damageType === '物理') {
            actualDamage = Math.max(1, damage - this.combatStats.defense * 0.5);
        } else if (damageType === '魔法') {
            // 魔法伤害受到的防御减伤较少
            actualDamage = Math.max(1, damage - this.combatStats.defense * 0.2);
        }
        
        // 检查格挡
        if (damageType === '物理' && Utils.checkBlock(this.combatStats.blockRate)) {
            actualDamage = Utils.applyBlockDamage(actualDamage, this.combatStats.blockValue);
        }
        
        // 确保伤害为整数
        actualDamage = Math.floor(actualDamage);
        
        // 应用伤害
        this.currentHp -= actualDamage;
        
        // 显示伤害飘字
        this.showFloatingText(actualDamage, 'damage');
        
        // 检查是否死亡
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.isAlive = false;
            this.canAttack = false;
        }
        
        return actualDamage;
    }
    
    // 恢复生命值
    heal(amount) {
        if (!this.isAlive) return 0;
        
        const previousHp = this.currentHp;
        this.currentHp = Math.min(this.currentHp + amount, this.combatStats.hp);
        
        const actualHeal = this.currentHp - previousHp;
        
        // 显示治疗飘字
        this.showFloatingText(actualHeal, 'heal');
        
        return actualHeal; // 返回实际恢复的生命值
    }
    
    // 使用魔力
    useMana(amount) {
        if (this.currentMp < amount) return false;
        
        this.currentMp -= amount;
        return true;
    }
    
    // 恢复魔力
    recoverMana(amount) {
        this.currentMp = Math.min(this.currentMp + amount, this.combatStats.magic * 5); // 假设魔力上限是魔法值的5倍
    }
    

    

    
    // 添加状态效果
    addStatusEffect(effectId, duration) {
        const statusEffects = window.statusEffects || {};
        const effect = statusEffects[effectId];
        
        if (!effect) return false;
        
        // 检查是否已有相同效果（简单处理，替换而不是叠加）
        const existingIndex = this.statusEffects.findIndex(e => e.id === effectId);
        if (existingIndex !== -1) {
            // 更新持续时间
            this.statusEffects[existingIndex].endTime = Date.now() + duration;
        } else {
            // 添加新效果
            const newEffect = {
                id: effectId,
                effect: effect,
                endTime: Date.now() + duration,
                startTime: Date.now()
            };
            
            // 应用效果的立即效果
            if (effect.onApply) {
                effect.onApply(this);
            }
            
            this.statusEffects.push(newEffect);
        }
        
        return true;
    }
    
    // 更新状态效果
    updateStatusEffects() {
        const currentTime = Date.now();
        const expiredEffects = [];
        
        for (const effect of this.statusEffects) {
            // 检查是否过期
            if (currentTime >= effect.endTime) {
                expiredEffects.push(effect);
                continue;
            }
            
            // 检查是否需要执行tick效果
            if (effect.effect.tickInterval && 
                currentTime - effect.startTime >= effect.effect.tickInterval) {
                if (effect.effect.onTick) {
                    effect.effect.onTick(this);
                }
                effect.startTime = currentTime; // 重置tick时间
            }
        }
        
        // 移除过期效果
        for (const effect of expiredEffects) {
            const index = this.statusEffects.indexOf(effect);
            if (index !== -1) {
                // 应用移除效果
                if (effect.effect.onRemove) {
                    effect.effect.onRemove(this);
                }
                
                this.statusEffects.splice(index, 1);
            }
        }
    }
    
    // 准备战斗（重置战斗状态）
    prepareForBattle() {
        this.currentHp = this.combatStats.hp;
        this.currentMp = this.combatStats.magic * 5; // 魔力上限

        this.isAlive = true;
        this.canAttack = true;
        this.statusEffects = [];
        this.lastAttackTime = 0;
    }
    
    // 获取可释放的主动技能
    getAvailableActiveSkills() {
        const availableSkills = [];
        const allSkills = window.gameSkills || [];
        
        for (const skillId of this.memorySlots) {
            if (!skillId) continue;
            
            const skill = allSkills.find(s => s.id === skillId);
            if (skill && skill.type === 'active' && skill.canUse(this)) {
                availableSkills.push(skill);
            }
        }
        
        return availableSkills;
    }
    
    // 判断是否可以攻击
    canPerformAttack() {
        if (!this.isAlive) return false;
        
        // 检查状态效果是否影响攻击
        for (const effect of this.statusEffects) {
            if (effect.id === 'frozen' || effect.id === 'stunned' || effect.id === 'paralyzed') {
                // 对于麻痹状态，只有随机判定失败时才无法攻击
                if (effect.id === 'paralyzed' && Math.random() >= 0.5) {
                    continue;
                }
                
                if (window.battleManager) {
                    const statusName = effect.id === 'frozen' ? "冰冻" : 
                                      (effect.id === 'stunned' ? "眩晕" : "麻痹");
                    // 玩家显示"你"，敌人显示名称
                    const subject = this.name === '玩家' ? '你' : this.name;
                    window.battleManager.addBattleLog(`${subject}因${statusName}无法攻击！`);
                }
                return false;
            }
        }
        
        // 检查canAttack标志（可能是其他原因导致无法攻击）
        if (!this.canAttack && window.battleManager) {
            const subject = this.name === '玩家' ? '你' : this.name;
            window.battleManager.addBattleLog(`${subject}无法攻击！`);
            return false;
        }
        
        // 检查攻击冷却
        const attackInterval = 1000 / this.combatStats.speed;
        const currentTime = Date.now();
        
        return currentTime - this.lastAttackTime >= attackInterval;
    }
    
    // 记录攻击时间
    recordAttack() {
        this.lastAttackTime = Date.now();
    }
    
    // 获取战斗数据（用于保存）
    getBattleData() {
        return {
            baseStats: { ...this.baseStats },
            availablePoints: this.availablePoints,
            equipment: { ...this.equipment },
            inventory: [...this.inventory],
            learnedSkills: [...this.learnedSkills],
            memorySlots: [...this.memorySlots],
            wins: this.wins
        };
    }
    
    // 获取基础属性总和（用于计算等级）
    getBaseStatsTotal() {
        return Object.values(this.baseStats).reduce((sum, stat) => sum + stat, 0);
    }
    
    // 获取角色等级（基于基础属性总和）
    getLevel() {
        const totalStats = this.getBaseStatsTotal();
        // 假设初始等级为1，每10点总属性提升1级
        return Math.floor(totalStats / 10);
    }
}

// 创建玩家角色
function createPlayer(initialData = null) {
    return new Character('玩家', initialData);
}

// 创建敌人角色（简化版）
function createEnemy(enemyData) {
    const enemy = {
        name: enemyData.name,
        baseStats: { ...enemyData.baseStats },
        currentHp: enemyData.baseStats.hp,
        isAlive: true,
        statusEffects: [],
        canAttack: true,
        lastAttackTime: 0,
        behavior: enemyData.behavior,
        drops: enemyData.drops,
        level: enemyData.level,
        
        // 显示伤害/治疗飘字
        showFloatingText: function(value, type = 'damage') {
            // 获取专门的飘字容器
            const floatingContainer = document.querySelector('.enemy-floating-container');
            
            if (!floatingContainer) return;
            
            // 创建飘字元素
            const floatElement = document.createElement('div');
            floatElement.className = `damage-number ${type}`;
            // 确保显示整数
            const displayValue = Math.floor(Math.abs(value));
            floatElement.textContent = type === 'damage' ? `-${displayValue}` : `+${displayValue}`;
            
            // 设置飘字样式
            floatElement.style.position = 'absolute';
            floatElement.style.bottom = '0';
            floatElement.style.left = '40%';
            floatElement.style.transform = 'translateX(-40%)';
            floatElement.style.margin = '0';
            
            // 添加到飘字容器中（血条下方）
            floatingContainer.appendChild(floatElement);
            
            // 动画结束后移除元素
            setTimeout(() => {
                if (floatElement.parentNode) {
                    floatElement.parentNode.removeChild(floatElement);
                }
            }, 1000);
        },
        
        // 简化的攻击方法
        takeDamage: function(damage, damageType = '物理') {
            if (!this.isAlive) return 0;
            
            // 简单的防御计算
            let actualDamage = damage;
            if (damageType === '物理' && this.baseStats.defense) {
                actualDamage = Math.max(1, damage - this.baseStats.defense * 0.5);
            }
            
            // 应用伤害
            this.currentHp -= actualDamage;
            
            // 显示伤害飘字
            this.showFloatingText(actualDamage, 'damage');
            
            if (this.currentHp <= 0) {
                this.currentHp = 0;
                this.isAlive = false;
                this.canAttack = false;
            }
            
            return actualDamage;
        },
        
        canPerformAttack: function() {
            if (!this.isAlive) return false;
            
            // 检查状态效果是否影响攻击
            for (const effect of this.statusEffects || []) {
                if (effect.id === 'frozen' || effect.id === 'stunned' || effect.id === 'paralyzed') {
                    // 对于麻痹状态，只有随机判定失败时才无法攻击
                    if (effect.id === 'paralyzed' && Math.random() >= 0.5) {
                        continue;
                    }
                    
                    if (window.battleManager) {
                        const statusName = effect.id === 'frozen' ? "冰冻" : 
                                          (effect.id === 'stunned' ? "眩晕" : "麻痹");
                        window.battleManager.addBattleLog(`${this.name}因${statusName}无法攻击！`);
                    }
                    return false;
                }
            }
            
            // 检查canAttack标志（可能是其他原因导致无法攻击）
            if (!this.canAttack && window.battleManager) {
                window.battleManager.addBattleLog(`${this.name}无法攻击！`);
                return false;
            }
            
            // 检查攻击冷却
            const attackSpeed = this.baseStats.speed || 1.0;
            const attackInterval = 1000 / attackSpeed;
            const currentTime = Date.now();
            
            return currentTime - this.lastAttackTime >= attackInterval;
        },
        
        recordAttack: function() {
            this.lastAttackTime = Date.now();
        },
        
        addStatusEffect: function(effectId, duration) {
            const statusEffects = window.statusEffects || {};
            const effect = statusEffects[effectId];
            
            if (!effect) return false;
            
            this.statusEffects.push({
                id: effectId,
                endTime: Date.now() + duration
            });
            
            // 简单处理一些状态效果
            if (effectId === 'frozen' || effectId === 'stunned') {
                this.canAttack = false;
                setTimeout(() => {
                    this.canAttack = true;
                }, duration);
            }
            
            return true;
        }
    };
    
    return enemy;
}

// 导出角色相关函数
if (typeof window !== 'undefined') {
    window.Character = Character;
    window.createPlayer = createPlayer;
    window.createEnemy = createEnemy;
}