/** dynamicWorker.js ***/  // 暂时先尝试加个配置文件, 以后可能会用到.
let dwStopTimes = 10  // stop函数停止次数

let dwDefaultDaiJiAction = ['DaiJi', 'play']  // 默认的待机标签, 忽略大小写

let dwBeiJingDaiJiActions = ['DaiJi', 'BeiJing', 'play']  // 背景的待机标签. 版本比较多

let isAttackFlipX = false  // 攻击出框是否翻转. 当在屏幕左边往右翻转, 否则默认

