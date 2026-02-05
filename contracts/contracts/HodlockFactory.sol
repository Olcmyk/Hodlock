// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Hodlock} from "./Hodlock.sol";
import {HodlockNFT} from "./HodlockNFT.sol";

/// @title HodlockFactory
/// @notice 工厂合约，用于为不同的 ERC20 代币部署 Hodlock 实例
/// @dev 包含黑名单功能，防止为不兼容的代币（如 rebase tokens）创建池子
contract HodlockFactory is Ownable {
    // ==========================
    // 状态变量
    // ==========================

    /// @notice 默认开发者地址（可在创建时覆盖）
    address public defaultDeveloper;

    /// @notice NFT合约地址（部署时设置，不可变）
    HodlockNFT public immutable nftContract;

    /// @notice 代币黑名单（rebase tokens、已知问题代币等）
    mapping(address => bool) public isBlacklisted;

    /// @notice 代币地址 => Hodlock 合约地址
    mapping(address => address) public getHodlock;

    /// @notice 记录所有创建的 Hodlock 合约（用于验证）
    mapping(address => bool) public isHodlock;

    /// @notice 所有已创建的 Hodlock 合约地址列表
    address[] public allHodlocks;

    // ==========================
    // 事件定义
    // ==========================

    event HodlockCreated(
        address indexed token,
        address indexed hodlock,
        address developer,
        uint256 index
    );

    event TokenBlacklisted(address indexed token, bool blacklisted);
    event DefaultDeveloperUpdated(address indexed newDeveloper);

    // ==========================
    // 构造函数
    // ==========================

    constructor(address _nftContract) Ownable(0x3f144D08d4C89FF633250483e69591556E2b2429) {
        require(_nftContract != address(0), "NFT zero");
        defaultDeveloper = 0x3f144D08d4C89FF633250483e69591556E2b2429;
        nftContract = HodlockNFT(_nftContract);
    }

    // ==========================
    // 核心功能
    // ==========================

    /// @notice 为指定的 ERC20 代币创建新的 Hodlock 实例
    /// @param token ERC20 代币地址
    /// @return hodlock 新创建的 Hodlock 合约地址
    /// @dev 开发者地址始终使用 defaultDeveloper，只有 owner 可以通过 setDefaultDeveloper 修改
    function createHodlock(address token)
        external
        returns (address hodlock)
    {
        require(token != address(0), "Token zero");
        require(!isBlacklisted[token], "Token blacklisted");
        require(getHodlock[token] == address(0), "Hodlock exists");
        require(defaultDeveloper != address(0), "Dev zero");

        // 始终使用默认开发者地址（由 owner 控制）
        Hodlock newHodlock = new Hodlock(IERC20(token), defaultDeveloper, address(nftContract));
        hodlock = address(newHodlock);

        // 记录映射关系
        getHodlock[token] = hodlock;
        isHodlock[hodlock] = true;
        allHodlocks.push(hodlock);

        emit HodlockCreated(token, hodlock, defaultDeveloper, allHodlocks.length - 1);
    }

    // ==========================
    // Owner 管理函数
    // ==========================

    /// @notice 添加或移除代币黑名单
    /// @param token 代币地址
    /// @param blacklisted true=加入黑名单，false=移除黑名单
    function setTokenBlacklist(address token, bool blacklisted) external onlyOwner {
        require(token != address(0), "Token zero");
        isBlacklisted[token] = blacklisted;
        emit TokenBlacklisted(token, blacklisted);
    }

    /// @notice 批量设置代币黑名单
    /// @param tokens 代币地址数组
    /// @param blacklisted true=加入黑名单，false=移除黑名单
    function setTokenBlacklistBatch(address[] calldata tokens, bool blacklisted)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "Token zero");
            isBlacklisted[tokens[i]] = blacklisted;
            emit TokenBlacklisted(tokens[i], blacklisted);
        }
    }

    /// @notice 更新默认开发者地址
    /// @param newDeveloper 新的默认开发者地址
    function setDefaultDeveloper(address newDeveloper) external onlyOwner {
        require(newDeveloper != address(0), "Dev zero");
        defaultDeveloper = newDeveloper;
        emit DefaultDeveloperUpdated(newDeveloper);
    }

    // ==========================
    // 视图函数
    // ==========================

    /// @notice 获取已创建的 Hodlock 合约总数
    function allHodlocksLength() external view returns (uint256) {
        return allHodlocks.length;
    }

    /// @notice 检查代币是否可以创建 Hodlock
    /// @param token 代币地址
    /// @return canCreate 是否可以创建
    /// @return reason 不能创建的原因（如果可以创建则为空字符串）
    function canCreateHodlock(address token)
        external
        view
        returns (bool canCreate, string memory reason)
    {
        if (token == address(0)) {
            return (false, "Token is zero address");
        }
        if (isBlacklisted[token]) {
            return (false, "Token is blacklisted");
        }
        if (getHodlock[token] != address(0)) {
            return (false, "Hodlock already exists");
        }
        return (true, "");
    }

    /// @notice 批量获取所有Hodlock合约的TVL信息（用于DefiLlama等平台）
    /// @return tokens 代币地址数组
    /// @return hodlocks Hodlock合约地址数组
    /// @return amounts 每个代币的锁定数量数组（原始单位，非美元价值）
    function getAllTVLs() external view returns (
        address[] memory tokens,
        address[] memory hodlocks,
        uint256[] memory amounts
    ) {
        uint256 length = allHodlocks.length;
        tokens = new address[](length);
        hodlocks = new address[](length);
        amounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address hodlockAddr = allHodlocks[i];
            Hodlock hodlock = Hodlock(hodlockAddr);

            hodlocks[i] = hodlockAddr;
            tokens[i] = address(hodlock.token());
            amounts[i] = hodlock.totalLockedAmount();
        }
    }

    /// @notice 获取指定代币的TVL
    /// @param token 代币地址
    /// @return hodlock 对应的Hodlock合约地址（如果不存在返回0地址）
    /// @return amount TVL数量（如果不存在返回0）
    function getTVL(address token) external view returns (
        address hodlock,
        uint256 amount
    ) {
        hodlock = getHodlock[token];
        if (hodlock == address(0)) {
            return (address(0), 0);
        }
        amount = Hodlock(hodlock).totalLockedAmount();
    }

    /// @notice 获取指定Hodlock合约的详细统计信息
    /// @param hodlock Hodlock合约地址
    /// @return token 代币地址
    /// @return totalShare 总份额
    /// @return totalLockedAmount 总锁仓量
    /// @return totalUsers 总用户数
    /// @return poolBalance 合约代币余额
    function getHodlockStats(address hodlock) external view returns (
        address token,
        uint256 totalShare,
        uint256 totalLockedAmount,
        uint256 totalUsers,
        uint256 poolBalance
    ) {
        require(isHodlock[hodlock], "Not a Hodlock");
        Hodlock h = Hodlock(hodlock);

        token = address(h.token());
        (totalShare, , totalLockedAmount, totalUsers, , poolBalance) = h.getPoolStats();
    }
}
