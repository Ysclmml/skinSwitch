1. 某些手机不支持click事件
fix: 每个div绑定点击事件加一层判断是否是触屏, 然后绑定torch或者click事件

2. 场上有其他动皮会出现动皮出框然后无法返回原皮肤框的问题
fix: 当前主线程和worker通信的过程是发改变的消息, 然后每次都给主线程的workder对象重新赋值onmessage方法, 
这样可能会吞掉消息, 这个根本原因是原来十周年的DynamicPlayer对象内部只维护了2个worker. 每个worker内部维护4个动皮.
所以主线程的前两个player对应的dynamic对象的render是同一个. 这样的当场上这两个角色同时触发技能, 并且都修改对应render
的onmessage方法, 就会出现吞消息的情况, 进而导致无法返回原始皮肤框. 
现在把每个角色的动皮的onmessage方法分开管理了,防止同一个worker.onmessage消息互相覆盖

3. 攻击动作又是会闪屏
因为现在动皮出框的原理是每一个动态皮肤都是一个十周年UI定义的AnimationPlayer对象, 内部维护者一个
canvas, 平时待机状态这个canvas的大小就是角色动态皮肤框的大小. 因为worker无法操作dom元素, 所以出框就是让
worker向主线程发一个消息 告诉要角色要出框了, 需要把自己的动态框的canvas变成全屏大小, 这样就可以有一个"出框"
的效果. 
现在的问题就是加载骨骼需要时间, 而canvas大小变化的一瞬间原来的图像就会拉伸. 当前采用定时器延时等待动画播放还是不能非常的
好解决这问题.. 现在就采用150ms还是偶尔还是会闪烁

12-11. 不使用原来的出框逻辑了. 
重新写了一个worker管理离屏出框的canvas, 专门负责所有角色的出框渲染. 这样原来只要在进行出框的时候,隐藏原来的骨骼, 
直接在出框canvas播放出框动画. 完全不涉及到闪屏的问题. 这样也能够解决出框大小和待机大小不一样时, 回框的瞬间
会拉伸的不协调问题. 

现在的出框逻辑是:
+1 当前角色触发攻击动作
+2 请求出框worker查看是否可以出框
    如果可以: 向主线程发送准备出框
        主线程向动皮worker发送准备出框的消息, 动皮待机的皮隐藏节点. 隐藏结束后发送隐藏结束的消息
        主线程发送可以开始播放动画的消息. 
        出框worker动画播放完毕, 向主线程发送出框完毕的消息. 
        主线程接收到动画播放完毕的消息, 向动皮worker发出恢复隐藏节点的消息
        动皮worker节点恢复
    如果不可以: 向主线程发送不可以出框
    
 
4. 皮肤框会出现多个角色
这个原因是在自定义等模式中或者由于其他原因导致同一个角色初始化两次, 虽然扩展的插件插件有stop函数,
但是因为角色初始化速度太快,worker的动皮还没初始化好就取调用stop函数, 当然会删除失败. 

fix: 所以需要修改动皮初始化的逻辑, 并且修改worker的stop逻辑, 当删除为空的时候, 等待200ms重新尝试删除.
这样就能防止场上出现多个动皮重影



5. 修改保存无效, 重新读取出bug

6. 出框偶尔会有两个, 到时看看这个问题

7. 十周年UI的出框背景会盖住边框样式.
2022-12-11. 解决方法很简单, 我把原来的十周年UI定义的动皮框dynamic-wrap和背景分开了. 
2022-12-12. 当然现在重写了出框逻辑, 就不会存在这个问题了, 因为不修改动皮框的层级了. 上面的解决方法也用不到了

8. 会变身技能的需要更换骨骼进行加载
这个在写的时候完全没有考虑到, 比如三娘,孙翊
原因找到了, 就是角色变身会使用reinit函数. 然后reinit函数调用playDynamic函数时没有添加player参数


9. 双将没有背景了. 播放动皮黑屏空挡
无名杀因为有自由选将. 无法提前加载所选角色的骨骼, 所以在只设置了动态背景下, 导致开局角色框会有一小会的
空现象. 当然这个在动皮越少, 加载时间也越小, 空档时间也就越小.
解决方法之一就是用原来的静皮先代替着, 动态背景加载后会覆盖该静态背景

10. 动静皮切换在双将模式下更换失败
没有设置和取消d-skin1和d-skin2类

11. 双将模式下, 副将发动复活技能却把主将给替换了的bug
原来遗留的bug.

12. 动态背景在双将模式下会遮盖武将
解决方法就是给每个annimationPlayer的nodes排个序, 优先渲染背景即可


13. todo
千幻雷音当前版本使用动皮会在国战模式下, 直接显示, 失去了隐藏的效果, 待修正...

14. 手杀原来老皮肤背景还有叫play的

15. spine4.0修改骨骼透明度不能直接修改skeleton.opacity = 1来修改透明度了
需要设置color来改变透明度 --->  skeleton.color.a = 0.5
https://forum.cocos.org/t/topic/135360/3获取答案

记录: 
每次更新功能后需要测试的内容汇总
1. 假动皮的播放情况
2. 手杀动皮的播放情况 (待机, 出框, 攻击)
3. 十周年UI真动皮的播放情况
4. 会变身技能触发reinit函数动皮的播放情况
5. 使用原始千幻聆音修改静皮的情况
6. 使用千幻雷修的修改动皮情况
7. 使用千幻雷修的手杀大屏预览功能
8. 自己的所有角色修改动皮的状况


1.16版本
有时候不出框
修复千幻十周年样式点击不出框的问题. 千幻样式的兼容.
点击修改问题

偶尔出框问题?  
扩展函数加载完成后, 后面添加的trigger没有效果. 


顶掉觉醒技能问题

