// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IHodlockNFTRenderer {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

interface IHodlockFactory {
    function isHodlock(address hodlock) external view returns (bool);
}

/// @title HodlockNFT
/// @notice 锁仓凭证NFT，锁仓期间为SBT（不可转让），到期后可交易
contract HodlockNFT is ERC721, Ownable {
    // ==========================
    // 状态变量
    // ==========================

    /// @notice NFT元数据结构
    struct LockInfo {
        address hodlockContract;  // Hodlock合约地址
        address tokenAddress;     // 锁仓的ERC20代币地址
        uint256 depositId;        // 存单ID
        uint256 amount;           // 锁仓金额
        uint256 depositTimestamp; // 存入时间
        uint256 unlockTimestamp;  // 解锁时间
        uint256 penaltyBps;       // 罚金比例
        bool isUnlocked;          // 是否已解锁（时间到期或正常提取）
        bool isBurned;            // 是否已销毁
    }

    /// @notice tokenId => LockInfo
    mapping(uint256 => LockInfo) public lockInfos;

    /// @notice Factory合约地址
    address public factory;

    /// @notice Renderer合约地址
    IHodlockNFTRenderer public renderer;

    /// @notice 下一个tokenId
    uint256 public nextTokenId;

    /// @notice (hodlockContract, user, depositId) => tokenId 的映射
    mapping(address => mapping(address => mapping(uint256 => uint256))) public depositToTokenId;

    // ==========================
    // 事件定义
    // ==========================

    event FactoryUpdated(address indexed newFactory);
    event RendererUpdated(address indexed newRenderer);
    event LockNFTMinted(uint256 indexed tokenId, address indexed holder, address indexed hodlock, uint256 depositId);
    event LockNFTUnlocked(uint256 indexed tokenId);
    event LockNFTBurned(uint256 indexed tokenId);

    // ==========================
    // 构造函数
    // ==========================

    constructor() ERC721("Hodlock Certificate", "HODL") Ownable(0x3f144D08d4C89FF633250483e69591556E2b2429) {
        nextTokenId = 1;
    }

    // ==========================
    // 修饰符
    // ==========================

    modifier onlyAuthorizedHodlock() {
        require(factory != address(0), "Factory not set");
        require(IHodlockFactory(factory).isHodlock(msg.sender), "Not authorized");
        _;
    }

    // ==========================
    // Owner管理函数
    // ==========================

    /// @notice 设置Factory合约地址
    function setFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "Zero address");
        factory = _factory;
        emit FactoryUpdated(_factory);
    }

    /// @notice 设置Renderer合约
    function setRenderer(address _renderer) external onlyOwner {
        require(_renderer != address(0), "Zero address");
        renderer = IHodlockNFTRenderer(_renderer);
        emit RendererUpdated(_renderer);
    }

    // ==========================
    // Hodlock合约调用的函数
    // ==========================

    /// @notice 铸造锁仓NFT（由Hodlock合约调用）
    function mint(
        address to,
        address tokenAddress,
        uint256 depositId,
        uint256 amount,
        uint256 depositTimestamp,
        uint256 unlockTimestamp,
        uint256 penaltyBps
    ) external onlyAuthorizedHodlock returns (uint256 tokenId) {
        tokenId = nextTokenId++;

        lockInfos[tokenId] = LockInfo({
            hodlockContract: msg.sender,
            tokenAddress: tokenAddress,
            depositId: depositId,
            amount: amount,
            depositTimestamp: depositTimestamp,
            unlockTimestamp: unlockTimestamp,
            penaltyBps: penaltyBps,
            isUnlocked: false,
            isBurned: false
        });

        depositToTokenId[msg.sender][to][depositId] = tokenId;

        _mint(to, tokenId);

        emit LockNFTMinted(tokenId, to, msg.sender, depositId);
    }

    /// @notice 标记NFT为已解锁（正常提取后调用）
    function markUnlocked(address holder, uint256 depositId) external onlyAuthorizedHodlock {
        uint256 tokenId = depositToTokenId[msg.sender][holder][depositId];
        require(tokenId != 0, "Token not found");
        require(!lockInfos[tokenId].isBurned, "Already burned");

        lockInfos[tokenId].isUnlocked = true;
        emit LockNFTUnlocked(tokenId);
    }

    /// @notice 销毁NFT（提前取款时调用）
    function burn(address holder, uint256 depositId) external onlyAuthorizedHodlock {
        uint256 tokenId = depositToTokenId[msg.sender][holder][depositId];
        require(tokenId != 0, "Token not found");
        require(!lockInfos[tokenId].isBurned, "Already burned");

        lockInfos[tokenId].isBurned = true;
        _burn(tokenId);

        emit LockNFTBurned(tokenId);
    }

    // ==========================
    // 视图函数
    // ==========================

    /// @notice 获取tokenURI（委托给Renderer）
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token not exist");
        require(address(renderer) != address(0), "Renderer not set");
        return renderer.tokenURI(tokenId);
    }

    /// @notice 获取锁仓信息
    function getLockInfo(uint256 tokenId) external view returns (LockInfo memory) {
        return lockInfos[tokenId];
    }

    /// @notice 检查NFT是否可转让
    function isTransferable(uint256 tokenId) public view returns (bool) {
        LockInfo storage info = lockInfos[tokenId];
        // 已解锁或时间已到期则可转让
        return info.isUnlocked || block.timestamp >= info.unlockTimestamp;
    }

    /// @notice 根据hodlock合约、用户、存单ID获取tokenId
    function getTokenId(address hodlock, address user, uint256 depositId) external view returns (uint256) {
        return depositToTokenId[hodlock][user][depositId];
    }

    // ==========================
    // 重写转账函数（实现SBT逻辑）
    // ==========================

    /// @dev 重写_update以实现SBT逻辑
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // 如果是铸造（from == 0）或销毁（to == 0），允许
        // 否则检查是否可转让
        if (from != address(0) && to != address(0)) {
            require(isTransferable(tokenId), "Locked: not transferable");
        }

        return super._update(to, tokenId, auth);
    }
}
