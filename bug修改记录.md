1. 某些手机不支持click事件
fix: 每个div绑定点击事件加一层判断是否是触屏, 然后绑定torch或者click事件

2. 场上有其他动皮会出现动皮出框然后无法返回原皮肤框的问题
fix: 当前主线程和worker通信的过程是发改变的消息, 然后每次都给主线程的workder对象重新赋值onmessage方法, 
这样可能会吞掉消息, 这个根本原因是原来十周年的DynamicPlayer对象内部只维护了2个worker. 每个worker内部维护4个动皮.
所以主线程的前两个player对应的dynamic对象的render是同一个. 这样的当场上这两个角色同时触发技能, 并且都修改对应render
的onmessage方法, 就会出现吞消息的情况, 进而导致无法返回原始皮肤框. 