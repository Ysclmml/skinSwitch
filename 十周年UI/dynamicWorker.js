'use strict';
importScripts('spine.js', 'animation.js');

Array.prototype.remove = function (item) {
	var index = this.indexOf(item);
	if (index >= 0) return this.splice(index, 1);
	return item;
}

var window = self;
var devicePixelRatio = 1;
var documentZoom = 1;
var HTMLCanvasElement = function () {
	return 'HTMLCanvasElement';
};
var HTMLElement = function () {
	return 'HTMLElement';
};
var dynamics = [];

let chukuangId = 99999   // 自动出框的nodeID起始, 为了不和主线程传过去的skinId重复

/**
 * 获取动皮管理对象DynamicPlayer
 * @param id  DynamicPlayer对象的id
 * @returns {AnimationPlayer|null}
 */
dynamics.getById = function (id) {
	for (let i = 0; i < this.length; i++) {
		if (this[i].id === id) return this[i];
	}

	return null;
}

function preLoadChuKuangSkel(dynamic, apnode) {
	completeParams(apnode)
	let actionParams = apnode.player.gongjiAction
	if (actionParams) {
		if (!dynamic.hasSpine(actionParams.name)) {
			dynamic.loadSpine(actionParams.name, 'skel', function () {
				console.log('预加载成功')
			}, function (data) {
				console.log('播放骨骼失败, 参数: ', data)
			})
		}
	}
}



// 播放, 稍微修改以下, 如果包含不一样的皮肤出框, 提前加载好对应的骨骼,减少下次的加载时间
function playSkin(dynamic, data) {
	update(dynamic, data);
	let sprite = (typeof data.sprite == 'string') ? {name: data.sprite} : data.sprite;
	sprite.loop = true;

	// 兼容雷修千幻
	// 获取保存的参数, 如果存在保存的参数, 则使用保存的参数进行播放.
	if (sprite.player.qhlxBigAvatar) {
		if (sprite.player.qhlx) {
			if (sprite.player.qhlx.gongji) {
				if (!sprite.player.gongji) {
					sprite.player.gongji = {}
				}
				sprite.player.gongji = Object.assign(sprite.player.gongji, sprite.player.qhlx.gongji)
			}
			if (sprite.player.qhlx.daiji) {
				sprite = Object.assign(sprite, sprite.player.qhlx.daiji)
				sprite.player = Object.assign(sprite.player, sprite.player.qhlx.daiji)
			}
		} else {
			sprite.player.scale = sprite.scale
		}

	}

	let run = function () {
		let t = dynamic.playSpine(sprite);
		t.opacity = 0
		let animation = t.skeleton.data.findAnimation("ChuChang");
		if (animation) {
			// 清空原来的state状态, 添加出场
			t.skeleton.state.setEmptyAnimation(0,0);
			t.skeleton.state.setAnimation(0,"ChuChang",false,0);
			t.skeleton.state.addAnimation(0,"DaiJi",true,-0.01);
			// 默认当前就是手杀动皮, 设置默认动作是待机
			t.player.action = 'DaiJi'
			t.action = 'DaiJi'
		}
		preLoadChuKuangSkel(dynamic, t)
		if (sprite.deputy) {
			t.speed = 0;
		} else {
			t.opacity = 1;
		}
	}

	if (dynamic.hasSpine(sprite.name)) {
		run();
	} else {
		dynamic.loadSpine(sprite.name, 'skel', run);
	}
}


/*************** 每个函数处理worker消息 start ***************/

function create(data) {
	if (dynamics.length >= 4) return;
	let dynamic = new duilib.AnimationPlayer(data.pathPrefix, 'offscreen', data.canvas);
	dynamic.id = data.id;
	dynamics.push(dynamic);
}

function play(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return;
	playSkin(dynamic, data)
}

function stop(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return;
	// 为了解决删除节点失败的问题, 只能多尝试删除几次
	let retryStop = function (times) {
		if (times < 0) return
		let sprite = dynamic.stopSpine(data.sprite)
		if (!sprite) {
			setTimeout(() => {
				retryStop(times-1)
			}, 300)
		}
	}
	// 重试3次
	retryStop(3)
}

function stopAll(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return;
	dynamic.stopSpineAll();
}

function msgUpdate(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return;

	update(dynamic, data);
}

function action(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return
	let apnode = getDynamic(dynamic, data.skinID);
	if (!apnode) return
	let animation
	console.log('data:::: ', data)
	let qhlyAction = function () {
		if (data.action === 'Qhly') animation = apnode.skeleton.data.findAnimation('GongJi');
		if (!animation) {
			if (data.needHide) {
				var hideNode = getHideDynamic(d, apnode);
				animation = hideNode.skeleton.data.findAnimation(data.action);
				if (!animation) {
					window.postMessage(false);
					return
				} else {
					apnode = hideNode;
					data.deputy = !data.deputy;
				}
			} else {
				window.postMessage(false);
				return
			}
		}
		apnode.opacity = 0;
		window.postMessage(true);
		apnode.x = [apnode.player.x[0] * 0.58, apnode.player.x[1] * 0.58];
		apnode.y = [apnode.player.y[0] * 1.4, apnode.player.y[1] * 1.4];

		if (apnode.player.angle) {
			apnode.angle = apnode.player.angle;
		}
		setTimeout(() => {
			apnode.opacity = 1;
			setTimeout(() => {
				setTimeout(() => {
					apnode.opacity = 0
					apnode.x = apnode.player.x;
					apnode.y = apnode.player.y;
					window.postMessage(true);
					setTimeout(() => {
						apnode.opacity = 1;
					}, 200);
				}, 450);
			}, animation.duration * 1000 - 500);
			playAction(apnode, animation);
			window.postMessage(true);
		}, 200);
	}

	if (data.action === 'Qhly') {
		return qhlyAction()
	}

	completeParams(apnode)
	// 如果是双将, 且两个都是动皮, 那么需要添加判断, 如果动皮1是假动皮, 动皮2是真动皮, 那么就需要播放2号的动皮
	// 只有攻击动作需要判断是否有攻击动作
	if (data.isDouble && data.needHide) {
		let hasGongJi = function () {
			let tempParams = apnode.player.gongjiAction
			if (!tempParams) {
				return false
			}
			if (tempParams.name === apnode.name) {
				if (!tempParams.action) return true  // 说明是播放假动皮的出框动作
				let animation = apnode.skeleton.data.findAnimation(tempParams.action)
				return Boolean(animation)
			}
			return true

		}
		let hasTeShu = function () {
			let tempParams = apnode.player.teshuAction
			if (!tempParams) {
				return false
			}
			if (tempParams.name === apnode.name) {
				if (!tempParams.action) return false
				let animation = apnode.skeleton.data.findAnimation(tempParams.action)
				return Boolean(animation)
			}
			return true
		}
		let changeNode = function () {
			let hideNode = getHideDynamic(dynamic, data.needHide)
			// 修改data的参数
			data.needHide = apnode.id
			data.deputy = true  // 标记为副将显示动皮
			data.skinID = hideNode.id
			completeParams(hideNode)
			// 更换隐藏和显示的节点
			apnode = hideNode
		}
		if (data.action === 'GongJi') {
			// 检查一号是否有真动皮, 没有就更换需要播放的角色为2号位
			if (!hasGongJi()) {
				changeNode()
			}
		}
		// 特殊动作同理也只播放一个动皮的动作
		else if (data.action === 'TeShu') {
			if (!hasTeShu()) {
				changeNode()
			}
		}
	}

	let player = apnode.player

	let playChuKuangSpine = function (apnode, animation, playNode) {
		let hideNode
		if (data.isDouble) {
			if (data.needHide !== undefined) {
				hideNode = getHideDynamic(dynamic, data.needHide);
			}
			if (hideNode) {
				hideNode.opacity = 0;
				hideNode.clip = undefined;
				hideNode.renderClip = undefined;
			}
			apnode.clip = undefined;
			apnode.renderClip = undefined;
		}
		// window.postMessage(true)
		apnode.opacity = 0
		let actualPlayNode = playNode ? playNode : apnode
		setPos(actualPlayNode, data);
		actualPlayNode.angle = undefined
		// 直接将待机动作置空防止闪烁
		postMessage({id: data.id, type: 'chukuangFirst'})
		setTimeout(() => {
			actualPlayNode.opacity = 1
			setTimeout(() => {
				// 播放完动画在500毫秒内从播放的位置移动到待机的位置
				actualPlayNode.moveTo(data.player.x, data.player.y, 500);

				setTimeout(() => {
					actualPlayNode.opacity = 0
					actualPlayNode.x = apnode.player.x;
					actualPlayNode.y = apnode.player.y;
					if (data.isDouble) {
						apnode.clip = {
							x: [0, data.deputy ? 0.5 : 0],
							y: 0,
							width: [0, 0.5],
							height: [0, 1],
							clipParent: true
						};
						setRenderClip(dynamic, apnode);
						if (hideNode) {
							hideNode.clip = {
								x: [0, data.deputy ? 0 : 0.5],
								y: 0,
								width: [0, 0.5],
								height: [0, 1],
								clipParent: true
							};
							setRenderClip(dynamic, hideNode);
						}
					}
					// 出框结束, 重新显示待机动画
					if (apnode.player.angle) {
						apnode.angle = apnode.player.angle
					}
					if (apnode.player.scale) {
						apnode.scale = apnode.player.scale
					}
					// window.postMessage(true)
					postMessage({id: data.id, type: 'canvasRecover'})
					setTimeout(() => {
						// 原来的节点恢复显示
						apnode.opacity = 1
						if (hideNode) hideNode.opacity = 1;
						console.log('apnode', apnode.action, apnode)
						// 假动皮不需要回复原有姿势
						if (!playNode && apnode.skeleton.defaultAction === animation.name) {
							console.log('aaaa', apnode, animation)
						} else {
							apnode.skeleton.state.setAnimation(0, apnode.action || apnode.skeleton.defaultAction, true)
						}
					}, 200);
				}, 450);
			}, (animation.showTime || animation.duration) * 1000 - 500);
			if (playNode) {
				// 重新恢复攻击pose
				// playNode.skeleton.setToSetupPose()
			} else {
				playAction(apnode, animation);
			}
			postMessage({id: data.id, type: 'chukuangSecond', delayTime: playNode ? 130 : 100})
		}, 250)
	}

	// 说明出框和待机动作不是同一个皮肤, 那么需要临时重新加载
	let playChukuang = function (actionParams) {
		actionParams.id = chukuangId++
		let playedSprite = dynamic.playSpine(actionParams)
		// 播放当前节点的动画, 隐藏原来的节点动画
		playedSprite.opacity = 0
		apnode.opacity = 0
		playedSprite.player = apnode.player
		// 获取动画播放时间
		let d = getActionDuration(dynamic, playedSprite.name, playedSprite.action)
		if (!d) {
			return
		}
		playChuKuangSpine(apnode, {duration: actionParams.showTime || d}, playedSprite)
	}

	let errPlaySpine = function (data) {
		console.log('播放失败....', data)
	}

	if (data.action === 'GongJi') {
		let actionParams = player.gongjiAction
		if (!actionParams) return

		if (actionParams.name === apnode.name) {
			// 说明是同一个皮肤, 那么只需要改变位置即可.
			// 查找动画
			let actionName = actionParams.action
			let duration

			// 允许调整出框的大小和静态的大小不一致
			if (actionParams.scale) {
				apnode.scale = actionParams.scale
			}
			if (!actionName) {
				let defaultGongJiAction = getDefaultGongJiAction(dynamic, actionParams.name)
				if (!defaultGongJiAction) return
				actionName = defaultGongJiAction.name
				actionParams.action = actionName
				// 有些静皮时间有点久, 需要重新指定一下
				if (actionName === 'GongJi') duration = defaultGongJiAction.duration
				else duration = actionParams.showTime || (defaultGongJiAction.duration > 2 ? 2: defaultGongJiAction.duration)
			}
			let animation = apnode.skeleton.data.findAnimation(actionName)
			// 如果没有动画, 查找第二个角色的动画
			if (!animation) {
				if (data.needHide !== undefined) {
					let hideNode = getHideDynamic(dynamic, data.needHide);
					animation = hideNode.skeleton.data.findAnimation(actionName);
					if (!animation) {
						postMessage({id: data.id, type: 'canvasRecover'})
						return
					} else {
						apnode = hideNode;
						data.deputy = !data.deputy;
					}
				} else {
					postMessage({id: data.id, type: 'canvasRecover'})
					return
				}
			}
			if (!animation.duration) {
				animation.duration = duration
			} else {
				// 如果是假动皮
				if (actionParams.action === apnode.action || apnode.skeleton.defaultAction === actionParams.action) {
					// animation.duration = actionParams.showTime || duration
					animation.showTime = actionParams.showTime || 2
				}
			}
			playChuKuangSpine(apnode, animation)

		} else {

			if (!dynamic.hasSpine(actionParams.name)) {
				dynamic.loadSpine(actionParams.name, "skel", function () {
					playChukuang(actionParams)
				}, errPlaySpine)
			} else {
				playChukuang(actionParams)
			}
		}

	} else if (data.action === 'TeShu') {
		let actionParams = player.teshuAction
		if (!actionParams) return
		// 特殊动画和待机皮肤一样, 那么从原始动画里面寻找, 并且不出框播放. 和原始皮肤一样, 那么出框播放
		if (actionParams.name === apnode.name) {
			animation = apnode.skeleton.data.findAnimation(actionParams.action)
			if (animation) {
				apnode.skeleton.state.setAnimationWith(0, animation, false);
				apnode.skeleton.state.addAnimation(0, apnode.player.action || apnode.skeleton.defaultAction, true, 0);
				postMessage({id: data.id, type: 'teshuChuKuang', 'chukuang': false})
			}
		} else {
			// 当特殊动作需要出框的时候, 只有在自己回合才可以出框
			if (!data.selfPhase) {
				return
			}
			if (!dynamic.hasSpine(actionParams.name)) {
				dynamic.loadSpine(actionParams.name, "skel", function () {
					postMessage({id: data.id, type: 'teshuChuKuang', 'chukuang': true})
					playChukuang(actionParams)
				}, errPlaySpine)
			} else {
				postMessage({id: data.id, type: 'teshuChuKuang', 'chukuang': true})
				playChukuang(actionParams)
			}
		}

	} else {
		animation = apnode.skeleton.data.findAnimation(data.action)
		apnode.skeleton.state.setAnimationWith(0, animation, false)
		apnode.skeleton.state.addAnimation(0, apnode.player.action || apnode.skeleton.defaultAction, true, 0)
	}
}

function position(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return;
	let apnode = getDynamic(dynamic, data.skinID);
	if (!apnode) return;
	completeParams(apnode)

	if (data.mode === 'daiji') {
		window.postMessage({id: data.id, type: 'position', x: apnode.x, y: apnode.y, scale: apnode.scale, angle: apnode.angle})
	} else {
		if (apnode.chukuangNode) {
			window.postMessage({id: data.id, type: 'position', x: apnode.chukuangNode.x, y: apnode.chukuangNode.y, scale: apnode.chukuangNode.scale})
		} else {
			// 否则以配置中的pos作为出框的位置
			if (!apnode.player.gongjiAction) window.postMessage(false)
			let actionParams = apnode.player.gongjiAction
			if (!actionParams) window.postMessage(false)
			window.postMessage({id: data.id, type: 'position', x: actionParams.x, y: actionParams.y, scale: actionParams.scale, })
		}
	}
}

function debug(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return;
	let apnode = getDynamic(dynamic, data.skinID);
	if (!apnode) return
	completeParams(apnode)

	// 循环播放动皮动作. 然后接受准备
	if (data.mode === 'daiji') {
		if (apnode.chukuangNode) {
			// 停止当前播放的动画
			apnode.chukuangNode.opacity = 0

		}
		// 恢复原来的node位置
		apnode.x = apnode.player.x
		apnode.y = apnode.player.y
		apnode.scale = apnode.player.scale
		// 播放待机
		apnode.skeleton.state.setEmptyAnimation(0, 0)
		if (apnode.player.angle) {
			apnode.angle = apnode.player.angle
		}
		playDaiJi(apnode)
		apnode.opacity = 1
		window.postMessage({id: data.id, type: 'canvasRecover'})

	} else if (data.mode === 'chukuang') {
		// 如果已经存在出框的apnode的引用了, 那么直接播放即可.
		if (apnode.chukuangNode) {
			// 先停止原来的动画
			apnode.opacity = 0
			setTimeout(() => {
				apnode.chukuangNode.opacity = 1
				// 获取出框node的action
				let action = apnode.chukuangNode.player.gongjiAction.action
				if (!action) action = apnode.chukuangNode.skeleton.defaultAction
				apnode.chukuangNode.skeleton.setToSetupPose();
				apnode.chukuangNode.skeleton.state.setAnimation(0, action, 1)
			}, 350)
			window.postMessage({id: data.id, type: 'debugChuKuang'})
			// window.postMessage(true)
			return
		}
		// 获取对应的骨骼标签, 如果没有获取第一个
		let actionParams = apnode.player.gongjiAction
		if (actionParams) {
			let playSpine = function (apnode, animation, playNode) {
				apnode.opacity = 0

				let actualPlayNode = playNode ? playNode : apnode
				setPos(actualPlayNode, data);
				console.log('debug: actualPlayNode', actualPlayNode)
				actualPlayNode.angle = undefined
				setTimeout(() => {
					if (playNode) {
						// 重新恢复攻击pose
						playNode.skeleton.setToSetupPose()
						actualPlayNode.opacity = 1
						playNode.loop = true
					} else {
						actualPlayNode.opacity = 1
						playAction(apnode, animation);
					}
				}, 200)
				// window.postMessage(true);
				window.postMessage({id: data.id, type: 'debugChuKuang'})
			}

			let errPlaySpine = function (data) {
				// window.postMessage(false)
				window.postMessage({id: data.id, type: 'canvasRecover'})
				window.postMessage({id: data.id, type: 'debugNoChuKuang'})
				console.log('播放骨骼失败, 参数: ', data)
			}

			if (actionParams.name === apnode.name) {
				let actionName = actionParams.action
				if (actionParams.scale) {
					apnode.scale = actionParams.scale
				}
				if (!actionName) {
					// 获取攻击动作
					let defaultGongJiAction = getDefaultGongJiAction(dynamic, actionParams.name)
					if (!defaultGongJiAction) return
					actionName = defaultGongJiAction.name
					actionParams.action = actionName
				}
				let animation = apnode.skeleton.data.findAnimation(actionName)
				// 如果没有动画, 查找第二个角色的动画
				if (!animation) {
					window.postMessage({id: data.id, type: 'debugNoChuKuang'})
					return
				}
				playSpine(apnode, animation)
			} else {
				let playChukuang = function () {
					actionParams.id = chukuangId++
					let playedSprite = dynamic.playSpine(actionParams)
					// 播放当前节点的动画, 隐藏原来的节点动画
					playedSprite.opacity = 0
					playedSprite.player = apnode.player
					// 保存出框的node引用
					apnode.chukuangNode = playedSprite
					// 获取动画播放时间
					playSpine(apnode, {}, playedSprite)
				}

				if (!dynamic.hasSpine(actionParams.name)) {
					dynamic.loadSpine(actionParams.name, "skel", playChukuang, errPlaySpine)
				} else {
					playChukuang()
				}
			}
		}
	}
}

// 调整动皮的位置
function adjust(data) {
	let dynamic = dynamics.getById(data.id);
	if (!dynamic) return;
	let apnode = getDynamic(dynamic, data.skinID)
	if (!apnode) return;
	completeParams(apnode)

	if (data.mode === 'daiji') {
		if (data.x !== undefined && data.y !== undefined) {
			apnode.x[1] = data.x
			apnode.y[1] = data.y
			apnode.player.x = [apnode.x[0], data.x]
			apnode.player.y = [apnode.y[0], data.y]
		} else if (data.xyPos !== undefined){
			if (data.xyPos.x !== undefined) {
				apnode.x[0] = data.xyPos.x
				apnode.player.x[0] = data.xyPos.x
			} else if (data.xyPos.y !== undefined){
				apnode.y[0] = data.xyPos.y
				apnode.player.y[0] = data.xyPos.y
			}
		} else if (data.scale !== undefined) {
			apnode.scale = data.scale
			apnode.player.scale = data.scale
		} else if (data.angle !== undefined) {
			apnode.angle = data.angle
			apnode.player.angle = data.angle
		}
		console.log('当前待机位置参数x', apnode.x, '当前待机位置参数y', apnode.y, 'scale', apnode.scale, 'angle', apnode.angle)
	} else if (data.mode === 'chukuang') {
		let actionParams = apnode.player.gongjiAction
		if (!actionParams) return

		if (data.x !== undefined && data.y !== undefined) {
			if (apnode.chukuangNode) {
				apnode.chukuangNode.x[1] = data.x
				apnode.chukuangNode.y[1] = data.y
			} else {
				// 说明是同一节点
				apnode.x[1] = data.x
				apnode.y[1] = data.y
			}
			// 修改参数
			actionParams.x[1] = data.x
			actionParams.y[1] = data.y
		} else if (data.xyPos){
			if (data.xyPos.x !== undefined) {
				if (apnode.chukuangNode) {
					apnode.chukuangNode.x[0] = data.xyPos.x
				} else {
					apnode.x[0] = data.xyPos.x
				}
				actionParams.x[0] = data.xyPos.x
			} else if (data.xyPos.y !== undefined){
				if (apnode.chukuangNode) {
					apnode.chukuangNode.y[0] = data.xyPos.y
				} else {
					apnode.y[0] = data.xyPos.y
				}
				actionParams.y[0] = data.xyPos.y
			}
		} else if (data.scale !== undefined) {
			if (apnode.chukuangNode) {
				apnode.chukuangNode.scale = data.scale
				actionParams.scale = data.scale
			} else {
				apnode.scale = data.scale
				// 同一个动皮出框通过调整静态大小即可.
				if (actionParams.scale) {
					actionParams.scale = data.scale
				}

			}
		}
		if (apnode.chukuangNode) {
			console.log('当前出框位置参数x', apnode.chukuangNode.x, '当前出框位置参数y', apnode.chukuangNode.y, 'scale', apnode.chukuangNode.scale)
		} else {
			console.log('当前出框位置参数x', apnode.x, '当前出框位置参数y', apnode.y, 'scale', apnode.scale)
		}
	}
}

function hide1(data) {
	let d = dynamics.getById(data.id);
	let apnode = getDynamic(d, data.skinID);

	if (apnode.skeleton.data.findAnimation(data.action)) {
		apnode.opacity = 0;
		window.postMessage(true)
	} else window.postMessage(false)

}

function hide2(data) {
	let d = dynamics.getById(data.id);
	let apnode = getDynamic(d, data.skinID);
	let hideNode = getHideDynamic(d, apnode);
	apnode.opacity = 0;
	if (hideNode) hideNode.opacity = 0;

	window.postMessage(true);
}

function find(data) {
	let d = dynamics.getById(data.id);
	let apnode = getDynamic(d, data.skinID);
	let animation = apnode.skeleton.data.findAnimation(data.action);
	window.postMessage((animation != null && apnode.opacity == 1));
}

function show(data) {
	let dynamic = dynamics.getById(data.id)
	if (!dynamic) return
	let apnode = getDynamic(dynamic, data.skinID);
	if (!apnode) return
	apnode.opacity = 1
	apnode.speed = 1
	playDaiJi(apnode)
}


/*************** 每个函数处理worker消息 end ***************/

onmessage = function (e) {
	let data = e.data
	switch (data.message) {
		case 'CREATE':
			create(data)
			break;
		case 'PLAY':
			play(data)
			break;

		case 'STOP':
			stop(data)
			break;

		case 'STOPALL':
			stopAll(data)
			break;

		case 'UPDATE':
			msgUpdate(data)
			break;

		case "ACTION":
			action(data)
			break;

		case "HIDE":
			hide1(data)
			break;

		case "HIDE2":
			hide2(data)
			break;

		case "FIND":
			find(data)
			break;
		case "SHOW":
			show(data)
			break;

		case "ADJUST":
			adjust(data)
			break

		case "DEBUG":
			debug(data)
			break
		case "POSITION":
			position(data)
			break
	}
}

function update(dynamic, data) {
	dynamic.resized = false;
	if (data.dpr != null) dynamic.dpr = data.dpr;
	if (data.dprAdaptive != null) dynamic.dprAdaptive = data.dprAdaptive;
	if (data.outcropMask != null) dynamic.outcropMask = data.outcropMask;
	if (data.useMipMaps != null) dynamic.useMipMaps = data.useMipMaps;
	if (data.width != null) dynamic.width = data.width;
	if (data.height != null) dynamic.height = data.height;
}

function getDynamic(dynamics, id) {
	if (dynamics.nodes.length > 1) {
		for (let i = 0; i < dynamics.nodes.length; i++) {
			let temp = dynamics.nodes[i];
			if (temp.id === id) {
				return temp;
			}
		}
	} else return dynamics.nodes[0];
}

// 获取需要隐藏的apnode
function getHideDynamic(d, hideSkinId) {
	if (d.nodes.length > 1) {
		for (let i = 0; i < d.nodes.length; i++) {
			if (d.nodes[i].id === hideSkinId) return d.nodes[i];
		}
	} else return false;
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


// 补全配置参数
function completeParams(node) {
	let player = node.player  // 这个是播放待机动作存取的配置参数
	if (!player) return

	let gongjiAction, teshuAction
	let gongji = player.gongji
	let teshu = player.teshu
	let gongjiType = typeof gongji
	let teshuType = typeof teshu
	// 这是原来的EngEX扩展的判断手杀真动皮的写法. player.pos用来调整出框位置参数, 兼容此种写法, 如果填写了pos认为是原来的真动皮
	if (player.pos) {
		gongjiAction = {
			name: node.name,  // 和原来的皮肤一样
			x: player.pos.x,
			y: player.pos.y,
			scale: player.scale,
			action: 'GongJi'
		}
		teshuAction = {
			name: node.name,
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
				name: node.name,  // 和原来的皮肤一样
				x: [0, 0.5],
				y: [0, 0.5],
				scale: player.scale,  //
				action: player.gongji,
			}
		}
		// 如果是简单的设置为true, 那么说明当前动皮是静态皮肤, 也想出框, 那么和上面一样, 播放当前待机动作到中央
		else if (gongji === true) {
			gongjiAction = {
				name: node.name,  // 和原来的皮肤一样
				x: [0, 0.5],
				y: [0, 0.5],
				scale: player.scale,  //
				showTime: 2  // 静态皮肤可以指定出框的时间, 因为有些静态皮肤的待机动作时间太长了, 需要提前结束
			}
		} else if (gongjiType === 'object') {
			gongjiAction = gongji
			if (!gongjiAction.name) {
				gongjiAction.name = node.name
			} else {
				gongjiAction.name = getFullName(player.localePath, gongjiAction.name)
			}
			if (!gongjiAction.x) {gongjiAction.x = [0, 0.5]}
			if (!gongjiAction.y) {gongjiAction.y = [0, 0.5]}
			if (!gongjiAction.scale) {gongjiAction.scale = player.scale}
		} else {
			// 默认从当前皮肤的GongJi标签来播放动作
			gongjiAction = {
				name: node.name,  // 和原来的皮肤一样
				x: [0, 0.5],
				y: [0, 0.5],
				scale: player.scale,
				action: 'GongJi'  // 寻找默认的攻击动画标签名称
			}
		}

		// 特殊动作同样处理
		if (teshuType === 'string') {
			teshuAction = {
				name: node.name,  // 和原来的皮肤一样
				x: [0, 0.5],
				y: [0, 0.5],
				scale: player.scale,
				action: player.teshu,
			}
		}
			// 特殊动作, 原地播放待机动画没啥意义, 就不提供
			// else if (teshuType === true) {
			// 	gongjiAction = {
			// 		name: node.name,  // 和原来的皮肤一样
			// 		x: [0, 0.5],
			// 		y: [0, 0.5],
			// 		scale: player.scale,  //
			// 		action: player.gongji,
			// 		showTime: 2  // 静态皮肤可以指定出框的时间, 因为有些静态皮肤的待机动作时间太长了, 需要提前结束
			// 	}
		// }
		else if (teshuType === 'object') {
			teshuAction = teshu
			if (!teshuAction.name) {
				teshuAction.name = node.name
			} else {
				teshuAction.name = getFullName(player.localePath, teshu.name)
			}
			// 特殊动画还是最好不要出框, 不然触发频率太高了...
			if (teshuAction.name !== node.name) {
				if (!teshuAction.x) {teshuAction.x = [0, 0.5]}
				if (!teshuAction.y) {teshuAction.y = [0, 0.5]}

			} else {
				if (!teshuAction.x) {teshuAction.x = player.x}
				if (!teshuAction.y) {teshuAction.y = player.y}
			}
			if (!teshuAction.scale) {teshuAction.scale = player.scale}
			if (!teshuAction.showTime) {teshuAction.showTime = 2}
		} else {
			// 默认从当前皮肤的GongJi标签来播放动作
			teshuAction = {
				name: node.name,  // 和原来的皮肤一样
				x: [0, 0.5],
				y: [0, 0.5],
				scale: player.scale,
				action: 'TeShu'  // 寻找默认的攻击动画标签名称
			}
		}
	}
	node.player.gongji = gongjiAction
	node.player.teshu = teshuAction  // 重新赋值

	node.player.gongjiAction = gongjiAction
	node.player.teshuAction = teshuAction
}


function setRenderClip(d, node) {
	function calc(value, refer, dpr) {
		if (Array.isArray(value)) {
			return value[0] * dpr + value[1] * refer;
		} else {
			return value * dpr;
		}
	}

	let dpr = d.dpr;
	node.renderClip = {
		x: calc(node.clip.x, d.canvas.width, dpr),
		y: calc(node.clip.y, d.canvas.height, dpr),
		width: calc(node.clip.width, d.canvas.width, dpr),
		height: calc(node.clip.height, d.canvas.height, dpr)
	};
}

function playAction(apnode, animation) {
	apnode.skeleton.state.setAnimationWith(0, animation, true);
}

function setPos(apnode, data) {
	if (data.me) {
		// 获取
		let actionParams = apnode.player.gongjiAction
		apnode.x = actionParams.x
		apnode.y = actionParams.y
		data.player.y += 150;
	} else {
		apnode.x = data.direction.x;
		apnode.y = data.direction.y;
		if (data.direction.isLeft) data.player.x += 85; else data.player.x += 40;
	}
}

// 根据已有的apnode直接播放待机动画
function playDaiJi(apnode) {
	if (apnode.player.scale) {
		apnode.scale = apnode.player.scale
	}
	if (apnode.player.action) {
		// find chuchang
		let animation = apnode.skeleton.data.findAnimation("ChuChang");
		if (animation) {
			apnode.skeleton.state.setAnimationWith(0, animation, false, -0.01);
			apnode.skeleton.state.addAnimation(0, apnode.player.action,true,0);
		} else {
			apnode.skeleton.state.setAnimation(0, apnode.player.action,true,0);
		}
	} else {
		apnode.skeleton.state.setAnimation(0, apnode.skeleton.defaultAction, true, 0);
	}
}


/**
 *
 * @param dynamic  AnimationPlayer对象
 * @param name  骨骼名字
 * @returns {Object||null} {name: 'actionName', 'duration': duration}
 */
function getDefaultAction(dynamic, name) {
	// 获取默认的动作
	let spineActions = dynamic.getSpineActions(name)
	if (!spineActions) return null
	return spineActions[0]
}

// 获取默认的攻击动作标签
function getDefaultGongJiAction(dynamic, name) {
	let spineActions = dynamic.getSpineActions(name)
	if (spineActions && spineActions.length > 0) {
		for (let item of spineActions) {
			if (item.name === 'GongJi') {
				return item
			}
		}
		return spineActions[0]
	}
	return null
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