const d = require('../src/assets/data/exercises-index.json')
const fs = require('fs')

const dict = {
  // 器械
  'dumbbell': '哑铃', 'cable': '绳索', 'barbell': '杠铃', 'lever': '器械',
  'band': '弹力带', 'smith': '史密斯机', 'kettlebell': '壶铃', 'weighted': '负重',
  'assisted': '辅助', 'ez': '曲杆', 'bodyweight': '自重', 'sled': '雪橇',
  'medicine': '药球', 'ball': '球', 'roller': '滚轮', 'resistance': '弹力',
  'stability': '健身', 'trap': 'T杠', 'olympic': '奥林匹克', 'rope': '绳',
  'ring': '吊环', 'suspension': '悬挂', 'landmine': '地雷管', 'tire': '轮胎',
  'sandbag': '沙袋', 'club': '棒铃', 'mace': '锤铃', 'machine': '器械',
  'plate': '杠片', 'bar': '杠', 'handle': '把手',
  // 身体部位
  'chest': '胸', 'back': '背', 'shoulder': '肩', 'bicep': '肱二头肌',
  'tricep': '肱三头肌', 'ab': '腹', 'abs': '腹', 'abdominal': '腹',
  'glute': '臀', 'glutes': '臀', 'quad': '股四', 'quadriceps': '股四头肌',
  'hamstring': '腘绳肌', 'hamstrings': '腘绳肌', 'calf': '小腿', 'calves': '小腿',
  'forearm': '前臂', 'forearms': '前臂', 'wrist': '腕', 'neck': '颈',
  'lat': '背阔肌', 'lats': '背阔肌', 'trap': '斜方肌', 'traps': '斜方肌',
  'delt': '三角肌', 'delts': '三角肌', 'deltoid': '三角肌',
  'spine': '脊柱', 'torso': '躯干', 'core': '核心', 'hip': '髋', 'thigh': '大腿',
  'pectorals': '胸', 'pec': '胸', 'rhomboid': '菱形肌', 'serratus': '前锯肌',
  'adductor': '内收肌', 'abductor': '外展肌', 'oblique': '腹斜肌',
  'cardiovascular': '心血管',
  // 动作词
  'press': '推', 'push': '推', 'push-up': '俯卧撑', 'pushup': '俯卧撑',
  'curl': '弯举', 'raise': '举', 'fly': '飞鸟', 'flye': '飞鸟', 'row': '划船',
  'pull': '拉', 'pulldown': '下拉', 'pull-down': '下拉',
  'pull-up': '引体向上', 'pullup': '引体向上',
  'squat': '深蹲', 'deadlift': '硬拉', 'lunge': '弓步', 'lunges': '弓步',
  'extension': '伸展', 'pushdown': '下压', 'crunch': '卷腹',
  'sit-up': '仰卧起坐', 'situp': '仰卧起坐', 'plank': '平板支撑',
  'dip': '臂屈伸', 'kickback': '后踢', 'shrug': '耸肩',
  'upright': '直立', 'bent': '俯身', 'lateral': '侧平举',
  'reverse': '反向', 'bench': '卧推', 'twist': '转体',
  'jerk': '挺举', 'snatch': '抓举', 'clean': '翻举',
  'swing': '摆荡', 'windmill': '风车', 'get-up': '起身',
  'thruster': '火箭推', 'overhead': '过头', 'underhand': '反握',
  'overhand': '正握', 'pronated': '正握', 'supinated': '反握', 'neutral': '对握',
  'face': '面拉', 'donkey': '驴式', 'bird': '鸟狗', 'superman': '超人',
  'flutter': '摆腿', 'scissor': '剪刀', 'bicycle': '蹬车',
  'russian': '俄罗斯', 'windshield': '雨刮', 'kick': '踢',
  'bridge': '臀桥', 'thrust': '臀推', 'heel': '提踵', 'toe': '踮脚',
  'farmer': '农夫', 'suitcase': '箱式', 'waiter': '侍者',
  'sissy': '西斯', 'hack': '哈克', 'goblet': '酒杯', 'sumo': '相扑',
  'romanian': '罗马尼亚', 'stiff': '直腿', 'good': '早安式',
  'morning': '早安式', 'bulgarian': '保加利亚', 'split': '分腿',
  'pistol': '单腿', 'jumping': '跳跃', 'box': '跳箱',
  'burpee': '波比', 'mountain': '登山', 'bear': '熊爬', 'crawl': '爬行',
  'inchworm': '毛毛虫', 'walk': '步行', 'run': '跑步',
  'sprint': '冲刺', 'march': '踏步', 'jack': '开合跳',
  'star': '星式', 'crab': '螃蟹', 'duck': '鸭步',
  'power': '力量', 'speed': '速度', 'around': '绕环',
  'wall': '靠墙', 'door': '门框', 'adduction': '内收', 'abduction': '外展',
  'rotation': '旋转', 'flexion': '屈曲', 'hyperextension': '超伸',
  'drag': '拖拉', 'hold': '保持', 'carry': '搬运',
  'throw': '抛', 'slam': '砸', 'toss': '抛', 'catch': '接',
  'step': '台阶', 'climber': '攀爬', 'spider': '蜘蛛', 'frog': '蛙跳',
  'warrior': '战士', 'tree': '树式', 'eagle': '鹰式', 'triangle': '三角',
  'wheel': '轮式', 'boat': '船式', 'fish': '鱼式', 'cobra': '眼镜蛇',
  'dog': '犬式', 'cat': '猫式', 'cow': '牛式',
  // 修饰词
  'standing': '站姿', 'seated': '坐姿', 'lying': '卧姿', 'prone': '俯卧',
  'incline': '上斜', 'decline': '下斜', 'flat': '平板', 'horizontal': '水平',
  'close': '窄握', 'wide': '宽握', 'narrow': '窄', 'standard': '标准',
  'single': '单臂', 'one': '单臂', 'alternating': '交替', 'double': '双臂',
  'concentration': '集中', 'hammer': '锤式', 'preacher': '牧师凳',
  'pinch': '捏握', 'crush': '挤压', 'grip': '握',
  'static': '静态', 'dynamic': '动态', 'pulsing': '脉冲',
  'partial': '半程', 'full': '全程', 'isometric': '等长',
  'eccentric': '离心', 'concentric': '向心', 'tempo': '节奏',
  'pause': '停顿', 'slow': '慢速', 'fast': '快速', 'explosive': '爆发',
  'controlled': '控制', 'body': '身体', 'weight': '重量',
  'only': '', 'light': '轻', 'heavy': '重',
  'mini': '迷你', 'short': '短', 'long': '长',
  'upper': '上', 'lower': '下', 'middle': '中',
  'left': '左', 'right': '右', 'both': '双',
  'front': '前', 'side': '侧', 'inner': '内', 'outer': '外',
  'low': '低位', 'high': '高位', 'mid': '中位', 'cross': '交叉',
  'drag': '拖拉', 'pinch': '捏', 'crush': '挤压',
  'finger': '手指', 'grip': '握力', 'hand': '手',
}

// 专有名词覆盖（无法用词典规则翻译的）
const overrides = {
  '3/4 sit-up': '3/4仰卧起坐',
  'air bike': '空中蹬车',
  'all fours squad stretch': '四足深蹲拉伸',
  'ankle circles': '踝关节绕环',
  'arm slingers hanging straight legs': '悬挂直腿甩臂',
  'astride jumps (male)': '分腿跳跃',
  'backward jump': '后跳',
  'balance board': '平衡板',
  'battling ropes': '战绳',
  'bottoms-up': '底朝上壶铃',
  'butt-ups': '抬臀',
  'butterfly yoga pose': '蝴蝶瑜伽式',
  'chair leg extended stretch': '椅子伸腿拉伸',
  'chin-up': '反握引体向上',
  'chin-ups (narrow parallel grip)': '窄距反握引体向上',
  'circles knee stretch': '膝关节绕环拉伸',
  'cocoons': '蚕茧卷腹',
  'dead bug': '死虫式',
  'elbow dips': '肘屈伸',
  'elbow-to-knee': '肘触膝',
  'elevator': '电梯式深蹲',
  'flag': '人体旗帜',
  'forward jump': '前跳',
  'gironda sternum chin': '吉龙达胸骨引体',
  'gorilla chin': '猩猩引体',
  'half knee bends (male)': '半蹲',
  'half sit-up (male)': '半仰卧起坐',
  'hands bike': '手摇车',
  'handstand': '倒立',
  'hanging pike': '悬挂屈体',
  'impossible dips': '超难臂屈伸',
  'jackknife sit-up': '折刀仰卧起坐',
  'janda sit-up': '安达仰卧起坐',
  'kipping muscle up': '借力双力臂',
  'korean dips': '韩式臂屈伸',
  'l-sit on floor': '地面L支撑',
  'lean planche': '倾斜支撑',
  'muscle up': '双力臂',
  'muscle-up (on vertical bar)': '单杠双力臂',
  'otis up': '奥蒂斯卷腹',
  'pelvic tilt': '骨盆倾斜',
  'peroneals stretch': '腓骨肌拉伸',
  'posterior tibialis stretch': '胫骨后肌拉伸',
  'prisoner half sit-up (male)': '抱头半仰卧起坐',
  'quads': '股四头肌拉伸',
  'quarter sit-up': '1/4仰卧起坐',
  'quick feet v. 2': '快步跳',
  'runners stretch': '跑者拉伸',
  'scapula dips': '肩胛臂屈伸',
  'sit-up v. 2': '仰卧起坐变式',
  'superman': '超人式',
  'tabletop': '桌面式',
  'thoracic stretch': '胸椎拉伸',
  'trap raise': '斜方肌上提',
  'upper back stretch': '上背拉伸',
  'v-up': 'V字起身',
  'vertical jump': '纵跳',
  'wall sit': '靠墙静蹲',
  'wind sprints': '原地冲刺',
  'world greatest stretch': '世界最伟大拉伸',
  'skater hops': '滑冰跳',
  'ski ergometer': '滑雪测功仪',
  'spell caster': '字母拼写',
  'sphinx': '狮身人面式',
  'straddle maltese': '分腿马耳他',
  'straddle planche': '分腿支撑',
  'swimmer kicks v. 2 (male)': '游泳踢腿',
  'triceps dips floor': '地面三头臂屈伸',
  'triceps stretch': '肱三头肌拉伸',
  'v-sit on floor': '地面V字坐',
  'walking on stepmill': '台阶机步行',
}

function translate(name) {
  const lower = name.toLowerCase().trim()
  if (overrides[lower]) return overrides[lower]
  if (dict[lower]) return dict[lower]

  const words = lower.split(/[\s-]+/)
  const parts = words.map(w => dict[w] || '')
  const result = parts.filter(p => p).join('')

  if (/[一-鿿]/.test(result)) return result
  return name
}

const translations = {}
let ok = 0, fail = 0
const failedNames = []
d.forEach(ex => {
  const zh = translate(ex.name)
  translations[ex.id] = zh
  if (/[一-鿿]/.test(zh) && zh !== ex.name) ok++
  else { fail++; failedNames.push(ex.name) }
})

console.log('翻译成功:', ok, '/', d.length)
console.log('失败:', fail)
if (failedNames.length > 0) {
  console.log('未翻译(' + failedNames.length + '):', failedNames.slice(0, 50).join(', '))
}

fs.writeFileSync('src/assets/data/exercise-name-zh.json', JSON.stringify(translations, null, 2))
console.log('已保存到 src/assets/data/exercise-name-zh.json')
