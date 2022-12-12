'use strict';
importScripts('../十周年UI/spine.js', '../十周年UI/animation.js');
let window = self;
let devicePixelRatio = 1;
let documentZoom = 1;
let HTMLCanvasElement = function () {
    return 'HTMLCanvasElement';
};
let HTMLElement = function () {
    return 'HTMLElement';
};

Array.prototype.remove = function (item) {
    var index = this.indexOf(item);
    if (index >= 0) return this.splice(index, 1);
    return item;
}


let playerAnimation
let chukuangId = 99999   // 自动出框的nodeID起始, 为了不和主线程传过去的skinId重复

// 用来管理所有角色的公共出框animation
class PlayerAnimation {

    constructor(data) {
        console.log('create data----', data)
        this.anni = new duilib.AnimationPlayer(data.pathPrefix, 'offscreen', data.canvas)
        this.playerAni = {}  // 这个用来管理每个角色的Id及其skinId的配置数据

        this.playerState = {}  // 管理每个角色出框状态, 同时保证一个角色只能有一个出框状态.
    }

    // 提前把当前角色动皮需要用到的骨骼加载, 可能有默认的骨骼, 出场骨骼, 攻击骨骼, 特殊骨骼
    preLoadPlayerSkel(data) {
        let player = data.player
        let _this = this
        this.completeParams(player)
        let pLoad = function (actionParams) {
            if (actionParams) {
                if (!_this.anni.hasSpine(actionParams.name)) {
                    _this.anni.loadSpine(actionParams.name, 'skel', function () {
                        console.log('预加载骨骼成功')
                    }, function (r) {
                        console.log('播放骨骼失败, 参数: ', r, data)
                    })
                }
            }
        }
        let arr = []
        for (let act of [{name: player.name}, player.gongjiAction, player.gongjiAction, player.chuchangAction]) {
            if (act && !arr.includes(act.name)) {
                arr.push(act.name)
                pLoad(act)
            }
        }
        if (!(data.id in this.playerAni)) {
            this.playerAni[data.id] = {}
        }
        if (!(data.skinId in this.playerAni[data.id])) {
            this.playerAni[data.id][data.skinId] = {}
        }
        this.playerAni[data.id][data.skinId] = player
    }

    findPlayerParams(id, skinId) {
        if (!(id in this.playerAni)) {
            return
        }
        if (!(skinId in this.playerAni[id])) {
            return
        }
        return this.playerAni[id][skinId]
    }

    playAction(data) {
        let player = this.findPlayerParams(data.id, data.skinId)
        if (!player) return
        let actionParams
        if (data.action === 'GongJi') actionParams = player.gongjiAction
        else if (data.action === 'chukuang') actionParams = player.chuchangAction
        else if (data.action === 'TeShu') actionParams = player.teshuAction
        else actionParams = player[data.action + 'Action']
        if (!actionParams) return

        if (!this.anni.hasSpine(actionParams.name)) {
            this.anni.loadSpine(actionParams.name, "skel", () => {
                this.playChuKuang(player, actionParams, data)
            }, this.errPlaySpine)
        } else {
            this.playChuKuang(player, actionParams, data)
        }
    }

    playLoopAction(data, player, actionParams) {
        // 获取存储的action对应的动画状态
        if (!completePlayerParams(player, data.action)) return

        let actionState = player.actionState
        if (!actionState || !actionState[data.action]) return

        actionParams.id = chukuangId++

        let actionInfo = actionState[data.action]

        if (Array.isArray(actionInfo)) {
            let selectAction = randomChoice(actionInfo)
            actionParams.action = selectAction.action
        } else {
            actionParams.action = actionInfo.action
        }
        this.anni.playSpine(actionParams)
    }

    stopLoopSpine(data) {
        let playerParams = this.findPlayerParams(data.id, data.skinId)
        for (let node of this.anni.nodes) {
            if (node.name === playerParams.gongjiAction.name) {
                playerParams.gongjiAction.loop = false
                node.opacity = 0
                this.anni.nodes.remove(node)
                node.skeleton.completed = true
                return
            }
        }
    }

    playChuKuangSpine(playNode, animation, data) {
        this.playerState[data.id]['action'] = true
        playNode.angle = undefined
        let showTime = animation.showTime * 1000
        if (!(playNode.player.shizhounian || playNode.player.chuchang || playNode.player.qhlxBigAvatar)) {
            showTime -= 500
        }
        // if (playNode.player.shizhounian && data.action === 'GongJi') {
        //     showTime /= 1.3
        //     if (playNode.speed == null || playNode.speed === 1) playNode.speed = 1.3
        // }
        if (playNode.speed == null || playNode.speed === 1) playNode.speed = 1.2
        showTime /= 1.2
        setTimeout(() => {
            // 如x果是手杀大屏预览的页面则不位移到原处
            if (playNode.player.shizhounian || playNode.player.chuchang || playNode.player.qhlxBigAvatar) {
                playNode.opacity = 0

                postMessage({
                    'message': 'recoverDaiJi',
                    'id': data.id,
                    qhlxBigAvatar: playNode.player.qhlxBigAvatar,
                })
                this.playerState[data.id] = false
                playNode.completed = true
                playNode.skeleton.completed = true  // 这里一定要标记为true, 不然下次skeleton对象会一直重复实例化
                console.log('playerAnimation.anni.skeletons---->', playerAnimation.anni.spine.skeletons)
                console.log('playerAnimation.anni.nodes---->', playerAnimation.anni.nodes)
            }
            else {
                playNode.moveTo(data.player.x, data.player.y, 500);
                setTimeout(()=> {
                    playNode.opacity = 0
                    playNode.completed = true
                    playNode.skeleton.completed = true
                    postMessage({
                        'message': 'recoverDaiJi',
                        'id': data.id
                    })
                    this.playerState[data.id] = false
                }, 500)

            }

        }, showTime)
        // 重新恢复攻击pose
        if (data.action === 'chuchang') {
            playNode.scaleTo(playNode.scale * 1.2, 500)
        }
        setPos(playNode, data);
        playNode.opacity = 1
    }

    playChuKuang(player, actionParams, data) {

        // 获取存储的action对应的动画状态
        let actionState = player.actionState
        if (!actionState || !actionState[data.action]) return

        actionParams.id = chukuangId++

        let actionInfo = actionState[data.action]

        if (Array.isArray(actionInfo)) {
            let selectAction = randomChoice(actionInfo)
            actionParams.showTime = selectAction.showTime
            actionParams.action = selectAction.action
        } else {
            actionParams.showTime = actionInfo.showTime
            actionParams.action = actionInfo.action
        }
        let playedSprite = this.anni.playSpine(actionParams)
        playedSprite.player = player

        this.playChuKuangSpine(playedSprite, {showTime: actionParams.showTime}, data)
    }

    errPlaySpine (data) {
        console.log('播放失败....', data)
    }
    // 补全配置参数 player: 这个是播放待机动作存取的配置参数
    completeParams(player) {
        if (!player) return
        if (player.qhlxBigAvatar) {
            if (player.qhlx) {
                if (player.qhlx.gongji) {
                    if (!player.gongji) {
                        player.gongji = {}
                    }
                    player.gongji = Object.assign(player.gongji, player.qhlx.gongji)
                } else {
                    // 使用雷修默认的出框参数
                    player.gongji.x = player.divPos.x + player.divPos.width / 2;
                    player.gongji.y = player.divPos.y + player.divPos.height / 2;
                    player.gongji.scale = player.scale * 0.6
                }
            } else {
                if (!player.gongji) {
                    player.gongji = {}
                }
                console.log('player.divPos --> ', player.divPos)
                // fix 大屏预览参数使用雷修默认的出框偏移
                player.gongji.x = player.divPos.x + player.divPos.width / 2;
                player.gongji.y = player.divPos.y + player.divPos.height / 2;
                player.gongji.scale = player.scale * 0.6
            }

        }

        let gongjiAction, teshuAction
        let gongji = player.gongji
        let teshu = player.teshu
        let gongjiType = typeof gongji
        let teshuType = typeof teshu

        // 定义为十周年的开局出场
        let chuchang = player.chuchang
        let chuchangType = typeof chuchang

        // 如果填写了出场参数, 基本确认是十周年的真动皮
        if (chuchang) {
            if (chuchangType === 'object') {
                if (!chuchang.name) {chuchang.name = player.name}
                if (!chuchang.action) {chuchang.action = 'play'}
                if (!chuchang.scale) {chuchang.scale = player.scale}
                player.chuchangAction = chuchang
            }
        }

        // 这是原来的EngEX扩展的判断手杀真动皮的写法. player.pos用来调整出框位置参数, 兼容此种写法, 如果填写了pos认为是原来的真动皮
        if (player.pos) {
            gongjiAction = {
                name: player.name,  // 和原来的皮肤一样
                x: player.pos.x,
                y: player.pos.y,
                scale: player.scale,
                action: 'GongJi'
            }
            teshuAction = {
                name: player.name,
                x: player.x,
                y: player.y,
                action: 'TeShu'  // 可以手动指定相同动皮的特殊动作
            }
            // 如果还填写了具体的攻击参数, 那么用攻击参数覆盖原来的配置
            if (gongjiType === 'object') {
                gongjiAction = Object.assign(gongjiAction, gongji)
            } else if (gongjiType === 'string') {
                gongjiAction.action = gongji
            }
            if (teshuType === 'object') {
                teshuAction = Object.assign(teshuAction, teshu)
            } else if (teshuType === 'string') {
                teshuAction.action = teshu
            }
        } else {
            // 只指定了攻击的动画标签, 那么使用当前动皮指定的标签在屏幕中间播放
            if (gongjiType === 'string') {
                gongjiAction = {
                    name: player.name,  // 和原来的皮肤一样
                    x: [0, 0.5],
                    y: [0, 0.5],
                    scale: player.scale,  //
                    action: player.gongji,
                }
            }
            // 如果是简单的设置为true, 那么说明当前动皮是静态皮肤, 也想出框, 那么和上面一样, 播放当前待机动作到中央
            else if (gongji === true) {
                gongjiAction = {
                    name: player.name,  // 和原来的皮肤一样
                    x: [0, 0.5],
                    y: [0, 0.5],
                    scale: player.scale,  //
                    fakeDynamic: true,
                }
            } else if (gongjiType === 'object') {
                gongjiAction = gongji
                if (!gongjiAction.name) {
                    gongjiAction.name = player.name
                } else {
                    gongjiAction.name = getFullName(player.localePath, gongjiAction.name)
                }
                if (!gongjiAction.x) {
                    gongjiAction.x = [0, 0.5]
                    gongjiAction.posAuto = true  // 自动设置的位置, 如果是十周年的动皮的话, 原地出框
                }
                if (!gongjiAction.y) {
                    gongjiAction.y = [0, 0.5]
                    gongjiAction.posAuto = true
                }
                if (!gongjiAction.scale) {gongjiAction.scale = player.scale}
                if (!gongjiAction.action && gongjiAction.name === player.name) {
                    gongjiAction.fakeDynamic = true
                }
            } else {
                // 默认从当前皮肤的GongJi标签来播放动作
                gongjiAction = {
                    name: player.name,  // 和原来的皮肤一样
                    x: [0, 0.5],
                    y: [0, 0.5],
                    scale: player.scale,
                    action: 'GongJi'  // 寻找默认的攻击动画标签名称
                }
            }

            // 特殊动作同样处理
            if (teshuType === 'string') {
                teshuAction = {
                    name: player.name,  // 和原来的皮肤一样
                    x: [0, 0.5],
                    y: [0, 0.5],
                    scale: player.scale,
                    action: player.teshu,
                }
            }
            else if (teshuType === 'object') {
                teshuAction = teshu
                if (!teshuAction.name) {
                    teshuAction.name = player.name
                } else {
                    teshuAction.name = getFullName(player.localePath, teshu.name)
                }
                // 特殊动画还是最好不要出框, 不然触发频率太高了...
                if (teshuAction.name !== player.name) {
                    if (!teshuAction.x) {
                        teshuAction.x = [0, 0.5]
                        teshuAction.posAuto = true
                    }
                    if (!teshuAction.y) {
                        teshuAction.y = [0, 0.5]
                        teshuAction.posAuto = true
                    }

                } else {
                    if (!teshuAction.x) {teshuAction.x = player.x}
                    if (!teshuAction.y) {teshuAction.y = player.y}
                }
                if (!teshuAction.scale) {teshuAction.scale = player.scale}
            } else {
                // 默认从当前皮肤的TeShu标签来播放动作
                teshuAction = {
                    name: player.name,  // 和原来的皮肤一样
                    x: [0, 0.5],
                    y: [0, 0.5],
                    scale: player.scale,
                    action: 'TeShu'  // 寻找默认的攻击动画标签名称
                }
            }
        }

        player.gongjiAction = gongjiAction
        player.teshuAction = teshuAction
    }
}

function setShiZhouNianGongJiPos(apnode, data) {
    if (data.me) {
        apnode.x = data.player.x - data.player.width / 3
        apnode.y = data.player.y + data.player.height * 1.1
    } else {
        // 根据每个人当时的位置偏移
        let xRate = data.player.x / data.player.bodyWidth
        let yRate = data.player.y / data.player.bodyHeight
        apnode.x = data.player.x + data.player.width / 2
        apnode.y = data.player.y + data.player.height / 2
        console.log('x,y', xRate, yRate)
        if (xRate < 0.35) {
            apnode.x += data.player.width * 0.5
        }

        if (xRate > 0.7) {
            apnode.x -= data.player.width * 0.3
        }

        if (yRate > 0.7) {
            apnode.y -= data.player.height * 0.3
        }

        if (yRate < 0.35) {
            apnode.y += data.player.height * 0.25
        }

    }
}

function setPos(apnode, data) {
    if (apnode.player.qhlxBigAvatar){
        apnode.x = apnode.player.gongjiAction.x
        apnode.y = apnode.player.gongjiAction.y
        return
    }
    if (data.me) {
        // 获取
        let actionParams
        if (data.action === 'GongJi') {
            actionParams = apnode.player.gongjiAction
            // 十周年默认的
            if (actionParams.posAuto && apnode.player.shizhounian) {
                return setShiZhouNianGongJiPos(apnode, data)
            }
        }
        else if (data.action === 'TeShu') {
            actionParams = apnode.player.teshuAction
            if (actionParams.posAuto && apnode.player.shizhounian) {
                console.log('teshu:  ', actionParams)
                return setShiZhouNianGongJiPos(apnode, data)
            }
        } else if (data.action === 'chuchang') {
            apnode.x = data.player.x + data.player.width / 4
            apnode.y = data.player.y + data.player.height * 0.8
            return setShiZhouNianGongJiPos(apnode, data)
            // 出场是原地出场
        } else {
            return
        }
        apnode.x = actionParams.x
        apnode.y = actionParams.y
        data.player.y += 180
    } else {
        if (data.action === 'chuchang') {
            // apnode.x = data.player.x + data.player.width / 2
            // apnode.y = data.player.y + data.player.height / 2
            return setShiZhouNianGongJiPos(apnode, data)
        }
        else if (data.action === 'GongJi') {
            if (apnode.player.shizhounian) {
                return setShiZhouNianGongJiPos(apnode, data)
            }
        } else if (data.action === 'TeShu') {
            if (apnode.player.shizhounian) {
                return setShiZhouNianGongJiPos(apnode, data)
            }
        }
        apnode.x = data.direction.x;
        apnode.y = data.direction.y;
        if (data.direction.isLeft) data.player.x += 85; else data.player.x += 40;
    }
}

// 填写了动皮的路径, 原来默认是放在assets/dynamic文件夹下, 这样不太好管理, 可以建立角色的文件夹,
// 然后填写localePath参数即可.如果包含本地路径的话, 再添加上文件夹路径作为骨骼的路径
function getFullName(localePath, name) {
    if (!localePath) return name
    if (!name.startsWith(localePath + '/')) {
        name = localePath + '/' + name
    }
    return name
}


function getActionDuration(dynamic, skelName, actionName) {
    let spineActions = dynamic.getSpineActions(skelName)
    let duration = null
    if (actionName) {
        for (let a of spineActions) {
            if (a.name === actionName) {
                duration = a.duration
                break
            }
        }
    } else {
        duration = spineActions[0].duration
    }
    return duration
}


// 返回0-a-1中的随机整数
function randomInt(a) {
    return Math.floor(Math.random() * a)
}

// 返回数组中的随机一个值, 如果数组为空则放回undefined
function randomChoice(arr) {
    if (!arr || arr.length === 0) return undefined
    return arr[randomInt(arr.length)]
}


/** 消息处理函数 */

function createChuKuang(data) {
    playerAnimation = new PlayerAnimation(data)
    playerAnimation.dprAdaptive = false
}


// 预加载用到的骨骼
function preLoad(data) {
    playerAnimation.preLoadPlayerSkel(data)
    console.log('playerAnimation --> ', playerAnimation)
}

function completePlayerParams(avatarPlayer, action) {
    if (avatarPlayer) {
        if (!avatarPlayer.actionState) {avatarPlayer.actionState = {}}
        else {
            if (avatarPlayer.actionState[action] === false) {
                return false
            }
            if (avatarPlayer.actionState[action] != null) {
                return true
            }
        }
        // 查找是否有该骨骼, 并且可否出框
        let daijiName = avatarPlayer.name
        let actionParams
        if (action === 'GongJi') actionParams = avatarPlayer.gongjiAction
        else if (action === 'TeShu') actionParams = avatarPlayer.teshuAction
        else if (action === 'chuchang') actionParams = avatarPlayer.chuchangAction
        else actionParams = avatarPlayer[action + 'Action']  // 这个写法是可以扩展随意任意想要出框的action, 默认可以出框的只有gongji,teshu,chuchang

        if (actionParams && actionParams.name === daijiName) {
            // 只支持假动皮攻击出框, 其他动作和待机相同, 不允许出框
            if (action === 'GongJi') {
                // 查找待机动作的默认动作标签, 并缓存
                let results = playerAnimation.anni.getSpineActions(daijiName)
                if (results && results.length > 0) {
                    // 检查是否有GongJi标签, 如果有那是真动皮
                    if (actionParams.fakeDynamic) {
                        for (let r of results) {
                            if (r.name === 'GongJi') {
                                avatarPlayer.actionState[action] = {
                                    action: r.name,
                                    duration: r.duration,
                                    showTime: actionParams.showTime || r.duration
                                }
                                actionParams.fakeDynamic = false
                                return true
                            }
                        }
                        avatarPlayer.actionState[action] = {
                            action: results[0].name,
                            duration: results[0].duration,
                            showTime: actionParams.showTime || Math.min(results[0].duration, 2)
                        }
                        return true

                    }
                    let isArray = Array.isArray(actionParams.action)
                    let states = []
                    for (let r of results) {
                        // 如果攻击填写的出多个标签, 那么顺便校验
                        if (isArray) {
                            if (actionParams.action.includes(r.name)) {
                                states.push({
                                    action: r.name,
                                    duration: r.duration,
                                    showTime: actionParams.showTime || r.duration
                                })
                            }
                        } else {
                            if (r.name === actionParams.action) {
                                avatarPlayer.actionState[action] = {
                                    action: r.name,
                                    duration: r.duration,
                                    showTime: actionParams.showTime || r.duration
                                }
                                return true
                            }
                        }
                    }
                    if (states.length > 0) {
                        avatarPlayer.actionState[action] = states
                        return true
                    }
                }
                avatarPlayer.actionState[action] = false
            } else {
                avatarPlayer.actionState[action] = false
            }
            avatarPlayer.actionState[action] = false
        } else {
            // 查找骨骼与正确的标签
            let results = playerAnimation.anni.getSpineActions(actionParams.name)
            let isArray = Array.isArray(actionParams.action)
            let states = []
            if (results && results.length > 0) {
                if (!actionParams.action) {
                    avatarPlayer.actionState[action] = {
                        action: results[0].name,
                        duration: results[0].duration,
                        showTime: actionParams.showTime || results[0].duration
                    }
                    return true
                }
                for (let r of results) {
                    if (isArray) {
                        if (actionParams.action.includes(r.name)) {
                            states.push({
                                action: r.name,
                                duration: r.duration,
                                showTime: actionParams.showTime || r.duration
                            })
                        }
                    } else {
                        if (r.name === actionParams.action) {
                            avatarPlayer.actionState[action] = {
                                action: r.name,
                                duration: r.duration,
                                showTime: actionParams.showTime || r.duration
                            }
                            return true
                        }
                    }
                }
                if (states.length > 0) {
                    avatarPlayer.actionState[action] = states
                    return true
                }
            }
            avatarPlayer.actionState[action] = false
        }
    }
}

function isChuKuang(data) {
    // 如果已经是出框状态, 直接返回, 不能在短时间内连续请求
    if (playerAnimation.playerState[data.id] && (new Date().getTime() - playerAnimation.playerState[data.id].time < 300 || playerAnimation.playerState[data.id].action)) return
    if (playerAnimation.playerState[data.id]) {
        playerAnimation.playerState[data.id]['time'] = new Date().getTime()
    } else {
        playerAnimation.playerState[data.id] = {'time': new Date().getTime()}
    }


    let primarySkinId = data.primarySkinId
    let deputySkinId = data.deputySkinId
    // 查找是否可以出框
    let primaryPlayer = playerAnimation.findPlayerParams(data.id, primarySkinId)
    console.log('primaryPlayer data', primaryPlayer)

    if (completePlayerParams(primaryPlayer, data.action)) {
        return postMessage({
            id: data.id,
            skinId: primarySkinId,
            message: 'chukuangPrepare',
            action: data.action,
            isPrimary: true,
            qhlxBigAvatar: primaryPlayer.qhlxBigAvatar
        })
    }
  
    let deputyPlayer = playerAnimation.findPlayerParams(data.id, deputySkinId)
    if (completePlayerParams(deputyPlayer, data.action)) {
        return postMessage({
            id: data.id,
            skinId: deputySkinId,
            message: 'chukuangPrepare',
            action: data.action,
            isPrimary: false,
            qhlxBigAvatar: deputyPlayer.qhlxBigAvatar
        })
    }
    postMessage({
        id: data.id,
        message: 'noActionChuKuang',
        action: data.action,
        qhlxBigAvatar: primaryPlayer && primaryPlayer.qhlxBigAvatar
    })
}

function chukuangStart(data) {
    playerAnimation.playAction(data)
}

function update(data) {
    let dynamic = playerAnimation.anni
    dynamic.resized = false;
    if (data.dpr != null) dynamic.dpr = data.dpr;
    if (data.dprAdaptive != null) dynamic.dprAdaptive = data.dprAdaptive;
    if (data.outcropMask != null) dynamic.outcropMask = data.outcropMask;
    if (data.useMipMaps != null) dynamic.useMipMaps = data.useMipMaps;
    if (data.width != null) dynamic.width = data.width;
    if (data.height != null) dynamic.height = data.height;
}

function adjust(data) {
    let player = playerAnimation.findPlayerParams(data.id, data.skinId)
    if (!player) return;

    let actionParams = player.gongjiAction
    if (!actionParams) return

    if (data.x != null && data.y != null) {
        // 修改参数
        actionParams.x = data.x
        actionParams.y = data.y
    } else if (data.xyPos){
        if (data.xyPos.x != null) {
            actionParams.x[0] = data.xyPos.x
        } else if (data.xyPos.y != null){
            actionParams.y[0] = data.xyPos.y
        }
    } else if (data.scale != null) {
        // 同一个动皮出框通过调整静态大小即可.
        if (actionParams.scale) {
            actionParams.scale = data.scale
        }
    }
    actionParams.posAuto = false
}


function position(data) {
    let player = playerAnimation.findPlayerParams(data.id, data.skinId)
    if (!player) return;

    let actionParams = player.gongjiAction
    if (!actionParams) return
    // 只有千幻聆音需要如此调整.
    postMessage({id: data.id, skinId: data.skinId, message: 'position', x: actionParams.x, y: actionParams.y, scale: actionParams.scale, })
}

function debug(data) {
    // 循环播放动画
    let player = playerAnimation.findPlayerParams(data.id, data.skinId)
    if (!player) return;
    let actionParams = player.gongjiAction
    if (!actionParams) return
    actionParams.loop = true

    playerAnimation.playLoopAction(data, player, actionParams)
    postMessage({
        id: data.id,
        skinId: data.skinId,
        message: 'debugChuKuang',
        action: data.action,
        isPrimary: true,
        qhlxBigAvatar: true
    })
}


onmessage = function (e) {
    let data = e.data
    switch (data.message) {
        case 'CREATE':
            createChuKuang(data)
            break
        case 'ACTION':
            action(data)
            break
        case 'UPDATE':
            update(data)
            break
        case 'PRELOAD':
            preLoad(data)
            break
        case "isChuKuang":
            isChuKuang(data)
            break
        case "chukuangStart":
            chukuangStart(data)
            break
        case 'ADJUST':
            adjust(data)
            break
        case 'DEBUG':
            debug(data)
            break
        case 'POSITION':
            position(data)
            break
        case 'stopLoopSpine':
            playerAnimation.stopLoopSpine(data)
            break

    }

}