# ⚠️ 已知坑与排查指南

## 1. `pnpm build` 卡在 `write-cli-startup-metadata.ts`

**现象**：构建跑到最后一步 `write-cli-startup-metadata.ts` 不动了。

**原因**：该脚本会尝试加载完整的 gateway 环境来收集 CLI 元数据，可能因插件初始化阻塞。

**解决**：直接 kill 该进程。核心构建产物（`dist/`）在前面的 `tsdown-build.mjs` 阶段已全部生成，跳过此步骤不影响运行时功能。

```bash
# 找到并 kill
ps aux | grep write-cli-startup-metadata | grep -v grep | awk '{print $2}' | xargs kill
```

## 2. 端口冲突：`EADDRINUSE`

**现象**：`Error: listen EADDRINUSE: address already in use 127.0.0.1:18790`

**原因**：已有 OpenClaw/EdgeClaw gateway 实例在运行（可能是 LaunchAgent 自动启动的）。

**解决**：

```bash
# 查看谁占了端口
lsof -i :18790
# 或者停掉 OpenClaw 管理的 gateway
node openclaw.mjs gateway stop
# 如果是 LaunchAgent 自动重启
launchctl bootout gui/$(id -u)/ai.openclaw.gateway
```

EdgeClaw 默认端口是 **18790**（OpenClaw 是 18789），两者互不冲突。ClawXRouter privacy proxy 默认端口是 **18406**。

## 3. ClawXRouter 读取了 OpenClaw 的配置

**现象**：`[ClawXrouter] Config loaded from clawxrouter.json` 但路由行为和预期不符。

**原因**：早期版本 ClawXRouter 硬编码读取 `~/.openclaw/clawxrouter.json`。如果你同时运行 OpenClaw 和 EdgeClaw，会共享配置。

**解决**（已修复）：EdgeClaw 默认数据目录为 `~/.edgeclaw/`，ClawXRouter 会自动从 `~/.edgeclaw/clawxrouter.json` 读取，与 OpenClaw 完全隔离。

## 4. `lancedb` native binding 构建错误

**现象**：`pnpm build` 报 `Could not load @lancedb/lancedb-darwin-arm64/lancedb.darwin-arm64.node`

**原因**：`lancedb` 的平台特定 native binding 不应被 bundler 打包。

**解决**（已修复）：`tsdown.config.ts` 已将所有 `@lancedb/lancedb-*` 平台包加入 `neverBundle`。

## 5. `pnpm install` 报 `ERR_PNPM_NO_MATURE_MATCHING_VERSION`

**现象**：某些包因发布时间太短被 pnpm 拒绝安装。

**原因**：`pnpm-workspace.yaml` 中的 `minimumReleaseAge` 限制。

**解决**（已修复）：`minimumReleaseAge` 已设为 `0`。

## 6. `gateway connect failed: pairing required`

**现象**：`agent --local` 连不上 gateway。

**原因**：gateway 默认使用 token 认证，embedded agent 没有配对 token。

**解决**（已修复）：EdgeClaw 默认配置 `gateway.auth.mode = "none"`，无需配对。
