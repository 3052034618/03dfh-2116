import type {
  Script,
  Role,
  RoleRelation,
  DM,
  PlayerProfile,
  PastAssignment,
  Schedule,
  SchedulePlayer,
  PlayerSurvey,
  AssignmentReview,
  PlayerRoleFeedback,
  TagAdjustment,
} from '@/types';

// ========== 剧本数据 ==========
const roles: Role[] = [
  // 金陵长恨歌 - 6人古风情感 (script-001)
  {
    id: 'role-001',
    scriptId: 'script-001',
    name: '萧景琰',
    avatar: 'https://picsum.photos/seed/role001/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 5,
    deductionLevel: 2,
    beginnerFriendly: false,
    hostType: true,
    tags: ['隐忍', '深情', '帝王', '背负'],
    description: '大梁太子，外表冷峻内心柔软，为守护挚爱甘愿放弃一切。',
  },
  {
    id: 'role-002',
    scriptId: 'script-001',
    name: '苏婉儿',
    avatar: 'https://picsum.photos/seed/role002/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 5,
    deductionLevel: 3,
    beginnerFriendly: false,
    hostType: false,
    tags: ['白切黑', '亡国公主', '复仇', '深情'],
    description: '前朝公主，潜伏在太子身边的细作，在爱恨之间挣扎。',
  },
  {
    id: 'role-003',
    scriptId: 'script-001',
    name: '林月茹',
    avatar: 'https://picsum.photos/seed/role003/200/200',
    gender: 'female',
    difficulty: 2,
    emotionLevel: 4,
    deductionLevel: 2,
    beginnerFriendly: true,
    hostType: false,
    tags: ['温柔', '大家闺秀', '暗恋', '牺牲'],
    description: '太傅之女，温婉贤淑，默默守护着心中之人。',
  },
  {
    id: 'role-004',
    scriptId: 'script-001',
    name: '宇文轩',
    avatar: 'https://picsum.photos/seed/role004/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: true,
    tags: ['高冷', '将军', '忠诚', '秘密'],
    description: '镇国大将军，手握重兵，隐藏着一个关于身世的惊天秘密。',
  },
  {
    id: 'role-005',
    scriptId: 'script-001',
    name: '云舒',
    avatar: 'https://picsum.photos/seed/role005/200/200',
    gender: 'female',
    difficulty: 2,
    emotionLevel: 4,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['活泼', '神医', '兄妹', '治愈'],
    description: '鬼谷弟子，活泼开朗的神医，与宇文轩有着不解之缘。',
  },
  {
    id: 'role-006',
    scriptId: 'script-001',
    name: '李承泽',
    avatar: 'https://picsum.photos/seed/role006/200/200',
    gender: 'male',
    difficulty: 5,
    emotionLevel: 4,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['腹黑', '二皇子', '权谋', '野心'],
    description: '二皇子，表面纨绔实则野心勃勃，是一切阴谋的幕后推手。',
  },
  // 时光来信 - 5人现代情感 (script-002)
  {
    id: 'role-007',
    scriptId: 'script-002',
    name: '陈默',
    avatar: 'https://picsum.photos/seed/role007/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 5,
    deductionLevel: 2,
    beginnerFriendly: true,
    hostType: false,
    tags: ['安静', '作家', '遗憾', '初恋'],
    description: '过气作家，收到一封来自十年前的信，揭开尘封的往事。',
  },
  {
    id: 'role-008',
    scriptId: 'script-002',
    name: '林夏',
    avatar: 'https://picsum.photos/seed/role008/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 5,
    deductionLevel: 3,
    beginnerFriendly: false,
    hostType: true,
    tags: ['独立', '摄影师', '离开', '成全'],
    description: '自由摄影师，十年前不告而别，背后有着难言的苦衷。',
  },
  {
    id: 'role-009',
    scriptId: 'script-002',
    name: '周子轩',
    avatar: 'https://picsum.photos/seed/role009/200/200',
    gender: 'male',
    difficulty: 2,
    emotionLevel: 3,
    deductionLevel: 2,
    beginnerFriendly: true,
    hostType: false,
    tags: ['阳光', '医生', '守护', '备胎'],
    description: '三甲医院医生，多年来一直默默守护在林夏身边。',
  },
  {
    id: 'role-010',
    scriptId: 'script-002',
    name: '苏晚',
    avatar: 'https://picsum.photos/seed/role010/200/200',
    gender: 'female',
    difficulty: 3,
    emotionLevel: 4,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['温柔', '编辑', '暗恋', '放手'],
    description: '出版社编辑，陈默的责任编辑，暗恋陈默多年。',
  },
  {
    id: 'role-011',
    scriptId: 'script-002',
    name: '老李',
    avatar: 'https://picsum.photos/seed/role011/200/200',
    gender: 'any',
    difficulty: 4,
    emotionLevel: 5,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: true,
    tags: ['神秘', '邮局局长', '穿越', '见证'],
    description: '旧时光邮局的神秘局长，连接着过去与现在的关键人物。',
  },
  // 午夜教学楼 - 7人校园恐怖推理 (script-003)
  {
    id: 'role-012',
    scriptId: 'script-003',
    name: '张磊',
    avatar: 'https://picsum.photos/seed/role012/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 2,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: true,
    tags: ['胆大', '学生会主席', '正义', '调查'],
    description: '学生会主席，组织这次午夜探险，试图查明校园传说的真相。',
  },
  {
    id: 'role-013',
    scriptId: 'script-003',
    name: '王雪',
    avatar: 'https://picsum.photos/seed/role013/200/200',
    gender: 'female',
    difficulty: 2,
    emotionLevel: 4,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['胆小', '校花', '通灵', '钥匙'],
    description: '传说中拥有阴阳眼的校花，是打开真相的关键钥匙。',
  },
  {
    id: 'role-014',
    scriptId: 'script-003',
    name: '刘伟',
    avatar: 'https://picsum.photos/seed/role014/200/200',
    gender: 'male',
    difficulty: 4,
    emotionLevel: 3,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: false,
    tags: ['学霸', '推理狂', '秘密', '真凶'],
    description: '推理社社长，心思缜密，似乎隐藏着什么不可告人的秘密。',
  },
  {
    id: 'role-015',
    scriptId: 'script-003',
    name: '陈静',
    avatar: 'https://picsum.photos/seed/role015/200/200',
    gender: 'female',
    difficulty: 3,
    emotionLevel: 4,
    deductionLevel: 3,
    beginnerFriendly: false,
    hostType: false,
    tags: ['高冷', '转学生', '受害者', '复仇'],
    description: '半年前转学来的神秘女生，与三年前的失踪案有关。',
  },
  {
    id: 'role-016',
    scriptId: 'script-003',
    name: '赵强',
    avatar: 'https://picsum.photos/seed/role016/200/200',
    gender: 'male',
    difficulty: 2,
    emotionLevel: 2,
    deductionLevel: 2,
    beginnerFriendly: true,
    hostType: false,
    tags: ['搞笑', '体育生', '冲动', '助攻'],
    description: '篮球队队长，大大咧咧的体育生，队伍中的气氛担当。',
  },
  {
    id: 'role-017',
    scriptId: 'script-003',
    name: '李娜',
    avatar: 'https://picsum.photos/seed/role017/200/200',
    gender: 'female',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['八卦', '记者', '知情', '威胁'],
    description: '校报记者，知道很多不为人知的秘密，一直在暗中调查。',
  },
  {
    id: 'role-018',
    scriptId: 'script-003',
    name: '老保安',
    avatar: 'https://picsum.photos/seed/role018/200/200',
    gender: 'any',
    difficulty: 5,
    emotionLevel: 4,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['神秘', '守夜人', '愧疚', '真相'],
    description: '在学校工作了三十年的老保安，是当年事件的唯一目击者。',
  },
  // 第七号档案 - 6人硬核刑侦 (script-004)
  {
    id: 'role-019',
    scriptId: 'script-004',
    name: '陈队长',
    avatar: 'https://picsum.photos/seed/role019/200/200',
    gender: 'male',
    difficulty: 4,
    emotionLevel: 2,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['经验丰富', '刑侦队长', '直觉敏锐', '压力'],
    description: '市刑侦支队队长，从业二十年，这次案件让他想起了十年前的悬案。',
  },
  {
    id: 'role-020',
    scriptId: 'script-004',
    name: '林法医',
    avatar: 'https://picsum.photos/seed/role020/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 2,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: false,
    tags: ['冷静', '法医', '细节控', '完美主义'],
    description: '首席法医，能从尸体上读出别人看不到的信息。',
  },
  {
    id: 'role-021',
    scriptId: 'script-004',
    name: '王警官',
    avatar: 'https://picsum.photos/seed/role021/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['新人', '热血', '正义感', '成长'],
    description: '刚入职的新人警官，充满热情但缺乏经验。',
  },
  {
    id: 'role-022',
    scriptId: 'script-004',
    name: '嫌疑人A',
    avatar: 'https://picsum.photos/seed/role022/200/200',
    gender: 'male',
    difficulty: 5,
    emotionLevel: 4,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['企业家', '伪善', '不在场证明', '操控'],
    description: '知名企业家，表面光鲜亮丽，背后似乎藏着什么。',
  },
  {
    id: 'role-023',
    scriptId: 'script-004',
    name: '嫌疑人B',
    avatar: 'https://picsum.photos/seed/role023/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 5,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['情妇', '爱情', '牺牲', '谎言'],
    description: '死者生前的情人，声称深爱死者但有重大嫌疑。',
  },
  {
    id: 'role-024',
    scriptId: 'script-004',
    name: '嫌疑人C',
    avatar: 'https://picsum.photos/seed/role024/200/200',
    gender: 'any',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['管家', '忠诚', '秘密', '多年恩怨'],
    description: '在死者家工作了二十年的老管家，知道太多秘密。',
  },
  // 疯狂修仙局 - 8人爆笑机制 (script-005)
  {
    id: 'role-025',
    scriptId: 'script-005',
    name: '李逍遥',
    avatar: 'https://picsum.photos/seed/role025/200/200',
    gender: 'male',
    difficulty: 2,
    emotionLevel: 2,
    deductionLevel: 2,
    beginnerFriendly: true,
    hostType: true,
    tags: ['沙雕', '废柴', '主角光环', '狗屎运'],
    description: '灵根测试测出一坨屎的废柴，却意外成了修真界的希望。',
  },
  {
    id: 'role-026',
    scriptId: 'script-005',
    name: '龙傲天',
    avatar: 'https://picsum.photos/seed/role026/200/200',
    gender: 'male',
    difficulty: 2,
    emotionLevel: 1,
    deductionLevel: 2,
    beginnerFriendly: true,
    hostType: false,
    tags: ['装逼', '富二代', '打脸', '嚣张'],
    description: '龙族太子，走到哪里装逼到哪里，口头禅是"我爸是龙王"。',
  },
  {
    id: 'role-027',
    scriptId: 'script-005',
    name: '赵灵儿',
    avatar: 'https://picsum.photos/seed/role027/200/200',
    gender: 'female',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 2,
    beginnerFriendly: true,
    hostType: false,
    tags: ['花痴', '圣母', '锦鲤', '团宠'],
    description: '女娲后人，看谁都觉得帅，运气好到爆棚。',
  },
  {
    id: 'role-028',
    scriptId: 'script-005',
    name: '林怼怼',
    avatar: 'https://picsum.photos/seed/role028/200/200',
    gender: 'female',
    difficulty: 2,
    emotionLevel: 2,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['毒舌', '吐槽役', '真相帝', '傲娇'],
    description: '蜀山派首席弟子，说话不把人怼死不罢休，但内心善良。',
  },
  {
    id: 'role-029',
    scriptId: 'script-005',
    name: '王铁柱',
    avatar: 'https://picsum.photos/seed/role029/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 2,
    deductionLevel: 3,
    beginnerFriendly: false,
    hostType: true,
    tags: ['反派', '魔教教主', '中二', '社恐'],
    description: '魔教教主，立志毁灭世界，但其实是个怕生的社恐。',
  },
  {
    id: 'role-030',
    scriptId: 'script-005',
    name: '苏妲己',
    avatar: 'https://picsum.photos/seed/role030/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['魅魔', '心机', '钓鱼', '海王'],
    description: '青丘狐族，同时吊着五个备胎，感情线极其混乱。',
  },
  {
    id: 'role-031',
    scriptId: 'script-005',
    name: '师傅',
    avatar: 'https://picsum.photos/seed/role031/200/200',
    gender: 'any',
    difficulty: 4,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: true,
    tags: ['猥琐', '老顽童', '大佬装菜', '坑徒弟'],
    description: '李逍遥的便宜师傅，看起来不靠谱实则是隐藏大佬。',
  },
  {
    id: 'role-032',
    scriptId: 'script-005',
    name: '系统精灵',
    avatar: 'https://picsum.photos/seed/role032/200/200',
    gender: 'any',
    difficulty: 5,
    emotionLevel: 2,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['机械音', '任务发布机', '氪金', '外挂'],
    description: '绑定在李逍遥身上的修仙系统，说话自带【】括号。',
  },
  // 谍影迷雾 - 7人民国谍战阵营 (script-006)
  {
    id: 'role-033',
    scriptId: 'script-006',
    name: '陈明远',
    avatar: 'https://picsum.photos/seed/role033/200/200',
    gender: 'male',
    difficulty: 5,
    emotionLevel: 3,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['军统', '站长', '老狐狸', '深不可测'],
    description: '军统上海站站长，表面效忠党国，立场成谜。',
  },
  {
    id: 'role-034',
    scriptId: 'script-006',
    name: '苏雅琴',
    avatar: 'https://picsum.photos/seed/role034/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 4,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['地下党', '交际花', '伪装', '信仰'],
    description: '百乐门当红歌女，真实身份是地下党员。',
  },
  {
    id: 'role-035',
    scriptId: 'script-006',
    name: '佐藤健一',
    avatar: 'https://picsum.photos/seed/role035/200/200',
    gender: 'male',
    difficulty: 4,
    emotionLevel: 2,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['日本特高课', '反派', '残忍', '多疑'],
    description: '日本特高课课长，手段残忍，嗅觉敏锐。',
  },
  {
    id: 'role-036',
    scriptId: 'script-006',
    name: '李志刚',
    avatar: 'https://picsum.photos/seed/role036/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['军统行动队长', '粗中有细', '忠义', '摇摆'],
    description: '军统行动队队长，江湖出身，重义气。',
  },
  {
    id: 'role-037',
    scriptId: 'script-006',
    name: '方婉儿',
    avatar: 'https://picsum.photos/seed/role037/200/200',
    gender: 'female',
    difficulty: 3,
    emotionLevel: 4,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['译电员', '天才少女', '纯真', '关键'],
    description: '军统译电科天才译电员，掌握着最重要的密码本。',
  },
  {
    id: 'role-038',
    scriptId: 'script-006',
    name: '周汉文',
    avatar: 'https://picsum.photos/seed/role038/200/200',
    gender: 'male',
    difficulty: 4,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['青帮老大', '中间人', '利益', '变节'],
    description: '上海青帮老大，在各方势力间左右逢源。',
  },
  {
    id: 'role-039',
    scriptId: 'script-006',
    name: '王春梅',
    avatar: 'https://picsum.photos/seed/role039/200/200',
    gender: 'female',
    difficulty: 5,
    emotionLevel: 4,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: false,
    tags: ['三重间谍', '神秘', '伪装大师', '终极Boss'],
    description: '陈明远的贴身秘书，没有人知道她的真实身份。',
  },
  // 山村老宅 - 6人中式恐怖 (script-007)
  {
    id: 'role-040',
    scriptId: 'script-007',
    name: '吴建国',
    avatar: 'https://picsum.photos/seed/role040/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 4,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: true,
    tags: ['回乡知青', '长子', '责任', '恐惧'],
    description: '离家三十年的长子，收到父亲病危的消息赶回老宅。',
  },
  {
    id: 'role-041',
    scriptId: 'script-007',
    name: '吴秀兰',
    avatar: 'https://picsum.photos/seed/role041/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 5,
    deductionLevel: 3,
    beginnerFriendly: false,
    hostType: false,
    tags: ['疯女儿', '通灵', '诅咒', '真相'],
    description: '建国的妹妹，二十年前突然疯了，被关在老宅阁楼。',
  },
  {
    id: 'role-042',
    scriptId: 'script-007',
    name: '林医生',
    avatar: 'https://picsum.photos/seed/role042/200/200',
    gender: 'any',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['乡村医生', '知情', '愧疚', '协助'],
    description: '在村子里行医四十年的老医生，见证了吴家的一切。',
  },
  {
    id: 'role-043',
    scriptId: 'script-007',
    name: '小琴',
    avatar: 'https://picsum.photos/seed/role043/200/200',
    gender: 'female',
    difficulty: 2,
    emotionLevel: 4,
    deductionLevel: 3,
    beginnerFriendly: true,
    hostType: false,
    tags: ['童养媳', '鬼新娘', '可怜', '复仇'],
    description: '买来的童养媳，在大婚当晚投井自尽，怨气不散。',
  },
  {
    id: 'role-044',
    scriptId: 'script-007',
    name: '村长',
    avatar: 'https://picsum.photos/seed/role044/200/200',
    gender: 'male',
    difficulty: 4,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: true,
    tags: ['老村长', '隐瞒', '共犯', '保护'],
    description: '当了五十年村长，村子里的事没有他不知道的。',
  },
  {
    id: 'role-045',
    scriptId: 'script-007',
    name: '吴老太爷',
    avatar: 'https://picsum.photos/seed/role045/200/200',
    gender: 'male',
    difficulty: 5,
    emotionLevel: 4,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['将死之人', '忏悔', '起源', '诅咒源头'],
    description: '卧病在床的吴家老太爷，一切悲剧的始作俑者。',
  },
  // 时间悖论 - 6人科幻烧脑 (script-008)
  {
    id: 'role-046',
    scriptId: 'script-008',
    name: '陈博士',
    avatar: 'https://picsum.photos/seed/role046/200/200',
    gender: 'male',
    difficulty: 5,
    emotionLevel: 3,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['科学家', '时间机器发明者', '疯狂', '执念'],
    description: '时间机器的发明者，为了挽救女儿的生命不惜一切。',
  },
  {
    id: 'role-047',
    scriptId: 'script-008',
    name: '林小雨',
    avatar: 'https://picsum.photos/seed/role047/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 5,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['博士女儿', '时间节点', '悖论核心', '存在与否'],
    description: '陈博士的女儿，在五年前的一场车祸中"死亡"。',
  },
  {
    id: 'role-048',
    scriptId: 'script-008',
    name: '张助理',
    avatar: 'https://picsum.photos/seed/role048/200/200',
    gender: 'any',
    difficulty: 3,
    emotionLevel: 2,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['助手', '未来人', '观察者', '任务'],
    description: '陈博士的助手，真实身份是来自2050年的时间管理者。',
  },
  {
    id: 'role-049',
    scriptId: 'script-008',
    name: '王警官',
    avatar: 'https://picsum.photos/seed/role049/200/200',
    gender: 'male',
    difficulty: 3,
    emotionLevel: 3,
    deductionLevel: 4,
    beginnerFriendly: true,
    hostType: false,
    tags: ['警察', '调查者', '前同事', '友情'],
    description: '负责五年前车祸案的警官，一直对案件存疑。',
  },
  {
    id: 'role-050',
    scriptId: 'script-008',
    name: '赵医生',
    avatar: 'https://picsum.photos/seed/role050/200/200',
    gender: 'female',
    difficulty: 4,
    emotionLevel: 4,
    deductionLevel: 4,
    beginnerFriendly: false,
    hostType: false,
    tags: ['心理医生', '记忆篡改', '知情', '纠结'],
    description: '陈博士的心理医生，同时也是那场车祸的幸存者。',
  },
  {
    id: 'role-051',
    scriptId: 'script-008',
    name: '神秘人X',
    avatar: 'https://picsum.photos/seed/role051/200/200',
    gender: 'any',
    difficulty: 5,
    emotionLevel: 4,
    deductionLevel: 5,
    beginnerFriendly: false,
    hostType: true,
    tags: ['另一条时间线', '陈博士本人', '老年', '修正'],
    description: '戴着面具的神秘人，似乎对一切了如指掌。',
  },
];

const relations: RoleRelation[] = [
  // 金陵长恨歌 relations
  { roleA: 'role-001', roleB: 'role-002', type: 'lover', intensity: 3 },
  { roleA: 'role-001', roleB: 'role-003', type: 'family', intensity: 2 },
  { roleA: 'role-001', roleB: 'role-006', type: 'enemy', intensity: 3 },
  { roleA: 'role-002', roleB: 'role-006', type: 'secret', intensity: 2 },
  { roleA: 'role-004', roleB: 'role-005', type: 'partner', intensity: 2 },
  { roleA: 'role-003', roleB: 'role-005', type: 'family', intensity: 1 },
  // 时光来信 relations
  { roleA: 'role-007', roleB: 'role-008', type: 'lover', intensity: 3 },
  { roleA: 'role-007', roleB: 'role-010', type: 'partner', intensity: 2 },
  { roleA: 'role-008', roleB: 'role-009', type: 'family', intensity: 2 },
  { roleA: 'role-009', roleB: 'role-010', type: 'secret', intensity: 1 },
  { roleA: 'role-011', roleB: 'role-007', type: 'secret', intensity: 3 },
  // 午夜教学楼 relations
  { roleA: 'role-012', roleB: 'role-013', type: 'lover', intensity: 2 },
  { roleA: 'role-014', roleB: 'role-015', type: 'secret', intensity: 3 },
  { roleA: 'role-015', roleB: 'role-018', type: 'family', intensity: 3 },
  { roleA: 'role-016', roleB: 'role-017', type: 'partner', intensity: 1 },
  { roleA: 'role-014', roleB: 'role-018', type: 'enemy', intensity: 3 },
  // 第七号档案 relations
  { roleA: 'role-019', roleB: 'role-020', type: 'partner', intensity: 3 },
  { roleA: 'role-022', roleB: 'role-023', type: 'lover', intensity: 2 },
  { roleA: 'role-022', roleB: 'role-024', type: 'family', intensity: 2 },
  { roleA: 'role-023', roleB: 'role-024', type: 'enemy', intensity: 2 },
  { roleA: 'role-019', roleB: 'role-022', type: 'enemy', intensity: 3 },
  // 疯狂修仙局 relations
  { roleA: 'role-025', roleB: 'role-027', type: 'lover', intensity: 2 },
  { roleA: 'role-025', roleB: 'role-026', type: 'enemy', intensity: 1 },
  { roleA: 'role-025', roleB: 'role-031', type: 'family', intensity: 3 },
  { roleA: 'role-029', roleB: 'role-032', type: 'partner', intensity: 2 },
  { roleA: 'role-030', roleB: 'role-026', type: 'secret', intensity: 2 },
  { roleA: 'role-028', roleB: 'role-029', type: 'enemy', intensity: 2 },
  // 谍影迷雾 relations
  { roleA: 'role-033', roleB: 'role-039', type: 'secret', intensity: 3 },
  { roleA: 'role-034', roleB: 'role-036', type: 'lover', intensity: 2 },
  { roleA: 'role-033', roleB: 'role-035', type: 'enemy', intensity: 3 },
  { roleA: 'role-037', roleB: 'role-034', type: 'family', intensity: 2 },
  { roleA: 'role-038', roleB: 'role-035', type: 'partner', intensity: 2 },
  { roleA: 'role-036', roleB: 'role-033', type: 'family', intensity: 2 },
  // 山村老宅 relations
  { roleA: 'role-040', roleB: 'role-041', type: 'family', intensity: 3 },
  { roleA: 'role-040', roleB: 'role-045', type: 'family', intensity: 3 },
  { roleA: 'role-043', roleB: 'role-045', type: 'enemy', intensity: 3 },
  { roleA: 'role-043', roleB: 'role-041', type: 'secret', intensity: 3 },
  { roleA: 'role-044', roleB: 'role-045', type: 'partner', intensity: 2 },
  { roleA: 'role-042', roleB: 'role-043', type: 'secret', intensity: 2 },
  // 时间悖论 relations
  { roleA: 'role-046', roleB: 'role-047', type: 'family', intensity: 3 },
  { roleA: 'role-046', roleB: 'role-048', type: 'partner', intensity: 2 },
  { roleA: 'role-046', roleB: 'role-051', type: 'secret', intensity: 3 },
  { roleA: 'role-047', roleB: 'role-050', type: 'lover', intensity: 2 },
  { roleA: 'role-049', roleB: 'role-046', type: 'family', intensity: 2 },
  { roleA: 'role-048', roleB: 'role-051', type: 'enemy', intensity: 3 },
];

export const scripts: Script[] = [
  {
    id: 'script-001',
    name: '金陵长恨歌',
    cover: 'https://picsum.photos/seed/jinling/800/600',
    genre: ['情感', '古风', '还原'],
    playerCount: 6,
    minPlayers: 6,
    maxPlayers: 6,
    duration: 300,
    difficulty: 3,
    description: '大梁永安二十三年，太子大婚之夜，一场大火焚毁了东宫。十年后，当众人重新聚首，才发现那场火灾背后，藏着每个人都无法面对的过往。家国天下与儿女情长，该如何抉择？',
    roles: roles.filter((r) => r.scriptId === 'script-001'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-001'
    ),
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'script-002',
    name: '时光来信',
    cover: 'https://picsum.photos/seed/shiguang/800/600',
    genre: ['情感', '现代', '治愈'],
    playerCount: 5,
    minPlayers: 5,
    maxPlayers: 5,
    duration: 240,
    difficulty: 2,
    description: '你有没有一个想见却再也见不到的人？旧时光邮局，据说可以寄信给过去的自己。一封十年前的来信，将五个陌生人的命运重新交织。原来，遗憾是可以用另一种方式弥补的。',
    roles: roles.filter((r) => r.scriptId === 'script-002'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-002'
    ),
    createdAt: '2025-02-20T14:30:00Z',
  },
  {
    id: 'script-003',
    name: '午夜教学楼',
    cover: 'https://picsum.photos/seed/wuye/800/600',
    genre: ['恐怖', '校园', '推理', '变格'],
    playerCount: 7,
    minPlayers: 7,
    maxPlayers: 7,
    duration: 360,
    difficulty: 4,
    description: '传闻三中教学楼里，每到午夜十二点，就会响起三年前跳楼那个女生的歌声。今年的毕业季，七个胆大的学生决定去一探究竟。然而，当门在身后关上的那一刻，他们才发现，有些东西，是不能随便看的。',
    roles: roles.filter((r) => r.scriptId === 'script-003'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-003'
    ),
    createdAt: '2025-03-10T09:15:00Z',
  },
  {
    id: 'script-004',
    name: '第七号档案',
    cover: 'https://picsum.photos/seed/diqi/800/600',
    genre: ['硬核', '刑侦', '本格'],
    playerCount: 6,
    minPlayers: 6,
    maxPlayers: 6,
    duration: 360,
    difficulty: 5,
    description: '2024年12月24日平安夜，著名企业家张大年死于自己的书房。密室、不可能犯罪、完美的不在场证明。这是刑侦队成立以来遇到的最棘手的案件。三位警官 vs 三位嫌疑人，真相只有一个。',
    roles: roles.filter((r) => r.scriptId === 'script-004'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-004'
    ),
    createdAt: '2025-01-28T16:45:00Z',
  },
  {
    id: 'script-005',
    name: '疯狂修仙局',
    cover: 'https://picsum.photos/seed/fengkuang/800/600',
    genre: ['欢乐', '机制', '古风', '爆笑'],
    playerCount: 8,
    minPlayers: 8,
    maxPlayers: 8,
    duration: 300,
    difficulty: 2,
    description: '欢迎来到一个不正常的修真世界！这里的废柴有主角光环，太子爷装逼被打脸，魔教教主是社恐，连系统都在疯狂搞事。今天，是万仙盟召开的日子，一场惊天动地（令人头秃）的修仙之旅即将开始！',
    roles: roles.filter((r) => r.scriptId === 'script-005'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-005'
    ),
    createdAt: '2025-04-01T08:00:00Z',
  },
  {
    id: 'script-006',
    name: '谍影迷雾',
    cover: 'https://picsum.photos/seed/dieying/800/600',
    genre: ['阵营', '民国', '谍战', '机制'],
    playerCount: 7,
    minPlayers: 7,
    maxPlayers: 7,
    duration: 330,
    difficulty: 4,
    description: '1943年的上海，风雨飘摇。军统、地下党、日伪、青帮，各方势力暗流涌动。一份重要情报的出现，让所有人的伪装开始瓦解。在这个背叛是常态的年代，你敢相信身边的人吗？阵营战正式开始！',
    roles: roles.filter((r) => r.scriptId === 'script-006'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-006'
    ),
    createdAt: '2025-02-14T11:20:00Z',
  },
  {
    id: 'script-007',
    name: '山村老宅',
    cover: 'https://picsum.photos/seed/shancun/800/600',
    genre: ['恐怖', '中式', '还原', '情感'],
    playerCount: 6,
    minPlayers: 6,
    maxPlayers: 6,
    duration: 300,
    difficulty: 3,
    description: '云贵高原深处的吴家村，有一座百年老宅。每到阴雨天，井里就会传来女人的哭声。离家三十年的长子回来了，他不知道的是，老宅的每一块砖、每一片瓦，都记得那些被刻意遗忘的故事。',
    roles: roles.filter((r) => r.scriptId === 'script-007'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-007'
    ),
    createdAt: '2025-04-15T13:10:00Z',
  },
  {
    id: 'script-008',
    name: '时间悖论',
    cover: 'https://picsum.photos/seed/shijian/800/600',
    genre: ['还原', '科幻', '硬核', '烧脑'],
    playerCount: 6,
    minPlayers: 6,
    maxPlayers: 6,
    duration: 360,
    difficulty: 5,
    description: '2025年，陈博士宣布时间机器研发成功。消息公布的第二天，实验室发生了一场爆炸，陈博士失踪了。五个被邀请来见证历史的人，发现自己陷入了一个永远走不出去的时间循环。谁在说谎？谁又是真正的自己？',
    roles: roles.filter((r) => r.scriptId === 'script-008'),
    relations: relations.filter(
      (r) => roles.find((role) => role.id === r.roleA)?.scriptId === 'script-008'
    ),
    createdAt: '2025-05-01T17:30:00Z',
  },
];

// ========== DM 数据 ==========
export const dms: DM[] = [
  {
    id: 'dm-001',
    name: '苏墨',
    avatar: 'https://picsum.photos/seed/dm001/200/200',
    specialty: ['情感', '古风', '还原'],
    totalSessions: 380,
    averageRating: 4.9,
  },
  {
    id: 'dm-002',
    name: '陈景',
    avatar: 'https://picsum.photos/seed/dm002/200/200',
    specialty: ['硬核', '推理', '刑侦'],
    totalSessions: 320,
    averageRating: 4.7,
  },
  {
    id: 'dm-003',
    name: '林夜',
    avatar: 'https://picsum.photos/seed/dm003/200/200',
    specialty: ['恐怖', '中式', '变格'],
    totalSessions: 260,
    averageRating: 4.8,
  },
  {
    id: 'dm-004',
    name: '赵悦',
    avatar: 'https://picsum.photos/seed/dm004/200/200',
    specialty: ['欢乐', '机制', '阵营'],
    totalSessions: 210,
    averageRating: 4.6,
  },
];

// ========== 玩家数据 ==========
const pastAssignmentsList: PastAssignment[][] = [
  // player-001
  [
    {
      scheduleId: 'sched-901',
      scriptId: 'script-001',
      scriptName: '金陵长恨歌',
      roleId: 'role-002',
      roleName: '苏婉儿',
      date: '2026-04-10',
      satisfactionScore: 5,
      score: 5,
      experienceTags: ['感动', '沉浸', '意难平'],
      roleTags: ['白切黑', '亡国公主', '复仇', '深情'],
    },
    {
      scheduleId: 'sched-902',
      scriptId: 'script-002',
      scriptName: '时光来信',
      roleId: 'role-008',
      roleName: '林夏',
      date: '2026-05-05',
      satisfactionScore: 4,
      score: 4,
      experienceTags: ['治愈', '遗憾'],
      roleTags: ['独立', '摄影师', '离开', '成全'],
    },
  ],
  // player-002
  [
    {
      scheduleId: 'sched-903',
      scriptId: 'script-004',
      scriptName: '第七号档案',
      roleId: 'role-020',
      roleName: '林法医',
      date: '2026-03-20',
      satisfactionScore: 5,
      score: 5,
      experienceTags: ['烧脑', '推理爽'],
      roleTags: ['冷静', '法医', '细节控', '完美主义'],
    },
  ],
  // player-003 - 新玩家无记录
  [],
  // player-004
  [
    {
      scheduleId: 'sched-904',
      scriptId: 'script-005',
      scriptName: '疯狂修仙局',
      roleId: 'role-025',
      roleName: '李逍遥',
      date: '2026-05-28',
      satisfactionScore: 5,
      score: 5,
      experienceTags: ['爆笑', '放飞自我'],
      roleTags: ['沙雕', '废柴', '主角光环', '狗屎运'],
    },
  ],
  // 其他玩家简略
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
];

const playerNames = [
  { name: '沈清欢', gender: 'female' as const },
  { name: '顾城', gender: 'male' as const },
  { name: '林小溪', gender: 'female' as const },
  { name: '陈浩然', gender: 'male' as const },
  { name: '王雨桐', gender: 'female' as const },
  { name: '李明远', gender: 'male' as const },
  { name: '张晓薇', gender: 'female' as const },
  { name: '刘子轩', gender: 'male' as const },
  { name: '周诗琪', gender: 'female' as const },
  { name: '吴嘉豪', gender: 'male' as const },
  { name: '郑思雨', gender: 'female' as const },
  { name: '孙志鹏', gender: 'male' as const },
  { name: '黄梦琪', gender: 'female' as const },
  { name: '杨宇航', gender: 'male' as const },
  { name: '刘思佳', gender: 'female' as const },
  { name: '赵文博', gender: 'male' as const },
  { name: '陈雨欣', gender: 'female' as const },
  { name: '王俊杰', gender: 'male' as const },
  { name: '李思源', gender: 'female' as const },
  { name: '张天宇', gender: 'male' as const },
  { name: '吴雅婷', gender: 'female' as const },
  { name: '何志强', gender: 'male' as const },
  { name: '马若曦', gender: 'female' as const },
  { name: '胡嘉伟', gender: 'male' as const },
  { name: '朱雪梅', gender: 'female' as const },
  { name: '郭东升', gender: 'male' as const },
  { name: '林婉清', gender: 'female' as const },
  { name: '高鹏飞', gender: 'male' as const },
  { name: '徐美玲', gender: 'female' as const },
  { name: '罗子文', gender: 'male' as const },
  { name: '谢晓彤', gender: 'female' as const },
  { name: '韩沐阳', gender: 'male' as const },
];

const tagWeightsList: Record<string, number>[] = [
  { emotion: 95, deduction: 40, horror: 20, joy: 50, camp: 35, romance: 90, tearjerker: 88, costume: 85 },
  { emotion: 50, deduction: 92, horror: 35, joy: 45, camp: 60, logic: 90, reasoning: 88, hardcore: 85 },
  { emotion: 70, deduction: 30, horror: 15, joy: 60, camp: 40, healing: 75, cute: 80 },
  { emotion: 35, deduction: 50, horror: 25, joy: 95, camp: 88, hilarious: 92, mechanism: 80, 'sand sculpt': 90 },
  { emotion: 45, deduction: 60, horror: 88, joy: 35, camp: 30, thriller: 90, atmosphere: 85, chinese: 80 },
  { emotion: 40, deduction: 55, horror: 30, joy: 65, camp: 92, spy: 88, republican: 80, faction: 90 },
  { emotion: 88, deduction: 45, horror: 25, joy: 55, camp: 40, love: 90, regret: 85 },
  { emotion: 55, deduction: 90, horror: 40, joy: 40, camp: 50, sci_fi: 85, restore: 88, brain_burn: 90 },
  { emotion: 75, deduction: 35, horror: 20, joy: 70, camp: 45, daily: 72, warmth: 80 },
  { emotion: 60, deduction: 70, horror: 50, joy: 55, camp: 65, crime: 78, police: 72 },
  { emotion: 40, deduction: 88, horror: 35, joy: 45, camp: 55, benge: 85, '密室': 90, logic: 88 },
  { emotion: 80, deduction: 40, horror: 85, joy: 30, camp: 25, weird: 80, terror: 88, '中式': 82 },
  { emotion: 30, deduction: 75, horror: 30, joy: 85, camp: 75, mechanism: 88, interactive: 80 },
  { emotion: 90, deduction: 35, horror: 15, joy: 45, camp: 30, literature: 78, art: 75 },
  { emotion: 50, deduction: 45, horror: 20, joy: 90, camp: 70, party: 85, '聚会': 82 },
  { emotion: 70, deduction: 60, horror: 30, joy: 50, camp: 55, family: 72, friendship: 75 },
  { emotion: 55, deduction: 85, horror: 45, joy: 40, camp: 45, reversed: 80, plot_twist: 85 },
  { emotion: 65, deduction: 30, horror: 25, joy: 75, camp: 60, sweet: 78, romantic: 72 },
  { emotion: 45, deduction: 95, horror: 55, joy: 35, camp: 50, deep: 82, philosophy: 78 },
  { emotion: 35, deduction: 45, horror: 30, joy: 80, camp: 85, comedy: 88, light: 75 },
  { emotion: 85, deduction: 50, horror: 35, joy: 45, camp: 40, sacrifice: 80, loyalty: 75 },
  { emotion: 40, deduction: 80, horror: 65, joy: 30, camp: 55, apocalypse: 75, zombie: 70 },
  { emotion: 75, deduction: 40, horror: 20, joy: 65, camp: 35, youth: 82, '校园': 78 },
  { emotion: 50, deduction: 55, horror: 35, joy: 70, camp: 80, business: 72, intrigue: 75 },
  { emotion: 92, deduction: 35, horror: 15, joy: 40, camp: 25, mother_son: 85, family_love: 88 },
  { emotion: 30, deduction: 92, horror: 40, joy: 35, camp: 45, high_iq: 88, math: 78 },
  { emotion: 70, deduction: 45, horror: 30, joy: 60, camp: 70, hot_blood: 80, battle: 75 },
  { emotion: 82, deduction: 55, horror: 45, joy: 35, camp: 40, tragedy: 85, epic: 80 },
  { emotion: 45, deduction: 65, horror: 25, joy: 75, camp: 65, pets: 70, '治愈': 85 },
  { emotion: 55, deduction: 75, horror: 55, joy: 45, camp: 60, detective: 82, suspense: 78 },
  { emotion: 88, deduction: 40, horror: 30, joy: 55, camp: 35, lgbt: 75, equality: 72 },
  { emotion: 60, deduction: 70, horror: 50, joy: 55, camp: 75, history: 78, '权谋': 85 },
];

const totalGamesList = [48, 35, 2, 22, 41, 28, 50, 33, 18, 25, 42, 30, 15, 38, 20, 27, 45, 12, 36, 8, 32, 24, 19, 40, 31, 44, 10, 37, 14, 29, 26, 5];
const avgSatisfactionList = [4.8, 4.5, 4.9, 4.7, 4.3, 4.6, 4.9, 4.4, 4.7, 4.2, 4.8, 4.5, 4.6, 4.9, 4.3, 4.5, 4.7, 4.8, 4.4, 4.9, 4.6, 4.3, 4.5, 4.7, 4.8, 4.6, 4.7, 4.5, 4.8, 4.4, 4.6, 4.8];

export const players: PlayerProfile[] = playerNames.map((p, idx) => {
  const id = `player-${String(idx + 1).padStart(3, '0')}`;
  return {
    id,
    name: p.name,
    phone: `138${String(10000000 + idx * 37).slice(-8)}`,
    avatar: `https://picsum.photos/seed/${id}/200/200`,
    gender: p.gender,
    totalGames: totalGamesList[idx],
    averageSatisfaction: avgSatisfactionList[idx],
    tagWeights: tagWeightsList[idx],
    pastAssignments: pastAssignmentsList[idx] || [],
  };
});

// ========== 车次数据 ==========
const baseDate = new Date('2026-06-20');
function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

function createSurvey(socialStyle: 'social' | 'normal' | 'introvert', date: string, time: string): PlayerSurvey {
  const genrePool = [
    ['情感', '古风', '治愈'],
    ['硬核', '刑侦', '推理'],
    ['恐怖', '中式'],
    ['欢乐', '机制', '爆笑'],
    ['阵营', '谍战', '民国'],
    ['还原', '科幻', '烧脑'],
  ];
  const tabooPool = [
    [],
    ['血腥'],
    ['恐怖'],
    ['情感纠葛'],
    ['恐怖', '血腥'],
  ];
  const socialStyles: ('social' | 'normal' | 'introvert')[] = ['social', 'normal', 'introvert'];
  const genderPrefs: ('match' | 'cross' | 'any')[] = ['match', 'any', 'cross', 'any'];
  const notes = ['', '不要反串', '希望有感动的角色', '喜欢烧脑的', '熟人局，希望分配在一起', '第一次玩，求带'];

  const r1 = Math.floor(Math.random() * genrePool.length);
  const r2 = Math.floor(Math.random() * tabooPool.length);
  const r3 = Math.floor(Math.random() * genderPrefs.length);
  const r4 = Math.floor(Math.random() * notes.length);

  return {
    submittedAt: `${date}T${time}:00Z`,
    preferredGenres: genrePool[r1],
    tabooContent: tabooPool[r2],
    socialStyle: socialStyles[socialStyle === 'social' ? 0 : socialStyle === 'normal' ? 1 : 2],
    willingToLead: Math.random() > 0.5,
    genderPreference: genderPrefs[r3],
    extraNotes: notes[r4],
  };
}

function createSchedulePlayers(
  count: number,
  date: string,
  time: string,
  includeSurvey: boolean,
  startIdx: number
): SchedulePlayer[] {
  const result: SchedulePlayer[] = [];
  // 熟人关系圈：前2个是情侣，3-4是朋友
  for (let i = 0; i < count; i++) {
    const idx = ((startIdx + i) % 32);
    const pId = `player-${String(idx + 1).padStart(3, '0')}`;
    const isNew = totalGamesList[idx] < 5;
    
    let acquaintanceWith: string[] = [];
    let relationType: SchedulePlayer['relationType'] = undefined;
    
    if (i === 0 && count >= 2) {
      const nextId = `player-${String(((startIdx + 1) % 32) + 1).padStart(3, '0')}`;
      acquaintanceWith = [nextId];
      relationType = 'lover';
    } else if (i === 1) {
      const prevId = `player-${String((startIdx % 32) + 1).padStart(3, '0')}`;
      acquaintanceWith = [prevId];
      relationType = 'lover';
    } else if (i === 2 && count >= 4) {
      const nextId = `player-${String(((startIdx + 3) % 32) + 1).padStart(3, '0')}`;
      acquaintanceWith = [nextId];
      relationType = 'friend';
    } else if (i === 3) {
      const prevId = `player-${String(((startIdx + 2) % 32) + 1).padStart(3, '0')}`;
      acquaintanceWith = [prevId];
      relationType = 'friend';
    } else {
      relationType = 'stranger';
    }

    let surveyResponse: PlayerSurvey | undefined = undefined;
    if (includeSurvey && Math.random() < 0.7) {
      const r = Math.random();
      let ss: 'social' | 'normal' | 'introvert';
      if (r < 0.25) ss = 'social';
      else if (r < 0.8) ss = 'normal';
      else ss = 'introvert';
      surveyResponse = createSurvey(ss, date, time);
    }

    result.push({
      playerId: pId,
      isNew,
      acquaintanceWith,
      relationType,
      surveyResponse,
    });
  }
  return result;
}

function calcSurveyStatus(players: SchedulePlayer[]): Schedule['surveyStatus'] {
  const total = players.length;
  const responded = players.filter((p) => p.surveyResponse).length;
  if (responded === 0) return 'not_sent';
  if (responded === total) return 'completed';
  if (responded < total / 2) return 'partial';
  return 'sent';
}

const scheduleConfigs = [
  { scriptId: 'script-001', dayOffset: 0, startTime: '13:30', endTime: '18:30', room: '长安厅', dmId: 'dm-001', status: 'pending' as const, playerStartIdx: 0 },
  { scriptId: 'script-005', dayOffset: 0, startTime: '19:00', endTime: '24:00', room: '蓬莱厅', dmId: 'dm-004', status: 'ready' as const, playerStartIdx: 8 },
  { scriptId: 'script-002', dayOffset: 1, startTime: '14:00', endTime: '18:00', room: '时光厅', dmId: 'dm-001', status: 'playing' as const, playerStartIdx: 16 },
  { scriptId: 'script-007', dayOffset: 1, startTime: '19:30', endTime: '24:30', room: '山村厅', dmId: 'dm-003', status: 'pending' as const, playerStartIdx: 24 },
  { scriptId: 'script-004', dayOffset: 2, startTime: '13:00', endTime: '19:00', room: '档案室', dmId: 'dm-002', status: 'ready' as const, playerStartIdx: 4 },
  { scriptId: 'script-006', dayOffset: 2, startTime: '19:00', endTime: '24:30', room: '上海滩', dmId: 'dm-004', status: 'pending' as const, playerStartIdx: 12 },
  { scriptId: 'script-003', dayOffset: 3, startTime: '22:00', endTime: '28:00', room: '教学楼', dmId: 'dm-003', status: 'pending' as const, playerStartIdx: 20 },
  { scriptId: 'script-008', dayOffset: 3, startTime: '14:00', endTime: '20:00', room: '量子厅', dmId: 'dm-002', status: 'finished' as const, playerStartIdx: 28 },
  { scriptId: 'script-001', dayOffset: 4, startTime: '13:30', endTime: '18:30', room: '长安厅', dmId: 'dm-001', status: 'pending' as const, playerStartIdx: 2 },
  { scriptId: 'script-005', dayOffset: 4, startTime: '19:00', endTime: '24:00', room: '蓬莱厅', dmId: 'dm-004', status: 'ready' as const, playerStartIdx: 10 },
  { scriptId: 'script-002', dayOffset: 5, startTime: '10:00', endTime: '14:00', room: '时光厅', dmId: 'dm-001', status: 'finished' as const, playerStartIdx: 18 },
  { scriptId: 'script-006', dayOffset: 5, startTime: '15:00', endTime: '20:30', room: '上海滩', dmId: 'dm-004', status: 'pending' as const, playerStartIdx: 26 },
  { scriptId: 'script-007', dayOffset: 6, startTime: '19:30', endTime: '24:30', room: '山村厅', dmId: 'dm-003', status: 'pending' as const, playerStartIdx: 6 },
  { scriptId: 'script-003', dayOffset: 6, startTime: '14:00', endTime: '20:00', room: '教学楼', dmId: 'dm-003', status: 'finished' as const, playerStartIdx: 14 },
  { scriptId: 'script-004', dayOffset: 6, startTime: '10:00', endTime: '16:00', room: '档案室', dmId: 'dm-002', status: 'playing' as const, playerStartIdx: 22 },
];

export const schedules: Schedule[] = scheduleConfigs.map((cfg, idx) => {
  const id = `sched-${String(idx + 1).padStart(3, '0')}`;
  const date = addDays(baseDate, cfg.dayOffset);
  const script = scripts.find((s) => s.id === cfg.scriptId)!;
  const playersForSched = createSchedulePlayers(
    script.playerCount,
    date,
    cfg.startTime,
    cfg.status !== 'pending',
    cfg.playerStartIdx
  );
  return {
    id,
    scriptId: cfg.scriptId,
    date,
    startTime: cfg.startTime,
    endTime: cfg.endTime,
    room: cfg.room,
    dmId: cfg.dmId,
    status: cfg.status,
    players: playersForSched,
    surveyStatus: calcSurveyStatus(playersForSched),
    createdAt: '2026-06-15T08:00:00Z',
  };
});

// ========== 分角复盘记录 ==========
function createPerPlayerFeedback(
  playerIds: string[],
  roleIds: string[]
): PlayerRoleFeedback[] {
  const expTagPool = [
    ['沉浸', '感动', '意难平'],
    ['烧脑', '推理爽', '恍然大悟'],
    ['爆笑', '放飞自我', '开心'],
    ['害怕', '刺激', '氛围好'],
    ['策略', '勾心斗角', '爽'],
    ['治愈', '温暖', '感动'],
    ['懵', '无聊', '没进入状态'],
    ['投入', '共情', '哭了'],
  ];
  const notesPool = [
    '角色非常契合，体验满分！',
    '推理过程很过瘾，最后反转绝了',
    '情感爆发点很戳人，全程沉浸',
    '氛围营造很好，下次还想玩恐怖本',
    '熟人局很欢乐，机制也很有意思',
    '稍微有点难，但整体不错',
    '和预想的有点落差，下次试试别的类型',
  ];
  return playerIds.map((pid, idx) => {
    const rIdx = Math.floor(Math.random() * expTagPool.length);
    const score = (Math.min(5, Math.max(1, Math.floor(3 + Math.random() * 3)))) as 1 | 2 | 3 | 4 | 5;
    return {
      playerId: pid,
      roleId: roleIds[idx % roleIds.length],
      experienceTags: expTagPool[rIdx],
      score,
      notes: notesPool[Math.floor(Math.random() * notesPool.length)],
    };
  });
}

function createTagAdjustments(roleIds: string[]): TagAdjustment[] {
  const tagPool = ['隐忍', '深情', '高冷', '腹黑', '白切黑', '推理', '情感', '恐怖', '欢乐', '机制'];
  return roleIds.slice(0, 3).map((rid) => {
    const tag = tagPool[Math.floor(Math.random() * tagPool.length)];
    const current = 40 + Math.floor(Math.random() * 40);
    const suggested = Math.min(100, Math.max(10, current + (Math.random() > 0.5 ? 10 : -10) * Math.ceil(Math.random() * 3)));
    return {
      roleId: rid,
      tagName: tag,
      currentWeight: current,
      suggestedWeight: suggested,
      reason: suggested > current ? '多轮反馈显示该标签匹配度高' : '近期反馈显示该标签权重偏高',
    };
  });
}

const reviewConfigs = [
  { scheduleId: 'sched-008', dmId: 'dm-002', overall: 4 as const, bestCount: 2, disCount: 1, scriptIdx: 7 },
  { scheduleId: 'sched-011', dmId: 'dm-001', overall: 5 as const, bestCount: 3, disCount: 0, scriptIdx: 1 },
  { scheduleId: 'sched-014', dmId: 'dm-003', overall: 4 as const, bestCount: 2, disCount: 1, scriptIdx: 2 },
  { scheduleId: 'sched-901', dmId: 'dm-001', overall: 5 as const, bestCount: 3, disCount: 0, scriptIdx: 0 },
  { scheduleId: 'sched-902', dmId: 'dm-001', overall: 4 as const, bestCount: 2, disCount: 1, scriptIdx: 1 },
  { scheduleId: 'sched-903', dmId: 'dm-002', overall: 5 as const, bestCount: 3, disCount: 0, scriptIdx: 3 },
  { scheduleId: 'sched-904', dmId: 'dm-004', overall: 5 as const, bestCount: 4, disCount: 0, scriptIdx: 4 },
  { scheduleId: 'sched-905', dmId: 'dm-004', overall: 4 as const, bestCount: 2, disCount: 1, scriptIdx: 5 },
];

export const assignmentReviews: AssignmentReview[] = reviewConfigs.map((rc, idx) => {
  const script = scripts[rc.scriptIdx];
  const roleIds = script.roles.map((r) => r.id);
  const playerIds = script.roles.map((_, i) => `player-${String((idx * 3 + i) % 32 + 1).padStart(3, '0')}`);
  const best = playerIds.slice(0, rc.bestCount);
  const dis = rc.disCount > 0 ? playerIds.slice(playerIds.length - rc.disCount) : [];

  return {
    id: `review_${String(idx + 1).padStart(3, '0')}`,
    scheduleId: rc.scheduleId,
    scriptId: script.id,
    dmId: rc.dmId,
    reviewedAt: `2026-06-${String(10 + idx).padStart(2, '0')}T20:00:00Z`,
    createdAt: `2026-06-${String(10 + idx).padStart(2, '0')}T20:00:00Z`,
    overallScore: rc.overall,
    overallRating: rc.overall,
    bestExperience: best,
    disappointingExperience: dis,
    perPlayerFeedback: createPerPlayerFeedback(playerIds, roleIds),
    dmNotes: `本场${script.name}整体体验${rc.overall >= 5 ? '极佳' : rc.overall >= 4 ? '良好' : '一般'}。${best.length > 0 ? `${best.length}位玩家反馈角色匹配度非常高。` : ''}${dis.length > 0 ? '个别玩家与角色契合度有待提升，下次分角注意调整。' : '所有玩家都比较满意。'}`,
    suggestedTagAdjustments: createTagAdjustments(roleIds),
  };
});