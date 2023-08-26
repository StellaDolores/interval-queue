<!--
 * @Author: shent
 * @Date: 2023-08-26 15:37:20
 * @LastEditors: shent
 * @LastEditTime: 2023-08-26 15:46:39
 * @Description: 
-->
# 一个简单的全局事件循环队列

## 使用方法，安装依赖

```bash
npm i pr-interval-queue
```

#### 按需引入方法

```js
import { removeQueueItem, addQueueItem, startQueue } from 'pr-interval-queue'
```

#### 在main.js 中开启循环队列

```js
startQueue(1000, true) // 循环频率ms，是否开启调试
```

#### 简单使用示例

```js
// 需要执行的函数
const func = () => {}
// 添加一个每10000ms执行一次的事件 func
addQueueItem({ func, interval: 10000 })
```

#### 可指定事件key，用作以后区分或清除事件

```js
// 需要执行的函数
const func = () => {}

// 指定事件func的key (重复添加相同事件会清除上一个)
addQueueItem({ func, interval: 3000, key: 'a-1' })
```

#### 在未来的某个时刻添加一个事件

```js
// 需要执行的函数
const func = () => {}

// 给一天后添加一个每6000ms执行一次的事件 func
addQueueItem({ func, interval: 6000, key: 'b-1', execution_time: new Date().getTime() + 1000 * 60 * 60 * 24 * 1 })
```

#### 移除已添加的事件

```js
// 需要执行的函数
const func = () => {}

// 通过变量保存给事件fun添加的key 如果不指定key，addQueueItem()会生成一个随机key并返回
const key = addQueueItem({ func, interval: 3000 })
removeQueueItem([key])
```

## 源代码仓库

[github](https://github.com/breathe97/pr-interval-queue)

## 贡献

breathe
