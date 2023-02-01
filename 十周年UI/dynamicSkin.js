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
				name: 'skin_diaochan_YuChanXianZi',
				x: [5, 0.5],
				y: [0, 0],
				scale: 0.6,
				background: 'skin_diaochan_YuChanXianZi_bg.png',

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
				x: [-80, 0.5],
				y: [8, 0.3],
				scale: 0.6,
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
				// action: 'DaiJi',
				x: [0,-0.33],
				y: [0,0.27],
				scale: 0.46,
				clipSlots: ['wangzuo', 'bu2', 'bu3'],
				background: 'skin_hetaihou_SheXieWeiXin_bg.png',
				skinName: '蛇蝎为心',
			},
			蛇蝎为心2:{
				name: 'skin_hetaihou_SheXieWeiXin',
				// action: 'DaiJi',
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
					action: ['gongji', 'jineng'] ,  // action不写是默认播放第一个动作
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
					action: ['gongji', 'jineng'] ,  // action不写是默认播放第一个动作
					scale: 0.7,
					// x: [0, 0.5],
					// y: [0, 0.5],
				},  // 通常是出框需要播放的参数
				shizhounian: true,
			}
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
					effect: {  // 爆炸特效 一般是shouji
						name: '吕玲绮/战场绝版/shouji',  // 指示线
						scale: 0.6,
						speed: 0.7,
						delay: 0.2,
					}
				}
			},
			'测试json': {
				name: 'test_json/spine_update_renwu',  // 可以直接文件夹带名字
				x: [0, 0.5],
				y: [0, 0.5],
				scale: 1,
				json: true  // 标明当前是json骨骼, 同理如果包含其他骨骼, 都需要指定json字段
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
				skinName: "烬灭神骇"
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
					x: [0, 0.7],
					y: [0, 0.45]
				},
				scale: 0.55,
				background: 'skin_liuyan_XiongJuYiZhou_bg.png',
				skinName: "雄踞益州"
			},
			秋霜金枫: {
				name: "刘焉/秋霜金枫/liuyan_qiushuangjinfeng",
				x: [0, 0.3],
				y: [10, 0],
				scale: 0.6,
				angle: 0,
				speed: 1,
				// teshu: {
				// 	x: [0, 0.75],
				// 	y: [0, 0.3],
				// 	scale: 0.45,
				// 	name: "刘焉/秋霜金枫/tushe",
				// 	action:["jineng"]
				// },// 触发非攻击
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
					speed: 0.7,
					delay: 0.1,
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
				skinName: "鸩杀少帝"
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
				background: '界徐盛/skin_xusheng_xin_bg.png',
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
	};decadeUI.get.extend(decadeUI.dynamicSkin, extend);
	
});
//
//