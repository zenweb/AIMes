# Plan：Hosted CI root workflow local validation

## 成功标准

- workflow 不再引用旧 `v1/` 工作目录。
- 本地命令覆盖 CI 的 backend/frontend/security 主路径。
- 测试稳定性问题不靠放宽断言解决。
- 新提交推送后由 GitHub Actions 生成 hosted runner 证据。

## 执行

1. 读取 GitHub Actions 失败日志，定位 `/v1` 路径错误。
2. 验证本地 workflow 已切到仓库根路径。
3. 修复前端单测隔离和定时器不稳定问题。
4. 运行本地 CI 等价验证。
5. 提交并推送，等待 hosted CI 新 run。

## 停止条件

当前停止条件是新的 hosted CI run 给出 PASS 或新的失败日志。只有 hosted runner success run 才能关闭 Hosted CI release gate。
