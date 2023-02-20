window.pfqhLive2dSettings = {

    // 默认的配置,每个模型可以覆盖配置
    baseSetting:{
        width: 0.2,
        height: 0.4,
        left: "120px",
        bottom: "180px",
        basePath: 'extension/皮肤切换/live2d_assets/',  // 存放基础的路径
        opacity: 1,   // 透明度
        mobile: true,
        draggable: true,  // 是否可拖拽
        pierceThrough: true,
        scaleFactor: 1.5,
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

    }
}