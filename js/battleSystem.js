// 战斗系统逻辑
// 这个文件实现了游戏的核心战斗系统，包括即时制战斗机制、技能释放、状态效果等

// 战斗管理器
class BattleManager {
    constructor() {
        // 战斗状态
        this.isBattleActive = false;
        
        // 战斗参与者
        this.player = null;
        this.enemy = null;
        
        // 战斗循环
        this.battleLoopInterval = null;
        this.battleSpeed = 100; // 战斗循环的时间间隔（毫秒）
        
        // 战斗日志
        this.battleLog = [];
        
        // 战斗回调
        this.onBattleEnd = null;
        
        // 技能冷却（毫秒）
        this.skillsOnCooldown = {};
        
        // 战斗开始延迟设置
        this.battleStartTime = 0; // 记录战斗开始时间
        this.battleStartDelay = 1000; // 战斗开始延迟时间（毫秒）
    }
    
    // 初始化战斗
    initBattle(player, enemy, onBattleEndCallback) {
        this.player = player;
        this.enemy = enemy;
        this.onBattleEnd = onBattleEndCallback;
        this.battleLog = [];
        this.skillsOnCooldown = {};
        
        // 准备战斗状态
        player.prepareForBattle();
        
        // 重置敌人状态
        enemy.isAlive = true;
        enemy.currentHp = enemy.baseStats.hp;
        enemy.canAttack = true;
        enemy.statusEffects = [];
        enemy.lastAttackTime = 0;
        
        this.isBattleActive = true;
        
        // 记录战斗开始时间
        this.battleStartTime = Date.now();
        
        // 添加战斗开始日志
        this.addBattleLog(`${player.name}与${enemy.name}的战斗开始了！`);
        this.addBattleLog('双方正在准备战斗...');
        
        // 开始战斗循环
        this.startBattleLoop();
    }
    
    // 开始战斗循环
    startBattleLoop() {
        // 清除可能存在的循环
        if (this.battleLoopInterval) {
            clearInterval(this.battleLoopInterval);
        }
        
        // 设置新的循环
        this.battleLoopInterval = setInterval(() => {
            if (!this.isBattleActive) {
                this.stopBattleLoop();
                return;
            }
            
            // 更新状态效果
            this.updateStatusEffects();
            
            // 检查战斗是否结束
            if (this.checkBattleEnd()) {
                this.endBattle();
                return;
            }
            
            // 执行战斗逻辑
            this.executeBattleTurn();
        }, this.battleSpeed);
    }
    
    // 应用受击效果
    applyHitEffect(target) {
        // 判断目标是玩家还是敌人
        let spriteElement;
        
        if (target === this.player) {
            // 获取玩家精灵元素
            spriteElement = document.querySelector('.player-sprite');
        } else if (target === this.enemy) {
            // 获取敌人精灵元素
            spriteElement = document.querySelector('.enemy-sprite');
        }
        
        // 如果找到了精灵元素，添加震动效果
        if (spriteElement) {
            // 添加shake类触发动画
            spriteElement.classList.add('shake');
            
            // 动画结束后移除shake类，以便下次可以再次触发
            setTimeout(() => {
                spriteElement.classList.remove('shake');
            }, 300); // 与CSS动画持续时间一致
        }
    }
    
    // 停止战斗循环
    stopBattleLoop() {
        if (this.battleLoopInterval) {
            clearInterval(this.battleLoopInterval);
            this.battleLoopInterval = null;
        }
    }
    
    // 更新状态效果
    updateStatusEffects() {
        if (this.player && this.player.isAlive) {
            this.player.updateStatusEffects();
        }
        
        // 敌人状态效果简化处理
        if (this.enemy && this.enemy.isAlive && this.enemy.statusEffects) {
            const currentTime = Date.now();
            const expiredEffects = [];
            
            for (const effect of this.enemy.statusEffects) {
                if (currentTime >= effect.endTime) {
                    expiredEffects.push(effect);
                }
            }
            
            // 移除过期效果
            for (const effect of expiredEffects) {
                const index = this.enemy.statusEffects.indexOf(effect);
                if (index !== -1) {
                    this.enemy.statusEffects.splice(index, 1);
                    
                    // 处理冰冻/眩晕状态结束
                    if (effect.id === 'frozen' || effect.id === 'stunned') {
                        this.enemy.canAttack = true;
                    }
                }
            }
            
            // 处理持续伤害状态（简化版）
            const damageEffects = this.enemy.statusEffects.filter(e => 
                e.id === 'poison' || e.id === 'burn'
            );
            
            for (const effect of damageEffects) {
                let damage = 0;
                let message = '';
                
                if (effect.id === 'poison') {
                    damage = Math.floor(this.enemy.baseStats.hp * 0.05); // 中毒造成5%生命值伤害
                    message = `${this.enemy.name}受到了中毒伤害！`;
                } else if (effect.id === 'burn') {
                    damage = Math.floor(this.enemy.baseStats.hp * 0.07); // 燃烧造成7%生命值伤害
                    message = `${this.enemy.name}被燃烧伤害！`;
                }
                
                if (damage > 0) {
                    const actualDamage = this.enemy.takeDamage(damage, '特殊');
                    if (actualDamage > 0) {
                        this.addBattleLog(`${message} [${actualDamage}伤害]`);
                    }
                }
            }
        }
        
        // 更新技能冷却
        this.updateSkillsCooldown();
    }
    
    // 更新技能冷却
    updateSkillsCooldown() {
        const currentTime = Date.now();
        const expiredSkills = [];
        
        for (const skillId in this.skillsOnCooldown) {
            if (currentTime >= this.skillsOnCooldown[skillId]) {
                expiredSkills.push(skillId);
            }
        }
        
        for (const skillId of expiredSkills) {
            delete this.skillsOnCooldown[skillId];
        }
    }
    
    // 执行战斗回合（即时制，根据攻速决定攻击频率）
    executeBattleTurn() {
        // 检查是否在战斗开始延迟期间
        const currentTime = Date.now();
        const battleActiveTime = currentTime - this.battleStartTime;
        
        // 只有在延迟时间过后才执行攻击逻辑
        if (battleActiveTime >= this.battleStartDelay) {
            // 玩家攻击 - canPerformAttack方法会自动处理状态效果日志
            if (this.player && this.player.isAlive && this.player.canPerformAttack()) {
                this.playerAttack();
            }
            
            // 敌人攻击 - canPerformAttack方法会自动处理状态效果日志
            if (this.enemy && this.enemy.isAlive && this.enemy.canPerformAttack()) {
                this.enemyAttack();
            }
        }
    }
    
    // 玩家攻击
    playerAttack() {
        // 检查是否释放技能
        const availableSkills = this.player.getAvailableActiveSkills();
        
        if (availableSkills.length > 0) {
            // 检查每个技能的概率，独立决定是否使用
            let usedSkill = false;
            for (const skill of availableSkills) {
                // 使用技能的baseProbability，默认值0.4
                const skillProbability = skill.baseProbability || 0.4;
                if (Math.random() < skillProbability) {
                    this.castSkill(this.player, skill, this.enemy);
                    usedSkill = true;
                    break; // 使用了一个技能就退出
                }
            }
            
            // 如果没有使用任何技能，则普通攻击
            if (!usedSkill) {
                this.performBasicAttack(this.player, this.enemy);
            }
        } else {
            // 普通攻击
            this.performBasicAttack(this.player, this.enemy);
        }
        
        // 记录攻击时间
        this.player.recordAttack();
    }
    
    // 敌人攻击
    enemyAttack() {
        // 简单的敌人AI逻辑
        // 根据敌人的behavior对象决定攻击行为
        const behavior = this.enemy.behavior || {};
        const attackPattern = behavior.attackPattern || 'normal';
        
        // 所有敌人都应该能够攻击，根据attackPattern决定攻击方式
        if (behavior.useSkills && behavior.skills && behavior.skills.length > 0) {
            // 检查每个技能的概率，独立决定是否使用
            let usedSkill = false;
            for (const skillId of behavior.skills) {
                const enemySkill = window.enemySkills[skillId];
                if (enemySkill && Math.random() < (enemySkill.probability || 0.4)) {
                    this.castEnemySkill(this.enemy, enemySkill, this.player);
                    usedSkill = true;
                    break; // 使用了一个技能就退出
                }
            }
            
            // 如果没有使用任何技能，则普通攻击
            if (!usedSkill) {
                this.performBasicAttack(this.enemy, this.player);
            }
        } else {
            // 普通攻击
            this.performBasicAttack(this.enemy, this.player);
        }
        
        // 记录攻击时间
        this.enemy.recordAttack();
    }
    
    // 执行普通攻击
    performBasicAttack(attacker, target) {
        // 计算伤害，确保是有效数字
        let damage = Number(attacker.combatStats?.attack) || Number(attacker.baseStats?.attack) || 10;
        damage = Math.max(1, damage); // 确保伤害至少为1
        
        // 应用伤害波动范围
        const damageVariance = Number(attacker.combatStats?.damageVariance) || 0.1;
        const varianceMultiplier = 1 + (Math.random() - 0.5) * 2 * damageVariance;
        damage = damage * varianceMultiplier;
        
        // 检查暴击
        const critRate = Number(attacker.combatStats?.critRate) || Number(attacker.baseStats?.critRate) || 0;
        const isCritical = Utils.checkCritical(critRate);
        if (isCritical) {
            const critDamageMultiplier = Number(attacker.combatStats?.critDamage) || Number(attacker.baseStats?.critDamage) || 1.5;
            damage = Math.floor(damage * critDamageMultiplier);
        }
        
        // 应用伤害
        const damageType = attacker === this.player ? '物理' : '物理';
        const actualDamage = target.takeDamage(damage, damageType);
        
        // 确保actualDamage是有效数字并且是整数
        const displayDamage = isNaN(actualDamage) ? 0 : Math.max(0, Math.floor(actualDamage));
        
        // 如果造成了伤害，添加受击震动效果
        if (actualDamage > 0) {
            this.applyHitEffect(target);
        }
        
        // 记录战斗日志
        let message = `${attacker.name}攻击了${target.name}！`;
        if (displayDamage === 0) {
            message += ' 但是被闪避了！';
        } else {
            if (isCritical) {
                message += ' 暴击！';
            }
            message += ` [${displayDamage}伤害]`;
        }
        
        this.addBattleLog(message);
        
        // 检查特殊效果触发（简化版）
        if (attacker === this.player && actualDamage > 0) {
            // 计算治疗量（考虑吸血属性）
            let lifestealAmount = 0;
            if (attacker.specialAttributes && attacker.specialAttributes.lifesteal > 0) {
                lifestealAmount = Math.round(actualDamage * attacker.specialAttributes.lifesteal);
                if (lifestealAmount > 0) {
                    attacker.heal(lifestealAmount);
                    this.addBattleLog(`${attacker.name} 触发吸血效果，恢复 ${lifestealAmount} 生命值`);
                }
            }
            
            // 检查击退/击晕效果（简化版，概率触发）
            const stunChance = attacker.combatStats?.stunChance || 0;
            if (stunChance > 0 && Math.random() < stunChance) {
                target.addStatusEffect('stunned', 1000); // 眩晕1秒
                this.addBattleLog(`${target.name}被眩晕了！`);
            }
        }
    }
    
    // 释放技能
    castSkill(caster, skill, target) {
        // 检查技能是否在冷却中
        if (this.skillsOnCooldown[skill.id]) {
            return false;
        }
        
        // 检查技能使用条件
        if (!skill.canUse(caster)) {
            return false;
        }
        
        // 使用技能所需资源
        if (false) { // 移除体力消耗检查
            return false;
        }
        
        // 检查并获取技能效果函数
        if (!skill.effect || typeof skill.effect !== 'function') {
            console.error('技能缺少有效的效果函数:', skill);
            return false;
        }
        
        if (skill.manaCost && !caster.useMana(skill.manaCost)) {
            return false;
        }
        
        // 执行技能效果
        this.addBattleLog(`${caster.name}使用了${skill.name}！`);
        
        // 调用技能的效果函数（使用正确的函数名effect）
        const effectResult = skill.effect(caster, target);
        
        // 如果技能返回了消息，则添加到战斗日志
        if (effectResult && effectResult.message) {
            this.addBattleLog(effectResult.message);
        }
        
        // 如果技能造成了伤害，添加受击震动效果
        if (effectResult && (effectResult.damage || effectResult.actualDamage) && 
            (effectResult.damage || effectResult.actualDamage) > 0) {
            this.applyHitEffect(target);
        }
        
        // 处理技能冷却
        if (skill.cooldown) {
            const cooldownTime = skill.cooldown * (1 - (caster.combatStats?.cdr || 0));
            this.skillsOnCooldown[skill.id] = Date.now() + cooldownTime;
        }
        
        return true;
    }
    
    // 敌人释放技能
    castEnemySkill(enemy, skill, target) {
        this.addBattleLog(`${enemy.name}使用了${skill.name}！`);
        
        // 执行技能效果
        if (typeof skill.effect === 'function') {
            try {
                // 调用技能效果函数，传入使用者和目标
                const result = skill.effect(enemy, target);
                
                // 如果技能函数返回了消息，则添加到战斗日志
                if (result && result.message) {
                    this.addBattleLog(result.message);
                }
                
                // 如果技能造成了伤害，添加受击震动效果
                if (result && result.actualDamage && result.actualDamage > 0) {
                    this.applyHitEffect(target);
                }
            } catch (error) {
                console.error('Enemy skill error:', error);
                // 出错时执行普通攻击作为备选
                this.performBasicAttack(enemy, target);
            }
        } else {
            // 如果没有有效的效果函数，执行普通攻击
            this.performBasicAttack(enemy, target);
        }
    }
    
    // 检查战斗是否结束
    checkBattleEnd() {
        if (!this.player || !this.enemy) return true;
        
        return !this.player.isAlive || !this.enemy.isAlive;
    }
    
    // 结束战斗
    endBattle() {
        this.isBattleActive = false;
        this.stopBattleLoop();
        
        // 确定战斗结果
        const playerWon = this.player && this.player.isAlive;
        
        // 初始化奖励对象，无论战斗胜负都能访问
        let rewards = { items: [], skills: [] };
        
        // 记录战斗结果
        if (playerWon) {
            this.addBattleLog(`${this.player.name}获得了胜利！`);
            
            // 增加胜场数
            if (this.player) {
                this.player.wins += 1;
                
                // 增加击败敌人计数
                const oldLevel = this.player.getLevel();
                const newLevel = this.player.incrementDefeatedEnemies();
                
                // 检查是否升级
                if (newLevel > oldLevel) {
                    this.addBattleLog(`等级提升！当前等级：${newLevel}`);
                }
                
                // 获得属性点奖励
                this.player.availablePoints += 3;
                this.addBattleLog(`获得了3点属性点！`);
            }
            
            // 生成战利品
            rewards = this.generateRewards(this.enemy);
            if (rewards.items.length > 0) {
                this.addBattleLog('获得了战利品：');
                for (const item of rewards.items) {
                    this.addBattleLog(`- ${item.name}`);
                    // 检查背包容量
                    if (this.player) {
                        const maxSlots = this.player.backpackSlots || 12;
                        if (this.player.inventory.length < maxSlots) {
                            this.player.inventory.push(item);
                        } else {
                            // 背包已满，显示提示信息
                            this.addBattleLog(`警告：背包已满，无法获得${item.name}`);
                            // 如果游戏对象存在，使用游戏的日志方法显示给玩家
                            if (window.game && window.game.logMessage) {
                                window.game.logMessage(`只好将${item.name}丢掉了`);
                            }
                        }
                    }
                }
            }
            
            if (rewards.skills.length > 0) {
                this.addBattleLog('获得了技能书：');
                for (const skillBook of rewards.skills) {
                    this.addBattleLog(`- ${skillBook.name}`);
                    
                    // 检查玩家是否已经学会这个技能书对应的技能
                    if (this.player && window.game) {
                        const player = this.player;
                        const playerSkills = player.learnedSkills || [];
                        
                        if (playerSkills.includes(skillBook.skillId)) {
                            // 玩家已经学会这个技能，直接丢弃技能书
                            this.addBattleLog(`你已学会${skillBook.name.replace('技能书：', '')}，将技能书丢弃了。`);
                            if (window.game && window.game.logMessage) {
                                window.game.logMessage(`你已学会这个技能，丢弃了${skillBook.name}！`);
                            }
                            continue; // 跳过添加到背包的逻辑
                        }
                    }
                    
                    // 检查背包容量并将技能书添加到背包
                    if (this.player && this.player.inventory) {
                        const maxSlots = this.player.backpackSlots || 12;
                        if (this.player.inventory.length < maxSlots) {
                            this.player.inventory.push(skillBook);
                            this.addBattleLog(`获得了技能书：${skillBook.name}`);
                            // 只有真正获得技能书才添加到显示列表
                            rewards.items.push(skillBook);
                        } else {
                            // 背包已满，显示提示信息
                            this.addBattleLog(`警告：背包已满，无法获得${skillBook.name}`);
                            // 如果游戏对象存在，使用游戏的日志方法显示给玩家
                            if (window.game && window.game.logMessage) {
                                window.game.logMessage(`只好将${skillBook.name}丢掉了`);
                            }
                        }
                    }
                }
            }
        } else {
            this.addBattleLog(`${this.player.name}战斗失败了...`);
        }
        
        // 调用战斗结束回调
        if (this.onBattleEnd) {
            this.onBattleEnd(playerWon, {
                items: playerWon ? rewards.items : [],
                skills: playerWon ? rewards.skills : []
            });
        }
    }
    
    // 生成奖励
    generateRewards(enemy) {
        const rewards = {
            items: [],
            skills: []
        };
        
        // 根据敌人等级和掉落配置生成奖励
        if (enemy.drops) {
            // 处理敌人特定物品掉落
            if (enemy.drops.items && enemy.drops.items.length > 0) {
                for (const dropItem of enemy.drops.items) {
                    if (Math.random() < dropItem.chance) {
                        // 从物品库中查找对应ID的物品
                        const allItems = window.gameItems || [];
                        const itemTemplate = allItems.find(item => item.id === dropItem.itemId);
                        
                        if (itemTemplate) {
                            // 创建物品实例（深拷贝）
                            const itemInstance = Utils.deepClone(itemTemplate);
                            itemInstance.instanceId = Utils.generateUniqueId();
                            
                            // 为装备添加随机词条（如果有额外属性配置）
                            if (itemInstance.type === 'equipment' && itemInstance.quality > 0 && window.itemAffixes) {
                                this.addRandomAffixes(itemInstance);
                            }
                            
                            // 根据物品类型添加到相应列表
                            if (itemInstance.type === 'skillBook') {
                                rewards.skills.push(itemInstance);
                            } else {
                                rewards.items.push(itemInstance);
                            }
                        }
                    }
                }
            }
            
            // 如果特定掉落没有触发，添加一个基础掉落几率
            // 基础装备掉落（30%几率）
            if (rewards.items.length === 0 && Math.random() < 0.3) {
                const item = Utils.generateRandomItem();
                if (item) {
                    rewards.items.push(item);
                }
            }
            
            // 基础技能书掉落（10%几率）
            if (rewards.skills.length === 0 && Math.random() < 0.1) {
                const skillBook = Utils.generateRandomSkillBook();
                if (skillBook) {
                    rewards.skills.push(skillBook);
                }
            }
        }
        
        return rewards;
    }
    
    // 为装备添加随机词条（从utils.js复制逻辑以保持一致性）
    addRandomAffixes(item) {
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
    
    // 添加战斗日志
    addBattleLog(message) {
        this.battleLog.push(message);
        
        // 限制日志数量
        if (this.battleLog.length > 50) {
            this.battleLog.shift();
        }
        
        // 触发日志更新回调（如果有）
        if (this.onLogUpdate) {
            this.onLogUpdate(message);
        }
    }
    
    // 逃跑（提前结束战斗）
    fleeBattle() {
        this.isBattleActive = false;
        this.stopBattleLoop();
        
        this.addBattleLog(`${this.player.name}成功逃离了战斗！`);
        
        if (this.onBattleEnd) {
            this.onBattleEnd(false, { items: [], skills: [] });
        }
    }
    
    // 获取战斗状态
    getBattleState() {
        return {
            isActive: this.isBattleActive,
            player: {
                hp: this.player?.currentHp || 0,
                maxHp: this.player?.combatStats?.hp || 0
            },
            enemy: {
                hp: this.enemy?.currentHp || 0,
                maxHp: this.enemy?.baseStats?.hp || 0
            },
            log: [...this.battleLog]
        };
    }
}

// 创建战斗管理器实例
const battleManager = new BattleManager();

// 导出战斗管理器
if (typeof window !== 'undefined') {
    window.BattleManager = BattleManager;
    window.battleManager = battleManager;
}