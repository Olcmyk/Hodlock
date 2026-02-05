// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IHodlockNFT {
    function mint(
        address to,
        address tokenAddress,
        uint256 depositId,
        uint256 amount,
        uint256 depositTimestamp,
        uint256 unlockTimestamp,
        uint256 penaltyBps
    ) external returns (uint256 tokenId);
    function burn(address holder, uint256 depositId) external;
}

contract Hodlock is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ==========================
    // 常量与基础配置
    // ==========================

    IERC20 public immutable token; // 质押的 ERC20 代币

    uint256 public constant PRECISION = 1e18; // 奖励精度因子（支持低精度代币如 8 位）

    // 时间常量
    uint256 public constant MIN_LOCK_SECONDS = 300; // 最小锁定 5 分钟
    uint256 public constant SECONDS_PER_YEAR = 31_536_000; // 365 天（用于份额计算）

    // 罚金比例范围（bps，基数 10000）
    uint256 public constant MIN_PENALTY_BPS = 500; // 最低 5%
    uint256 public constant MAX_PENALTY_BPS = 10000; // 最高 100%

    // 参数范围（bps，基数 10000）
    uint256 public constant MAX_DEV_FEE_BPS = 1000; // 0-10%
    uint256 public constant MAX_REFERRER_FEE_BPS = 3000; // 0-30%

    // 时间锁延迟（用于费用参数修改）
    uint256 public constant TIMELOCK_DELAY = 2 days;

    // ==========================
    // 全局状态
    // ==========================

    uint256 public totalShare; // 所有用户总份额
    uint256 public accTokenPerShare; // 累计每股奖励（× PRECISION）
    uint256 public accumulatedRemainder; // 累积的舍入余数（防止精度丢失）

    // Owner 可调参数（bps，基数 10000）
    uint256 public devFeeBps = 1000; // 开发者费用比例 (0-10%)
    uint256 public referrerFeeBps = 3000; // 邀请人费用比例 (0-30%)

    // 待处理的费用更改（时间锁）
    struct PendingFeeChange {
        uint256 newValue;
        uint256 executeTime;
        bool pending;
    }
    PendingFeeChange public pendingDevFeeBps;
    PendingFeeChange public pendingReferrerFeeBps;

    // 开发者相关
    address public developer; // 开发者地址（资金接收方）
    uint256 public devBalance; // 开发者待提取余额

    // NFT合约
    IHodlockNFT public nftContract;

    // 跟踪哪些存单已铸造NFT
    mapping(address => mapping(uint256 => bool)) public hasNFT;

    // ==========================
    // 存单与邀请数据结构（每地址多存单）
    // ==========================

    struct DepositInfo {
        uint256 amount;          // 该存单当前质押代币数量
        uint256 originalAmount;  // 原始存入金额（用于NFT铸造，不会被清零）
        uint256 share;           // 该存单份额
        uint256 rewardDebt;      // 该存单奖励债务
        uint256 depositTimestamp; // 存入时间
        uint256 unlockTimestamp; // 该存单可无罚金取出的绝对时间
        uint256 penaltyBps;      // 该存单的罚金比例（500-10000 bps，即 5%-100%）
        bool withdrawn;          // 是否已完全取出（逻辑删除标记）
    }

    // 每个地址可以有多笔独立存单
    mapping(address => DepositInfo[]) public userDeposits;

    // 用户的邀请人（永久绑定，首次存款时设置）
    mapping(address => address) public userReferrer;

    // 邀请人累积佣金（由提前取款罚金产生）
    mapping(address => uint256) public referrerRewards;

    // ==========================
    // 统计数据
    // ==========================

    // 总用户数
    uint256 public totalUsers;

    // 用户是否已注册（用于统计）
    mapping(address => bool) public isUser;

    // 总锁仓量（当前有效锁仓的代币总量）
    uint256 public totalLockedAmount;

    // 邀请人的被邀请人列表（反向映射）
    mapping(address => address[]) public refereeList;

    // 邀请人的被邀请人数量
    mapping(address => uint256) public refereeCount;


    // ==========================
    // 事件定义
    // ==========================

    // 核心业务事件
    event Deposit(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        uint256 lockSeconds,
        uint256 penaltyBps,
        uint256 unlockTimestamp,
        address indexed referrer
    );
    event WithdrawEarly(address indexed user, uint256 indexed depositId, uint256 amount, uint256 penalty, uint256 forfeitedReward);
    event Withdraw(address indexed user, uint256 indexed depositId, uint256 amount, uint256 reward);
    event ClaimReward(address indexed user, uint256 indexed depositId, uint256 reward);
    event ClaimReferrerRewards(address indexed referrer, uint256 totalReward);

    // 邀请关系事件（便于 Dune 分析邀请网络）
    event ReferrerSet(address indexed user, address indexed referrer);

    // 用户注册事件
    event UserRegistered(address indexed user, address indexed referrer);

    // NFT 事件
    event NFTMinted(address indexed user, uint256 indexed depositId, uint256 tokenId);

    // 奖励池更新事件（便于追踪资金流向）
    event RewardPoolUpdated(
        uint256 penaltyAmount,
        uint256 forfeitedReward,
        uint256 toPool,
        uint256 toReferrer,
        uint256 toDev
    );

    // 管理事件
    event DevWithdraw(uint256 amount);
    event DevFeeBpsUpdated(uint256 newBps);
    event ReferrerFeeBpsUpdated(uint256 newBps);
    event DeveloperUpdated(address indexed newDeveloper);

    // 时间锁事件
    event DevFeeBpsProposed(uint256 newBps, uint256 executeTime);
    event ReferrerFeeBpsProposed(uint256 newBps, uint256 executeTime);
    event DevFeeBpsCancelled();
    event ReferrerFeeBpsCancelled();

    // ==========================
    // 构造函数
    // ==========================

    constructor(IERC20 _token, address _developer, address _nftContract) Ownable(0x3f144D08d4C89FF633250483e69591556E2b2429) {
        require(address(_token) != address(0), "Token zero");
        require(_developer != address(0), "Dev zero");
        token = _token;
        developer = _developer;
        if (_nftContract != address(0)) {
            nftContract = IHodlockNFT(_nftContract);
        }
    }

    // ==========================
    // 核心外部函数（按存单维度操作）
    // ==========================

    /// @notice 创建新的存单
    /// @param amount 存入的代币数量
    /// @param lockSeconds 锁定秒数（最小 300 秒）
    /// @param penaltyBps 罚金比例（500-10000 bps，即 5%-100%）
    /// @param referrer 邀请人地址（仅首次存款生效，可为0）
    function deposit(uint256 amount, uint256 lockSeconds, uint256 penaltyBps, address referrer) external nonReentrant {
        require(amount > 0, "Amount zero");
        require(lockSeconds >= MIN_LOCK_SECONDS, "Lock too short");
        require(penaltyBps >= MIN_PENALTY_BPS && penaltyBps <= MAX_PENALTY_BPS, "Invalid penalty");

        // 记录转账前余额（支持 fee-on-transfer tokens）
        uint256 balanceBefore = token.balanceOf(address(this));

        // 代币转入合约
        token.safeTransferFrom(msg.sender, address(this), amount);

        // 计算实际到账金额
        uint256 actualAmount = token.balanceOf(address(this)) - balanceBefore;
        require(actualAmount > 0, "No tokens received");

        // 计算该存单份额（使用实际到账金额）
        uint256 userShare = _calculateShare(actualAmount, lockSeconds);
        require(userShare > 0, "Share zero");

        // 确定邀请人：如果是首次存款，则设置邀请人（永久绑定）
        address finalReferrer = _setReferrerIfFirst(msg.sender, referrer);

        // 首次存款时注册用户
        if (!isUser[msg.sender]) {
            isUser[msg.sender] = true;
            totalUsers++;
            emit UserRegistered(msg.sender, finalReferrer);
        }

        // 更新总锁仓量
        totalLockedAmount += actualAmount;

        // 计算解锁时间
        uint256 unlockTime = block.timestamp + lockSeconds;

        // 创建新的存单
        userDeposits[msg.sender].push(DepositInfo({
            amount: actualAmount,
            originalAmount: actualAmount,
            share: userShare,
            rewardDebt: (userShare * accTokenPerShare) / PRECISION,
            depositTimestamp: block.timestamp,
            unlockTimestamp: unlockTime,
            penaltyBps: penaltyBps,
            withdrawn: false
        }));

        uint256 depositId = userDeposits[msg.sender].length - 1;

        // 更新全局份额
        totalShare += userShare;

        emit Deposit(msg.sender, depositId, actualAmount, lockSeconds, penaltyBps, unlockTime, finalReferrer);
    }

    /// @notice 为存单铸造NFT（可选功能，提款后也可铸造）
    /// @param depositId 存单索引
    function mintNFT(uint256 depositId) external {
        require(address(nftContract) != address(0), "NFT not set");
        require(!hasNFT[msg.sender][depositId], "NFT exists");
        require(depositId < userDeposits[msg.sender].length, "Invalid id");

        DepositInfo storage info = userDeposits[msg.sender][depositId];
        require(info.originalAmount > 0, "No deposit");

        uint256 tokenId = nftContract.mint(
            msg.sender,
            address(token),
            depositId,
            info.originalAmount,
            info.depositTimestamp,
            info.unlockTimestamp,
            info.penaltyBps
        );

        hasNFT[msg.sender][depositId] = true;

        emit NFTMinted(msg.sender, depositId, tokenId);
    }

    /// @notice 正常取款（锁定期满），按存单操作
    /// @param depositId 存单索引
    function withdraw(uint256 depositId) external nonReentrant {
        DepositInfo storage info = _getActiveDeposit(msg.sender, depositId);
        require(block.timestamp >= info.unlockTimestamp, "Locked");

        uint256 pending = _pendingReward(info);

        uint256 amount = info.amount;
        uint256 share = info.share;

        // 更新全局份额
        totalShare -= share;

        // 标记该存单已完全取出
        info.amount = 0;
        info.share = 0;
        info.rewardDebt = 0;
        info.withdrawn = true;

        // 更新总锁仓量
        totalLockedAmount -= amount;

        // 转账（支持 fee-on-transfer tokens）
        uint256 transferAmount = amount + pending;

        // 如果是最后一个用户，将累积的余数作为奖励给他
        if (totalShare == 0 && accumulatedRemainder > 0) {
            transferAmount += accumulatedRemainder / PRECISION;
            accumulatedRemainder = 0;
        }

        _safeTransfer(msg.sender, transferAmount);

        emit Withdraw(msg.sender, depositId, amount, pending);
    }

    /// @notice 提前取款（产生罚金），按存单操作，全额销号
    /// @param depositId 存单索引
    function withdrawEarly(uint256 depositId) external nonReentrant {
        // ================================
        // 1. CHECKS（检查）
        // ================================
        DepositInfo storage info = _getActiveDeposit(msg.sender, depositId);
        require(info.amount > 0, "No amount");
        require(block.timestamp < info.unlockTimestamp, "Already unlocked, use withdraw()");

        // 记录是否需要销毁 NFT（不调用外部合约）
        bool shouldBurnNFT = hasNFT[msg.sender][depositId];

        // ================================
        // 2. EFFECTS（状态更新）
        // ================================

        // 计算用户放弃的待领分红（死钱）
        uint256 forfeitedReward = _pendingReward(info);

        uint256 amount = info.amount;
        uint256 share = info.share;
        uint256 penaltyBps = info.penaltyBps;

        // 计算罚金（基于本金，使用存单自己的罚金比例，bps）
        uint256 penalty = (amount * penaltyBps) / 10000;
        require(penalty > 0, "Penalty zero");

        // 更新全局份额（彻底剔除该存单份额，避免僵尸份额）
        totalShare -= share;

        // 标记该存单已完全取出
        info.amount = 0;
        info.share = 0;
        info.rewardDebt = 0;
        info.withdrawn = true;

        // 更新总锁仓量
        totalLockedAmount -= amount;

        uint256 rewardToPool = 0;
        uint256 toReferrer = 0;
        uint256 toDev = 0;

        // 判断是否最后一个用户（全局）
        bool isLastUser = (totalShare == 0);

        if (isLastUser) {
            // 最后一个用户违约，全部罚金 + 死钱给开发者
            toDev = penalty + forfeitedReward;
            // 累积的余数也给开发者
            if (accumulatedRemainder > 0) {
                toDev += accumulatedRemainder / PRECISION;
                accumulatedRemainder = 0;
            }
            devBalance += toDev;
        } else {
            // 仍有其他用户
            address ref = userReferrer[msg.sender];
            if (ref != address(0)) {
                // 有邀请人
                toReferrer = (penalty * referrerFeeBps) / 10000;
                toDev = (penalty * devFeeBps) / 10000;
                rewardToPool = penalty - toReferrer - toDev;

                referrerRewards[ref] += toReferrer;
                devBalance += toDev;
            } else {
                // 无邀请人：开发者 devFeeBps，剩余进入奖励池
                toDev = (penalty * devFeeBps) / 10000;
                rewardToPool = penalty - toDev;
                devBalance += toDev;
            }

            // 将死钱（放弃的分红）也加入奖励池，分配给其他HODLer
            rewardToPool += forfeitedReward;

            if (rewardToPool > 0 && totalShare > 0) {
                uint256 numerator = rewardToPool * PRECISION + accumulatedRemainder;
                uint256 toAdd = numerator / totalShare;
                accumulatedRemainder = numerator % totalShare;
                accTokenPerShare += toAdd;
            }
        }

        uint256 transferAmount = amount - penalty;

        // ================================
        // 3. INTERACTIONS（外部交互）
        // ================================

        // 发出事件
        emit RewardPoolUpdated(penalty, forfeitedReward, rewardToPool, toReferrer, toDev);
        emit WithdrawEarly(msg.sender, depositId, amount, penalty, forfeitedReward);

        // 销毁 NFT（外部调用，失败不影响取款）
        if (shouldBurnNFT && address(nftContract) != address(0)) {
            try nftContract.burn(msg.sender, depositId) {} catch {}
        }

        // 转账（外部调用）
        _safeTransfer(msg.sender, transferAmount);
    }

    /// @notice 单独领取某一存单的奖励（不改变质押本金）
    /// @param depositId 存单索引
    function claimReward(uint256 depositId) external nonReentrant {
        DepositInfo storage info = _getActiveDeposit(msg.sender, depositId);
        require(info.share > 0, "No share");

        uint256 pending = _pendingReward(info);
        require(pending > 0, "No reward");

        // 更新 rewardDebt
        info.rewardDebt = (info.share * accTokenPerShare) / PRECISION;

        // 转账奖励（支持 fee-on-transfer tokens）
        _safeTransfer(msg.sender, pending);

        emit ClaimReward(msg.sender, depositId, pending);
    }

    /// @notice 邀请人提取自己的邀请奖励（累积）
    function claimReferrerRewards() external nonReentrant {
        uint256 totalReward = referrerRewards[msg.sender];
        require(totalReward > 0, "No ref reward");

        referrerRewards[msg.sender] = 0;

        // 转账（支持 fee-on-transfer tokens）
        _safeTransfer(msg.sender, totalReward);

        emit ClaimReferrerRewards(msg.sender, totalReward);
    }

    /// @notice Owner 提取开发者费用到 developer 地址
    function withdrawDev() external onlyOwner nonReentrant {
        uint256 amount = devBalance;
        require(amount > 0, "No dev balance");

        devBalance = 0;

        // 转账（支持 fee-on-transfer tokens）
        _safeTransfer(developer, amount);

        emit DevWithdraw(amount);
    }

    // ==========================
    // Owner 管理函数
    // ==========================

    /// @notice 设置开发者地址
    function setDeveloper(address _developer) external onlyOwner {
        require(_developer != address(0), "Dev zero");
        developer = _developer;
        emit DeveloperUpdated(_developer);
    }

    /// @notice 提议设置开发者费用比例（0-1000 bps，即 0-10%），需等待时间锁后执行
    function proposeDevFeeBps(uint256 newBps) external onlyOwner {
        require(newBps <= MAX_DEV_FEE_BPS, "DevFee too high");
        uint256 executeTime = block.timestamp + TIMELOCK_DELAY;
        pendingDevFeeBps = PendingFeeChange(newBps, executeTime, true);
        emit DevFeeBpsProposed(newBps, executeTime);
    }

    /// @notice 执行待处理的开发者费用修改
    function executeDevFeeBps() external onlyOwner {
        require(pendingDevFeeBps.pending, "No pending change");
        require(block.timestamp >= pendingDevFeeBps.executeTime, "Timelock active");
        devFeeBps = pendingDevFeeBps.newValue;
        pendingDevFeeBps.pending = false;
        emit DevFeeBpsUpdated(pendingDevFeeBps.newValue);
    }

    /// @notice 取消待处理的开发者费用修改
    function cancelDevFeeBps() external onlyOwner {
        require(pendingDevFeeBps.pending, "No pending change");
        pendingDevFeeBps.pending = false;
        emit DevFeeBpsCancelled();
    }

    /// @notice 提议设置邀请人费用比例（0-3000 bps，即 0-30%），需等待时间锁后执行
    function proposeReferrerFeeBps(uint256 newBps) external onlyOwner {
        require(newBps <= MAX_REFERRER_FEE_BPS, "RefFee too high");
        uint256 executeTime = block.timestamp + TIMELOCK_DELAY;
        pendingReferrerFeeBps = PendingFeeChange(newBps, executeTime, true);
        emit ReferrerFeeBpsProposed(newBps, executeTime);
    }

    /// @notice 执行待处理的邀请人费用修改
    function executeReferrerFeeBps() external onlyOwner {
        require(pendingReferrerFeeBps.pending, "No pending change");
        require(block.timestamp >= pendingReferrerFeeBps.executeTime, "Timelock active");
        referrerFeeBps = pendingReferrerFeeBps.newValue;
        pendingReferrerFeeBps.pending = false;
        emit ReferrerFeeBpsUpdated(pendingReferrerFeeBps.newValue);
    }

    /// @notice 取消待处理的邀请人费用修改
    function cancelReferrerFeeBps() external onlyOwner {
        require(pendingReferrerFeeBps.pending, "No pending change");
        pendingReferrerFeeBps.pending = false;
        emit ReferrerFeeBpsCancelled();
    }


    // ==========================
    // 视图函数
    // ==========================

    /// @notice 查询某存单当前可领取奖励
    function pendingReward(address _user, uint256 depositId) external view returns (uint256) {
        DepositInfo storage info = _getActiveDepositView(_user, depositId);
        return _pendingReward(info);
    }

    /// @notice 计算给定 amount 和 lockSeconds 的份额
    function calculateShare(uint256 amount, uint256 lockSeconds) external pure returns (uint256) {
        return _calculateShare(amount, lockSeconds);
    }

    /// @notice 返回用户存单数量
    function getDepositCount(address _user) external view returns (uint256) {
        return userDeposits[_user].length;
    }

    /// @notice 获取用户汇总信息
    /// @param _user 用户地址
    /// @return totalAmount 用户总锁仓量
    /// @return totalUserShare 用户总份额
    /// @return totalPendingRewards 用户总待领奖励
    /// @return depositCount 用户存单数量
    function getUserSummary(address _user) external view returns (
        uint256 totalAmount,
        uint256 totalUserShare,
        uint256 totalPendingRewards,
        uint256 depositCount
    ) {
        DepositInfo[] storage deposits = userDeposits[_user];
        depositCount = deposits.length;

        for (uint256 i = 0; i < depositCount; i++) {
            DepositInfo storage info = deposits[i];
            if (!info.withdrawn && info.amount > 0) {
                totalAmount += info.amount;
                totalUserShare += info.share;
                totalPendingRewards += _pendingReward(info);
            }
        }
    }

    /// @notice 获取存单完整信息
    /// @param _user 用户地址
    /// @param depositId 存单索引
    /// @return info 存单信息结构体
    /// @return pending 当前可领取奖励
    /// @return isUnlocked 是否已解锁
    function getDepositInfo(address _user, uint256 depositId) external view returns (
        DepositInfo memory info,
        uint256 pending,
        bool isUnlocked
    ) {
        require(depositId < userDeposits[_user].length, "Invalid id");
        info = userDeposits[_user][depositId];
        pending = _pendingReward(userDeposits[_user][depositId]);
        isUnlocked = block.timestamp >= info.unlockTimestamp;
    }

    /// @notice 获取全局池子统计
    /// @return _totalShare 总份额
    /// @return _accTokenPerShare 累计每股奖励
    /// @return _totalLockedAmount 总锁仓量
    /// @return _totalUsers 总用户数
    /// @return _devBalance 开发者待提取余额
    /// @return poolBalance 合约代币余额
    function getPoolStats() external view returns (
        uint256 _totalShare,
        uint256 _accTokenPerShare,
        uint256 _totalLockedAmount,
        uint256 _totalUsers,
        uint256 _devBalance,
        uint256 poolBalance
    ) {
        _totalShare = totalShare;
        _accTokenPerShare = accTokenPerShare;
        _totalLockedAmount = totalLockedAmount;
        _totalUsers = totalUsers;
        _devBalance = devBalance;
        poolBalance = token.balanceOf(address(this));
    }

    /// @notice 获取邀请人统计信息
    /// @param _referrer 邀请人地址
    /// @return _refereeCount 被邀请人数量
    /// @return _referrerRewards 累积邀请奖励
    /// @return _refereeAddresses 被邀请人地址列表
    function getReferrerStats(address _referrer) external view returns (
        uint256 _refereeCount,
        uint256 _referrerRewards,
        address[] memory _refereeAddresses
    ) {
        _refereeCount = refereeCount[_referrer];
        _referrerRewards = referrerRewards[_referrer];
        _refereeAddresses = refereeList[_referrer];
    }

    /// @notice 获取用户的邀请人信息
    /// @param _user 用户地址
    /// @return referrer 邀请人地址
    function getUserReferrer(address _user) external view returns (address referrer) {
        referrer = userReferrer[_user];
    }

    // ==========================
    // 内部/私有工具函数
    // ==========================

    /// @dev 计算份额: userShare = amount * t^2 / (t + SECONDS_PER_YEAR)
    function _calculateShare(uint256 amount, uint256 lockSeconds) internal pure returns (uint256) {
        uint256 t2 = lockSeconds * lockSeconds;
        uint256 denom = lockSeconds + SECONDS_PER_YEAR;
        return (amount * t2) / denom;
    }

    /// @dev 计算待领取奖励
    function _pendingReward(DepositInfo storage info) internal view returns (uint256) {
        if (info.share == 0 || info.withdrawn) {
            return 0;
        }
        uint256 accumulated = (info.share * accTokenPerShare) / PRECISION;
        if (accumulated < info.rewardDebt) {
            return 0;
        }
        return accumulated - info.rewardDebt;
    }

    /// @dev 获取用户的有效存单（存储版），带基本检查
    function _getActiveDeposit(address user, uint256 depositId) internal view returns (DepositInfo storage) {
        require(depositId < userDeposits[user].length, "Invalid id");
        DepositInfo storage info = userDeposits[user][depositId];
        require(!info.withdrawn, "Closed");
        require(info.share > 0 && info.amount > 0, "Empty");
        return info;
    }

    /// @dev 只读版本，用于 view 函数
    function _getActiveDepositView(address user, uint256 depositId) internal view returns (DepositInfo storage) {
        require(depositId < userDeposits[user].length, "Invalid id");
        DepositInfo storage info = userDeposits[user][depositId];
        return info;
    }

    /// @dev 首次存款时设置邀请人（永久绑定）
    function _setReferrerIfFirst(address user, address referrer) internal returns (address) {
        // 如果用户已有邀请人记录，直接返回
        if (userReferrer[user] != address(0)) {
            return userReferrer[user];
        }

        // 首次存款，设置邀请人
        if (referrer != address(0) && referrer != user) {
            userReferrer[user] = referrer;
            // 更新反向映射
            refereeList[referrer].push(user);
            refereeCount[referrer]++;
            emit ReferrerSet(user, referrer);
            return referrer;
        }

        // 没有有效邀请人
        return address(0);
    }

    /// @dev 安全转账函数（支持 fee-on-transfer tokens）
    function _safeTransfer(address to, uint256 amount) internal {
        token.safeTransfer(to, amount);
    }
}
