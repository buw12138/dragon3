// 游戏主逻辑
// 这个文件是游戏的主控制文件，负责初始化游戏、处理用户界面交互和整合所有游戏模块

// 游戏主类
class Game {
    constructor() {
        // 游戏状态
        this.player = null;
        this.currentEnemy = null;
        this.isGameInitialized = false;
        
        // 初始化UI对象，避免undefined错误
        this.ui = {};
        
        // 战斗管理器引用 - 暂时不赋值，在init时获取
        this.battleManager = null;
        
        // 战斗UI更新循环
        this.battleUIUpdateLoop = null;
        
        // 注意：不再在构造函数中立即调用init()，而是让initGame()函数控制初始化时机
    }
    
    // 初始化游戏
    init() {
        // 初始化战斗管理器引用
        this.battleManager = window.battleManager;
        
        // 加载游戏配置
        this.loadGameConfig();
        
        // 加载玩家数据
        this.loadPlayerData();
        
        // 初始化UI
        this.initUI();
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 初始化战斗管理器
        this.initBattleManager();
        
        // 初始化游戏UI显示
        this.initializeUIDisplay();
        
        // 设置游戏已初始化标志
        this.isGameInitialized = true;
        
        // 开始游戏循环
        this.startGameLoop();
    }
    
    // 加载游戏配置
    loadGameConfig() {
        // 加载游戏技能配置
        this.gameSkills = window.gameSkills || [];
        
        // 加载游戏物品配置
        this.gameItems = window.gameItems || [];
        
        // 加载敌人配置
        this.gameEnemies = window.gameEnemies || [];
    }
    
    // 加载玩家数据
    loadPlayerData() {
        // 尝试从本地存储加载玩家数据
        const savedData = Utils.loadFromStorage('playerData');
        
        // 如果有保存的数据，使用它初始化玩家
        if (savedData) {
            this.player = createPlayer(savedData);
            this.logMessage('欢迎回来，' + this.player.name + '！你已获得' + this.player.wins + '场胜利。');
        } else {
            // 创建新玩家
            this.player = createPlayer();
            this.logMessage('创建了新角色！初始拥有' + this.player.availablePoints + '点属性点。');
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
        if (window.battleManager) {
            this.battleManager = window.battleManager;
            console.log('战斗管理器初始化成功');
        } else {
            console.error('战斗管理器未找到');
        }
    }
    
    // 初始化UI
    initUI() {
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
            
            // 模态框元素
            characterModal: document.getElementById('character-modal'),
            inventoryModal: document.getElementById('inventory-modal'),
            skillsModal: document.getElementById('skills-modal'),
            battleEndModal: document.getElementById('battle-end-modal'),
            
            // 角色面板元素
            characterStats: document.getElementById('character-stats'),
            characterCombatStats: document.getElementById('character-combat-stats'),
            characterEquipment: document.getElementById('character-equipment'),
            statPointsDisplay: document.getElementById('available-stat-points'),
            
            // 属性分配按钮
        allocateStrength: document.getElementById('allocate-strength'),
        allocateAgility: document.getElementById('allocate-agility'),
        allocateIntelligence: document.getElementById('allocate-intelligence'),
        allocateStamina: document.getElementById('allocate-stamina'),
            
            // 战斗结果元素
            battleResult: document.getElementById('battle-result'),
            battleRewards: document.getElementById('battle-rewards'),
            
            // 关闭按钮
            closeButtons: document.querySelectorAll('.close-modal')
        };
    }
    
    // 绑定事件监听器
    bindEventListeners() {
        // 开始战斗按钮
        if (this.ui.startButton) {
            this.ui.startButton.addEventListener('click', () => this.startBattle());
        }
        
        // 逃离战斗按钮
        if (this.ui.fleeButton) {
            this.ui.fleeButton.addEventListener('click', () => this.fleeBattle());
        }
        
        // 显示角色面板按钮
        if (this.ui.characterButton) {
            this.ui.characterButton.addEventListener('click', () => this.showModal('character'));
        }
        
        // 显示背包按钮
        if (this.ui.inventoryButton) {
            this.ui.inventoryButton.addEventListener('click', () => this.showModal('inventory'));
        }
        
        // 显示技能按钮
        if (this.ui.skillsButton) {
            this.ui.skillsButton.addEventListener('click', () => this.showModal('skills'));
        }
        
        // 属性分配按钮
        if (this.ui.allocateStrength) {
            this.ui.allocateStrength.addEventListener('click', () => this.allocateStatPoint('strength'));
        }
        
        if (this.ui.allocateAgility) {
            this.ui.allocateAgility.addEventListener('click', () => this.allocateStatPoint('agility'));
        }
        
        if (this.ui.allocateIntelligence) {
            this.ui.allocateIntelligence.addEventListener('click', () => this.allocateStatPoint('intelligence'));
        }
        
        if (this.ui.allocateStamina) {
            this.ui.allocateStamina.addEventListener('click', () => this.allocateStatPoint('stamina'));
        }
        
        // 关闭模态框按钮
        if (this.ui.closeButtons) {
            this.ui.closeButtons.forEach(button => {
                button.addEventListener('click', () => this.hideAllModals());
            });
        }
        
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
        console.log('游戏即将开始');
        if (!this.player) {
            console.error('玩家对象未初始化');
            this.logMessage('错误：玩家数据未加载');
            return;
        }
        
        if (this.battleManager?.isBattleActive) {
            console.log('战斗已在进行中');
            return;
        }
        
        // 生成随机敌人
        const playerLevel = this.player.getLevel();
        const enemyData = window.generateEnemy(playerLevel);
        
        if (!enemyData) {
            console.error('无法生成敌人数据');
            this.logMessage('无法生成敌人，请稍后再试。');
            return;
        }
        
        console.log('生成敌人数据:', enemyData.name);
        
        // 使用createEnemy函数创建完整的敌人实例
        const enemy = window.createEnemy(enemyData);
        this.currentEnemy = enemy;
        
        console.log('创建敌人实例成功，准备开始战斗');
        
        // 开始战斗
        if (this.battleManager) {
            // 设置战斗日志更新回调
            this.battleManager.onLogUpdate = (message) => {
                this.logBattleMessage(message);
            };
            
            this.battleManager.initBattle(this.player, enemy, (playerWon, rewards) => {
                this.handleBattleEnd(playerWon, rewards);
            });
            
            // 更新UI
            this.updateBattleUI();
            
            // 启动战斗UI更新循环
            this.startBattleUIUpdateLoop();
        } else {
            console.error('战斗管理器未初始化');
            this.logMessage('错误：战斗系统未准备好');
        }
        
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
        this.logMessage('你成功逃脱了战斗！');
        
        // 停止战斗UI更新循环
        this.stopBattleUIUpdateLoop();
        
        // 重置战斗UI状态
        if (this.ui.startButton) {
            this.ui.startButton.disabled = false;
        }
        
        if (this.ui.fleeButton) {
            this.ui.fleeButton.disabled = true;
        }
    }
    
    // 启动战斗UI更新循环
    startBattleUIUpdateLoop() {
        // 清除可能存在的旧循环
        this.stopBattleUIUpdateLoop();
        
        // 设置新的循环，每100毫秒更新一次UI
        this.battleUIUpdateLoop = setInterval(() => {
            if (this.battleManager && this.battleManager.isBattleActive) {
                this.updateBattleUI();
            } else {
                this.stopBattleUIUpdateLoop();
            }
        }, 100);
    }
    
    // 停止战斗UI更新循环
    stopBattleUIUpdateLoop() {
        if (this.battleUIUpdateLoop) {
            clearInterval(this.battleUIUpdateLoop);
            this.battleUIUpdateLoop = null;
        }
    }
    
    // 处理战斗结束
    handleBattleEnd(playerWon, rewards) {
        // 停止战斗UI更新循环
        this.stopBattleUIUpdateLoop();
        
        // 更新UI
        this.updateBattleUI();
        
        // 检查玩家是否失败（死亡）
        if (!playerWon) {
            // 显示死亡提示弹窗
            alert('你真菜，这就死了');
            
            // 重置玩家数据
            this.resetPlayerData();
        } else {
            // 保存玩家数据（只有胜利时才保存）
            this.savePlayerData();
        }
        
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
                            rewardsHTML += '<li style="color: ' + qualityColor + '">' + item.name + '</li>';
                        }
                        rewardsHTML += '</ul>';
                    }
                    
                    if (rewards.skills && rewards.skills.length > 0) {
                        rewardsHTML += '<h4>技能书：</h4><ul>';
                        for (const skill of rewards.skills) {
                            rewardsHTML += '<li>' + skill.name + '</li>';
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
    
    // 重置玩家数据
    resetPlayerData() {
        // 清除本地存储中的玩家数据
        Utils.saveToStorage('playerData', null);
        
        // 创建新玩家（重置所有数据）
        this.player = createPlayer();
        
        // 记录日志
        this.logMessage('角色数据已重置！重新开始冒险吧！');
        
        // 更新所有相关UI显示
        this.updateInventoryDisplay();
        this.updateSkillsDisplay();
        this.initializeUIDisplay();
    }
    
    // 更新战斗UI
    updateBattleUI() {
        const battleState = this.battleManager?.getBattleState();
        
        if (!battleState) return;
        
        // 更新玩家面板
        if (this.ui.playerPanel) {
            const playerLevel = this.ui.playerPanel.querySelector('.character-level');
            if (playerLevel) {
                playerLevel.textContent = '等级 ' + (this.player.level || 1);
            }
            
            // 更新HP条
            const playerHpBar = this.ui.playerPanel.querySelector('.hp-bar-fill');
            if (playerHpBar && battleState.player) {
                const hpPercent = (battleState.player.hp / battleState.player.maxHp) * 100;
                playerHpBar.style.width = hpPercent + '%';
                
                // 更新HP文本
                const hpText = this.ui.playerPanel.querySelector('.hp-text');
                if (hpText) {
                    hpText.textContent = Math.floor(battleState.player.hp) + '/' + battleState.player.maxHp;
                }
            }
        }
        
        // 更新敌人面板
        if (this.ui.enemyPanel && this.currentEnemy) {
            const enemyName = this.ui.enemyPanel.querySelector('.character-name');
            if (enemyName) {
                enemyName.textContent = this.currentEnemy.name;
            }
            
            const enemyLevel = this.ui.enemyPanel.querySelector('.character-level');
            if (enemyLevel) {
                enemyLevel.textContent = '等级 ' + this.currentEnemy.level;
            }
            
            // 更新HP条
            const enemyHpBar = this.ui.enemyPanel.querySelector('.hp-bar-fill');
            if (enemyHpBar && battleState.enemy) {
                const hpPercent = (battleState.enemy.hp / battleState.enemy.maxHp) * 100;
                enemyHpBar.style.width = hpPercent + '%';
                
                // 更新HP文本
                const hpText = this.ui.enemyPanel.querySelector('.hp-text');
                if (hpText) {
                    hpText.textContent = Math.floor(battleState.enemy.hp) + '/' + battleState.enemy.maxHp;
                }
            }
        }
    }
    
    // 初始化游戏UI显示
    initializeUIDisplay() {
        // 设置玩家面板初始状态
        if (this.ui.playerPanel && this.player) {
            const playerLevel = this.ui.playerPanel.querySelector('.character-level');
            if (playerLevel) {
                playerLevel.textContent = '等级 ' + (this.player.level || 1);
            }
            
            // 更新HP显示
            const playerHpText = this.ui.playerPanel.querySelector('.hp-text');
            if (playerHpText && this.player.combatStats) {
                playerHpText.textContent = Math.floor(this.player.combatStats.hp) + '/' + Math.floor(this.player.combatStats.hp);
            }
            
            // 设置HP条为满值
            const playerHpBar = this.ui.playerPanel.querySelector('.hp-bar-fill');
            if (playerHpBar) {
                playerHpBar.style.width = '100%';
            }
        }
        
        // 初始化角色面板
        this.updateCharacterPanel();
    }
    
    // 更新角色面板
    updateCharacterPanel() {
        if (!this.ui.characterStats || !this.ui.characterCombatStats || !this.player) return;
        
        // 更新基础属性
        let statsHTML = '<h4>基础属性</h4><table>';
        const baseStats = this.player.baseStats;
        
        statsHTML += '<tr><td>力量：</td><td>' + baseStats.strength + '</td></tr>';
        statsHTML += '<tr><td>敏捷：</td><td>' + baseStats.agility + '</td></tr>';
        statsHTML += '<tr><td>智力：</td><td>' + baseStats.intelligence + '</td></tr>';
        statsHTML += '<tr><td>耐力：</td><td>' + baseStats.stamina + '</td></tr>';
        statsHTML += '</table>';
        
        this.ui.characterStats.innerHTML = statsHTML;
        
        // 更新可用属性点
        if (this.ui.statPointsDisplay) {
            this.ui.statPointsDisplay.textContent = '可用属性点：' + this.player.availablePoints;
        }
        
        // 更新战斗属性
        let combatStatsHTML = '<h4>战斗属性</h4><table>';
        const combatStats = this.player.combatStats;
        
        combatStatsHTML += '<tr><td>攻击：</td><td>' + Math.floor(combatStats.attack) + '</td></tr>';
        combatStatsHTML += '<tr><td>魔力：</td><td>' + Math.floor(combatStats.magic) + '</td></tr>';
        combatStatsHTML += '<tr><td>攻速：</td><td>' + combatStats.speed.toFixed(2) + '</td></tr>';
        combatStatsHTML += '<tr><td>暴击率：</td><td>' + Utils.formatCombatStat('critRate', combatStats.critRate) + '</td></tr>';
        combatStatsHTML += '<tr><td>暴击伤害：</td><td>+' + Utils.formatCombatStat('critDamage', combatStats.critDamage - 1) + '</td></tr>';
        combatStatsHTML += '<tr><td>生命值：</td><td>' + Math.floor(combatStats.hp) + '</td></tr>';
        combatStatsHTML += '<tr><td>防御：</td><td>' + Math.floor(combatStats.defense) + '</td></tr>';
        combatStatsHTML += '<tr><td>闪避率：</td><td>' + Utils.formatCombatStat('dodgeRate', combatStats.dodgeRate) + '</td></tr>';
        combatStatsHTML += '<tr><td>格挡率：</td><td>' + Utils.formatCombatStat('blockRate', combatStats.blockRate) + '</td></tr>';
        combatStatsHTML += '<tr><td>格挡值：</td><td>' + Math.floor(combatStats.blockValue) + '</td></tr>';
        combatStatsHTML += '<tr><td>冷却缩减：</td><td>' + Utils.formatCombatStat('cdr', combatStats.cdr) + '</td></tr>';
        
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
                    equipmentHTML += '<div class="equipment-slot">';
                    equipmentHTML += '<div class="slot-name">' + name + '</div>';
                    equipmentHTML += '<div class="slot-item" style="color: ' + qualityColor + '">' + item.name + '</div>';
                    equipmentHTML += '</div>';
                } else {
                    equipmentHTML += '<div class="equipment-slot">';
                    equipmentHTML += '<div class="slot-name">' + name + '</div>';
                    equipmentHTML += '<div class="slot-empty">未装备</div>';
                    equipmentHTML += '</div>';
                }
            }
            
            equipmentHTML += '</div>';
            this.ui.characterEquipment.innerHTML = equipmentHTML;
        }
    }
    
    // 分配属性点
    allocateStatPoint(statName) {
        if (!this.player || this.player.availablePoints <= 0) {
            this.logMessage('没有可用的属性点了！');
            return;
        }
        
        this.player.allocateStatPoint(statName);
        
        // 更新UI
        this.updateCharacterPanel();
    }
    
    // 获取属性名称文本
    getStatName(statName) {
        const names = {
            strength: '力量',
            agility: '敏捷',
            intelligence: '智力',
            stamina: '耐力'
        };
        
        return names[statName] || statName;
    }
    
    // 显示模态框
    showModal(modalType) {
        // 先隐藏所有模态框
        this.hideAllModals();
        
        // 显示指定模态框
        if (modalType === 'character') {
            // 更新角色面板数据
            this.updateCharacterPanel();
            this.ui.characterModal.style.display = 'flex';
        } else if (modalType === 'inventory') {
            // 更新背包数据
            this.updateInventoryDisplay();
            this.ui.inventoryModal.style.display = 'flex';
        } else if (modalType === 'skills') {
            // 更新技能数据
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
                
                inventoryHTML += '<div class="inventory-item">';
                inventoryHTML += '<div class="item-name" style="color: ' + qualityColor + '">' + item.name + '</div>';
                inventoryHTML += '<div class="item-type">' + this.getItemTypeText(item.type) + '</div>';
                inventoryHTML += '<div class="item-description">' + item.description + '</div>';
                if (item.type === 'equipment') {
                    inventoryHTML += '<button class="equip-button" data-index="' + i + '">装备</button>';
                }
                inventoryHTML += '</div>';
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
    
    // 从背包装备物品
    equipItemFromInventory(index) {
        if (!this.player || index < 0 || index >= this.player.inventory.length) return;
        
        const item = this.player.inventory[index];
        
        if (item.type !== 'equipment') {
            this.logMessage('这不是装备！');
            return;
        }
        
        // 尝试装备物品
        const success = this.player.equipItem(item);
        
        if (success) {
            // 从背包移除物品
            this.player.inventory.splice(index, 1);
            this.logMessage('成功装备了' + item.name + '！');
            
            // 更新UI
            this.updateInventoryDisplay();
            this.updateCharacterPanel();
        } else {
            this.logMessage('无法装备此物品！');
        }
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
                    
                    skillsHTML += '<div class="skill-item';
                    if (isEquipped) {
                        skillsHTML += ' equipped';
                    }
                    skillsHTML += '">';
                    skillsHTML += '<div class="skill-name">' + skill.name + '</div>';
                    skillsHTML += '<div class="skill-type">' + (skill.type === 'active' ? '主动' : '被动') + '</div>';
                    skillsHTML += '<div class="skill-description">' + skill.description + '</div>';
                    
                    if (isEquipped) {
                        skillsHTML += '<div class="skill-slot">装备于记忆栏位 ' + (slotIndex + 1) + '</div>';
                        skillsHTML += '<button class="unequip-button" data-id="' + skillId + '" data-slot="' + slotIndex + '">卸下</button>';
                    } else {
                        skillsHTML += '<button class="equip-skill-button" data-id="' + skillId + '">装备到记忆栏位</button>';
                    }
                    
                    skillsHTML += '</div>';
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
                    skillsHTML += '<div class="memory-slot occupied">';
                    skillsHTML += '<div class="slot-number">' + (i + 1) + '</div>';
                    skillsHTML += '<div class="slot-skill-name">' + skill.name + '</div>';
                    skillsHTML += '<button class="unequip-slot-button" data-slot="' + i + '">移除</button>';
                    skillsHTML += '</div>';
                }
            } else {
                skillsHTML += '<div class="memory-slot empty">';
                skillsHTML += '<div class="slot-number">' + (i + 1) + '</div>';
                skillsHTML += '<div class="slot-empty">未装备</div>';
                skillsHTML += '</div>';
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
        // 查找第一个空的记忆栏位
        const emptySlotIndex = this.player.memorySlots.findIndex(slot => !slot);
        
        if (emptySlotIndex === -1) {
            this.logMessage('记忆栏位已满！');
            return;
        }
        
        // 装备技能到空栏位
        this.player.memorySlots[emptySlotIndex] = skillId;
        this.logMessage('成功装备技能到记忆栏位！');
        
        // 更新技能显示
        this.updateSkillsDisplay();
    }
    
    // 从记忆栏位卸下技能
    unequipSkillFromMemory(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.player.memorySlots.length) return;
        
        this.player.memorySlots[slotIndex] = null;
        this.logMessage('成功卸下技能！');
        
        // 更新技能显示
        this.updateSkillsDisplay();
    }
    
    // 获取技能名称
    getSkillName(skillId) {
        const skill = this.gameSkills.find(s => s.id === skillId);
        return skill ? skill.name : '未知技能';
    }
    
    // 记录消息
    logMessage(message) {
        const logElement = document.createElement('div');
        logElement.className = 'log-message';
        logElement.textContent = message;
        
        // 先检查this.ui是否存在，再检查battleLog
        if (this.ui && this.ui.battleLog) {
            this.ui.battleLog.appendChild(logElement);
            this.ui.battleLog.scrollTop = this.ui.battleLog.scrollHeight;
        }
    }
    
    // 记录战斗消息
    logBattleMessage(message) {
        const logElement = document.createElement('div');
        logElement.className = 'battle-log-message';
        logElement.textContent = message;
        
        // 先检查this.ui是否存在，再检查battleLog
        if (this.ui && this.ui.battleLog) {
            this.ui.battleLog.appendChild(logElement);
            this.ui.battleLog.scrollTop = this.ui.battleLog.scrollHeight;
        }
    }
    
    // 开始游戏循环
    startGameLoop() {
        // 游戏主循环，每100ms更新一次
        setInterval(() => {
            // 更新战斗UI
            if (this.battleManager?.isBattleActive) {
                this.updateBattleUI();
            }
        }, 100);
    }
}

// 初始化游戏
function initGame() {
    console.log('游戏初始化开始');
    
    // 检查是否已经初始化了游戏
    if (window.game) {
        console.log('游戏已经初始化');
        return;
    }
    
    // 创建游戏实例
    window.game = new Game();
    
    // 确保DOM内容加载完成后再初始化游戏
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.game.init();
        });
    } else {
        // 如果DOM已经加载完成，直接初始化
        window.game.init();
    }
    
    console.log('游戏初始化完成');
}

// 导出初始化函数
if (typeof window !== 'undefined') {
    window.initGame = initGame;
}