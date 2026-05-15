#!/usr/bin/env bash
# AIMes Pre-Launch 清理脚本
#
# 用途：在首次 push 到 GitHub 之前，清理对外部观众不友好的内部产物
# 用法：./scripts/pre-launch-cleanup.sh [--dry-run]
#
# ⚠️ 这个脚本会修改 git index（执行 git rm --cached）。
# ⚠️ 文件本身保留在磁盘上，仅停止 git 追踪。
# ⚠️ 强烈建议先 --dry-run 看一遍要清理什么。

set -euo pipefail

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=1
    echo "🔍 Dry-run 模式：仅显示要清理的文件，不实际操作"
    echo
fi

run_or_echo() {
    if [[ $DRY_RUN -eq 1 ]]; then
        echo "  [dry-run] $*"
    else
        eval "$@"
    fi
}

# ---------- 1. 内部 changelog（AI 协作日记，对评估人是噪音） ----------
echo "📝 1/4 清理内部 changelog（保留 cc-sprint / phase / direction 等开发日记 在磁盘但不入 git）..."
INTERNAL_CHANGELOGS=(
    "_docs/_changelog/20260512-cc-*.md"
    "_docs/_changelog/20260512-direction*.md"
    "_docs/_changelog/20260512-phase*.md"
    "_docs/_changelog/20260512-p3*.md"
    "_docs/_changelog/20260512-frontend-enhancement.md"
    "_docs/_changelog/20260512-git-database-integration.md"
    "_docs/_changelog/20260513-cc-phase1-4.md"
    "_docs/_changelog/20260513-goal-12345.md"
    "_docs/_changelog/20260513-phase6*.md"
    "_docs/_changelog/20260514-cc-*.md"
    "_docs/_changelog/20260509*.md"
    "_docs/_changelog/20260510-OpenCode*.md"
    "_docs/_changelog/20260511-*.md"
    "_docs/_changelog/20260511.md"
    "_docs/_changelog/20260510.md"
    "_docs/_changelog/20260509.md"
    "_docs/_changelog/20260512.md"
)
for pattern in "${INTERNAL_CHANGELOGS[@]}"; do
    for f in $pattern; do
        if [[ -f "$f" ]] && git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
            run_or_echo "git rm --cached \"$f\""
        fi
    done
done

# ---------- 2. 内部 review（评审报告，对外部观众是噪音） ----------
echo "📋 2/4 清理内部 review 报告..."
if [[ -d "_docs/_review" ]]; then
    for f in _docs/_review/*.md; do
        if [[ -f "$f" ]] && git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
            run_or_echo "git rm --cached \"$f\""
        fi
    done
fi

# ---------- 3. 内部 research（研究草稿） ----------
echo "🔬 3/4 清理内部 research 文档..."
if [[ -d "_docs/_research" ]]; then
    for f in _docs/_research/*.md _docs/_research/*.docx _docs/_research/*.pdf; do
        if [[ -f "$f" ]] && git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
            run_or_echo "git rm --cached \"$f\""
        fi
    done
fi

# ---------- 4. 内部 plan（本份 pre-launch 文档自身就是内部的） ----------
echo "📐 4/4 清理内部 plan 文档..."
if [[ -d "_docs/_plan" ]]; then
    for f in _docs/_plan/*.md; do
        if [[ -f "$f" ]] && git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
            run_or_echo "git rm --cached \"$f\""
        fi
    done
fi

# ---------- 添加 .gitignore 规则，防止未来不小心追踪 ----------
echo
echo "🛡️ 更新 .gitignore..."
GITIGNORE_RULES='
# 内部协作产物（push 前已用 pre-launch-cleanup.sh 从 git index 清理）
_docs/_changelog/
_docs/_review/
_docs/_research/
_docs/_plan/
'

if [[ $DRY_RUN -eq 0 ]]; then
    if ! grep -q "^_docs/_changelog/$" .gitignore 2>/dev/null; then
        echo "$GITIGNORE_RULES" >> .gitignore
        echo "  ✓ .gitignore 已追加内部产物规则"
    else
        echo "  ⊘ .gitignore 规则已存在，跳过"
    fi
else
    echo "  [dry-run] 将追加内部产物规则到 .gitignore"
fi

# ---------- 保留对外的 changelog 入口 ----------
echo
echo "✅ 保留入口："
echo "  • CHANGELOG.md（顶层，面向用户）"
echo "  • _docs/quickstart.md _docs/troubleshooting.md _docs/commercial-vs-opensource.md（对外）"
echo "  • _docs/_design/aimes-design-doc.v1.md（架构对外）"
echo

echo "📌 下一步："
if [[ $DRY_RUN -eq 1 ]]; then
    echo "  无 --dry-run 重新运行执行实际操作：./scripts/pre-launch-cleanup.sh"
else
    echo "  1. 检查变更：git status"
    echo "  2. 提交：git add -A && git commit -m \"chore: pre-launch cleanup of internal docs\""
    echo "  3. 验证 docker compose up 仍能完整跑通"
    echo "  4. push 到 GitHub"
fi
