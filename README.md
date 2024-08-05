# TypeTree v0.2.0 (Gson)

用图形重新定义你的JSON数据

![](icon.svg)

## 简介

TypeTree的目标是为结构化数据提供高级的可视化编辑界面，目前的v0.2.x版的主要功能是JSON文件的编辑，代号为 Gson

你可以在[这里](https://mulam-dev.github.io/typetree/src/app.html)试试网页版本的编辑器（但是不能保存和打开文件）

## 界面

![界面](screenshots/interface.png)

## 快捷键

| 命令                   | 快捷键                                |
| -------------------- | ---------------------------------- |
| 移动光标                 | `↑/↓/←/→`                          |
| 选择节点的边（变为插入）         | `Ctrl + ↑/↓/←/→`                   |
| 移动选区（向某个方向扩大/缩小选择）   | `Shift + ↑/↓/←/→`                  |
| 移动到最上/下/左/右侧的节点      | `PageUp/PageDown/Home/End`         |
| 移动到最上/下/左/右边的边（变为插入） | `Ctrl + PageUp/PageDown/Home/End`  |
| 选取到最上/下/左/右侧         | `Shift + PageUp/PageDown/Home/End` |
| 全选                   | `Ctrl + A`                         |
| 进入节点内部/确认/修改/插入新节点   | `Enter`                            |
| 离开节点                 | `Esc`                              |
| 在右边插入新节点             | `Insert`                           |
| 在下边插入新节点             | `Shift + Insert/Enter`             |
| 删除左/右侧的节点            | `Backspace/Delete`                 |
| 删除上/下方的节点            | `Shift + Backspace/Delete`         |
| 插入新节点/变更当前节点类型       | `Tab`                              |
| 快速插入：数组              | `[`                                |
| 快速插入：对象              | `{`                                |
| 快速插入：字符串             | `s`                                |
| 快速插入：数字              | `n`                                |
| 快速插入：布尔值             | `b`                                |
| 撤销                   | `Ctrl + Z`                         |
| 重做                   | `Ctrl + Shift + Z`                 |
| 新建文件                 | `Ctrl + N`                         |
| 打开文件                 | `Ctrl + O`                         |
| 保存                   | `Ctrl + S`                         |
| 另存为                  | `Ctrl + Shift + S`                 |