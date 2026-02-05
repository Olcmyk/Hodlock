#!/bin/bash

# Hodlock 邀请人机制测试脚本

echo "=================================="
echo "Hodlock Referrer Mechanism Tests"
echo "=================================="
echo ""

# 检查 Foundry 是否安装
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not installed!"
    echo "Install it with: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi

echo "✓ Foundry installed"
echo ""

# 进入 contracts 目录
cd "$(dirname "$0")"

echo "Running tests..."
echo ""

# 运行测试
forge test --match-contract HodlockReferrerTest -vv

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✅ ALL TESTS PASSED!"
    echo "=================================="
    echo ""
    echo "Your referrer mechanism is working correctly!"
    echo ""
    echo "Key findings:"
    echo "  ✓ Referrers get 30% of penalties"
    echo "  ✓ Developers get 10% of penalties"
    echo "  ✓ Referrer binding is permanent"
    echo "  ✓ Multiple referees accumulate rewards"
    echo "  ⚠️  Last user scenario: referrer gets nothing (by design)"
    echo ""
else
    echo ""
    echo "=================================="
    echo "❌ TESTS FAILED!"
    echo "=================================="
    echo ""
    echo "Please check the test output above for details."
    echo ""
    exit 1
fi
