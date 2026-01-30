// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

interface IHodlockNFT {
    struct LockInfo {
        address hodlockContract;
        address tokenAddress;
        uint256 depositId;
        uint256 amount;
        uint256 depositTimestamp;
        uint256 unlockTimestamp;
        uint256 penaltyBps;
        bool isUnlocked;
        bool isBurned;
    }

    function getLockInfo(uint256 tokenId) external view returns (LockInfo memory);
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IERC20Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

/// @title HodlockNFTRenderer
/// @notice 负责渲染Hodlock NFT的元数据和图片
contract HodlockNFTRenderer {
    using Strings for uint256;
    using Strings for address;

    // IPFS图片CID
    string public constant HOURGLASS_CID = "QmS6GLuBFQANG4YzvyaJyQMu8HpbLvootZ4mMoyFrgohR3";
    string public constant TROPHY_CID = "Qme1FnaaikCdpveyQ6CTrbcxoejtEwCWbmL9b5mBoscfjp";

    // NFT合约地址
    IHodlockNFT public immutable nftContract;

    constructor(address _nftContract) {
        require(_nftContract != address(0), "Zero address");
        nftContract = IHodlockNFT(_nftContract);
    }

    /// @notice 生成tokenURI
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        IHodlockNFT.LockInfo memory info = nftContract.getLockInfo(tokenId);
        address owner = nftContract.ownerOf(tokenId);

        // 判断是否已解锁
        bool unlocked = info.isUnlocked || block.timestamp >= info.unlockTimestamp;

        // 获取代币信息
        (string memory tokenName, string memory tokenSymbol, uint8 decimals) = _getTokenInfo(info.tokenAddress);

        // 构建JSON
        string memory json = _buildJson(tokenId, info, owner, unlocked, tokenName, tokenSymbol, decimals);

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    /// @dev 构建完整的JSON元数据
    function _buildJson(
        uint256 tokenId,
        IHodlockNFT.LockInfo memory info,
        address owner,
        bool unlocked,
        string memory tokenName,
        string memory tokenSymbol,
        uint8 decimals
    ) internal pure returns (string memory) {
        string memory imageUrl = unlocked
            ? string(abi.encodePacked("ipfs://", TROPHY_CID))
            : string(abi.encodePacked("ipfs://", HOURGLASS_CID));

        string memory status = unlocked ? "Unlocked" : "Locked";
        string memory transferable = unlocked ? "true" : "false";

        // 格式化金额
        string memory formattedAmount = _formatAmount(info.amount, decimals);

        return string(abi.encodePacked(
            '{"name":"Hodlock Certificate #', tokenId.toString(), '",',
            '"description":"A certificate representing a locked token deposit in Hodlock protocol.",',
            '"image":"', imageUrl, '",',
            '"external_url":"https://hodlock.io",',
            _buildAttributes(info, owner, status, transferable, tokenName, tokenSymbol, formattedAmount),
            '}'
        ));
    }

    /// @dev 构建attributes数组
    function _buildAttributes(
        IHodlockNFT.LockInfo memory info,
        address owner,
        string memory status,
        string memory transferable,
        string memory tokenName,
        string memory tokenSymbol,
        string memory formattedAmount
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '"attributes":[',
            '{"trait_type":"Status","value":"', status, '"},',
            '{"trait_type":"Transferable","value":"', transferable, '"},',
            '{"trait_type":"Token","value":"', tokenSymbol, '"},',
            '{"trait_type":"Token Name","value":"', tokenName, '"},',
            '{"trait_type":"Token Address","value":"', _addressToString(info.tokenAddress), '"},',
            _buildAttributesPart2(info, owner, formattedAmount),
            ']'
        ));
    }

    /// @dev 构建attributes数组第二部分
    function _buildAttributesPart2(
        IHodlockNFT.LockInfo memory info,
        address owner,
        string memory formattedAmount
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"trait_type":"Amount","value":"', formattedAmount, '"},',
            '{"display_type":"date","trait_type":"Deposit Time","value":', info.depositTimestamp.toString(), '},',
            '{"display_type":"date","trait_type":"Unlock Time","value":', info.unlockTimestamp.toString(), '},',
            '{"trait_type":"Penalty Rate","value":"', (info.penaltyBps / 100).toString(), '%"},',
            '{"trait_type":"Hodlock Contract","value":"', _addressToString(info.hodlockContract), '"},',
            '{"trait_type":"Deposit ID","value":"', info.depositId.toString(), '"},',
            '{"trait_type":"Owner","value":"', _addressToString(owner), '"}'
        ));
    }

    /// @dev 获取代币信息
    function _getTokenInfo(address tokenAddress) internal view returns (string memory name, string memory symbol, uint8 decimals) {
        try IERC20Metadata(tokenAddress).name() returns (string memory n) {
            name = n;
        } catch {
            name = "Unknown";
        }

        try IERC20Metadata(tokenAddress).symbol() returns (string memory s) {
            symbol = s;
        } catch {
            symbol = "???";
        }

        try IERC20Metadata(tokenAddress).decimals() returns (uint8 d) {
            decimals = d;
        } catch {
            decimals = 18;
        }
    }

    /// @dev 格式化金额（简化版，显示整数部分）
    function _formatAmount(uint256 amount, uint8 decimals) internal pure returns (string memory) {
        if (decimals == 0) {
            return amount.toString();
        }

        uint256 divisor = 10 ** decimals;
        uint256 integerPart = amount / divisor;
        uint256 fractionalPart = amount % divisor;

        if (fractionalPart == 0) {
            return integerPart.toString();
        }

        // 显示最多4位小数
        uint256 displayDecimals = decimals > 4 ? 4 : decimals;
        uint256 fractionalDivisor = 10 ** (decimals - displayDecimals);
        uint256 displayFractional = fractionalPart / fractionalDivisor;

        // 移除尾部的0
        while (displayFractional > 0 && displayFractional % 10 == 0) {
            displayFractional /= 10;
        }

        if (displayFractional == 0) {
            return integerPart.toString();
        }

        return string(abi.encodePacked(integerPart.toString(), ".", displayFractional.toString()));
    }

    /// @dev 地址转字符串
    function _addressToString(address addr) internal pure returns (string memory) {
        return Strings.toHexString(uint160(addr), 20);
    }
}
