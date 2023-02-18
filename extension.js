game.import("extension",function(lib,game,ui,get,ai,_status) {

    return {
        name: "皮肤切换",
        content:function(config,pack) {
            // 首先需要覆盖十周年UI的动皮初始化功能
            if (!lib.config[skinSwitch.configKey.useDynamic]) {
                return
            }
            if (!lib.config[skinSwitch.decadeKey.enable] && !lib.config[skinSwitch.decadeKey.dynamicSkin]) {
                console.log('必须安装启用十周年UI与十周年动皮')
                return
            }

            // 根据本地的存储内容, 更改十周年UI的skinDynamic的数据
            function updateDecadeDynamicSkin(timer) {

                if (!window.decadeUI || !decadeUI.dynamicSkin) {
                    // 等200毫秒继续加载
                    console.log('重新等待十周年UI加载完成')
                    let ti = setTimeout(() => {
                        updateDecadeDynamicSkin(ti)
                    }, 50)
                } else{
                    if (timer) {
                        clearTimeout(timer)
                    }
                    modifyDecadeUIContent()
                    if (!skinSwitch.saveSkinParams) return
                    for (let k in skinSwitch.saveSkinParams) {
                        // 只更新存在key的数据
                        for (let m in skinSwitch.saveSkinParams[k]) {
                            if (decadeUI.dynamicSkin[k] && decadeUI.dynamicSkin[k][m]) {
                                let gongji = decadeUI.dynamicSkin[k][m].gongji
                                if (skinSwitch.saveSkinParams[k][m].gongji) {
                                    if (typeof gongji === 'string') {
                                        gongji = {
                                            action: gongji
                                        }
                                    } else if (gongji === true) {
                                        gongji = {}
                                    } else if (typeof gongji !== 'object') {
                                        gongji = {}
                                    }
                                    gongji = Object.assign(gongji, skinSwitch.saveSkinParams[k][m].gongji)
                                }
                                for (let assignK of ['x', 'y', 'scale', 'angle']) {
                                    if (skinSwitch.saveSkinParams[k][m][assignK] != null) {
                                        decadeUI.dynamicSkin[k][m][assignK] = skinSwitch.saveSkinParams[k][m][assignK]
                                    }
                                }
                                if (decadeUI.dynamicSkin[k][m].beijing && skinSwitch.saveSkinParams[k][m].beijing) {
                                    decadeUI.dynamicSkin[k][m].beijing = Object.assign(decadeUI.dynamicSkin[k][m].beijing, skinSwitch.saveSkinParams[k][m].beijing)
                                }
                                // decadeUI.dynamicSkin[k][m] = Object.assign(decadeUI.dynamicSkin[k][m], skinSwitch.saveSkinParams[k][m])
                                decadeUI.dynamicSkin[k][m].gongji = gongji

                                // 添加上千幻雷修的调整参数
                                if (skinSwitch.saveSkinParams[k][m].qhlx) {
                                    decadeUI.dynamicSkin[k][m].qhlx = skinSwitch.saveSkinParams[k][m].qhlx
                                }
                            }
                        }
                    }
                }
            }

            // 替换十周年内容
            function modifyDecadeUIContent() {
                let Player = {};

                function pfqh_reinit(from, to, maxHp, online) {
                    var info1 = lib.character[from];
                    var info2 = lib.character[to];
                    var smooth = true;
                    let originName2 = this.name2
                    if (maxHp == 'nosmooth') {
                        smooth = false;
                        maxHp = null;
                    }
                    if (this.name2 == from) {
                        this.name2 = to;
                        if (this.isUnseen(0) && !this.isUnseen(1)) {
                            this.sex = info2[0];
                            this.name = to;
                        }
                        if (smooth) this.smoothAvatar(true);
                        this.node.avatar2.setBackground(to, 'character');
                        this.node.name2.innerHTML = get.slimName(to);
                    } else if (this.name == from || this.name1 == from) {
                        if (this.name1 == from) {
                            this.name1 = to;
                        }
                        if (!this.classList.contains('unseen2')) {
                            this.name = to;
                            this.sex = info2[0];
                        }
                        if (smooth) this.smoothAvatar(false);
                        this.node.avatar.setBackground(to, 'character');
                        this.node.name.innerHTML = get.slimName(to);

                        if (this == game.me && ui.fakeme) {
                            ui.fakeme.style.backgroundImage = this.node.avatar.style.backgroundImage;
                        }
                    } else {
                        return this;
                    }
                    if (online) {
                        return;
                    }
                    for (var i = 0; i < info1[3].length; i++) {
                        this.removeSkill(info1[3][i]);
                    }
                    for (var i = 0; i < info2[3].length; i++) {
                        this.addSkill(info2[3][i]);
                    }
                    if (Array.isArray(maxHp)) {
                        this.maxHp = maxHp[1];
                        this.hp = maxHp[0];
                    } else {
                        var num;
                        if (maxHp === false) {
                            num = 0;
                        } else {
                            if (typeof maxHp != 'number') {
                                maxHp = get.infoMaxHp(info2[2]);
                            }
                            num = maxHp - get.infoMaxHp(info1[2]);
                        }
                        if (typeof this.singleHp == 'boolean') {
                            if (num % 2 != 0) {
                                if (this.singleHp) {
                                    this.maxHp += (num + 1) / 2;
                                    this.singleHp = false;
                                } else {
                                    this.maxHp += (num - 1) / 2;
                                    this.singleHp = true;
                                    if (!game.online) {
                                        this.doubleDraw();
                                    }
                                }
                            } else {
                                this.maxHp += num / 2;
                            }
                        } else {
                            this.maxHp += num;
                        }
                    }
                    game.broadcast(function (player, from, to, skills) {
                        player.reinit(from, to, null, true);
                        player.applySkills(skills);
                    }, this, from, to, get.skillState(this));
                    game.addVideo('reinit3', this, {
                        from: from,
                        to: to,
                        hp: this.maxHp,
                        avatar2: this.name2 == to
                    });
                    this.update();

                    var skin = skinSwitch.getDynamicSkin(null, to);
                    if (this.doubleAvatar) {
                        let primary = true;
                        let deputy = true;
                        // 上面会重新赋值, 所以这里需要修改变身bug
                        if (originName2 === from) primary = false;
                        else deputy = false;
                        if (this.dynamic) {
                            this.stopDynamic(primary, deputy);
                            decadeUI.CUR_DYNAMIC--;
                        }
                        if (skin) {
                            skin.player = skin
                            this.playDynamic(skin, deputy);
                            decadeUI.CUR_DYNAMIC++;
                            skinSwitch.dynamic.setBackground(deputy ? "deputy" : "primary", this);
                        }
                    } else {
                        if (this.dynamic) {
                            this.stopDynamic();
                            decadeUI.CUR_DYNAMIC--;
                        }
                        if (skin) {
                            skin.player = skin;
                            this.playDynamic(skin, false);
                            decadeUI.CUR_DYNAMIC++;
                            if (skin.background) {
                                this.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                            } else {
                                this.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/皮肤切换/images/card/card.png")'
                            }

                        }
                    }
                    skinSwitch.skinSwitchCheckYH(this)
                };

                if (lib.config[skinSwitch.decadeKey.dynamicSkin]) {
                    if (self.OffscreenCanvas === undefined) {
                        alert("您的设备环境不支持新版手杀动皮效果，请更换更好的设备或者不使用此版本的手杀动皮效果");
                        return
                    } else {
                        // 拦截原来的logSkill函数, 加上如果使用非攻击技能,就播放特殊动画
                        // 本体1.9.117.2, 由于logSkill的trigger没有使用前就可以触发的, 所以仍然复制一份进行处理.
                        if (lib.version >= '1.9.117.2') {
                            console.log('======== version >= 1.9.117.2===========')
                            if (!lib.element.player._pfqh_replace_logSkill) {
                                // 保存原始的logSkill
                                lib.element.player._pfqh_replace_logSkill = lib.element.player.logSkill;
                                lib.element.player.logSkill = function (name, targets, nature, logv) {
                                    if (game.phaseNumber > 0) {
                                        if (name.indexOf("_") !== 0 && skinSwitch.filterSkills.indexOf(name) === -1 || this.skills.indexOf(name) !== -1) {
                                            if (this.isAlive() && this.dynamic && !this.GongJi) {
                                                console.log('logskill teshu=====')
                                                skinSwitch.chukuangWorkerApi.chukuangAction(this, 'TeShu')
                                            }
                                        }
                                    }
                                    return lib.element.player._pfqh_replace_logSkill.apply(this, [name, targets, nature, logv])
                                }
                            }


                        } else {
                            lib.element.player.logSkill = function (name, targets, nature, logv) {
                                // 播放角色使用非攻击技能的特殊动画
                                if (game.phaseNumber > 0) {
                                    if (name.indexOf("_") !== 0 && skinSwitch.filterSkills.indexOf(name) === -1 || this.skills.indexOf(name) !== -1) {
                                        // if (name.indexOf("_") !== 0 && skinSwitch.filterSkills.indexOf(name) === -1 && this.getStockSkills().indexOf(name) !== -1) {
                                        if (this.isAlive() && this.dynamic && !this.GongJi) {
                                            skinSwitch.chukuangWorkerApi.chukuangAction(this, 'TeShu')
                                        }
                                    }
                                }

                                /******* game.js原始代码 start **************/
                                if (get.itemtype(targets) == 'player') targets = [targets];
                                var nopop = false;
                                var popname = name;
                                if (Array.isArray(name)) {
                                    popname = name[1];
                                    name = name[0];
                                }
                                var checkShow = this.checkShow(name);
                                if (lib.translate[name]) {
                                    this.trySkillAnimate(name, popname, checkShow);
                                    if (Array.isArray(targets) && targets.length) {
                                        var str;
                                        if (targets[0] == this) {
                                            str = '#b自己';
                                            if (targets.length > 1) {
                                                str += '、';
                                                str += get.translation(targets.slice(1));
                                            }
                                        } else str = targets;
                                        game.log(this, '对', str, '发动了', '【' + get.skillTranslation(name, this) + '】');
                                    } else {
                                        game.log(this, '发动了', '【' + get.skillTranslation(name, this) + '】');
                                    }
                                }
                                if (nature != false) {
                                    if (nature === undefined) {
                                        nature = 'green';
                                    }
                                    this.line(targets, nature);
                                }
                                var info = lib.skill[name];
                                if (info && info.ai && info.ai.expose != undefined &&
                                    this.logAi && (!targets || targets.length != 1 || targets[0] != this)) {
                                    this.logAi(lib.skill[name].ai.expose);
                                }
                                if (info && info.round) {
                                    var roundname = name + '_roundcount';
                                    this.storage[roundname] = game.roundNumber;
                                    this.syncStorage(roundname);
                                    this.markSkill(roundname);
                                }
                                game.trySkillAudio(name, this, true);
                                if (game.chess) {
                                    this.chessFocus();
                                }
                                if (logv === true) {
                                    game.logv(this, name, targets, null, true);
                                } else if (info && info.logv !== false) {
                                    game.logv(this, name, targets);
                                }

                                if (info) {
                                    var player = this;
                                    var players = player.getSkills(null, false, false);
                                    var equips = player.getSkills('e');
                                    var global = lib.skill.global.slice(0);
                                    var logInfo = {
                                        skill: name,
                                        targets: targets,
                                        event: _status.event,
                                    };
                                    if (info.sourceSkill) {
                                        logInfo.sourceSkill = name;
                                        if (global.contains(name)) {
                                            logInfo.type = 'global';
                                        } else if (players.contains(name)) {
                                            logInfo.type = 'player';
                                        } else if (equips.contains(name)) {
                                            logInfo.type = 'equip';
                                        }
                                    } else {
                                        if (global.contains(name)) {
                                            logInfo.sourceSkill = name;
                                            logInfo.type = 'global';
                                        } else if (players.contains(name)) {
                                            logInfo.sourceSkill = name;
                                            logInfo.type = 'player';
                                        } else if (equips.contains(name)) {
                                            logInfo.sourceSkill = name;
                                            logInfo.type = 'equip';
                                        } else {
                                            var bool = false;
                                            for (var i of players) {
                                                var expand = [i];
                                                game.expandSkills(expand);
                                                if (expand.contains(name)) {
                                                    bool = true;
                                                    logInfo.sourceSkill = i;
                                                    logInfo.type = 'player';
                                                    break;
                                                }
                                            }
                                            if (!bool) {
                                                for (var i of players) {
                                                    var expand = [i];
                                                    game.expandSkills(expand);
                                                    if (expand.contains(name)) {
                                                        logInfo.sourceSkill = i;
                                                        logInfo.type = 'equip';
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    player.getHistory('useSkill').push(logInfo);
                                }

                                if (this._hookTrigger) {
                                    for (var i = 0; i < this._hookTrigger.length; i++) {
                                        var info = lib.skill[this._hookTrigger[i]].hookTrigger;
                                        if (info && info.log) {
                                            info.log(this, name, targets);
                                        }
                                    }
                                }
                                /******* game.js原始代码 end  **************/
                            };
                        }

                        lib.skill._gj = {
                            // 指定多个目标也让触发攻击状态
                            trigger: {player: ['useCardBefore', 'useCard1', 'useCard2']},
                            forced: true,
                            filter: function (event, player) {
                                if (player.isUnseen()) return false;
                                if (!player.dynamic) return false;
                                if (_status.currentPhase != player) return false;
                                if (event.card.name == "huogong") return false;
                                let type = get.type(event.card);
                                return ((type == 'basic' || type == 'trick') && get.tag(event.card, 'damage') > 0) && !player.GongJi;
                            },
                            content: function () {
                                // player.GongJi = true;
                                // 判定当前是否可以攻击, 可能是国战有隐藏武将
                                let res = skinSwitch.dynamic.checkCanBeAction(player);
                                if (!res || !res.dynamic) return player.GongJi = false;
                                else {
                                    // 添加指示线功能, 加载攻击指示线骨骼, 直接使用十周年ani来进行播放
                                    let dy = (player.dynamic.primary && player.dynamic.primary.player && player.dynamic.primary.player.zhishixian) || (player.dynamic.deputy && player.dynamic.deputy.player && player.dynamic.deputy.player.zhishixian)
                                    let args = null

                                    let getArgs = (filterPlayers = []) => {
                                        if (dy != null) {
                                            if (event.triggername !== 'useCardBefore' && event._trigger.targets.length < 2) {
                                                return
                                            }
                                            let hand = dui.boundsCaches.hand;
                                            let x1, y1

                                            args = {
                                                hand: null,  // 手牌区域
                                                attack: {},  // 攻击方坐标
                                                targets: [],  // 攻击目标坐标
                                                bodySize: {
                                                    bodyWidth: decadeUI.get.bodySize().width,
                                                    bodyHeight: decadeUI.get.bodySize().height
                                                }
                                            }

                                            player.checkBoundsCache(true);
                                            if (player === game.me) {
                                                hand.check();
                                                x1 = hand.x + hand.width / 2;
                                                y1 = hand.y;
                                                args.hand = {
                                                    x1: x1,
                                                    y1: y1
                                                }
                                            }
                                            // 攻击方的位置
                                            args.attack = player.getBoundingClientRect()

                                            // 计算当前角色和其他角色的角度. 参考十周年ui的指示线
                                            for (let p of event._trigger.targets) {
                                                if (filterPlayers.includes(p)) continue
                                                p.checkBoundsCache(true);
                                                args.targets.push({
                                                    boundRect: p.getBoundingClientRect(),
                                                })
                                            }
                                        }
                                    }

                                    // 记忆上次的攻击事件, useCard, useCard1, useCard2,会短时间内连续触发. 这样先过滤掉

                                    let timeDelta = player.__lastGongji ? new Date().getTime() - player.__lastGongji.t : 10000
                                    // 间隔极短的连续攻击忽略不计
                                    if (timeDelta < 20) return

                                    if (timeDelta >= 200) {
                                        if (/*timeDelta <= 350 &&*/ event.triggername !== 'useCardBefore') {
                                            if (player.__lastGongji && event._trigger.targets.length <= player.__lastGongji.tLen) {
                                                return
                                            }
                                        }
                                        getArgs()
                                        skinSwitch.chukuangWorkerApi.chukuangAction(player, 'GongJi', args ? {attackArgs: args, triggername: event.triggername} : {});
                                        player.__lastGongji = {
                                            t: new Date().getTime(),
                                            tLen: event._trigger.targets.length,
                                        }
                                    } else {
                                        if (event.triggername !== 'useCardBefore') {
                                            if (event._trigger.targets.length <= player.__lastGongji.tLen) {
                                                return
                                            }
                                            getArgs()
                                            if (args) {
                                                skinSwitch.chukuangWorkerApi.chukuangAction(player, 'GongJi', {attackArgs: args, triggername: event.triggername})
                                                player.__lastGongji = {
                                                    t: new Date().getTime(),
                                                    tLen: event._trigger.targets.length,
                                                }
                                            }
                                        }
                                    }


                                }
                            }
                        }

                        lib.skill._hf = {
                            trigger: {
                                global: 'gameStart'
                            },
                            forced: true,
                            init: function (player, skill) {
                                player.storage._hf = 0;
                            },
                            filter: function (event, player) {
                                return !lib.config[skinSwitch.configKey.hideHuanFu]
                            },
                            content: function () {
                                if (skinSwitch.dynamic.skinDiv) return
                                let skins
                                if (player.name === "unknown" && player.name1) {
                                    skins = decadeUI.dynamicSkin[player.name1];
                                } else {
                                    skins = decadeUI.dynamicSkin[player.name];
                                }
                                if (!skins) return;
                                let keys = Object.keys(skins);
                                if (keys.length < 1) return;
                                // 创建换肤按钮, 也就是右上角的换肤功能.
                                let div = ui.create.div('.switchSkinButton', ui.arena);
                                div.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                                    skinSwitch.dynamic.skinDivShowOrHide(true);
                                    game.playAudio("..", "extension", "皮肤切换/audio/game", "Menu.mp3");
                                })

                                let hf = skinSwitch.huanfu;
                                // 播放换肤动画
                                if (!dcdAnim.hasSpine(hf.name)) {
                                    dcdAnim.loadSpine(hf.name, "skel");
                                }
                                // skinSwitch.dynamic.initSwitch(player, skins);
                                skinSwitch.dynamic.initSwitchV2(player, skins);
                                document.body.appendChild(div);
                                player.storage._hf++;
                            }
                        };

                        // 只有主动发动技能才会触发这个
                        lib.skill._ts = {
                            trigger: {
                                player: ['useSkillBefore']
                            },
                            forced: true,
                            filter: function (event, player) {
                                return player.isAlive() && player.dynamic && !player.GongJi;
                            },
                            content: function () {
                                skinSwitch.chukuangWorkerApi.chukuangAction(player, 'TeShu')
                            }
                        }

                        lib.skill._changeSkelSkin = {
                            trigger: {
                                global: 'gameStart'
                            },
                            forced: true,
                            filter: function (event, player) {
                                return player.dynamic
                            },
                            content: function () {
                                // 添加监听按压角色框, 更换皮肤事件

                                player._at = new AnyTouch(player)
                                player._at.on('press', (e) => {
                                    skinSwitch.postMsgApi.changeSkelSkin(player)
                                })

                            }
                        }

                        lib.skill._checkDynamicShenYh = {
                            trigger: {
                                global: 'gameStart'
                            },
                            forced: true,
                            filter: function (event, player) {
                                return !player.doubleAvatar && player.dynamic && !(lib.config[skinSwitch.decadeKey.newDecadeStyle] === "on")  && !player.classList.contains('unseen') && !player.classList.contains('unseen2');
                            },
                            content: function () {
                                console.log("checkDynamicShenYh");
                                var isYh = player.getElementsByClassName("skinYh");
                                if (Object.keys(isYh).length <= 0) {
                                    var yh = skinSwitch.createYH(player.group);
                                    player.appendChild(yh);
                                }
                            }
                        };

                        // 检查游戏开始, 检查自己的是否是十周年真动皮, 播放出场动画, 暂时不考虑双将模式
                        lib.skill._checkDcdChuChang = {
                            trigger:{
                                global:"phaseBefore",
                            },
                            forced: true,
                            filter: function (event, player) {
                                return game.players.length > 1  /*&&player.phaseNumber===0*/ && player === event.player && !player.doubleAvatar && player.dynamic && player.dynamic.primary && player.dynamic.primary.player.chuchang
                            },
                            content: function () {
                                skinSwitch.chukuangWorkerApi.chukuangAction(player, 'chuchang')
                            }
                        };
                        lib.skill._checkDcdShan = {
                            trigger:{
                                player:'useCard'
                            },
                            forced: true,
                            filter: function (event, player) {
                                // 打出闪时
                                return event.card.name === 'shan' && player.dynamic && (player.dynamic.primary && player.dynamic.primary.player.shizhounian || player.dynamic.deputy && player.dynamic.deputy.player.shizhounian)
                            },
                            content: function () {
                                // 如果是双将, 只指定一个进行
                                if (player.dynamic.primary && player.dynamic.primary.player.shizhounian) {
                                    skinSwitch.postMsgApi.action(player, player.dynamic.primary.player.shan || 'play3', player.dynamic.primary)
                                } else {
                                    skinSwitch.postMsgApi.action(player, player.dynamic.deputy.player.shan || 'play3', player.dynamic.deputy)
                                }

                            }
                        }

                        // lib.skill._setDoubleAvatarBackground = {
                        //     trigger: {
                        //         global: 'gameStart'
                        //     },
                        //     forced: true,
                        //     filter: function (event, player) {
                        //         return get.mode() != 'guozhan' && player.name2 && player.dynamic;
                        //     },
                        //     content: function () {
                        //         let str = ['primary', 'deputy'];
                        //         for (let i = 0; i < 2; i++) {
                        //             if (player.dynamic[str[i]] && !player.isUnseen(i)) {
                        //                 skinSwitch.dynamic.setBackground(str[i], player);
                        //             }
                        //         }
                        //     }
                        // }

                        // 游戏开始时检查所有角色的圆弧组别是否正确
                        lib.skill._fix_yh = {
                            trigger: {
                                global: 'gameStart'
                            },
                            forced: true,
                            filter: function (event, player) {
                                return !(lib.config[skinSwitch.decadeKey.newDecadeStyle] === "on")
                            },
                            content: function () {
                                for (let p of game.players) {
                                   skinSwitch.skinSwitchCheckYH(p)
                                }

                            }
                        }

                        // 不知道怎么合并, 在回合开始和回合结束, 检测Player的group变化
                        lib.skill._fix_phase_yh = {
                            trigger: {
                                player: ['phaseBegin', 'phaseEnd']
                            },
                            forced: true,
                            filter: function (event, player) {
                                return !(lib.config[skinSwitch.decadeKey.newDecadeStyle] === "on")
                            },
                            content: function () {
                                skinSwitch.skinSwitchCheckYH(player)
                            }
                        }

                        // 覆盖reinit方法
                        lib.element.player.reinit = pfqh_reinit

                        // game原有的init函数, 模仿千幻聆音, 为了防止被覆盖, 直接拷贝过来, 也代表着需要随时和game主体的保持一致. 不然会出bug, 就和logSkill一样
                        let gameInit = function(character,character2,skill){
                            if(typeof character=='string'&&!lib.character[character]){
                                lib.character[character]=get.character(character);
                            }
                            if(typeof character2=='string'&&!lib.character[character2]){
                                lib.character[character2]=get.character(character2);
                            }
                            if(!lib.character[character]) return;
                            if(get.is.jun(character2)){
                                var tmp=character;
                                character=character2;
                                character2=tmp;
                            }
                            if(character2==false){
                                skill=false;
                                character2=null;
                            }
                            var info=lib.character[character];
                            if(!info){
                                info=['','',1,[],[]];
                            }
                            if(!info[4]){
                                info[4]=[];
                            }
                            var skills=info[3].slice(0);
                            this.clearSkills(true);
                            this.classList.add('fullskin');
                            if(!game.minskin&&get.is.newLayout()&&!info[4].contains('minskin')){
                                this.classList.remove('minskin');
                                this.node.avatar.setBackground(character,'character');
                            }
                            else{
                                this.node.avatar.setBackground(character,'character');
                                if(info[4].contains('minskin')){
                                    this.classList.add('minskin');
                                }
                                else if(game.minskin){
                                    this.classList.add('minskin');
                                }
                                else{
                                    this.classList.remove('minskin');
                                }
                            }

                            var hp1=get.infoHp(info[2]);
                            var maxHp1=get.infoMaxHp(info[2]);
                            var hujia1=get.infoHujia(info[2]);

                            this.node.avatar.show();
                            this.node.count.show();
                            this.node.equips.show();
                            this.name=character;
                            this.name1=character;
                            this.sex=info[0];
                            this.group=info[1];
                            this.hp=hp1;
                            this.maxHp=maxHp1;
                            this.hujia=hujia1;
                            this.node.intro.innerHTML=lib.config.intro;
                            this.node.name.dataset.nature=get.groupnature(this.group);
                            lib.setIntro(this);
                            this.node.name.innerHTML=get.slimName(character);
                            if(this.classList.contains('minskin')&&this.node.name.querySelectorAll('br').length>=4){
                                this.node.name.classList.add('long');
                            }
                            if(info[4].contains('hiddenSkill')&&!this.noclick){
                                if(!this.hiddenSkills) this.hiddenSkills=[];
                                this.hiddenSkills.addArray(skills);
                                skills=[];
                                this.classList.add(_status.video?'unseen_v':'unseen');
                                this.name='unknown';
                                if(!this.node.name_seat&&!_status.video){
                                    this.node.name_seat=ui.create.div('.name.name_seat',get.verticalStr(get.translation(this.name)),this);
                                    this.node.name_seat.dataset.nature=get.groupnature(this.group);
                                }
                                this.sex='male';
                                //this.group='unknown';
                                this.storage.nohp=true;
                                skills.add('g_hidden_ai');
                            }
                            if(character2&&lib.character[character2]){
                                var info2=lib.character[character2];
                                if(!info2){
                                    info2=['','',1,[],[]];
                                }
                                if(!info2[4]){
                                    info2[4]=[];
                                }
                                this.classList.add('fullskin2');
                                this.node.avatar2.setBackground(character2,'character');

                                this.node.avatar2.show();
                                this.name2=character2;
                                var hp2=get.infoHp(info2[2]);
                                var maxHp2=get.infoMaxHp(info2[2]);
                                var hujia2=get.infoHujia(info2[2]);
                                this.hujia+=hujia2;
                                var double_hp;
                                if(_status.connectMode||get.mode()=='single'){
                                    double_hp='pingjun';
                                }
                                else{
                                    double_hp=get.config('double_hp');
                                }
                                switch(double_hp){
                                    case 'pingjun':{
                                        this.maxHp=Math.floor((maxHp1+maxHp2)/2);
                                        this.hp=Math.floor((hp1+hp2)/2);
                                        this.singleHp=((maxHp1+maxHp2)%2===1);
                                        break;
                                    }
                                    case 'zuidazhi':{
                                        this.maxHp=Math.max(maxHp1,maxHp2);
                                        this.hp=Math.max(hp1,hp2);
                                        break;
                                    }
                                    case 'zuixiaozhi':{
                                        this.maxHp=Math.min(maxHp1,maxHp2);
                                        this.hp=Math.min(hp1,hp2);
                                        break;
                                    }
                                    case 'zonghe':{
                                        this.maxHp=maxHp1+maxHp2;
                                        this.hp=hp1+hp2;
                                        break;
                                    }
                                    default:{
                                        this.maxHp=maxHp1+maxHp2-3;
                                        this.hp=hp1+hp2-3;
                                    };
                                }
                                this.node.count.classList.add('p2');
                                if(info2[4].contains('hiddenSkill')&&!this.noclick){
                                    if(!this.hiddenSkills) this.hiddenSkills=[];
                                    this.hiddenSkills.addArray(info2[3]);
                                    this.classList.add(_status.video?'unseen2_v':'unseen2');
                                    this.storage.nohp=true;
                                    skills.add('g_hidden_ai');
                                }
                                else skills=skills.concat(info2[3]);

                                this.node.name2.innerHTML=get.slimName(character2);
                            }
                            if(this.storage.nohp){
                                this.storage.rawHp=this.hp;
                                this.storage.rawMaxHp=this.maxHp;
                                this.hp=1;
                                this.maxHp=1;
                                this.node.hp.hide();
                            }
                            if(skill!=false){
                                for(var i=0;i<skills.length;i++){
                                    this.addSkill(skills[i]);
                                }
                                this.checkConflict();
                            }
                            lib.group.add(this.group);
                            if(this.inits){
                                for(var i=0;i<lib.element.player.inits.length;i++){
                                    lib.element.player.inits[i](this);
                                }
                            }
                            if(this._inits){
                                for(var i=0;i<this._inits.length;i++){
                                    this._inits[i](this);
                                }
                            }
                            this.update();
                            return this;
                        }

                        Player.init = function (character, character2, skill) {

                            // EngEX设计的动皮露头外框, 还是比较好看的.
                            let isYh = this.getElementsByClassName("skinYh");
                            if (isYh.length > 0) {
                                isYh[0].remove();
                            }
                            let bj = this.getElementsByClassName("gain-skill flex");
                            if (bj.length > 0) {
                                bj[0].innerHTML = null;
                            }
                            this.doubleAvatar = (character2 && lib.character[character2]) !== undefined;
                            let CUR_DYNAMIC = decadeUI.CUR_DYNAMIC;
                            let MAX_DYNAMIC = decadeUI.MAX_DYNAMIC;
                            if (CUR_DYNAMIC === undefined) {
                                CUR_DYNAMIC = 0;
                                decadeUI.CUR_DYNAMIC = CUR_DYNAMIC;
                            }

                            if (MAX_DYNAMIC === undefined) {
                                MAX_DYNAMIC = skinSwitch.isMobile() ? 2 : 10;
                                if (window.OffscreenCanvas)
                                    MAX_DYNAMIC += 8;
                                decadeUI.MAX_DYNAMIC = MAX_DYNAMIC;
                            }

                            // 这里会有一个bug, 就是在自定义的乱斗模式里, 同一个角色会快速初始化两次, 所以导致当骨骼还没完全加载好,就取执行stop函数,导致删除node失败
                            // 最后会出现重影,就是有两个apnode同时渲染
                            if (this.dynamic) {
                                if (this.dynamic.primary) this.stopDynamic(true, false)
                                if (this.dynamic.deputy) this.stopDynamic(false, true)
                            }
                            let showDynamic = (this.dynamic || CUR_DYNAMIC < MAX_DYNAMIC) && duicfg.dynamicSkin;
                            let y = false;
                            if (showDynamic && _status.mode != null) {
                                let skins;

                                let avatars = this.doubleAvatar ? [character, character2] : [character];
                                let dskins = decadeUI.dynamicSkin;
                                let increased;
                                let hasHideWuJiang = false

                                for (let i = 0; i < avatars.length; i++) {

                                    skins = dskins[avatars[i]];
                                    if (skins === undefined)
                                        continue;

                                    let keys = Object.keys(skins);
                                    if (keys.length === 0) {
                                        console.error('player.init: ' + avatars[i] + ' 没有设置动皮参数');
                                        continue;
                                    }
                                    let skin

                                    let dynamicSkinKey = skinSwitch.configKey.dynamicSkin
                                    // 将皮肤的相关参数保存起来
                                    if (lib.config[dynamicSkinKey]) {
                                        let ps = lib.config[dynamicSkinKey][avatars[i]];
                                        if (ps === 'none') continue // 主动设置为静皮的

                                        if (ps) {
                                            skin = skins[ps];
                                        } else {
                                            lib.config[dynamicSkinKey][avatars[i]] = Object.keys(skins)[0];
                                            game.saveConfig(dynamicSkinKey, lib.config[dynamicSkinKey]);
                                        }
                                    } else {
                                        lib.config[dynamicSkinKey] = {};
                                        lib.config[dynamicSkinKey][avatars[i]] = Object.keys(skins)[0];
                                        game.saveConfig(dynamicSkinKey, lib.config[dynamicSkinKey]);
                                    }
                                    // 如果没有保存皮肤参数, 那么默认获取第0个皮肤
                                    if (!skin) skin = skins[Object.keys(skins)[0]];
                                    if (skin.speed === undefined) skin.speed = 1;
                                    y = true;
                                    if (!skin.skinName) skin.skinName = keys[i];
                                    if (!this.doubleAvatar) {
                                        if (this === game.me) {
                                            skinSwitch.selectSkinData.value = keys[i];
                                        }
                                    }
                                    // player是保存皮肤原始参数, 当动皮播放完毕后还需要返回原始位置
                                    skin.player = skin;
                                    // if (skin.action && skin.pos) skin.action = "ChuChang";
                                    let hide = lib.character[avatars[i]][4];
                                    let isHide;
                                    if (hide.length > 0 && hide[0] === "hiddenSkill") {
                                        isHide = true;
                                        hasHideWuJiang = true
                                    }
                                    // 是否有副将
                                    if (get.mode() === "guozhan" || isHide) skin.deputy = true;

                                    // 检测皮肤是否放在其他位置, 更换皮肤名字
                                    if (skin.localePath) {
                                        // 防止同一个武将重复初始化出错找不到骨骼
                                        if (!skin.name.startsWith(skin.localePath + '/')) {
                                            skin.name = skin.localePath + '/' + skin.name
                                            skin.background = skin.localePath + '/' + skin.background
                                        }
                                    }

                                    if (!this.doubleAvatar && !isHide) {
                                        if (skin.background) {
                                            this.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                                        } else {
                                            this.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/皮肤切换/images/card/card.png")'
                                        }
                                    }
                                    this.playDynamic(skin, i === 1);
                                    if (!increased) {
                                        increased = true;
                                        decadeUI.CUR_DYNAMIC++;
                                    }

                                }
                                if ((this.doubleAvatar && (get.mode() === "guozhan")) || hasHideWuJiang) {
                                    let e = this.getElementsByClassName("dynamic-wrap");
                                    if (e.length > 0) {
                                        e[0].style.display = "none";
                                        e[0].style.height = "100%";
                                        e[0].style.borderRadius = "0";
                                    }
                                }
                                var forces = lib.character[character][1];

                                if (forces !== 'shen' && !!hasHideWuJiang) {
                                    skinSwitch.skinSwitchCheckYH(this)
                                }

                                skinSwitch.dynamic.startPlay2Random(this)
                            }



                            var jie;
                            if (character && duicfg.showJieMark) {
                                if (lib.characterPack.refresh)
                                    jie = lib.characterPack.refresh[character];
                                if (jie == null) {
                                    jie = character.substr(0, 3);
                                    jie == 're_' || jie == 'ol_' || jie == 'xin' || jie == 'old';
                                }

                                if (jie != null) {
                                    jie = lib.translate[character][0];
                                    if (jie == '界') {
                                        if (this.$jieMark == undefined)
                                            this.$jieMark = dui.element.create('jie-mark', this);
                                        else
                                            this.appendChild(this.$jieMark);
                                    }
                                }
                            }

                            // var result = this._super.init.apply(this, arguments);
                            var result = gameInit.apply(this, arguments);
                            if (jie == '界') {
                                var text = result.node.name.innerText;
                                if (text[1] == '\n')
                                    text = text.substr(2);
                                else
                                    text = text.substr(1);

                                result.node.name.innerText = text;
                            }
                            return result;
                        };

                        // 有暗将的修改
                        Player.showCharacter = function (num, log) {
                            let toShow = [];
                            if ((num === 0 || num === 2) && this.isUnseen(0)) toShow.add(this.name1);
                            if ((num === 1 || num === 2) && this.isUnseen(1)) toShow.add(this.name2);
                            if (!toShow.length) return;
                            if (num === 0 && !this.isUnseen(0)) {
                                return;
                            }
                            if (num === 1 && (!this.name2 || !this.isUnseen(1))) {
                                return;
                            }
                            if (!this.isUnseen(2)) {
                                return;
                            }
                            let that = this;

                            let addYh = () => {
                                skinSwitch.skinSwitchCheckYH(that)
                            }

                            function showDynamicSkin(e)
                            {

                                if (that.dynamic) {
                                    function post(id) {
                                        let e = that.getElementsByClassName("dynamic-wrap");
                                        if (e.length > 0) e[0].style.display = "block";
                                        skinSwitch.postMsgApi.show(that, id)
                                    }

                                    if (e === "unseen") {
                                        if (that.dynamic.primary) {
                                            skinSwitch.dynamic.setBackground("primary", that);
                                            post(that.dynamic.primary.id);
                                            addYh()
                                        }
                                    } else if (e === "unseen2") {
                                        if (that.dynamic.deputy) {
                                            skinSwitch.dynamic.setBackground("deputy", that);
                                            post(that.dynamic.deputy.id);
                                            addYh()
                                        }
                                    }
                                }
                            }
                            switch (num) {
                                case 0:
                                    showDynamicSkin("unseen");
                                    break;
                                case 1:
                                    showDynamicSkin("unseen2");
                                    break;
                                case 2:
                                    showDynamicSkin("unseen");
                                    showDynamicSkin("unseen2");
                                    break;
                            }

                            lib.element.player.$showCharacter.apply(this, arguments);
                            let next = game.createEvent('showCharacter', false);
                            next.player = this;
                            next.num = num;
                            next.toShow = toShow;
                            next._args = arguments;
                            next.setContent('showCharacter');
                            return next;
                        };

                        Player.playDynamic = function (animation, deputy) {
                            deputy = deputy === true;
                            if (animation == undefined) return console.error('playDynamic: 参数1不能为空');
                            var dynamic = this.dynamic;
                            if (!dynamic) {
                                dynamic = new duilib.DynamicPlayer('assets/dynamic/');
                                dynamic.dprAdaptive = true;
                                this.dynamic = dynamic;
                                this.$dynamicWrap.appendChild(dynamic.canvas)
                                skinSwitch.rendererOnMessage.addListener(this, 'logMessage', function (data) {
                                    console.log('dyWorker', data)
                                })

                            }
                            let isCutBg = lib.config[skinSwitch.configKey.cugDynamicBg] &&  ui.arena.dataset.dynamicSkinOutcrop === 'on' && (ui.arena.dataset.newDecadeStyle === 'on')

                            if (typeof animation == 'string') animation = { name: animation };
                            if (this.doubleAvatar) {
                                // 由于这里是直接修改原始的x数组, 所以会影响到第二次更新该皮肤时会导致位置偏移, 所以copy一份进行赋值变化
                                animation = Object.assign({}, animation)
                                if (Array.isArray(animation.x)) {
                                    animation.x = animation.x.concat();
                                    animation.x[1] += deputy ? 0.25 : -0.25;
                                } else {
                                    if (animation.x == undefined) {
                                        animation.x = [0, deputy ? 0.75 : 0.25];
                                    } else {
                                        animation.x = [animation.x, deputy ? 0.25 : -0.25];
                                    }
                                }
                                animation.clip = {
                                    x: [0, deputy ? 0.5 : 0],
                                    y: 0,
                                    width: [0, 0.5],
                                    height: [0, 1],
                                    clipParent: true
                                }
                                if (animation.player && animation.player.beijing && isCutBg) {
                                    animation.player.beijing.clip = {
                                        x: [0, deputy ? 0.5 : 0],
                                        y: 0,
                                        width: [0, 0.5],
                                        height: [0, 0.9],
                                        clipParent: true
                                    }
                                }
                            } else {
                                if (animation.player && animation.player.beijing && isCutBg) {
                                    animation.player.beijing.clip = {
                                        x: 0,
                                        y: 0,
                                        width: [0, 1],
                                        height: [0, 0.9],
                                        clipParent: true
                                    }
                                }
                            }
                            if (this.$dynamicWrap.parentNode != this) this.appendChild(this.$dynamicWrap);
                            // if (this.$newDynamicWrap && this.$newDynamicWrap.parentNode !== this) this.appendChild(this.$newDynamicWrap);
                            dynamic.outcropMask = duicfg.dynamicSkinOutcrop;
                            if (animation.player) {
                                animation.player.isMobile = skinSwitch.isMobile()
                            }
                            var avatar = dynamic.play(animation);

                            if (deputy === true) {
                                dynamic.deputy = avatar;
                            } else {
                                dynamic.primary = avatar;
                            }

                            this.classList.add(deputy ? 'd-skin2' : 'd-skin');
                            // 播放完动皮自动调用初始化功能
                            skinSwitch.chukuangPlayerInit(this, !deputy, animation.player)

                        }

                        window.duilib = newDuilib
                        // 先初步进行初始化
                        if (!lib.config['extension_千幻聆音_enable'] || lib.config['extension_千幻聆音_qhly_decadeCloseDynamic'] || !(lib.config.qhly_currentViewSkin === 'decade' || lib.config.qhly_currentViewSkin === 'shousha')) {
                            overrides(lib.element.player, Player)
                        }
                    }
                    let retryOverride = function (times, timer) {
                        if (times < 0) return
                        if (!window.decadeUI || !lib.skill._decadeUI_usecardBegin) {
                            console.log(`第${times}次尝试`)
                            let ti = setTimeout(() => {
                                retryOverride(times-1, ti)
                            }, 10)
                        } else {
                            overrides(lib.element.player, Player)
                            console.log('替换十周年UI player成功')
                            // 为当前的每一个player更换init方法
                            for (let i = 0; i < game.players.length; i++) {
                                game.players[i].init = Player.init;
                                game.players[i].playDynamic = Player.playDynamic;
                                game.players[i].showCharacter = Player.showCharacter;
                                game.players[i].reinit = pfqh_reinit;
                            }

                            if (timer) {
                                clearTimeout(timer)
                            }
                        }
                    }
                    // 如果千幻聆音没有开启动皮, 或者选择的UI套装不是十周年或者手杀, 初始化
                    if (!lib.config['extension_千幻聆音_enable'] || lib.config['extension_千幻聆音_qhly_decadeCloseDynamic'] || !(lib.config.qhly_currentViewSkin === 'decade' || lib.config.qhly_currentViewSkin === 'shousha')) {
                        retryOverride(20)
                    }
                    // groupChange(lib.element.player)
                    // for (let i = 0; i < game.players.length; i++) {
                    //     groupChange(game.players[i])
                    // }
                }

                // ======== 替换结束 ========
            }

            function overrides (dest, src) {
                if (!src) return
                for (let key in src) {
                    dest[key] = src[key];
                }
            }
            updateDecadeDynamicSkin()
            modifyDecadeUIContent()

            // 加载l2d
            if (lib.config[skinSwitch.configKey.l2dEnable]) {
                lib.init.js(skinSwitch.url + 'component/live2d', 'live2dcubismcore.min', () => {
                    lib.init.js(skinSwitch.url + 'component/live2d', 'pixi.min', () => {
                        lib.init.js(skinSwitch.url + 'component/live2d', 'Live2dLoader', () => {
                            // 读取l2d配置
                            lib.init.js(skinSwitch.url, 'l2dSettings', function () {
                                // 修改配置
                                let newItem = {}
                                for (let k in pfqhLive2dSettings.models) {
                                    newItem[k] = pfqhLive2dSettings.models[k].name || k
                                }
                                console.log('newItem00000000', newItem)
                                lib.extensionMenu.extension_皮肤切换.l2dSetting.item = newItem

                                let curVal = lib.config[skinSwitch.configKey.l2dSetting]
                                if (curVal in pfqhLive2dSettings.models) {
                                    let base = Object.assign({}, pfqhLive2dSettings.baseSetting)
                                    for (let k in pfqhLive2dSettings.models[curVal]) {
                                        base[k] = pfqhLive2dSettings.models[curVal][k]
                                    }
                                    base.role = lib.assetURL + base.basePath + base.role
                                    base.height = base.height * decadeUI.get.bodySize().height
                                    base.width = base.width * decadeUI.get.bodySize().width
                                    skinSwitch.l2dLoader = new CustomLive2dLoader([
                                        base
                                    ]);
                                }

                            });
                        })
                    })
                })
            }


        },
        precontent:function() {
            window.skinSwitch = {
                name: "皮肤切换",
                version: 1.11,
                url: lib.assetURL + "extension/皮肤切换/",
                path: 'extension/皮肤切换',
                dcdPath: 'extension/十周年UI',
                dcdUrl: lib.assetURL + "extension/十周年UI",
                qhlyUrl: lib.assetURL + "extension/千幻聆音",
                configKey: {
                    'bakeup': 'extension_皮肤切换_bakeup', // 备份与替换十周年文件数据
                    'dynamicSkin': 'extension_皮肤切换_dynamicSkin', // 保存选择的皮肤的历史数据
                    'showEditMenu': 'extension_皮肤切换_showEditMenu', // 是否加入顶部菜单
                    'showPreviewDynamicMenu': 'extension_皮肤切换_showPreviewDynamicMenu', // 预览是否加入顶部菜单
                    'closeXYPosAdjust': 'extension_皮肤切换_closeXYPosAdjust',  // 是否显示坐标微调
                    'hideHuanFu': 'extension_皮肤切换_hideHuanFu',  // 关闭隐藏换肤按钮
                    'useDynamic': 'extension_皮肤切换_useDynamic',  // 使用皮肤切换携带的出框功能
                    'isAttackFlipX': 'extension_皮肤切换_isAttackFlipX',  //
                    'cugDynamicBg': 'extension_皮肤切换_cugDynamicBg',  // 是否裁剪动态背景
                    'replaceDecadeAni': 'extension_皮肤切换_replaceDecadeAni',  // 是否替换十周年ui的动画播放器对象
                   // 'adjustQhlyFact': 'extension_皮肤切换_adjustQhlyFact',  // 调整预览参数
                   'modifyQhlxPreview': 'extension_皮肤切换_modifyQhlxPreview',  // 调整预览大小
                   'l2dEnable': 'extension_皮肤切换_l2dEnable',  // 是否允许l2d
                   'l2dSetting': 'extension_皮肤切换_l2dSetting',  // l2d配置
                },
                // 十周年UI的配置key
                decadeKey: {
                    'dynamicSkin': 'extension_十周年UI_dynamicSkin',
                    'newDecadeStyle': 'extension_十周年UI_newDecadeStyle',
                    'enable': 'extension_十周年UI_enable',
                },
                'huanfu': {
                    'name': "../../../皮肤切换/images/huanfu/huanfu",
                    loop: false,
                    scale: 0.5,
                    speed: 1.5
                },
                qhly_hasExtension: function (str) {
                    if (!str || typeof str != 'string') return false;
                    if (lib.config && lib.config.extensions) {
                        for (var i of lib.config.extensions) {
                            if (i.indexOf(str) == 0) {
                                if (lib.config['extension_' + i + '_enable']) return true;
                            }
                        }
                    }
                    return false;
                },
                // adjustQhlyFact: function (e) {
                //     let v = Number(e.target.value)
                //     if (isNaN(v) || v > 1 || v <= 0){
                //         let saveVal = lib.config[skinSwitch.configKey.adjustQhlyFact]
                //         if (!saveVal || isNaN(Number(saveVal))) {
                //             saveVal = 0.85
                //         }
                //         e.target.value = Number(saveVal).toFixed(2)
                //         return
                //     }
                //     lib.config[skinSwitch.configKey.adjustQhlyFact] = v
                //     for (let p of game.players) {
                //         if (p.dynamic) {
                //             p.dynamic.renderer.postMessage({
                //                 message: 'changeQhlxFactor',
                //                 factor: v
                //             })
                //         }
                //     }
                // },
                // 检查圆弧
               skinSwitchCheckYH: function (player) {
                    if (lib.config['extension_十周年UI_newDecadeStyle'] == "on") return;
                    if (!player || get.itemtype(player) != 'player') return;
                    let group = player.group || 'weizhi';
                    let isYh = false;

                    if (player.dynamic) {
                        if (player.dynamic.primary && player.dynamic.primary != null && !player.isUnseen(0)) isYh = true;
                        if (player.dynamic.deputy && player.dynamic.deputy != null && !player.isUnseen(1)) isYh = true;
                    }

                    let skinYh = player.getElementsByClassName("skinYh");
                    if (isYh && skinYh.length == 0) {
                        skinSwitch.createYH(group)
                    } else if (!isYh && skinYh.length > 0) {
                        player.removeChild(skinYh[0]);
                    } else if (isYh && skinYh.length > 0) {
                        let yh = skinYh[0]
                        let splits = (yh.src || '').split('/')
                        let sub = splits[splits.length - 1]
                        let curGroup = sub.split('.')[0]
                        if (curGroup !== group) {
                            skinYh[0].remove()
                            yh = skinSwitch.createYH(group)
                            player.append(yh)
                        }
                    }
                },
                //判断文件、文件夹是否存在
                qhly_checkFileExist: function (path, callback) {
                    if (lib.node && lib.node.fs) {
                        try {
                            var stat = lib.node.fs.statSync(__dirname + '/' + path);
                            callback(stat);
                        } catch (e) {
                            callback(false);
                            return;
                        }
                    } else {
                        resolveLocalFileSystemURL(lib.assetURL + path, (function (name) {
                            return function (entry) {
                                callback(true);
                            }
                        }(name)), function () {
                            callback(false);
                        });
                    }
                },
                isMobile: function () {
                    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent));
                },
                getCoordinate: function (domNode, subtr) {
                    if (!domNode && !decadeUI) return false;
                    var rect = domNode.getBoundingClientRect();
                    return {
                        x: rect.left,
                        y: decadeUI.get.bodySize().height - (subtr ? rect.bottom : 0),
                        width: rect.width,
                        height: rect.height,
                        bodyWidth: decadeUI.get.bodySize().width,
                        bodyHeight: decadeUI.get.bodySize().height,
                    };
                },
                // 计算其他角色的方向与位置, 播放动画可以调整
                getDirection: function (dom, sl) {
                    var width = document.body.clientWidth / 2;
                    var pos = this.getCoordinate(dom, true);
                    var isLeft = pos.x >= width ? false : true;
                    if (sl) {
                        if (isLeft) {
                            return {x: [0, 1.2], y: [0, 0], isLeft: isLeft};
                        } else return {x: [0, -0.1], y: [0, 0], isLeft: isLeft};
                    } else {
                        if (isLeft) {
                            return {x: [0, 0.4], y: [0, 0.5], isLeft: isLeft};
                        } else return {x: [0, 0.63], y: [0, 0.5], isLeft: isLeft};
                    }
                },
                backupFileDui: function () {
                    // 将animation的内容修改, 重新写入到十周年文件中. 并且备份原始文件
                    if (!window.decadeUI) {
                        alert("请先安装和开启十周年UI");
                        return;
                    }
                    // 备份原有文件
                    let backDir = skinSwitch.dcdPath + '/备份'
                    game.ensureDirectory(backDir, function () {
                        let progressBG = ui.create.div(".progressBG", ui.window)
                        let progressBar = ui.create.div(progressBG)

                        let files = ['animation.js', 'dynamicWorker.js', 'extension.js']
                        let tasks = files.length
                        let current = 0
                        skinSwitch.addProgress(progressBar, current, tasks)

                        for (let f of files) {
                            game.readFile(skinSwitch.dcdPath + '/' + f, function (data) {
                                game.writeFile(data, backDir, f, function () {
                                    console.log(`备份${f}成功`)
                                    skinSwitch.addProgress(progressBar, ++current, tasks)
                                    if(current >= files.length) {
                                        progressBG.style.opacity = "0";
                                        skinSwitchMessage.show({
                                            type: 'success',
                                            text: '备份完成',
                                        })
                                    }
                                })
                            })
                        }
                    })
                },
                modifyFileDui: function() {
                    // if (lib.config[skinSwitch.configKey.bakeup]) {
                    //     // alert('已经备份了十周年文件, 无需重复操作')
                    //     return
                    // }

                    if (confirm("会覆盖十周年原文件,请确认是否已经备份过原文件方便出错还原, 是否确认?")) {
                        let progressBG = ui.create.div(".progressBG", ui.window)
                        let progressBar = ui.create.div(progressBG)
                        let files = ['animation.js', 'dynamicWorker.js']
                        let tasks = files.length
                        let current = 0

                        skinSwitch.addProgress(progressBar, current, tasks)

                        // 如果已经备份过, 就不重新备份了
                        // if (!lib.config[skinSwitch.configKey.bakeup]) {
                        //     for (let f of files) {
                        //         skinSwitch.backupFileDui(skinSwitch.dcdPath, f, function () {
                        //             skinSwitch.addProgress(progressBar, ++current, tasks)
                        //         })
                        //     }
                        // }

                        // 修改十周年文件.
                        // 将本地的worker文件copy,
                        let cpWorkerFiles = ['dynamicWorker.js', 'animation.js']
                        cpWorkerFiles.forEach(cpWorkerFile => {
                            game.readFile(skinSwitch.path + '/十周年UI/' + cpWorkerFile, function (data) {
                                game.writeFile(data, skinSwitch.dcdPath, cpWorkerFile, function () {
                                    skinSwitch.addProgress(progressBar, ++current, tasks)
                                    if (current >= tasks) {
                                        game.saveConfig(skinSwitch.configKey.bakeup, true)
                                        setTimeout(() => {
                                            progressBG.style.opacity = "0";
                                            if (confirm("导入备份十周年文件成功，点击确定将重启游戏")) {
                                                progressBG.remove();
                                                game.reload();
                                            }
                                        }, 2500)
                                    }
                                })
                            })
                        })
                    }
                },

                genDynamicSkin: function () {
                    if (window.pfqhUtils) {
                        if (decadeUI.dynamicSkin) {
                            let str = pfqhUtils.transformDdyskins(decadeUI.dynamicSkin)
                            // 写入文件中
                            game.writeFile(str, skinSwitch.path, '转换后_dynamicSkin.js', function () {
                                console.log('写入saveSkinParams.js成功')
                                skinSwitchMessage.show({
                                    type: 'success',
                                    text: '转换成功',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                            })
                        }
                    }
                },
                genDyTempFile: function () {
                    if (window.pfqhUtils) {
                        if (decadeUI.dynamicSkin) {
                            pfqhUtils.generateDynamicFile(lib,decadeUI.dynamicSkin)
                        }
                    }
                },
                addProgress: function (obj, value, total) {
                    var progress = Math.floor(value / total * 100);
                    obj.style.backgroundSize = progress + "% 100%";
                },
                getDynamicSkin: function (skinName, playerName) {
                    if (!playerName) return false;
                    var dskins = dui.dynamicSkin;
                    var skins = dskins[playerName];
                    if (skins) {
                        if (skinName) return skins[skinName];
                        else {
                            let ps
                            if (lib.config[skinSwitch.configKey.dynamicSkin]) {
                                ps = lib.config[skinSwitch.configKey.dynamicSkin][playerName]
                            }
                            if (ps) return skins[ps];
                            else return skins[Object.keys(skins)[0]]
                        }
                    } else return false;
                },
                actionFilter: function (actions, action) {
                    var res = false;
                    for (var actionKey of actions) {
                        if (actionKey == action) {
                            return res = true;
                        }
                    }
                    return res;
                },
                createYH: function (group) {
                    var yh = document.createElement("img");
                    yh.src = skinSwitch.url + "/images/border/" + group + ".png";
                    yh.classList.add("skinYh")
                    yh.style.display = "block";
                    yh.style.position = "absolute";
                    yh.style.top = "-22px";
                    yh.style.height = "50px";
                    yh.style.width = "131.1px";
                    yh.style.zIndex = "61";
                    return yh;
                },
                resetDynamicData: function () {
                    if (!lib.config[skinSwitch.decadeKey.dynamicSkin]) return alert("需要先打开十周年UI的动皮,再重置");
                    if (!lib.config[skinSwitch.configKey.dynamicSkin]) alert("没有动皮存档可重置");
                    if (confirm("你确定要重置动皮存档吗？完成后会自动重启游戏")) {
                        game.saveConfig(skinSwitch.configKey.dynamicSkin, null)
                        setTimeout(() => {
                            game.reload();
                        }, 1000);
                    }
                },
                selectSkinData: {
                    temp: "",
                    value: "",
                },
                // 触发以下武器技能不触发角色的特殊动画
                filterSkills: [
                    'zhangba_skill', 'guding_skill',
                    'zhuque_skill', 'hanbing_skill',
                    'guanshi_skill', 'cixiong_skill',
                    'fangtian_skill', 'qilin_skill',
                    'qinggang_skill', 'zhuge_skill',
                    'bagua_skill', 'bahu',
                ],
                dynamic: {
                    initSwitch: function (player,skins) {
                        if (player.name == "unknown" && player.name1) {
                            var name = player.name1;
                        } else {
                            var name = player.name;
                        }
                        var skinDiv = ui.create.div("#skinDiv", ui.window);
                        skinSwitch.dynamic.skinDiv = skinDiv;
                        skinDiv.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                            skinSwitch.dynamic.skinDivShowOrHide()
                        })
                        var skinDiv2 = ui.create.div("#skinDiv2", skinDiv);
                        skinDiv2.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function (e) {
                            e.stopPropagation();
                        })
                        var skinBox = ui.create.div(".skinBox", skinDiv2);
                        skinBox.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function (e) {
                            e.stopPropagation();
                        })
                        var keys = Object.keys(skins)
                        for (let i = 0; i < keys.length; i++) {
                            var t = ui.create.div(".engSkin",skinBox);
                            t.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function (e) {
                                e.stopPropagation();
                            })
                            let path = skinSwitch.url + "/images/character/" + skinSwitch.dynamic.judgingRealName(name) + "/" + keys[i] + ".png";
                            let img = document.createElement("img");
                            let saveDynamic = lib.config[skinSwitch.configKey.dynamicSkin];
                            if (saveDynamic) {
                                var skin = saveDynamic[name];
                                if (skin == keys[i]) {
                                    t.style.backgroundImage = "url(" + skinSwitch.url + "/images/base/skin_bg.png)";
                                    skinSwitch.selectSkinData.temp = t;
                                    skinSwitch.selectSkinData.value = keys[i];
                                } else t.style.backgroundImage = "url(" + skinSwitch.url + "/images/base/skin_not_bg.png)";
                            }

                            img.alt = keys[i];
                            img.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function (e) {
                                e.stopPropagation();
                                this.parentNode.alt = this.alt;
                                skinSwitch.dynamic.selectSkin(this.parentNode);
                            })
                            img.src = path;
                            img.onerror = function () {
                                this.src = skinSwitch.url + "/images/character/小杀.png";
                                this.onerror = null;
                                return true
                            }
                            t.appendChild(img);
                        }
                    },
                    dynamicSkinInfo: {},  // 保存每个有动皮角色的在十周年ui的动皮配置信息
                    playerTempSkinInfo: {
                        currentWatchId: null,  // 保存当前选择查看的角色动皮信息
                    },
                    initPlayerAvatarDynamic: (player, isPrimary) => {
                        if (player.pfqhId == null) return
                        let dInfo = skinSwitch.dynamic.dynamicSkinInfo[player.pfqhId]
                        if (!dInfo) return
                        let skinInfos = isPrimary ? dInfo.primary : dInfo.deputy
                        let characterName = isPrimary ? player.name1 : player.name2
                        // 初始化当前皮肤信息到dom中
                        let skins = document.getElementById('pfqhSkins')
                        // 删除原来的节点
                        skins.innerHTML = ''

                        let addLisName = lib.config.touchscreen ? 'touchend' : 'click'

                        let selectName = null
                        if (lib.config[skinSwitch.configKey.dynamicSkin]) {
                            selectName = lib.config[skinSwitch.configKey.dynamicSkin][characterName]
                        }

                        if (skinInfos) {
                            // 获取选择的皮肤的位置
                            let keys = Object.keys(skinInfos)
                            let curIndex = 0
                            for (let j = 0; j < keys.length; j++) {
                                if (selectName === keys[j]) {
                                    curIndex = j
                                    break
                                }
                            }
                            for (let i = 0; i < keys.length; i++){
                                let k = keys[i]
                                let skinAvatar = ui.create.div(".skin-avatar", skins);
                                let skinName = ui.create.div('.pfqh-text', skinAvatar)
                                skinName.innerHTML = k
                                let skinCover = ui.create.div('.pfqh-skin-cover', skinAvatar)
                                let skinImgDiv = ui.create.div('.pfqh-skin', skinCover)
                                if (curIndex <= 2) {
                                    if (i > 2) skinAvatar.style.display = 'none'
                                } else {
                                    if (i + 2 < curIndex || i > curIndex) skinAvatar.style.display = 'none'
                                }
                                skinImgDiv.setAttribute('skinName', k)
                                skinImgDiv.addEventListener(addLisName, (e) => {
                                    e.stopPropagation()
                                    skinSwitch.dynamic.selectSkinV2(e.target.getAttribute('skinName'), e.target)
                                })

                                if (selectName === k) {
                                    skinCover.classList.add('pfqh-selected')
                                    // 并且设置选择的是当前皮肤
                                    let selInfo = skinSwitch.dynamic.playerTempSkinInfo[player.pfqhId]
                                    if (isPrimary) {
                                        selInfo.primary = {temp: skinImgDiv, value: k, curIndex: curIndex - 2 <= 0 ? 0 : curIndex - 2}
                                    } else {
                                        selInfo.deputy = {temp: skinImgDiv, value: k, curIndex: i}
                                    }
                                }

                                if (skinSwitch.qhly_hasExtension('千幻聆音')) {
                                    let filename = game.qhly_getSkinFile(characterName, k)
                                    let path = filename + '.jpg'
                                    game.qhly_checkFileExist(path, s => {
                                        if (s) {
                                            skinImgDiv.style.backgroundImage = "url(" + lib.assetURL + path + ")"
                                        }
                                        else {
                                            // 尝试获取png结尾的
                                            let path = filename + '.png'
                                            game.qhly_checkFileExist(path, s => {
                                                if (s) {
                                                    skinImgDiv.style.backgroundImage = "url(" + lib.assetURL + path + ")"
                                                    // 尝试获取png结尾的
                                                } else {
                                                    skinImgDiv.style.backgroundImage = "url(" + skinSwitch.url + "/images/character/小杀.png)"
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    skinImgDiv.style.backgroundImage = "url(" + skinSwitch.url + "/images/character/小杀.png)"
                                }
                            }
                            if (keys.length < 3) {
                                skins.style = 'justify-content: flex-start;'
                                skins.children[0].style = 'margin-right:5%;'
                            } else {
                                skins.style = ''
                            }
                            let left = document.getElementById('dynamicLeftArrow')
                            let right = document.getElementById('dynamicRightArrow')
                            if (Object.keys(skinInfos).length <= 3) {
                                // 隐藏左右按钮
                                left.classList.add('hidden')
                                right.classList.add('hidden')
                            } else {
                                if (curIndex <= 2) {
                                    left.classList.add('hidden')
                                } else {
                                    left.classList.remove('hidden')
                                }
                                if (curIndex + 2 >= Object.keys(skinInfos).length) {
                                    right.classList.add('hidden')
                                } else {
                                    right.classList.remove('hidden')
                                }
                            }
                        }
                    },
                    initSwitchV2: function () {
                        // 初始化当前对局中, 所有拥有动皮角色的动皮
                        for (let i = 0; i < game.players.length; i++) {
                            let p = game.players[i]
                            let dskins = decadeUI.dynamicSkin
                            let primarySkins = dskins[p.name1]
                            let dyInfo = {}
                            if (primarySkins) {
                                dyInfo.primary = primarySkins
                            }
                            let deputySkins = dskins[p.name2]
                            if (deputySkins) {
                                dyInfo.deputy = deputySkins
                            }
                            if (primarySkins || deputySkins) {
                                p.pfqhId = i  // 动态添加一个id, 来标明当前是那个角色
                                dyInfo.player = p  // 保存当前玩家的引用
                                dyInfo.zhuFuFlag = !!primarySkins;
                                this.dynamicSkinInfo[i] = dyInfo

                                this.playerTempSkinInfo[i] = {
                                    primary: {temp: '', value: '', curIndex: 0},
                                    deputy: {temp: '', value: '', curIndex: 0},
                                }
                            }

                        }

                        let addLisName = lib.config.touchscreen ? 'touchend' : 'click'
                        // 初始化动皮框的全体内容
                        if (Object.keys(this.dynamicSkinInfo).length > 0) {
                            let skinDiv = ui.create.div("#skinDiv", ui.window);
                            skinDiv.innerHTML = `
                                <div class="skin-character" id="skinCharacter">
                                    <div class="selectOut">
                                        <select class="selectInner" id="playerSkinSelect">
                                        </select>
                                    </div>
                                    <!-- 切换样式: https://code.juejin.cn/pen/7144159185901453342 -->
                                    <div class='hellokitty' id="zhuFuDiv">
                                        <div class='text active' id='zhuText1'>
                                            主将
                                        </div>
                                        <div class='btn' id='zhuFuBtn'>
                                            <div class='paw'>
                                            </div>
                                            <div class='kitty'>
                                            </div>
                                        </div>
                                        <div class='text' id='fuText2'>
                                            副将
                                        </div>
                                    </div>
                                </div>
                                <div id="skinDiv2">
                                    <div class="skinBox">
                                        <div class="pfqhLeftArrow" id="dynamicLeftArrow"></div>
                                        <div class="skins" id="pfqhSkins">
                                        </div>
                                        <div id="dynamicRightArrow" class="pfqhRightArrow"></div>
                                    </div>
                                </div>
                            `
                            document.getElementById('skinCharacter').addEventListener(addLisName, e => {
                                e.stopPropagation()
                            })
                            document.getElementById('skinDiv2').addEventListener(addLisName, e => {
                                e.stopPropagation()
                            })

                            // 将座次号添加到option中
                            let playerSkinSelect = document.getElementById('playerSkinSelect')
                            let btn = document.getElementById('zhuFuBtn');
                            let text1 = document.getElementById('zhuText1');
                            let text2 = document.getElementById('fuText2');

                            for (let k in this.dynamicSkinInfo) {
                                let option = document.createElement('option')
                                option.setAttribute('value', k)
                                let p = this.dynamicSkinInfo[k].player
                                let pName = lib.translate[p.name1]
                                if (!pName) pName = p.getSeatNum() + 1 + '号位'
                                option.text = pName
                                playerSkinSelect.options.add(option)
                            }

                            let initPlayerAvatarDynamic = skinSwitch.dynamic.initPlayerAvatarDynamic
                            skinDiv.addEventListener(addLisName, function () {
                                skinSwitch.dynamic.skinDivShowOrHide()
                            })

                            let changeDynamicSkinsByIdx = (idx) => {
                                // 获取所选角色的有动皮的部分, 然后进行初始化
                                if (this.dynamicSkinInfo[idx].primary) {
                                    initPlayerAvatarDynamic(this.dynamicSkinInfo[idx].player, true)
                                    setZhuFuBtnStyle(true)
                                } else if (this.dynamicSkinInfo[idx].deputy) {
                                    initPlayerAvatarDynamic(this.dynamicSkinInfo[idx].player, false)
                                    setZhuFuBtnStyle(false)
                                }
                            }

                            let setZhuFuBtnStyle = (isPrimary) => {
                                if (!isPrimary) {
                                    btn.classList.remove('left');
                                    btn.classList.add('right');
                                    text1.classList.remove('active');
                                    text2.classList.add('active');
                                } else {
                                    btn.classList.add('left');
                                    btn.classList.remove('right');
                                    text1.classList.add('active');
                                    text2.classList.remove('active');
                                }
                            }

                            playerSkinSelect.onchange = (e) => {
                                let idx = playerSkinSelect.options[playerSkinSelect.selectedIndex].value
                                this.playerTempSkinInfo.currentWatchId = idx
                                changeDynamicSkinsByIdx(idx)
                            }


                            btn.addEventListener(addLisName, e => {
                                let curSelect = this.dynamicSkinInfo[this.playerTempSkinInfo.currentWatchId]
                                curSelect.zhuFuFlag = !curSelect.zhuFuFlag;
                                if (!curSelect.zhuFuFlag) {
                                    btn.classList.remove('left');
                                    btn.classList.add('right');
                                    text1.classList.remove('active');
                                    text2.classList.add('active');
                                    initPlayerAvatarDynamic(curSelect.player, curSelect.zhuFuFlag)
                                } else {
                                    btn.classList.add('left');
                                    btn.classList.remove('right');
                                    text1.classList.add('active');
                                    text2.classList.remove('active');
                                    initPlayerAvatarDynamic(curSelect.player, curSelect.zhuFuFlag)
                                }
                            });

                            document.getElementById('dynamicRightArrow').addEventListener(addLisName, (e) => {
                                let skins = document.getElementById('pfqhSkins').children
                                // 获取当前是主将还是副将
                                let flag = this.dynamicSkinInfo[this.playerTempSkinInfo.currentWatchId].zhuFuFlag
                                let watchId = this.playerTempSkinInfo.currentWatchId
                                let avatar = flag ? this.playerTempSkinInfo[watchId].primary : this.playerTempSkinInfo[watchId].deputy
                                let curIdx = avatar.curIndex
                                if (skins.length <= curIdx + 3) return
                                skins[curIdx].style.display = 'none'
                                skins[curIdx + 3].style.display = 'block'
                                avatar.curIndex++
                                if (skins.length <= avatar.curIndex + 3) e.target.classList.add('hidden')
                                document.getElementById('dynamicLeftArrow').classList.remove('hidden')
                            })

                            document.getElementById('dynamicLeftArrow').addEventListener(addLisName, (e) => {
                                let skins = document.getElementById('pfqhSkins').children
                                let flag = this.dynamicSkinInfo[this.playerTempSkinInfo.currentWatchId].zhuFuFlag
                                let watchId = this.playerTempSkinInfo.currentWatchId
                                let avatar = flag ? this.playerTempSkinInfo[watchId].primary : this.playerTempSkinInfo[watchId].deputy
                                let curIdx = avatar.curIndex
                                if (curIdx === 0) return
                                skins[curIdx + 2].style.display = 'none'
                                skins[curIdx - 1].style.display = 'block'
                                avatar.curIndex--
                                if (avatar.curIndex === 0) e.target.classList.add('hidden')
                                document.getElementById('dynamicRightArrow').classList.remove('hidden')
                            })

                            skinSwitch.dynamic.skinDiv = skinDiv;
                            // 初始化第一个
                            for (let k in this.dynamicSkinInfo) {
                                this.playerTempSkinInfo.currentWatchId = k
                                changeDynamicSkinsByIdx(k)
                                // 如果不是双将模式, 隐藏按钮
                                if (this.dynamicSkinInfo[k].player.name2 == null) {
                                    document.getElementById('zhuFuDiv').style.display = 'none'
                                } else {
                                    document.getElementById('zhuFuDiv').style.display = 'flex'
                                }
                                break
                            }
                        }
                    },
                    selectSkinV2: function (skinName, target) {
                        if (!skinName) return
                        game.playAudio("..", "extension", "皮肤切换/audio/game", "Notice02.mp3")
                        let curWatchId = this.playerTempSkinInfo.currentWatchId
                        let curSkins = this.dynamicSkinInfo[curWatchId]
                        let tempSkinInfo = this.playerTempSkinInfo[curWatchId]
                        let isPrimary = curSkins.zhuFuFlag
                        let avatarSkins = isPrimary ? curSkins.primary : curSkins.deputy
                        let avatarInfo = isPrimary ? tempSkinInfo.primary : tempSkinInfo.deputy
                        if (avatarSkins && avatarInfo && avatarInfo.value !== skinName) {
                            if (avatarInfo.temp instanceof HTMLElement) {
                                avatarInfo.temp.parentNode.classList.remove('pfqh-selected')
                            }
                            target.parentNode.classList.add('pfqh-selected')
                            avatarInfo.value = skinName
                            avatarInfo.temp = target
                            let player = curSkins.player
                            if (!player.isAlive()) return
                            let avatarName = isPrimary ? player.name1 : player.name2

                            let skin = avatarSkins[skinName]
                            if (!skin) return
                            player.stopDynamic(isPrimary, !isPrimary)

                            skin.player = skin;
                            dcdAnim.playSpine(skinSwitch.huanfu, { scale: 0.5, parent: player });
                            skin.deputy = !isPrimary

                            if (skin.localePath) {
                                if (!skin.name.startsWith(skin.localePath + '/')) {
                                    skin.name = skin.localePath + '/' + skin.name
                                    skin.background = skin.localePath + '/' + skin.background
                                }
                            }
                            // 重新初始化
                            // if (!skinSwitch.chukuangWorker) {
                            //     skinSwitch.chukuangPlayerInit(player, isPrimary, skin)
                            // }
                            player.playDynamic(skin, !isPrimary);
                            if (skin.background) {
                                player.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                            } else {
                                player.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/皮肤切换/images/card/card.png")'
                            }
                            player.classList.add(!isPrimary ? 'd-skin2' : 'd-skin');
                            // 设置当前皮肤的背景和语音, 调用千幻聆音
                            if (skinSwitch.qhly_hasExtension('千幻聆音')) {
                                skinSwitch.dynamic.qhly_callback.setDynamic = true
                                game.qhly_setCurrentSkin(avatarName, skinName + '.jpg', function () {
                                    // 执行完恢复
                                    skinSwitch.dynamic.qhly_callback.setDynamic = false
                                })
                            }


                            if (!lib.config[skinSwitch.configKey.dynamicSkin]) lib.config[skinSwitch.configKey.dynamicSkin] = {};
                            if (lib.config[skinSwitch.configKey.dynamicSkin]) {
                                let cg = lib.config[skinSwitch.configKey.dynamicSkin];
                                cg[avatarName] = skinName;
                                game.saveConfig(skinSwitch.configKey.dynamicSkin, cg);
                            }
                            // skinSwitch.dynamic.skinDivShowOrHide();
                            skinSwitch.dynamic.startPlay2Random(player)

                            // 皮肤变化了, 修改编辑的全局变量
                            if (isPrimary && window.dynamicEditBox && player === game.me) {
                                dynamicEditBox.updateGlobalParams()
                            }

                            // setTimeout(() => {
                            //     skinSwitch.dynamic.selectSkin.cd = true;
                            // }, 1000);

                        }

                    },
                    selectSkin: function (e) {
                        game.playAudio("..", "extension", "皮肤切换/audio/game", "Notice02.mp3");
                        let temp = skinSwitch.selectSkinData.temp;
                        if (temp === "") {
                            skinSwitch.selectSkinData.temp = e;
                            skinSwitch.selectSkinData.value = e.alt
                            return
                        }
                        if (temp !== e) {
                            if (skinSwitch.dynamic.selectSkin.cd) {
                                skinSwitch.dynamic.selectSkin.cd = false;
                                let player = game.me;
                                temp.style.backgroundImage = "url(" + skinSwitch.url + "/images/base/skin_not_bg.png)";
                                skinSwitch.selectSkinData.value = e.alt;
                                e.style.backgroundImage = "url(" + skinSwitch.url + "/images/base/skin_bg.png)";
                                skinSwitch.selectSkinData.temp = e;
                                var skin = dui.dynamicSkin[player.name][e.alt];
                                // if (skin.action) delete skin.action;
                                player.stopDynamic();
                                skinSwitch.huanfu.parent = player;
                                skin.player = skin;
                                dcdAnim.playSpine(skinSwitch.huanfu, skinSwitch.huanfu);
                                if (skin.deputy) skin.deputy = false;

                                if (skin.localePath) {
                                    if (!skin.name.startsWith(skin.localePath + '/')) {
                                        skin.name = skin.localePath + '/' + skin.name
                                        skin.background = skin.localePath + '/' + skin.background
                                    }
                                }
                                // 重新初始化

                                player.playDynamic(skin, false);
                                if (skin.background) {
                                    player.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                                } else {
                                    player.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/皮肤切换/images/card/card.png")'
                                }
                                if (lib.config[skinSwitch.configKey.dynamicSkin]) {
                                    var cg = lib.config[skinSwitch.configKey.dynamicSkin];
                                    cg[player.name] = e.alt;
                                    game.saveConfig(skinSwitch.configKey.dynamicSkin, cg);
                                }
                                skinSwitch.dynamic.skinDivShowOrHide();

                                // 皮肤变化了, 修改编辑的全局变量
                                if (window.dynamicEditBox) {
                                    dynamicEditBox.updateGlobalParams()
                                }

                                setTimeout(() => {
                                    skinSwitch.dynamic.selectSkin.cd = true;
                                }, 1000);
                            } else {
                                skinSwitchMessage.show({
                                    type: 'warning',
                                    text: '更换动皮频繁.',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                                // alert("更换动皮频繁.");
                            }
                        }
                    },
                    skinDivShowOrHide: function (show) {
                        if (show) {
                            skinSwitch.dynamic.skinDiv.style.display = "block";
                            setTimeout(() => {
                                skinSwitch.dynamic.skinDiv.style.opacity = "1";
                            },200);
                        } else {
                            skinSwitch.dynamic.skinDiv.style.opacity = "0";
                            setTimeout(() => {
                                skinSwitch.dynamic.skinDiv.style.display = "none";
                            },400);
                        }
                    },
                    judgingRealName: function (name) {
                        let shen = name.indexOf("shen_");
                        let boss = name.indexOf("boss_");
                        let special = shen > -1 ? shen : boss > -1 ? boss : -1;
                        if (special > -1) {
                            return name.substr(special,name.length);
                        } else {
                            var index = name.lastIndexOf("_");
                            return name.substr(index + 1,name.length);
                        }
                    },
                    /**
                     * 判断当前player是否触发攻击特效, 使用动皮攻击会自动触发攻击特效, 比如如果是暗将, 就不触发攻击特效
                     * @param player: player对象
                     * @returns {Object|false}
                     * { deputy: boolean,  // 是否是副将
                     *   needHide: Number, // 需要隐藏的副将的skinId 当两个皮肤都是动皮的时候,需要隐藏一个动皮的出框动画
                     *   isDouble: boolean  // 是否是双将
                     *   dynamic: 需要播放的动皮参数
                     * }
                     *
                     */
                    checkCanBeAction: function (player) {
                        let isPrimary = player.dynamic.primary;
                        let res = {
                            isDouble : false,
                            deputy: false,
                            needHide: undefined
                        }
                        if (player.doubleAvatar) {
                            res.isDouble = true;
                            let isDeputy = player.dynamic.deputy;
                            let unseen = player.isUnseen(0);
                            let unseen2 = player.isUnseen(1);
                            // 默认会只播放动皮的攻击动画.
                            if (isPrimary && !unseen) {
                                res.dynamic = isPrimary;
                            } else if (isDeputy && !unseen2) {
                                res.dynamic = isDeputy;
                                res.deputy = true;
                            } else {
                                return false;
                            }
                            // 两个都是动皮, 并且都不是隐藏状态, 那么2号可能需要隐藏
                            if (isPrimary && isDeputy) {
                                if (!unseen && !unseen2) {
                                    res.needHide = isDeputy.id;
                                }
                            }
                        } else {
                            res.dynamic = isPrimary;
                        }
                        return res;
                    },
                    getSkinName: function (roleName, skinPath) {
                        let dskins = decadeUI.dynamicSkin[roleName]
                        for (let k in dskins) {
                            if (dskins[k].name === skinPath) {
                                return k
                            }
                        }
                    },
                    setBackground : function (avatar,player) {
                        // 设置背景, 配合千幻使用, 会自动设置, 西瓜大佬的限定技需要读取这个角色的默认背景放到图框里面, 配合兼容
                        let skin = player.dynamic[avatar];
                        let obj = player.getElementsByClassName(avatar + "-avatar")[0];
                        // 如果已经设置了, 就不再进行设置
                        if (obj.style.backgroundImage == null) {
                            // 获取千幻聆音
                            if (skin.qhly_hasExtension('千幻聆音')) {
                                let roleName = avatar === 'primary' ? player.name1 : player.name2
                                let skinName = this.getSkinName(roleName, skin.name)
                                let path = game.qhly_getSkinFile(roleName, skinName);
                                if (!path.endsWith('jpg')) {
                                    path = path + '.jpg'
                                }
                                obj.style.backgroundImage = `url("${path}")`;
                            } else {
                                obj.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                            }
                        }

                        // 设置动态皮肤背景
                        if (player.$dynamicWrap && skin.player && skin.player.background) {
                            player.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.player.background + '")';
                        }

                    },

                    // 随机播放十周年动皮的play2动画
                    startPlay2Random: function (player) {
                        // 检查当前角色的动皮
                        let checkCanPlay2 = (isPrimary) => {
                            if (!player.dynamic) return false
                            let avatar = isPrimary ? player.dynamic.primary : player.dynamic.deputy
                            if (avatar) {
                                let sprite = avatar.player
                                return sprite.shizhounian;
                            }
                            return false
                        }
                        let getPlay2Action = (sprite) => {
                            // 定时播放的就不读取特殊的标签了, 如果要重新指定标签, 单独指定
                            // if (typeof sprite.teshu === 'string') {
                            //     action = sprite.teshu
                            // } else if (typeof sprite.teshu === 'object') {
                            //     if (sprite.name === sprite.teshu.name) {
                            //         action = sprite.teshu.action || 'play2'
                            //     }
                            // }
                            return sprite.play2 || 'play2'
                        }
                        let firstLast
                        if (!player.playPrimaryTimer) {
                            if (checkCanPlay2(true)) {
                                let sprite = player.dynamic.primary.player
                                let action = getPlay2Action(sprite)
                                let randomInterval = function (timer) {
                                    clearTimeout(player.playPrimaryTimer)
                                    if (!checkCanPlay2(true)) {
                                        return
                                    }
                                    // 只有非攻击状态才播放play2
                                    if ((!player.lastPlayTime || (new Date().getTime() - player.lastPlayTime) > 10000) && !player.GongJi) {
                                        skinSwitch.postMsgApi.playAvatar(player, true, action)
                                    }
                                    if (firstLast) {
                                        // console.log('play2 time', (new Date().getTime() - firstLast) / 1000)
                                    }
                                    firstLast = new Date().getTime()
                                    player.playPrimaryTimer = setTimeout(() => {
                                        randomInterval()
                                    }, Math.floor(Math.random() * 6000) + 10000)

                                }
                                // 10s后开启自动播放play2模式
                                setTimeout(randomInterval, 10 * 1000)
                            }
                        }
                        let last
                        if (!player.playDeputyTimer) {
                            if (checkCanPlay2(false)) {
                                let sprite = player.dynamic.deputy.player
                                let action = getPlay2Action(sprite)
                                let randomInterval = function () {
                                    clearTimeout(player.playDeputyTimer)
                                    if (!checkCanPlay2(false)) {
                                        return
                                    }
                                    if ((!player.lastPlayTime || (new Date().getTime() - player.lastPlayTime) > 8000) && !player.GongJi) {
                                        skinSwitch.postMsgApi.playAvatar(player, false, action)
                                    }
                                    if (last) {
                                        // console.log('play2 time', (new Date().getTime() - last) / 1000)
                                    }
                                    last = new Date().getTime()

                                    player.playDeputyTimer = setTimeout(() => {
                                        randomInterval()
                                    }, Math.floor(Math.random() * 6000) + 8000)
                                }
                                // 10s后开启自动播放play2模式
                                setTimeout(randomInterval, 10 * 1000)
                            }
                        }
                    },
                    qhly_callback: {
                        setDynamic: false,  // 防止调用千幻聆音触发回调重新设置回静皮
                        onChangeSkin: (name, skin) => {
                            if (skinSwitch.dynamic.qhly_callback.setDynamic) return
                            let bool1, bool2
                            let playerP = game.findPlayer(function (current) {
                                if (current.name1 === name) {
                                    bool1 = true
                                    bool2 = false
                                    return true
                                } else if (current.name2 === name) {
                                    bool1 = false
                                    bool2 = true
                                    return true
                                }
                            })


                            if (playerP && playerP.dynamic) {
                                playerP.stopDynamic(bool1, bool2)
                                let obj = playerP.getElementsByClassName((bool1 ? 'primary' : 'deputy') + "-avatar")[0]
                                if (obj) {
                                    obj.style.opacity = 1
                                }

                            }
                            // 选择静皮还原
                            skinSwitch.selectSkinData = {
                                temp: "",
                                value: "",
                            }
                            let dynamicSkinKey = skinSwitch.configKey.dynamicSkin
                            if (!lib.config[dynamicSkinKey]) lib.config[dynamicSkinKey] = {}
                            lib.config[dynamicSkinKey][name] = 'none'
                            game.saveConfig(dynamicSkinKey, lib.config[dynamicSkinKey]);
                            // 去除静皮的class
                            playerP.classList.remove(!bool1 ? 'd-skin2' : 'd-skin');
                            for (let k in skinSwitch.dynamic.dynamicSkinInfo) {
                                if (skinSwitch.dynamic.dynamicSkinInfo[k].player === playerP) {
                                    let avatar = bool1 ? skinSwitch.dynamic.playerTempSkinInfo[k].primary: skinSwitch.dynamic.playerTempSkinInfo[k].deputy
                                    avatar.temp = ''
                                    avatar.value = ''
                                    avatar.curIndex = 0
                                    // 清空选择
                                    skinSwitch.dynamic.initPlayerAvatarDynamic(playerP, bool1)
                                }
                            }
                        }
                    }
                },

                // 统一管理向worker发送消息后, 防止worker回复的消息被覆盖而出的异常
                rendererOnMessage: {
                    dynamicEvents: {},  // 内部动皮事件管理器
                    onmessage: function (e) {
                        let _this = skinSwitch.rendererOnMessage
                        let data = e.data

                        if (typeof data !== "object") return
                        if (data) {
                            // 读取data.id, 来确定是那个角色发出的消息的返回
                            let id = data.id
                            let type = data.type
                            if (id in _this.dynamicEvents && type in _this.dynamicEvents[id]) {
                                // 调用之前注册的方法
                                _this.dynamicEvents[id][type](data)
                            }

                        }
                    },
                    /**
                     * 添加worker对应消息类型的回调, 当worker发出对应的消息, 当前线程(主线程)调用对应的回调函数
                     * @param player 当前角色
                     * @param type  处理worker传回发回的消息类型
                     * @param callback  回调
                     * @param bind  调用回调函数时绑定this的对象, 默认为player
                     */
                    addListener: function (player, type, callback, bind) {
                        let id = player.dynamic.id
                        let renderer = player.dynamic.renderer
                        if (renderer.onmessage !== this.onmessage) {
                            renderer.onmessage = this.onmessage
                        }
                        if (!(id in this.dynamicEvents)) {
                            this.dynamicEvents[id] = {}
                        }
                        // 直接覆盖之前的消息, 并且绑定回调函数的this为player
                        this.dynamicEvents[id][type] = callback.bind(bind || player)
                        // if (!(type in this.dynamicEvents[id])) {
                        //     this.dynamicEvents[id][type] = callback.bind(player)
                        // }
                    }
                },
                // 向worker通信发送的消息api, 统一管理
                postMsgApi: {
                    _onchangeDynamicWindow: function(player, res) {
                        let canvas = player.getElementsByClassName("animation-player")[0];
                        let dynamicWrap
                        if (player.isQhlx) {
                            dynamicWrap = player.getElementsByClassName("qhdynamic-big-wrap")[0];
                        } else {
                            // if (lib.config['extension_十周年UI_newDecadeStyle'] === "on") {
                            //     dynamicWrap = player.getElementsByClassName("dynamicPlayerCanvas")[0]
                            //
                            // } else {
                                dynamicWrap = player.getElementsByClassName("dynamic-wrap")[0];
                            // }
                        }
                        skinSwitch.rendererOnMessage.addListener(player, 'chukuangFirst', function (data) {
                            // 直接设置属性, 第一优先生效, 这里播放攻击动画, 调整播放canvas的位置, 不再跟随皮肤框,也就是动皮出框
                            dynamicWrap.style.zIndex = 100;
                            canvas.style.position = "fixed";
                            canvas.style.height = "100%";
                            canvas.style.width = "100%";
                            if (!player.isQhlx) {
                                player.style.zIndex = 10;
                            } else {
                                player.style.zIndex = 64  // 防止遮住血量
                            }
                            // canvas.style.opacity = 0
                            // 防止闪烁,
                            canvas.classList.add('pfqhFadeInEffect')
                            // setTimeout(() => {
                            //     canvas.classList.remove('hidden')
                            // }, 250)
                        })

                        skinSwitch.rendererOnMessage.addListener(player, 'canvasRecover', function (data) {
                            if (lib.config['extension_十周年UI_newDecadeStyle'] === "on") {
                                dynamicWrap.style.zIndex = "62";
                            } else {
                                dynamicWrap.style.zIndex = "60";
                            }
                            canvas.style.height = null;
                            canvas.style.width = null;
                            canvas.style.position = null;
                            if (player.isQhlx) {
                                dynamicWrap.style.zIndex = 62
                                player.style.zIndex = 62
                            }
                            else player.style.zIndex = 4;
                            player.GongJi = false;
                        })

                        skinSwitch.rendererOnMessage.addListener(player, 'chukuangSecond', function (data) {
                            // 这里表示动画已经准备好了, 可以显示
                            setTimeout(()=>{
                                canvas.classList.remove('pfqhFadeIn')
                            }, 50)

                            let playName
                            if (res.dynamic.gongji && res.dynamic.gongji.name) {
                                playName = res.dynamic.gongji.name
                            } else {
                                playName = res.dynamic.name
                            }
                            if (res.dynamic.localePath && playName.startsWith(res.dynamic.localePath)) {
                                playName = playName.substr(res.dynamic.localePath.length + 1, playName.length)
                            }
                            game.playAudio("..", "extension", "皮肤切换/audio/effect", playName + ".mp3");
                        })
                    },

                    /**
                     * 单独播放某个角色的动画
                     * @param player  当前角色
                     * @param isPrimary  是否是主将的
                     * @param action  动画标签
                     */
                    playAvatar: function (player, isPrimary, action) {
                        if (!player.dynamic) return
                        let avatar = isPrimary ? player.dynamic.primary : player.dynamic.deputy
                        if (!avatar) return
                        player.dynamic.renderer.postMessage({
                            message: 'ACTION',
                            id: player.dynamic.id,
                            action: action,
                            skinID: avatar.id,
                        })
                    },
                    /**
                     * 请求worker播放对应的动画
                     * @param player  当前player对象, 自己就是game.me
                     * @param action  播放对应的动画action名称, TeShu/GongJi
                     * @param playAvatar  可以指定播放哪个角色
                     * @constructor
                     */
                    action: function (player, action, playAvatar) {
                        let res = skinSwitch.dynamic.checkCanBeAction(player)
                        if (res.dynamic && playAvatar && playAvatar !== res.dynamic) {
                            res.skinID = playAvatar.id
                            res.needHide = res.dynamic.id
                            res.deputy = !res.deputy
                        }
                        let pp = skinSwitch.getCoordinate(player, true)
                        let me = player === game.me
                        if (res && res.dynamic) {
                            if (!player.dynamic.renderer.postMessage) {
                                skinSwitchMessage.show({
                                    type: 'warning',
                                    text: '当前动皮过多',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                                // 尝试清除千幻对应的特效
                                clearInterval(_status.texiaoTimer);
                                clearTimeout(_status.texiaoTimer2);
                                return
                            }
                            player.dynamic.renderer.postMessage({
                                message: 'ACTION',
                                id: player.dynamic.id,
                                action: action,
                                skinID: res.dynamic.id,
                                isDouble: res.isDouble,
                                deputy: res.deputy,
                                needHide: res.needHide,
                                me: me,
                                direction: me ? false : skinSwitch.getDirection(player),
                                player: pp,
                                selfPhase: _status.currentPhase === player  // 是否是自己的回合
                            })
                        } else {
                            player.GongJi = false
                        }
                        return res
                    },
                    actionTeShu: function(player) {
                        let r = this.action(player, 'TeShu')
                        if (r) {
                            // 记录teshu上次的时间, 防止重复播放特殊动画
                            player.lastPlayTime = new Date().getTime()
                            skinSwitch.rendererOnMessage.addListener(player, 'teshuChuKuang', function (data) {
                                if (data.chukuang) {
                                    this._onchangeDynamicWindow(player, r)
                                }
                            }, this)
                        }
                    },
                    // 播放十周年的出场动画
                    actionChuChang: function(player) {
                        let r = this.action(player, 'chuchang')
                        if (r) {
                            player.GongJi = true
                            this._onchangeDynamicWindow(player, r)
                        }
                    },
                    actionGongJi: function(player, extraParams) {
                        skinSwitch.chukuangWorkerApi.chukuangAction(player, 'GongJi', extraParams)
                        // let r = this.action(player, 'GongJi')
                        // if (r) {
                        //     player.lastPlayTime = new Date().getTime()
                        //     this._onchangeDynamicWindow(player, r)
                        // }
                    },
                    debug: function (player, mode) {
                        if (!(player.dynamic && player.dynamic.primary)) {
                            skinSwitchMessage.show({
                                type: 'error',
                                text: '只有当前角色是动皮时才可以编辑动皮参数',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        if (!player.dynamic.renderer.postMessage) {
                            skinSwitchMessage.show({
                                type: 'warning',
                                text: '当前动皮过多',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        // 当前角色位置
                        let pp = skinSwitch.getCoordinate(player, true)
                        player.dynamic.renderer.postMessage({
                            message: "DEBUG",
                            id: player.dynamic.id,
                            action: "GongJi",
                            skinID: player.dynamic.primary.id,
                            isDouble: false,
                            needHide: false,
                            me: true,
                            direction: false,
                            player: pp,
                            mode: mode,
                        })
                    },
                    position: function (player, mode) {
                        if (!(player.dynamic && player.dynamic.primary)) {
                            skinSwitchMessage.show({
                                type: 'error',
                                text: '只有当前角色是动皮时才可以编辑动皮参数',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        if (!player.dynamic.renderer.postMessage) {
                            return
                        }
                        player.dynamic.renderer.postMessage({
                            message: "POSITION",
                            id: player.dynamic.id,
                            skinID: player.dynamic.primary.id,
                            mode: mode,
                        })
                    },
                    adjust: function (player, mode, posData) {
                        if (!(player.dynamic && player.dynamic.primary)) {
                            skinSwitchMessage.show({
                                type: 'error',
                                text: '只有当前角色是动皮时才可以编辑动皮参数',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        if (!player.dynamic.renderer.postMessage) {
                            skinSwitchMessage.show({
                                type: 'warning',
                                text: '当前动皮过多',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        player.dynamic.renderer.postMessage({
                            message: "ADJUST",
                            id: player.dynamic.id,
                            skinID: player.dynamic.primary.id,
                            mode: mode,
                            xyPos: posData.xyPos,
                            x: posData.x,
                            y: posData.y,
                            scale: posData.scale,
                            angle: posData.angle
                        })
                        if (mode === 'chukuang') {
                            skinSwitch.chukuangWorkerApi.adjust(player, posData)
                        }
                    },
                    show: function (player, skinId) {
                        if (!(player.dynamic && (player.dynamic.primary || player.dynamic.deputy))) {
                            skinSwitchMessage.show({
                                type: 'error',
                                text: '只有当前角色是动皮时才可以编辑动皮参数',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        if (!player.dynamic.renderer.postMessage) {
                            skinSwitchMessage.show({
                                type: 'warning',
                                text: '当前动皮过多',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        player.dynamic.renderer.postMessage({
                            message: 'SHOW',
                            id: player.dynamic.id,
                            skinID: skinId
                        });
                    },
                    startPlay: function (player, data) {
                        if (!player.dynamic) return
                        skinSwitch.rendererOnMessage.addListener(player, 'logMessage', function (data) {
                            console.log('dyWorker', data)
                        })

                        player.dynamic.renderer.postMessage({
                            message: 'StartPlay',
                            data: data,
                        })
                        skinSwitch.rendererOnMessage.addListener(player, 'playSkinEnd', function () {
                            let img = player.$dynamicWrap.style.backgroundImage
                            // 取消原来设置的默认动皮
                            if (img.endsWith('card.png")')) {
                                player.$dynamicWrap.style.backgroundImage = ''
                            }
                        })
                    },
                    changeSkelSkin: function (player) {
                        if (!player.dynamic || !player.dynamic.primary) return

                        player.dynamic.renderer.postMessage({
                            message: 'changeSkelSkin',
                            id: player.dynamic.id,
                            skinId: player.dynamic.primary.id
                        })
                    }
                },
                chukuangWorkerApi: {
                    create: function () {
                        let canvas = document.createElement('canvas')
                        canvas.className = 'chukuang-canvas'
                        canvas.style = `position: fixed; left: 0px; top: 0px; pointer-events:none; width:100%;height:100%;`
                        // canvas.height = decadeUI.get.bodySize().height
                        // canvas.width = decadeUI.get.bodySize().width
                        canvas.height = decadeUI.get.bodySize().height
                        canvas.width = decadeUI.get.bodySize().width
                        let div = ui.create.div('.chukuang-canvas-wraper', document.body)
                        div.appendChild(canvas)
                        div.id = 'chukuang-canvas-wraper'
                        canvas.id = 'chukuang-canvas'
                        // 监听屏幕大小变化, 重新更新canvas大小
                        if (self.ResizeObserver) {
                            let ro = new ResizeObserver(entries => {
                                for (let entry of entries) {
                                    if (skinSwitch.chukuangWorker) {
                                        const cr = entry.contentRect
                                        skinSwitch.chukuangWorker.postMessage({
                                            message: 'UPDATE',
                                            width: cr.width,
                                            height: cr.height,
                                        })
                                    }
                                }
                            });
                            ro.observe(document.body);
                        }


                        let offsetCanvas = canvas.transferControlToOffscreen();

                        // worker与主线程的通信方式, 这里是发起一个创建动态皮肤的请求
                        skinSwitch.chukuangWorker.postMessage({
                            message: 'CREATE',
                            canvas: offsetCanvas,
                            pathPrefix: '../十周年UI/assets/dynamic/',
                            isMobile: skinSwitch.isMobile(),
                            dpr: Math.max(window.devicePixelRatio * (window.documentZoom ? window.documentZoom : 1), 1),
                            isAttackFlipX: lib.config[skinSwitch.configKey.isAttackFlipX]
                        }, [offsetCanvas]);

                    },
                    // 传入动皮参数, 预加载骨骼数据
                    preLoad: function (id, skinId, skinPlayer) {
                        skinSwitch.chukuangWorker.postMessage({
                            message: 'PRELOAD',
                            player: skinPlayer,
                            id: id,
                            skinId: skinId
                        })
                    },
                    action: function (player, action) {
                        let res = skinSwitch.dynamic.checkCanBeAction(player)
                        let pp = skinSwitch.getCoordinate(player, true)
                        let me = player === game.me
                        if (res && res.dynamic) {
                            if (!player.dynamic.renderer.postMessage) {
                                skinSwitchMessage.show({
                                    type: 'warning',
                                    text: '当前动皮过多',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                                // 尝试清除千幻对应的特效
                                clearInterval(_status.texiaoTimer);
                                clearTimeout(_status.texiaoTimer2);
                                return
                            }
                            skinSwitch.chukuangWorkerInit()
                            skinSwitch.chukuangWorker.postMessage({
                                message: 'ACTION',
                                id: player.dynamic.id,
                                action: action,
                                skinId: res.dynamic.id,
                                isDouble: res.isDouble,
                                deputy: res.deputy,
                                needHide: res.needHide,
                                me: me,
                                direction: me ? false : skinSwitch.getDirection(player),
                                player: pp,
                                selfPhase: _status.currentPhase === player  // 是否是自己的回合
                            })
                        } else {
                            player.GongJi = false
                        }
                        return res
                    },
                    chukuangAction: function (player, action, extraParams) {
                        let dynamic = player.dynamic
                        if (!dynamic || (!dynamic.primary && !dynamic.deputy)) {
                            return
                        }
                        skinSwitch.chukuangWorkerInit()

                        // 添加如果当前是国战模式隐藏状态下, 不允许出框
                        skinSwitch.chukuangWorker.postMessage({
                            message: 'isChuKuang',
                            id: dynamic.id,
                            primarySkinId: (!player.isUnseen || !player.isUnseen(0)) && dynamic.primary && dynamic.primary.id,
                            deputySkinId: (!player.isUnseen || !player.isUnseen(1)) && dynamic.deputy && dynamic.deputy.id,
                            action: action,
                            extraParams: extraParams,  // 表示需要更新出框的播放效果
                        })
                    },
                    adjust: function (player, posData) {
                        skinSwitch.chukuangWorkerInit()
                        skinSwitch.chukuangWorker.postMessage({
                            message: "ADJUST",
                            id: player.dynamic.id,
                            skinId: player.dynamic.primary.id,
                            xyPos: posData.xyPos,
                            x: posData.x,
                            y: posData.y,
                            scale: posData.scale,
                            angle: posData.angle
                        })
                    },
                    // 播放特效
                    playEffect: function (sprite, position) {
                        skinSwitch.chukuangWorkerInit()
                        if (position && position.parent) {
                            position.parent = {
                                boundRect: position.parent.getBoundingClientRect(),
                                bodySize: {
                                    bodyWidth: decadeUI.get.bodySize().width,
                                    bodyHeight: decadeUI.get.bodySize().height
                                }
                            }
                        }
                        skinSwitch.chukuangWorker.postMessage({
                            message: "PLAY_EFFECT",
                            sprite,
                            position: position,
                        })
                    }
                },
                chukuangWorkerOnMessage: {
                    init: function () {
                        skinSwitch.chukuangWorker.onmessage = e => {
                            let data = e.data
                            switch (data.message) {
                                case "chukuangPrepare":
                                    this.chukuangStart(data)
                                    break
                                case "recoverDaiJi":
                                    this.recoverDaiJi(data)
                                    break
                                case 'noActionChuKuang':
                                    this.noActionChuKuang(data)
                                    break
                            }
                        }
                    },
                    getPlayerById: function(id, isQhlx) {
                        if (isQhlx) {
                            return document.getElementById('mainView')
                        }
                        for (let p of game.players) {
                            if (p.dynamic && p.dynamic.id === id) {
                                return p
                            }
                        }
                        // 再查找一下千幻雷修的大屏预览是否包含
                        return null
                    },
                    chukuangStart: function (data) {
                        // 如果当前不是自己回合, 特殊动作, 不出框
                        // 根据返回的data, 查出当前属于哪个player
                        let player = this.getPlayerById(data.id, data.qhlxBigAvatar)
                        if (!player || !player.dynamic) return
                        let dynamic = player.dynamic
                        let avatar = data.isPrimary ? dynamic.primary : dynamic.deputy
                        if (!avatar) {
                            return
                        }
                        if (_status.currentPhase !== player && data.action === 'TeShu' && !avatar.player.shizhounian) {
                            return
                        }

                        player.dynamic.renderer.postMessage({
                            message: 'hideAllNode',
                            id: dynamic.id,
                            isPrimary: data.isPrimary,
                            skinId: data.skinId
                        })
                        skinSwitch.rendererOnMessage.addListener(player, 'hideAllNodeEnd', function (){
                            let pp = skinSwitch.getCoordinate(player, true)
                            let me = player === game.me
                            skinSwitch.chukuangWorker.postMessage({
                                id: data.id,
                                skinId: data.skinId,
                                message: 'chukuangStart',
                                action: data.action,
                                me: me,
                                direction: me ? false : skinSwitch.getDirection(player),
                                player: pp,
                            })
                            // 标记为出框状态
                            player.chukuangState = {
                                status: true,
                                action: data.action
                            }

                            if (data.action === 'GongJi' || data.action === 'TeShu') {
                                // 音效默认寻找与待机动作同名的音效
                                let playName = avatar.player.name
                                // 暂时不区分不同出框攻击的音效.
                                // 开始播放音效, 音效名等同
                                // 优先播放十周年同名文件夹下同名的音效文件
                                let path = 'extension/十周年UI/assets/dynamic/' + playName + '.mp3'
                                skinSwitch.qhly_checkFileExist(path, exists => {
                                    if (exists) {
                                        game.playAudio("..", path)
                                    } else {
                                        game.playAudio("..", "extension", "皮肤切换/audio/effect", playName + ".mp3")
                                    }
                                })
                            }

                        })

                    },
                    recoverDaiJi: function (data) {
                        let player = this.getPlayerById(data.id, data.qhlxBigAvatar)
                        if (!player || !player.dynamic) return
                        let dynamic = player.dynamic
                        player.chukuangState = {
                            status: false,
                        }
                        if (!dynamic.primary && !dynamic.deputy) {
                            return
                        }
                        player.dynamic.renderer.postMessage({
                            message: 'recoverDaiJi',
                            id: data.id,
                            skinId: data.skinId,
                        })
                        player.GongJi = false
                    },
                    // 当没有出框的做法
                    noActionChuKuang: function (data) {
                        // 请求动皮worker查看是否有未出框的动作
                        let player = this.getPlayerById(data.id, data.qhlxBigAvatar)
                        if (!player || !player.dynamic) return
                        let dynamic = player.dynamic
                        if (!dynamic.primary && !dynamic.deputy) {
                            return
                        }
                        if (data.action === 'GongJi') {
                            // 如果参数直接指明包含不出框的话, 那么直接请求待机worker
                            if (dynamic.primary) {
                                let playerP = dynamic.primary.player;
                                if (playerP.gongji && playerP.gongji.ck === false) {
                                    return skinSwitch.postMsgApi.action(player, playerP.gongji.action, dynamic.primary)
                                }
                            }
                            if (dynamic.deputy) {
                                let playerP = dynamic.deputy.player
                                if (playerP.gongji && playerP.gongji.ck === false) {
                                    return skinSwitch.postMsgApi.action(player, playerP.gongji.action, dynamic.deputy)
                                }
                            }
                        }
                        if (data.action === 'TeShu') {
                            skinSwitch.postMsgApi.actionTeShu(player)
                        }
                    },
                    debugChuKuang: function (data) {
                        let player = this.getPlayerById(data.id, data.qhlxBigAvatar)
                        if (!player || !player.dynamic) return
                        let dynamic = player.dynamic
                        let avatar = data.isPrimary ? dynamic.primary : dynamic.deputy
                        if (!avatar) {
                            return
                        }
                        player.dynamic.renderer.postMessage({
                            message: 'hideAllNode',
                            id: dynamic.id,
                        })
                        // 将原来的置空
                        skinSwitch.rendererOnMessage.addListener(player, 'hideAllNodeEnd', function (){})
                    }

                },
                chukuangWorker: null,  // 管理出框的worker
                chukuangWorkerInit: function () {
                    if (!skinSwitch.chukuangWorker) {
                        skinSwitch.chukuangWorker = new Worker(skinSwitch.url +'chukuangWorker.js')
                        skinSwitch.chukuangWorkerApi.create()
                        skinSwitch.chukuangWorkerOnMessage.init()
                    }
                },
                chukuangPlayerInit: function(player, isPrimary, playParams) {
                    if (!player.dynamic) return

                    // 动皮播放开始播放骨骼.  虽然放在这里不是很合适. 为了减少其他扩展添加的扩展. todo, 后面更换
                    skinSwitch.rendererOnMessage.addListener(player, 'loadFinish', function (data) {
                        skinSwitch.postMsgApi.startPlay(player, data)
                    })

                    // 检查只有当前是player或者是千幻大屏预览才会进行初始化
                    if (!(get.itemtype(player) === 'player' || player.classList.contains('qh-shousha-big-avatar'))) {
                        return
                    }
                    skinSwitch.chukuangWorkerInit()
                    if (!isPrimary && player.dynamic.deputy) {
                        console.log('初始化preload deputy...')
                        skinSwitch.chukuangWorkerApi.preLoad(player.dynamic.id, player.dynamic.deputy.id, playParams)
                    }
                    else if (isPrimary && player.dynamic.primary) {
                        console.log('初始化preload primary...')
                        skinSwitch.chukuangWorkerApi.preLoad(player.dynamic.id, player.dynamic.primary.id, playParams)
                    }
                },
                // 这个就是官方spine的demo拿来简单修改修改, 做一个简单的preview预览页面
                previewDynamic: function () {

                    let background = ui.create.div('.pfqh-preview-background', ui.window);

                    let previewWindow = ui.create.div('.previewWindow', background)
                    previewWindow.id = 'previewWindowDiv'
                    previewWindow.style = `background: rgb(60,60,60);z-index: 3000;position: fixed; width: 100%; height: 100%;`
                    previewWindow.innerHTML = `
                    <style>
                        #preview-canvas { position: absolute; width: 100% ;height: 100%; }
                        #previewSpineDom span {display: inline-block; margin-left: 20px}
                        input[type='range'] {
                        -webkit-appearance: none;
                        width: 180px;
                        border-radius: 10px; /*这个属性设置使填充进度条时的图形为圆角*/
                      }
                      input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                      }
                      input[type='range']::-webkit-slider-runnable-track {
                        height: 8px;
                        border-radius: 10px; /*将轨道设为圆角的*/
                        background-color: #d6a63c;
                      }
                      input[type='range']:focus {
                        outline: none;
                      }
                
                      input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: 24px;
                        width: 24px;
                        margin-top: -8px; /*使滑块超出轨道部分的偏移量相等*/
                        background: #ffffff;
                        border-radius: 50%;
                        cursor: pointer;
                      }
                
                      input[type='range']:focus::-webkit-slider-thumb {
                        background: #d6a63c;
                        /* background-image: url('https://p3-passport.byteacctimg.com/img/user-avatar/fc8114566fc29a28d2d49e1964872775~300x300.image'),
                          -webkit-gradient(linear, left top, left bottom, color-stop(0, #fefefe), color-stop(0.49, #dddddd), color-stop(0.51, #d1d1d1), color-stop(1, #a1a1a1));
                        background-size: 20px;
                        background-repeat: no-repeat;
                        background-position: 50%; */
                        box-shadow: 0 0 0 3px #fff, 0 0 0 6px #d6a63c;
                      }
                
                      input[type='range']::-webkit-slider-thumb:hover {
                        background: #d6a63c;
                      }
                      input[type='range']:active::-webkit-slider-thumb {
                        background: #d6a63c;
                      }
                      
                       #previewSpineDom select{
                        margin-bottom: 8px;
                      }
                      
                      #previewSpineDom select{
                        height: 26px;
                      }
                      
                      .closeBtn {
                        border-radius: 3px;
                        color: white;
                        margin: 0;
                        line-height: 1;
                        padding: 0 14px;
                        height: 34px;
                        border: none;
                        display: inline-flex;
                        flex-wrap: nowrap;
                        flex-shrink: 0;
                        align-items: center;
                        justify-content: center;
                        user-select: none;
                        text-align: center;
                        cursor: pointer;
                        text-decoration: none;
                        white-space: nowrap;
                        background-color: #18a058;  
                      }
                    
                    .wp-s-core-pan__body-detail, .wp-s-core-pan__body-detail div {
                        position: relative;
                        width: 100%;
                        
                    }
                    
                    /* 弹出的框的大小*/
                    .wp-s-core-pan__body-detail {
                        /*width: 296px;*/
                        /*height: 400px;*/
                        /*border-left: 1px solid #f0f0f0;*/
                    }
                    .wp-s-core-pan__detail-slot {
                        width: 100%;
                        height: 100%;
                    }
            
                    /*.nd-detail{*/
                    /*    display: inline-block;*/
                    /*    position: relative;*/
                    /*    padding: 24px;*/
                    /*    font-size: 12px;*/
                    /*    overflow: auto;*/
                    /*}*/
                    .nd-new-main-list__detail {
                        height: 100%;
                        width: 100%;
                        padding-top: 0!important;
                        padding-right: 0!important;
                    }
                    .nd-new-main-list__detail {
                        min-height: 356px;
                    }
            
                    .nd-new-main-list__detail .nd-detail-filelist__title, .nd-new-main-list__detail .nd-detail__title {
                        height: 40px;
                        line-height: 40px;
                        padding-bottom: 0;
                    }
                    .nd-detail-filelist__title {
                        /*margin-bottom: #f1f2f4;*/
                        padding-bottom: 15px;
                        font-weight: 600;
                        /*color: #03081a;*/
                        display: -webkit-box;
                        display: -ms-flexbox;
                        display: flex;
                        -webkit-box-pack: justify;
                        -ms-flex-pack: justify;
                        justify-content: space-between;
                        -webkit-box-align: center;
                        -ms-flex-align: center;
                        align-items: center;
                    }
            
                    .nd-detail-filelist__name{
                        padding: 12px 0;
                        border-bottom: 1px solid #f1f2f4;
                        font-size: 14px;
                        /*color: #454d5a;*/
                        font-weight: 600;
                        word-break: break-all;
                    }
                    
                    .nd-detail-filename:hover {
                        background-color: #847a93;
                        cursor: pointer;
                    }
                    
                    .previewSelect {
                        background-color: #847a93;
                    }
            
                    .nd-detail-filelist__put-away-btn {
                        color: #818999;
                        cursor: pointer;
                        font-weight: 400;
                    }
            
                    .nd-detail-filelist__put-away-btn .u-uicon{
                        margin-right: 4px;
                        position: relative;
                        top: -1px;
                    }
            
                    [class*=" u-icon-"], [class^=u-icon-] {
                        font-family: union-design-icons!important;
                        speak: none;
                        font-style: normal;
                        font-weight: 400;
                        font-variant: normal;
                        text-transform: none;
                        line-height: 1;
                        vertical-align: baseline;
                        display: inline-block;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }
                    .nd-detail-filelist__name .u-file-icon--list {
                        width: 32px;
                        height: 32px;
                        -o-object-fit: contain;
                        object-fit: contain;
                        margin-right: 8px;
                    }
                    .u-file-icon.u-file-icon--list {
                        width: 40px;
                        height: 40px;
                    }
                    .u-file-icon {
                        display: inline-block;
                        vertical-align: middle;
                    }
            
                    .nd-detail-filelist__list {
                        width: 100%;
                        min-height: 400px;
                        /*height: calc(100% - 140px);*/
                        border-radius: 13px;
                        position: relative;
                        margin-top: 14px;
                        padding: 0 12px;
                        overflow-y: auto;
                    }
                    .u-file-icon.u-file-icon--list {
                        width: 40px;
                        height: 40px;
                    }
                    .nd-detail-filelist__list .u-file-icon--list {
                        width: 24px;
                        height: 24px;
                    }
            
                    .u-file-icon {
                        display: inline-block;
                        vertical-align: middle;
                    }
            
                    .nd-detail-filename__title-text {
                        padding-left: 5px;
                        line-height: 40px;
                        max-width: calc(92%);
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                    .text-clip, .text-ellip, .text-ellipsis {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .inline-block-v-middle {
                        display: inline-block;
                        vertical-align: middle;
                    }
                    .text-clip, .text-ellip, .text-ellipsis {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .text-elip, .text-ellip {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .inline-block-v-middle {
                        display: inline-block;
                        vertical-align: middle;
                    }
            
                    ::-webkit-scrollbar {
                        width: 6px;
                        height: 10px;
                    }
            
                    ::-webkit-scrollbar-track {
                        border-radius: 0;
                        background: none;
                    }
            
                    ::-webkit-scrollbar-thumb {
                        background-color: rgba(85,85,85,.4);
                    }
            
                    ::-webkit-scrollbar-thumb,::-webkit-scrollbar-thumb:hover {
                        border-radius: 5px;
                        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.2);
                    }
            
                    ::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(85,85,85,.3)
                    }  
                    
                    .aButton{
                        cursor: pointer;
                        text-align: center;
                        display: block;
                        text-decoration: none;
                        height: 30px;
                        line-height: 30px;
                    }
                    
                    </style>
                    <canvas id="preview-canvas"></canvas>
                    <div id="previewSpineDom" style="color: #fff; position: absolute; top: 0; left: 30px;">
                        <span style="font-weight: bold">spine动画预览窗口</span>
                        <span id="curVersionText">当前版本:</span>
                        <span><a href="#unique-id" class="closeBtn aButton" style="display: block">目录</a></span>
                         <span>flipX:</span><input type="checkbox" id="flipX">
                        <span>flipY:</span><input type="checkbox" id="flipY">
                        <span>x: <input id="posX" type="number" value="0.5" step="0.05" style="width: 50px"></span>
                        <span>y: <input id="posY" type="number" value="0.5" step="0.05" style="width: 50px"></span>
<!--                        <span>Debug:</span><input type="checkbox" id="debug">-->
                        <span>α预乘:</span><input type="checkbox" id="premultipliedAlpha">
                   
                        <span>动画标签:</span><select id="animationList"></select>
                        <span>皮肤:</span><select id="skinList"></select>
                        <span>大小:<input id="scale" type="number" value="0.5" step="0.05" style="width: 50px"></span>
                     
                        <span>动画时长:<span id="aniTime"></span></span>
                        <button id="closePreviewWindow" style="margin-left: 20px; margin-top: 10px;" class="closeBtn">关闭预览窗口</button>
                    </div>
                    <!--  模态框       -->
                    <div class="light-modal" id="unique-id" role="dialog" aria-labelledby="light-modal-label" aria-hidden="false">
                        <div class="light-modal-content animated zoomInUp">
                            <!-- light modal header -->
                            <div class="light-modal-header">
                                <h3 class="light-modal-heading">选择文件夹预览</h3>
                                <a href="#" class="light-modal-close-icon" aria-label="close">&times;</a>
                            </div>
                            <!-- light modal body -->
                            <div class="light-modal-body">
                               <div class="wp-s-core-pan__body-detail">
                                 <div class="wp-s-core-pan__detail-slot">
                                    <section class="nd-detail nd-new-main-list__detail"><!---->
                                        <div class="nd-detail-filelist" 
                                             type="simple">
                                            <div class="nd-detail-filelist__contain">
                                                <div class="nd-detail-filelist__title">
                                                    文件夹内容
                                                </div>
                                                <div class="nd-detail-filelist__name"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRUExURUxpcf++Hv/ZU//OPv/DL/+9Gv/BI/+4Bf+4Ef/XcP/LOP/TSf/RRP/WTv/JM/+3Ef+9Ff/bhf+5BP/DJf+yDv/imv/kqv/bXP/w0v/fd//calQXUgwAAAAKdFJOUwB///8d3L9enl8sr20gAAACN0lEQVRYw+2Y65abIBRGE1EzVbyNSW18/wctHA6XYw4q9Ee7Vt2AgOHbcVyTOMztdnFxcXFMWf7gKHN190VRKDpFC0iNqB5ZvqpXzJRxHoF7hrAa9/hK9j2oYIA2QA/UqXeyNg5QDBrshhHbUH8xxO+uT7sOJ/tU5a4wh0eK8KmKHTxd28Bfo16pqphep5l6I+R/p8xr668kVghVceH8M5EZYnGhnBKRceGqmaZXPPw2xbO+1xU+8axwe8NfzkIV7xVZdF0AVhi+rWdxIfgmwloE6CkrDCPwJbYUeFgK61icxFcNKyxIxE+WgnllQ0y4+HffzZ8WZtJlCDtz+CzqaaFaVGiWBNEOZZ15zihsT2CFnXk4QStsLohTU3FC+Af8I8JWV1fa1jy8u+hnOUy2vnd5SkeGrJBfHZwDbxe87pfxQvejmMZZYxxdYSoyVyixSvtXFLJ7hWq5xCRNSTozczzHCj8T54kI5d8QCtvZAodDIa7DgRkJaII2hBfaJC7EOE7D076XuIoVBu8oN3kpBLVt4YXBVaUSFSbS5Akb00znSoPn9KCJCN0am7SnGhganC4kKhR2MV0vvEn4M7bFhM3GIZqtgfiPr9BdSAYnrnCX3rQeB/2xsKcHouiBBhpO+phQL9CdjmKqsRkXpkMz57dmfTY1v3k8is26zvN2A6yIbKVqm/tMjFBMp5jpxrWKbsB1dJw/AsC3Lt/YEaK7x1t5r7aLj3ned/fRj1TK3H9wXFxc/F/8BgM0jBZ4nc19AAAAAElFTkSuQmCC"
                                                                                        alt="folder" class="u-file-icon u-file-icon--list"><span id="pfqhCurFold">当前文件夹</span></div>
                                                <div class="nd-detail-filelist__list bg">
                                                    <div style="display: flex; flex-direction: row">
                                                        <div id="pfqhFoldList" style="white-space: nowrap; width: 43%; display: flex;flex-direction: column;" >
                                                            <div class="nd-detail-filename" id="pfqhLastDir">
                                                            <img
                                                                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRUExURUxpcf++Hv/ZU//OPv/DL/+9Gv/BI/+4Bf+4Ef/XcP/LOP/TSf/RRP/WTv/JM/+3Ef+9Ff/bhf+5BP/DJf+yDv/imv/kqv/bXP/w0v/fd//calQXUgwAAAAKdFJOUwB///8d3L9enl8sr20gAAACN0lEQVRYw+2Y65abIBRGE1EzVbyNSW18/wctHA6XYw4q9Ee7Vt2AgOHbcVyTOMztdnFxcXFMWf7gKHN190VRKDpFC0iNqB5ZvqpXzJRxHoF7hrAa9/hK9j2oYIA2QA/UqXeyNg5QDBrshhHbUH8xxO+uT7sOJ/tU5a4wh0eK8KmKHTxd28Bfo16pqphep5l6I+R/p8xr668kVghVceH8M5EZYnGhnBKRceGqmaZXPPw2xbO+1xU+8axwe8NfzkIV7xVZdF0AVhi+rWdxIfgmwloE6CkrDCPwJbYUeFgK61icxFcNKyxIxE+WgnllQ0y4+HffzZ8WZtJlCDtz+CzqaaFaVGiWBNEOZZ15zihsT2CFnXk4QStsLohTU3FC+Af8I8JWV1fa1jy8u+hnOUy2vnd5SkeGrJBfHZwDbxe87pfxQvejmMZZYxxdYSoyVyixSvtXFLJ7hWq5xCRNSTozczzHCj8T54kI5d8QCtvZAodDIa7DgRkJaII2hBfaJC7EOE7D076XuIoVBu8oN3kpBLVt4YXBVaUSFSbS5Akb00znSoPn9KCJCN0am7SnGhganC4kKhR2MV0vvEn4M7bFhM3GIZqtgfiPr9BdSAYnrnCX3rQeB/2xsKcHouiBBhpO+phQL9CdjmKqsRkXpkMz57dmfTY1v3k8is26zvN2A6yIbKVqm/tMjFBMp5jpxrWKbsB1dJw/AsC3Lt/YEaK7x1t5r7aLj3ned/fRj1TK3H9wXFxc/F/8BgM0jBZ4nc19AAAAAElFTkSuQmCC"
                                                                 alt="folder" class="category u-file-icon u-file-icon--list">
                                                            <span class="nd-detail-filename__title-text inline-block-v-middle text-ellip">返回上级</span>
                                                            </div>
                                                        </div>
                                                        <div id="pfqhFilesList" style="margin-left: 5%; white-space: nowrap; width: 43%; display: flex;flex-direction: column;"">
                                   
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    `

                    let canvas;
                    let activeSkeleton = null
                    let currentNode = null
                    let isClosed = false   // 全局信号, 通知关闭, 停止渲染
                    let isUpdate = false

                    canvas = document.getElementById('preview-canvas')

                    let animationManager = new AnimationManager('', canvas, 123456)

                    // 被监视的元素
                    let px = document.getElementById('posX')
                    let py = document.getElementById('posY')
                    let canvasSize = canvas.getBoundingClientRect()
                    let x = 0.65 * canvasSize.width
                    let y = 0.5 * canvasSize.height
                    let scale = 0.5
                    // 开始监视el上的手势变化
                    const at = new AnyTouch(canvas)

                    let currentPath = lib.assetURL + 'extension/皮肤切换/assets'
                    // 获取模态框文件夹和文件列表dom
                    let foldsEle = document.getElementById('pfqhFoldList')
                    let filesEle = document.getElementById('pfqhFilesList')
                    let curFoldEle = document.getElementById('pfqhCurFold')

                    let clickName = lib.config.touchscreen ? 'touchend' : 'click'

                    let lastSelFile = null

                    curFoldEle.innerText = currentPath

                    // 返回上一级事件
                    document.getElementById('pfqhLastDir').addEventListener(clickName, function (e) {
                        currentPath = currentPath === '' ? '' : currentPath.substring(0, currentPath.lastIndexOf('/'));
                        initFoldsInfo()
                        e.stopPropagation()
                    })

                    // 只过滤出包含完整spine骨骼的文件进行预览
                    let filterSpineFile = (files) => {
                        let skinInfoMap = {}
                        for (let f of files){
                            let name = f.substring(0, f.lastIndexOf("."))
                            let ext = f.substring(f.lastIndexOf(".")+1)
                            if (!(name in skinInfoMap)) {
                                skinInfoMap[name] = {}
                            }
                            if (ext === 'png') {
                                skinInfoMap[name].png = true
                            } else if (ext === 'skel') {
                                skinInfoMap[name].type = 'skel';
                            } else if (ext === 'json') {
                                skinInfoMap[name].type = 'json';
                            } else if (ext === 'atlas') {
                                skinInfoMap[name].altas = true
                            }
                        }
                        let retFiles = []
                        for (let k in skinInfoMap) {
                            let info = skinInfoMap[k]
                            // 如果十周年文件里面已经有了对应武将和对应皮肤的话, 跳过.
                            if (info.type && info.altas && info.png) {
                                retFiles.push({
                                    path: k + '.' + info.type,
                                    name: k
                                })
                            }

                        }
                        return retFiles
                    }

                    let initFoldsInfo = () => {
                        // 获取这个文件夹下的所有合法的skel文件和所有文件夹
                        pfqhUtils.getFoldsFiles(currentPath.replace(lib.assetURL, ''), function (file, path) {
                            let suffixes = ['.png', '.atlas', '.json', '.skel', '.jpg' ]
                                for (let suf of suffixes) {
                                    if (file.endsWith(suf)) {
                                        return true
                                    }
                                }
                                return false
                            }, function (folds, files) {
                                curFoldEle.innerText = currentPath
                                // 删除之前节点
                                for (let i = foldsEle.childNodes.length - 1; i > 1 ; i--) {
                                    foldsEle.childNodes[i].remove()
                                }
                                for (let i = filesEle.childNodes.length - 1; i > 0 ; i--) {
                                    filesEle.childNodes[i].remove()
                                }
                                for (let i = 0; i < folds.length; i++) {
                                    let div = document.createElement('div');
                                    div.innerHTML = `
                                    <img
                                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRUExURUxpcf++Hv/ZU//OPv/DL/+9Gv/BI/+4Bf+4Ef/XcP/LOP/TSf/RRP/WTv/JM/+3Ef+9Ff/bhf+5BP/DJf+yDv/imv/kqv/bXP/w0v/fd//calQXUgwAAAAKdFJOUwB///8d3L9enl8sr20gAAACN0lEQVRYw+2Y65abIBRGE1EzVbyNSW18/wctHA6XYw4q9Ee7Vt2AgOHbcVyTOMztdnFxcXFMWf7gKHN190VRKDpFC0iNqB5ZvqpXzJRxHoF7hrAa9/hK9j2oYIA2QA/UqXeyNg5QDBrshhHbUH8xxO+uT7sOJ/tU5a4wh0eK8KmKHTxd28Bfo16pqphep5l6I+R/p8xr668kVghVceH8M5EZYnGhnBKRceGqmaZXPPw2xbO+1xU+8axwe8NfzkIV7xVZdF0AVhi+rWdxIfgmwloE6CkrDCPwJbYUeFgK61icxFcNKyxIxE+WgnllQ0y4+HffzZ8WZtJlCDtz+CzqaaFaVGiWBNEOZZ15zihsT2CFnXk4QStsLohTU3FC+Af8I8JWV1fa1jy8u+hnOUy2vnd5SkeGrJBfHZwDbxe87pfxQvejmMZZYxxdYSoyVyixSvtXFLJ7hWq5xCRNSTozczzHCj8T54kI5d8QCtvZAodDIa7DgRkJaII2hBfaJC7EOE7D076XuIoVBu8oN3kpBLVt4YXBVaUSFSbS5Akb00znSoPn9KCJCN0am7SnGhganC4kKhR2MV0vvEn4M7bFhM3GIZqtgfiPr9BdSAYnrnCX3rQeB/2xsKcHouiBBhpO+phQL9CdjmKqsRkXpkMz57dmfTY1v3k8is26zvN2A6yIbKVqm/tMjFBMp5jpxrWKbsB1dJw/AsC3Lt/YEaK7x1t5r7aLj3ned/fRj1TK3H9wXFxc/F/8BgM0jBZ4nc19AAAAAElFTkSuQmCC"
                                         alt="folder" class="category u-file-icon u-file-icon--list">
                                    <span class="nd-detail-filename__title-text inline-block-v-middle text-ellip">${folds[i]}</span>
                                `;
                                    div.setAttribute('fold', folds[i]);
                                    div.classList.add('nd-detail-filename');
                                    div.addEventListener(clickName, function (e) {
                                        if (currentPath) {
                                            currentPath = `${currentPath}/${this.getAttribute('fold')}`
                                        } else {
                                            currentPath = this.getAttribute('fold')
                                        }

                                        initFoldsInfo()
                                        e.stopPropagation()
                                    });
                                    foldsEle.appendChild(div);
                                }

                                //
                                let retFiles = filterSpineFile(files)
                                for (let i = 0; i < retFiles.length; i++) {
                                    let div = document.createElement('div')
                                    div.innerHTML = `
                                    <img
                                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUxpcTOL+DSL+DqO+Veb/mKl/kmX+zWL+U6a+2ao/0aW+0CS+kyZ/GCk/mWn/1yi/lef/VGc/Pr9/+jz/2+s+46//b3a/4O3/AJIojgAAAAKdFJOUwDf//8d3U+en52O09RGAAACF0lEQVRYw+2Y63ajIBCAW8ZqHC5KrZv3f9MFhpuJTQfrjz1n/SDIbT4npw2pfXu7uLi4YNOP39O367rRvOKja/V9GHOqcTTmVGNnzLlGl6A2WvvWxGsqJo9ajKMuGP0dDcbxSWTShKlGfOOoebCNRTidYxynDXrb1dUU0ziGEF3ZdHHoza14xocMXzJyhLdpmme/e6ag2XeobqYCnBRvs98fm32meId56nnCErk+czfVhlub0CyfOyzaHhTa9XOX9aDQqnU/w7uyjULrcC3i+ocI4iUOVkQ7+8IVeptXWgUgMXD3xjv1UYCyCa6QUAiC0E64fMUBYBTOrUJnROmBryCEMEAsCbYKrSIkCSXS0LYLla8U6K4KSYi+H5ZsWmcJY1ohmpos3OLWmoSF9JajX9m8ckyIRfjIrzM8KERfq5J/yridZwrDx0HF6suOMF24QoXJGijCR/gZboB/TZgDYyd9lqU8mqGPlGQMJR8OfiDjZNjDEQ5S0hlDZ4ushWkqwxSWJCgezOKYIMsw7Ri4wi0g3HfBKuF55bBQTNod1WcKw9kv6yShTQgUQA6A6IsjAEmFJ4RXOF24W+gBcIUxAaiapChi/zolw5rfC+GYUKTqG1G11Vxo2Bn6AJLk8NiPC6JBKOjXLv0ZEruwN2AJe8GCnKzHgEGw4STonm/fub535rNUx8xx4D+RdsPP9Af+m3FxcfH/8hcLt2QJ3T9wuwAAAABJRU5ErkJggg=="
                                         class="category u-file-icon u-file-icon--list" alt="${retFiles[i].path}">
                                    <span class="nd-detail-filename__title-text inline-block-v-middle text-ellip">${retFiles[i].path}</span>
                                `
                                    div.setAttribute('path', retFiles[i].path)
                                    div.classList.add('nd-detail-filename')
                                    div.addEventListener(clickName, function (e) {
                                        if (lastSelFile === this) return
                                        playSelectAsset(this.getAttribute('path'))

                                        // 添加选择的样式
                                        if (lastSelFile) {
                                            lastSelFile.classList.remove('previewSelect')
                                        }
                                        lastSelFile = this
                                        this.classList.add('previewSelect')
                                        e.stopPropagation()
                                    })
                                    filesEle.appendChild(div)
                                }
                            }
                        )
                    }

                    initFoldsInfo()

                    let playSelectAsset = (path) => {
                        // 拼接当前所选择的文件, 获取版本号, 然后进行资源载入与播放
                        let fullPath
                        if (currentPath) {
                            fullPath = currentPath + '/' + path
                        } else {
                            fullPath = path
                        }
                        pfqhUtils.getSpineFileVersion(fullPath, function (version) {
                            if (version == null) {
                                version = '3.6'
                            }
                            if ((!['3.6', '3.8', '4.0'].includes(version))) {
                                skinSwitchMessage.show({
                                    'type': 'warning',
                                    'text': `当前不支持${version}版本的骨骼文件播放`,
                                    'duration': 1500
                                });
                                return;
                            }

                            // 加载当前骨骼
                            let dy = animationManager.getAnimation(version)

                            let name = path.substring(0, path.lastIndexOf("."))
                            let ext = path.substring(path.lastIndexOf(".")+1)
                            let filename
                            if (currentPath) {
                                filename = currentPath + '/' + name
                            } else {
                                filename = name
                            }

                            if (!isUpdate) {
                                dy.update({
                                    width: decadeUI.get.bodySize().width,
                                    height: decadeUI.get.bodySize().height,
                                    dpr: Math.max(window.devicePixelRatio * (window.documentZoom ? window.documentZoom : 1), 1),
                                })
                            }

                            let play = () => {
                                animationManager.stopSpineAll()
                                let node = dy.playSpine({
                                    x: [0, 0.65],
                                    y: [0, 0.5],
                                    name: filename,
                                    scale: 0.5,
                                    loop: true
                                })
                                document.getElementById('curVersionText').innerText = `当前版本: ${version}`
                                // 切换当前的骨骼
                                activeSkeleton = node.skeleton
                                currentNode = node
                                // 更新当前骨骼的标签信息
                                init()
                            }

                            if (dy.hasSpine(filename)) {
                                play()
                            } else {
                                dy.loadSpine(filename, ext, () => {
                                    play()
                                }, () => {
                                    console.log('加载骨骼错误')
                                })
                            }

                        }, function () {
                            skinSwitchMessage.show({
                                'type': 'warning',
                                'text': `获取版本号错误`,
                                'duration': 1500
                            })
                        })

                    }

                    let scaleSlider
                    {
                        scaleSlider = document.createElement('input')
                        scaleSlider.min = '0'
                        scaleSlider.max = '3'
                        scaleSlider.value = '0.5'
                        scaleSlider.type = 'range';

                        // scaleSlider = decadeUI.component.slider(0.1, 3, 0.5)
                        scaleSlider.setAttribute('step', '0.1')
                        let scaleNode = document.getElementById('scale')
                        scaleNode.parentNode.insertBefore(scaleSlider, scaleNode)
                    }

                    let speedSlider
                    {
                        speedSlider = document.createElement('input')
                        speedSlider.min = '0'
                        speedSlider.max = '4'
                        speedSlider.type = 'range';
                        // speedSlider = decadeUI.component.slider(0, 3, 1)
                        speedSlider.setAttribute('step', '0.1')

                        let con = document.createElement('span')
                        let speedText = document.createElement('span')
                        speedText.innerHTML = '速度: 1'
                        speedSlider.value = '1'
                        con.appendChild(speedText)
                        con.appendChild(speedSlider)

                        let closePreviewWindow = document.getElementById('closePreviewWindow')
                        closePreviewWindow.parentNode.insertBefore(con, closePreviewWindow)

                        speedSlider.onchange = function(){
                            if (currentNode) {
                                currentNode.speed = speedSlider.value
                            }
                            speedText.innerHTML = '速度: ' + speedSlider.value
                        };

                    }
                    // 将会包装事件的 debounce 函数
                    function debounce(fn, delay) {
                        // 维护一个 timer
                        let timer = null;

                        return function() {
                            // 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
                            let context = this;
                            let args = arguments;

                            clearTimeout(timer);
                            timer = setTimeout(function() {
                                fn.apply(context, args);
                            }, delay);
                        }
                    }

                    let thunderForbidTouch = function () {
                        _status.th_swipe_up = lib.config.swipe_up;
                        lib.config.swipe_up = ''
                        _status.th_swipe_down = lib.config.swipe_down;
                        lib.config.swipe_down = ''
                        _status.th_swipe_left = lib.config.swipe_left;
                        lib.config.swipe_left = ''
                        _status.th_swipe_right = lib.config.swipe_right;
                        lib.config.swipe_right = ''
                        _status.th_gamePause = ui.click.pause
                        ui.click.pause = ()=>{}
                    }

                    let thunderAllowTouch = function () {
                        if (_status.th_swipe_up) {
                            lib.config.swipe_up =  _status.th_swipe_up
                            lib.config.swipe_down = _status.th_swipe_down
                            lib.config.swipe_left = _status.th_swipe_left
                            lib.config.swipe_right = _status.th_swipe_right
                            ui.click.pause = _status.th_gamePause
                        }
                    }

                    thunderForbidTouch()

                    // 拨动动画时长, 跳转到某刻 https://juejin.cn/post/7125409030113067015
                    let timeSlider
                    {
                        timeSlider = document.createElement('input')
                        timeSlider.min = '0'
                        timeSlider.max = '1'
                        // timeSlider = decadeUI.component.slider(0, 1, 0)
                        timeSlider.setAttribute('step', '0.01')
                        timeSlider.type = 'range';

                        let con = document.createElement('span')
                        let text = document.createElement('span')
                        text.innerHTML = '进度: 0.00'
                        timeSlider.value = '0'
                        con.appendChild(text)
                        con.appendChild(timeSlider)

                        let closePreviewWindow = document.getElementById('closePreviewWindow')
                        closePreviewWindow.parentNode.insertBefore(con, closePreviewWindow)

                        timeSlider.addEventListener('input', debounce(function(e){
                            text.innerHTML = `进度: ${Number(timeSlider.value).toFixed(2)}`

                            // 修改speed为0, 并且跳转到具体的时间
                            speedSlider.value = 0
                            speedSlider.onchange()

                            if (currentNode) {
                                currentNode.speed = speedSlider.value
                                let state = activeSkeleton.state
                                let entry = state.tracks[0]
                                entry.trackTime = Number(timeSlider.value) * entry.animationEnd
                            }


                        }, 10))
                    }

                    let angleSlider
                    {
                        angleSlider = document.createElement('input')
                        angleSlider.min = '0'
                        angleSlider.max = '360'
                        angleSlider.type = 'range'
                        // angleSlider = decadeUI.component.slider(0, 360, 0)
                        angleSlider.setAttribute('step', '1')

                        let con = document.createElement('span')
                        let text = document.createElement('span')
                        text.innerHTML = '角度: 0°'
                        angleSlider.value = '0'
                        con.appendChild(text)
                        con.appendChild(angleSlider)

                        let closePreviewWindow = document.getElementById('closePreviewWindow')
                        closePreviewWindow.parentNode.insertBefore(con, closePreviewWindow)

                        angleSlider.onchange = function(){
                            text.innerHTML = '角度: ' + angleSlider.value + '°'
                            if (currentNode) {
                                currentNode.angle = angleSlider.value
                            }
                        };

                    }

                    // 当拖拽的时候pan事件触发 拖拽事件
                    at.on('pan', (e) => {
                        if (e.nativeEvent.touches && e.nativeEvent.touches.length > 1) return
                        // e包含位移/速度/方向等信息
                        // 获取x,y偏移
                        let deltaX = e.deltaX
                        let deltaY = e.deltaY
                        x += deltaX
                        y -= deltaY
                        let vx =  x / canvasSize.width
                        let vy =  y / canvasSize.height
                        px.value = vx.toString()
                        py.value = vy.toString()
                        if (currentNode) {
                            currentNode.x = [0, vx]
                            currentNode.y = [0, vy]
                        }
                    })

                    at.on(['pinchin', 'pinchout'], debounce((e) => {
                        // e包含位移/速度/方向等信息
                        // 获取x,y偏移
                        // scale *= e.scale
                        if (e.scale > 1) scale += 0.1
                        else if (e.scale < 1) scale -= 0.1
                        scaleSlider.value = scale.toString()
                        // 手动触发change事件
                        scaleSlider.dispatchEvent(new CustomEvent('input'));
                        e.preventDefault();
                    }, 250))

                    canvas.addEventListener('wheel', debounce(function (e) {
                        let ratio = 0.05;
                        // 缩小

                        if (e.deltaY > 0) {
                            ratio = -0.05;
                        }
                        scale = scale + ratio;
                        // 限制缩放倍数
                        if (scale < 0.1) scale = 0.1
                        scaleSlider.value = scale.toString()
                        // 手动触发change事件
                        scaleSlider.dispatchEvent(new CustomEvent('input'));
                        e.preventDefault();
                    }, 0))

                    document.getElementById('closePreviewWindow').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                        // 删除自己当前节点即可
                        let self = background
                        // let self = document.getElementById('previewWindowDiv')
                        let parent = self.parentElement
                        // 停止当前的render
                        isClosed = true
                        thunderAllowTouch()
                        setTimeout(() => {
                            // 延时删除节点, 等待最后一次渲染完成
                            parent.removeChild(self)
                        }, 200)
                    })

                    function init () {

                        if (!activeSkeleton) {
                            return
                        }

                        document.getElementById('scale').oninput = function (e) {
                            let v = e.srcElement.value
                            if (scaleSlider) {
                                scaleSlider.value = v
                            }
                            if (currentNode) {
                                currentNode.scale = Number(v) || 0.5
                            }
                        }
                        document.getElementById('posX').oninput = function (e) {
                            let v = e.srcElement.value
                            if (currentNode) {
                                currentNode.y = [0, Number(v) || 0.65]
                            }
                        }
                        document.getElementById('posY').oninput = function (e) {
                            let v = e.srcElement.value
                            if (currentNode) {
                                currentNode.y = [0, Number(v) || 0.5]
                            }

                        }

                        document.getElementById('premultipliedAlpha').onchange = function (e) {
                            if (currentNode) {
                                currentNode.premultipliedAlpha =  e.target.checked
                            }
                        }

                        document.getElementById('flipX').onchange = function (e) {
                            if (currentNode) {
                                currentNode.flipX =  e.target.checked
                            }
                        }
                        document.getElementById('flipY').onchange = function (e) {
                            if (currentNode) {
                                currentNode.flipY =  e.target.checked
                            }
                        }


                        if (scaleSlider) {
                            scaleSlider.oninput = function(){
                                // let v= s1.value / 8;
                                if (currentNode) {
                                    currentNode.scale = scaleSlider.value
                                }
                                document.getElementById('scale').value = scaleSlider.value;
                            }
                        }

                        let setupAnimationUI = () => {
                            // 初始化骨骼数据
                            if (!activeSkeleton) {
                                return
                            }
                            let animationList = document.getElementById('animationList')
                            animationList.options.length = 0

                            let skeleton = activeSkeleton
                            let state = skeleton.state;
                            let activeAnimation = state.tracks[0].animation.name;
                            for (let i = 0; i < skeleton.data.animations.length; i++) {
                                let name = skeleton.data.animations[i].name;
                                let option = document.createElement('option')
                                option.setAttribute('value', name)
                                option.text = name
                                if (name === activeAnimation) {
                                    option.setAttribute('selected', 'selected')
                                    document.getElementById('aniTime').innerText = Number(skeleton.data.animations[i].duration).toFixed( 1)
                                }
                                animationList.options.add(option)
                            }

                            animationList.onchange =function() {
                                let skeleton = activeSkeleton
                                let state = skeleton.state;
                                let animationName = animationList.options[animationList.selectedIndex].text
                                skeleton.setToSetupPose();
                                state.setAnimation(0, animationName, true);
                                let ani = skeleton.data.findAnimation(animationName)
                                document.getElementById('aniTime').innerText =  Number(ani.duration).toFixed(1)
                            }
                        }

                        let setupSkinUI = function () {
                            if (!activeSkeleton) {
                                return
                            }

                            let skinList = document.getElementById('skinList')
                            skinList.options.length = 0

                            let skeleton = activeSkeleton
                            let skins = skeleton.data.skins

                            for (let i = 0; i < skins.length; i++) {
                                let name = skins[i].name;
                                let option = document.createElement('option')
                                option.setAttribute('value', name)
                                option.text = name
                                if (i === 0) {
                                    option.setAttribute('selected', 'selected')
                                    document.getElementById('aniTime').innerText = Number(skeleton.data.animations[i].duration).toFixed(1)
                                }
                                skinList.options.add(option)
                            }

                            skinList.onchange = function() {
                                let skeleton = activeSkeleton
                                let skinName = skinList.options[skinList.selectedIndex].text
                                skeleton.setSkinByName(skinName);
                                skeleton.setSlotsToSetupPose();
                            }
                        }

                        setupAnimationUI()
                        setupSkinUI()

                        // 初始化xy坐标
                        x = 0.65 * canvasSize.width
                        y = 0.5 * canvasSize.height
                        scaleSlider.value = 0.5
                        document.getElementById('scale').value = 0.5
                        console.log(activeSkeleton.premultipliedAlpha = document.getElementById('premultipliedAlpha'))
                        currentNode.premultipliedAlpha = document.getElementById('premultipliedAlpha').checked
                        currentNode.flipX = document.getElementById('flipX').checked
                        currentNode.flipY = document.getElementById('flipY').checked
                    }
                },

                // 管理滑动事件 status: true  -> 开启
                allowTouchEvent: function (status) {
                    let thunderForbidTouch = function () {
                        _status.th_swipe_up = lib.config.swipe_up;
                        lib.config.swipe_up = ''
                        _status.th_swipe_down = lib.config.swipe_down;
                        lib.config.swipe_down = ''
                        _status.th_swipe_left = lib.config.swipe_left;
                        lib.config.swipe_left = ''
                        _status.th_swipe_right = lib.config.swipe_right;
                        lib.config.swipe_right = ''
                        _status.th_gamePause = ui.click.pause
                        ui.click.pause = ()=>{}
                    }

                    let thunderAllowTouch = function () {
                        if (_status.th_swipe_up) {
                            lib.config.swipe_up =  _status.th_swipe_up
                            lib.config.swipe_down = _status.th_swipe_down
                            lib.config.swipe_left = _status.th_swipe_left
                            lib.config.swipe_right = _status.th_swipe_right
                            ui.click.pause = _status.th_gamePause
                        }
                    }
                    if (status) {
                        thunderAllowTouch()
                    } else {
                        thunderForbidTouch()
                    }
                }

            };

            skinSwitch.dynamic.selectSkin.cd = true;

            lib.init.css(skinSwitch.url + "style", "base")
            if (lib.config[skinSwitch.configKey.useDynamic]) {
                lib.init.css(skinSwitch.url + "style", "dynamic");
            }
            lib.init.css(skinSwitch.url + "style", "edit")
            lib.init.css(skinSwitch.url + "component", "iconfont")
            lib.init.css(skinSwitch.url + "component", "message")
            lib.init.css(skinSwitch.url + "style", "light-modal")
            lib.init.js(skinSwitch.url, 'saveSkinParams', function() {
                window.saveFunc(lib, game, ui, get, ai, _status);
            }, function() {
                skinSwitch.saveSkinParams = {}
            });


            // 加载新的ani
            lib.init.js(skinSwitch.url, 'animation')
            lib.init.js(skinSwitch.url + 'component', 'any-touch.umd.min')
            // 覆盖十周年的spine
            lib.init.js(skinSwitch.url, 'spine', function () {
                lib.init.js(skinSwitch.url + 'spine-lib', 'spine_4_0_64', function () {
                    lib.init.js(skinSwitch.url + 'spine-lib', 'spine_3_8', function () {
                        lib.init.js(skinSwitch.url, 'animations', function () {
                            if (lib.config[skinSwitch.configKey.replaceDecadeAni]) {
                                let replace = () => {
                                    if (window.dcdAnim) {
                                        window.spineAnim = new DecadeAnimationProxy(window.dcdAnim, lib)
                                        console.log('替换结束')
                                    } else {
                                        requestAnimationFrame(replace)
                                    }
                                }
                                replace()
                            }
                        })

                    })
                })
            })


            lib.init.js(skinSwitch.url, 'effects', function () {
                for (let k in pfqhSkillEffect) {
                    for (let i=0; i<pfqhSkillEffect[k].length; i++) {
                        lib.skill[`__pfqh_${k}_${i}`] = pfqhSkillEffect[k][i]
                    }
                }
            })

            let editBox  // 编辑动皮参数的弹窗
            let adjustPos  // 显示动画的相对位置. 这个是相对全局window, 用于辅助调试pos位置
            let player   // 当前角色
            let dynamic   // 当前角色的apnode对象, 包含皮肤id
            let renderer  // 当前动皮与worker的通信中继

            // 创建UI
            function editBoxInit() {
                if (editBox) return

                editBox = ui.create.div('.editDynamic .draggable', ui.window)
                let daijiGroup = ui.create.div('.group', editBox)
                let chukuangGroup = ui.create.div('.group', editBox)

                let daijiEdit = ui.create.div('.btn .pointer .flexItems', daijiGroup)
                let daijiAdjust = ui.create.div('.btn .pointe .flexItems', daijiGroup)
                let daijiScale = ui.create.div('.btn', daijiGroup)
                let daijiAngle = ui.create.div('.btn', daijiGroup)

                let daijiXPosNum = ui.create.div('.btn .posNum', daijiGroup)
                let daijiYPosNum = ui.create.div('.btn .posNum', daijiGroup)
                let daijiPos = ui.create.div('.btn', daijiGroup)  // 位置参数显示
                let daijiSave = ui.create.div('.btn .pointer', daijiGroup)

                let chuKuangEdit = ui.create.div('.btn .pointer', chukuangGroup)
                let chuKuangAdjust = ui.create.div('.btn .pointer', chukuangGroup)
                let chuKuangScale = ui.create.div('.btn', chukuangGroup)
                // let empty = ui.create.div('.btn', chukuangGroup)  // 占位
                let qhlxAdjust = ui.create.div('.btn', chukuangGroup)  // 调整千幻雷修版本的待机和出框
                let chuKuangXPosNum = ui.create.div('.btn .posNum', chukuangGroup)
                let chuKuangYPosNum = ui.create.div('.btn .posNum', chukuangGroup)
                let chuKuangPos = ui.create.div('.btn', chukuangGroup)
                let chuKuangSave = ui.create.div('.btn .pointer', chukuangGroup)

                let currentPlay = 'daiji'
                let daijiXYPos = {
                    x: [0, 0.5],
                    y: [0, 0.5]
                }
                let chukuangXYPos = {
                    x: [0, 0.5],
                    y: [0, 0.5]
                }

                if (lib.config[skinSwitch.configKey.closeXYPosAdjust]) {
                    daijiXPosNum.classList.add('hidden-adjust')
                    daijiYPosNum.classList.add('hidden-adjust')
                    chuKuangXPosNum.classList.add('hidden-adjust')
                    chuKuangYPosNum.classList.add('hidden-adjust')
                }

                daijiEdit.innerHTML = '<div id="playdaiji" style="position: relative;">播放待机</div><div id="playbeijing" style="position: relative;">动态背景</div>'
                daijiAdjust.innerHTML = '<div id="adjustdaiji" style="position: relative;">调整待机</div><div id="adjustbeijing" style="position: relative;">调整背景</div>'
                daijiScale.innerHTML = `大小: <input type="text" value="" style="width:32px;border-radius: 4px;">`
                daijiAngle.innerHTML = `角度: <input type="text" value="" style="width:32px;border-radius: 4px;">`
                daijiXPosNum.innerHTML = `<span>x</span><i class="minus">-</i><input value="0"><i class="plus">+</i>`
                daijiYPosNum.innerHTML = `<span>y</span><i class="minus">-</i><input value="0"><i class="plus">+</i>`
                daijiPos.innerHTML = `<span style="font-size: 12px;font-weight: bold;">位置</span>`
                daijiSave.innerHTML = `保存参数`

                chuKuangEdit.innerHTML = '播放出框'
                chuKuangAdjust.innerHTML = '调整出框'
                chuKuangScale.innerHTML = `大小: <input type="text" value="" style="width:32px;border-radius: 4px;">`
                qhlxAdjust.innerHTML = `调整千幻`
                chuKuangXPosNum.innerHTML = `<span>x</span><i class="minus">-</i><input value="0"><i class="plus">+</i>`
                chuKuangYPosNum.innerHTML = `<span>y</span><i class="minus">-</i><input value="0"><i class="plus">+</i>`
                chuKuangPos.innerHTML = `<span style="font-size: 12px;font-weight: bold;">位置</span>`
                chuKuangSave.innerHTML = `保存参数`


                let playdaiji = daijiEdit.querySelector('#playdaiji')
                let adjustdaiji = daijiAdjust.querySelector('#adjustdaiji')
                let playbeijing = daijiEdit.querySelector('#playbeijing')
                let adjustbeijing = daijiAdjust.querySelector('#adjustbeijing')

                let arena = document.getElementById('arena')


                let at = new AnyTouch(editBox, {bubbles: false, preventDefault: true})

                editBox.style.top = '30px'
                editBox.style.right = '60px'

                at.on('panstart', () => {
                    skinSwitch.allowTouchEvent(false)
                })
                at.on('panmove', (e) => {
                    editBox.style.top = parseInt(editBox.style.top) + e.deltaY + 'px'
                    editBox.style.right = parseInt(editBox.style.right) - e.deltaX + 'px'
                    console.log('eeeeeee', e)
                })
                at.on('panend', () => {
                    skinSwitch.allowTouchEvent(true)
                })

                // 控制位置的方向键
                let adjustDirection = ui.create.div('.adjustDirection .hidden-adjust', arena)
                adjustDirection.classList.add('adjustDirection')
                adjustDirection.innerHTML = `
                    <div class="directionDiv" style="top:0;left:32.3%">
                        <button id="upbtn"><i class="up"></i></button>
                    </div>
                    <div class="directionDiv" style="top:26.3%;left:-30.3%">
                        <button id="leftbtn"><i class="left"></i></button>
                    </div>  
                    <div class="directionDiv" style="top:18.3%;left:32.3%">
                        <button id="bottombtn"><i class="down"></i></button>
                    </div>
                    <div class="directionDiv" style="top:-7%;left:23.3%">
                        <button id="rightbtn"><i class="right"></i></button>
                    </div>
                `
                let adjustXYRate = function (direction) {
                    let timeEnd, time
                    let downFunc =  function () {
                        // 改变骨骼的位置
                        //获取鼠标按下时的时间
                        time = setInterval(function () {
                            timeEnd = getTimeNow();
                            //如果此时检测到的时间与第一次获取的时间差有1000毫秒
                            let dat = currentPlay === 'daiji' || currentPlay === 'beijing' ? daijiXYPos : chukuangXYPos
                            let step = 0.01  // step暂时写死
                            switch (direction) {
                                case 'up':
                                    dat.y[1] += step
                                    dat.y[1] = Number(dat.y[1].toFixed(2))
                                    break
                                case 'left':
                                    dat.x[1] -= step
                                    dat.x[1] = Number(dat.x[1].toFixed(2))
                                    break
                                case 'bottom':
                                    dat.y[1] -= step
                                    dat.y[1] = Number(dat.y[1].toFixed(2))
                                    break
                                case 'right':
                                    dat.x[1] += step
                                    dat.x[1] = Number(dat.x[1].toFixed(2))
                                    break
                            }
                            skinSwitch.postMsgApi.adjust(player, currentPlay, {x: dat.x, y: dat.y})

                            // 改变文本值
                            if (currentPlay === 'daiji' || currentPlay === 'beijing') {
                                daijiPos.querySelector('span').innerHTML = `x:${dat.x}<br/>y:${dat.y}`
                            } else {
                                chuKuangPos.querySelector('span').innerHTML = `x:${dat.x}<br/>y:${dat.y}`
                            }
                        }, 50)


                    }
                    let holdUp = function () {
                        //如果按下时间不到1000毫秒便弹起，
                        clearInterval(time);
                    }
                    //获取此刻时间
                    let getTimeNow = function () {
                        return new Date().getTime()
                    }
                    downFunc.holdUp = holdUp

                    return downFunc

                }

                let uf = adjustXYRate('up')
                let lf = adjustXYRate('left')
                let bf = adjustXYRate('bottom')
                let rf = adjustXYRate('right')

                let downEvent =  lib.config.touchscreen ? 'touchstart' : 'mousedown'
                let upEvent =  lib.config.touchscreen ? 'touchend' : 'mouseup'

                adjustDirection.querySelector('#upbtn').addEventListener(downEvent, uf)
                adjustDirection.querySelector('#upbtn').addEventListener(upEvent, uf.holdUp)
                adjustDirection.querySelector('#leftbtn').addEventListener(downEvent, lf)
                adjustDirection.querySelector('#leftbtn').addEventListener(upEvent, lf.holdUp)
                adjustDirection.querySelector('#bottombtn').addEventListener(downEvent, bf)
                adjustDirection.querySelector('#bottombtn').addEventListener(upEvent, bf.holdUp)
                adjustDirection.querySelector('#rightbtn').addEventListener(downEvent, rf)
                adjustDirection.querySelector('#rightbtn').addEventListener(upEvent, rf.holdUp)

                // adjustDirection.querySelector('#upbtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', adjustXYRate('up'))
                // adjustDirection.querySelector('#leftbtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', adjustXYRate('left'))
                // adjustDirection.querySelector('#bottombtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click',  adjustXYRate('bottom'))
                // adjustDirection.querySelector('#rightbtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', adjustXYRate('right'))


                let updateAdjustPos = function (pos, mode) {
                    let bodyH = decadeUI.get.bodySize().height
                    let bodyW = decadeUI.get.bodySize().width
                    if (mode === 'daiji' || mode === 'beijing') {
                        if (!Array.isArray(pos.x)) {
                            // 转化为百分比
                            pos.x = [0, Number((pos.x / bodyW).toFixed(2))]
                            pos.y = [0, Number((pos.y / bodyH).toFixed(2))]
                        }
                        daijiXYPos.x = pos.x
                        daijiXYPos.y = pos.y
                    } else {
                        if (!Array.isArray(pos.x)) {
                            pos.x = [0, Number((pos.x / bodyW).toFixed(2))]
                            pos.y = [0, Number((pos.y / bodyH).toFixed(2))]
                        }
                        chukuangXYPos.x = pos.x
                        chukuangXYPos.y = pos.y
                    }
                }

                qhlxAdjust.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    // 必须保证当前已经打开了千幻的皮肤选择界面.
                    if (qhlxAdjust.isAdjust) {
                        // 判断当前是在调整页面还是在游戏画面中.
                        qhlxAdjust.isAdjust = false
                        editBox.updateGlobalParams()  // 更新一下参数状态

                        daijiAdjust.classList.remove('adjust-select')
                        chuKuangAdjust.classList.remove('adjust-select')
                        qhlxAdjust.classList.remove('adjust-select')
                        currentPlay = 'daiji'

                    } else {
                        let nodePlayer = document.getElementById('mainView')
                        if (!nodePlayer || !nodePlayer.dynamic || !nodePlayer.dynamic.primary) {
                            skinSwitchMessage.show({
                                'type': 'error',
                                'text': '必须打开皮肤预览页面且选择的是动皮才可以进行编辑调整'
                            })
                            return
                        }
                        // 停止原来的自动播放攻击动画和待机..
                        clearInterval(_status.texiaoTimer);
                        clearTimeout(_status.texiaoTimer2);

                        daijiAdjust.classList.remove('adjust-select')
                        chuKuangAdjust.classList.remove('adjust-select')
                        qhlxAdjust.classList.add('adjust-select')
                        qhlxAdjust.isAdjust = true


                        // 检查全局参数的引用是否发生变化. 如果发生变化需要进行重新初始化
                        player = nodePlayer
                        player.isQhlx = true // 表示当前动皮角色是千幻雷修版本的

                        player.GongJi = false
                        renderer = player.dynamic.renderer;
                        dynamic = player.dynamic.primary  // 这个是指代主将的sprite也就是APNode对象
                        setTimeout(() => {
                            // 给一个发消息的缓冲时间
                            getCurPosition('daiji')
                            setTimeout(() => {
                                getCurPosition('chukuang')
                            }, 100)
                        }, 100)
                    }
                })

                let getDynamicPos = function (mode, func) {
                    skinSwitch.postMsgApi.position(player, mode)
                    skinSwitch.rendererOnMessage.addListener(player, 'position', func)
                }

                let getCurPosition = function (mode) {
                    getDynamicPos(mode, function (data) {
                        if (data) {
                            updateAdjustPos(data, mode)

                            // 同时改变输入框的值
                            if (mode === 'daiji' || mode === 'beijing') {
                                daijiXPosNum.querySelector('input').value = data.x[0]
                                daijiYPosNum.querySelector('input').value = data.y[0]
                                daijiScale.querySelector('input').value = data.scale
                                if (data.angle !== undefined) {
                                    daijiAngle.querySelector('input').value = data.angle
                                } else {
                                    daijiAngle.querySelector('input').value = ''
                                }
                                daijiPos.querySelector('span').innerHTML = `x:${data.x}<br/>y:${data.y}`
                            } else {
                                chuKuangXPosNum.querySelector('input').value = data.x[0]
                                chuKuangYPosNum.querySelector('input').value = data.y[0]
                                chuKuangScale.querySelector('input').value = data.scale
                                chuKuangPos.querySelector('span').innerHTML = `x:${data.x}<br/>y:${data.y}`
                            }
                        }
                    })
                }

                let selfLoopPlay = function(mode) {

                    let canvas = player.getElementsByClassName("animation-player")[0];
                    let dynamicWrap
                    if (player.isQhlx) {
                        dynamicWrap = player.getElementsByClassName("qhdynamic-big-wrap")[0];
                    } else {
                        // if (lib.config['extension_十周年UI_newDecadeStyle'] === "on") {
                        //     dynamicWrap = player.getElementsByClassName("dynamicPlayerCanvas")[0]

                        // } else {
                            dynamicWrap = player.getElementsByClassName("dynamic-wrap")[0];
                        // }
                    }
                    if (player.isQhlx) {
                        if (document.getElementsByClassName('qhdynamic-big-wrap').length === 0) {
                            // 需要再次点击表示退出千幻动皮预览界面了.
                            skinSwitchMessage.show({
                                type: 'warning',
                                text: '请取消调整千幻状态',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                            return

                        }
                    }
                    skinSwitch.postMsgApi.debug(player, mode)
                    skinSwitch.rendererOnMessage.addListener(player, 'debugChuKuang', function (e) {
                        dynamicWrap.style.zIndex = "100";
                        canvas.style.position = "fixed";
                        canvas.style.width = "100%";

                        if (player.isQhlx) {
                            let bodyHeight = decadeUI.get.bodySize().height
                            let qhDivHeight = dynamicWrap.parentNode.parentNode.getBoundingClientRect().height
                            let top = (bodyHeight - qhDivHeight) / 2
                            canvas.style.top = -top + 'px'
                            canvas.style.height = Math.round((decadeUI.get.bodySize().height /  dynamicWrap.parentNode.parentNode.getBoundingClientRect().height * 100)) + '%'
                            player.style.zIndex = 100
                        } else {
                            canvas.style.height = "100%";
                            player.style.zIndex = 10;
                        }

                        canvas.classList.add('hidden')
                        setTimeout(() => {
                            canvas.classList.remove('hidden')
                        }, 250)
                    })

                    skinSwitch.rendererOnMessage.addListener(player, 'canvasRecover', function (e) {
                        dynamicWrap.style.zIndex = "60";
                        canvas.style.height = null;
                        canvas.style.width = null;
                        canvas.style.position = null;
                        player.style.zIndex = 4;
                        canvas.style.top = null
                    })
                    skinSwitch.rendererOnMessage.addListener(player, 'debugNoChuKuang', function (e) {
                        // 没有出框动画无法调整
                        currentPlay = 'daiji'
                        chuKuangAdjust.classList.remove('adjust-select')
                        daijiAdjust.classList.add('adjust-select')

                        skinSwitchMessage.show({
                            type: 'warning',
                            text: '当前动皮暂无出框参数',
                            duration: 1500,    // 显示时间
                            closeable: false, // 可手动关闭
                        })

                    })
                }

                let changeXYPos = function(mode, xOrY, num) {
                    return function () {
                        let v
                        let dom
                        // 只能调整当前正在播放的动画
                        if (currentPlay !== mode) {
                            if (mode === 'daiji' && currentPlay === 'beijing') {
                                mode = 'beijing'
                            } else {
                                return
                            }
                        }
                        if (mode === 'daiji' || mode === 'beijing') {
                            // 查找对应的输入框当前的值
                            if (xOrY === 'x') {
                                dom = daijiXPosNum.querySelector('input')
                                v = dom.value
                            } else {
                                dom = daijiYPosNum.querySelector('input')
                                v = dom.value
                            }
                        } else {
                            if (xOrY === 'x') {
                                dom = chuKuangXPosNum.querySelector('input')
                                v = dom.value
                            } else {
                                dom = chuKuangYPosNum.querySelector('input')
                                v = dom.value
                            }
                        }
                        v = Number(v)
                        if (isNaN(v)) {
                            skinSwitchMessage.show({
                                type: 'warning',
                                text: '输入的数不正确',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                            return
                        }
                        dom.value = v + num
                        let xyPos = {}
                        xyPos[xOrY === 'x' ? 'x': 'y'] = v + num

                        // 更新位置
                        skinSwitch.postMsgApi.adjust(player, mode, {xyPos: xyPos})

                        // 更新一下
                        setTimeout(() => {
                            getCurPosition(mode)
                        }, 100)
                    }
                }

                let changeScale = function (mode) {
                    let onBlur = function () {
                        let dom
                        let isChange = false
                        // 只能调整当前正在播放的动画
                        if (currentPlay !== mode) {
                            if (mode === 'daiji' && currentPlay === 'beijing') {
                                mode = 'beijing'
                            } else {
                                return
                            }
                        }
                        if (mode === 'daiji' || mode === 'beijing') {
                            dom = daijiScale.querySelector('input')
                            if (onBlur.value !== dom.value) {
                                onBlur.value = dom.value
                                isChange = true
                            }
                        } else {
                            dom = chuKuangScale.querySelector('input')
                            if (onBlur.value !== dom.value) {
                                onBlur.value = dom.value
                                isChange = true
                            }
                        }
                        if (isChange) {
                            let v = Number(onBlur.value)
                            if (isNaN(v)) {
                                // alert('输入的数不正确')
                                skinSwitchMessage.show({
                                    type: 'warning',
                                    text: '输入的数不正确',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                                return
                            }
                            // 更新大小
                            console.log('scale------', mode, v)
                            skinSwitch.postMsgApi.adjust(player, mode, {scale: v})
                            setTimeout(() => {
                                getCurPosition(mode)
                            }, 100)
                        }
                    }
                    onBlur.value = ''  // 第一次不赋值, 内部维护一个值, 来保存之前的输入值
                    return onBlur
                }

                let changeAngle = function (mode) {
                    let onBlur = function () {
                        let dom
                        let isChange = false
                        // 只能调整当前正在播放的动画
                        if (currentPlay !== mode) {
                            if (mode === 'daiji' && currentPlay === 'beijing') {
                                mode = 'beijing'
                            } else {
                                return
                            }
                        }
                        if (mode === 'daiji' || mode === 'beijing') {
                            dom = daijiAngle.querySelector('input')
                            if (onBlur.value !== dom.value) {
                                onBlur.value = dom.value
                                isChange = true
                            }
                        } else {
                            // dom = chuKuangScale.querySelector('input')
                            // if (onBlur.value !== dom.value) {
                            //     onBlur.value = dom.value
                            //     isChange = true
                            // }
                        }
                        if (isChange) {
                            let v = Number(onBlur.value)
                            if (isNaN(v)) {
                                skinSwitchMessage.show({
                                    type: 'warning',
                                    text: '输入的数不正确',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                                return
                            }
                            // 更新位置
                            skinSwitch.postMsgApi.adjust(player, mode, {angle: v})
                            setTimeout(() => {
                                getCurPosition(mode)
                            }, 100)
                        }
                    }
                    onBlur.value = ''  // 第一次不赋值, 内部维护一个值, 来保存之前的输入值
                    return onBlur
                }

                daijiScale.querySelector('input').onblur = changeScale('daiji')
                chuKuangScale.querySelector('input').onblur = changeScale('chukuang')
                // 待机角度调整, 出框角度暂时不调整
                daijiAngle.querySelector('input').onblur = changeAngle('daiji')

                // 增加一个新的方法, 修改全局变量, 尤其是当皮肤也进行了变化
                editBox.updateGlobalParams = function (){
                    // 检查全局参数的引用是否发生变化. 如果发生变化需要进行重新初始化
                    player = game.me
                    if (!player.dynamic) return
                    player.GongJi = false
                    renderer = player.dynamic.renderer;
                    dynamic = player.dynamic.primary  // 这个是指代主将的sprite也就是APNode对象
                    setTimeout(() => {
                        // 给一个发消息的缓冲时间
                        getCurPosition('daiji')
                        setTimeout(() => {
                            getCurPosition('chukuang')
                        }, 100)
                    }, 100)

                }

                // 给几个按钮添加移动位置事件
                daijiXPosNum.querySelector('.minus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('daiji', 'x', -1))
                daijiXPosNum.querySelector('.plus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('daiji', 'x', 1))
                daijiYPosNum.querySelector('.minus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('daiji', 'y', -1))
                daijiYPosNum.querySelector('.plus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('daiji', 'y', 1))
                chuKuangXPosNum.querySelector('.minus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('chukuang', 'x', -1))
                chuKuangXPosNum.querySelector('.plus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('chukuang', 'x', 1))
                chuKuangYPosNum.querySelector('.minus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('chukuang', 'y', -1))
                chuKuangYPosNum.querySelector('.plus').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', changeXYPos('chukuang', 'y', 1))

                playdaiji.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    selfLoopPlay('daiji')
                    if (currentPlay !== 'daiji') {
                        // 隐藏调整框
                        hide(adjustDirection)
                        chuKuangAdjust.classList.remove('adjust-select')
                        // daijiAdjust.classList.remove('adjust-select')
                        adjustdaiji.classList.remove('adjust-select')
                        adjustbeijing.classList.remove('adjust-select')
                    }
                    getCurPosition('daiji')
                    currentPlay = 'daiji'
                })

                adjustdaiji.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    // 只有当前播放动画是出框的时候才可以调整位置
                    if (currentPlay !== 'daiji') {
                        return
                    }
                    adjustdaiji.classList.add('adjust-select')
                    adjustbeijing.classList.remove('adjust-select')
                    chuKuangAdjust.classList.remove('adjust-select')

                    if (!isHide(adjustDirection)) {
                        hide(adjustDirection)
                    } else {
                        getCurPosition('daiji')
                        show(adjustDirection)
                    }

                })

                playbeijing.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    let playerParams = player.dynamic.primary.player
                    if (!playerParams.beijing) {
                        skinSwitchMessage.show({
                            type: 'warning',
                            text: '当前皮肤没有设置动态背景',
                            duration: 1500,    // 显示时间
                            closeable: false, // 可手动关闭
                        })
                        return
                    }
                    // 先获取一下背景的相关参数
                    getCurPosition('beijing')
                    selfLoopPlay('beijing')
                    if (currentPlay !== 'beijing') {
                        // 隐藏调整框
                        hide(adjustDirection)
                        chuKuangAdjust.classList.remove('adjust-select')
                        adjustdaiji.classList.remove('adjust-select')
                        adjustbeijing.classList.remove('adjust-select')
                    }
                    currentPlay = 'beijing'
                })

                adjustbeijing.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    // 只有当前播放动画是出框的时候才可以调整位置
                    if (currentPlay !== 'beijing') {
                        return
                    }
                    adjustbeijing.classList.add('adjust-select')
                    adjustdaiji.classList.remove('adjust-select')
                    chuKuangAdjust.classList.remove('adjust-select')

                    if (!isHide(adjustDirection)) {
                        hide(adjustDirection)
                    } else {
                        getCurPosition('beijing')
                        show(adjustDirection)
                    }

                })

                chuKuangEdit.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    // 先调整编辑出框
                    selfLoopPlay('chukuang')

                    if (currentPlay !== 'chukuang') {
                        // 隐藏调整框
                        hide(adjustDirection)
                        chuKuangAdjust.classList.remove('adjust-select')
                        // daijiAdjust.classList.remove('adjust-select')
                        adjustdaiji.classList.remove('adjust-select')
                        adjustbeijing.classList.remove('adjust-select')
                    }

                    currentPlay = 'chukuang'
                })

                chuKuangAdjust.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {

                    // 只有当前播放动画是出框的时候才可以调整位置
                    if (currentPlay === 'daiji') {
                        return
                    }
                    adjustdaiji.classList.remove('adjust-select')
                    adjustbeijing.classList.remove('adjust-select')
                    // daijiAdjust.classList.remove('adjust-select')
                    chuKuangAdjust.classList.add('adjust-select')

                    if (!isHide(adjustDirection)) {
                        hide(adjustDirection)
                    } else {
                        getCurPosition('chukuang')
                        show(adjustDirection)
                    }

                    // if (!isHide(adjustPos)) {
                    //     hide(adjustPos)
                    // } else {
                    //     getCurPosition('chukuang')
                    //     show(adjustPos)
                    // }
                })

                let copyToClipboard = function (data) {
                    // 保存当前动皮参数
                    let copyData = `\t\t\t\tx: [${data.x}],\n\t\t\t\ty: [${data.y}],\n`
                    if (data.angle !== undefined) {
                        copyData += `\t\t\t\tangle: ${data.angle},\n`
                    }
                    if (data.scale !== undefined) {
                        copyData += `\t\t\t\tscale: ${data.scale},\n`
                    }
                    // 复制到剪切板, 复制代码来源: https://juejin.cn/post/6844903567480848391
                    const input = document.createElement('textarea');
                    input.setAttribute('readonly', 'readonly');
                    // input.setAttribute('value', copyData);
                    input.value = copyData
                    document.body.appendChild(input);
                    if (document.execCommand('copy')) {
                        input.select()
                        document.execCommand('copy')
                        console.log('复制成功');
                    }
                    document.body.removeChild(input);
                }

                let saveToFile = function (data, mode) {
                    let primaryDynamic = player.dynamic.primary.player
                    // 比对两者, 看是否一样
                    // 查找dynamicSkin, 获取对应的key
                    let dskins = decadeUI.dynamicSkin[player.name]
                    let saveKey
                    for (let k in dskins) {
                        if (dskins[k].name === primaryDynamic.name) {
                            saveKey = k
                            break
                        }
                    }
                    data = {scale: data.scale, x: data.x, y: data.y, angle: data.angle}
                    let isWrite = false
                    // 如果当前是调整千幻雷修的情况下, 那么保存千幻雷修的相关参数
                    if (saveKey) {
                        // if (player.isQhlx && mode === 'beijing') {
                        //     skinSwitchMessage.show({
                        //         text: '暂不支持保存千幻背景参数'
                        //     })
                        //     return
                        // }

                        let modeToKey = {
                            daiji: 'daiji',
                            chukuang: 'gongji',
                            beijing: 'beijing'
                        }
                        // 比对两者的数据, 如果不一样,才进行保存
                        if (skinSwitch.saveSkinParams[player.name]) {
                            if (skinSwitch.saveSkinParams[player.name][saveKey]) {
                                let saveData = skinSwitch.saveSkinParams[player.name][saveKey]
                                // 千幻雷修就不检查重复key了, 每次都进行更新
                                if (player.isQhlx) {
                                    let k = modeToKey[mode]
                                    // let k = mode === 'daiji' ? 'daiji' : 'gongji'
                                    k = currentPlay
                                    if (saveData['qhlx']) {
                                        saveData['qhlx'][k] = data
                                    } else {
                                        saveData['qhlx'] = {}
                                        saveData['qhlx'][k] = data
                                    }
                                    isWrite = true
                                } else {
                                    for (let k in data) {
                                        if (data[k] !== undefined) {
                                            if (player.isQhlx) {
                                                // 更新新的值
                                                if (mode === 'daiji') {
                                                    if (saveData[k] === undefined || (saveData[k].toString() !== data[k].toString())) {
                                                        saveData[k] = data[k]
                                                        isWrite = true
                                                    }
                                                } else if (mode === 'beijing') {
                                                    if (!saveData.beijing) {
                                                        saveData.beijing = {}
                                                        saveData.beijing[k] = data[k]
                                                        isWrite = true
                                                    } else {
                                                        if (saveData.beijing[k] === undefined || (saveData.beijing[k].toString() !== data[k].toString())) {
                                                            saveData.beijing[k] = data[k]
                                                            isWrite = true
                                                        }
                                                    }
                                                } else {
                                                    if (!saveData.gongji) {
                                                        saveData.gongji = {}
                                                        saveData.gongji[k] = data[k]
                                                        isWrite = true
                                                    } else {
                                                        if (saveData.gongji[k] === undefined || (saveData.gongji[k].toString() !== data[k].toString())) {
                                                            saveData.gongji[k] = data[k]
                                                            isWrite = true
                                                        }
                                                    }
                                                }
                                            } else {
                                                // 更新新的值
                                                if (mode === 'daiji') {
                                                    if (saveData[k] === undefined || (saveData[k].toString() !== data[k].toString())) {
                                                        saveData[k] = data[k]
                                                        isWrite = true
                                                    }
                                                } else if (mode === 'beijing'){
                                                    if (!saveData.beijing) {
                                                        saveData.beijing = {}
                                                        saveData.beijing[k] = data[k]
                                                        isWrite = true
                                                    } else {
                                                        saveData.beijing[k] = data[k]
                                                        isWrite = true
                                                    }
                                                } else {
                                                    if (!saveData.gongji) {
                                                        saveData.gongji = {}
                                                        saveData.gongji[k] = data[k]
                                                        isWrite = true
                                                    } else {
                                                        if (saveData.gongji[k] === undefined || (saveData.gongji[k].toString() !== data[k].toString())) {
                                                            saveData.gongji[k] = data[k]
                                                            isWrite = true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (player.isQhlx) {
                                    let k = modeToKey[mode]
                                    skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                    skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'] = {}
                                    skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'][k] = data

                                } else {
                                    if (mode === 'daiji') {
                                        skinSwitch.saveSkinParams[player.name][saveKey] = data
                                    } else if (mode === 'beijing'){
                                        skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                        skinSwitch.saveSkinParams[player.name][saveKey].beijing = data
                                    } else {
                                        skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                        skinSwitch.saveSkinParams[player.name][saveKey].gongji = data
                                    }
                                    isWrite = true
                                }

                            }
                        } else {
                            skinSwitch.saveSkinParams[player.name] = {}

                            if (player.isQhlx) {
                                let k = modeToKey[mode]
                                skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'] = {}
                                skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'][k] = data

                            } else {
                                if (mode === 'daiji') {
                                    skinSwitch.saveSkinParams[player.name][saveKey] = data
                                } else if (mode === 'beijing'){
                                    skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                    skinSwitch.saveSkinParams[player.name][saveKey].beijing = data
                                } else {
                                    skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                    skinSwitch.saveSkinParams[player.name][saveKey].gongji = data
                                }
                            }
                            isWrite = true
                        }
                        if (isWrite) {
                            // 写到文件
                            let str = `window.saveFunc = function(lib, game, ui, get, ai, _status){window.skinSwitch.saveSkinParams =\n`
                            str += JSON.stringify(skinSwitch.saveSkinParams, null, 4)
                            str += '\n}'
                            game.writeFile(str, skinSwitch.path, 'saveSkinParams.js', function () {
                                console.log('写入saveSkinParams.js成功')
                                skinSwitchMessage.show({
                                    type: 'success',
                                    text: '保存成功',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                            })
                            // 修改千幻雷修版本的值
                            if (skinSwitch.saveSkinParams[player.name][saveKey].qhlx) {
                                decadeUI.dynamicSkin[player.name][saveKey].qhlx = skinSwitch.saveSkinParams[player.name][saveKey].qhlx
                            }
                        }
                    }
                }

                daijiSave.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    if (!(currentPlay === 'daiji' || currentPlay === 'beijing')) {
                        return
                    }
                    // 获取当前的位置参数
                    getDynamicPos(currentPlay, function (data) {
                        // 同时写入到文件中
                        if (data) {
                            saveToFile(data, currentPlay)
                            copyToClipboard(data)
                        }
                    })
                })
                chuKuangSave.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    if (currentPlay !== 'chukuang') {
                        return
                    }
                    // 获取当前的位置参数
                    getDynamicPos('chukuang', function (data) {
                        if (data) {
                            saveToFile(data, 'chukuang')
                            copyToClipboard(data)
                        }
                    })
                })

                // 初始化动皮相对位置.
                // adjustPos = ui.create.div('.adjust-position .hidden-adjust', ui.window)

                editBox.updateGlobalParams()
            }

            function editBoxShowOrHide() {
                // 初始化一些参数
                if (!editBox) {
                    player = game.me
                    renderer = player.dynamic.renderer;
                    dynamic = player.dynamic.primary  // 这个是指代主将的sprite也就是APNode对象
                    editBoxInit()
                    return editBox
                } else {
                    if (game.me !== player) {
                        player = game.me
                        renderer = player.dynamic.renderer;
                        dynamic = player.dynamic.primary  // 这个是指代主将的sprite也就是APNode对象
                    } else if (player.dynamic.primary !== dynamic) {
                        renderer = player.dynamic.renderer;
                        dynamic = player.dynamic.primary  // 这个是指代主将的sprite也就是APNode对象
                    }
                }
                toggleShow(editBox)
                // if (adjustPos) {
                //     hide(adjustPos)
                // }
                return editBox
            }

            function isHide(dom) {
                return dom.classList.contains('hidden-adjust')
            }

            function hide(dom) {
                if (!dom.classList.contains('hidden-adjust')) {
                    dom.classList.add('hidden-adjust')
                }
            }

            function show(dom) {
                if (dom.classList.contains('hidden-adjust')) {
                    dom.classList.remove('hidden-adjust')
                }
            }

            function toggleShow(dom) {
                if (dom.classList.contains('hidden-adjust')) {
                    dom.classList.remove('hidden-adjust')
                    skinSwitch.allowTouchEvent(false)
                } else {
                    dom.classList.add('hidden-adjust')
                    skinSwitch.allowTouchEvent(true)
                }
            }

            lib.arenaReady.push(function() { //游戏加载完成执行的内容
                //顶部菜单
                if (lib.config[skinSwitch.configKey.showEditMenu]) {
                    // 添加编辑动皮皮肤的位置和出框位置参数
                    ui.create.system('编辑动皮参数', function() {
                        setTimeout(function() {
                            if (!lib.config[skinSwitch.configKey.useDynamic]) {
                                skinSwitchMessage.show({
                                    type: 'warning',
                                    text: '请先打开动皮功能',
                                    duration: 1500,    // 显示时间
                                    closeable: false, // 可手动关闭
                                })
                                return
                            }
                            // 只能编辑自己
                            if (game.me) {
                                let player = game.me
                                if (!player.dynamic || (!player.dynamic.primary)) {
                                    // alert("只能编辑当前角色的动皮位置参数")
                                    skinSwitchMessage.show({
                                        type: 'warning',
                                        text: '只能当前角色是动皮才可编辑参数',
                                        duration: 1500,    // 显示时间
                                        closeable: false, // 可手动关闭
                                    })
                                    return
                                }
                                if (get.mode() === 'guozhan' || player.name2 !== undefined) {
                                    skinSwitchMessage.show({
                                        type: 'warning',
                                        text: '只能在单将模式下编辑参数',
                                        duration: 1500,    // 显示时间
                                        closeable: false, // 可手动关闭
                                    })
                                    return
                                }
                                // 设置一个全局变量
                                window.dynamicEditBox = editBoxShowOrHide()
                            }

                        }, 100);
                    }, true)
                }

                if (lib.config[skinSwitch.configKey.showPreviewDynamicMenu]) {
                    ui.create.system('预览spine', function() {
                        skinSwitch.previewDynamic()
                    }, true)
                }


                // 引入js
                let js = function (path, onload, onerror) {
                    if (!path) return console.error('path');

                    let script = document.createElement('script');
                    script.onload = onload
                    script.onerror = onerror || function () {
                        console.error(this.src + 'not found');
                    }
                    script.src = path
                    document.head.appendChild(script);
                }
                // <!-- 消息外层容器，因为消息提醒基本上是全局的，所以这里用id，所有的弹出消息都是需要插入到这个容器里边的 -->
                let msgContainer = ui.create.div(document.getElementById('arena'))
                msgContainer.id = 'message-container'
                js(skinSwitch.url + 'component/message.js', () => {
                    window.skinSwitchMessage = new SkinSwitchMessage()
                })

                // 在看千幻聆音代码的时候发现切换皮肤后会执行一个回调函数, 这个可以比较好的解决动静皮互相切换的问题, 只有非千幻聆音雷修版本才会触发这个回调函数
                if (lib.config[skinSwitch.configKey.useDynamic] && skinSwitch.qhly_hasExtension('千幻聆音') && !(lib.config['qhly_viewskin_css'] === 'newui_dc' ||  lib.config['qhly_viewskin_css'] === 'newui_ss')) {
                    if (!lib.qhly_callbackList) lib.qhly_callbackList = []

                    lib.qhly_callbackList.push(skinSwitch.dynamic.qhly_callback)
                }

                skinSwitch.lib = lib
                skinSwitch.game = game

                lib.init.js(skinSwitch.url, 'pfqhUtils', function () {})

            })

        },
        config:{
            //
            "GXNR": {
                "name": "更新内容",
                "init": "xin",
                "unfrequent": true,
                "item": {
                    "xin": "点击查看",
                },
                "textMenu": function (node, link) {
                    lib.setScroll(node.parentNode);
                    node.parentNode.style.transform = "translateY(-100px)";
                    node.parentNode.style.height = "200px";
                    node.parentNode.style.width = "320px";
                    switch (link) {
                        case "xin":
                            node.innerHTML = "<img style=width:100% src=" + lib.assetURL + "extension/皮肤切换/gengxin/1.06_更新.png>"
                            break;
                    }
                },
            },
            // "backupFileDui": {
            //     name: "<div><button class='engBtn' onclick='skinSwitch.backupFileDui()'>备份十周年文件</button></div>",
            //     clear: true
            // },
            // "ImportFileDui": {
            //     name: "<div><button id='importFileDui' class='engBtn' onclick='skinSwitch.modifyFileDui()'>导入十周年文件</button> </div>",
            //     clear: true
            // },
            "previewDynamic": {
                name: "<div><button onclick='skinSwitch.previewDynamic()'>预览spine动画(资源文件放入asset文件中)</button></div>",
                clear: true
            },
            "resetArchiveDynamicSkin": {
                name: "<button id='resetDynamicBtn' class='engBtn' type='button' onclick='skinSwitch.resetDynamicData()' >重置动皮存档</button>",
                intro: "当你更换的dynamicSkin.js与上一个版本内容差距较大时，需重置",
                clear: true
            },
            'closeXYPosAdjust': {
                name: "关闭位置微调",
                "init": true,
                "intro": "预览窗口空间有点不够,这个微调功能用到比较少,所以可以选择关闭",
            },
            "showEditMenu": {
                "name": "编辑动态皮肤加入顶部菜单",
                "init": false,
                "intro": "将编辑动态皮肤参数界面加入顶部菜单栏",
            },
            "showPreviewDynamicMenu": {
                name: "预览spine加入顶部菜单",
                "init": false,
                "intro": "将预览动态皮肤参数界面加入顶部菜单栏",
            },
            "hideHuanFu": {
                name: "隐藏更换动皮按钮",
                "init": false,
                "intro": "如果安装了千幻雷修,可以隐藏更换动皮按钮",
            },
            'useDynamic': {
                name: "使用出框功能",
                "init": true,
                "intro": "如果设备不支持离屏渲染或者使用EngEx或D扩展出框, 请关闭此出框功能",
            },
            'replaceDecadeAni': {
                name: "支持播放ol4.0特效",
                "init": false,
                "intro": "替换十周年UI的decadeUi.animation对象后允许播放3.8,4.0的特效",
            },
            'isAttackFlipX': {
                name: "AI出框是否翻转X轴",
                "init": false,
                "intro": "AI在屏幕左侧(中央往左小于50%)出框是否翻转X轴, 也可以在动皮参数处添加参数控制单个动皮的出框翻转",
            },
            'cugDynamicBg': {
                name: "是否裁剪动态背景",
                "init": false,
                "intro": "为了更好的适配动皮露头, 在待机处可以裁剪动态背景",
            },
            'genDynamicSkin': {
                name: "<div><button onclick='skinSwitch.genDynamicSkin()'>转换D动态参数(生成的新文件在扩展文件夹下)</button></div>",
                clear: true
            }, // generateDynamicFile
            'genDyTempFile': {
                name: "<div><button onclick='skinSwitch.genDyTempFile()'>自动生成动皮模板参数</button></div>",
                clear: true,
                info: '动皮文件夹结构是 --> 武将中文名(武将id也行)/皮肤名称/骨骼  <--- 形式的话, 可以自动根据当前已填写的参数动态生成动皮模板'
            },
            'modifyQhlxPreview': {
                name: "调整千幻大屏预览待机大小",
                init: true,
                intro: '默认的千幻大屏预览大小太大了, 我调整的小一些'
            },
            'l2dEnable': {
                name: "是否开启l2d",
                init:  false,
                intro: '添加l2d模型'
            },
            'l2dSetting': {
                "name": "live2d模型",
                "init": "dafeng_4",
                "item": {
                    dafeng_4: "dafeng_4",
                    dafeng_2: 'dafeng_2',
                    pinghai_6: 'pinghai_6',
                },
                onclick: function (value) {
                    if (!lib.config[skinSwitch.configKey.l2dEnable] || !window.pfqhLive2dSettings) {
                        return
                    }
                    if (lib.config[skinSwitch.configKey.l2dSetting] === value) {
                        return
                    }
                    // 获取当前的配置
                    let base = Object.assign({}, pfqhLive2dSettings.baseSetting)
                    for (let k in pfqhLive2dSettings.models[value]) {
                        base[k] = pfqhLive2dSettings.models[value][k]
                    }
                    base.role = lib.assetURL + base.basePath + base.role
                    base.height = base.height * decadeUI.get.bodySize().height
                    base.width = base.width * decadeUI.get.bodySize().width
                    game.saveConfig(skinSwitch.configKey.l2dSetting, value)
                    if (skinSwitch.l2dLoader) {
                        skinSwitch.l2dLoader.changeModel(base)
                    }
                },
            },
            // "adjustQhlyFact": {
            //     name: "<input id='adjustQhlyFact' onblur='skinSwitch.adjustQhlyFact(event)' style='width: 80px'>调整千幻聆音大图预览参数</input>",
            //     intro: "当使用千幻雷修版本使用大图预览的时候, 这个参数是用来调整大图预览参数的",
            //     clear: true,
            //     init: 0.85
            // },

        },
        help:{},
        package:{
            character:{
                character:{

                },
                translate:{

                },
            },
            card:{
                card:{
                },
                translate:{
                },
                list:[],
            },
            skill:{
                skill:{
                },
                translate:{
                },
            },
            intro: '<br>&nbsp;&nbsp;<font color=\"green\">&nbsp;&nbsp;1. 当前扩展可以对待机动皮和出框动皮的位置参数的调整.<br>&nbsp;&nbsp;2.可以支持手杀和十周年真动皮的出框攻击,攻击附带指示线以及十周年动皮的出场动作播放.<br>&nbsp;&nbsp;3.界面内置spine骨骼动画预览.可以把骨骼文件或文件夹塞入扩展目录下的assets即可预览<br></font><br>&nbsp;&nbsp;扩展本身拥有动静皮切换功能,其中静皮切换需要配合千幻聆音是用. 如果想是用UI更好看的动静切换功能, 请使用千幻雷修版本的动静切换。<br><br>&nbsp;&nbsp;4.现在动皮支持json的骨骼以及可以添加alpha预乘参数<br><br>&nbsp;&nbsp;最后, 感谢无名杀超市群的逝去の記憶,鹰击长空帮忙测试与提出意见',
            // intro: '<br>&nbsp;&nbsp;<font color=\"green\">&nbsp;&nbsp;初次使用请先备份并导入十周年UI的animation.js和dynamicWorker.js文件<br>&nbsp;&nbsp;1. 当前扩展可以对待机动皮和出框动皮的位置参数的调整.<br>&nbsp;&nbsp;2.可以支持手杀和十周年真动皮的出框攻击,以及十周年动皮的出场动作播放.<br>&nbsp;&nbsp;3.界面内置spine骨骼动画预览.可以把骨骼文件或文件夹塞入扩展目录下的assets即可预览<br></font><br>&nbsp;&nbsp;扩展本身拥有搬自于EngEX扩展的动皮换肤功能,但是并不支持静态皮肤切换, 完整体验需要配合千幻聆音雷修版本,支持动态静态皮肤切换. 本扩展完全兼容千幻雷修并会保持同步更新兼容。<br>&nbsp;&nbsp;注意：由于重新定义了部分函数(logSill)，会和部分扩展的部分内容相互覆盖。<br>&nbsp;&nbsp;<font color=\"red\">每次更新扩展后, 请首先重新覆盖一下原先十周年UI的dynamicWorker文件</font>',
            // intro:"基于EngEX扩展的动态换肤部分魔改.原来使用E佬写的EngEX插件自动出框非常好用,但是非常麻烦的是调整参数不方便, 于是就自己观摩E佬和特效测试扩展大佬的代码编写了调整参数这个简单的扩展\n" +
            //     "基于本人是个后端人员,审美有限(汗),所以换肤部分样式素材基本照搬E佬的EngEX扩展. 第一次写插件,应该有挺多bug,希望见谅.",
            author:"yscl",
            diskURL:"",
            forumURL:"",
            version:"1.11",
        },
        files:{"character":[],"card":[],"skill":[]}}
})

/** 1.02版本更新:
 1. 主要增加对千幻聆音雷修版本的兼容与对应功能的适配.
 原来雷修版本因为要做到通用, 所以大屏页面播放的适配头像都比较大, 我对比了手杀的动皮播放页面发现还是需要做更多的微调兼容,
 现在可以使用原来调整待机动画的方式调整大屏页面播放的大小与位置细节了.  不过需要对千幻雷修的extension.js文件做一定的修改,
 readme.md中我会详细记录如何修改以使得雷修版本比较好的进行兼容.
 2. 如果一个动皮的攻击动作有两个(比如吕绮玲的战场绝版), 可以两个动作标签都进行填写了, 这样进行攻击操作会随机播放一个动作.
 3. spine预览页面增加α预乘选项
 4. 简单的做了调整框的适配, 现在默认会关闭微调xy坐标的,实际上用到的比较少, 也是节省调整的空间.
 5. 修复了保存的一些bug
 */

/** 1.03版本更新:
 增加千幻大屏动皮出框没有调整使用雷佬默认的出框参数
 修复假动皮预览自动出框攻击的bug
 测试了8个动皮的场景, 修改部分千幻雷修代码使得兼容.
 */


/** 1.04版本更新:
 spine预览现在可以直接放进去文件夹进行预览
 原来的player.logSkill技能我是copy的游戏本体比较老的版本, 所以这个会出现一些问题, 现在补充为最新的了.
 现在支持在十周年真动皮的角色在回合开始播放出场动画, 以及十周年动皮默认原地出框和不位移(需要在dynamicSkin配置参数)

 十周年动皮细节: 出框攻击速度会提高为1.2, 出场动作会默认提高放大scale1.2倍

 */

/** 1.05版本更新:
 1. 重写了动画出框的逻辑, 现在统一把所有需要出框播放的动画放到单独的worker进行工作, 不再是原来eng的出框原理了, 不会再复现一瞬间闪屏的问题.
 2. 十周年UI文件不再需要导入, 现在十周年UI版本随意, 已经测试了最新的showK版本的十周年Ui, 没有出现问题.
 3. 十周年样式下出框背景不再会被覆盖.
 4. 所有动皮的出框播放速度默认为1.2
 5. 千幻聆音雷修版本的手杀大屏预览的播放出框动画做了优化, 默认显示的更加完美, 基本不用进行调整
 */

/** 1.06版本更新:
 1. 修复了reinit函数没有传player函数导致一些会变身技能的角色初始化报错问题
 2. 瓜佬的限定技特效等需要读取动皮的皮肤放到框内, 适配了这一逻辑, 防止读取不到皮肤的问题.
 3. 配合千幻雷修1.64版本增加了手杀大屏播放出框允许反转的功能.
 4. 增加了出场可以使用待机皮肤进行出场代替.

 */

/** 1.07版本更新
  1. 修复teshu出框还是会盖住背景的bug. 其实是自己手误写错了
  2. 修复双将模式下,更换同样动皮皮肤会导致位置偏移的问题
  3. 基于原来做了一个简陋的更换所有人动皮的功能, 可以自由切换所有角色的动皮(千幻雷修简化版本).
     静皮位置现在就是读取千幻存放静皮的位置. 名字与动皮一致,png,jpg皆可
  4. 可以配合原版千幻聆音使用, 现在可以使用原版千幻聆音切换静皮. 当然使用千幻雷修版本的不受影响.
  5. 预览界面增加了播放速度等调整功能.
  6. 增加出框的规则, 可以连续攻击, 重置之前的攻击动作而不会回框. 如果本次的出框动作和上次不一样, 那么会等待上次出框完成才会继出框.
 */

/** 1.07.1版本更新
 1. 手杀背景标签也有多个标签, 可以由出场自动切换到待机(背景)
 2. 可以调整手杀背景位置大小参数了.
 */

/** 1.08版本更新
 1. 修复双将模式下的背景问题. 现在双将模式下如果都有动态背景的话, 会使用各自的背景, 而不会互相覆盖.  当然静态背景还是只会使用一个
 2. 千幻大屏预览下, 可以进行调整背景.
 3. 国战双将模式下, 显示武将问题修复, 层级问题修复. (千幻雷修的手杀和十周年套装下, 动皮即使是暗将也会直接显示(千幻bug))
 */

/** 1.09版本更新
 1. 修复本体版本在1.9.117.2后logSkill问题, 需要更改十周年UI几行代码兼容.
 2. 待机和背景标签大小写忽略.
 3. 现在可以关闭动皮功能, 只保留骨骼预览的功能.
 */

/** 1.10版本更新
 1. 修复logSkill bug, 让技能在释放前触发特殊动画
 2. 添加指示线测试. 暂时效果不算很好, 比较乱
 3. 预览spine功能添加动画时间显示
 */

/** 1.11版本更新
 1. 指示线能正确指示武将框中央.
 2. 将十周年worker的文件放到自己这边进行管理, 以后不用进行替换十周年文件替换了
 3. 增加将动皮音效放入十周年文件夹动皮同文件下, 也ok
 4. 可以使用json骨骼作为待机骨骼, 可以使用需要alpha预乘的骨骼
 6. 增加开局和回合开始结束检查角色的框是否正确. 修复界左慈这类可以变换势力的武将
 7. 预览spine添加鼠标控制以及滑动控制大小位置, 双指捏合放大缩小
 8. 修复动皮出框可能抽搐(极短时间内连续出框)的问题
*/

/** 1.11.1与1.11.2版本更新
 1. 骨骼预览判断更完整, 防止报错
 2. 骨骼预览图层关闭bug
 3. 手杀骨骼连续出框抽搐抖动问题
 4. 修复ani文件修改导致位置偏移bug

 */

/** 1.12版本更新
 1. 更新4.0骨骼预览
 2. 修复晋武将会显示的bug
 3. 添加ai攻击翻转参数, 根据当前是否在屏幕中央的左侧, 是就就行翻转
 4. 修复出框模糊问题 (添加dpr适配就行)
 5. 手机预览骨骼时稍微增加下间隙.

 */

/** 1.13版本更新
 1. 增加了3.8和4.0骨骼在游戏内的支持
 2. 预览同步更新了3.8骨骼的预览
 3. 指示线攻击方式稍微做了修改.

 */

/** 1.14版本更新
 1. 增加d动态皮肤参数转化
 2. 修复4.0和3.8无法clip和hide slots的问题. 模仿3.6的做法
 3. 添加长按骨骼更换骨骼皮肤.
 4. 指示线增加非攻击角色也可以添加
 5. 可以主动攻击不出框
 6. 添加待机可以指定骨骼的皮肤, 出框也可以指定.
 */

/** 1.15版本更新
 1. 修复d动态皮肤参数转换错误
 2. 修复4.0和3.8clip slots报错bug
 3. 支持播放spine 4.0特效
 */

/** 1.16版本更新
 1. 添加动态生成模板参数, 已经有的不会继续添加
 2. 骨骼动画现在可以任意版本进行混用
 3. 修改预览页面, 可以指定文件夹
 4. 调整骨骼位置可以长按十字键修改, 并且可以拖动编辑显示框
 5. l2d尝试, 卡的话关闭该功能即可.
 */