/*
 * @!: *********************************************************************
 * @Author: Weidows
 * @LastEditors: Weidows
 * @Date: 2023-02-04 20:29:50
 * @LastEditTime: 2023-02-10 00:46:44
 * @FilePath: \Blog-private\source\_posts\Web\JavaScript\Live2dLoader\src\Live2dLoader.js
 * @Description: live2d loader
 * @?: *********************************************************************
 */

// Under two lines for dev to see functions, Comment before Commit.
// import * as PIXI from "pixi.js";
// import * as live2d from "pixi-live2d-display";

// 来自于 https://github.com/Weidows-projects/Live2dLoader  修改
var live2d = PIXI.live2d;

var CustomLive2dLoader = class Live2dLoader {
    constructor(models) {
        let config = models[0];
        if (!config.mobile && this.isMobile()) return;
        this.load(config);
    }

    getLive2dIndex(models) {
        let index = -1;

        document.cookie.split(";").forEach((cookie) => {
            // test=test
            let cookieMap = cookie.split("=");
            // live2d=1
            // 筛选出 live2d-cookie, 并作越界判断
            if (
                cookieMap[0].trim() == "live2d" &&
                cookieMap[1] >= 0 &&
                cookieMap[1] < models.length
            )
                index = cookieMap[1];
        });

        if (index === -1) {
            index = Math.floor(Math.random() * models.length);
            document.cookie =
                `live2d=${index}; expires=` +
                new Date(Date.now() + 86400e3).toUTCString();
        }
        return index;
    }

    isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent));
    }

    async load(config) {
        let canvas = document.createElement("canvas");
        canvas.id = "l2dCanvas";
        document.body.appendChild(canvas);
        this.canvas = canvas
        canvas.style.position = "fixed";
        canvas.style.zIndex = '2'
        // canvas.style.border = '1px solid red'
        if (config.left) canvas.style.left = config.left;
        if (config.right) canvas.style.right = config.right;
        if (config.top) canvas.style.top = config.top;
        else if (config.bottom) canvas.style.bottom = config.bottom;
        else canvas.style.bottom = 0;
        if (config.opacity) canvas.style.opacity = config.opacity;
        if (config.background) {
            canvas.style.background = "url(" + config.background + ")";
            canvas.style.backgroundSize = "cover";
        }

        let dpr = Math.max(window.devicePixelRatio * (window.documentZoom ? window.documentZoom : 1), 1);
        canvas.style.height = config.height * 100 + '%'
        canvas.style.width = config.width * 100 + '%'
        config.height = config.height * skinSwitch.bodySize().height * dpr
        config.width = config.width * skinSwitch.bodySize().width * dpr

        // console.log(app.renderer.type); // 回傳目前 PixiJS app 的renderer 模式：
        // PIXI.RENDERER_TYPE，值為 0、1、2

        this.app = new PIXI.Application({
            view: document.getElementById("l2dCanvas"),
            width: config.width || 800,
            height: config.height || 600,
            transparent: true,
            antialias: true, // 抗锯齿
            autoStart: true,
        });
        this.initModel(config)
        this.initMotionSelectDiv(config)
    }

    initMotionSelectDiv(config){
        // 初始化表情选择样式
        const ui = skinSwitch.ui
        const lib = skinSwitch.lib
        let box = ui.create.div('.l2d-hoverBox', document.body)
        let rect = this.canvas.getBoundingClientRect()
        box.id = 'l2dHoverBox'
        box.style.left = (parseInt(config.left) || 0) + rect.width / 3 + 'px'
        box.style.bottom = (parseInt(config.bottom) || 0) + rect.height / 2 + 'px'

        let toolBtn = ui.create.div('.l2d-hoverBtn', box)
        let img = document.createElement('img')
        img.style.width = '95%'
        img.style.height = '95%'
        toolBtn.appendChild(img)
        img.src = lib.assetURL + 'extension/皮肤切换/images/other/l2d-tool.png'

        toolBtn.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', () => {

        })

        let toolDiv = ui.create.div('.l2d-tool-background', document.body)
        toolDiv.innerHTML = `
            <div class="model-setting" id="l2d-model-setting">
                <div class="cur-model" id="l2d-cur-model">当前model: xxxx</div>
                <div class="l2d-button1" id="l2d-button1" style="background-image: url(&quot;extension/千幻聆音/theme/wz/newui_button_selected_wz.png&quot;);">显示
                </div>
                <div class="l2d-button2" id="l2d-button2" style="background-image: url(&quot;extension/千幻聆音/theme/wz/newui_button_wz.png&quot;);">动作
                </div>
                <div class="l2d-button3" id="l2d-button3" style="background-image: url(&quot;extension/千幻聆音/theme/wz/newui_button_wz.png&quot;);">表情
                </div>
                <div class="model-set-cont1" id="l2d-model-cont1">
                    <div style="display: flex; width: 100%; height: 100%">
                        <div>
                            <img alt="" style="width: 28px; height: 28px">
                            <input type="range" class="slider-input" >
                        </div>
<!--                        <div>-->
<!--                            <img alt="" style="width: 28px; height: 28px">-->
<!--                            <input type="range" class="slider-input">-->
<!--                        </div>-->
                    </div>
                </div>
                <div class="model-set-cont2" id="l2d-model-cont2"></div>
                <div class="model-set-cont3" id="l2d-model-cont3"></div>
            </div>
        `
        let l2dModelSetting = document.getElementById('l2d-model-setting')
        let disBtn = document.getElementById('l2d-button1')
        let motionBtn = document.getElementById('l2d-button2')
        let expBtn = document.getElementById('l2d-button3')
        let displayContent = document.getElementById('l2d-model-cont1')
        let motionContent = document.getElementById('l2d-model-cont2')
        let expressionContent = document.getElementById('l2d-model-cont3')

        let size = skinSwitch.bodySize()
        l2dModelSetting.style.height = size.height * 0.5 + 'px'
        l2dModelSetting.style.width = size.width * 0.5 + 'px'

        let images = displayContent.getElementsByTagName('img')
        images[0].src = lib.assetURL + 'extension/皮肤切换/images/other/change-cale.png'
        images[1].src = lib.assetURL + 'extension/皮肤切换/images/other/change-cale.png'

    }

    async initModel(config) {
        this.model = await live2d.Live2DModel.from(config.role);
        this.app.stage.addChild(this.model);

        if (config.scale) {
            this.model.scale.set(config.scale);
        } else {
            const scaleX = this.canvas.width / this.model.width;
            const scaleY = this.canvas.height / this.model.height;
            // fit the window
            this.model.scale.set(Math.min(scaleX, scaleY) * config.scaleFactor);
        }

        if (config.x) {
            this.model.x = config.x
        }
        if (config.y) {
            this.model.y = config.y
        }

        // 添加调试的框
        // const hitAreaFrames = new live2d.HitAreaFrames();
        //
        // this.model.addChild(hitAreaFrames);
        // hitAreaFrames.visible = true
        //
        // const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
        // foreground.width = this.model.internalModel.width;
        // foreground.height = this.model.internalModel.height;
        // foreground.alpha = 0.2;
        //
        // this.model.addChild(foreground);
        // foreground.visible = true

        if (config.draggable === true) {}this.draggable(this.model);
        this.addListener(config, this.canvas, this.initMotionIndex());
    }

    async changeModel(config) {
        if (this.model) {
            this.app.stage.removeChild(this.model)
            // this.model.destroy()
        }
        this.initModel(config)
    }

    // 可拖动
    draggable(model) {
        // model.buttonMode = true;
        let c = this.canvas
        c.addEventListener('pointerdown', (e) => {
            model._pointerX = e.offsetX;
            model._pointerY = e.offsetY;
            model.dragging = true;
        })

        c.addEventListener('pointermove', (e) => {
            if (model.dragging) {
                if (e.offsetX >= c.width + c.offsetLeft || e.offsetY >= c.height + c.offsetTop) {
                    model.dragging = false
                    return
                }
                model.x = model.x + e.offsetX - model._pointerX;
                model.y = model.y + e.offsetY - model._pointerY;
                model._pointerX = e.offsetX
                model._pointerY = e.offsetY;
            }
        })
        document.addEventListener('pointerup', () => (model.dragging = false));


        // model.on("pointerdown", (e) => {
        //     model.dragging = true;
        //     model._pointerX = e.data.global.x - model.x;
        //     model._pointerY = e.data.global.y - model.y;
        //     console.log('eeee', e.data, model.x, model.y)
        // });
        // model.on("pointermove", (e) => {
        //     if (model.dragging) {
        //         model.position.x = e.data.global.x - model._pointerX;
        //         model.position.y = e.data.global.y - model._pointerY;
        //     }
        // });
        // model.on("pointerupoutside", () => (model.dragging = false));
        // model.on("pointerup", () => (model.dragging = false));
    }

    initMotionIndex() {
        let motionIndex = [],
            definitions = this.model.internalModel.motionManager.definitions[""];
        if (definitions)
            definitions.forEach((value, index) => {
                let file = this.model.internalModel.motionManager.getMotionFile(value);
                if (file.match("touch_head") != null) motionIndex[0] = index;
                else if (file.match("touch_special") != null) motionIndex[1] = index;
                else if (file.match("touch_body") != null) motionIndex[2] = index;
                // console.log(motionIndex, file);
            });
        return motionIndex;
    }

    addListener(config, canvas, motionIndex) {
        // 有的旧模型(比如lafei)不支持, 无法触发执行; 所以统一监听document的点击事件
        // this.model.on("hit", (hitAreas) => {});
        // this.model.emit("hit");
        let cn = skinSwitch.lib.config.touchscreen ? 'touchend' : 'click'
        let offsetX, offsetY
        let eve = (event) => {
            if (skinSwitch.lib.config.touchscreen) {
                offsetX = event.changedTouches[0].pageX - this.app.view.offsetLeft
                offsetY = event.changedTouches[0].pageY - this.app.view.offsetTop
            } else {
                offsetX = event.clientX - this.app.view.offsetLeft
                offsetY = event.clientY - this.app.view.offsetTop
            }

            if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) return
            event.stopPropagation();
            let keys = Object.keys(
                this.model.internalModel.motionManager.motionGroups
            );
            this.model.internalModel.motionManager.startRandomMotion(
                keys[Math.floor(Math.random() * keys.length)]
            );

            console.log("Start motion: random");
        }
        this.canvas.addEventListener(cn, eve);
    }

    hitTest(poX, poY) {
        let hitAreas = [];
        ["TouchHead", "TouchSpecial", "TouchBody"].forEach((id) => {
            let bounds = this.model.internalModel.getDrawableBounds(id);
            let b =
                bounds.x < poX &&
                poX < bounds.x + bounds.width &&
                bounds.y < poY &&
                poY < bounds.y + bounds.height;
            if (b) {
                hitAreas.push(id);
                // console.log(id);
            }
        });
        return hitAreas;
    }
}