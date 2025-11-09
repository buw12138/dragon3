// 游戏主逻辑
// 这个文件是游戏的主控制文件，负责初始化游戏、处理用户界面交互和整合所有游戏模块

// 游戏主类
class Game {
    constructor() {
        // 游戏状态
        this.player = null;
        this.currentEnemy = null;
        this.isGameInitialized = false;
        
        // 战斗管理器引用
        this.battleManager = window.battleManager;
        
        // 初始化游戏
        this.init();
    }
    
    // 初始化游戏
    init() {
        // 等待所有资源加载完成
        document.addEventListener('DOMContentLoaded', () => {
            // 加载游戏配置
            this.loadGameConfig();
            
            // 加载玩家数据
            this.loadPlayerData();
            
            // 初始化UI
            this.initUI();
            
            // 初始化战斗管理器
            this.initBattleManager();
            
            // 标记游戏已初始化
            this.isGameInitialized = true;
            
            // 显示欢迎信息
            this.logMessage('欢迎来到大乐斗游戏！点击「开始战斗」挑战敌人。');
            
            // 更新UI显示
            this.updateCharacterPanel();
        });
    }
    
    // 加载游戏配置
    loadGameConfig() {
        // 从window对象获取配置数据
        this.gameConstants = window.Constants || {};
        this.gameItems = window.gameItems || [];
        this.gameSkills = window.gameSkills || [];
        this.enemies = window.enemies || [];
        this.enemySkills = window.enemySkills || [];
        
        // 存储在window对象中供其他模块使用
        window.gameSkills = this.gameSkills;
        window.statusEffects = window.statusEffects || {};
    }
    
    // 加载玩家数据
    loadPlayerData() {
        // 尝试从本地存储加载玩家数据
        const savedData = Utils.loadFromStorage('playerData');
        
        // 如果有保存的数据，使用它初始化玩家
        if (savedData) {
            this.player = createPlayer(savedData);
            this.logMessage(`欢迎回来，${this.player.name}！你已获得${this.player.wins}场胜利。`);
        } else {
            // 创建新玩家
            this.player = createPlayer();
            this.logMessage(`创建了新角色！初始拥有${this.player.availablePoints}点属性点。`);
        }
    }
    
    // 保存玩家数据
    savePlayerData() {
        if (!this.player) return;
        
        const playerData = this.player.getBattleData();
        Utils.saveToStorage('playerData', playerData);
    }
    
    // 初始化战斗管理器
    initBattleManager() {
        if (!this.battleManager) {
            this.battleManager = new BattleManager();
        }
        
        // 设置战斗管理器回调
        this.battleManager.onBattleEnd = (playerWon, rewards) => {
            this.handleBattleEnd(playerWon, rewards);
        };
        
        this.battleManager.onLogUpdate = (message) => {
            this.logBattleMessage(message);
        };
    }
    
    // 初始化UI
    initUI() {
        // 获取UI元素
        this.ui = {
            battleScene: document.getElementById('battle-scene'),
            playerPanel: document.getElementById('player-panel'),
            enemyPanel: document.getElementById('enemy-panel'),
            battleLog: document.getElementById('battle-log'),
            startButton: document.getElementById('start-battle'),
            fleeButton: document.getElementById('flee-battle'),
            characterButton: document.getElementById('show-character'),
            inventoryButton: document.getElementById('show-inventory'),
            skillsButton: document.getElementById('show-skills'),
            
            // 模态框
            characterModal: document.getElementById('character-modal'),
            inventoryModal: document.getElementById('inventory-modal'),
            skillsModal: document.getElementById('skills-modal'),
            battleEndModal: document.getElementById('battle-end-modal'),
            
            // 角色面板元素
            characterStats: document.getElementById('character-stats'),
            characterCombatStats: document.getElementById('character-combat-stats'),
            characterEquipment: document.getElementById('character-equipment'),
            statPointsDisplay: document.getElementById('available-stat-points'),
            
            // 属性点分配按钮
            allocateStrength: document.getElementById('allocate-strength'),
            allocateAgility: document.getElementById('allocate-agility'),
            allocateIntelligence: document.getElementById('allocate-intelligence'),
            allocateEndurance: document.getElementById('allocate-endurance'),
            
            // 战斗结束模态框元素
            battleResult: document.getElementById('battle-result'),
            battleRewards: document.getElementById('battle-rewards'),
            
            // 关闭按钮
            closeButtons: document.querySelectorAll('.close-modal')
        };
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 初始化UI显示
        this.initializeUIDisplay();
    }
    
    // 绑定事件监听器
    bindEventListeners() {
        // 战斗控制按钮
        if (this.ui.startButton) {
            this.ui.startButton.addEventListener('click', () => this.startBattle());
        }
        
        if (this.ui.fleeButton) {
            this.ui.fleeButton.addEventListener('click', () => this.fleeBattle());
        }
        
        // 模态框控制按钮
        if (this.ui.characterButton) {
            this.ui.characterButton.addEventListener('click', () => this.showModal('character'));
        }
        
        if (this.ui.inventoryButton) {
            this.ui.inventoryButton.addEventListener('click', () => this.showModal('inventory'));
        }
        
        if (this.ui.skillsButton) {
            this.ui.skillsButton.addEventListener('click', () => this.showModal('skills'));
        }
        
        // 属性点分配按钮
        if (this.ui.allocateStrength) {
            this.ui.allocateStrength.addEventListener('click', () => this.allocateStatPoint('strength'));
        }
        
        if (this.ui.allocateAgility) {
            this.ui.allocateAgility.addEventListener('click', () => this.allocateStatPoint('agility'));
        }
        
        if (this.ui.allocateIntelligence) {
            this.ui.allocateIntelligence.addEventListener('click', () => this.allocateStatPoint('intelligence'));
        }
        
        if (this.ui.allocateEndurance) {
            this.ui.allocateEndurance.addEventListener('click', () => this.allocateStatPoint('endurance'));
        }
        
        // 关闭模态框按钮
        this.ui.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.hideAllModals());
        });
        
        // 点击模态框背景关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
    }
    
    // 开始战斗
    startBattle() {
        if (!this.player || this.battleManager?.isBattleActive) return;
        
        // 生成随机敌人
        const playerLevel = this.player.getLevel();
        const enemy = window.generateEnemy(playerLevel);
        
        if (!enemy) {
            this.logMessage('无法生成敌人，请稍后再试。');
            return;
        }
        
        this.currentEnemy = enemy;
        
        // 开始战斗
        this.battleManager.initBattle(this.player, enemy, (playerWon, rewards) => {
            this.handleBattleEnd(playerWon, rewards);
        });
        
        // 更新UI
        this.updateBattleUI();
        
        // 禁用开始战斗按钮
        if (this.ui.startButton) {
            this.ui.startButton.disabled = true;
        }
        
        if (this.ui.fleeButton) {
            this.ui.fleeButton.disabled = false;
        }
    }
    
    // 逃离战斗
    fleeBattle() {
        if (!this.battleManager?.isBattleActive) return;
        
        this.battleManager.fleeBattle();
    }
    
    // 处理战斗结束
    handleBattleEnd(playerWon, rewards) {
        // 更新UI
        this.updateBattleUI();
        
        // 保存玩家数据
        this.savePlayerData();
        
        // 显示战斗结束模态框
        if (this.ui.battleEndModal) {
            if (this.ui.battleResult) {
                this.ui.battleResult.textContent = playerWon ? '战斗胜利！' : '战斗失败！';
                this.ui.battleResult.className = playerWon ? 'win-text' : 'lose-text';
            }
            
            if (this.ui.battleRewards) {
                let rewardsHTML = '';
                
                if (playerWon) {
                    rewardsHTML += '<h4>获得奖励：</h4>';
                    rewardsHTML += '<p>3点属性点</p>';
                    
                    if (rewards.items && rewards.items.length > 0) {
                        rewardsHTML += '<h4>战利品：</h4><ul>';
                        for (const item of rewards.items) {
                            const qualityColor = Utils.getQualityColor(item.quality);
                            rewardsHTML += `<li style="color: ${qualityColor}">${item.name}</li>`;
                        }
                        rewardsHTML += '</ul>';
                    }
                    
                    if (rewards.skills && rewards.skills.length > 0) {
                        rewardsHTML += '<h4>技能书：</h4><ul>';
                        for (const skill of rewards.skills) {
                            rewardsHTML += `<li>${skill.name}</li>`;
                        }
                        rewardsHTML += '</ul>';
                    }
                } else {
                    rewardsHTML = '<p>再接再厉！</p>';
                }
                
                this.ui.battleRewards.innerHTML = rewardsHTML;
            }
            
            // 显示模态框
            this.ui.battleEndModal.style.display = 'flex';
        }
        
        // 重置战斗按钮状态
        setTimeout(() => {
            if (this.ui.startButton) {
                this.ui.startButton.disabled = false;
            }
            
            if (this.ui.fleeButton) {
                this.ui.fleeButton.disabled = true;
            }
        }, 500);
        
        // 更新角色面板
        this.updateCharacterPanel();
    }
    
    // 更新战斗UI
    updateBattleUI() {
        const battleState = this.battleManager?.getBattleState();
        
        if (!battleState) return;
        
        // 更新玩家面板
        if (this.ui.playerPanel && battleState.player) {
            // 更新等级显示
            const playerLevel = this.ui.playerPanel.querySelector('.character-level');
            if (playerLevel && this.player) {
                playerLevel.textContent = `等级 ${this.player.level || 1}`;
            }
            
            // 更新HP条
            const playerHpBar = this.ui.playerPanel.querySelector('.hp-bar-fill');
            if (playerHpBar) {
                const hpPercent = (battleState.player.hp / battleState.player.maxHp) * 100;
                playerHpBar.style.width = `${hpPercent}%`;
                
                // 更新HP文本
                const hpText = this.ui.playerPanel.querySelector('.hp-text');
                if (hpText) {
                    hpText.textContent = `${Math.floor(battleState.player.hp)}/${battleState.player.maxHp}`;
                }
            }
            
        }
        
        // 更新敌人面板
        if (this.ui.enemyPanel && battleState.enemy && this.currentEnemy) {
            // 更新敌人名称
            const enemyName = this.ui.enemyPanel.querySelector('.character-name');
            if (enemyName) {
                enemyName.textContent = this.currentEnemy.name;
            }
            
            // 更新敌人等级
            const enemyLevel = this.ui.enemyPanel.querySelector('.character-level');
            if (enemyLevel) {
                enemyLevel.textContent = `等级 ${this.currentEnemy.level}`;
            }
            
            // 更新HP条
            const enemyHpBar = this.ui.enemyPanel.querySelector('.hp-bar-fill');
            if (enemyHpBar) {
                const hpPercent = (battleState.enemy.hp / battleState.enemy.maxHp) * 100;
                enemyHpBar.style.width = `${hpPercent}%`;
                
                // 更新HP文本
                const hpText = this.ui.enemyPanel.querySelector('.hp-text');
                if (hpText) {
                    hpText.textContent = `${Math.floor(battleState.enemy.hp)}/${battleState.enemy.maxHp}`;
                }
            }
        }
    }
    
    // 初始化UI显示
    initializeUIDisplay() {
        // 初始化玩家面板
        if (this.ui.playerPanel && this.player) {
            // 显示玩家等级
            const playerLevel = this.ui.playerPanel.querySelector('.character-level');
            if (playerLevel) {
                playerLevel.textContent = `等级 ${this.player.level || 1}`;
            }
            
            // 显示玩家血量
            const playerHpText = this.ui.playerPanel.querySelector('.hp-text');
            if (playerHpText) {
                const maxHp = this.player.combatStats?.hp || 100;
                playerHpText.textContent = `${maxHp}/${maxHp}`;
            }
            
            // 设置初始血量条
            const playerHpBar = this.ui.playerPanel.querySelector('.hp-bar-fill');
            if (playerHpBar) {
                playerHpBar.style.width = '100%';
            }
        }
    }
    
    // 更新角色面板
    updateCharacterPanel() {
        if (!this.player || !this.ui.characterStats || !this.ui.characterCombatStats) return;
        
        // 更新基础属性
        let statsHTML = '<h4>基础属性</h4><table>';
        const baseStats = this.player.baseStats;
        
        statsHTML += `
            <tr><td>力量：</td><td>${baseStats.strength}</td></tr>
            <tr><td>敏捷：</td><td>${baseStats.agility}</td></tr>
            <tr><td>智力：</td><td>${baseStats.intelligence}</td></tr>
            <tr><td>耐力：</td><td>${baseStats.endurance}</td></tr>
        `;
        
        statsHTML += '</table>';
        this.ui.characterStats.innerHTML = statsHTML;
        
        // 更新可用属性点
        if (this.ui.statPointsDisplay) {
            this.ui.statPointsDisplay.textContent = `可用属性点：${this.player.availablePoints}`;
        }
        
        // 更新战斗属性
        let combatStatsHTML = '<h4>战斗属性</h4><table>';
        const combatStats = this.player.combatStats;
        
        combatStatsHTML += `
            <tr><td>攻击：</td><td>${Math.floor(combatStats.attack)}</td></tr>
            <tr><td>魔力：</td><td>${Math.floor(combatStats.magic)}</td></tr>
            <tr><td>攻速：</td><td>${combatStats.speed.toFixed(2)}</td></tr>
            <tr><td>暴击率：</td><td>${Utils.formatPercent(combatStats.critRate)}</td></tr>
            <tr><td>暴击伤害：</td><td>+${Utils.formatPercent(combatStats.critDamage - 1)}</td></tr>
            <tr><td>生命值：</td><td>${Math.floor(combatStats.hp)}</td></tr>
            <tr><td>防御：</td><td>${Math.floor(combatStats.defense)}</td></tr>
            <tr><td>闪避率：</td><td>${Utils.formatPercent(combatStats.dodgeRate)}</td></tr>
            <tr><td>格挡率：</td><td>${Utils.formatPercent(combatStats.blockRate)}</td></tr>
            <tr><td>格挡值：</td><td>${Math.floor(combatStats.blockValue)}</td></tr>
            <tr><td>冷却缩减：</td><td>${Utils.formatPercent(combatStats.cdr)}</td></tr>
        `;
        
        combatStatsHTML += '</table>';
        this.ui.characterCombatStats.innerHTML = combatStatsHTML;
        
        // 更新装备显示
        if (this.ui.characterEquipment) {
            let equipmentHTML = '<h4>装备</h4><div class="equipment-grid">';
            
            const equipmentSlots = {
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
            
            for (const [slot, name] of Object.entries(equipmentSlots)) {
                const item = this.player.equipment[slot];
                
                if (item) {
                    const qualityColor = Utils.getQualityColor(item.quality);
                    equipmentHTML += `
                        <div class="equipment-slot">
                            <div class="slot-name">${name}</div>
                            <div class="slot-item" style="color: ${qualityColor}">${item.name}</div>
                        </div>
                    `;
                } else {
                    equipmentHTML += `
                        <div class="equipment-slot">
                            <div class="slot-name">${name}</div>
                            <div class="slot-empty">未装备</div>
                        </div>
                    `;
                }
            }
            
            equipmentHTML += '</div>';
            this.ui.characterEquipment.innerHTML = equipmentHTML;
        }
    }
    
    // 分配属性点
    allocateStatPoint(statName) {
        if (!this.player) return;
        
        const success = this.player.allocateStatPoint(statName);
        
        if (success) {
            this.logMessage(`成功分配1点到${this.getStatName(statName)}！`);
            this.updateCharacterPanel();
            this.savePlayerData();
        } else {
            this.logMessage('没有可用的属性点了！');
        }
    }
    
    // 获取属性名称（中文）
    getStatName(statName) {
        const names = {
            strength: '力量',
            agility: '敏捷',
            intelligence: '智力',
            endurance: '耐力'
        };
        
        return names[statName] || statName;
    }
    
    // 显示模态框
    showModal(modalType) {
        // 隐藏所有模态框
        this.hideAllModals();
        
        // 显示指定模态框
        if (modalType === 'character') {
            this.updateCharacterPanel();
            this.ui.characterModal.style.display = 'flex';
        } else if (modalType === 'inventory') {
            this.updateInventoryDisplay();
            this.ui.inventoryModal.style.display = 'flex';
        } else if (modalType === 'skills') {
            this.updateSkillsDisplay();
            this.ui.skillsModal.style.display = 'flex';
        }
    }
    
    // 隐藏所有模态框
    hideAllModals() {
        this.ui.characterModal.style.display = 'none';
        this.ui.inventoryModal.style.display = 'none';
        this.ui.skillsModal.style.display = 'none';
        this.ui.battleEndModal.style.display = 'none';
    }
    
    // 更新背包显示
    updateInventoryDisplay() {
        const inventoryContent = document.getElementById('inventory-content');
        if (!inventoryContent || !this.player) return;
        
        let inventoryHTML = '<div class="inventory-grid">';
        
        if (this.player.inventory.length === 0) {
            inventoryHTML += '<div class="empty-inventory">背包空空如也</div>';
        } else {
            for (let i = 0; i < this.player.inventory.length; i++) {
                const item = this.player.inventory[i];
                const qualityColor = Utils.getQualityColor(item.quality);
                
                inventoryHTML += `
                    <div class="inventory-item">
                        <div class="item-name" style="color: ${qualityColor}">${item.name}</div>
                        <div class="item-type">${this.getItemTypeText(item.type)}</div>
                        <div class="item-description">${item.description}</div>
                        ${item.type === 'equipment' ? `<button class="equip-button" data-index="${i}">装备</button>` : ''}
                    </div>
                `;
            }
        }
        
        inventoryHTML += '</div>';
        inventoryContent.innerHTML = inventoryHTML;
        
        // 绑定装备按钮事件
        const equipButtons = inventoryContent.querySelectorAll('.equip-button');
        equipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.equipItemFromInventory(index);
            });
        });
    }
    
    // 装备物品
    equipItemFromInventory(index) {
        if (!this.player || index < 0 || index >= this.player.inventory.length) return;
        
        const item = this.player.inventory[index];
        
        if (item.type !== 'equipment') {
            this.logMessage('这不是装备！');
            return;
        }
        
        const oldItem = this.player.equipItem(item);
        
        if (oldItem) {
            // 将旧装备放回背包（替换位置）
            this.player.inventory[index] = oldItem;
            this.logMessage(`装备了${item.name}，${oldItem.name}被替换。`);
        } else {
            // 从背包移除新装备
            this.player.inventory.splice(index, 1);
            this.logMessage(`成功装备了${item.name}！`);
        }
        
        // 更新显示
        this.updateInventoryDisplay();
        this.savePlayerData();
    }
    
    // 获取物品类型文本
    getItemTypeText(type) {
        const types = {
            equipment: '装备',
            consumable: '消耗品',
            skillBook: '技能书'
        };
        
        return types[type] || type;
    }
    
    // 更新技能显示
    updateSkillsDisplay() {
        const skillsContent = document.getElementById('skills-content');
        if (!skillsContent || !this.player) return;
        
        let skillsHTML = '';
        
        // 显示已学习的技能
        skillsHTML += '<h4>已学习的技能</h4>';
        
        if (this.player.learnedSkills.length === 0) {
            skillsHTML += '<div class="no-skills">还没有学习任何技能</div>';
        } else {
            skillsHTML += '<div class="skills-list">';
            
            for (const skillId of this.player.learnedSkills) {
                const skill = this.gameSkills.find(s => s.id === skillId);
                if (skill) {
                    const isEquipped = this.player.memorySlots.includes(skillId);
                    const slotIndex = this.player.memorySlots.indexOf(skillId);
                    
                    skillsHTML += `
                        <div class="skill-item ${isEquipped ? 'equipped' : ''}">
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-type">${skill.type === 'active' ? '主动' : '被动'}</div>
                            <div class="skill-description">${skill.description}</div>
                            ${isEquipped ? 
                                `<div class="skill-slot">装备于记忆栏位 ${slotIndex + 1}</div>
                                 <button class="unequip-button" data-id="${skillId}" data-slot="${slotIndex}">卸下</button>` : 
                                `<button class="equip-skill-button" data-id="${skillId}">装备到记忆栏位</button>`
                            }
                        </div>
                    `;
                }
            }
            
            skillsHTML += '</div>';
        }
        
        // 显示记忆栏位
        skillsHTML += '<h4>记忆栏位</h4>';
        skillsHTML += '<div class="memory-slots">';
        
        for (let i = 0; i < this.player.memorySlots.length; i++) {
            const skillId = this.player.memorySlots[i];
            
            if (skillId) {
                const skill = this.gameSkills.find(s => s.id === skillId);
                if (skill) {
                    skillsHTML += `
                        <div class="memory-slot occupied">
                            <div class="slot-number">${i + 1}</div>
                            <div class="slot-skill-name">${skill.name}</div>
                            <button class="unequip-slot-button" data-slot="${i}">移除</button>
                        </div>
                    `;
                }
            } else {
                skillsHTML += `
                    <div class="memory-slot empty">
                        <div class="slot-number">${i + 1}</div>
                        <div class="slot-empty">未装备</div>
                    </div>
                `;
            }
        }
        
        skillsHTML += '</div>';
        skillsContent.innerHTML = skillsHTML;
        
        // 绑定技能装备按钮事件
        const equipButtons = skillsContent.querySelectorAll('.equip-skill-button');
        equipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const skillId = e.target.getAttribute('data-id');
                this.showEquipSkillDialog(skillId);
            });
        });
        
        // 绑定技能卸下按钮事件
        const unequipButtons = skillsContent.querySelectorAll('.unequip-button, .unequip-slot-button');
        unequipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const slotIndex = parseInt(e.target.getAttribute('data-slot'));
                this.unequipSkillFromMemory(slotIndex);
            });
        });
    }
    
    // 显示装备技能对话框
    showEquipSkillDialog(skillId) {
        // 简化处理，找到第一个空位并装备
        const emptySlotIndex = this.player.memorySlots.indexOf(null);
        
        if (emptySlotIndex === -1) {
            this.logMessage('记忆栏位已满！');
            return;
        }
        
        const oldSkillId = this.player.equipSkillToMemory(skillId, emptySlotIndex);
        
        if (oldSkillId) {
            this.logMessage(`在记忆栏位 ${emptySlotIndex + 1} 装备了${this.getSkillName(skillId)}，替换了${this.getSkillName(oldSkillId)}。`);
        } else {
            this.logMessage(`成功在记忆栏位 ${emptySlotIndex + 1} 装备了${this.getSkillName(skillId)}！`);
        }
        
        // 更新显示
        this.updateSkillsDisplay();
        this.savePlayerData();
    }
    
    // 从记忆栏位卸下技能
    unequipSkillFromMemory(slotIndex) {
        const skillId = this.player.unequipSkillFromMemory(slotIndex);
        
        if (skillId) {
            this.logMessage(`从记忆栏位 ${slotIndex + 1} 卸下了${this.getSkillName(skillId)}。`);
            this.updateSkillsDisplay();
            this.savePlayerData();
        }
    }
    
    // 获取技能名称
    getSkillName(skillId) {
        const skill = this.gameSkills.find(s => s.id === skillId);
        return skill ? skill.name : '未知技能';
    }
    
    // 记录游戏消息
    logMessage(message) {
        const logElement = document.createElement('div');
        logElement.className = 'log-message';
        logElement.textContent = message;
        
        // 添加到战斗日志
        if (this.ui.battleLog) {
            this.ui.battleLog.appendChild(logElement);
            
            // 自动滚动到底部
            this.ui.battleLog.scrollTop = this.ui.battleLog.scrollHeight;
        }
    }
    
    // 记录战斗消息（使用不同样式）
    logBattleMessage(message) {
        const logElement = document.createElement('div');
        logElement.className = 'battle-log-message';
        logElement.textContent = message;
        
        // 添加到战斗日志
        if (this.ui.battleLog) {
            this.ui.battleLog.appendChild(logElement);
            
            // 自动滚动到底部
            this.ui.battleLog.scrollTop = this.ui.battleLog.scrollHeight;
        }
    }
    
    // 启动游戏循环（用于实时更新战斗UI）
    startGameLoop() {
        setInterval(() => {
            if (this.battleManager?.isBattleActive) {
                this.updateBattleUI();
            }
        }, 100);
    }
}

// 当文档加载完成后初始化游戏
function initGame() {
    // 等待所有配置文件加载完成
    setTimeout(() => {
        const game = new Game();
        game.startGameLoop();
        
        // 存储游戏实例到window对象
        window.game = game;
    }, 100);
}

// 导出初始化函数
if (typeof window !== 'undefined') {
    window.initGame = initGame;
}