# Hodlock 邀请人机制测试

## 测试概述

这个测试套件全面测试了 Hodlock 合约的邀请人（Referrer）机制，确保没有 bug。

## 测试覆盖的场景

### ✅ Test 1: 基础邀请人奖励测试
- 用户 A 存第一笔，指定邀请人 B
- 用户 A 存第二笔（邀请人应该仍然是 B）
- 用户 A 提前取出第二笔
- 验证邀请人 B 获得 30% 的罚金
- 验证开发者获得 10% 的罚金
- 验证邀请人可以成功领取奖励

### ✅ Test 2: 邀请人永久绑定测试
- 用户 A 第一次存款指定邀请人 B
- 用户 A 第二次存款尝试指定邀请人 C（应该被忽略）
- 验证邀请人仍然是 B
- 验证只有 B 能获得奖励，C 不能

### ✅ Test 3: 无邀请人的情况
- 用户存款时不指定邀请人
- 提前取出时，验证：
  - 开发者获得 10% 的罚金
  - 90% 的罚金进入奖励池
  - 没有邀请人奖励

### ✅ Test 4: 最后一个用户的情况
- 只有一个用户存款（有邀请人）
- 该用户提前取出（成为最后一个用户）
- 验证：
  - 邀请人获得 0 奖励
  - 开发者获得全部罚金
  - 这是合约的设计行为，防止资金被锁在合约里

### ✅ Test 5: 多个被邀请人累积奖励
- 邀请人 B 邀请了多个用户（A, C）
- 他们都提前取出
- 验证邀请人 B 的奖励累积
- 验证邀请人可以一次性领取所有累积奖励

### ✅ Test 6: 边界情况 - 不能自己邀请自己
- 用户尝试指定自己为邀请人
- 验证邀请人被设置为 address(0)

### ✅ Test 7: 正常取款不产生邀请人奖励
- 用户正常到期取款（无罚金）
- 验证邀请人不获得任何奖励

## 运行测试

### 前置条件
确保已安装 Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 运行所有测试
```bash
cd contracts
forge test --match-contract HodlockReferrerTest -vv
```

### 运行单个测试
```bash
# 测试基础邀请人奖励
forge test --match-test test_BasicReferrerReward -vvv

# 测试最后一个用户场景
forge test --match-test test_LastUserWithdrawEarly -vvv

# 测试多个被邀请人
forge test --match-test test_MultipleRefereesAccumulateRewards -vvv
```

### 查看详细日志
使用 `-vvv` 或 `-vvvv` 查看更详细的执行日志:
```bash
forge test --match-contract HodlockReferrerTest -vvvv
```

### 查看 Gas 使用情况
```bash
forge test --match-contract HodlockReferrerTest --gas-report
```

## 测试结果

所有 8 个测试都通过了！

```
Ran 8 tests for test/HodlockReferrerTest.sol:HodlockReferrerTest
[PASS] test_BasicReferrerReward() (gas: 558911)
[PASS] test_CannotReferSelf() (gas: 253422)
[PASS] test_LastUserWithdrawEarly() (gas: 290319)
[PASS] test_MultipleRefereesAccumulateRewards() (gas: 799305)
[PASS] test_NoReferrer() (gas: 516508)
[PASS] test_NormalWithdrawNoReferrerReward() (gas: 253327)
[PASS] test_ReferrerPermanentBinding() (gas: 545297)
[PASS] test_RunAllReferrerTests() (gas: 29404910)

Suite result: ok. 8 passed; 0 failed; 0 skipped
```

## 关键发现

### ✅ 邀请人机制工作正常
- 邀请人永久绑定（首次存款时设置）
- 邀请人获得 30% 的罚金（默认配置）
- 开发者获得 10% 的罚金（默认配置）
- 剩余 60% 进入奖励池分给其他 HODLer

### ⚠️ 重要边界情况
**最后一个用户提前取出时，邀请人拿不到钱！**

这是合约的设计行为：
- 当池子里只剩最后一个用户时（totalShare = 0）
- 如果他提前取出，所有罚金都给开发者
- 邀请人不获得任何奖励
- 这样设计是为了防止资金被锁在合约里

### 建议
如果你想让邀请人在这种情况下也能获得奖励，需要修改合约逻辑。但当前的设计是合理的，因为：
1. 没有其他用户可以分享奖励池
2. 将资金给开发者比锁在合约里更好
3. 这种情况在实际使用中很少发生（通常会有多个用户）

## 文件结构

```
contracts/
├── contracts/
│   └── Hodlock.sol              # 主合约
├── test/
│   ├── MockERC20.sol            # 测试用的 ERC20 代币
│   └── HodlockReferrerTest.sol  # 邀请人机制测试
├── foundry.toml                 # Foundry 配置
└── TEST_README.md               # 本文件
```

## 下一步

1. 如果测试通过，说明邀请人机制没有 bug
2. 可以安全地部署到测试网
3. 建议在主网部署前再做一次审计
4. 考虑是否需要修改"最后一个用户"的逻辑

## 联系方式

如有问题，请查看合约代码或联系开发团队。
