# 功能需求

## 题库

### 优选题库

#### 题库分类

```yaml
questionBanks:
  - id
  - icon
  - title
  - parentId
```

备注：

- 分两级列表

## 学堂

### 打卡练习

#### 打卡记录

```yaml
punch:
  - memberId: 123
  - clearTimes: 2
  - ruleTimes: 21
  - punchTimes: 2
  - punched: false
  - records:
      - id
      - recordTime
      - status # 0 | 1
      - correctRate 90
```

备注：

- 封顶 21 次

#### 清空打卡记录

#### 选择题目难度

```yaml
levels:
  - name
  - level
```

#### 开始打卡学习-获取试题

```yaml
questions:
  - id
  - title: 题目标题
  - typeId: 题目类型 ID
  - isRandom: false
  - correctId: 正确答案
  - incorrectId: 错误答案
  - easyIncorrectId: 易错选项
  - note
  - skill
  - level
  - statistics
    - repeatTimes: 1
  - options:
      - id
      - name
```

#### 打卡学习结果

```yaml
report:
  - id
  - correctRate
```

### 错题回顾

```yaml
incorrectRecords:
  - id
  - questions
  - reviewTimes
  - incorrectTimes
```
