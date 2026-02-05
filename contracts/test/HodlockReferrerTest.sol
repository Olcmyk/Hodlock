// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Hodlock} from "../contracts/Hodlock.sol";
import {MockERC20} from "./MockERC20.sol";

contract HodlockReferrerTest is Test {
    Hodlock public hodlock;
    MockERC20 public token;

    address public owner = address(1);
    address public developer = address(2);
    address public userA = address(3);
    address public userB = address(4); // Referrer
    address public userC = address(5);
    address public userD = address(6);

    uint256 constant DEPOSIT_AMOUNT = 1000 * 10**18;
    uint256 constant LOCK_TIME = 30 days;
    uint256 constant PENALTY_BPS = 5000; // 50%

    function setUp() public {
        // Deploy token
        vm.prank(owner);
        token = new MockERC20("Test Token", "TEST");

        // Deploy Hodlock
        vm.prank(owner);
        hodlock = new Hodlock(token, developer, address(0));

        // Mint tokens to users
        token.mint(userA, DEPOSIT_AMOUNT * 10);
        token.mint(userC, DEPOSIT_AMOUNT * 10);
        token.mint(userD, DEPOSIT_AMOUNT * 10);

        // Approve Hodlock to spend tokens
        vm.prank(userA);
        token.approve(address(hodlock), type(uint256).max);

        vm.prank(userC);
        token.approve(address(hodlock), type(uint256).max);

        vm.prank(userD);
        token.approve(address(hodlock), type(uint256).max);
    }

    // ============================================
    // Test 1: 基础邀请人奖励测试
    // ============================================
    function test_BasicReferrerReward() public {
        console.log("\n=== Test 1: Basic Referrer Reward ===");

        // 1. User A deposits with referrer B
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userB);

        // Verify referrer is set
        assertEq(hodlock.userReferrer(userA), userB, "Referrer should be set to userB");
        console.log("User A deposited with referrer B");

        // 2. User A deposits again (referrer should still be B)
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, address(0));

        assertEq(hodlock.userReferrer(userA), userB, "Referrer should still be userB");
        console.log("User A deposited again, referrer still B");

        // 3. User A withdraws early from deposit 1
        vm.prank(userA);
        hodlock.withdrawEarly(1);

        // Calculate expected referrer reward
        uint256 penalty = (DEPOSIT_AMOUNT * PENALTY_BPS) / 10000;
        uint256 expectedReferrerReward = (penalty * 3000) / 10000; // 30% of penalty
        uint256 expectedDevReward = (penalty * 1000) / 10000; // 10% of penalty

        uint256 actualReferrerReward = hodlock.referrerRewards(userB);
        uint256 actualDevBalance = hodlock.devBalance();

        console.log("Penalty:", penalty);
        console.log("Expected referrer reward:", expectedReferrerReward);
        console.log("Actual referrer reward:", actualReferrerReward);
        console.log("Expected dev reward:", expectedDevReward);
        console.log("Actual dev balance:", actualDevBalance);

        assertEq(actualReferrerReward, expectedReferrerReward, "Referrer reward mismatch");
        assertEq(actualDevBalance, expectedDevReward, "Dev balance mismatch");

        // 4. Referrer B claims rewards
        uint256 balanceBefore = token.balanceOf(userB);
        vm.prank(userB);
        hodlock.claimReferrerRewards();
        uint256 balanceAfter = token.balanceOf(userB);

        assertEq(balanceAfter - balanceBefore, expectedReferrerReward, "Referrer should receive correct amount");
        assertEq(hodlock.referrerRewards(userB), 0, "Referrer rewards should be reset to 0");

        console.log("Referrer B successfully claimed rewards");
        console.log("[PASS] Test 1 PASSED\n");
    }

    // ============================================
    // Test 2: 邀请人永久绑定测试
    // ============================================
    function test_ReferrerPermanentBinding() public {
        console.log("\n=== Test 2: Referrer Permanent Binding ===");

        // 1. User A deposits with referrer B
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userB);

        assertEq(hodlock.userReferrer(userA), userB, "First referrer should be B");
        console.log("User A deposited with referrer B");

        // 2. User A tries to deposit with different referrer C
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userC);

        // Referrer should still be B (permanent binding)
        assertEq(hodlock.userReferrer(userA), userB, "Referrer should still be B");
        console.log("User A tried to set referrer C, but referrer is still B");

        // 3. User A withdraws early from deposit 1
        vm.prank(userA);
        hodlock.withdrawEarly(1);

        // Only B should get rewards, not C
        uint256 penalty = (DEPOSIT_AMOUNT * PENALTY_BPS) / 10000;
        uint256 expectedReferrerReward = (penalty * 3000) / 10000;

        assertEq(hodlock.referrerRewards(userB), expectedReferrerReward, "B should get rewards");
        assertEq(hodlock.referrerRewards(userC), 0, "C should NOT get rewards");

        console.log("Referrer B got rewards:", hodlock.referrerRewards(userB));
        console.log("Referrer C got rewards:", hodlock.referrerRewards(userC));
        console.log("[PASS] Test 2 PASSED\n");
    }

    // ============================================
    // Test 3: 无邀请人的情况（有其他用户在池子里）
    // ============================================
    function test_NoReferrer() public {
        console.log("\n=== Test 3: No Referrer (With Other Users) ===");

        // 1. User C deposits first (to ensure pool is not empty)
        vm.prank(userC);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, address(0));

        // 2. User A deposits without referrer
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, address(0));

        assertEq(hodlock.userReferrer(userA), address(0), "Should have no referrer");
        console.log("User A deposited without referrer (User C is also in pool)");

        // 3. User A withdraws early (User C still in pool)
        vm.prank(userA);
        hodlock.withdrawEarly(0);

        // Calculate expected distribution
        uint256 penalty = (DEPOSIT_AMOUNT * PENALTY_BPS) / 10000;
        uint256 expectedDevReward = (penalty * 1000) / 10000; // 10% to dev
        uint256 expectedPoolReward = penalty - expectedDevReward; // 90% to pool

        uint256 actualDevBalance = hodlock.devBalance();

        console.log("Penalty:", penalty);
        console.log("Expected dev reward:", expectedDevReward);
        console.log("Actual dev balance:", actualDevBalance);
        console.log("Expected pool reward:", expectedPoolReward);

        assertEq(actualDevBalance, expectedDevReward, "Dev should get 10%");
        // Note: Pool reward goes to accTokenPerShare, hard to verify directly

        console.log("[PASS] Test 3 PASSED\n");
    }

    // ============================================
    // Test 4: 最后一个用户的情况（邀请人拿不到钱）
    // ============================================
    function test_LastUserWithdrawEarly() public {
        console.log("\n=== Test 4: Last User Withdraw Early (Referrer Gets Nothing) ===");

        // 1. User A deposits with referrer B (only user)
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userB);

        assertEq(hodlock.userReferrer(userA), userB, "Referrer should be B");
        console.log("User A deposited with referrer B");

        // 2. User A withdraws early (is the last user)
        vm.prank(userA);
        hodlock.withdrawEarly(0);

        // Calculate expected: ALL penalty goes to dev, NONE to referrer
        uint256 penalty = (DEPOSIT_AMOUNT * PENALTY_BPS) / 10000;

        uint256 actualReferrerReward = hodlock.referrerRewards(userB);
        uint256 actualDevBalance = hodlock.devBalance();

        console.log("Penalty:", penalty);
        console.log("Referrer reward:", actualReferrerReward);
        console.log("Dev balance:", actualDevBalance);

        assertEq(actualReferrerReward, 0, "Referrer should get NOTHING when last user");
        // When last user withdraws early, dev gets ALL penalty (no forfeited rewards since totalShare was > 0 before)
        assertEq(actualDevBalance, penalty, "Dev should get ALL penalty");

        console.log("[PASS] Test 4 PASSED - Referrer gets nothing when last user withdraws early\n");
    }

    // ============================================
    // Test 5: 多个被邀请人累积奖励
    // ============================================
    function test_MultipleRefereesAccumulateRewards() public {
        console.log("\n=== Test 5: Multiple Referees Accumulate Rewards ===");

        // 0. User D deposits first to ensure pool is never empty
        vm.prank(userD);
        hodlock.deposit(DEPOSIT_AMOUNT * 2, LOCK_TIME, PENALTY_BPS, address(0));
        console.log("User D deposited (stays in pool to prevent last-user scenario)");

        // 1. User A, C deposit with referrer B
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userB);

        vm.prank(userC);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userB);

        console.log("Users A, C deposited with referrer B");

        // 2. A and C withdraw early (D stays in pool)
        vm.prank(userA);
        hodlock.withdrawEarly(0);

        vm.prank(userC);
        hodlock.withdrawEarly(0);

        // Calculate expected total referrer reward (2 users, not 3)
        uint256 penalty = (DEPOSIT_AMOUNT * PENALTY_BPS) / 10000;
        uint256 singleReferrerReward = (penalty * 3000) / 10000;
        uint256 expectedTotalReward = singleReferrerReward * 2; // Only 2 users withdrew

        uint256 actualTotalReward = hodlock.referrerRewards(userB);

        console.log("Single penalty:", penalty);
        console.log("Single referrer reward:", singleReferrerReward);
        console.log("Expected total reward (2x):", expectedTotalReward);
        console.log("Actual total reward:", actualTotalReward);

        assertEq(actualTotalReward, expectedTotalReward, "Should accumulate rewards from 2 users");

        // 3. Referrer B claims all accumulated rewards
        uint256 balanceBefore = token.balanceOf(userB);
        vm.prank(userB);
        hodlock.claimReferrerRewards();
        uint256 balanceAfter = token.balanceOf(userB);

        assertEq(balanceAfter - balanceBefore, expectedTotalReward, "Should receive all accumulated rewards");
        assertEq(hodlock.referrerRewards(userB), 0, "Rewards should be reset to 0");

        console.log("Referrer B claimed all accumulated rewards");
        console.log("[PASS] Test 5 PASSED\n");
    }

    // ============================================
    // Test 6: 边界情况 - 自己不能是自己的邀请人
    // ============================================
    function test_CannotReferSelf() public {
        console.log("\n=== Test 6: Cannot Refer Self ===");

        // User A tries to set self as referrer
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userA);

        // Should have no referrer
        assertEq(hodlock.userReferrer(userA), address(0), "Should not be able to refer self");

        console.log("User A tried to refer self, referrer is address(0)");
        console.log("[PASS] Test 6 PASSED\n");
    }

    // ============================================
    // Test 7: 正常取款不影响邀请人奖励
    // ============================================
    function test_NormalWithdrawNoReferrerReward() public {
        console.log("\n=== Test 7: Normal Withdraw (No Referrer Reward) ===");

        // 1. User A deposits with referrer B
        vm.prank(userA);
        hodlock.deposit(DEPOSIT_AMOUNT, LOCK_TIME, PENALTY_BPS, userB);

        console.log("User A deposited with referrer B");

        // 2. Fast forward past lock time
        vm.warp(block.timestamp + LOCK_TIME + 1);

        // 3. User A withdraws normally (no penalty)
        vm.prank(userA);
        hodlock.withdraw(0);

        // Referrer should get NO rewards (no penalty)
        uint256 referrerReward = hodlock.referrerRewards(userB);

        console.log("Referrer reward after normal withdraw:", referrerReward);
        assertEq(referrerReward, 0, "Referrer should get nothing on normal withdraw");

        console.log("[PASS] Test 7 PASSED\n");
    }

    // ============================================
    // Run all tests
    // ============================================
    function test_RunAllReferrerTests() public {
        console.log("\n========================================");
        console.log("Running All Referrer Mechanism Tests");
        console.log("========================================");

        test_BasicReferrerReward();

        // Reset for next test
        setUp();
        test_ReferrerPermanentBinding();

        setUp();
        test_NoReferrer();

        setUp();
        test_LastUserWithdrawEarly();

        setUp();
        test_MultipleRefereesAccumulateRewards();

        setUp();
        test_CannotReferSelf();

        setUp();
        test_NormalWithdrawNoReferrerReward();

        console.log("\n========================================");
        console.log("[PASS] ALL TESTS PASSED!");
        console.log("========================================\n");
    }
}
