// 用来转化D扩展的参数, 生成新的参数在本地文件

window.pfqhUtils = {

    // 将D的动皮参数转换为皮肤切换的动皮参数, 写入到扩展目录文件夹
    transformDdyskins: (dskins) => {
        if (!dskins) return
        let stringBuffer = []
        stringBuffer.push(`'use strict';
decadeModule.import(function(lib, game, ui, get, ai, _status){
\t/*
\t十周年UI动皮使用说明：
\t- 首先打开动态皮肤的开关，直接替换原有武将皮肤显示；
\t- 目前不支持动态皮肤的切换功能；
\t- 动态皮肤参数表在线文档链接：https://docs.qq.com/sheet/DS2Vaa0ZGWkdMdnZa；可以在群在线文档提供你设置好的参数
\t- 所有相关的文件请放到\t十周年UI/assets/dynamic目录下；
\t- 关于格式请参考下面示例：
\t\t武将名:{
\t\t\t皮肤名:{
\t\t\t\tname: "xxx",\t//\t必★填\t骨骼名称，一般是yyy.skel，注意xxx不带后缀名.skel；
\t\t\t\taction: "xxx",\t//\t可删掉\t播放动作，xxx 一般是 DaiJi，目前手杀的骨骼文件需要填；
\t\t\t\tx: [10, 0.5],\t//\t可删掉\t[10, 0.5]相当于 left: calc(10px + 50%)，不填默认为[0, 0.5]；
\t\t\t\ty: [10, 0.5],\t//\t可删掉\t[10, 0.5]相当于 bottom: calc(10px + 50%)，不填默认为[0, 0.5]；
\t\t\t\tscale: 0.5,\t\t//\t可删掉\t缩放大小，不填默认为1；
\t\t\t\tangle: 0,\t\t//\t可删掉\t旋转角度，不填默认为0；
\t\t\t\tspeed: 1,\t\t//\t可删掉\t播放速度，不填默认为1；
\t\t\t\thideSlots: ['隐藏的部件'],\t// 隐藏不需要的部件，想知道具体部件名称请使用SpineAltasSplit工具查看
\t\t\t\tclipSlots: ['裁剪的部件'],\t// 剪掉超出头的部件，仅针对露头动皮，其他勿用
\t\t\t\tbackground: "xxx.jpg",\t//\t可删掉\t背景图片，注意后面要写后缀名，如.jpg .png等 
\t\t\t}
\t\t},
\t- 为了方便得到动皮的显示位置信息，请在游戏选将后，用控制台或调试助手小齿轮执行以下代码(没用到的属性请删掉以免报错):
\t\tgame.me.stopDynamic();
\t\tgame.me.playDynamic({
\t\t\tname: 'xxxxxxxxx',\t\t// 勿删
\t\t\taction: undefined,
\t\t\tspeed: 1,
\t\t\tloop: true,\t\t\t\t// 勿删
\t\t\tx: [0, 0.5],
\t\t\ty: [0, 0.5],
\t\t\tscale: 0.5,
\t\t\tangle: 0,
\t\t\thideSlots: ['隐藏的部件'],\t// 隐藏不需要的部件，想知道具体部件名称请使用SpineAltasSplit工具查看
\t\t\tclipSlots: ['裁剪的部件'],\t// 剪掉超出头的部件，仅针对露头动皮，其他勿用
\t\t});
\t\t// 这里可以改成  }, true);  设置右将动皮
\t*/
\t
\tdecadeUI.dynamicSkin = {\n`)

        // 首先筛选出, 一模一样的, 放入extend中
        let extendsWujiang = {}
        let to_extend_map = {}
        for (let wujiang in dskins) {
            let to_extend = null
            for (let w in extendsWujiang) {
                if (w !== wujiang && dskins[wujiang] === extendsWujiang[w]) {
                    to_extend = w
                    break
                }
            }
            if (to_extend) {
                if (!(to_extend in to_extend_map)) {
                    to_extend_map[to_extend] = []
                }
                to_extend_map[to_extend].push(wujiang)
            } else {
                extendsWujiang[wujiang] = dskins[wujiang]
            }
        }

        // 遍历所有D动皮皮肤动皮参数, 进行写入本地文件.
        for (let wujiang in dskins) {
            if (!(wujiang in extendsWujiang)) continue

            let skins = dskins[wujiang]
            stringBuffer.push(`\t\t${wujiang}: {\n`)
            for (let skinName in skins) {
                stringBuffer.push(`\t\t\t${skinName}: {\n`)
                let skin = skins[skinName]
                let daijiParams = {}
                let gongjiParams = null
                let teshuParams = null
                let chuchangParams = null
                for (let k in skin) {
                    if (k === 'effects') {
                        // 只有当effects是对象时进行操作
                        if (typeof skin[k] === 'object') {
                            if (skin.effects.chuchang) {
                                if (typeof skin.effects.chuchang === 'string') {
                                    chuchangParams = {name: skin.effects.chuchang}
                                } else {
                                    chuchangParams = skin.effects.chuchang;
                                }
                            }
                            if (skin.effects.gongji) {
                                if (typeof skin.effects.gongji === 'string') {
                                    gongjiParams = {name: skin.effects.gongji}
                                } else {
                                    gongjiParams = skin.effects.gongji;
                                }
                            }
                            if (skin.effects.jineng) {
                                if (typeof skin.effects.gongji === 'string') {
                                    teshuParams = {name: skin.effects.jineng}
                                } else {
                                    teshuParams = skin.effects.jineng
                                }
                            }
                        }
                    } else if (k === 'dynamicBackground') {
                        if (typeof skin[k] === 'string') {
                            daijiParams['beijing'] = {name: skin[k]}
                        } else {
                            daijiParams['beijing'] = skin[k]
                        }
                    } else {
                        if (skin[k] === undefined || k === 'gongji' || k === 'chuchang' || k === 'teshu') {
                            continue
                        }
                        daijiParams[k] = skin[k]
                    }
                }
                if (skin.mirror) {
                    daijiParams.atkFlipX = true  // 添加翻转
                }
                if (skin.decade) {
                    daijiParams.shizhounian = true
                }
                // 当如果添加了json参数, 给所有的骨骼都添加上json参数
                if (skin.json) {
                    for (let p of [gongjiParams, teshuParams, chuchangParams]) {
                        if (p) {
                            p.json = skin.json
                        }
                    }
                }

                // 开始填写皮肤切换参数.
                for (let k in daijiParams) {
                    stringBuffer.push(`\t\t\t\t${k}: ${JSON.stringify(daijiParams[k])},\n`)
                }

                if (chuchangParams) {
                    stringBuffer.push(`\t\t\t\tchuchang: {\n`)
                    for (let k in chuchangParams) {
                        stringBuffer.push(`\t\t\t\t\t${k}: ${JSON.stringify(chuchangParams[k])},\n`)
                    }
                    stringBuffer.push(`\t\t\t\t},\n`)
                }

                if (gongjiParams) {
                    stringBuffer.push(`\t\t\t\tgongji: {\n`)
                    for (let k in gongjiParams) {
                        stringBuffer.push(`\t\t\t\t\t${k}: ${JSON.stringify(gongjiParams[k])},\n`)
                    }
                    stringBuffer.push(`\t\t\t\t},\n`)
                }

                if (teshuParams) {
                    stringBuffer.push(`\t\t\t\tteshu: {\n`)
                    for (let k in teshuParams) {
                        stringBuffer.push(`\t\t\t\t\t${k}: ${JSON.stringify(teshuParams[k])},\n`)
                    }
                    stringBuffer.push(`\t\t\t\t},\n`)
                }
                stringBuffer.push(`\t\t\t},\n`)

            }
            stringBuffer.push(`\t\t},\n`)
        }
        stringBuffer.push('\t}\n')
        // 写extends
        stringBuffer.push('\n')
        stringBuffer.push('\tvar extend = {\n')
        for (let k in to_extend_map) {
            for (let mm of to_extend_map[k]) {
                stringBuffer.push(`\t\t${mm}: decadeUI.dynamicSkin.${k},\n`)
            }
        }
        stringBuffer.push('\t}\n')
        stringBuffer.push('\tdecadeUI.get.extend(decadeUI.dynamicSkin, extend);\n')

        stringBuffer.push('})\n')


        return stringBuffer.join('')
    }
}