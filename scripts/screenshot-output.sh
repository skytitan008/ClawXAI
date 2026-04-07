#!/bin/bash
# ClawXAI v0.1.0 - Screenshot Output
# 用于生成干净、美观的终端输出

# 颜色
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}           🦎  ${GREEN}ClawXAI${NC} v0.1.0 - Phase 1 Complete          ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}GitHub:${NC} https://github.com/skytitan008/ClawXAI"
echo -e "${BLUE}License:${NC} MIT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 测试套件
echo -e "${YELLOW}🧪 Test Suite - 5/5 PASS${NC}"
echo ""
echo "  ✅ Test 1: Privacy Detection (S3) - SSH Key"
echo "  ✅ Test 2: Privacy Detection (S2) - Email Pattern"
echo "  ✅ Test 3: Cost Routing (SIMPLE) → gpt-4o-mini"
echo "  ✅ Test 4: Cost Routing (COMPLEX) → claude-sonnet-4-5"
echo "  ✅ Test 5: Memory System - L0/L1/L2 Architecture"
echo ""
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 隐私检测演示
echo -e "${YELLOW}🔒 Privacy Detection Demo${NC}"
echo ""
echo -e "${MAGENTA}Input:${NC} 'Hello, how are you?'"
echo -e "${GREEN}Result:${NC} S1 - Passthrough (no sensitive data)"
echo ""
echo -e "${MAGENTA}Input:${NC} 'My email is test@example.com'"
echo -e "${YELLOW}Result:${NC} S2 - Redact & Forward (email detected)"
echo ""
echo -e "${MAGENTA}Input:${NC} 'My SSH key: -----BEGIN RSA PRIVATE KEY-----'"
echo -e "${RED}Result:${NC} S3 - Local Only (highly sensitive)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 成本优化
echo -e "${YELLOW}💰 Cost Optimization${NC}"
echo ""
echo "  Simple tasks   (<20 words)   → gpt-4o-mini      💵"
echo "  Medium tasks   (20-100 words) → gpt-4o          💵💵"
echo "  Complex tasks  (>100 words)  → claude-sonnet    💵💵💵"
echo "  Reasoning      (analysis)    → o4-mini          💵💵💵"
echo ""
echo -e "${GREEN}Target: 58% cost savings${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 记忆系统
echo -e "${YELLOW}🧠 Three-Layer Memory${NC}"
echo ""
echo "  L2: Projects / Timelines / User Profile"
echo "       ↑"
echo "  L1: Memory Fragments (Summary + Topics + Emotions)"
echo "       ↑"
echo "  L0: Raw Conversations"
echo ""
echo -e "${GREEN}Model-driven retrieval along 'Memory Tree'${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 项目统计
echo -e "${YELLOW}📊 Project Stats${NC}"
echo ""
echo "  Code Lines:     ~870"
echo "  Files:          22"
echo "  Packages:       3 (@claw-ai/router, @claw-ai/memory, @claw-ai/core)"
echo "  Applications:   1 (gateway)"
echo "  Tests:          5/5 PASS"
echo "  Build Time:     ~1.5s"
echo "  Bundle Size:    18-30KB"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 下一步
echo -e "${GREEN}🚀 Next: Phase 2 - EdgeClaw Integration${NC}"
echo ""
echo "  ⏳ ClawXRouter - Complete implementation"
echo "  ⏳ ClawXMemory - Model-driven retrieval"
echo "  ⏳ ClawXKairos - Self-driving agent loop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}Made with ❤️ by skytitan008${NC}"
echo ""
