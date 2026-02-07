// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Hodlock} from "./Hodlock.sol";
import {HodlockNFT} from "./HodlockNFT.sol";

interface IReverseRegistrar {
    function setName(string memory name) external returns (bytes32);
}

/// @title HodlockFactory
/// @notice Factory contract for deploying Hodlock instances for different ERC20 tokens
/// @dev Includes blacklist functionality to prevent creating pools for incompatible tokens (e.g., rebase tokens)
contract HodlockFactory is Ownable {
    // ==========================
    // State Variables
    // ==========================

    /// @notice Default developer address (can be overridden during creation)
    address public defaultDeveloper;

    /// @notice NFT contract address (set at deployment, immutable)
    HodlockNFT public immutable nftContract;

    /// @notice Token blacklist (rebase tokens, known problematic tokens, etc.)
    mapping(address => bool) public isBlacklisted;

    /// @notice Token address => Hodlock contract address
    mapping(address => address) public getHodlock;

    /// @notice Records all created Hodlock contracts (for verification)
    mapping(address => bool) public isHodlock;

    /// @notice List of all created Hodlock contract addresses
    address[] public allHodlocks;

    /// @notice Fee for creating a Hodlock (ETH)
    uint256 public createFee = 0.001 ether;

    // ==========================
    // Event Definitions
    // ==========================

    event HodlockCreated(
        address indexed token,
        address indexed hodlock,
        address developer,
        uint256 index
    );

    event TokenBlacklisted(address indexed token, bool blacklisted);
    event DefaultDeveloperUpdated(address indexed newDeveloper);
    event CreateFeeUpdated(uint256 newFee);

    // ==========================
    // Constructor
    // ==========================

    constructor(address _nftContract) Ownable(0x3f144D08d4C89FF633250483e69591556E2b2429) {
        require(_nftContract != address(0), "NFT zero");
        defaultDeveloper = 0x3f144D08d4C89FF633250483e69591556E2b2429;
        nftContract = HodlockNFT(_nftContract);
    }

    // ==========================
    // Core Functions
    // ==========================

    /// @notice Create a new Hodlock instance for the specified ERC20 token
    /// @param token ERC20 token address
    /// @return hodlock Newly created Hodlock contract address
    /// @dev Developer address always uses defaultDeveloper, only owner can modify via setDefaultDeveloper
    function createHodlock(address token)
        external
        payable
        returns (address hodlock)
    {
        require(msg.value >= createFee, "Insufficient fee");
        require(token != address(0), "Token zero");
        require(!isBlacklisted[token], "Token blacklisted");
        require(getHodlock[token] == address(0), "Hodlock exists");
        require(defaultDeveloper != address(0), "Dev zero");

        // Send creation fee to developer
        if (msg.value > 0) {
            (bool success, ) = defaultDeveloper.call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }

        // Always use default developer address (controlled by owner)
        Hodlock newHodlock = new Hodlock(IERC20(token), defaultDeveloper, address(nftContract));
        hodlock = address(newHodlock);

        // Record mapping relationships
        getHodlock[token] = hodlock;
        isHodlock[hodlock] = true;
        allHodlocks.push(hodlock);

        emit HodlockCreated(token, hodlock, defaultDeveloper, allHodlocks.length - 1);
    }

    // ==========================
    // Owner Management Functions
    // ==========================

    /// @notice Add or remove token from blacklist
    /// @param token Token address
    /// @param blacklisted true=add to blacklist, false=remove from blacklist
    function setTokenBlacklist(address token, bool blacklisted) external onlyOwner {
        require(token != address(0), "Token zero");
        isBlacklisted[token] = blacklisted;
        emit TokenBlacklisted(token, blacklisted);
    }

    /// @notice Batch set token blacklist
    /// @param tokens Array of token addresses
    /// @param blacklisted true=add to blacklist, false=remove from blacklist
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

    /// @notice Update default developer address
    /// @param newDeveloper New default developer address
    function setDefaultDeveloper(address newDeveloper) external onlyOwner {
        require(newDeveloper != address(0), "Dev zero");
        defaultDeveloper = newDeveloper;
        emit DefaultDeveloperUpdated(newDeveloper);
    }

    /// @notice Set creation fee
    /// @param newFee New creation fee (ETH)
    function setCreateFee(uint256 newFee) external onlyOwner {
        createFee = newFee;
        emit CreateFeeUpdated(newFee);
    }

    // ==========================
    // View Functions
    // ==========================

    /// @notice Get total number of created Hodlock contracts
    function allHodlocksLength() external view returns (uint256) {
        return allHodlocks.length;
    }

    /// @notice Check if a token can create a Hodlock
    /// @param token Token address
    /// @return canCreate Whether it can be created
    /// @return reason Reason if cannot create (empty string if can create)
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

    /// @notice Batch get TVL info for all Hodlock contracts (for DefiLlama and similar platforms)
    /// @return tokens Array of token addresses
    /// @return hodlocks Array of Hodlock contract addresses
    /// @return amounts Array of locked amounts for each token (raw units, not USD value)
    /// @dev May exceed gas limit if too many Hodlocks, use getAllTVLsPaginated instead
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

    /// @notice Paginated get TVL info for Hodlock contracts
    /// @param offset Starting index
    /// @param limit Number of results to return
    /// @return tokens Array of token addresses
    /// @return hodlocks Array of Hodlock contract addresses
    /// @return amounts Array of locked amounts for each token
    /// @return total Total number of Hodlocks
    function getAllTVLsPaginated(uint256 offset, uint256 limit) external view returns (
        address[] memory tokens,
        address[] memory hodlocks,
        uint256[] memory amounts,
        uint256 total
    ) {
        total = allHodlocks.length;
        if (offset >= total) {
            return (new address[](0), new address[](0), new uint256[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 size = end - offset;

        tokens = new address[](size);
        hodlocks = new address[](size);
        amounts = new uint256[](size);

        for (uint256 i = 0; i < size; i++) {
            address hodlockAddr = allHodlocks[offset + i];
            Hodlock h = Hodlock(hodlockAddr);

            hodlocks[i] = hodlockAddr;
            tokens[i] = address(h.token());
            amounts[i] = h.totalLockedAmount();
        }
    }

    /// @notice Get TVL for a specific token
    /// @param token Token address
    /// @return hodlock Corresponding Hodlock contract address (returns zero address if not exists)
    /// @return amount TVL amount (returns 0 if not exists)
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

    /// @notice Get detailed statistics for a specific Hodlock contract
    /// @param hodlock Hodlock contract address
    /// @return token Token address
    /// @return totalShare Total shares
    /// @return totalLockedAmount Total locked amount
    /// @return totalUsers Total number of users
    /// @return poolBalance Contract token balance
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

    /// @notice Set Base chain ENS reverse resolution name (Owner only)
    /// @param name Domain name, e.g., "factory.hodlock.base.eth"
    function setBaseName(string calldata name) external onlyOwner {
        // Base mainnet L2 Reverse Registrar address
        IReverseRegistrar(0x79EA96012eEa67A83431F1701B3dFf7e37F9E282).setName(name);
    }
}
