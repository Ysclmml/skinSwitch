game.import("extension",function(lib,game,ui,get,ai,_status) {
    return {
        name: "皮肤切换",
        content:function(config,pack) {
            // 首先需要覆盖十周年UI的动皮初始化功能
            if (!lib.config[skinSwitch.decadeKey.enable] && !lib.config[skinSwitch.decadeKey.dynamicSkin]) {
                console.log('必须安装启用十周年UI与十周年动皮')
                return
            }
            // if (!lib.config[skinSwitch.configKey.bakeup]) {
            // alert('皮肤切换需要先在设置里导入备份十周年文件')
            // console.log('皮肤切换需要先在设置里导入备份十周年文件')
            // return
            // }
            // 根据本地的存储内容, 更改十周年UI的skinDynamic的数据
            function updateDecadeDynamicSkin() {

                if (!window.decadeUI || !decadeUI.dynamicSkin) {
                    // 等200毫秒继续加载
                    console.log('重新等待十周年UI加载完成')
                    setTimeout(() => {
                        updateDecadeDynamicSkin()
                    }, 200)
                } else{
                    console.log('加载成功')
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
                                decadeUI.dynamicSkin[k][m] = Object.assign(decadeUI.dynamicSkin[k][m], skinSwitch.saveSkinParams[k][m])
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
                if (lib.config[skinSwitch.decadeKey.dynamicSkin]) {
                    if (self.OffscreenCanvas === undefined) {
                        alert("您的设备环境不支持新版手杀动皮效果，请更换更好的设备或者不使用此版本的手杀动皮效果");
                        // game.saveConfig('extension_EngEX_SSSEffect', false);
                    } else {

                        // 拦截原来的logSkill函数, 加上如果使用非攻击技能,就播放特殊动画
                        lib.element.player.logSkill = function (name, targets, nature, logv) {
                            // 播放角色使用非攻击技能的特殊动画
                            if (game.phaseNumber > 0) {
                                if (name.indexOf("_") !== 0 && skinSwitch.filterSkills.indexOf(name) === -1 || this.skills.indexOf(name) !== -1) {
                                    if (this.isAlive() && this.dynamic && !this.GongJi) {
                                        skinSwitch.postMsgApi.actionTeShu(this)
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

                        lib.skill._gj = {
                            trigger: {player: 'useCardBefore'},
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
                                player.GongJi = true;
                                // 判定当前是否可以攻击, 可能是国战有隐藏武将
                                console.log('gongji====', Object.assign({}, player))
                                let res = skinSwitch.dynamic.checkCanBeAction(player);
                                if (!res) return player.GongJi = false;
                                else {
                                    skinSwitch.postMsgApi.actionGongJi(player)

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
                                return !(get.mode() == 'guozhan' || player.name2 != undefined) && player == game.me && !player.storage._hf >= 1;
                            },
                            content: function () {
                                let skins
                                if (player.name === "unknown" && player.name1) {
                                    skins = decadeUI.dynamicSkin[player.name1];
                                } else {
                                    skins = decadeUI.dynamicSkin[player.name];
                                }
                                if (!skins) return;
                                let keys = Object.keys(skins);
                                if (keys.length < 2) return;
                                // 创建换肤按钮, 也就是右上角的换肤功能.
                                let div = ui.create.div('.switchSkinButton', ui.arena);
                                div.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                                    skinSwitch.dynamic.skinDivShowOrHide(true);
                                    game.playAudio("..", "extension", "皮肤切换/audio/game", "Menu.mp3");
                                })
                                let hf = skinSwitch.huanfu;
                                // 播放换肤动画
                                dcdAnim.loadSpine(hf.name, "skel");
                                skinSwitch.dynamic.initSwitch(player, skins);
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
                                skinSwitch.postMsgApi.actionTeShu(player)
                            }
                        }

                        lib.skill._checkDynamicShenYh = {
                            trigger: {
                                global: 'gameStart'
                            },
                            forced: true,
                            filter: function (event, player) {
                                return !player.doubleAvatar && player.dynamic && !(lib.config[skinSwitch.decadeKey.newDecadeStyle] === "on");
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

                        lib.skill._setDoubleAvatarBackground = {
                            trigger: {
                                global: 'gameStart'
                            },
                            forced: true,
                            filter: function (event, player) {
                                return get.mode() != 'guozhan' && player.name2 && player.dynamic;
                            },
                            content: function () {
                                let str = ['primary', 'deputy'];
                                for (let i = 0; i < 2; i++) {
                                    if (player.dynamic[str[i]] && !player.isUnseen(i)) {
                                        skinSwitch.dynamic.setBackground(str[i], player);
                                    }
                                }
                            }
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
                                MAX_DYNAMIC = decadeUI.isMobile() ? 2 : 10;
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

                                    this.playDynamic(skin, i === 1);
                                    if (!this.doubleAvatar && !isHide) {
                                        this.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                                    }
                                    if (!increased) {
                                        increased = true;
                                        decadeUI.CUR_DYNAMIC++;
                                    }
                                }
                                if (this.doubleAvatar) {
                                    let e = this.getElementsByClassName("dynamic-wrap");
                                    if (e.length > 0) {
                                        if (get.mode() === "guozhan") e[0].style.display = "none";
                                        e[0].style.height = "100%";
                                        e[0].style.borderRadius = "0";
                                    }

                                }
                                var forces = lib.character[character][1];
                                if (!this.doubleAvatar && !(lib.config[skinSwitch.decadeKey.newDecadeStyle] === "on") && this.getElementsByClassName("skinYh").length < 1 && y && forces != "shen") {
                                    var yh = skinSwitch.createYH(forces);
                                    this.appendChild(yh);
                                }
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

                            var result = this._super.init.apply(this, arguments);
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

                        Player.reinit = function (from, to, maxHp, online) {
                            var info1 = lib.character[from];
                            var info2 = lib.character[to];
                            var smooth = true;
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
                                if (this.name2 == from) primary = false;
                                else deputy = false;
                                if (this.dynamic) {
                                    this.stopDynamic(primary, deputy);
                                    decadeUI.CUR_DYNAMIC--;
                                }
                                if (skin) {
                                    this.playDynamic(skin, deputy);
                                    decadeUI.CUR_DYNAMIC++;
                                    skinSwitch.dynamic.setBackground(deputy ? "deputy" : "primary", this);
                                }
                            } else {
                                let isYh = this.getElementsByClassName("skinYh");
                                if (this.dynamic) {
                                    this.stopDynamic();
                                    decadeUI.CUR_DYNAMIC--;
                                }
                                if (skin) {
                                    this.playDynamic(skin, false);
                                    decadeUI.CUR_DYNAMIC++;
                                    this.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                                    if (isYh.length < 1) {
                                        let yh = skinSwitch.createYH(this.group);
                                        this.appendChild(yh);
                                    }
                                } else {
                                    if (isYh.length > 1) isYh[0].remove();
                                }
                            }
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
                                        }
                                    } else if (e === "unseen2") {
                                        if (that.dynamic.deputy) {
                                            skinSwitch.dynamic.setBackground("deputy", that);
                                            post(that.dynamic.deputy.id);
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
                    }
                }
                overrides(lib.element.player, Player);
                // ======== 替换结束 ========

            }
            function overrides (dest, src) {
                if (!dest._super) dest._super = {};
                for (let key in src) {
                    if (dest[key])
                        dest._super[key] = dest[key];

                    dest[key] = src[key];
                }
            }
            modifyDecadeUIContent()
            updateDecadeDynamicSkin()
        },
        precontent:function() {
            window.skinSwitch = {
                name: "皮肤切换",
                version: 1.01,
                url: lib.assetURL + "extension/皮肤切换/",
                path: 'extension/皮肤切换',
                dcdPath: 'extension/十周年UI',
                dcdUrl: lib.assetURL + "extension/十周年UI",
                configKey: {
                    'bakeup': 'extension_皮肤切换_bakeup', // 备份与替换十周年文件数据
                    'dynamicSkin': 'extension_皮肤切换_dynamicSkin', // 保存选择的皮肤的历史数据
                    'showEditMenu': 'extension_皮肤切换_showEditMenu', // 是否加入顶部菜单
                    'showPreviewDynamicMenu': 'extension_皮肤切换_showPreviewDynamicMenu', // 预览是否加入顶部菜单
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
                getCoordinate: function (domNode, subtr) {
                    if (!domNode && !decadeUI) return false;
                    var rect = domNode.getBoundingClientRect();
                    return {
                        x: rect.left,
                        y: decadeUI.get.bodySize().height - (subtr ? rect.bottom : 0),
                        width: rect.width,
                        height: rect.height
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
                        let files = ['animation.js', 'dynamicWorker.js', 'extension.js']
                        let tasks = files.length
                        let current = 0

                        skinSwitch.addProgress(progressBar, current, tasks)

                        // 如果已经备份过, 就不重新备份了
                        if (!lib.config[skinSwitch.configKey.bakeup]) {
                            for (let f of files) {
                                skinSwitch.backupFileDui(skinSwitch.dcdPath, f, function () {
                                    skinSwitch.addProgress(progressBar, ++current, tasks)
                                })
                            }
                        }

                        // 修改十周年文件.
                        // 将本地的worker文件copy,
                        let cpWorkerFiles = ['dynamicWorker.js', 'extension.js', 'animation.js']
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
                                        }, 2000)
                                    }
                                })
                            })
                        })
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
                            var ps = lib.config[skinSwitch.configKey.dynamicSkin][playerName]
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
                    let imgurl = skinSwitch.url + "/images/border/" + group + ".png"
                    yh.src = imgurl;
                    yh.onerror = function () {
                        yh.src = skinSwitch.url + "images/border/weizhi.png"
                        this.onerror = null;
                        return true;
                    }
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
                    'bagua_skill'
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
                    selectSkin: function (e) {
                        game.playAudio("..", "extension", "皮肤切换/audio/game", "Notice02.mp3");
                        let temp = skinSwitch.selectSkinData.temp;
                        if (temp === "") {
                            skinSwitch.selectSkinData.temp = e;
                            skinSwitch.selectSkinData.value = e.alt
                            return
                        }
                        if (temp != e) {
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
                                player.playDynamic(skin, false);
                                player.$dynamicWrap.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
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
                                }, 5000);
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
                    setBackground : function (avatar,player) {
                        var skin = player.dynamic[avatar];
                        obj = player.getElementsByClassName(avatar + "-avatar")[0];
                        obj.style.backgroundImage = 'url("' + lib.assetURL + 'extension/十周年UI/assets/dynamic/' + skin.background + '")';
                        obj.style.zIndex = 7;
                        obj.style.backgroundPosition = "bottom";
                        obj.style.backgroundSize = "100% 93.5%";
                        obj.style.opacity = 1;
                    },
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
                            dynamicWrap = player.getElementsByClassName("dynamic-wrap")[0];
                        }
                        skinSwitch.rendererOnMessage.addListener(player, 'chukuangFirst', function (data) {
                            // 直接设置属性, 第一优先生效, 这里播放攻击动画, 调整播放canvas的位置, 不再跟随皮肤框,也就是动皮出框
                            dynamicWrap.style.zIndex = "64";
                            canvas.style.position = "fixed";
                            canvas.style.height = "100%";
                            canvas.style.width = "100%";
                            if (!player.isQhlx) {
                                player.style.zIndex = 10;
                            } else {
                                player.style.zIndex = 64  // 防止遮住血量
                            }
                            // 防止闪烁,
                            canvas.classList.add('hidden')
                            // setTimeout(() => {
                            //     canvas.classList.remove('hidden')
                            // }, 250)
                        })

                        skinSwitch.rendererOnMessage.addListener(player, 'canvasRecover', function (data) {
                            dynamicWrap.style.zIndex = "60";
                            canvas.style.height = null;
                            canvas.style.width = null;
                            canvas.style.position = null;
                            if (player.isQhlx) {
                                player.style.zIndex = 62;
                                dynamicWrap.style.zIndex = "62"
                                player.style.zIndex = 62
                            }
                            else player.style.zIndex = 4;
                            player.GongJi = false;
                        })

                        skinSwitch.rendererOnMessage.addListener(player, 'chukuangSecond', function (data) {
                            // 这里表示动画已经准备好了, 可以显示
                            setTimeout(()=>{
                                canvas.classList.remove('hidden')
                            }, 100)

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
                     * 请求worker播放对应的动画
                     * @param player  当前player对象, 自己就是game.me
                     * @param action  播放对应的动画action名称, TeShu/GongJi
                     * @constructor
                     */
                    action: function (player, action) {
                        let res = skinSwitch.dynamic.checkCanBeAction(player)
                        let pp = skinSwitch.getCoordinate(player, true)
                        let me = player === game.me
                        if (player.isQhlx) me = true
                        if (res && res.dynamic) {
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
                        let _this = this
                        if (r) {
                            skinSwitch.rendererOnMessage.addListener(player, 'teshuChuKuang', function (data) {
                                if (data.chukuang) {
                                    this._onchangeDynamicWindow(player, r)
                                }
                            }, this)
                        }
                    },
                    actionGongJi: function(player) {
                        let r = this.action(player, 'GongJi')
                        if (r) {
                            this._onchangeDynamicWindow(player, r)
                        }
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
                    },
                    show: function (player, skinId) {
                        if (!(player.dynamic && player.dynamic.primary)) {
                            skinSwitchMessage.show({
                                type: 'error',
                                text: '只有当前角色是动皮时才可以编辑动皮参数',
                                duration: 1500,    // 显示时间
                                closeable: false, // 可手动关闭
                            })
                        }
                        player.dynamic.renderer.postMessage({
                            message: 'SHOW',
                            id: player.dynamic.id,
                            skinID: skinId
                        });
                    }
                },
                // 这个就是官方spine的demo拿来简单修改修改, 做一个简单的preview预览页面
                previewDynamic: function () {
                    let previewWindow = ui.create.div('.previewWindow', ui.window)
                    previewWindow.id = 'previewWindowDiv'
                    previewWindow.style = `background: rgb(60,60,60);z-index: 99999;position: fixed; width: 100%; height: 100%;`
                    previewWindow.innerHTML = `
                    <style>
                        #preview-canvas { position: absolute; width: 100% ;height: 100%; }
                        .previewWindow span {display: inline-block; margin-left: 20px}
                    </style>
                    <canvas id="preview-canvas"></canvas>
                    <div style="color: #fff; position: absolute; top: 0; left: 30px;">
                        <span style="font-weight: bold">spine动画预览窗口</span>
                        <span>骨骼:</span><select id="skeletonList"></select>
                        <span>动画标签:</span><select id="animationList"></select>
                        <span>Debug:</span><input type="checkbox" id="debug">
                        <span>大小:<input id="scale" type="number" value="0.5" step="0.05"></span>
                        <span>x: <input id="posX" type="number" value="0.5" step="0.05"></span>
                        <span>y: <input id="posY" type="number" value="0.5" step="0.05"></span>
                        <span id="closePreviewWindow">关闭预览窗口</span>
                    </div>
                    `
                    let canvas;
                    let gl;
                    let shader;
                    let batcher;
                    let mvp = new spine.webgl.Matrix4();
                    let skeletonRenderer;
                    let assetManager;
                    let debugRenderer;
                    let shapes;
                    let lastFrameTime;
                    let skeletons = {};
                    let activeSkeleton = "";
                    let loadSkels = {}

                    let isClosed = false   // 全局信号, 通知关闭, 停止渲染

                    document.getElementById('closePreviewWindow').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                        // 删除自己当前节点即可
                        let self = document.getElementById('previewWindowDiv')
                        let parent = self.parentElement
                        // 停止当前的render
                        isClosed = true
                        setTimeout(() => {
                            // 延时删除节点, 等待最后一次渲染完成
                            parent.removeChild(self)
                        }, 200)
                    })

                    function init () {
                        // Setup canvas and WebGL context. We pass alpha: false to canvas.getContext() so we don't use premultiplied alpha when
                        // loading textures. That is handled separately by PolygonBatcher.
                        canvas = document.getElementById("preview-canvas");
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                        // gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
                        let config = { alpha: true };
                        gl = canvas.getContext('webgl', config) || canvas.getContext('experimental-webgl', config);
                        if (!gl) {
                            alert('WebGL初始化失败')
                            return;
                        }

                        // Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
                        shader = spine.webgl.Shader.newTwoColoredTextured(gl);
                        batcher = new spine.webgl.PolygonBatcher(gl);
                        mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
                        skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
                        assetManager = new spine.webgl.AssetManager(gl, skinSwitch.url + 'assets/');

                        // Create a debug renderer and the ShapeRenderer it needs to render lines.
                        debugRenderer = new spine.webgl.SkeletonDebugRenderer(gl);
                        debugRenderer.drawRegionAttachments = true;
                        debugRenderer.drawBoundingBoxes = true;
                        debugRenderer.drawMeshHull = true;
                        debugRenderer.drawMeshTriangles = true;
                        debugRenderer.drawPaths = true;
                        debugShader = spine.webgl.Shader.newColored(gl);
                        shapes = new spine.webgl.ShapeRenderer(gl);

                        // Tell AssetManager to load the resources for each skeleton, including the exported .skel file, the .atlas file and the .png
                        // file for the atlas. We then wait until all resources are loaded in the load() method.

                        // 动态的获取放入asset文件夹下的所有文件, 然后下拉进行预览
                        game.getFileList(skinSwitch.path + '/assets', function (folds, files) {
                            let arr = Array.from(files);
                            let skels = {}
                            arr.forEach(file => {
                                let name = file.substring(0, file.lastIndexOf("."))
                                let ext = file.substring(file.lastIndexOf(".")+1)
                                if (!(name in skels)) {
                                    skels[name] = {}
                                }
                                skels[name][ext] = file

                            })
                            // 加载所有骨骼
                            for (let k in skels) {
                                let values = skels[k]
                                if ('atlas' in values && 'json' in values) {
                                    assetManager.loadText(values['json']);
                                    assetManager.loadTextureAtlas(values['atlas']);
                                    loadSkels[k] = 'json'
                                } else if ('atlas' in values && 'skel' in values) {
                                    assetManager.loadBinary(values['skel']);
                                    assetManager.loadTextureAtlas(values['atlas']);
                                    loadSkels[k] = 'skel'
                                }
                            }
                            requestAnimationFrame(load)
                        })

                        document.getElementById('scale').oninput = function (e) {
                            let v = e.srcElement.value
                            skeletons[activeSkeleton].previewParams.scale = v
                        }
                        document.getElementById('posX').oninput = function (e) {
                            let v = e.srcElement.value
                            skeletons[activeSkeleton].previewParams.posX = v
                        }
                        document.getElementById('posY').oninput = function (e) {
                            let v = e.srcElement.value
                            skeletons[activeSkeleton].previewParams.posY = v
                        }

                    }

                    function load () {
                        // Wait until the AssetManager has loaded all resources, then load the skeletons.
                        if (assetManager.isLoadingComplete()) {

                            let i = 0
                            // 保存所有的骨骼数据
                            for (let k in loadSkels) {
                                if (i === 0 ){
                                    activeSkeleton = k
                                    i++
                                }
                                skeletons[k] = loadSkeleton(k, loadSkels[k])
                                skeletons[k].previewParams = {scale: 0.5, posX: 0.5, posY: 0.5}
                            }
                            setupUI();
                            lastFrameTime = Date.now() / 1000;
                            resize();
                            requestAnimationFrame(render); // Loading is done, call render every frame.
                        } else {
                            requestAnimationFrame(load);
                        }
                    }

                    function loadSkeleton (name, type) {

                        // Load the texture atlas using name.atlas from the AssetManager.
                        let atlas = assetManager.get(name + ".atlas");

                        // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
                        let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

                        // Create a SkeletonBinary instance for parsing the .skel file.
                        let skeletonBinary = new spine.SkeletonBinary(atlasLoader);

                        // Set the scale to apply during parsing, parse the file, and create a new skeleton.
                        skeletonBinary.scale = 1;
                        let skeletonData
                        if (type === 'json') {
                            skeletonData = 	new spine.SkeletonJson(atlasLoader).readSkeletonData(assetManager.get(name + ".json"));
                        } else {
                            skeletonData = skeletonBinary.readSkeletonData(assetManager.get(name + ".skel"));
                        }
                        let skeleton = new spine.Skeleton(skeletonData);
                        skeleton.setSkinByName('default');
                        let bounds = calculateSetupPoseBounds(skeleton);

                        // Create an AnimationState, and set the initial animation in looping mode.
                        let animationStateData = new spine.AnimationStateData(skeleton.data);
                        let animationState = new spine.AnimationState(animationStateData);

                        // 默认第一个动画
                        let initialAnimation = skeleton.data.animations[0].name

                        animationState.setAnimation(0, initialAnimation, true);
                        animationState.addListener({
                            start: function(track) {
                                // console.log("Animation on track " + track.trackIndex + " started");
                            },
                            interrupt: function(track) {
                                // console.log("Animation on track " + track.trackIndex + " interrupted");
                            },
                            end: function(track) {
                                // console.log("Animation on track " + track.trackIndex + " ended");
                            },
                            disposed: function(track) {
                                // console.log("Animation on track " + track.trackIndex + " disposed");
                            },
                            complete: function(track) {
                                // console.log("Animation on track " + track.trackIndex + " completed");
                            },
                            event: function(track, event) {
                                // console.log("Event on track " + track.trackIndex + ": " + JSON.stringify(event));
                            }
                        })

                        // Pack everything up and return to caller.
                        return { skeleton: skeleton, state: animationState, bounds: bounds};
                    }

                    function calculateSetupPoseBounds(skeleton) {
                        skeleton.setToSetupPose();
                        skeleton.updateWorldTransform();
                        var offset = new spine.Vector2();
                        var size = new spine.Vector2();
                        skeleton.getBounds(offset, size, []);
                        return { offset: offset, size: size };
                    }

                    function setupUI () {
                        let skeletonList = document.getElementById('skeletonList')
                        for (let skeletonName in skeletons) {
                            let option = document.createElement('option')
                            option.setAttribute('value', skeletonName)
                            option.text = skeletonName
                            if (skeletonName === activeSkeleton)  option.setAttribute('selected', 'selected')
                            skeletonList.options.add(option)
                        }
                        let setupAnimationUI = function() {
                            let animationList = document.getElementById('animationList')
                            animationList.options.length = 0
                            if (!activeSkeleton) {
                                return
                            }
                            let skeleton = skeletons[activeSkeleton].skeleton;
                            let state = skeletons[activeSkeleton].state;
                            let activeAnimation = state.tracks[0].animation.name;
                            for (let i = 0; i < skeleton.data.animations.length; i++) {
                                let name = skeleton.data.animations[i].name;
                                let option = document.createElement('option')
                                option.setAttribute('value', name)
                                option.text = name
                                if (name === activeAnimation) option.setAttribute('selected', 'selected')
                                animationList.options.add(option)
                            }

                            animationList.onchange =function() {
                                let state = skeletons[activeSkeleton].state;
                                let skeleton = skeletons[activeSkeleton].skeleton;
                                let animationName = animationList.options[animationList.selectedIndex].text
                                skeleton.setToSetupPose();
                                state.setAnimation(0, animationName, true);
                            }
                        }

                        skeletonList.onchange = function() {
                            activeSkeleton = skeletonList.options[skeletonList.selectedIndex].text
                            // 输入框的值也改成存储的值
                            console.log('skeletons...', skeletons)
                            document.getElementById('scale').value = skeletons[activeSkeleton].previewParams.scale
                            document.getElementById('posX').value = skeletons[activeSkeleton].previewParams.posX
                            document.getElementById('posY').value = skeletons[activeSkeleton].previewParams.posY
                            setupAnimationUI();
                        }
                        setupAnimationUI();
                    }

                    // spine动画本质就是不断的调用render函数重新渲染. 根据每一次的delta差值计算出当前帧应该渲染什么画面
                    let render = function () {
                        if (isClosed) return

                        var now = Date.now() / 1000;
                        var delta = now - lastFrameTime;
                        lastFrameTime = now;

                        // Update the MVP matrix to adjust for canvas size changes
                        resize();

                        // gl.clearColor(0.3, 0.3, 0.3, 1);
                        gl.clearColor(0, 0, 0, 0);
                        gl.clear(gl.COLOR_BUFFER_BIT);
                        // gl.clear(gl.COLOR_BUFFER_BIT);

                        // Apply the animation state based on the delta time.
                        var skeleton = skeletons[activeSkeleton].skeleton;
                        var state = skeletons[activeSkeleton].state;
                        var bounds = skeletons[activeSkeleton].bounds;
                        state.update(delta);
                        state.apply(skeleton);
                        skeleton.updateWorldTransform();

                        gl.enable(gl.SCISSOR_TEST);
                        gl.scissor(0, 0, canvas.width, canvas.height);

                        // Bind the shader and set the texture and model-view-projection matrix.
                        shader.bind();
                        shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);

                        shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);

                        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
                        batcher.begin(shader);

                        skeleton.opacity = 1

                        // skeletonRenderer.premultipliedAlpha = true;
                        // console.log(skeleton)
                        skeletonRenderer.draw(batcher, skeleton);
                        batcher.end();

                        shader.unbind();

                        // Draw debug information.
                        let debug = document.getElementById('debug').checked
                        if (debug) {
                            debugShader.bind();
                            debugShader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);
                            // debugRenderer.premultipliedAlpha = premultipliedAlpha;
                            shapes.begin(debugShader);
                            debugRenderer.draw(shapes, skeleton);
                            shapes.end();
                            debugShader.unbind();
                        }
                        gl.disable(gl.SCISSOR_TEST);
                        requestAnimationFrame(render);
                    }

                    function resize () {
                        let w = canvas.clientWidth;
                        let h = canvas.clientHeight;
                        if (canvas.width != w || canvas.height != h) {
                            canvas.width = w;
                            canvas.height = h;
                        }

                        // Calculations to center the skeleton in the canvas.
                        let bounds = skeletons[activeSkeleton].bounds;
                        let skeleton = skeletons[activeSkeleton]
                        // var centerX = bounds.offset.x + bounds.size.x / 2;
                        // var centerY = bounds.offset.y + bounds.size.y / 2;
                        // var scaleX = bounds.size.x / canvas.width;
                        // var scaleY = bounds.size.y / canvas.height;
                        // var scale = Math.max(scaleX, scaleY) * 1.2;
                        // if (scale < 1) scale = 1;
                        // var width = canvas.width * scale;
                        // var height = canvas.height * scale;

                        // 这个函数的作用: https://blog.csdn.net/FrankieWang008/article/details/7003961  https://www.cnblogs.com/yangxiaoluck/archive/2012/02/22/2363124.html
                        // 正射投影，又叫平行投影。 正射投影的最大一个特点是无论物体距离相机多远，投影后的物体大小尺寸不变
                        // 定义裁剪面,裁剪面中心
                        // mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
                        gl.viewport(0, 0, canvas.width, canvas.height);

                        // 获取输入的属性
                        let scale = Number(skeleton.previewParams.scale) || 0.5
                        let posX = Number(skeleton.previewParams.posX) || 0.5
                        let posY = Number(skeleton.previewParams.posY) || 0.5

                        mvp.ortho2d(0, 0, canvas.width, canvas.height);
                        mvp.translate(canvas.width*posX, posY * canvas.height, 0)
                        mvp.scale(scale, scale, 0)


                        // console.log(bounds, centerX, centerY,  centerX - width / 2, centerY - height / 2, width, height)
                        // 参数X，Y指定了视见区域的左下角在窗口中的位置，一般情况下为（0，0），Width和Height指定了视见区域的宽度和高度
                        // 这个函数的作用是将裁剪面投影的图像显示在整个屏幕上, 左下角是opengl定义的坐标原点. 后面两个参数定义的是显示区域也就是屏幕的宽和高
                        // gl.viewport(0, 0, canvas.width / 2, canvas.height);
                        // gl.viewport(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2);

                    }
                    init()

                }
            };
            window.eng = window.skinSwitch

            skinSwitch.dynamic.selectSkin.cd = true;

            lib.init.css(skinSwitch.url + "style", "base")
            lib.init.css(skinSwitch.url + "style", "dynamic")
            lib.init.css(skinSwitch.url + "style", "edit")
            lib.init.css(skinSwitch.url + "component", "iconfont")
            lib.init.css(skinSwitch.url + "component", "message")
            lib.init.js(skinSwitch.url, 'saveSkinParams', function() {
                window.saveFunc(lib, game, ui, get, ai, _status);
            }, function() {
                skinSwitchMessage.show({
                    type: 'error',
                    text: '皮肤切换加载savePos.js失败！',
                    duration: 1500,    // 显示时间
                    closeable: false, // 可手动关闭
                })
                // alert("皮肤切换加载savePos.js失败！");
            });



            let editBox  // 编辑动皮参数的弹窗
            let adjustPos  // 显示动画的相对位置. 这个是相对全局window, 用于辅助调试pos位置
            let player   // 当前角色
            let dynamic   // 当前角色的apnode对象, 包含皮肤id
            let renderer  // 当前动皮与worker的通信中继

            // 创建UI
            function editBoxInit() {
                if (editBox) return

                editBox = ui.create.div('.editDynamic', ui.window)
                let daijiGroup = ui.create.div('.group', editBox)
                let chukuangGroup = ui.create.div('.group', editBox)

                let daijiEdit = ui.create.div('.btn .pointer', daijiGroup)
                let daijiAdjust = ui.create.div('.btn .pointer', daijiGroup)
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

                daijiEdit.innerHTML = '播放待机'
                daijiAdjust.innerHTML = '调整待机'
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

                let arena = document.getElementById('arena')
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
                    return  function () {
                        // 改变骨骼的位置
                        let dat = currentPlay === 'daiji' ? daijiXYPos : chukuangXYPos
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
                        console.log(dat, currentPlay)
                        skinSwitch.postMsgApi.adjust(player, currentPlay, {x: dat.x[1], y: dat.y[1]})

                        // 改变文本值
                        if (currentPlay === 'daiji') {
                            daijiPos.querySelector('span').innerHTML = `x:${dat.x}<br/>y:${dat.y}`
                        } else {
                            chuKuangPos.querySelector('span').innerHTML = `x:${dat.x}<br/>y:${dat.y}`
                        }
                    }
                }

                adjustDirection.querySelector('#upbtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', adjustXYRate('up'))
                adjustDirection.querySelector('#leftbtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', adjustXYRate('left'))
                adjustDirection.querySelector('#bottombtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click',  adjustXYRate('bottom'))
                adjustDirection.querySelector('#rightbtn').addEventListener(lib.config.touchscreen ? 'touchend' : 'click', adjustXYRate('right'))


                let updateAdjustPos = function (pos, mode) {
                    if (mode === 'daiji') {
                        daijiXYPos.x = pos.x
                        daijiXYPos.y = pos.y
                    } else {
                        chukuangXYPos.x = pos.x
                        chukuangXYPos.y = pos.y
                    }
                }

                qhlxAdjust.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    // 必须保证当前已经打开了千幻的皮肤选择界面.
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
                })

                // 点击计算屏幕百分比计算不准确, 放弃使用这种方式调整.
                // let updateAdjustPos = function (pos, mode) {
                //     let arena = document.getElementById('arena')
                //     let w = arena.clientWidth
                //     let h = arena.clientHeight
                //     adjustPos.style.left = w * pos.x[1] + pos.x[0] + 'px'
                //     adjustPos.style.top = (h - (h * pos.y[1] + pos.y[0])) + 'px'
                //
                //     adjustPos.onmouseup = function() {
                //         adjustPos.classList.add('adjust-position-select')
                //         let t = setTimeout(() => {
                //             arena.removeEventListener('click', windowClick)
                //             adjustPos.classList.remove('adjust-position-select')
                //             show(editBox)
                //         }, 5000)
                //
                //         function windowClick(e) {
                //             let dpr = Math.max(window.devicePixelRatio * (window.documentZoom ? window.documentZoom : 1), 1)
                //             arena.removeEventListener('click', windowClick)
                //             show(editBox)
                //             clearTimeout(t)
                //             // 调整位置
                //             adjustPos.style.left = e.pageX * dpr - 16 * dpr + 'px'
                //             adjustPos.style.top =  e.pageY * dpr - 16 * dpr + 'px'
                //             // 同时计算百分比
                //             let xRate = (e.pageX * dpr / w).toFixed(2)
                //             let yRate = (1 - e.pageY * dpr / h).toFixed(2)
                //
                //             if (xRate <= 0.03) {
                //                 xRate = 0.03
                //             } else if (xRate >= 0.97) {
                //                 xRate = 0.97
                //             }
                //             if (yRate <= 0.03) {
                //                 yRate = 0.03
                //             } else if (yRate >= 0.97) {
                //                 yRate = 0.97
                //             }
                //
                //             // 调整球的位置后, 即相当于调整骨骼的位置
                //             skinSwitch.postMsgApi.adjust(player, mode, {x: xRate, y: yRate})
                //             adjustPos.classList.remove('adjust-position-select')
                //             // 更新一下
                //             setTimeout(() => {
                //                 getCurPosition(mode)
                //             }, 100)
                //         }
                //
                //         setTimeout(()=>{
                //             hide(editBox)
                //             arena.addEventListener('click', windowClick)
                //         }, 100)
                //     }
                //
                //     // 不知道为啥滑不动, 而在单纯html页面可以流畅的滑动
                //     // https://zh.javascript.info/mouse-drag-and-drop
                //     //     let shiftX = event.clientX - adjustPos.getBoundingClientRect().left;
                //     //     let shiftY = event.clientY - adjustPos.getBoundingClientRect().top;
                //     //     console.log('down: ', event, shiftX, shiftY, adjustPos.style)
                //     //
                //     //     adjustPos.style.position = 'absolute';
                //     //     adjustPos.style.zIndex = '4000'
                //     //     // document.body.append(adjustPos);
                //     //
                //     //     // moveAt(event.pageX, event.pageY);
                //     //
                //     //     // 移动现在位于坐标 (pageX, pageY) 上的球
                //     //     // 将初始的偏移考虑在内
                //     //     function moveAt(pageX, pageY) {
                //     //         adjustPos.style.left = pageX - shiftX + 'px';
                //     //         adjustPos.style.top = pageY - shiftY + 'px';
                //     //     }
                //     //
                //     //     function onMouseMove(event) {
                //     //         console.log('onMouseMove: ', event)
                //     //         moveAt(event.pageX, event.pageY);
                //     //     }
                //     //
                //     //     // 在 mousemove 事件上移动球
                //     //     document.addEventListener('mousemove', onMouseMove);
                //     //
                //     //     // 放下球，并移除不需要的处理程序
                //     //     adjustPos.onmouseup = function(event) {
                //     //         console.log('onmouseup: ', event)
                //     //         document.removeEventListener('mousemove', onMouseMove);
                //     //         adjustPos.onmouseup = null;
                //     //     };
                //     //
                //     // };
                //     //
                //     // adjustPos.ondragstart = function() {
                //     //     return false;
                //     // };
                // }

                let getDynamicPos = function (mode, func) {
                    skinSwitch.postMsgApi.position(player, mode)
                    skinSwitch.rendererOnMessage.addListener(player, 'position', func)
                }

                let getCurPosition = function (mode) {
                    getDynamicPos(mode, function (data) {
                        if (data) {
                            updateAdjustPos(data, mode)

                            // 同时改变输入框的值
                            if (mode === 'daiji') {
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
                        dynamicWrap = player.getElementsByClassName("dynamic-wrap")[0];
                    }

                    skinSwitch.postMsgApi.debug(player, mode)
                    skinSwitch.rendererOnMessage.addListener(player, 'debugChuKuang', function (e) {
                        dynamicWrap.style.zIndex = "63";
                        canvas.style.position = "fixed";
                        canvas.style.height = "100%";
                        canvas.style.width = "100%";
                        player.style.zIndex = 10;
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
                            return
                        }
                        if (mode === 'daiji') {
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
                            return
                        }
                        if (mode === 'daiji') {
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
                            // 更新位置
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
                            return
                        }
                        if (mode === 'daiji') {
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
                            console.log('postData')
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

                daijiEdit.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    selfLoopPlay('daiji')
                    if (currentPlay !== 'daiji') {
                        // 隐藏调整框
                        hide(adjustDirection)
                        chuKuangAdjust.classList.remove('adjust-select')
                        daijiAdjust.classList.remove('adjust-select')
                    }
                    currentPlay = 'daiji'
                })

                daijiAdjust.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    // 只有当前播放动画是出框的时候才可以调整位置
                    if (currentPlay === 'chukuang') {
                        return
                    }
                    daijiAdjust.classList.add('adjust-select')
                    chuKuangAdjust.classList.remove('adjust-select')

                    if (!isHide(adjustDirection)) {
                        hide(adjustDirection)
                    } else {
                        getCurPosition('chukuang')
                        show(adjustDirection)
                    }

                    // 显示当前的位置, 在屏幕中间用小圆块表示, 拖动小圆块来调整位置, 因为这个计算不是很准, 暂时放弃了.
                    // if (!isHide(adjustPos)) {
                    //     hide(adjustPos)
                    // } else {
                    //     getCurPosition('daiji')
                    //     show(adjustPos)
                    // }
                    //

                })

                chuKuangEdit.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    // 先调整编辑出框
                    selfLoopPlay('chukuang')

                    if (currentPlay !== 'chukuang') {
                        // 隐藏调整框
                        hide(adjustDirection)
                        chuKuangAdjust.classList.remove('adjust-select')
                        daijiAdjust.classList.remove('adjust-select')
                    }

                    currentPlay = 'chukuang'
                })

                chuKuangAdjust.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {

                    // 只有当前播放动画是出框的时候才可以调整位置
                    if (currentPlay === 'daiji') {
                        return
                    }

                    daijiAdjust.classList.remove('adjust-select')
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
                        // 比对两者的数据, 如果不一样,才进行保存
                        if (skinSwitch.saveSkinParams[player.name]) {
                            if (skinSwitch.saveSkinParams[player.name][saveKey]) {
                                let saveData = skinSwitch.saveSkinParams[player.name][saveKey]
                                // 千幻雷修就不检查重复key了, 每次都进行更新
                                if (player.isQhlx) {
                                    let k = mode === 'daiji' ? 'daiji' : 'gongji'
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
                                    let k = mode === 'daiji' ? 'daiji' : 'gongji'
                                    skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                    skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'] = {}
                                    skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'][k] = data

                                } else {
                                    if (mode === 'daiji') {
                                        skinSwitch.saveSkinParams[player.name][saveKey] = data
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
                                let k = mode === 'daiji' ? 'daiji' : 'gongji'
                                skinSwitch.saveSkinParams[player.name][saveKey] = {}
                                skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'] = {}
                                skinSwitch.saveSkinParams[player.name][saveKey]['qhlx'][k] = data

                            } else {
                                if (mode === 'daiji') {
                                    skinSwitch.saveSkinParams[player.name][saveKey] = data
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
                        }
                    }
                }

                daijiSave.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    if (currentPlay === 'chukuang') {
                        return
                    }
                    // 获取当前的位置参数
                    getDynamicPos('daiji', function (data) {
                        // 同时写入到文件中
                        if (data) {
                            saveToFile(data, 'daiji')
                            copyToClipboard(data)
                        }
                    })
                })
                chuKuangSave.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', function () {
                    if (currentPlay === 'daiji') {
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
                } else {
                    dom.classList.add('hidden-adjust')
                }
            }


            lib.arenaReady.push(function() { //游戏加载完成执行的内容
                //顶部菜单
                if (lib.config[skinSwitch.configKey.showEditMenu]) {
                    // 添加编辑动皮皮肤的位置和出框位置参数
                    ui.create.system('编辑动皮参数', function() {
                        setTimeout(function() {
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
                let js = function (path) {
                    if (!path) return console.error('path');

                    let script = document.createElement('script');
                    script.onload = function () {
                        window.skinSwitchMessage = new SkinSwitchMessage()
                    }
                    script.onerror = function () {
                        console.error(this.src + 'not found');
                    }
                    script.src = path
                    document.head.appendChild(script);
                }
                // <!-- 消息外层容器，因为消息提醒基本上是全局的，所以这里用id，所有的弹出消息都是需要插入到这个容器里边的 -->
                let msgContainer = ui.create.div(document.getElementById('arena'))
                msgContainer.id = 'message-container'
                js(skinSwitch.url + 'component/message.js')
            })
        },
        config:{
            "backupFileDui": {
                name: "<div><button class='engBtn' onclick='skinSwitch.backupFileDui()'>备份十周年文件</button></div>",
                clear: true
            },
            "ImportFileDui": {
                name: "<div><button id='importFileDui' class='engBtn' onclick='skinSwitch.modifyFileDui()'>导入十周年文件</button> </div>",
                clear: true
            },
            "previewDynamic": {
                name: "<div><button onclick='skinSwitch.previewDynamic()'>预览spine动画(资源文件放入asset文件中)</button></div>",
                clear: true
            },
            "resetArchiveDynamicSkin": {
                name: "<button id='resetDynamicBtn' class='engBtn' type='button' onclick='skinSwitch.resetDynamicData()' >重置动皮存档</button>",
                intro: "当你更换的dynamicSkin.js与上一个版本内容差距较大时，需重置",
                clear: true
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
            intro:"基于EngEX扩展的动态换肤部分魔改.原来使用E佬写的EngEX插件自动出框非常好用,但是非常麻烦的是调整参数不方便, 于是就自己观摩E佬和特效测试扩展大佬的代码编写了调整参数这个简单的扩展\n" +
                "基于本人是个后端人员,审美有限(汗),所以换肤部分样式素材基本照搬E佬的EngEX扩展. 第一次写插件,应该有挺多bug,希望见谅.",
            author:"yscl",
            diskURL:"",
            forumURL:"",
            version:"1.01",
        },
        files:{"character":[],"card":[],"skill":[]}}
})