# 任务: 健康页添加 Apple Watch 三环图形

## 背景

健康页面 (`health/index.html` + `health/health.js` + `content/health/metrics.json`) 需要一个苹果表风格的**活动三环**动效图形，用真实数据渲染。目前数据已经开始从 Apple Watch 通过 Health Auto Exporter 按天导出 JSON，需要整合进页面。

## 需要做什么

### 1. 数据处理
- health.js 目前读 `content/health/metrics.json`（手动整理的摘要），需要增加从原始 JSON 文件读取并自动计算三环数据的能力
- 数据源：`/Users/AI/AIProjects/Health/Raw/HealthAutoExport-{date}.json`
- 需要提取的字段：
  - `active_energy`（kJ）→ **Move 环**
  - `apple_exercise_time`（min）→ **Exercise 环**
  - `apple_stand_hour`（尚未导出，后续会加）→ **Stand 环**

### 2. 三环 SVG 组件
用纯 CSS + SVG（**不需要 Canvas**）画三个同心开环：
- 内圈：Move / 红色
- 中圈：Exercise / 绿色  
- 外圈：Stand / 蓝色

交互/视觉要求：
- 环的填充比例 = 当前值 / 目标值
- 有轻微动画效果（页面加载时从 0 填充到实际百分比）
- 环中间显示数值和单位
- **每日目标值**需要做个可配置的常量（方便后续改）
  - Move 目标：待确认（先设为 2000 kJ 占位）
  - Exercise 目标：30 min
  - Stand 目标：12 hr

### 3. 响应式
在大屏上三环居中显示，小屏（手机）适当缩小但保持可读。

## 设计参考

参考 Apple Watch 的三环设计风格，但保持网站已有的设计语言（简洁、克制、低调配色）。不要完全照抄 Apple 的渐变色，以网站现有的色调体系为准。

## 数据流建议

```
HealthAutoExport-{date}.json
        │
        ▼
health.js 读取 → 提取 active_energy / exercise_time
        │
        ▼
      三环 SVG 渲染
```

## 完成后
- 更新 health.js 添加三环渲染逻辑
- 如果 metrics.json 需要改动以支持三环数据，一并改
- 更新此文件状态
