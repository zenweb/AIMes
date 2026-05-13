# 2026-05-13 Changelog — 密钥轮转 + Token 黑名单

## 变更清单

### 后端（4 文件）
- `src/MES.Api/Services/SigningKeyStore.cs` — 新建：签名密钥存储，支持多版本密钥 + 24h 旧密钥验证缓冲期
- `src/MES.Api/Services/TokenBlacklistService.cs` — 新建：Token 黑名单服务，ConcurrentDictionary 存储 + 15 分钟自动清理
- `src/MES.Api/Program.cs` — 注册 `SigningKeyStore` 单例 + `TokenBlacklistService`；JWT 配置改用 `IssuerSigningKeyResolver`（按 kid 查找）+ `OnTokenValidated` 事件检测黑名单
- `src/MES.Api/Controllers/AuthController.cs` — 重写：注入 `SigningKeyStore` + `TokenBlacklistService`，生成 Token 时注入 `kid` header；`POST /logout` 将 JTI 加入黑名单；新增 `POST /revoke-user`（Admin 强制撤销用户令牌）、`POST /rotate-keys`（Admin 手动触发密钥轮转）
- `src/MES.Api/DTOs/AuthDtos.cs` — 新增 `RevokeUserRequestDto`

## 验证
- 后端 `dotnet build` — 0 errors
- 前端 `vite build` — 构建成功
