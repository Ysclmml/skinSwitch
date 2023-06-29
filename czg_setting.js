// 藏珍阁设置

window.skinSwitch.czgSettings = {
    // 所有盒子固定的保底道具
    drawCount: 50,  // 一次抽取的数量
    fixed: [
        {id: '600012', name: '将魂', count: 2},
        {id: '620281', name: '心愿积分', count: 1},
        {id: '620038', name: '雁翎', count: 2},
    ],

    // 所有盒子
    boxes: [
        {
            name: '端午盒子',
            isHot: true,  // 是否是热门销售
            tip: '2023年端午活动首发，后续请关注每周末限时活动', // 显示在抽取上面的提示小字
            xishizhenbao: {
                id: 'shen_guojia',
                name: '神郭嘉'
            }, // 稀世珍宝, 图片放入cangZhenGe/bskin目录下
            // 盒子内的所有的道具设置
            items: [
                // 如果是武将, 需要注明type为wujiang, 并且id为武将在无名杀的id, 并且需要将图片放入wujiang目录下,
                // 如果是道具, id对应资源文件的名称, 图片放入items目录下
                // 如果有gaoji标识, 表示这是高级物品
                // 稀有
                {id: 'shen_guojia', name: '神郭嘉', weight: 1, type: 'wujiang', gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 1, itemName: '史诗宝珠*66', count: 66, gaoji: true},
                {id: 'majun', name: '马钧', weight: 5, type: 'wujiang', gaoji: true},
                {id: 'huaman', name: '花蔓', weight: 10, type: 'wujiang', gaoji: true},
                {id: '620138', name: '雪中舞刃*张春华动态皮肤', weight: 10, gaoji: true},
                {id: '600012', name: '将魂', weight: 15, itemName: '将魂*1000', count: 1000},
                {id: '620150', name: '史诗宝珠', weight: 100, itemName: '史诗宝珠*1', gaoji: true},
                // 精良
                {id: 'ruanhui', name: '阮慧', weight: 100, type: 'wujiang'},
                {id: '620046', name: '菜篮子', weight: 200, itemName: '菜篮子*99', count: 99},
                {id: '620149', name: '史诗宝珠碎片', weight: 200},
                {id: '600008', name: '招募令', weight: 1000},
                {id: '600020', name: '雁翎甲', weight: 1000},
                {id: '620039', name: '进阶丹', weight: 1000, count: 2},

                // 普通
                {id: '600006', name: '点将卡', weight: 3000, count: 2},
                {id: '600003', name: '手气卡', weight: 5000, count: 2},
                {id: '600007', name: '换将卡', weight: 5000, count: 2},
                {id: '620046', name: '菜篮子', weight: 1360, count: 2},
                {id: '20003', name: '欢乐豆', weight: 1000, itemName: '欢乐豆*50', count: 50},
                {id: '620153', name: '史诗体验卡', weight: 1000},
            ]
        },
        {
            name: '清明盒子',
            isHot: true,  // 是否是热门销售
            xishizhenbao: {
                id: 're_jushou',
                name: '界答辩'
            }, // 稀世珍宝, 图片放入cangZhenGe/bskin目录下
            tip: '2023年清明活动首发，抽盒小赌怡情, 大赌伤身', // 显示在抽取上面的提示小字
            // 盒子内的所有的道具设置
            items: [
                // 如果是武将, 需要注明type为wujiang, 并且id为武将在无名杀的id, 并且需要将图片放入wujiang目录下,
                // 如果是道具, id对应资源文件的名称, 图片放入items目录下

                // 稀有
                {id: 're_jushou', name: '界答辩', weight: 1, type: 'wujiang',gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 1, itemName: '史诗宝珠*66', count: 66,gaoji: true},
                {id: 're_xusheng', name: '界徐盛', weight: 20, type: 'wujiang',gaoji: true},
                {id: 'huaman', name: '花蔓', weight: 10, type: 'wujiang',gaoji: true},
                {id: '620138', name: '雪中舞刃*张春华动态皮肤', weight: 10,gaoji: true},
                {id: '600012', name: '将魂', weight: 15, itemName: '将魂*1000', count: 1000,gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 100, itemName: '史诗宝珠*1',gaoji: true},
                // 精良
                {id: 'ruanhui', name: '阮慧', weight: 100, type: 'wujiang'},
                {id: '620046', name: '菜篮子', weight: 200, itemName: '菜篮子*99', count: 99},
                {id: '620149', name: '史诗宝珠碎片', weight: 200},
                {id: '600008', name: '招募令', weight: 1000},
                {id: '600020', name: '雁翎甲', weight: 1000},
                {id: '620039', name: '进阶丹', weight: 1000, count: 2},

                // 普通
                {id: '600006', name: '点将卡', weight: 3000, count: 2},
                {id: '600003', name: '手气卡', weight: 5000, count: 2},
                {id: '600007', name: '换将卡', weight: 5000, count: 2},
                {id: '620046', name: '菜篮子', weight: 1360, count: 2},
                {id: '20003', name: '欢乐豆', weight: 1000, itemName: '欢乐豆*50', count: 50},
                {id: '620153', name: '史诗体验卡', weight: 1000},
            ]
        },
        {
            name: '牛年盒子',
            isHot: false,  // 是否是热门销售
            tip: '2023年牛年活动首发，后续请关注每周末限时活动', // 显示在抽取上面的提示小字
            xishizhenbao: {
                id: 'shen_ganning',
                name: '神甘宁'
            }, // 稀世珍宝, 图片放入cangZhenGe/bskin目录下
            // 盒子内的所有的道具设置
            items: [
                // 如果是武将, 需要注明type为wujiang, 并且id为武将在无名杀的id, 并且需要将图片放入wujiang目录下,
                // 如果是道具, id对应资源文件的名称, 图片放入items目录下

                // 稀有
                {id: 'shen_ganning', name: '神甘宁', weight: 1, type: 'wujiang',gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 1, itemName: '史诗宝珠*66', count: 66, gaoji: true},
                {id: 'majun', name: '马钧', weight: 5, type: 'wujiang', gaoji: true},
                {id: 'huaman', name: '花蔓', weight: 10, type: 'wujiang', gaoji: true},
                {id: '620138', name: '雪中舞刃*张春华动态皮肤', weight: 10, gaoji: true},
                {id: '600012', name: '将魂', weight: 15, itemName: '将魂*1000', count: 1000, gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 100, itemName: '史诗宝珠*1', gaoji: true},
                // 精良
                {id: 'ruanhui', name: '阮慧', weight: 100, type: 'wujiang'},
                {id: '620046', name: '菜篮子', weight: 200, itemName: '菜篮子*99', count: 99},
                {id: '620149', name: '史诗宝珠碎片', weight: 200},
                {id: '600008', name: '招募令', weight: 1000},
                {id: '600020', name: '雁翎甲', weight: 1000},
                {id: '620039', name: '进阶丹', weight: 1000, count: 2},

                // 普通
                {id: '600006', name: '点将卡', weight: 3000, count: 2},
                {id: '600003', name: '手气卡', weight: 5000, count: 2},
                {id: '600007', name: '换将卡', weight: 5000, count: 2},
                {id: '620046', name: '菜篮子', weight: 1360, count: 2},
                {id: '20003', name: '欢乐豆', weight: 1000, itemName: '欢乐豆*50', count: 50},
                {id: '620153', name: '史诗体验卡', weight: 1000},
            ]
        },
        {
            name: '春节盒子',
            isHot: false,  // 是否是热门销售
            tip: '2023年春节活动首发，后续请关注每周末限时活动', // 显示在抽取上面的提示小字
            xishizhenbao: {
                id: 're_jushou',
                name: '界答辩'
            }, // 稀世珍宝, 图片放入cangZhenGe/bskin目录下
            // 盒子内的所有的道具设置
            items: [
                // 如果是武将, 需要注明type为wujiang, 并且id为武将在无名杀的id, 并且需要将图片放入wujiang目录下,
                // 如果是道具, id对应资源文件的名称, 图片放入items目录下

                // 稀有
                {id: 're_jushou', name: '界答辩', weight: 1, type: 'wujiang', gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 1, itemName: '史诗宝珠*66', count: 66, gaoji: true},
                {id: 'majun', name: '马钧', weight: 5, type: 'wujiang', gaoji: true},
                {id: 'huaman', name: '花蔓', weight: 10, type: 'wujiang', gaoji: true},
                {id: '620138', name: '雪中舞刃*张春华动态皮肤', weight: 10, gaoji: true},
                {id: '600012', name: '将魂', weight: 15, itemName: '将魂*1000', count: 1000, gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 100, itemName: '史诗宝珠*1', gaoji: true},
                // 精良
                {id: 'ruanhui', name: '阮慧', weight: 100, type: 'wujiang'},
                {id: '620046', name: '菜篮子', weight: 200, itemName: '菜篮子*99', count: 99},
                {id: '620149', name: '史诗宝珠碎片', weight: 200},
                {id: '600008', name: '招募令', weight: 1000},
                {id: '600020', name: '雁翎甲', weight: 1000},
                {id: '620039', name: '进阶丹', weight: 1000, count: 2},

                // 普通
                {id: '600006', name: '点将卡', weight: 3000, count: 2},
                {id: '600003', name: '手气卡', weight: 5000, count: 2},
                {id: '600007', name: '换将卡', weight: 5000, count: 2},
                {id: '620046', name: '菜篮子', weight: 1360, count: 2},
                {id: '20003', name: '欢乐豆', weight: 1000, itemName: '欢乐豆*50', count: 50},
                {id: '620153', name: '史诗体验卡', weight: 1000},
            ]
        },
        {
            name: '春分盒子',
            isHot: false,  // 是否是热门销售
            tip: '2023年春分活动首发，后续请关注每周末限时活动', // 显示在抽取上面的提示小字
            xishizhenbao: {
                id: 'sunhanhua',
                name: '孙寒华'
            }, // 稀世珍宝, 图片放入cangZhenGe/bskin目录下
            // 盒子内的所有的道具设置
            items: [
                // 如果是武将, 需要注明type为wujiang, 并且id为武将在无名杀的id, 并且需要将图片放入wujiang目录下,
                // 如果是道具, id对应资源文件的名称, 图片放入items目录下

                // 稀有
                {id: 'sunhanhua', name: '孙寒华', weight: 1, type: 'wujiang', gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 1, itemName: '史诗宝珠*33', count: 33, gaoji: true},
                {id: 'majun', name: '马钧', weight: 5, type: 'wujiang', gaoji: true},
                {id: 'huaman', name: '花蔓', weight: 10, type: 'wujiang', gaoji: true},
                {id: '620138', name: '雪中舞刃*张春华动态皮肤', weight: 10, gaoji: true},
                {id: '600012', name: '将魂', weight: 15, itemName: '将魂*1000', count: 1000, gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 100, itemName: '史诗宝珠*1', gaoji: true},
                // 精良
                {id: 'ruanhui', name: '阮慧', weight: 100, type: 'wujiang'},
                {id: '620046', name: '菜篮子', weight: 200, itemName: '菜篮子*99', count: 99},
                {id: '620149', name: '史诗宝珠碎片', weight: 200},
                {id: '600008', name: '招募令', weight: 1000},
                {id: '600020', name: '雁翎甲', weight: 1000},
                {id: '620039', name: '进阶丹', weight: 1000, count: 2},

                // 普通
                {id: '600006', name: '点将卡', weight: 3000, count: 2},
                {id: '600003', name: '手气卡', weight: 5000, count: 2},
                {id: '600007', name: '换将卡', weight: 5000, count: 2},
                {id: '620046', name: '菜篮子', weight: 1360, count: 2},
                {id: '20003', name: '欢乐豆', weight: 1000, itemName: '欢乐豆*50', count: 50},
                {id: '620153', name: '史诗体验卡', weight: 1000},
            ]
        },
        {
            name: '冬至盒子',
            isHot: false,  // 是否是热门销售
            tip: '2023年冬至活动首发，后续请关注每周末限时活动', // 显示在抽取上面的提示小字
            xishizhenbao: {
                id: 'shen_xunyu',
                name: '神荀彧'
            }, // 稀世珍宝, 图片放入cangZhenGe/bskin目录下
            // 盒子内的所有的道具设置
            items: [
                // 如果是武将, 需要注明type为wujiang, 并且id为武将在无名杀的id, 并且需要将图片放入wujiang目录下,
                // 如果是道具, id对应资源文件的名称, 图片放入items目录下

                // 稀有
                {id: 'shen_xunyu', name: '神荀彧', weight: 1, type: 'wujiang', gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 1, itemName: '史诗宝珠*66', count: 66, gaoji: true},
                {id: 'majun', name: '马钧', weight: 5, type: 'wujiang', gaoji: true},
                {id: 'huaman', name: '花蔓', weight: 10, type: 'wujiang', gaoji: true},
                {id: '620138', name: '雪中舞刃*张春华动态皮肤', weight: 10, gaoji: true},
                {id: '600012', name: '将魂', weight: 15, itemName: '将魂*1000', count: 1000, gaoji: true},
                {id: '620150', name: '史诗宝珠', weight: 100, itemName: '史诗宝珠*1', gaoji: true},
                // 精良
                {id: 'ruanhui', name: '阮慧', weight: 100, type: 'wujiang'},
                {id: '620046', name: '菜篮子', weight: 200, itemName: '菜篮子*99', count: 99},
                {id: '620149', name: '史诗宝珠碎片', weight: 200},
                {id: '600008', name: '招募令', weight: 1000},
                {id: '600020', name: '雁翎甲', weight: 1000},
                {id: '620039', name: '进阶丹', weight: 1000, count: 2},

                // 普通
                {id: '600006', name: '点将卡', weight: 3000, count: 2},
                {id: '600003', name: '手气卡', weight: 5000, count: 2},
                {id: '600007', name: '换将卡', weight: 5000, count: 2},
                {id: '620046', name: '菜篮子', weight: 1360, count: 2},
                {id: '20003', name: '欢乐豆', weight: 1000, itemName: '欢乐豆*50', count: 50},
                {id: '620153', name: '史诗体验卡', weight: 1000},
            ]
        },
    ],

}