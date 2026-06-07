# 2026-06-06 ChatPanel 知识问答失败 Next Actions

## 下一步

- ChatPanel 本片已补知识问答失败真实浏览器证据；后续不继续刷助手微状态，除非发现真实 correctness/reliability 缺口。
- 继续按覆盖率杠杆选择低覆盖且用户必经的既有组件。
- 若继续助手域，优先比较 action package 写入失败是否仍缺真实浏览器证据，而不是重复 RAG fallback。

## B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺；当前 remote 不是 GitHub repo。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
