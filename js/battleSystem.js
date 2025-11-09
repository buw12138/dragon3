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
        
        // 技能释放概率配置
        this.skillCastChance = 0.3; // 30%几率释放技能
        
        // 技能冷却（毫秒）
        this.skillsOnCooldown = {};
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
        
        // 添加战斗开始日志
        this.addBattleLog(`${player.name}与${enemy.name}的战斗开始了！`);
        
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
        // 玩家攻击
        if (this.player && this.player.isAlive) {
            if (this.player.canPerformAttack()) {
                this.playerAttack();
            }
        }
        
        // 敌人攻击
        if (this.enemy && this.enemy.isAlive) {
            if (this.enemy.canPerformAttack()) {
                this.enemyAttack();
            }
        }
    }
    
    // 玩家攻击
    playerAttack() {
        // 检查是否释放技能
        const availableSkills = this.player.getAvailableActiveSkills();
        
        if (availableSkills.length > 0 && Math.random() < this.skillCastChance) {
            // 随机选择一个可用技能
            const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            this.castSkill(this.player, skill, this.enemy);
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
        if (behavior.useSkills && behavior.skills && behavior.skills.length > 0 && Math.random() < 0.4) {
            // 随机选择一个可用技能
            const skillId = behavior.skills[Math.floor(Math.random() * behavior.skills.length)];
            const enemySkill = window.enemySkills[skillId];
            
            if (enemySkill) {
                this.castEnemySkill(this.enemy, enemySkill, this.player);
            } else {
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
            // 检查吸血效果
            const lifesteal = attacker.combatStats?.lifesteal || 0;
            if (lifesteal > 0) {
                const healAmount = Math.floor(actualDamage * lifesteal);
                attacker.heal(healAmount);
                this.addBattleLog(`${attacker.name}通过吸血恢复了${healAmount}点生命值！`);
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
        
        // 调用技能的效果函数
        const effectResult = skill.applyEffect(caster, target, this);
        
        // 如果技能造成了伤害，添加受击震动效果
        if (effectResult && effectResult.damage && effectResult.damage > 0) {
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
                    // 添加到玩家背包
                    if (this.player) {
                        this.player.inventory.push(item);
                    }
                }
            }
            
            if (rewards.skills.length > 0) {
                this.addBattleLog('获得了技能书：');
                for (const skillBook of rewards.skills) {
                    this.addBattleLog(`- ${skillBook.name}`);
                    // 自动学习技能
                    if (this.player && this.player.learnSkill(skillBook.skillId)) {
                        this.addBattleLog(`学会了新技能：${skillBook.name}！`);
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
            // 生成装备
            if (enemy.drops.itemChance && Math.random() < enemy.drops.itemChance) {
                const item = Utils.generateRandomItem(enemy.level);
                if (item) {
                    rewards.items.push(item);
                }
            }
            
            // 生成技能书
            if (enemy.drops.skillChance && Math.random() < enemy.drops.skillChance) {
                const skillBook = Utils.generateRandomSkillBook(enemy.level);
                if (skillBook) {
                    rewards.skills.push(skillBook);
                }
            }
        }
        
        return rewards;
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