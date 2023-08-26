// 时间线 从左往右 越来越小 <---------------------执行3---<---执行2---<---执行1-----当前时间

const queue = [] // 事件队列 执行安装从右往左执行，右侧事件执行完成时候会删除 然后插入到左侧重新等待下一次执行

// 是否开启debug模式
let debug = false

/**
 * @function uuid 通过数字和大小写字母随机生成uuid
 * @param {Number} len 
 * @param {Number} radix 
 * @returns 返回随机的字符串uuid
 */
export const uuid = (len = 16, radix = 16) => {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  let uuid = [],
    i
  radix = radix || chars.length
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    let r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

/**
 * @function removeQueueItem 移除事件
 * @param {string[]} keys  传入事件key的字符串数组
 */
export const removeQueueItem = (keys = []) => {
  if (debug) console.log('\x1B[46m\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#16d46b;padding:20px 0;', `Stella ===> 传入的keys`, keys);
  if (typeof keys === 'string') keys = [keys]
  for (const key of keys) {
    // 找到队列中指定key的事件，找到符合条件的返回对应元素的索引，如果没找到返回-1
    let index = queue.findIndex((item) => item.key === key)
    // 将指定key的事件移除队列，当返回 -1 时会删除最末尾的元素，所以要增加判断
    if (index != -1) queue.splice(index, 1)
    if (debug) console.log('\x1B[46m\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#16d46b;padding:20px 0;', `Stella ===> 移除数组中当前的key`, key);
  }
}

/**
 * @function addQueueItem 在消息队列中添加事件
 * @param {FunInfo} funInfo 消息队列中添加的事件及相关信息
 * @param {Boolean} clear 默认设置为true
 * @returns 
 */
export const addQueueItem = (funInfo, clear = true) => {
  let { interval, key, func, execution_time } = funInfo || {}
  // 通过时间戳生成事件的激活时间
  if (!execution_time) {
    execution_time = new Date().getTime() + Number(interval)
  }
  // 如果没有传入自定义的key, 则拼接生成默认key
  if (!key) {
    key = `${execution_time}-${uuid(4, 16)}`
  }
  // 内部清除已存在的指定key的事件, 不需要额外查询
  if (clear) {
    // 如果队列中已存在某个事件的key与传入key相同, 则先将已存在的事件移除队列
    const hasKey = queue.find((item) => item.key === key) // 不存在返回undefined
    if (hasKey) {
      removeQueueItem([key])
      if (debug) {
        console.log('\x1B[46m\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#16d46b;padding:20px 0;', `Stella ===> 当前${key}已存在, 已将队列中重复存在的事件移除`);
      }
    }
  }
  // 比较execution_time 把info插入到队列
  const info = { key, execution_time, interval, func }
  // 因为时间线是逆序排列, 所以此处返回第一个比传入时间戳小的队列事件索引
  let index = queue.findIndex((item) => item.execution_time <= execution_time)
  console.log('\x1B[46m\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#16d46b;padding:20px 0;', `Stella ===> 第一个比传入时间戳小的index`, index);
  // 如果是-1 表示没有比传入时间戳小的队列事件 此时需要传入事件插入到时间线最前面
  index = index === -1 ? queue.length : index
  // 例如, let arr = [5,4,3,2,1]  插入2.5,  获取到索引[3]  arr.splice(3,0,info) 打印结果 [5,4,3,2.5,2,1]
  queue.splice(index, 0, info) // 插入到数组中
  if (debug) {
    console.log('\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#0097ff;padding:16px 0;', `------->Breathe:插入事件`, key, execution_time, index)
    let _arr = Array.from(queue, (item) => item.execution_time)
    let _arr2 = Array.from(queue, (item) => item.execution_time).sort((a, b) => b - a)
    let _arr3 = Array.from(queue, (item) => item.key)
    console.log('\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#0097ff;padding:16px 0;', `------->Breathe:队列keys`, JSON.stringify(_arr3))
    console.log('\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#0097ff;padding:16px 0;', `------->Breathe:时间线${_arr.length}`, JSON.stringify(_arr) === JSON.stringify(_arr2) ? '正常' : '异常', JSON.stringify(_arr))
  }
  return key
}

/**
 * @function startQueue 在main文件中开启轮询队列监听
 * @param {Number} interval 多少秒后开启全局消息队列
 * @param {Boolean} _debug 是否在开启轮询队列中的debug模式,会console.log debug提示
 * @returns 
 */
export const startQueue = (interval = 1000, _debug = false) => {
  debug = _debug // 是否开启调试
  const timer = setInterval(() => {
    const now = new Date().getTime() // 当前时间
    let length = queue.length
    for (let i = length; i > 0; i--) {
      // 取出消息队列的最末尾索引的事件,即最新需要执行的事件
      const info = queue[i - 1]
      const { interval, execution_time = 0, func, key } = info
      // 最新需要执行的事件距离当前时间的差值 大于该事件的激活时间, 即表示队列中没有可执行的事件 跳出当前for循环
      const isBreak = execution_time - now > 0
      if (isBreak) {
        if (debug) {
          console.log('\x1b[38;2;0;151;255m%c%s\x1b[0m', 'color:#0097ff;padding:16px 0;', `------->Breathe:当前队列循环被中断`, isBreak, (execution_time - now) / 1000, JSON.stringify(info))
        }
        break
      }
      // 执行info中的事件
      func()
      // 执行完毕后,将事件放置队列最左侧,即当前时间线的最末尾
      // 删除当前已执行的事件
      queue.splice(i - 1, 1)
      const funInfo = { interval, key, func }
      addQueueItem(funInfo, false)
    }
  }, interval)
  return timer
}
