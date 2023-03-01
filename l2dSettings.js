window.pfqhLive2dSettings = {

    // 默认的配置,每个模型可以覆盖配置
    baseSetting:{
        width: 0.2,  // 占屏幕的百分比
        height: 0.4,  // 占屏幕的宽度
        left: "120px",
        bottom: "180px",
        basePath: 'extension/皮肤切换/live2d_assets/',  // 存放基础的路径
        opacity: 1,   // 透明度
        mobile: true,
        draggable: true,  // 是否可拖拽
        pierceThrough: true,
        scaleFactor: 1.5,
        volume: 0.3,  // 默认的语音播放音量大小  0-1
        // scale: xxx,  // 不写自适应
        // x: xxx  // x坐标
        // y: yyy  // y坐标 可以重新定义
    },
    models: {
        // 对于每个模型都可以覆盖上面配置, 基础信息皆可覆盖
        dafeng_4: {
            role: 'dafeng_4/dafeng_4.model3.json',
            name: 'dafeng_4',  // 显示在选项上的, 默认为key
        },
        dafeng_2: {
            role: 'dafeng_2/dafeng_2.model3.json',
            name: 'dafeng_2',  //
            width: 0.2,  // 可以覆盖默认的宽度'
            height: 0.4,
            left: "120px",
            bottom: "180px",
        },
        pinghai_6: {
            role: 'pinghai_6/pinghai_6.model3.json',
            name: 'pinghai_6',  // 显示在选项上的, 默认为key
        },
        kubo_2: {
            role: 'kubo_2/kubo_2.model3.json',
            name: 'kubo_2',  // 显示在选项上的, 默认为key
        },
        dujiaoshou_4: {
            role: 'dujiaoshou_4/dujiaoshou_4.model3.json',
            name: 'dujiaoshou_4',  //
        },
        live2dnewgunpa157501: {
            role: 'live2dnewgunpa157501/live2dnewgunpa157501.model3.json',
            name: 'live2dnewgunpa157501',  //
        },
        yorktown: {
            role: 'Yorktown_l2d/yorktown_stand.model3.json',
            name: 'yorktown',  //
        },
        c000_10: {
            role: 'c000_10/MOC.c000_10.json',
            name: 'c000_10',  //
        },
        c086_02: {
            role: 'c086_02/MOC.c086_02.json',
            name: 'c086_02',  //
        },
        sc065_01: {
            role: 'sc065_01/MOC.sc065_01.json',
            name: 'sc065_01',  //
        },
        sc394_01: {
            role: 'sc394_01/MOC.sc394_01.json',
            name: 'sc394_01',  //
        },
        test: {
            role: 'test/model.json',
            name: 'test',  //
        },
        test2: {
            role: 'test2/model.json',
            name: 'test2',  //
        } ,
        dafeng_3: {
            role: 'dafeng_3/dafeng_3.model3.json',
            name: 'dafeng_3',  //
        },
        daofeng_4_hx: {
            role: 'daofeng_4_hx/daofeng_4_hx.model3.json',
            name: 'daofeng_4_hx',  //
        },
        daofeng_5: {
            role: 'daofeng_5/daofeng_5.model3.json',
            name: 'daofeng_5',  //
        },
        daofeng_5_hx: {
            role: 'daofeng_5_hx/daofeng_5_hx.model3.json',
            name: 'daofeng_5_hx',  //
        },

    }
}