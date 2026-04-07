#!/bin/bash
# ClawXAI v0.1.0 Demo Script
# 用于生成演示截图

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 终端设置
export COLUMNS=120
export LINES=35

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}          🦎  ClawXAI v0.1.0 - Demo Script            ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 切换到项目目录
cd "$(dirname "$0")/.."

echo -e "${YELLOW}📦 Checking installation...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

echo -e "${YELLOW}🔨 Building project...${NC}"
pnpm build > /dev/null 2>&1

echo -e "${GREEN}✅ Ready to demo!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Demo 1: 测试套件
echo -e "${BLUE}🧪 Demo 1: Running Test Suite${NC}"
echo -e "${CYAN}Command: node apps/gateway/gateway.mjs --test${NC}"
echo ""
node apps/gateway/gateway.mjs --test
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Demo 2: 隐私检测
echo -e "${BLUE}🔒 Demo 2: Privacy Detection${NC}"
echo ""

echo -e "${YELLOW}Test A: Normal message (S1)${NC}"
echo -e "${CYAN}Input: 'Hello, how are you?'${NC}"
node apps/gateway/gateway.mjs <<< "Hello, how are you?"
echo ""

echo -e "${YELLOW}Test B: Email detection (S2)${NC}"
echo -e "${CYAN}Input: 'My email is test@example.com'${NC}"
node apps/gateway/gateway.mjs <<< "My email is test@example.com"
echo ""

echo -e "${YELLOW}Test C: SSH Key detection (S3)${NC}"
echo -e "${CYAN}Input: 'My SSH key: -----BEGIN RSA PRIVATE KEY-----'${NC}"
node apps/gateway/gateway.mjs <<< "My SSH key: -----BEGIN RSA PRIVATE KEY-----"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Demo 3: 成本路由
echo -e "${BLUE}💰 Demo 3: Cost-Aware Routing${NC}"
echo ""

echo -e "${YELLOW}Test A: Simple task → gpt-4o-mini${NC}"
echo -e "${CYAN}Input: 'Hi'${NC}"
node apps/gateway/gateway.mjs <<< "Hi"
echo ""

echo -e "${YELLOW}Test B: Complex task → claude-sonnet-4-5${NC}"
echo -e "${CYAN}Input: 'Write a complex function...'${NC}"
node apps/gateway/gateway.mjs <<< "Write a complex function that processes data with multiple transformations"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Demo 4: 记忆系统
echo -e "${BLUE}🧠 Demo 4: Memory System${NC}"
echo ""

echo -e "${YELLOW}Step 1: Get memory dashboard${NC}"
echo -e "${CYAN}Command: node apps/gateway/gateway.mjs (interactive)${NC}"
echo ""
echo "Memory Dashboard:"
node -e "
const { createClawAIMemory } = require('./packages/memory/dist/index.js');
async function show() {
  const memory = createClawAIMemory();
  const dashboard = await memory.getDashboardData();
  console.log('Total Memories:', dashboard.overview.total);
  console.log('L0:', dashboard.overview.l0Count);
  console.log('L1:', dashboard.overview.l1Count);
  console.log('L2:', dashboard.overview.l2Count);
}
show();
"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Demo Complete!${NC}"
echo ""
echo -e "${CYAN}📸 Screenshots can be captured at:${NC}"
echo "   - Test results (5/5 PASS)"
echo "   - Privacy detection (S1/S2/S3)"
echo "   - Cost routing demo"
echo "   - Memory dashboard"
echo ""
echo -e "${YELLOW}Next: Upload to docs/screenshots/v0.1.0/${NC}"
echo ""
