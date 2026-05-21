# 20260515 — AIWorks 同步脚本整理

## 变更

- 更新 `C:\AIWorks\Sync-AIWorks.ps1`
  - 支持递归发现工作区内的 Git 仓库
  - 支持自动提交未提交内容并推送
  - 收敛为只处理已确认的仓库路径和远端映射
- 更新 `C:\AIWorks\AIWorks_Git_Sync.md`
  - 补充新的同步流程说明
  - 说明桌面快捷方式用途
- 为桌面创建两个快捷方式
  - `Sync-AIWorks.lnk`
  - `Sync-AIWorks-提交.lnk`

## 说明

当前脚本适合做每日两次手动同步：

- 上班前执行默认同步
- 下班前执行 `-AutoCommit -Yes` 提交并推送

## 验证

- 通过 PowerShell 语法解析
- 通过 `-Mode Status` 验证仓库发现与跳过逻辑
