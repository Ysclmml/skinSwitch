'use strict';
importScripts('./spine.js', './animation.js');
let window = self;
let devicePixelRatio = 1;
let documentZoom = 1;
let HTMLCanvasElement = function () {
    return 'HTMLCanvasElement';
};

class HTMLElement {

    constructor(bound, bodySize) {
        this.boundRect = bound
        this.bodySize = bodySize
    }

    getBoundingClientRect() {
        return this.boundRect
    }
}


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
        this.anni = new newDuilib.AnimationPlayer(data.pathPrefix, 'offscreen', data.canvas)
        if (data.dpr) {
            this.anni.dpr = data.dpr || 1;
            this.anni.dprAdaptive = true
        }
        this.playerAni = {}  // 这个用来管理每个角色的Id及其skinId的配置数据

        this.playerState = {}  // 管理每个角色出框状态, 同时保证一个角色只能有一个出框状态.
        this.isMobile = data.isMobile

        this.skinNameChukuangMap = {}  // 管理所有动皮name 缓存每个攻击的信息.
    }

    // 提前把当前角色动皮需要用到的骨骼加载, 可能有默认的骨骼, 出场骨骼, 攻击骨骼, 特殊骨骼
    preLoadPlayerSkel(data) {
        let player = data.player
        if (!player) return
        let _this = this
        this.completeParams(player)

        // 提前加载当前骨骼的出框参数信息

        let loadedName = new Set()
        let tasks = 0

        // 将没有出框的骨骼删除
        let checkNoChuKuang = () => {
            tasks++
            if (tasks < 3) return
            for (let k of loadedName.keys()) {
                let skinNameInfo = playerAnimation.skinNameChukuangMap[k]
                if (skinNameInfo){
                    let flag = false
                    for (let t of Object.keys(skinNameInfo)) {
                        if (t !== 'type' && skinNameInfo[t]) {
                            flag = true
                            break
                        }
                    }
                    if (!flag) {
                        console.log('delete ..k', k, tasks)
                        this.anni.removeSpine(k, skinNameInfo.type)
                    }
                }
            }
        }

        let pLoad = function (obj) {
            let actionParams = obj.actionParams
            let action = obj.action
            if (actionParams) {
                actionParams.alpha = actionParams.alpha == null ? player.alpha : actionParams.alpha
                if (actionParams.name === player.name) {
                    actionParams.json = player.json
                }
                let skinNameInfo = playerAnimation.skinNameChukuangMap[actionParams.name]
                console.log('actionParams.name0000---',actionParams.name, skinNameInfo)
                if (!skinNameInfo) {
                    skinNameInfo = {}
                    playerAnimation.skinNameChukuangMap[actionParams.name] = skinNameInfo
                    skinNameInfo.type = actionParams.json ? 'json': 'skel'
                } else {
                    // 已经加载过的不存在的,跳过重新加载
                    return
                }
                // 检查是否有出框骨骼, 如果没有, 则删除改骨骼
                if (!_this.anni.hasSpine(actionParams.name)) {
                    let skelType = actionParams.json ? 'json': 'skel';
                    _this.anni.loadSpine(actionParams.name, skelType, function () {
                        console.log('预加载骨骼成功', actionParams.name)
                        loadedName.add(actionParams.name)
                        skinNameInfo[action] = Boolean(completePlayerParams(player, action))
                        checkNoChuKuang()
                    }, function () {
                        console.log('播放骨骼失败, 参数: ', actionParams)
                        skinNameInfo[action] = false
                        checkNoChuKuang()
                    })
                } else {
                    skinNameInfo[action] = Boolean(completePlayerParams(player, action))
                    checkNoChuKuang()
                }
            } else {
                checkNoChuKuang()
            }

        }
        for (let act of [{actionParams: player.gongjiAction, action: 'GongJi'},
                         {actionParams:player.teshuAction, action: 'TeShu'},
                         {actionParams: player.chuchangAction, action: 'chuchang'}]) {
                pLoad(act)
        }
        if (!(data.id in this.playerAni)) {
            this.playerAni[data.id] = {}
        }
        if (!(data.skinId in this.playerAni[data.id])) {
            this.playerAni[data.id][data.skinId] = {}
        }
        this.playerAni[data.id][data.skinId] = player
        console.log('this.anni====', this.anni)
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

        // 是否触发连续攻击
        if (actionParams.playNode) {
            clearTimeout(actionParams.moveToTimeout)
            clearTimeout(actionParams.showTimeout)
            return this.lianxuChuKuang(player, actionParams, data)
        }

        if (!this.anni.hasSpine(actionParams.name)) {
            this.anni.loadSpine(actionParams.name, actionParams.json ? 'json': 'skel', () => {
                this.playChuKuang(player, actionParams, data)
            }, this.errPlaySpine)
        } else {
            this.playChuKuang(player, actionParams, data)
        }
    }

    playChuKuangSpine(playNode, animation, data, notSetPos) {

        // 是否要取消连续出框
        if (!this.playerState[data.id])  {}this.playerState[data.id] = {'time': new Date().getTime()};
        this.playerState[data.id]['action'] = data.action
        playNode.angle = undefined
        let showTime = animation.showTime * 1000
        let delayTime = 400
        if (!(playNode.player.shizhounian || playNode.player.chuchang || playNode.player.qhlxBigAvatar)) {
            if (showTime <= 800) {
                delayTime = 200
            }
            if (showTime <= 1200) {
                delayTime = 300
            }
            showTime -= delayTime

            // 暂时还是开启动画播放速度默认调为1.2, 默认为1太慢了
            if (playNode.speed == null || playNode.speed === 1) playNode.speed = 1.2

        } else {
            if (playNode.speed == null || playNode.speed === 1) playNode.speed = 1.2



        }
        showTime /= (playNode.speed || 1)
        console.log('showTime', showTime, animation.showTime, playNode.speed)
        // 如果是连续攻击, 延长展示的时间, 回框速度加快
        // if (notSetPos && !(playNode.player.shizhounian || playNode.player.chuchang || playNode.player.qhlxBigAvatar)) {
        //     showTime += delayTime - 150
        //     delayTime = 150
        // }
        playNode.actionParams.showTimeout = setTimeout(() => {
            // 如x果是手杀大屏预览的页面则不位移到原处
            if (playNode.player.shizhounian || playNode.player.chuchang || playNode.player.qhlxBigAvatar) {
                playNode.actionParams.playNode = null
                playNode.opacity = 0
                postMessage({
                    'message': 'recoverDaiJi',
                    'id': data.id,
                    qhlxBigAvatar: playNode.player.qhlxBigAvatar,
                })
                this.playerState[data.id] = false
                playNode.completed = true
                playNode.skeleton.completed = true  // 这里一定要标记为true, 不然下次skeleton对象会一直重复实例化
            }
            else {
                playNode.moveTo(data.player.x, data.player.y, delayTime);
                playNode.actionParams.moveToTimeout = setTimeout(()=> {
                    playNode.actionParams.playNode = null
                    playNode.opacity = 0
                    playNode.completed = true
                    playNode.skeleton.completed = true
                    postMessage({
                        'message': 'recoverDaiJi',
                        'id': data.id
                    })

                    this.playerState[data.id] = false
                }, delayTime)
            }
        }, showTime + 100)
        // 重新恢复攻击pose
        if (data.action === 'chuchang') {
            playNode.scaleTo(playNode.scale * 1.2, 500)
        }
        if (!notSetPos) {
            setPos(playNode, data);
        }
        playNode.opacity = 1
        this.playZhiShiXian(playNode, data, animation)
    }

    // 播放指示线
    playZhiShiXian(playNode, data, animation) {
        // 攻击动作播放指示线动画
        if (data.action === 'GongJi') {
            if (playNode.actionParams.attackArgs) {
                let attackArgs = playNode.actionParams.attackArgs
                let dy = playNode.player.zhishixian
                if (dy != null) {
                    let delay = dy.delay
                    if (animation.playRate && delay) {
                        delay = delay - animation.playRate
                        if (delay < 0) {
                            delay = 0
                        }
                    }
                    setTimeout(() => {
                        let playBaoZha = () => {
                            for (let p of attackArgs.targets) {
                                let sprite = Object.assign({}, dy.effect)
                                // sprite.x = p.x
                                // sprite.y = attackArgs.bodySize.bodyHeight - p.y
                                let referNode = new HTMLElement(p.boundRect, attackArgs.bodySize)
                                this.anni.playSpine(sprite, {referNode: referNode})
                            }
                        }

                        let playZhishixian = () => {

                            let zhishixianTime = 0

                            // 计算当前角色和其他角色的角度. 参考十周年ui的指示线
                            for (let p of attackArgs.targets) {
                                let x2 = p.x
                                let y2 = p.y

                                let sprite = Object.assign({}, dy)

                                let x1, y1
                                // 获取当前攻击角色到被攻击角色的角度, 然后进行偏移
                                if (Array.isArray(playNode.x)) {
                                    x1 = attackArgs.bodySize.bodyWidth * playNode.x[1] + playNode.x[0]
                                } else {
                                    x1 = playNode.x
                                }

                                if (Array.isArray(playNode.y)) {
                                    y1 = attackArgs.bodySize.bodyHeight - attackArgs.bodySize.bodyHeight * playNode.y[1] - playNode.y[0]
                                } else {
                                    y1 = attackArgs.bodySize.bodyHeight - playNode.y
                                }

                                let angle = Math.round(Math.atan2(y1 - y2, x1 - x2) / Math.PI * 180)

                                sprite.angle = (dy.angle || 0) + 180 - angle

                                let startX = x1
                                let startY = y1

                                let endX = x2
                                let endY = attackArgs.bodySize.bodyHeight - y2
                                let getDis = (x1, x2, y1, y2) => {
                                    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
                                }

                                let getLineFunc = (x1, x2, y1, y2) => {
                                    // 斜率k
                                    let k = (y2 - y1) / (x2 - x1)
                                    let b = y2 - k * x2
                                    return (x) => {
                                        return k * x + b
                                    }
                                }
                                // sprite.x = endX
                                // sprite.y = endY


                                let dis = getDis(startX, x2, startY, y2)
                                if (dis < attackArgs.bodySize.bodyHeight / 2) {
                                    // let f = getLineFunc(startX, x2, startY, y2)
                                    // let newX = endX + (endX < startX ? -1 : 1) * attackArgs.bodySize.bodyHeight / 6
                                    // let newY = f(newX)
                                    // console.log('new...', newX, newY)
                                    sprite.scale = (sprite.scale || 1) * 0.6

                                    // sprite.x = newX
                                    // sprite.y = attackArgs.bodySize.bodyHeight - newY
                                }
                                let referNode = new HTMLElement(p.boundRect, attackArgs.bodySize)
                                let node = this.anni.playSpine(sprite, {referNode: referNode})
                                if (!zhishixianTime) {
                                    let ani = node.skeleton.data.animations[0]
                                    zhishixianTime = ani.duration
                                }
                                // node.moveTo(endX, endY, zhishixianTime * 1000)

                            }

                            // 加载指示线后面的爆炸特效
                            if (dy.effect) {
                                // 获取指示线的动画时间, 在到达武将框后播放
                                setTimeout(() => {
                                    if (!this.anni.hasSpine(dy.effect.name)) {
                                        this.anni.loadSpine(dy.effect.name, dy.effect.json ? 'json': 'skel', playBaoZha)
                                    } else {
                                        playBaoZha()
                                    }
                                }, zhishixianTime / (dy.speed || 1)  * 1000 * dy.effect.delay || 0.5)
                            }
                        }

                        if (!this.anni.hasSpine(dy.name)) {
                            this.anni.loadSpine(dy.name, dy.json ? 'json': 'skel', playZhishixian)
                        } else {
                            playZhishixian()
                        }
                    }, animation.showTime * (delay * 1000 || 0))

                }
            }
        }
    }

    // 手杀触发连续攻击不会马上回框, 而是会在原地重置攻击动作, 当回到框内, 则重新出框
    lianxuChuKuang(player, actionParams, data) {
        // 重置播放动作与回框倒计时.
        let playNode = actionParams.playNode
        // 这里说明上一次出框已经完成, 可能会让原来的待机显现, 保险起见, 再发一次隐藏的消息
        // 判断上次的动作是否播放完成.
        if (!this.anni.nodes.includes(playNode)) {
            playNode.skeleton.completed = true
            let playedSprite = this.anni.playSpine(playNode.actionParams)
            playedSprite.player = player
            playedSprite.actionParams = actionParams
            actionParams.playNode = playedSprite
            return this.playChuKuangSpine(playedSprite, {showTime: actionParams.showTime}, data)
        }

        console.log('连续出框spine...', actionParams.playNode.skeleton.state)
        let state = actionParams.playNode.skeleton.state
        let entry = state.tracks[0]
        let lastTime = entry.animationEnd
        let curTime = entry.animationLast

        playNode.player = player
        playNode.actionParams = actionParams
        if (actionParams.triggername !== 'useCardBefore' && data.action === 'GongJi' && playNode.actionParams.attackArgs) {
            if (curTime / lastTime >= 0.75) {
                entry.trackTime = 0
                console.log('多指重置')
            } else {
                lastTime = lastTime - curTime
                console.log('多指连续')
            }
        } else {
            if (curTime / lastTime >= 0.1) {
                entry.trackTime = 0
                console.log('重置----', curTime/lastTime, curTime)
            } else {
                lastTime = lastTime - curTime
                console.log('不重置------', curTime/lastTime, curTime)
            }
        }
        // if (!(actionParams.attackArgs && actionParams.multiZhiShi)) {
        //     playNode.skeleton.state.setAnimation(0, playNode.action, false);
        // }

        playNode.completed = false
        playNode.skeleton.completed = true
        let notSetPos = false
        if (!player.shizhounian) {
            // 比较当前位置和回框的位置距离, 如果比较小了, 就重新出框

            if ((Math.abs(playNode.renderY - data.player.y)) > data.player.height / 3 * 2 || Math.abs(playNode.renderX - data.player.x) > data.player.width / 3 * 2){
                notSetPos = true
            }
        }
        this.playChuKuangSpine(playNode, {showTime: lastTime, playRate: entry.trackTime / lastTime}, data, notSetPos)
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
        playedSprite.actionParams = actionParams
        actionParams.playNode = playedSprite

        this.playChuKuangSpine(playedSprite, {showTime: actionParams.showTime}, data);
    }

    errPlaySpine (data) {
        console.log('播放失败....', data)
    }

    // 补全配置参数 player: 这个是播放待机动作存取的配置参数
    completeParams(player) {
        if (!player) return
        // 给一些简化初始化方式的攻击参数补全
        let initPlayerGongJi = function () {
            if (!player.gongji) {
                player.gongji = {}
                player.qhlxAutoSetGongJi = true  // 用来标记是千幻页面没有设置gongji自动添加上的标记. 手杀是真动皮, 带有gongji标签
            } else if (typeof player.gongji === 'string') {
                player.gongji = {
                    action: player.gongji
                }
            } else if (player.gongji === true) {
                player.gongji = {}
                player.fakeDynamic = true
            }
        }
        if (player.qhlxBigAvatar) {
            if (player.qhlx) {
                if (player.qhlx.gongji) {
                    initPlayerGongJi()
                    player.gongji = Object.assign(player.gongji, player.qhlx.gongji)
                } else {
                    // 使用雷修默认的出框参数
                    initPlayerGongJi()
                    if (playerAnimation.isMobile) {
                        player.gongji.x = player.divPos.x + player.divPos.width / 2;
                        player.gongji.y = player.divPos.y + player.divPos.height / 2;
                        if (player.gongji.name === player.name) {
                            player.gongji.scale = player.scale * 0.6
                        } else {
                            player.gongji.scale = player.largeFactor * (player.gongji.scale || 1) * 0.55
                        }
                    } else {
                        player.gongji.x = player.divPos.x + player.divPos.width / 2;
                        player.gongji.y = player.divPos.y + player.divPos.height / 2;
                        player.gongji.scale = player.scale * 0.55
                    }
                }
            } else {
                initPlayerGongJi()
                console.log('player.divPos --> ', player.divPos)
                // fix 大屏预览参数使用雷修默认的出框偏移
                if (playerAnimation.isMobile) {
                    if (!player.gongji) {
                        player.gongji = {}
                    }
                    player.gongji.x = player.divPos.x + player.divPos.width / 2;
                    player.gongji.y = player.divPos.y + player.divPos.height / 2;
                    if (!player.gongji.name ||  player.gongji.name === player.name) {
                        player.gongji.scale = player.scale * 0.6
                    } else {
                        player.gongji.scale = player.largeFactor * (player.gongji.scale || 1) * 0.55
                    }
                } else {
                    player.gongji.x = player.divPos.x + player.divPos.width / 2;
                    player.gongji.y = player.divPos.y + player.divPos.height / 2;
                    player.gongji.scale = player.scale * 0.55
                }
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
        let xRate = data.player.x / data.player.bodyWidth
        if (xRate < 0.5) {
            apnode.x = data.player.x + data.player.width
        } else {
            apnode.x = data.player.x - data.player.width / 3
        }
        // apnode.x = data.player.x - data.player.width / 3
        apnode.y = data.player.y + data.player.height * 1.1
    } else {
        let xRate = data.player.x / data.player.bodyWidth
        let yRate = (data.player.y + data.player.height) / data.player.bodyHeight

        // 根据每个人当时的位置偏移
        apnode.x = data.player.x + data.player.width / 2
        apnode.y = data.player.y + data.player.height / 2 - 25
        if (xRate < 0.15) {
            apnode.x += data.player.width * 0.3
        }

        if (xRate > 0.85) {
            apnode.x -= data.player.width * 0.3
        }


        if (yRate > 0.9) {
            apnode.y -= data.player.height * 0.3
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
        data.player.y += 100
    } else {
        if (data.action === 'chuchang') {
            apnode.x = data.player.x + data.player.width / 2
            apnode.y = data.player.y + data.player.height / 2 - 20
            return // setShiZhouNianGongJiPos(apnode, data)
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
                                avatarPlayer.qhlxAutoSetGongJi = false
                                return true
                            }
                        }
                        if (avatarPlayer.qhlxAutoSetGongJi) {
                            return false
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
            }  else if (action === 'chuchang') {
                let results = playerAnimation.anni.getSpineActions(daijiName)
                if (results && results.length > 0) {
                    for (let r of results) {
                        if (r.name === actionParams.action) {
                            avatarPlayer.actionState[action] = {
                                action: r.name,
                                duration: r.duration,
                                showTime: actionParams.showTime ||  Math.min(results[0].duration, 2)
                            }
                            return true
                        }
                    }
                    // 使用第一个当作chuchang
                    avatarPlayer.actionState[action] = {
                        action: results[0].name,
                        duration: results[0].duration,
                        showTime: actionParams.showTime || Math.min(results[0].duration, 2)
                    }
                    return true
                }
                avatarPlayer.actionState[action] = false
            } else {
                avatarPlayer.actionState[action] = false
            }
            avatarPlayer.actionState[action] = false
        } else {
            // 查找骨骼与正确的标签
            let results = playerAnimation.anni.getSpineActions(actionParams.name);
            let isArray = Array.isArray(actionParams.action);
            let states = [];
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
            avatarPlayer.actionState[action] = false;
        }
    }
}

function isChuKuang(data) {
    // 如果已经是出框状态, 直接返回, 不能在短时间内连续请求
    let playerState = playerAnimation.playerState[data.id]
    if (playerState) {
        if (data.action === 'chuchang') {
            playerState['time'] = new Date().getTime()
        }
        else {
            console.log(playerState, new Date().getTime(), new Date().getTime() - playerState.time < 40)
            if (playerState.action != null && playerState.action !== data.action) {
                return
            }
            if (playerState.lastAction === 'chuchang' && playerState.time && new Date().getTime() - playerState.time <= 200) {
                return
            }
            // 延时100ms执行动作, 防止两次触发相近
            if (playerState.time && new Date().getTime() - playerState.time < 40) {
                // if (playerState.lastAction && playerState.lastAction !== data.action) {
                //     setTimeout(() => {
                //         isChuKuang(data)
                //     }, 100)
                // }
                return;
            }

        }

        // playerState['time'] = new Date().getTime()
        // playerState['lastAction'] = data.action
    }
    // else {
    //     playerAnimation.playerState[data.id] = {time: new Date().getTime(), lastAction: data.action}
    // }


    let primarySkinId = data.primarySkinId
    let deputySkinId = data.deputySkinId
    // 查找是否可以出框
    let primaryPlayer = playerAnimation.findPlayerParams(data.id, primarySkinId)

    let extraParams = data.extraParams

    if (completePlayerParams(primaryPlayer, data.action)) {
        if (!playerState) {
            playerAnimation.playerState[data.id] = {time: new Date().getTime(), lastAction: data.action};
        } else {
            playerAnimation.playerState[data.id].time = new Date().getTime()
            playerAnimation.playerState[data.id].lastAction =  data.action
        }


        let actionParams
        if (data.action === 'GongJi') actionParams = primaryPlayer.gongjiAction
        else if (data.action === 'chukuang') actionParams = primaryPlayer.chuchangAction
        else if (data.action === 'TeShu') actionParams = primaryPlayer.teshuAction
        else actionParams = primaryPlayer[data.action + 'Action']
        if (extraParams) {
            if (actionParams) {
                for (let k in extraParams) {
                    actionParams[k] = extraParams[k]
                }
            }
        }
        clearTimeout(actionParams.moveToTimeout)
        clearTimeout(actionParams.showTimeout)


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

        if (!playerState) {
            playerAnimation.playerState[data.id] = {time: new Date().getTime(), lastAction: data.action};
        } else {
            playerAnimation.playerState[data.id].time = new Date().getTime()
            playerAnimation.playerState[data.id].lastAction =  data.action
        }

        let actionParams
        if (data.action === 'GongJi') actionParams = deputyPlayer.gongjiAction
        else if (data.action === 'chukuang') actionParams = deputyPlayer.chuchangAction
        else if (data.action === 'TeShu') actionParams = deputyPlayer.teshuAction
        else actionParams = deputyPlayer[data.action + 'Action']
        if (extraParams) {
            if (actionParams) {
                for (let k in extraParams) {
                    actionParams[k] = extraParams[k]
                }
            }
        }
        // 需要重新出框了, 清除原来的出框消息
        clearTimeout(actionParams.moveToTimeout)
        clearTimeout(actionParams.showTimeout)
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

onmessage = function (e) {
    let data = e.data
    switch (data.message) {
        case 'CREATE':
            createChuKuang(data)
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
    }

}