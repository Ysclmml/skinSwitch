'use strict';
decadeModule.import(function(lib, game, ui, get, ai, _status){
	/*
	十周年UI动皮使用说明：
	- 首先打开动态皮肤的开关，直接替换原有武将皮肤显示；
	- 目前不支持动态皮肤的切换功能；
	- 动态皮肤参数表在线文档链接：https://docs.qq.com/sheet/DS2Vaa0ZGWkdMdnZa；可以在群在线文档提供你设置好的参数
	- 所有相关的文件请放到	十周年UI/assets/dynamic目录下；
	- 关于格式请参考下面示例：
		武将名:{
			皮肤名:{
				name: "xxx",	//	必★填	骨骼名称，一般是yyy.skel，注意xxx不带后缀名.skel；
				action: "xxx",	//	可删掉	播放动作，xxx 一般是 DaiJi，目前手杀的骨骼文件需要填；
				x: [10, 0.5],	//	可删掉	[10, 0.5]相当于 left: calc(10px + 50%)，不填默认为[0, 0.5]；
				y: [10, 0.5],	//	可删掉	[10, 0.5]相当于 bottom: calc(10px + 50%)，不填默认为[0, 0.5]；
				scale: 0.5,		//	可删掉	缩放大小，不填默认为1；
				angle: 0,		//	可删掉	旋转角度，不填默认为0；
				speed: 1,		//	可删掉	播放速度，不填默认为1；
				hideSlots: ['隐藏的部件'],	// 隐藏不需要的部件，想知道具体部件名称请使用SpineAltasSplit工具查看
				clipSlots: ['裁剪的部件'],	// 剪掉超出头的部件，仅针对露头动皮，其他勿用
				background: "xxx.jpg",	//	可删掉	背景图片，注意后面要写后缀名，如.jpg .png等 
			}
		},
	- 为了方便得到动皮的显示位置信息，请在游戏选将后，用控制台或调试助手小齿轮执行以下代码(没用到的属性请删掉以免报错):
		game.me.stopDynamic();
		game.me.playDynamic({
			name: 'xxxxxxxxx',		// 勿删
			action: undefined,
			speed: 1,
			loop: true,				// 勿删
			x: [0, 0.5],
			y: [0, 0.5],
			scale: 0.5,
			angle: 0,
			hideSlots: ['隐藏的部件'],	// 隐藏不需要的部件，想知道具体部件名称请使用SpineAltasSplit工具查看
			clipSlots: ['裁剪的部件'],	// 剪掉超出头的部件，仅针对露头动皮，其他勿用
		});
		// 这里可以改成  }, true);  设置右将动皮
	*/
	
	decadeUI.dynamicSkin = {
		zhangqiying:{
			岁稔年丰:{
				name: 'skin_zhangqiying_SuiRenNianFeng',
				x: [5, 0.5],
				y: [15, 0.4],
				scale: 0.42,
				background: 'skin_zhangqiying_SuiRenNianFeng_bg.png',
				skinName: '岁稔年丰',
			},
		},
		caojie:{
			凤历迎春:{
				name: 'skin_caojie_FengLiYingChun',
				x: [0, 0.4],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_caojie_FengLiYingChun_bg.png',
			},
		},
		caoying:{
			锋芒毕露: {
				name: 'skin_caoying_FengMangBiLou',
				x: [0, 0.3],
				y: [0, -0.13],
				scale: 0.65,
				pos: {
					x: [0,0.7],
					y: [0,0.45]
				},
				gongji: {
					action: ['GongJi']
				},
				background: 'skin_caoying_FengMangBiLou_bg.png',
				skinName: "锋芒毕露"
			},
			巾帼花舞:{
				name: 'skin_caoying_JinGuoHuaWu',
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_caoying_JinGuoHuaWu_bg.png',
			},
		},
		baosanniang:{
			漫花剑俏:{
				name: 'skin_baosanniang_ManHuaJianQiao',
				x: [96, 0.5],
				y: [10, 0.4],
				scale: 0.38,
				background: 'skin_baosanniang_ManHuaJianQiao_bg.png',
			},
		},
		sp_caiwenji:{
			才颜双绝:{
				name: 'skin_caiwenji_CaiYanShuangJue',
				x: [-30, 0.5],
				y: [0, 0.1],
				scale: 0.5,
				background: 'skin_caiwenji_CaiYanShuangJue_bg.png',
			},
		},
		daqiao:{
			衣垂绿川:{
				name: 'skin_daqiao_YiChuiLvChuan',
				action: 'DaiJi',
				x: [60, 0.5],
				y: [0, 0.2],
				scale: 0.5,
				clipSlots: ['san'],
				// hideSlots: ['qjhua1', 'qjhua2', 'qjhua3', 'qjhua4', 'qjhua5', 'guangxian', 'yun1', 'yun3', 'effect/guang2_00', 'effect/yan'],
				background: 'skin_daqiao_QingXiaoQingLi_bg.png',
				isChuKuang: true,
				gongji: {
					scale: 0.55,
					pos: {
						x: [-10, 0.8],
						y: [-10, 0.8],
					},
					action: 'DaiJi',
					showTime: 2,
				}
			},
			清萧清丽:{
				name: 'skin_daqiao_QingXiaoQingLi',
				x: [16, 0.5],
				y: [15, 0.1],
				scale: 0.55,
				background: 'skin_daqiao_QingXiaoQingLi_bg.png',
				isChuKuang: true,  // 假动皮是否出框, 如果, 如果参数
				skinName: '清萧清丽',
				actionParams: {
					name:"skin_daqiao_QingXiaoQingLi",
					scale: 0.55,
					pos: {  // 配置自己出框的位置
						x: [-10, 0.8],
						y: [-10, 0.8],
					},
					showTime: 2,
				}
			},
			绝世之姿: {
				name: 'skin_daqiao_JueShiZhiZi',
				x: [5, 0.25],
				y: [2, 0.2],
				scale: 0.5,
				// angle: 18,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_daqiao_JueShiZhiZi_bg.png',
				skinName: "绝世之姿"
			},
			变换action: {
				x: [0,0.5],
				y: [0,0.5],
				action: 'celebrate_idle',
				name: "大乔/变换action/bamuwei_YZ",
				scale: 0.35,
				version: "3.8",
				json: true,
				special: {
					变换action: {
						action: 'greeting',
						hp: 2,
						loop: true,
					},
					变换action2: {
						hp: 1,  // 如果血量低于2, 则会触发变身效果, 当血量恢复到2以上, 那么
						action: 'click', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},
					condition: {
						lowhp: {
							transform: ['变换action', '变换action2'],  // 设置血量需要变换的骨骼
						},
					}
				}
			},
		},
		daxiaoqiao:{
			战场绝版:{
				name: 'skin_daqiaoxiaoqiao_ZhanChang',
				x: [0, 0.5],
				y: [10, 0.3],
				scale: 0.5,
				background: 'skin_daqiaoxiaoqiao_ZhanChang.png',
			},
		},
		diaochan:{
			战场绝版:{
				name: 'skin_diaochan_ZhanChang',
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_diaochan_ZhanChang_bg.png',
			},
			玉婵仙子:{
				// name: '貂蝉/玉蝉仙子/skin_diaochan_YuChanXianZi',
				name: '貂蝉/玉蝉仙子/daiji',
				x: [5, 0.5],
				y: [0, 0],
				scale: 0.6,
				// background: 'skin_diaochan_YuChanXianZi_bg.png',
				chuchang: {
					name: '貂蝉/玉蝉仙子/chuchang',
					scale: 0.8,
				},
				beijing: {
					name: '貂蝉/玉蝉仙子/beijing',
					x: [0,0.16],
					y: [0,0.4],
					scale: 0.3,
				},
				gongji: {
					name: '貂蝉/玉蝉仙子/jisha'
				},
				shizhounian: true,
			},
			驭魂千机: {
				name: 'skin_diaochan_YuHunQianJi',
				x: [0, 0.49],
				y: [0, 0.13],
				angle: 10,
				scale: 0.62,
				action: 'DaiJi',
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_diaochan_YuHunQianJi_bg.png',
				skinName: "驭魂千机"
			},
			绝世倾城: {
				name: 'skin_diaochan_JueShiQingCheng',
				x: [0, 0.55],
				y: [0, 0.35],
				scale: 0.4,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_diaochan_JueShiQingCheng_bg.png',
				skinName: "绝世倾城"
			},
			鼠年七夕: {
				name: 'skin_diaochan_ShuNianQiXi',
				x: [0, 0.35],
				y: [0, 0.3],
				scale: 0.5,
				//action: 'DaiJi',
				background: 'skin_diaochan_YuHunQianJi_bg.png',
				skinName: "鼠年七夕"
			},
		},
		guozhao:{
			雍容尊雅:{
				name: 'skin_guozhao_YongRongZunYa',
				x: [0,-0.14],
				y: [0,0.43],
				scale: 0.55,
				background: 'skin_guozhao_YongRongZunYa_bg.png',
			},
		},
		huangyueying:{
			木牛流马: {
				name: 'skin_huangyueying_MuNiuLiuMa',
				action: 'DaiJi',
				x: [-20, 0.5],
				y: [0, 0.3],
				scale: 0.53,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_huangyueying_MuNiuLiuMa_bg.png',
				skinName: "木牛流马"
			},
			武侯祠: {
				name: 'skin_huangyueying_WuHouCi',
				action: 'DaiJi',
				x: [0, -0.07],
				y: [0, 0.37],
				scale: 0.34,
				pos: {
					x: [0,0.45],
					y: [0,0.45]
				},
				background: 'skin_huangyueying_WuHouCi_bg.png',
				skinName: "武侯祠"
			},
			鼠年春节: {
				name: 'skin_huangyueying_ShuNianChunJie',
				x: [0, 0.82],
				y: [0, 0.38],
				scale: 0.4,
				//angle:-15,
				action: 'DaiJi',
				background: 'skin_huangyueying_ShuNianChunJie_bg.png',
				skinName: "鼠年春节"
			},
		},
		hetaihou:{
			耀紫迷幻:{
				name: 'skin_hetaihou_YaoZiMiHuan',
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_hetaihou_YaoZiMiHuan_bg.png',
				// gongji: true,  // 在中间攻击
				// gongji: {
				// 	name: 'skin_hetaihou_YaoZiMiHuan',  // name可以是其他骨骼皮肤, 不填则默认是当前皮肤
				// 	x: [0, 0.8],
				// 	y: [0, 0.4],
				// 	scale: 0.6,
				// },

			},
			蛇蝎为心:{
				name: 'skin_hetaihou_SheXieWeiXin',
				action: 'DaiJi',
				x: [0,-0.33],
				y: [0,0.27],
				scale: 0.46,
				clipSlots: ['wangzuo', 'bu2', 'bu3'],
				background: 'skin_hetaihou_SheXieWeiXin_bg.png',
				skinName: '蛇蝎为心',
			},
			蛇蝎为心2:{
				name: 'skin_hetaihou_SheXieWeiXin',
				action: 'DaiJi',
				x: [0,-0.33],
				y: [0,0.27],
				scale: 0.46,
				clipSlots: ['wangzuo', 'bu2', 'bu3'],
				background: 'skin_hetaihou_SheXieWeiXin_bg.png',
			},
			战场绝版: {
				name: '何太后战场骨骼/daiji2',
				"scale": 0.9,
				"x": [
					0,
					0.54
				],
				"y": [
					0,
					0.42
				],
				// background: '何太后战场骨骼/skin_hetaihou_zhanchangjueban_bg.png',
				beijing: {
					name: '何太后战场骨骼/beijing',
					scale: 0.3,
					x: [0, 0.98],
					y: [0, 0.47]
				},
				// teshu: 'play2',  // 如果是和待机同一个皮肤, 可以直接填写对应的特殊动作标签名字
				teshu: {
					name:"何太后战场骨骼/chuchang2",
					action: ['jineng'] ,  // action不写是默认播放第一个动作
					scale: 0.7,
				},  // 如果是和待机同一个皮肤, 可以直接填写对应的特殊动作标签名字
				play2: 'play2',
				chuchang: {
					name:"何太后战场骨骼/chuchang",
					scale: 0.6,
					action: 'play'  // 不填写默认是十周年的play
				},
				gongji: {
					name:"何太后战场骨骼/chuchang2",
					action: ['gongji',] ,  // action不写是默认播放第一个动作
					scale: 0.7,
					// x: [0, 0.5],
					// y: [0, 0.5],
				},  // 通常是出框需要播放的参数
				shizhounian: true,
			},
		},
		huaman:{
			花俏蛮娇:{
				name: 'skin_huaman_HuaQiaoManJiao',
				x: [65, 0.5],
				y: [10, 0.3],
				scale: 0.4,
				background: 'skin_huaman_HuaQiaoManJiao_bg.png',
			}
		},
		luyusheng:{
			玉桂月满:{
				name: 'skin_luyusheng_YuGuiYueMan',
				x: [-25, 0.5],
				y: [16, 0.3],
				scale: 0.5,
				background: 'skin_luyusheng_YuGuiYueMan_bg.png',
			}
		},
		re_machao:{
			西凉雄狮:{
				name: 'skin_machao_XiLiangXiongShi',
				action: 'DaiJi',
				x: [0, 0.5],
				y: [0, 0.3],
				scale: 0.52,
				background: 'skin_machao_XiLiangXiongShi_bg.png',
				clipSlots: ['tx/fw_19'],
				hideSlots: ['tx/glow_00']
			},
		},
		mayunlu:{
			战场绝版:{
				name: 'skin_mayunlu_ZhanChang',
				x: [88, 0.5],
				y: [0, 0.1],
				scale: 0.65,
				background: 'skin_mayunlu_ZhanChang_bg.png',
			},
		},
		panshu:{
			繁囿引芳:{
				name: 'skin_panshu_FanYouYinFang',
				x: [100, 0.5],
				y: [10, 0.3],
				scale: 0.52,
				background: 'skin_panshu_FanYouYinFang_bg.png',

				// 可以随意搭配指定
				teshu: {
					name:"何太后战场骨骼/chuchang2",
					action: 'gongji',  // action不写是默认播放第一个动作
					scale: 0.7,
					x: [0, 0.5],
					y: [0, 0.5],
				}
			},
		},
		sunluban:{
			沅茝香兰:{
				name: 'skin_sunluban_YuanChaiXiangLan',
				x: [10, 0.5],
				y: [12, 0.1],
				scale: 0.55,
				background: 'skin_sunluban_YuanChaiXiangLan_bg.png',
			},
			宵靥谜君:{
				name: 'skin_sunluban_XiaoYeMiJun',
				x: [0, 0.5],
				y: [-10, 0.5],
				scale: 0.5,
				background: 'skin_sunluban_XiaoYeMiJun_bg.png',
			},
		},
		sunluyu:{
			娇俏伶俐:{
				name: 'skin_sunluyu_JiaoQiaoLingLi',
				x: [-10, 0.5],
				y: [20, 0.3],
				scale: 0.4,
				background: 'skin_sunluyu_JiaoQiaoLingLi_bg.png',
			},
		},
		sunshangxiang:{
			魅影剑舞:{
				name: 'skin_sunshangxiang_MeiYingJianWu',
				x: [-5, 0.5],
				y: [10, 0.2],
				scale: 0.42,
				background: 'skin_sunshangxiang_MeiYingJianWu_bg.png',
			},
		},
		sp_sunshangxiang:{
			花曳心牵:{
				name: 'skin_shuxiangxiang_HuaYeXinQian',
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_shuxiangxiang_HuaYeXinQian_bg.png',
			}
		},
		wangrong:{
			云裳花容:{
				name: 'skin_wangrong_YunShangHuaRong',
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_wangrong_YunShangHuaRong_bg.png',
			},
		},
		wangyuanji:{
			鼠年冬至:{
				name: 'skin_wangyuanji_ShuNianDongZhi',
				action: 'DaiJi',
				x: [-24, 0.5],
				y: [8, 0.5],
				scale: 0.6,
				background: 'skin_wangyuanji_ShuNianDongZhi_bg.png',
			},
			// 温情良缘: {
			// 	name: '王元姬/温情良缘/xingxiang',
			// 	x: [-24, 0.5],
			// 	y: [8, 0.5],
			// 	scale: 0.6,
			// 	version: '4.0',
			// 	// clipSlots: ['lian'],
			// 	// hideSlots: ['lian']
			// }
		},
		wangyi:{
			绝色异彩:{
				name: 'skin_wangyi_JueSeYiCai',
				x: [16, 0.5],
				y: [10, 0.3],
				scale: 0.42,
				background: 'skin_wangyi_JueSeYiCai_bg.png',
			},
		},
		wuxian:{
			金玉满堂:{
				name: 'skin_wuxian_JinYuManTang',
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_wuxian_JinYuManTang_bg.png',
			},
			锦运福绵:{
				name: 'skin_wuxian_JinYunFuMian',
				x: [-58, 0.5],
				y: [0, 0.2],
				scale: 0.6,
				background: 'skin_wuxian_JinYunFuMian_bg.png',
			},
		},
		xiahoushi:{
			战场绝版:{
				name: 'skin_xiahoushi_ZhanChang',
				x: [-8, 0.5],
				y: [-5, 0.4],
				scale: 0.45,
				angle: -20,
				background: 'skin_xiahoushi_ZhanChang_bg.png',
			},
		},
		re_xiaoqiao:{
			采莲江南:{
				name: 'skin_xiaoqiao_CaiLianJiangNan',
				action: 'DaiJi',
				x: [105, 0.5],
				y: [15, 0.1],
				scale: 0.48,
				background: 'skin_xiaoqiao_HuaHaoYueYuan_bg.png',
				clipSlots: ['san', 'guang3_30'],
				hideSlots: ['guang3_30', 'bghua1', 'bgshitou1', 'bgshitou2', 'hehua1', 
					'hehua2', 'hehua3', 'hehua4', 'shuchong1', 'shuchong2', 'shugan',
					'shui1', 'shui2', 'shuimian', 'shuiwen1', 'shuiwen2', 'shuiwen3', 'qjhehua', 'heye2'],
			},
			花好月圆:{
				name: 'skin_xiaoqiao_HuaHaoYueYuan',
				x: [-40, 0.5],
				y: [5, 0.1],
				scale: 0.5,
				background: 'skin_xiaoqiao_HuaHaoYueYuan_bg.png',
			},
			战场绝版: {
				name: '小乔/skin_xiaoqiao_zhanchangjueban',
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.64,
				action: 'DaiJi',
				background: '小乔/sin_xiaoqiao_zhanchangjueban_bg.png',
			},
			// 矫情之花: {
			// 	name: '小乔/矫情之花/yyht_xiaoqiao',
			// 	x: [0, 0.4],
			// 	y: [0, 0.2],
			// 	scale: 0.35,
			// 	angle: 24,
			// 	speed: 1,
			// 	json: true,
			// 	version: '3.8',
			// 	gongji: {
			// 		scale: 0.5,
			// 	},
			// 	background: '小乔/矫情之花/yyht_xiaoqiao_bg.png',
			// },
		},
		xinxianying:{
			英装素果:{
				name: 'skin_xinxianying_YingZhuangSuGuo',
				x: [38, 0.5],
				y: 0,
				scale: 0.7,
				background: 'skin_xinxianying_YingZhuangSuGuo_bg.png',
			},
		},
		xushi:{
			为夫弑敌:{
				name: 'skin_xushi_WeiFuShiDi',
				x: [28, 0.5],
				y: [0, 0.3],
				scale: 0.42,
				background: 'skin_xushi_WeiFuShiDi_bg.png',
				hideSlots: ['xushi_piaodai2', 'xushi_piaodai8'],
			},
			琪花瑶草: {
				name: 'skin_xushi_QiHuaYaoCao',
				x: [0, 0.75],
				y: [0, 0.22],
				scale: 0.45,
				//angle:5,
				action: 'DaiJi',
				background: 'skin_xushi_QiHuaYaoCao_bg.png',
				skinName: "琪花瑶草"
			},
		},
		yangwan:{
			星光淑婉:{
				name: 'skin_yangwan_XingGuangShuWan',
				x: [5, 0.5],
				y: [0, 0.3],
				scale: 0.42,
				background: 'skin_yangwan_XingGuangShuWan_bg.png',
			},
		},
		zhangchangpu:{
			钟桂香蒲:{
				name: 'skin_zhangchangpu_ZhongGuiXiangPu',
				x: [-5, 0.5],
				y: [5, 0.3],
				scale: 0.43,
				background: 'skin_zhangchangpu_ZhongGuiXiangPu_bg.png',
			},
		},
		zhangxingcai:{
			凯旋星花:{
				name: 'skin_zhangxingcai_KaiXuanXingHua',
				x: [-15, 0.5],
				y: [15, 0.2],
				scale: 0.6,
				background: 'skin_zhangxingcai_KaiXuanXingHua_bg.png',
			},
		},
		zhenji:{
			才颜双绝:{
				name: 'skin_zhenji_CaiYanShuangJue',
				x: [20, 0.5],
				y: [0, 0.3],
				scale: 0.45,
				background: 'skin_zhenji_CaiYanShuangJue_bg.png',
			},
			洛水神韵: {
				name: 'skin_zhenji_LuoShuiShenYun',
				x: [0, 0.5],
				y: [0, 0.09],
				scale: 0.5,
				background: 'skin_zhenji_LuoShuiShenYun_bg.png',
				skinName: "洛水神韵"
			},
		},
		zhoufei:{
			鹊星夕情:{
				name: 'skin_sundengzhoufei_QueXingXiQing',
				x: [0, 0.5],
				y: [15, 0.2],
				scale: 0.7,
				background: 'skin_sundengzhoufei_QueXingXiQing_bg.png',
			},
		},
		zhouyi:{
			剑舞浏漓:{
				name: 'skin_zhouyi_JianWuLiuLi',
				x: [0, 0.4],
				y: [0, 0.5],
				scale: 0.8,
				background: 'skin_zhouyi_JianWuLiuLi_bg.png',
			}
		},
		zhugeguo:{
			仙池起舞:{
				name: 'skin_zhugeguo_XianChiQiWu',
				action: 'DaiJi',
				x: [-70, 0.5],
				y: [15, 0.2],
				scale: 0.45,
				background: 'skin_zhugeguo_LanHeAiLian_bg.png',
			},
			兰荷艾莲:{
				name: 'skin_zhugeguo_LanHeAiLian',
				x: [-30, 0.5],
				y: [8, 0.3],
				scale: 0.5,
				background: 'skin_zhugeguo_LanHeAiLian_bg.png',
			},
		},
		zhanglu:{
			张鲁静皮:{
				name: 'skin_zhanglu_November',
				action: 'DaiJi',
				x: [-70, 0.5],
				y: [15, 0.2],
				scale: 0.45,
				background: 'skin_zhanglu_November_bg.png',
				teshu: 'TeShu',
				// gongji: {
				// 	'action': 'DaiJi'
				// }
			}
		},
		shen_ganning: {
			万人辟易: {
				name: '神甘宁/skin_shenganning_WanRenPiYi',
				x: [0, 0.35],
				y: [0, 0.25],
				angle: 23,
				scale: 0.40,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				// background: '神甘宁/skin_shenganning_WanRenPiYi_bg.png',
				beijing: {
					name: '神甘宁/skin_shen_ganning_Wan Ren Pi Yi_BeiJing',
					x: [0,-0.77],
					y: [0,0.4],
					scale: 0.3,

				},
				zhishixian: {
					name: '神甘宁/ceshi/shouji2',
					scale: 0.35,
					speed: 0.6,
					delay: 0.1,
					factor: 100,  // 调节参数, 自己根据游戏效果进行调节的参数
				}
			},
		},
		lvlingqi: {
			'战场绝版': {
				name: '吕玲绮/战场绝版/daiji2',  // 可以直接文件夹带名字
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 1,
				gongji: {
					name: '吕玲绮/战场绝版/chuchang2',
					scale: 0.7,
					action: ['gongji', 'jineng'],  // 现在可以直接填写多个攻击标签, 这样会随机使用一个攻击动作播放
				},
				teshu: 'play2',  // 特殊标签刚刚写错了
				beijing: {
					name: '吕玲绮/战场绝版/beijing',
					scale: 0.4,
					x: [0, 1.2],
					y: [0, 0.5]
				},
				chuchang: {
					name: '吕玲绮/战场绝版/chuchang',
					scale: 0.8,
					action: 'play'
				},
				shizhounian: true,
				// 十周年指示线特效包括shouji和shouji2
				zhishixian: {
					name: '吕玲绮/战场绝版/shouji2',  // 指示线
					scale: 0.8,
					speed: 0.5,
					delay: 0.5,  // 指示线在攻击多久后出现, 区间[0, 1], 默认0
					// start: 'attack',  // 填写了这个表示从武将牌处开始播放指示线动画
					effect: {  // 爆炸特效 一般是shouji
						name: '吕玲绮/战场绝版/shouji',  // 指示线
						scale: 0.6,
						speed: 0.7,
						delay: 0.2,					}
				}
			},
			test_skin_gongji: {
				name: '3.8/06/spine_minister_costume_62_88',  // 可以直接文件夹带名字
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 1,
				version: '3.8',
				// skin: 'effect',  // 待机初始皮肤
				// gongji: {
				// 	action: 'kaishi',
				// 	skin: 'effect',
				// 	ck: false,  // 出框与否, 表示攻击不出框,只改变骨骼原本位置. 拼音chukuang缩写
				// },
				json: true,  // 标明当前是json骨骼, 同理如果包含其他骨骼, 都需要指定json字段
				special: {
					变换skin: {
						skin: 'effect',
						hp: 2,
					},
					condition: {
						lowhp: {
							transform: ['变换skin'],  // 设置血量需要变换的骨骼
						},
					}
				}
				// zhishixian: {
				// 	name: 'zhaoyan/CaiHuiFangFei/shouji2',
				// 	scale: 1,
				// 	speed: 1,
				// 	delay: 0.15,
				// 	factor: 1,
				// 	start: 'attack',  // 填写了这个表示从武将牌处开始播放指示线动画
				// 	version: '3.6',
				// 	effect: {
				// 		name: 'zhaoyan/CaiHuiFangFei/shouji',
				// 		scale: 0.6,
				// 		speed: 0.7,
				// 		delay: 0.8,
				// 		background: 'zhaoyan/CaiHuiFangFei/jing_beijing_bg.png',
				// 		skinName: "彩绘芳菲",
				// 		version: '3.6',
				// 	},
				// },
			},
			'测试json': {
				name: 'test_json/spine_update_renwu',  // 可以直接文件夹带名字
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 1,
				json: true  // 标明当前是json骨骼, 同理如果包含其他骨骼, 都需要指定json字段
			},
			'测试4.0': {
				name: '滕芳兰-脂车香姝/xingxiang',
				version: '4.0',
				json: true,
				x: [-50, 0.5],
				y: [0, 0.5],
				scale: 1,
				beijing: {
					name: '滕芳兰-脂车香姝/beijing',
					scale: 0.5,
					x: [0, 0.5],
					y: [0, 0.5],
					json: true,
				},
				gongji: {
					name: '滕芳兰-脂车香姝/jineng01',
					x: [0, 0.8],
					y: [0, 0.4],
					json: true,
					scale: 1,
				},
				shizhounian: true,
			},
			'测试alpha': {
				name: 'test_alpha/i_agnes_skeleton',  // 可以直接文件夹带名字
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 0.3,
				action: 'idle',
				teshu: 'idle_touch_1',
				gongji: {
					action: 'cutin',
					x: [0, 0.8],
					y: [0, 0.4],
					showTime: 2
				},
				alpha: true,
			},
			test3_5: {
				x: [0,0.5],
				y: [0,0.5],
				name: "吕玲绮/test3_5/lihui_caiwei",
				scale: 0.35,
				version: "3.5.35",
			},
			test3_7: {
				x: [0,0.5],
				y: [0,0.5],
				name: "吕玲绮/test3_7/h01",
				scale: 0.35,
				version: "3.7",
				json: true,
			},

		},
		tenggongzhu: {
			菡萏慕卿: {
				name: "滕公主/菡萏慕卿/daiji2",
				flipX: true,
				x: [0, 0.5],
				y: [0, 0.4],
				scale: 1.0,
				angle: 0,
				speed: 1,
				teshu: 'play2',// 触发非攻击
				gongji: {
					name: "滕公主/菡萏慕卿/chuchang2",
					action: ["gongji", "jineng"],
					scale: 0.45,// 出杀或攻击时随机播放一个动画
					flipX: true,
				},
				shizhounian: true,  // 标明这是十周年的骨骼, 出场位置和出框默认会在原地, 并且返回也不是位移
				chuchang: {  // 第一回合出场
					name: "滕公主/菡萏慕卿/chuchang",
					action: "play",
					scale: 0.7,
				},
				shan: "play3", // 只有是shizhounian为true时才会播放出闪的动画. 默认play3
				background:  '滕公主/菡萏慕卿/beijing.png',
				// 指示线
				zhishixian: {
					name: '滕公主/菡萏慕卿/shouji2',
					scale: 0.7,
					speed: 0.7,
					delay: 0.1,  // 指示线在攻击多久后出现, 区间[0, 1], 默认0
					factor: 0.5,  // 调节参数, 自己根据游戏效果进行调节的参数
					effect: {  // 爆炸特效 一般是shouji
						name: '滕公主/菡萏慕卿/shouji',  // 指示线
						scale: 0.6,
						speed: 0.7,
						delay: 0.5
					}
				},
				skinName: "菡萏慕卿"
			},
			test3_8: {
				name: "滕公主/test3_8/spine_minister_57",
				x: [0, 0.63],
				y: [0, -0.43],
				scale: 0.5,
				angle: 0,
				speed: 1,
				version: '3.8',
				json: true,
				// gongji: true
			},
			测试: {
				name: '滕公主/c200_00/c200_00',
				"scale": 0.12,
				"x": [0,0.52],
				"y": [0, -0.46],
				skin: '00',
				action: 'smile',
				version: '4.0',
				alpha: true,
			}
		},

		xushao: {
			'评世雕龙': {
				name: '许邵/评世雕龙/daiji',
				x: [0, 0.5],
				y: [0, 0.5],
				// teshu: 'play2',  // 触发非攻击技能时播放
				teshu: {  // 第一回合出场
					name: '许邵/评世雕龙/chuchang2',
					action: ['gongji', 'jineng'],
					// scale: 0.45
				},
				gongji: {
					name: '许邵/评世雕龙/chuchang2',
					action: ['gongji', 'jineng']  // 出杀或攻击时随机播放一个动画
				},
				shizhounian: true,  // 标明这是十周年的骨骼, 出场位置和出框默认会在原地, 并且返回也不是位移
				chuchang: {  // 第一回合出场
					name: '许邵/评世雕龙/daiji',
					// name: '许邵/评世雕龙/chuchang',
					action: 'play',
					scale: 0.45
				},
				shan: 'play2', // 只有是shizhounian为true时才会播放出闪的动画. 默认play3
				background: '许邵/评世雕龙/skin_Decennial_XuShao_PingShiDiaoLong_bg.png'
			}
		},
		re_sunyi: {
			'腾龙翻江': {
				name: '孙翊腾龙翻江/daiji',
				x: [0, 0.5],
				y: [0, 0.5],
				teshu: 'play2',  // 触发非攻击技能时播放
				shizhounian: true,  // 标明这是十周年的骨骼, 出场位置和出框默认会在原地, 并且返回也不是位移
				chuchang: {  // 第一回合出场
					// name: '孙翊腾龙翻江/daiji',
					name: '孙翊腾龙翻江/chuchang',
					action: 'play',
					scale: 0.45
				},
				shan: 'play2', // 只有是shizhounian为true时才会播放出闪的动画. 默认play3
				background: '孙翊腾龙翻江/static_bg.png'
			}
		},
		xurong: {
			烬灭神骇: {
				name: 'skin_xurong_JinMieShenHai',
				x: [0, 0.60],
				y: [0, 0.25],
				scale: 0.45,
				action: 'DaiJi',
				pos: {
					x: [0,0.75],
					y: [0,0.4]
				},
				angle: -25,
				background: 'skin_xurong_JinMieShenHai_bg.png',
				skinName: "烬灭神骇",
				// atkFlipX: true,
			},
		},
		shen_luxun: {
			绽焰摧枯: {
				name: 'skin_shenluxun_ZhanYanCuiKu',
				x: [0, 0.53],
				y: [5, 0.45],
				scale: 0.5,
				action: 'DaiJi',
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_shenluxun_ZhanYanCuiKu_bg.png',
				skinName: "绽焰摧枯"
			},
		},
		liuyan: {
			雄踞益州: {
				name: 'skin_liuyan_XiongJuYiZhou',
				x: [0, 0.55],
				y: [0, 0.1],
				speed: 1,
				pos: {
					x: [0, 0.8],
					y: [0, 0.4]
				},
				scale: 0.55,
				background: 'skin_liuyan_XiongJuYiZhou_bg.png',
				skinName: "雄踞益州",
				special: {
					变身: {
						times: 1,  // 表示受到多少次伤害后触发该变身骨骼
						name: 'liuyan/秋霜金枫', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},
					变身2: {
						times: 3,  // 表示触发多少次伤害后变身该骨骼
						name: 'caochun/变身后', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},
					condition: {
						damage: {
							transform: ['变身', '变身2'],  // 设置血量需要变换的骨骼
						},
					}
				}
			},
			秋霜金枫: {
				name: "刘焉/秋霜金枫/liuyan_qiushuangjinfeng",
				x: [0, 0.3],
				y: [0, 0],
				scale: 0.6,
				angle: 0,
				speed: 1,
				teshu: "play2",
				gongji: {
					// x: [0, 0.72],
					// y: [0, 0.4],
					scale: 0.5,
					name: "刘焉/秋霜金枫/tushe",
					action: ["gongji", "jineng"]  // 出杀或攻击时随机播放一个动画
				},
				shizhounian: true,  // 标明这是十周年的骨骼, 出场位置和出框默认会在原地, 并且返回也不是位移
				chuchang: {  // 第一回合出场
					name: "刘焉/秋霜金枫/chuchang",
					action: "play",
					scale: 0.45
				},
				shan: "play2", // 只有是shizhounian为true时才会播放出闪的动画. 默认play3
				background: "刘焉/秋霜金枫/liuyan_qiushuangjinfeng_bg.png",
				skinName: "秋霜金枫",
				// 指示线
				zhishixian: {
					name: '刘焉/秋霜金枫/shouji2',
					scale: 0.8,
					speed: 0.3,
					delay: 0.1,
					// name: '神甘宁/ceshi/shouji2',
					// scale: 0.4,
					// speed: 0.6,
					// delay: 0.2,
					// factor: 100,  // 调节参数, 自己根据游戏效果进行调节的参数
					effect: {  // 爆炸特效 一般是shouji
						name: '刘焉/秋霜金枫/shouji',  // 指示线
						scale: 0.6,
						speed: 1,
						delay: 0.2,
					}
				}
			},
		},
		re_liru: {
			鸩杀少帝: {
				name: 'skin_liru_ZhenShaShaoDi',
				x: [0, 0.2],
				y: [0, 0.13],
				scale: 0.55,
				angle: 10,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_liru_ZhenShaShaoDi_bg.png',
				action: 'DaiJi',
				skinName: "鸩杀少帝",
				special: {
					变身: {
						name: 'caochun/变身前', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},

					condition: {
						xiandingji: {
							transform: "变身",  // 设置血量需要变换的骨骼
						},
					}
				}
			},
		},
		re_zuoci: {
			役使鬼神: {
				name: 'skin_zuoci_YiShiGuiShen',
				x: [0, 0.55],
				y: [0, -0.009],
				scale: 0.7,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_zuoci_YiShiGuiShen_bg.png',
				// angle: 10,
				skinName: "役使鬼神"
			},
		},
		dufuren: {
			战场绝版: {
				name: "杜夫人/战场绝版/skin_dufuren_ZhanChang2",
				x: [0, 0.5],
				y: [0, 0.45],
				scale: 0.8,
				angle: 0,
				speed: 1,
				teshu: {
					// x: [0, 0.75],
					// y: [0, 0.3],
					scale: 0.45,
					name: "杜夫人/战场绝版/skin_Decennial_DuFuRen_ZhanChangJueBan",
					action:["play2"],
					showTime: 2,
				},// 触发非攻击
				gongji: {
					x: [0, 0.72],
					y: [0, 0.4],
					scale: 0.5,
					name: "杜夫人/战场绝版/gongji_dufuren",
					action: ["jineng","gongji"]  // 出杀或攻击时随机播放一个动画
				},
				shizhounian: true,  // 标明这是十周年的骨骼, 出场位置和出框默认会在原地, 并且返回也不是位移
				chuchang: {  // 第一回合出场
					name: "杜夫人/战场绝版/chuchang",
					action: "play",
					scale: 0.45
				},
				shan: "play3", // 只有是shizhounian为true时才会播放出闪的动画. 默认play3
				background: "杜夫人/战场绝版/skin_Decennial_DuFuRen_ZhanChangJueBan_bg.png",
				skinName: "战场绝版"
			},
		},
		//梁兴
		liangxing: {
			骁勇金衔: {
				name: "梁兴/骁勇金衔/daiji2",
				x: [0, 0.5],
				y: [0, 0.4],
				scale: 1.0,
				angle: 0,
				speed: 1,
				teshu: {
					x: [0, 0.75],
					y: [0, 0.3],
					scale: 0.4,
					name: "梁兴/骁勇金衔/daiji",
					action:["play2"]
				},// 触发非攻击
				gongji: {
					x: [0, 0.72],
					y: [0, 0.4],
					scale: 0.5,
					name: "梁兴/骁勇金衔/gongji_liangxing",
					action: ["jineng","gongji"]  // 出杀或攻击时随机播放一个动画
				},
				shizhounian: true,  // 标明这是十周年的骨骼, 出场位置和出框默认会在原地, 并且返回也不是位移
				chuchang: {  // 第一回合出场
					name: "梁兴/骁勇金衔/chuchang",
					action: "play",
					scale: 0.45,
					showTime: 5,
					loop: true,
				},
				shan: "play3", // 只有是shizhounian为true时才会播放出闪的动画. 默认play3
				background: "梁兴/骁勇金衔/static_bg.png",
				skinName: "骁勇金衔"
			},
		},
		wenyang: {
			骁勇金衔: {
				name: "文鸯/骁勇金衔/daiji2",
				x: [0, 0.5],
				y: [0, 0.4],
				scale: 1.0,
				angle: 0,
				speed: 1,
				teshu: {
					x: [0, 0.75],
					y: [0, 0.3],
					scale: 0.4,
					name: "文鸯/骁勇金衔/daiji",
					action:["play2"]
				},// 触发非攻击
				gongji: {
					x: [0, 0.72],
					y: [0, 0.4],
					scale: 0.5,
					name: "文鸯/骁勇金衔/chuchang2",
					action: ["jineng","gongji"]  // 出杀或攻击时随机播放一个动画
				},
				shizhounian: true,  // 标明这是十周年的骨骼, 出场位置和出框默认会在原地, 并且返回也不是位移
				chuchang: {  // 第一回合出场
					name: "文鸯/骁勇金衔/chuchang",
					action: "play",
					scale: 0.45,
					// showTime: 5,
					loop: true,
				},
				shan: "play3", // 只有是shizhounian为true时才会播放出闪的动画. 默认play3
				background: "文鸯/骁勇金衔/static_bg.png",
				skinName: "骁勇金衔",
				zhishixian: {
					name: '文鸯/骁勇金衔/shouji2',  // 指示线
					scale: 0.6,
					speed: 0.8,
					delay: 0.4,
					effect: {  // 爆炸特效 一般是shouji
						name: '文鸯/骁勇金衔/shouji',  // 指示线
						scale: 0.6,
						speed: 0.7,
						delay: 0.3,
					}
				}
			},
		},

		guansuo: {
			鼠年中秋: {
				name: 'skin_guansuo_ShuNianZhongQiu',
				x: [0, -0.1],
				y: [0, 0.1],
				scale: 0.55,
				//angle:-9,
				action: 'DaiJi',
				background: 'skin_guansuo_ShuNianZhongQiu_bg.png',
				skinName: "鼠年中秋"
			},
		},
		caochun: {
			长坂败备: {
				name: 'skin_caochun_ChangBanBaiBei',
				x: [0, 0.75],
				y: [0, 0.1],
				scale: 0.53,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_caochun_ChangBanBaiBei_bg.png',
				action: 'DaiJi',
				skinName: "长坂败备"
			},
			虎年曹纯: {
				name: 'skin_caochun_HuNianCaoChun',
				x: [0, 0.5],
				y: [0, 0.3],
				scale: 0.4,
				//angle:10,
				background: 'skin_caochun_HuNianCaoChun_bg.png',
				skinName: "虎年曹纯"
			},
			变身前: {
				name: "曹纯/变身前/daiji2",
				scale: 0.35,
				x: [0,0.5],
				y: [0,0.5],
				shizhounian: true,
				background: "曹纯/变身前/static_bg.png",
				beijing: {
					name: "曹纯/变身前/beijing",
					scale: 0.35,
					x: [0,0.98],
					y: [0,0.47],
				},
				chuchang: {
					name: "曹纯/变身前/chuchang",
					scale: 0.7,
				},
				gongji: {
					name: "曹纯/变身前/chuchang2",
					scale: 0.35,
				},
				teshu: {
					name: "曹纯/变身前/chuchang2",
					scale: 0.35,
				},
				zhishixian: {
					name: "曹纯/变身前/shouji2",
					scale: 0.7,
					delay: 0.3,
					speed: 0.8,
					effect: {
						name: "曹纯/变身前/shouji",
						scale: 0.7,
						delay: 0.3,
						speed: 0.8,
					},
				},
				special: {
					变身1: {
						hp: 3,  // 如果血量低于3, 则会触发变身效果, 当血量恢复到2以上, 那么
						name: 'caochun/虎年曹纯', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},
					变身2: {
						hp: 2,  // 如果血量低于2, 则会触发变身效果, 当血量恢复到2以上, 那么
						name: 'caochun/变身后', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},
					condition: {
						lowhp: {
							transform: ['变身1', '变身2'],  // 设置血量需要变换的骨骼
							recover: false,  // 恢复血量是否变回原来的,
						},
					}
				}
			},
			变身后: {
				name: "曹纯/变身后/daiji2",
				scale: 0.35,
				x: [0,0.5],
				y: [0,0.5],
				shizhounian: true,
				background: "曹纯/变身后/static_bg.png",
				beijing: {
					name: "曹纯/变身后/beijing",
					scale: 0.35,
					x: [0,0.98],
					y: [0,0.47],
				},
				chuchang: {
					name: "曹纯/变身后/chuchang",
					scale: 0.7,
				},
				gongji: {
					name: "曹纯/变身后/chuchang2",
					scale: 0.35,
				},
				teshu: {
					name: "曹纯/变身后/chuchang2",
					scale: 0.35,
				},
				zhishixian: {
					name: "曹纯/变身后/shouji2",
					scale: 0.7,
					delay: 0.3,
					speed: 0.8,
					effect: {
						name: "曹纯/变身后/shouji",
						scale: 0.7,
						delay: 0.3,
						speed: 0.8,
					},
				},
			},
		},
		zhongyao: {
			稳定关右: {
				name: 'skin_zhongyao_WenDingGuanYou',
				x: [0, 0.55],
				y: [0, 0.2],
				scale: 0.5,
				angle: -10,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				action: 'DaiJi',
				background: 'skin_zhongyao_WenDingGuanYou_bg.png',
				skinName: "稳定关右"
			},
		},
		re_xusheng: {
			手杀新动皮: {
				name: '界徐盛/skin_xusheng_xin',
				x: [0, 0.35],
				y: [0, 0.15],
				scale: 0.5,
				// background: '界徐盛/skin_xusheng_xin_bg.png',
				gongji: {
					x: [0,0.71],
					y: [0,0.48],
					scale: 0.5,
				},
				beijing: {
					name: '界徐盛/BeiJing',
					scale: 0.5,
					x: [0, 0.6],
					y: [0, 0.6],
				},
			},
		},
		liuzan: {
			抗音而歌: {
				name: 'skin_liuzan_KangYinErGe',
				x: [0, 0.53],
				y: [0, -0.1],
				scale: 0.6,
				angle: -5,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_liuzan_KangYinErGe_bg.png',
				action: 'DaiJi',
				skinName: "抗音而歌"
			},
			灵魂歌王: {
				name: 'skin_liuzan_LingHunGeWang',
				x: [0, -0.3],
				y: [0, 0.11],
				scale: 0.45,
				angle: 10,
				pos: {
					x: [0,0.7],
					y: [0,0.5]
				},
				background: 'skin_liuzan_LingHunGeWang_bg.png',
				action: 'DaiJi',
				skinName: "灵魂歌王"
			}
		},
		sb_huangzhong: {
			//黄忠
			明良千古:{
				name: '黄忠/skin_huangzhong_mlqg',
				x: [0,0.41],
				y: [0,0.35],
				scale: 0.5,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				action: 'DaiJi',
				beijing: {
					name: '黄忠/skin_huangzhong_mlqg_bg',
					scale: 0.4,
					x: [0, 1.2],
					y: [0, 0.5]
				},
				skinName: "明良千古"
			},
		},
		shen_xunyu: {
			清明虎年: {
				name: 'skin_shen_xunyu_QingMingHuNian',
				x: [0, 0.6],
				y: [0, 0.3],
				scale: 0.5,
				background: 'skin_shen_xunyu_QingMingHuNian_bg.png',
			},
		},
		qinmi: {
			冠绝天下: {
				name: '秦宓_冠绝天下/39302_2/XingXiang',
				x: [0, 0.52],
				y: [0, 0.5],
				scale: 0.41,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				action: 'DaiJi',
				background: 'skin_qinmi_GuanJueTianXia_bg.png',
				skinName: "冠绝天下",
				beijing: {
					name: '秦宓_冠绝天下/39302_2/BeiJing',
					scale: 0.5,
					x: [0, 0.6],
					y: [0, 0.6],
				},
			},
		},
		shen_lvmeng: {
			兼资文武: {
				scale: 0.4,
				name: "神吕蒙/兼资文武/XingXiang",
				beijing: {
					scale: 0.5,
					name: "神吕蒙/兼资文武/BeiJing",
					x: [0, 0.6],
					y: [0, 0.6],
				},
				x: [0, 0.5],
				y: [0, 0.5],
			},
		},
		hujinding: {
			金粉福颜: {
				name: '胡金定-金粉福颜/daiji2',
				"scale": 0.9,
				"x": [
					0,
					0.54
				],
				"y": [
					0,
					0.42
				],
				// background: '何太后战场骨骼/skin_hetaihou_zhanchangjueban_bg.png',
				beijing: {
					name: '胡金定-金粉福颜/beijing',
					scale: 0.3,
					x: [0, 0.98],
					y: [0, 0.47]
				},
				// teshu: 'play2',  // 如果是和待机同一个皮肤, 可以直接填写对应的特殊动作标签名字
				teshu: {
					name:"胡金定-金粉福颜/chuchang2",
					action: ['gongji', 'jineng'] ,  // action不写是默认播放第一个动作
					// action: ['jineng'] ,  // action不写是默认播放第一个动作
					scale: 0.6,
				},  // 如果是和待机同一个皮肤, 可以直接填写对应的特殊动作标签名字
				play2: 'play2',
				chuchang: {
					name:"胡金定-金粉福颜/chuchang",
					scale: 0.6,
					action: 'play'  // 不填写默认是十周年的play
				},
				gongji: {
					name:"胡金定-金粉福颜/chuchang2",
					action: ['gongji', 'jineng'] ,  // action不写是默认播放第一个动作
					// action: ['jineng'] ,  // action不写是默认播放第一个动作
					scale: 0.6,
					// x: [0, 0.5],
					// y: [0, 0.5],
				},  // 通常是出框需要播放的参数
				shizhounian: true,
				// 十周年指示线特效包括shouji和shouji2
				zhishixian: {
					name: '胡金定-金粉福颜/shouji2',  // 指示线
					scale: 0.6,
					speed: 1.5,
					delay: 0.3,
					effect: {  // 爆炸特效 一般是shouji
						name: '胡金定-金粉福颜/shouji',  // 指示线
						scale: 0.6,
						speed: 0.7,
						delay: 0.5,
					}
				}
			}
		},
		re_zhugeliang: {
			武侯祠: {
				name: 'skin_zhugeliang_WuHouCi',
				x: [0, -0.173],
				y: [0, 0.38],
				scale: 0.36,
				angle: -15,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_zhugeliang_WuHouCi_bg.png',
			},
		},
		ol_yuanshao: {
			一往无前: {
				name: 'skin_yuanshao_YiWangWuQian',
				x: [0, 0.3],
				y: [0, -0.05],
				scale: 0.65,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				angle: -25,
				background: 'skin_yuanshao_YiWangWuQian_bg.png',
				skinName: "一往无前"
			},
		},
		xuyou: {
			盛气凌人: {
				name: 'skin_xuyou_ShengQiLingRen',
				x: [0, 0.51],
				y: [0, 0.01],
				scale: 0.6,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_xuyou_ShengQiLingRen_bg.png',
				skinName: "盛气凌人",
				special: {
					变身: {
						name: 'caochun/变身前', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},

					condition: {
						zhuanhuanji: {
							transform: "变身",  // 设置血量需要变换的骨骼
						},
					}
				}
			},

		},
		caojinyu: {
			测试骨骼: {
				name: '曹金玉/daiji',
				scale: 0.35,
				x: [-50, 0.5],
				y: [0, 0.5],
				// speed: 1,
				beijing: {
					name: '曹金玉/beijing',
					scale: 0.35,
					x: [-50, 0.5],
					y: [0, 0.5]
					// speed: 1,
				},
			}
		},
		tengfanglan: {
			'脂车香姝': {
				name: '滕芳兰-脂车香姝/xingxiang',
				version: '4.0',
				json: true,
				x: [0, 0.44],
				y: [0, 0.46],
				scale: 0.8,
				clipSlots: ['tengfanglan170', 'tengfanglan171', 'tengfanglan172', 'tengfanglan173', 'tengfanglan174', 'tengfanglan175', 'tengfanglan176']
				// hideSlots: ['tengfanglan170', 'tengfanglan171', 'tengfanglan172']

			}
		},
		jin_simashi: {
			牛年中秋: {
				name: 'skin_simashi_NiuNianZhongQiu',
				x: [0, -0.05],
				y: [0, 0.23],
				scale: 0.5,
				//	angle: 25,
				background: 'skin_simashi_NiuNianZhongQiu_bg.png',
				action: 'DaiJi',
				skinName: "牛年中秋"
			},
		},
		qinghegongzhu: {
			瑞雪芳梅: {
				name: "清河公主/瑞雪芳梅/xingxiang",
				x: [0, 0.42],
				y: [0, 0.38],
				scale: 0.7,
				angle: 0,
				speed: 1,
				json:true,
				version: '4.0',
				gongji: {
					name: "清河公主/瑞雪芳梅/jineng01",
					scale: 0.9,// 出杀或攻击时随机播放一个动画
					x: [0, 0.8],
					y: [0, 0.28],
					json:true,
					version: '4.0',
				},
				chuchang: {  // 第一回合出场
					name: "清河公主/瑞雪芳梅/jineng01",
					action: "play",
					scale: 0.7,
					json:true,
					version: '4.0',
				},
				beijing: {
					name: '清河公主/瑞雪芳梅/beijing',
					scale: 0.6,
					x: [0, 0.02],
					y: [0, 0.53],
					json:true,
					version: '4.0',
				},
				// 指示线
				zhishixian: {
					name: '清河公主/瑞雪芳梅/jineng02',
					scale: 1,
					speed: 1,
					delay: 0.4,
					version: '4.0',
					json: true,
					effect: {
						name: '清河公主/瑞雪芳梅/jineng02',  // 指示线
						scale: 1,
						speed: 0.7,
						delay: 0.2,
						json: true,
						version: '4.0',
					},
				},
			},
		},
		zhaoyan: {
			彩绘芳菲: {
				name: "zhaoyan/CaiHuiFangFei/daiji2",
				x: [0,0.44],
				y: [0,0.5],
				scale: 0.85,
				chuchang: {
					name: "zhaoyan/CaiHuiFangFei/chuchang",
					scale: 0.8,
				},
				beijing: {
					name: 'zhaoyan/CaiHuiFangFei/beijing',
					scale: 0.5,
					x: [0, -0.5],
					y: [0, 0.32]
				},
				// gongji: true,
				shizhounian: true,
				zhishixian: {
					name: 'zhaoyan/CaiHuiFangFei/shouji2',
					scale: 1,
					speed: 1,
					delay: 0.15,
					factor: 1,
					start: 'attack',  // 填写了这个表示从武将牌处开始播放指示线动画
					effect: {
						name: 'zhaoyan/CaiHuiFangFei/shouji',
						scale: 0.6,
						speed: 0.7,
						delay: 0.8,
						background: 'zhaoyan/CaiHuiFangFei/jing_beijing_bg.png',
						skinName: "彩绘芳菲",
					},
				},
			},
		},
		sunru: {
			月兔琼香: {
				name: "孙茹/月兔琼香/daiji2",
				x: [0,0.44],
				y: [0,0.5],
				scale: 0.85,
				chuchang: {
					name: "孙茹/月兔琼香/chuchang",
					scale: 0.8,
				},
				beijing: {
					name: '孙茹/月兔琼香/beijing',
					scale: 0.5,
					x: [0, -0.5],
					y: [0, 0.32]
				},
				shizhounian: true,
			}
		},
		xiahoudun: {
			刚烈无惧: {
				name: "夏侯惇/刚烈无惧/xingxiang",
				x: [0, 0.72],
				y: [0, 0.38],
				scale: 0.9,
				angle: 0,
				speed: 1,
				version: '4.0',
				beijing: {
					name: '夏侯惇/刚烈无惧/beijing',
					scale: 0.6,
					x: [0, 0.02],
					y: [0, 0.53],
					version: '4.0',
				},
			},
		},
		ol_caiwenji: {
			测试皮肤: {
				name: "蔡文姬/5710_mobile/xingxiang",
				x: [0, 0.72],
				y: [0, 0.38],
				scale: 0.9,
				angle: 0,
				speed: 1,
				version: '4.0',
				json: true,
				// beijing: {
				// 	name: '蔡文姬/5710_mobile/beijing',
				// 	scale: 0.6,
				// 	x: [0, 0.02],
				// 	y: [0, 0.53],
				// 	version: '4.0',
				// 	json: true,
				// },
				beijing: {
					name: '孙茹/月兔琼香/beijing',
					scale: 0.5,
					x: [0, -0.5],
					y: [0, 0.32],
					version: '3.6'
				},

				gongji: {
					name: '蔡文姬/5710_mobile/jineng01',
					scale: 0.9,
					version: 3.6,
				},
				shizhounian: true,
				chuchang: {  // 第一回合出场
					name: "蔡文姬/5710_mobile/xingxiang",
					action: "play",
					scale: 0.7,
					json: true,
					version: '4.0',
				},

				special: {
					变身: {
						name: 'ol_caiwenji/亚瑟王', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},
					jisha: {
						name: '../../../皮肤切换/effects/蔡文姬击杀/JiSha',
						json: true,
						x: [0, 0.5],
						y: [0, 0.5],
						scale: 1,
						speed: 0.8,
						version: '4.0',
						delay: 2,  // 单位秒
					},
					condition: {
						jisha: {
							transform: "变身",  // 设置血量需要变换的骨骼
							play: 'jisha',
						},
					}
				}

			},
			亚瑟王: {
				x: [0,0.5],
				y: [0,0.5],
				name: "蔡文姬/亚瑟王/class_304",
				scale: 0.35,
				version: "3.8",
				json: true,
				action: 'idle',
				skin: 'skin_01',
			},
		},
		liubei: {
			武侯祠: {
				name: 'skin_liubei_MingLiangQianGu',
				x: [0, 1.15],
				y: [0, 0.1],
				scale: 0.45,
				angle: 5,
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				action: 'DaiJi',
				background: 'skin_liubei_WuHouCi_bg.png',
			},
			龙骧麟振: {
				name: 'skin_liubei_LongXiangLinZhen',
				x: [0, 0.4],
				y: [0, 0.2],
				scale: 0.55,
				//angle:-15,
				action: 'DaiJi',
				background: 'skin_liubei_LongXiangLinZhen_bg.png',
				skinName: "龙骧麟振"
			},
			猪年圣诞: {
				name: 'skin_liubei_ZhuNianShengDan',
				x: [0, 0.22],
				y: [0, 0.12],
				scale: 0.55,
				//angle:-15,
				action: 'DaiJi',
				background: 'skin_liubei_ZhuNianShengDan_bg.png',
				skinName: "猪年圣诞"
			},
		},
		re_sunquan: {
			吴王六剑: {
				name: 'skin_sunquan_WuWangLiuJian',
				x: [0, 0.53],
				y: [0, 0.3],
				scale: 0.4,
				action: 'DaiJi',
				pos: {
					x: [0,0.8],
					y: [0,0.4]
				},
				background: 'skin_sunquan_WuWangLiuJian_bg.png',
				skinName: "吴王六剑"
			},
			牛年七夕: {
				name: 'skin_sunquan_NiuNianQiXi',
				x: [0, 0.67],
				y: [0, 0.4],
				scale: 0.58,
				angle: 15,
				action: 'DaiJi',
				background: 'skin_sunquan_NiuNianQiXi_bg.png',
			},
			猪年端午: {
				name: 'skin_sunquan_ZhuNianDuanWu',
				x: [0, 0.67],
				y: [0, 0.4],
				scale: 0.58,
				angle: 15,
				action: 'DaiJi',
				background: 'skin_sunquan_ZhuNianDuanWu_bg.png',
				skinName: "猪年端午"
			},

		},
		re_sunben: {
			长沙桓王: {
				name: 'skin_sunce_ChangShaHuanWang',
				x: [0, 0.2],
				y: [0, 0.3],
				scale: 0.45,
				pos: {
					x: [0,0.7],
					y: [0,0.4]
				},
				action: 'DaiJi',
				background: 'skin_sunce_ChangShaHuanWang_bg.png',
				skinName: "长沙桓王",
				special: {
					变身: {
						name: 'caochun/变身前', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
						// effect: true, // 预留, 选择更换骨骼的特效 , 目前只有曹纯一个, 全部默认播放曹纯的换肤骨骼
					},
					juexing: {
						name: '孙策/孙策觉醒/suncehunzi1',
						json: true,
						x: [0, 0.5],
						y: [0, 0.5],
						scale: 0.8,
						speed: 0.8,
						version: '4.0',
						delay: 2,  // 单位秒
					},
					condition: {
						juexingji: {
							transform: "变身",  // 设置血量需要变换的骨骼
							play: 'juexing',
						},
					}
				}
			},
			猪年七夕: {
				name: 'skin_sunce_ZhuNianQiXi',
				x: [0, 0.8],
				y: [0, 0.15],
				scale: 0.55,
				action: 'DaiJi',
				background: 'skin_sunce_ZhuNianQiXi_bg.png',
				skinName: "猪年七夕"
			},
		},
		beimihu: {
			鬼渊蝶引: {
				name: 'skin_beimihu_GuiYuanDieYin',
				x: [0, 0.45],
				y: [0, 0.16],
				scale: 0.5,
				//angle:-10,
				action: 'DaiJi',
				background: 'skin_beimihu_GuiYuanDieYin_bg.png',
				skinName: "鬼渊蝶引"
			},
		},
		caopi: {
			猪年端午: {
				name: 'skin_caopi_ZhuNianDuanWu',
				x: [0, 0.4],
				y: [0, 0.2],
				scale: 0.65,
				//angle:10,
				action: 'DaiJi',
				background: 'skin_caopi_ZhuNianDuanWu_bg.png',
				skinName: "猪年端午"
			},
			牛年清明: {
				name: 'skin_caopi_NiuNianQingMing',
				x: [0, 0.6],
				y: [0, 0.1],
				scale: 0.65,
				//angle:10,
				action: 'DaiJi',
				background: 'skin_caopi_NiuNianQingMing_bg.png',
				skinName: "牛年清明"
			},
		},
		shen_guojia: {
			虎年清明: {
				name: 'skin_shenguojia_QingMingHuNian',
				x: [0, 1.6],
				y: [0, 0.6],
				scale: 0.5,
				background: 'skin_shenguojia_QingMingHuNian_bg.png',
				special: {
					变身: {
						name: 'caochun/变身前', // 不同骨骼, 不填写表示同一个骨骼, 填写的话格式为 'hetaihou/战场绝版'  角色名+皮肤名称
					},
					condition: {
						xiandingji: {
							transform: "变身",  // 设置血量需要变换的骨骼
							effect: {
								scale: 0.5,
								speed: 1.5,
								name: 'huanfu'
							}, // 选择更换骨骼的特效. 特效放到effects目录下同名, 不填写默认曹纯动皮的切换特效
							// effect: 'huanfu', // 选择更换骨骼的特效. 特效放到effects目录下同名, 不填写默认曹纯动皮的切换特效
						},
					}
				}
			},
		},
		zuofen:{
			清荷粽香:{
				name: '左棻/清荷粽香/xingxiang',
				x: [ 0, 0.7],
				y: [ 0, 0.55],
				scale: 0.85,
				json: true,
				version:"4.0",
				beijing: {
					name: '左棻/清荷粽香/beijing',
					x: [0,0.55],
					y: [0,0.45],
					scale: 0.6,
					json: true,
					version:"4.0",
				},
				gongji: {
					name: '左棻/清荷粽香/jineng01',
					x: [ 0, 0.75],
					y: [ 0, 0.3],
					scale: 1,
					json:"4.0",
					version:"4.0",
				},
				zhishixian: {
					name: '左棻/清荷粽香/jineng02',
					scale: 0.8,
					speed: 0.7,
					delay: 0.3,
					json:true,
					version: '4.0',
					effect: {
						name: '左棻/清荷粽香/jineng03',
						scale: 0.8,
						speed: 0.7,
						delay: 0.3,
						version:"4.0",
						json: true
					},
				},
			},
		},


	};
	
	var extend = {
		re_baosanniang: decadeUI.dynamicSkin.baosanniang,
		xin_baosanniang: decadeUI.dynamicSkin.baosanniang,
		re_daqiao: decadeUI.dynamicSkin.daqiao,
		re_diaochan: decadeUI.dynamicSkin.diaochan,
		re_huangyueying: decadeUI.dynamicSkin.huangyueying,
		re_panshu: decadeUI.dynamicSkin.panshu,
		re_sunluban: decadeUI.dynamicSkin.sunluban,
		re_sunluyu: decadeUI.dynamicSkin.sunluyu,
		re_sunshangxiang: decadeUI.dynamicSkin.sunshangxiang,
		re_wangyi: decadeUI.dynamicSkin.wangyi,
		ol_xiaoqiao: decadeUI.dynamicSkin.re_xiaoqiao,
		re_xinxianying: decadeUI.dynamicSkin.xinxianying,
		ol_zhangchangpu: decadeUI.dynamicSkin.zhangchangpu,
		re_zhenji: decadeUI.dynamicSkin.zhenji,
		xin_liru: decadeUI.dynamicSkin.re_liru,     //李儒
		db_wenyang: decadeUI.dynamicSkin.wenyang,
		re_yuanshao: decadeUI.dynamicSkin.ol_yuanshao,
		xin_yuanshao: decadeUI.dynamicSkin.ol_yuanshao,
		re_liubei: decadeUI.dynamicSkin.liubei,
		re_caopi: decadeUI.dynamicSkin.caopi,               //曹丕
	};decadeUI.get.extend(decadeUI.dynamicSkin, extend);

	// 添加皮肤名称
	let skins = decadeUI.dynamicSkin;
	if (skins) {
		let names = Object.keys(skins);
		for (let i = 0; i < names.length; i++) {
			let datas = skins[names[i]];
			let dataKeys = Object.keys(datas);
			for (let j = 0; j < dataKeys.length; j++) {
				let skin = datas[dataKeys[j]];
				if (!skin.skinName) skin.skinName = dataKeys[j];
			}
		}
	}

});

