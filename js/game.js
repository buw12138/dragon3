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
        
        // 事件绑定引用，用于正确移除事件监听器
        this._boundMouseEnter = null;
        this._boundMouseLeave = null;
        this._boundContextMenu = null;
        this._boundContextMenuItem = null;
        this._boundHideContextMenu = null;
        this._boundEquipmentMouseEnter = null;
        this._boundEquipmentMouseLeave = null;
        
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
            battleEndModal: document.getElementById('battle-end-modal'),
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
        
        // 绑定全局点击事件来关闭右键菜单（只绑定一次）
        if (!this._boundHideContextMenu) {
            this._boundHideContextMenu = this.hideContextMenu.bind(this);
            document.addEventListener('click', this._boundHideContextMenu);
        }
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
        
        // 关闭按钮
        if (this.ui.closeButtons) {
            this.ui.closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // 隐藏所有模态框
                    if (this.ui.battleEndModal) {
                        this.ui.battleEndModal.style.display = 'none';
                    }
                    
                    // 隐藏其他模态框
                    this.hideAllModals();
                });
            });
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
                            // 对于技能书类型的物品，使用红色而不是品质颜色
                            const colorClass = item.type === 'skillBook' ? 'skill-red' : Utils.getQualityColorClass(item.quality);
                            // 使用类名而不是直接的颜色值
                            rewardsHTML += '<li class="' + colorClass + '">' + item.name + '</li>';
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
                playerLevel.textContent = '等级 ' + (this.player.getLevel() || 1);
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
                playerLevel.textContent = '等级 ' + (this.player.getLevel() || 1);
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
        statsHTML += '<tr><td>等级：</td><td>' + this.player.getLevel() + '</td></tr>';
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
        combatStatsHTML += '<tr><td>防御：</td><td>' + Math.floor(combatStats.defense) + '</td></tr>';
        combatStatsHTML += '<tr><td>攻速：</td><td>' + combatStats.speed.toFixed(2) + '</td></tr>';
        combatStatsHTML += '<tr><td>暴击：</td><td>' + Utils.formatCombatStat('critRate', combatStats.critRate) + '</td></tr>';
        combatStatsHTML += '<tr><td>暴伤：</td><td>' + Utils.formatCombatStat('critDamage', combatStats.critDamage) + '</td></tr>';
        combatStatsHTML += '<tr><td>生命：</td><td>' + Math.floor(this.player.currentHp) + '/' + Math.floor(combatStats.hp) + '</td></tr>';
        combatStatsHTML += '<tr><td>闪避：</td><td>' + Utils.formatCombatStat('dodgeRate', combatStats.dodgeRate) + '</td></tr>';
        combatStatsHTML += '<tr><td>韧性：</td><td>' + Utils.formatCombatStat('blockRate', combatStats.blockRate) + '</td></tr>';
        combatStatsHTML += '<tr><td>韧度：</td><td>' + Math.floor(combatStats.blockValue) + '</td></tr>';
        combatStatsHTML += '<tr><td>冷却：</td><td>' + Utils.formatCombatStat('cdr', combatStats.cdr) + '</td></tr>';
        
        combatStatsHTML += '</table>';
        this.ui.characterCombatStats.innerHTML = combatStatsHTML;
        
        // 规范化特殊属性值
        this.player.normalizeSpecialAttributes();
        
        // 更新特殊属性显示
        let specialStatsHTML = '<h4>特殊属性</h4><table>';
        const specialAttributes = this.player.specialAttributes;
        
        // 百分比格式的属性（小于1显示为百分比，大于等于1显示为整数）
        specialStatsHTML += '<tr><td>吸血：</td><td>' + Utils.formatCombatStat('lifesteal', specialAttributes.lifesteal) + '</td></tr>';
        specialStatsHTML += '<tr><td>连击：</td><td>' + Utils.formatCombatStat('combo', specialAttributes.combo) + '</td></tr>';
        specialStatsHTML += '<tr><td>侵蚀：</td><td>' + Utils.formatCombatStat('statusChance', specialAttributes.statusChance) + '</td></tr>';
        specialStatsHTML += '<tr><td>抗性：</td><td>' + Utils.formatCombatStat('statusResistance', specialAttributes.statusResistance) + '</td></tr>';
        specialStatsHTML += '<tr><td>疗效：</td><td>' + Utils.formatCombatStat('healingBonus', specialAttributes.healingBonus) + '</td></tr>';
        
        // 数值格式的属性
        specialStatsHTML += '<tr><td>自愈：</td><td>' + specialAttributes.regeneration.toFixed(0) + '</td></tr>';
        specialStatsHTML += '<tr><td>幸运：</td><td>' + specialAttributes.luck.toFixed(0) + '</td></tr>';
        
        specialStatsHTML += '</table>';
        
        // 将特殊属性添加到战斗属性面板中
        this.ui.characterCombatStats.innerHTML += specialStatsHTML;
        
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
                    const qualityColorClass = Utils.getQualityColorClass(item.quality);
                    equipmentHTML += '<div class="equipment-slot">';
                    equipmentHTML += '<div class="slot-name">' + name + '</div>';
                    equipmentHTML += '<div class="slot-item ' + qualityColorClass + '" data-equipment-slot="' + slot + '">' + item.name + '</div>';
                    equipmentHTML += '</div>';
                } else {
                    equipmentHTML += '<div class="equipment-slot">';
                    equipmentHTML += '<div class="slot-name">' + name + '</div>';
                    equipmentHTML += '<div class="slot-empty" data-equipment-slot="' + slot + '">未装备</div>';
                    equipmentHTML += '</div>';
                }
            }
            
            equipmentHTML += '</div>';
            this.ui.characterEquipment.innerHTML = equipmentHTML;
            
            // 绑定装备悬浮事件
            this.bindEquipmentEvents();
        }
    }
    
    // 处理装备鼠标悬浮进入
    handleEquipmentMouseEnter(e) {
        const slot = e.currentTarget;
        const equipmentSlot = slot.getAttribute('data-equipment-slot');
        
        // 获取该槽位的装备
        const item = this.player.equipment[equipmentSlot];
        if (!item) return;
        
        let tooltip = document.getElementById('item-tooltip');
        
        // 如果tooltip不存在，创建一个
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'item-tooltip';
            tooltip.className = 'item-tooltip';
            document.body.appendChild(tooltip);
        }
        
        // 清除所有品质和类型相关的类
        tooltip.className = 'item-tooltip';
        
        // 根据品质设置对应的颜色边框
        const quality = item.quality || 0;
        switch(quality) {
            case 0: tooltip.classList.add('quality-0'); break;
            case 1: tooltip.classList.add('quality-1'); break;
            case 2: tooltip.classList.add('quality-2'); break;
            case 3: tooltip.classList.add('quality-3'); break;
            case 4: tooltip.classList.add('quality-4'); break;
            default: tooltip.classList.add('quality-0'); // 默认白色
        }
        
        // 生成物品详情
        tooltip.innerHTML = this.getItemDetails(item);
        
        // 显示悬浮窗
        tooltip.style.display = 'block';
        
        // 定位悬浮窗
        this.positionTooltip(e, tooltip);
    }
    
    // 绑定装备事件
    bindEquipmentEvents() {
        // 移除旧的事件监听器，避免重复绑定
        const equipmentItems = document.querySelectorAll('.equipment-slot [data-equipment-slot]');
        equipmentItems.forEach(item => {
            // 移除可能存在的事件监听器
            item.removeEventListener('mouseenter', this._boundEquipmentMouseEnter);
            item.removeEventListener('mouseleave', this._boundEquipmentMouseLeave);
            item.removeEventListener('contextmenu', this._boundEquipmentContextMenu);
            
            // 绑定新的事件监听器
            this._boundEquipmentMouseEnter = this.handleEquipmentMouseEnter.bind(this);
            this._boundEquipmentMouseLeave = this.handleItemMouseLeave.bind(this);
            this._boundEquipmentContextMenu = this.handleEquipmentContextMenu.bind(this);
            
            item.addEventListener('mouseenter', this._boundEquipmentMouseEnter);
            item.addEventListener('mouseleave', this._boundEquipmentMouseLeave);
            item.addEventListener('contextmenu', this._boundEquipmentContextMenu);
        });

        // 绑定装备右键菜单事件
        const equipmentMenuItems = document.querySelectorAll('#equipment-context-menu .context-menu-item');
        equipmentMenuItems.forEach(item => {
            item.removeEventListener('click', this._boundEquipmentContextMenuItem);
            this._boundEquipmentContextMenuItem = this.handleEquipmentContextMenuItem.bind(this);
            item.addEventListener('click', this._boundEquipmentContextMenuItem);
        });
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
            // 基础属性
            strength: '力量',
            agility: '敏捷',
            intelligence: '智力',
            stamina: '耐力',
            // 战斗属性
            attack: '攻击',
            magic: '魔法',
            defense: '防御',
            hp: '生命',
            critRate: '暴击',
            critDamage: '暴伤',
            dodgeRate: '闪避',
            blockRate: '韧性',
            blockValue: '韧度',
            cdr: '冷却',
            speed: '攻速',
            damageVariance: '散射',
            // 特殊属性
            lifesteal: '吸血',
            combo: '连击',
            regeneration: '自愈',
            statusChance: '侵蚀',
            statusResistance: '抗性',
            healingBonus: '疗效',
            luck: '幸运'
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
        
        // 确保背包容量至少为12
        const maxSlots = this.player.backpackSlots || 12;
        
        let inventoryHTML = '<div class="inventory-grid">';
        
        // 生成物品格子
        for (let i = 0; i < maxSlots; i++) {
            const isEmpty = i >= this.player.inventory.length;
            let slotHTML = '';
            
            if (isEmpty) {
                // 空格子
                slotHTML = `
                    <div class="inventory-slot empty" data-slot="${i}">
                        <span class="empty-slot">${i + 1}</span>
                    </div>
                `;
            } else {
                // 物品格子
                const item = this.player.inventory[i];
                const quality = item.quality || 0;
                // 对于技能书类型的物品，使用红色而不是品质颜色
                let qualityColorClass;
                let slotClass;
                
                if (item.type === 'skillBook') {
                    qualityColorClass = 'skill-red';
                    slotClass = 'skill-red-border';
                } else {
                    qualityColorClass = Utils.getQualityColorClass(quality);
                    slotClass = `quality-${quality}`;
                }
                
                // 根据物品类型选择图标
                let itemIcon = '?';
                if (item.type === 'equipment') {
                    itemIcon = this.getEquipmentIcon(item.slot);
                } else if (item.type === 'consumable') {
                    itemIcon = '🧪'; // 药水瓶图标
                } else if (item.type === 'skillBook') {
                    itemIcon = '📚'; // 书本图标
                }
                
                // 截断物品名称
                const truncatedName = this.truncateText(item.name, 8);
                
                slotHTML = `
                    <div class="inventory-slot ${slotClass}" data-slot="${i}" data-item-id="${item.id}">
                        <div class="inventory-item">
                            <div class="item-icon">${itemIcon}</div>
                            <div class="item-name ${qualityColorClass}">${truncatedName}</div>
                        </div>
                    </div>
                `;
            }
            
            inventoryHTML += slotHTML;
        }
        
        inventoryHTML += '</div>';
        inventoryContent.innerHTML = inventoryHTML;
        
        // 添加悬浮窗
        if (!document.getElementById('item-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'item-tooltip';
            tooltip.className = 'item-tooltip';
            document.body.appendChild(tooltip);
        }
        
        // 添加右键菜单
        if (!document.getElementById('context-menu')) {
            const menu = document.createElement('div');
            menu.id = 'context-menu';
            menu.className = 'context-menu';
            menu.innerHTML = `
                <div class="context-menu-item" data-action="equip">装备</div>
                <div class="context-menu-item" data-action="use">使用</div>
                <div class="context-menu-item" data-action="drop">丢弃</div>
            `;
            document.body.appendChild(menu);
        }

        // 添加装备右键菜单
        if (!document.getElementById('equipment-context-menu')) {
            const equipmentMenu = document.createElement('div');
            equipmentMenu.id = 'equipment-context-menu';
            equipmentMenu.className = 'context-menu';
            equipmentMenu.innerHTML = `
                <div class="context-menu-item" data-action="unequip">卸下</div>
                <div class="context-menu-item" data-action="discard-equipment">丢弃</div>
            `;
            document.body.appendChild(equipmentMenu);
        }
        
        // 绑定事件
        this.bindItemEvents();
    }
    
    // 获取装备图标
    getEquipmentIcon(slot) {
        const iconMap = {
            mainHand: '⚔️',
            offHand: '🛡️',
            helmet: '👑',
            chest: '🪖',
            boots: '👢',
            accessory1: '💍',
            accessory2: '📿'
        };
        return iconMap[slot] || '📦';
    }
    
    // 截断文本
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // 绑定物品事件
    bindItemEvents() {
        // 移除现有的事件监听器（避免重复绑定）
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            // 使用命名函数引用以便正确移除
            slot.removeEventListener('mouseenter', this._boundMouseEnter);
            slot.removeEventListener('mouseleave', this._boundMouseLeave);
            slot.removeEventListener('contextmenu', this._boundContextMenu);
        });
        
        // 移除右键菜单事件
        document.querySelectorAll('.context-menu-item').forEach(item => {
            item.removeEventListener('click', this._boundContextMenuItem);
        });
        
        // 移除装备按钮，所有装备操作通过右键菜单进行
        
        // 保存绑定后的函数引用
        this._boundMouseEnter = this.handleItemMouseEnter.bind(this);
        this._boundMouseLeave = this.handleItemMouseLeave.bind(this);
        this._boundContextMenu = this.handleItemContextMenu.bind(this);
        this._boundContextMenuItem = this.handleContextMenuItem.bind(this);
        
        // 绑定鼠标悬浮事件
        document.querySelectorAll('.inventory-slot:not(.empty)').forEach(slot => {
            slot.addEventListener('mouseenter', this._boundMouseEnter);
            slot.addEventListener('mouseleave', this._boundMouseLeave);
            slot.addEventListener('contextmenu', this._boundContextMenu);
        });
        
        // 绑定右键菜单事件
        document.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', this._boundContextMenuItem);
        });
        
        // 只绑定一次全局点击事件（在构造函数中完成）
    }
    
    // 处理物品鼠标悬浮进入
    handleItemMouseEnter(e) {
        const slot = e.currentTarget;
        const slotIndex = parseInt(slot.getAttribute('data-slot'));
        
        if (slotIndex >= this.player.inventory.length) return;
        
        const item = this.player.inventory[slotIndex];
        const tooltip = document.getElementById('item-tooltip');
        
        // 清除所有品质和类型相关的类
        tooltip.className = 'item-tooltip';
        
        // 对于技能书，添加skill-red类以显示红色边框
        if (item.type === 'skillBook') {
            tooltip.classList.add('skill-red');
        } else {
            // 对于其他物品，根据品质设置对应的颜色边框
            const quality = item.quality || 0;
            // 根据品质获取对应的CSS类名
            switch(quality) {
                case 0: tooltip.classList.add('quality-0'); break;
                case 1: tooltip.classList.add('quality-1'); break;
                case 2: tooltip.classList.add('quality-2'); break;
                case 3: tooltip.classList.add('quality-3'); break;
                case 4: tooltip.classList.add('quality-4'); break;
                default: tooltip.classList.add('quality-0'); // 默认白色
            }
        }
        
        // 生成物品详情
        tooltip.innerHTML = this.getItemDetails(item);
        
        // 显示悬浮窗
        tooltip.style.display = 'block';
        
        // 定位悬浮窗
        this.positionTooltip(e, tooltip);
    }
    
    // 处理物品鼠标悬浮离开
    handleItemMouseLeave() {
        const tooltip = document.getElementById('item-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    // 处理物品右键菜单
    handleItemContextMenu(e) {
        e.preventDefault();
        
        const slot = e.currentTarget;
        const slotIndex = parseInt(slot.getAttribute('data-slot'));
        
        if (slotIndex >= this.player.inventory.length) return;
        
        const item = this.player.inventory[slotIndex];
        const menu = document.getElementById('context-menu');
        
        // 保存当前选中的物品索引
        menu.setAttribute('data-slot-index', slotIndex);
        
        // 根据物品属性显示/隐藏菜单项
        const equipItem = menu.querySelector('[data-action="equip"]');
        const useItem = menu.querySelector('[data-action="use"]');
        const dropItem = menu.querySelector('[data-action="drop"]');
        
        // 设置默认状态
        equipItem.classList.add('disabled');
        useItem.classList.add('disabled');
        dropItem.classList.remove('disabled');
        
        // 根据物品类型和属性启用相应菜单项
        if (item.type === 'equipment' && (item.canEquip === undefined || item.canEquip !== false)) {
            equipItem.classList.remove('disabled');
        }
        
        if ((item.type === 'consumable' || item.type === 'skillBook') && 
            (item.canUse === undefined || item.canUse !== false)) {
            useItem.classList.remove('disabled');
        }
        
        if (item.canDrop === undefined || item.canDrop !== false) {
            dropItem.classList.remove('disabled');
        }
        
        // 根据物品品质设置右键菜单边框颜色
        const quality = item.quality || 0;
        menu.className = 'context-menu';
        menu.classList.add(`context-menu-quality-${quality}`);
        
        // 显示右键菜单
        // 让菜单出现在鼠标指针位置附近，但稍微偏移一点避免遮挡
        menu.style.left = (e.clientX + 10) + 'px';
        menu.style.top = (e.clientY + 10) + 'px';
        menu.style.display = 'block';
    }
    
    // 处理右键菜单项点击
    handleContextMenuItem(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const menu = document.getElementById('context-menu');
        const slotIndexStr = menu.getAttribute('data-slot-index');
        const slotIndex = parseInt(slotIndexStr);
        const action = e.target.getAttribute('data-action');
        
        // 增加严格的参数验证
        if (e.target.classList.contains('disabled')) return;
        if (isNaN(slotIndex) || typeof slotIndex !== 'number' || slotIndex < 0) {
            console.warn('无效的物品槽索引:', slotIndexStr);
            this.hideContextMenu();
            return;
        }
        
        // 验证玩家数据和背包索引
        if (!this.player || !this.player.inventory || slotIndex >= this.player.inventory.length) {
            console.warn('玩家数据无效或物品槽索引超出范围');
            this.hideContextMenu();
            return;
        }
        
        const item = this.player.inventory[slotIndex];
        
        // 验证物品存在
        if (!item) {
            console.warn('物品槽为空');
            this.hideContextMenu();
            return;
        }
        
        switch (action) {
            case 'equip':
                this.equipItemFromInventory(slotIndex);
                break;
            case 'use':
                this.useItemFromInventory(slotIndex);
                break;
            case 'drop':
                this.dropItemFromInventory(slotIndex);
                break;
        }
        
        this.hideContextMenu();
    }
    
    // 隐藏右键菜单
    hideContextMenu() {
        // 隐藏背包物品右键菜单
        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
        
        // 隐藏装备右键菜单
        const equipmentMenu = document.getElementById('equipment-context-menu');
        if (equipmentMenu) {
            equipmentMenu.style.display = 'none';
        }
    }
    
    // 处理装备右键菜单
    handleEquipmentContextMenu(e) {
        e.preventDefault();
        
        const slot = e.currentTarget;
        const equipmentSlot = slot.getAttribute('data-equipment-slot');
        
        // 获取该槽位的装备
        const item = this.player.equipment[equipmentSlot];
        if (!item) return;
        
        const menu = document.getElementById('equipment-context-menu');
        
        // 检查菜单元素是否存在
        if (!menu) {
            console.warn('装备右键菜单元素不存在');
            return;
        }
        
        // 保存当前选中的装备槽位
        menu.setAttribute('data-equipment-slot', equipmentSlot);
        
        // 根据物品品质设置右键菜单边框颜色
        const quality = item.quality || 0;
        menu.className = 'context-menu';
        menu.classList.add(`context-menu-quality-${quality}`);
        
        // 显示右键菜单
        menu.style.left = (e.clientX + 10) + 'px';
        menu.style.top = (e.clientY + 10) + 'px';
        menu.style.display = 'block';
    }

    // 处理装备右键菜单项点击
    handleEquipmentContextMenuItem(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const menu = document.getElementById('equipment-context-menu');
        const equipmentSlot = menu.getAttribute('data-equipment-slot');
        const action = e.target.getAttribute('data-action');
        
        // 增加参数验证
        if (e.target.classList.contains('disabled')) return;
        if (!equipmentSlot || typeof equipmentSlot !== 'string') {
            console.warn('无效的装备槽位:', equipmentSlot);
            this.hideEquipmentContextMenu();
            return;
        }
        
        // 验证玩家数据和装备槽位
        if (!this.player || !this.player.equipment || !this.player.equipment[equipmentSlot]) {
            console.warn('玩家数据无效或装备槽位为空');
            this.hideEquipmentContextMenu();
            return;
        }
        
        switch (action) {
            case 'unequip':
                this.unequipEquipment(equipmentSlot);
                break;
            case 'discard-equipment':
                this.discardEquipment(equipmentSlot);
                break;
        }
        
        this.hideEquipmentContextMenu();
    }

    // 隐藏装备右键菜单
    hideEquipmentContextMenu() {
        const menu = document.getElementById('equipment-context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    // 卸下装备（从装备槽位返回到背包）
    unequipEquipment(equipmentSlot) {
        try {
            // 检查参数
            if (!equipmentSlot || typeof equipmentSlot !== 'string') {
                console.warn('无效的装备槽位:', equipmentSlot);
                return;
            }

            // 检查玩家数据
            if (!this.player || !this.player.equipment) {
                console.warn('玩家数据无效');
                return;
            }

            // 检查装备槽位是否有装备
            if (!this.player.equipment[equipmentSlot]) {
                this.logMessage('该槽位没有装备！');
                return;
            }

            // 检查背包容量
            const maxSlots = this.player.backpackSlots || 12;
            if (this.player.inventory.length >= maxSlots) {
                this.logMessage('背包已满，无法卸下装备！');
                return;
            }

            // 卸下装备（从character.js的方法）
            const unequippedItem = this.player.unequipItem(equipmentSlot);
            
            if (unequippedItem) {
                // 将装备添加到背包
                this.player.inventory.push(unequippedItem);
                this.logMessage(`成功卸下 ${unequippedItem.name} 并放入背包！`);
                
                // 更新UI
                this.updateCharacterPanel();
                this.updateInventoryDisplay();
                this.savePlayerData();
            } else {
                console.warn('卸下装备失败');
                this.logMessage('卸下装备失败！');
            }
        } catch (error) {
            console.error('卸下装备时发生错误:', error);
            this.logMessage('卸下装备时发生错误！');
        }
    }

    // 丢弃装备（直接从装备槽位移除）
    discardEquipment(equipmentSlot) {
        try {
            // 检查参数
            if (!equipmentSlot || typeof equipmentSlot !== 'string') {
                console.warn('无效的装备槽位:', equipmentSlot);
                return;
            }

            // 检查玩家数据
            if (!this.player || !this.player.equipment) {
                console.warn('玩家数据无效');
                return;
            }

            // 检查装备槽位是否有装备
            if (!this.player.equipment[equipmentSlot]) {
                this.logMessage('该槽位没有装备！');
                return;
            }

            // 获取要丢弃的装备信息
            const equipmentToDiscard = this.player.equipment[equipmentSlot];
            
            // 直接移除装备（不返回背包）
            this.player.equipment[equipmentSlot] = null;
            
            // 重新计算战斗属性
            this.player.combatStats = this.player.calculateCombatStats();
            
            // 更新当前生命值（如果超过最大值）
            if (this.player.currentHp > this.player.combatStats.hp) {
                this.player.currentHp = this.player.combatStats.hp;
            }
            
            this.logMessage(`丢弃了 ${equipmentToDiscard.name}！`);
            
            // 更新UI
            this.updateCharacterPanel();
            this.savePlayerData();
        } catch (error) {
            console.error('丢弃装备时发生错误:', error);
            this.logMessage('丢弃装备时发生错误！');
        }
    }

    // 定位悬浮窗
    positionTooltip(e, tooltip) {
        const rect = tooltip.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 默认显示在鼠标右侧和下方
        let left = mouseX + 15;
        let top = mouseY + 15;
        
        // 如果右侧不够空间，显示在左侧
        if (left + rect.width > viewportWidth) {
            left = mouseX - rect.width - 15;
        }
        
        // 如果下方不够空间，显示在上方
        if (top + rect.height > viewportHeight) {
            top = mouseY - rect.height - 15;
        }
        
        // 确保不超出视口
        left = Math.max(0, left);
        top = Math.max(0, top);
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    // 获取物品详情
    getItemDetails(item) {
        const qualityName = Utils.getQualityName(item.quality || 0);
        // 对于技能书类型的物品，使用红色而不是品质颜色
        const qualityColorClass = item.type === 'skillBook' ? 'skill-red' : Utils.getQualityColorClass(item.quality || 0);
        
        let details = `
            <h4 class="${qualityColorClass}">${item.name}</h4>
            <p>${qualityName} ${this.getItemTypeText(item.type)}</p>
            <p>${item.description}</p>
        `;
        
        // 添加装备属性
        if (item.type === 'equipment') {
            if (item.baseStats) {
                details += '<h5>基础属性：</h5><ul class="item-stats">';
                for (const [stat, value] of Object.entries(item.baseStats)) {
                    // 小于1的属性显示为百分比
                    let displayValue = value;
                    if (value < 1 && value > 0) {
                        displayValue = '+' + (value * 100).toFixed(0) + '%';
                    } else {
                        displayValue = '+' + value;
                    }
                    details += `<li>${this.getStatName(stat)}: ${displayValue}</li>`;
                }
                details += '</ul>';
            }
            
            if (item.extraStats) {
                details += '<h5>额外属性：</h5><ul class="item-stats">';
                item.extraStats.forEach(stat => {
                    // 小于1的属性显示为百分比
                    let displayValue = stat.value;
                    if (stat.value < 1 && stat.value > 0) {
                        displayValue = '+' + (stat.value * 100).toFixed(0) + '%';
                    } else {
                        displayValue = '+' + stat.value;
                    }
                    details += `<li>${this.getStatName(stat.stat)}: ${displayValue}</li>`;
                });
                details += '</ul>';
            }
            
            if (item.specialAttributes) {
                details += '<h5>特殊属性：</h5><ul class="item-stats">';
                for (const [attr, value] of Object.entries(item.specialAttributes)) {
                    // 特殊属性显示逻辑
                    let displayValue = value;
                    if (attr === 'lifesteal') {
                        displayValue = (value * 100).toFixed(0) + '%';
                    } else if (value < 1 && value > 0) {
                        displayValue = (value * 100).toFixed(0) + '%';
                    } else {
                        displayValue = '+' + value;
                    }
                    details += `<li>${this.getStatName(attr)}: ${displayValue}</li>`;
                }
                details += '</ul>';
            }
            
            if (item.specialEffect && window.specialEffects) {
                details += `<h5>特殊效果：</h5><p>${window.specialEffects[item.specialEffect] || item.specialEffect}</p>`;
            }
        }
        
        // 添加技能书信息
        if (item.type === 'skillBook') {
            const skill = Utils.getSkillById(item.skillId);
            if (skill) {
                details += `<h5>技能信息：</h5><p>${skill.description}</p>`;
                
                // 添加属性限制条件显示
                if (skill.requirements && Object.keys(skill.requirements).length > 0) {
                    details += '<h5>学习要求：</h5><ul class="skill-requirements">';
                    const hasAllRequirements = Object.entries(skill.requirements).every(([stat, requiredValue]) => {
                        const currentValue = this.player.baseStats[stat] || 0;
                        const isMet = currentValue >= requiredValue;
                        const color = isMet ? '#27ae60' : '#e74c3c'; // 绿色表示满足，红色表示不满足
                        details += `<li style="color: ${color};">${this.getStatName(stat)}: ${currentValue}/${requiredValue}</li>`;
                        return isMet;
                    });
                    details += '</ul>';
                    
                    // 显示是否可以学习
                    if (hasAllRequirements) {
                        details += '<p style="color: #27ae60;">✓ 满足学习条件</p>';
                    } else {
                        details += '<p style="color: #e74c3c;">✗ 不满足学习条件</p>';
                    }
                }
                
                if (this.player.skills && this.player.skills.includes(item.skillId)) {
                    details += '<p style="color: #e74c3c;">已学习此技能</p>';
                }
            }
        }
        
        return details;
    }
    
    // 使用物品
    useItemFromInventory(index) {
        // 增加严格的参数检查
        if (typeof index !== 'number' || index < 0 || !this.player || !this.player.inventory || index >= this.player.inventory.length) {
            console.warn('无效的物品索引或玩家数据');
            return;
        }
        
        const item = this.player.inventory[index];
        
        // 确保物品对象存在且有type属性
        if (!item || typeof item !== 'object' || !item.type) {
            console.warn('无效的物品数据');
            return;
        }
        
        // 使用String()进行类型转换，确保严格比较
        if (String(item.type) === 'skillBook') {
            console.log('使用技能书:', item.name);
            // 学习技能
            this.learnSkillFromBook(item, index);
        } else if (String(item.type) === 'consumable') {
            console.log('使用消耗品:', item.name);
            // 使用消耗品
            this.useConsumable(item, index);
        } else {
            // 对于其他类型的物品，提供明确的提示
            console.log('尝试使用不可直接使用的物品:', item.type);
            this.logMessage('这个物品不能直接使用！');
        }
    }
    
    // 从技能书学习技能
    learnSkillFromBook(skillBook, index) {
        // 增加防御性检查，确保传入的是真正的技能书
        if (!skillBook || typeof skillBook !== 'object' || !skillBook.skillId) {
            console.warn('无效的技能书数据', skillBook);
            this.logMessage('这不是有效的技能书！');
            return;
        }
        
        // 确保玩家有learnedSkills数组
        if (!this.player.learnedSkills) {
            this.player.learnedSkills = [];
        }
        
        // 检查是否已学习
        if (this.player.learnedSkills.includes(skillBook.skillId)) {
            console.log('玩家已经学习过此技能:', skillBook.skillId);
            this.logMessage('你已经学习过这个技能了！');
            return;
        }
        
        // 使用玩家对象的learnSkill方法，它会自动检查学习条件
        const success = this.player.learnSkill(skillBook.skillId);
        
        if (success) {
            // 从背包移除
            this.player.inventory.splice(index, 1);
            
            this.logMessage(`成功学习了技能：${this.getSkillName(skillBook.skillId)}！`);
            
            // 更新UI
            this.updateInventoryDisplay();
            this.updateSkillsDisplay();
            this.savePlayerData();
        } else {
            // 获取技能信息来显示具体的失败原因
            const skill = Utils.getSkillById(skillBook.skillId);
            // 确保只在真正尝试学习技能书时显示弹窗
            if (skill && skill.requirements && String(skillBook.type) === 'skillBook') {
                console.log('学习技能失败，不满足要求:', skillBook.skillId);
                this.logMessage('你不满足学习这个技能的条件！');
                // 恢复弹窗功能，但增加类型验证确保只在正确情况下显示
                alert('你不满足学习这个技能的条件！');
            } else {
                this.logMessage('无法学习这个技能！');
            }
        }
    }
    
    // 使用消耗品
    useConsumable(consumable, index) {
        if (consumable.backpackSlotsBonus) {
            // 处理背包扩展物品
            this.expandBackpack(consumable.backpackSlotsBonus, index);
        } else {
            // 处理普通消耗品
            let effectApplied = false;
            
            // 处理恢复血量的药水
            if (consumable.healAmount && typeof consumable.healAmount === 'number') {
                const healAmount = consumable.healAmount;
                const actualHeal = this.player.heal(healAmount);
                this.logMessage(`使用了${consumable.name}，恢复了${actualHeal}点生命值！`);
                effectApplied = true;
            }
            
            // 如果没有特定效果，显示通用消息
            if (!effectApplied) {
                this.logMessage(`使用了${consumable.name}，但没有产生效果！`);
                console.warn('消耗品没有产生效果:', consumable.name);
            }
            
            // 从背包移除
            this.player.inventory.splice(index, 1);
            
            // 立即更新UI，确保在非战斗状态下也能显示血量变化
            this.updateInventoryDisplay();
            
            this.updateCharacterPanel();
            
            // 重点：更新玩家面板上的生命值显示（这是在战斗外显示的主要位置）
            if (this.ui.playerPanel && this.player && this.player.combatStats) {
                // 更新生命值文本
                const playerHpText = this.ui.playerPanel.querySelector('.hp-text');
                if (playerHpText) {
                    playerHpText.textContent = Math.floor(this.player.currentHp) + '/' + Math.floor(this.player.combatStats.hp);
                } else {
                    console.warn('未找到玩家面板HP文本元素');
                }
                
                // 更新生命值条
                const playerHpBar = this.ui.playerPanel.querySelector('.hp-bar-fill');
                if (playerHpBar) {
                    const hpPercentage = (this.player.currentHp / this.player.combatStats.hp) * 100;
                    playerHpBar.style.width = hpPercentage + '%';
                } else {
                    console.warn('未找到玩家面板HP条元素');
                }
            } else {
                console.warn('玩家面板或玩家数据不存在');
            }
            
            // 直接检查并更新角色面板中的生命值显示元素（作为额外保障）
            if (this.ui.characterCombatStats) {
                const combatStats = this.player.combatStats;
                const hpRow = this.ui.characterCombatStats.querySelector('tr:nth-child(6) td:last-child');
                if (hpRow) {
                    hpRow.textContent = Math.floor(this.player.currentHp) + '/' + Math.floor(combatStats.hp);
                }
            }
            
            // 强制浏览器重排重绘，确保UI立即更新
            void document.body.offsetHeight; // 触发重排
            
            this.savePlayerData();
        }
    }
    
    // 扩展背包
    expandBackpack(slotsBonus, index) {
        if (!this.player) return;
        
        // 确保玩家有backpackSlots属性
        if (!this.player.backpackSlots) {
            this.player.backpackSlots = 12; // 初始12格
        }
        
        // 增加背包格子数
        this.player.backpackSlots += slotsBonus;
        
        const item = this.player.inventory[index];
        this.logMessage(`使用了${item.name}！背包容量增加了${slotsBonus}格！`);
        
        // 从背包移除
        this.player.inventory.splice(index, 1);
        
        // 更新UI
        this.updateInventoryDisplay();
        this.savePlayerData();
    }
    
    // 丢弃物品
    dropItemFromInventory(index) {
        if (!this.player || index < 0 || index >= this.player.inventory.length) return;
        
        const item = this.player.inventory[index];
        
        // 从背包移除
        this.player.inventory.splice(index, 1);
        
        this.logMessage(`丢弃了${item.name}！`);
        
        // 更新UI
        this.updateInventoryDisplay();
        this.savePlayerData();
    }
    
    // 从背包装备物品
    equipItemFromInventory(index) {
        if (!this.player || index < 0 || index >= this.player.inventory.length) return;
        
        const item = this.player.inventory[index];
        
        if (item.type !== 'equipment') {
            this.logMessage('这不是装备！');
            return;
        }
        
        // 获取最大背包容量
        const maxSlots = this.player.backpackSlots || 12;
        
        // 尝试装备物品（会返回被替换的旧装备）
        const oldItem = this.player.equipItem(item);
        
        if (oldItem !== false) {
            // 从背包移除新装备
            this.player.inventory.splice(index, 1);
            
            // 如果有旧装备，尝试将其添加到背包
            if (oldItem) {
                // 检查背包是否已满
                if (this.player.inventory.length < maxSlots) {
                    this.player.inventory.push(oldItem);
                    this.logMessage('成功装备了' + item.name + '！将' + oldItem.name + '放回背包。');
                } else {
                    this.logMessage('警告：背包已满，无法将' + oldItem.name + '放回背包！');
                    // 这里可以选择将旧装备丢弃或给出其他提示
                }
            } else {
                this.logMessage('成功装备了' + item.name + '！');
            }
            
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
        
        // 显示记忆栏位（置顶）
        skillsHTML += '<h4>记忆栏位</h4>';
        skillsHTML += '<div class="memory-slots">';
        
        for (let i = 0; i < this.player.memorySlots.length; i++) {
            const skillId = this.player.memorySlots[i];
            
            if (skillId) {
                const skill = this.gameSkills.find(s => s.id === skillId);
                if (skill) {
                    skillsHTML += '<div class="memory-slot occupied" data-slot="' + i + '" data-skill-id="' + skillId + '">';
                    skillsHTML += '<div class="slot-number">' + (i + 1) + '</div>';
                    skillsHTML += '<div class="slot-skill-name">' + skill.name + '</div>';
                    skillsHTML += '</div>';
                }
            } else {
                skillsHTML += '<div class="memory-slot empty" data-slot="' + i + '">';
                skillsHTML += '<div class="slot-number">' + (i + 1) + '</div>';
                skillsHTML += '<div class="slot-empty">未装备</div>';
                skillsHTML += '</div>';
            }
        }
        
        skillsHTML += '</div>';
        
        // 显示已学习的技能（格子布局）
        skillsHTML += '<h4>已学习的技能</h4>';
        
        if (this.player.learnedSkills.length === 0) {
            skillsHTML += '<div class="no-skills">还没有学习任何技能</div>';
        } else {
            skillsHTML += '<div class="skills-grid">';
            
            for (const skillId of this.player.learnedSkills) {
                const skill = this.gameSkills.find(s => s.id === skillId);
                if (skill) {
                    const isEquipped = this.player.memorySlots.includes(skillId);
                    
                    skillsHTML += '<div class="skill-slot" data-skill-id="' + skillId + '"';
                    if (isEquipped) {
                        skillsHTML += ' data-equipped="true"';
                    }
                    skillsHTML += '>';
                    skillsHTML += '<div class="skill-icon">';
                    skillsHTML += skill.type === 'active' ? '⚔️' : '🛡️';
                    skillsHTML += '</div>';
                    skillsHTML += '<div class="skill-name">' + this.truncateText(skill.name, 6) + '</div>';
                    if (isEquipped) {
                        skillsHTML += '<div class="equipped-indicator">✓</div>';
                    }
                    skillsHTML += '</div>';
                }
            }
            
            skillsHTML += '</div>';
        }
        
        skillsContent.innerHTML = skillsHTML;
        
        // 绑定技能格子事件
        this.bindSkillEvents();
    }
    
    // 绑定技能格子事件
    bindSkillEvents() {
        const skillsContent = document.getElementById('skills-content');
        if (!skillsContent) return;
        
        // 移除现有的事件监听器（避免重复绑定）
        document.querySelectorAll('.skill-slot').forEach(slot => {
            slot.removeEventListener('mouseenter', this.handleSkillMouseEnter.bind(this));
            slot.removeEventListener('mouseleave', this.handleSkillMouseLeave.bind(this));
            slot.removeEventListener('contextmenu', this.handleSkillContextMenu.bind(this));
        });
        
        document.querySelectorAll('.memory-slot.occupied').forEach(slot => {
            slot.removeEventListener('mouseenter', this.handleSkillMouseEnter.bind(this));
            slot.removeEventListener('mouseleave', this.handleSkillMouseLeave.bind(this));
            slot.removeEventListener('contextmenu', this.handleMemorySlotContextMenu.bind(this));
        });
        
        // 绑定技能格子的鼠标悬浮事件
        const skillSlots = skillsContent.querySelectorAll('.skill-slot');
        skillSlots.forEach(slot => {
            slot.addEventListener('mouseenter', this.handleSkillMouseEnter.bind(this));
            slot.addEventListener('mouseleave', this.handleSkillMouseLeave.bind(this));
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleSkillContextMenu(e);
            });
        });
        
        // 绑定记忆栏位的鼠标悬浮事件
        const memorySlots = skillsContent.querySelectorAll('.memory-slot.occupied');
        memorySlots.forEach(slot => {
            slot.addEventListener('mouseenter', (e) => {
                this.handleSkillMouseEnter(e, true);
            });
            slot.addEventListener('mouseleave', this.handleSkillMouseLeave.bind(this));
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleMemorySlotContextMenu(e);
            });
        });
    }
    
    // 处理技能鼠标悬浮
    handleSkillMouseEnter(e, isMemorySlot = false) {
        const skillId = isMemorySlot ? e.currentTarget.getAttribute('data-skill-id') : e.currentTarget.getAttribute('data-skill-id');
        const skill = this.gameSkills.find(s => s.id === skillId);
        
        if (skill) {
            // 创建悬浮窗
            const tooltip = document.createElement('div');
            tooltip.className = 'skill-tooltip';
            tooltip.id = 'skill-tooltip';
            
            tooltip.innerHTML = `
                <div class="tooltip-title">${skill.name}</div>
                <div class="tooltip-type">类型: ${skill.type === 'active' ? '主动' : '被动'}</div>
                <div class="tooltip-description">${skill.description}</div>
            `;
            
            // 添加条件要求
            if (skill.requirements && Object.keys(skill.requirements).length > 0) {
                let requirementsText = '<div class="tooltip-requirements">要求: ';
                const reqParts = [];
                if (skill.requirements.strength) reqParts.push(`力量 ${skill.requirements.strength}`);
                if (skill.requirements.agility) reqParts.push(`敏捷 ${skill.requirements.agility}`);
                if (skill.requirements.intelligence) reqParts.push(`智力 ${skill.requirements.intelligence}`);
                requirementsText += reqParts.join(', ') + '</div>';
                tooltip.innerHTML += requirementsText;
            }
            
            document.body.appendChild(tooltip);
            this.positionTooltip(e, tooltip);
        }
    }
    
    // 处理技能鼠标离开
    handleSkillMouseLeave() {
        const tooltip = document.getElementById('skill-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    // 处理技能右键菜单
    handleSkillContextMenu(e) {
        const skillId = e.currentTarget.getAttribute('data-skill-id');
        const isEquipped = e.currentTarget.hasAttribute('data-equipped');
        
        // 移除已存在的菜单
        this.hideSkillContextMenu();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.id = 'skill-context-menu';
        // 设置样式确保可见
        menu.style.cssText = `
            position: fixed;
            left: ${e.clientX + 10}px;
            top: ${e.clientY + 10}px;
            background: #333;
            color: white;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 5px 0;
            min-width: 100px;
            z-index: 1000;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
        `;
        
        // 确保总是有菜单项显示
        if (!isEquipped) {
            menu.innerHTML = `
                <div class="context-menu-item" data-action="memorize" data-skill-id="${skillId}">记忆</div>
            `;
        } else {
            // 已装备的技能也应该有菜单项，比如查看详情
            menu.innerHTML = `
                <div class="context-menu-item" data-action="info" data-skill-id="${skillId}">查看详情</div>
            `;
        }
        
        // 确保菜单显示出来
        menu.style.display = 'block';
        
        document.body.appendChild(menu);
        
        // 处理菜单项点击
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleSkillContextMenuItem(e);
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', this.handleSkillMenuOutsideClick);
    }
    
    // 处理记忆栏位右键菜单
    handleMemorySlotContextMenu(e) {
        const skillId = e.currentTarget.getAttribute('data-skill-id');
        const slotIndex = parseInt(e.currentTarget.getAttribute('data-slot'));
        
        // 移除已存在的菜单
        this.hideSkillContextMenu();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.id = 'skill-context-menu';
        // 设置样式确保可见
        menu.style.cssText = `
            position: fixed;
            left: ${e.clientX + 10}px;
            top: ${e.clientY + 10}px;
            background: #333;
            color: white;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 5px 0;
            min-width: 100px;
            z-index: 1000;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
        `;
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="forget" data-slot="${slotIndex}" data-skill-id="${skillId}">遗忘</div>
        `;
        
        // 确保菜单显示出来
        menu.style.display = 'block';
        
        document.body.appendChild(menu);
        
        // 处理菜单项点击
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleSkillContextMenuItem(e);
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', this.handleSkillMenuOutsideClick);
    }
    
    // 处理技能右键菜单项点击
    handleSkillContextMenuItem(e) {
        const action = e.target.getAttribute('data-action');
        
        if (action === 'memorize') {
            const skillId = e.target.getAttribute('data-skill-id');
            this.memorizeSkill(skillId);
        } else if (action === 'forget') {
            const slotIndex = parseInt(e.target.getAttribute('data-slot'));
            this.unequipSkillFromMemory(slotIndex);
        }
        
        this.hideSkillContextMenu();
    }
    
    // 处理菜单外部点击
    handleSkillMenuOutsideClick = (e) => {
        const menu = document.getElementById('skill-context-menu');
        if (menu && !menu.contains(e.target)) {
            this.hideSkillContextMenu();
        }
    };
    
    // 隐藏技能右键菜单
    hideSkillContextMenu() {
        const menu = document.getElementById('skill-context-menu');
        if (menu) {
            menu.remove();
            document.removeEventListener('click', this.handleSkillMenuOutsideClick);
        }
    }
    
    // 记忆技能到记忆栏位
    memorizeSkill(skillId) {
        // 查找第一个空的记忆栏位
        const emptySlotIndex = this.player.memorySlots.findIndex(slot => !slot);
        
        if (emptySlotIndex === -1) {
            this.logMessage('记忆栏位已满！');
            return;
        }
        
        // 装备技能到空栏位
        this.player.memorySlots[emptySlotIndex] = skillId;
        const skill = this.gameSkills.find(s => s.id === skillId);
        this.logMessage(`成功记忆技能 ${skill.name}！`);
        
        // 更新技能显示
        this.updateSkillsDisplay();
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
    
    // 预设物品配置（简化版，直接包含常用物品）从控制台直接添加物品时使用
    const defaultItems = [
        {
            id: 'wooden_sword',
            name: '木剑',
            type: 'equipment',
            slot: 'mainHand',
            quality: 0,
            canEquip: true,
            canUse: false,
            canDrop: true,
            baseStats: { attack: 5 },
            description: '一把简单的木剑，攻击力较低'
        },
        {
            id: 'iron_sword',
            name: '铁剑',
            type: 'equipment',
            slot: 'mainHand',
            quality: 1,
            canEquip: true,
            canUse: false,
            canDrop: true,
            baseStats: { attack: 12 },
            extraStats: [{ stat: 'critRate', value: 0.02 }],
            description: '一把坚固的铁剑'
        },
        {
            id: 'thunder_blade',
            name: '雷霆之刃',
            type: 'equipment',
            slot: 'mainHand',
            quality: 3,
            canEquip: true,
            canUse: false,
            canDrop: true,
            baseStats: { attack: 35 },
            extraStats: [
                { stat: 'attack', value: 10 },
                { stat: 'critRate', value: 0.08 },
                { stat: 'speed', value: 0.1 }
            ],
            specialEffect: 'thunder_damage',
            description: '蕴含雷电之力的强大武器'
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
            id: 'small_backpack',
            name: '小型背包',
            type: 'consumable',
            quality: 1,
            canEquip: false,
            canUse: true,
            canDrop: true,
            description: '增加8个背包格子',
            backpackSlotsBonus: 8
        }
    ];
    
    // 控制台方法：添加物品到背包
    window.addItemToInventory = function(itemId) {
        if (!window.game || !window.game.player) {
            console.error('游戏未初始化或玩家数据不存在');
            return false;
        }
        
        // 首先尝试从预设物品中查找
        let item = defaultItems.find(i => i.id === itemId);
        
        // 如果预设中没有，尝试直接从config/items.js中查找
        if (!item && typeof window.gameConfig === 'object' && window.gameConfig.items) {
            item = window.gameConfig.items.find(i => i.id === itemId);
        }
        
        if (!item) {
            console.error('物品不存在:', itemId);
            console.log('可用物品ID列表:');
            defaultItems.forEach(i => console.log(`- ${i.id}: ${i.name}`));
            return false;
        }
        
        // 检查背包容量
        const maxSlots = window.game.player.backpackSlots || 12;
        if (window.game.player.inventory.length >= maxSlots) {
            console.warn(`警告：背包已满，无法添加物品${item.name}`);
            // 显示提示信息给玩家
            if (window.game.logMessage) {
                window.game.logMessage(`只好将${item.name}丢掉了`);
            }
            return false;
        }
        
        // 复制物品配置到背包
        const newItem = JSON.parse(JSON.stringify(item));
        window.game.player.inventory.push(newItem);
        
        // 更新背包显示
        window.game.updateInventoryDisplay();
        // 保存玩家数据
        window.game.savePlayerData();
        // 显示背包界面
        window.game.showModal('inventory-modal');
        
        console.log('已添加物品到背包:', newItem.name);
        return true;
    };
    
    // 控制台方法：显示可用物品列表
    window.listAvailableItems = function() {
        console.log('=== 可用物品列表 ===');
        defaultItems.forEach(item => {
            console.log(`ID: ${item.id}\n名称: ${item.name}\n类型: ${item.type}\n品质: ${item.quality}\n描述: ${item.description}\n`);
        });
    };
}