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
        address originalOwner;
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

    struct RenderData {
        string tokenName;
        string tokenSymbol;
        string formattedAmount;
        string status;
        string transferable;
        string imageUrl;
        uint256 lockDays;
    }

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

        RenderData memory data = _prepareRenderData(info);
        string memory json = _buildJson(tokenId, info, owner, data);

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    /// @dev 准备渲染数据
    function _prepareRenderData(IHodlockNFT.LockInfo memory info) internal view returns (RenderData memory data) {
        bool unlocked = block.timestamp >= info.unlockTimestamp;

        (data.tokenName, data.tokenSymbol, ) = _getTokenInfo(info.tokenAddress);
        (, , uint8 decimals) = _getTokenInfo(info.tokenAddress);

        data.formattedAmount = _formatAmount(info.amount, decimals);
        data.status = unlocked ? "Unlocked" : "Locked";
        data.transferable = unlocked ? "true" : "false";
        data.imageUrl = unlocked
            ? string(abi.encodePacked("ipfs://", TROPHY_CID))
            : string(abi.encodePacked("ipfs://", HOURGLASS_CID));
        data.lockDays = (info.unlockTimestamp - info.depositTimestamp) / 1 days;
    }

    /// @dev 构建完整的JSON元数据
    function _buildJson(
        uint256 tokenId,
        IHodlockNFT.LockInfo memory info,
        address owner,
        RenderData memory data
    ) internal pure returns (string memory) {
        string memory description = string(abi.encodePacked(
            "A certificate representing a locked token deposit in Hodlock protocol. ",
            "This NFT represents ", data.formattedAmount, " ", data.tokenSymbol,
            " locked for ", data.lockDays.toString(), " days."
        ));

        return string(abi.encodePacked(
            '{"name":"Hodlock Certificate #', tokenId.toString(), '",',
            '"description":"', description, '",',
            '"image":"', data.imageUrl, '",',
            '"external_url":"https://hodlock.io",',
            _buildAttributes(info, owner, data),
            '}'
        ));
    }

    /// @dev 构建attributes数组
    function _buildAttributes(
        IHodlockNFT.LockInfo memory info,
        address owner,
        RenderData memory data
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '"attributes":[',
            '{"trait_type":"Status","value":"', data.status, '"},',
            '{"trait_type":"Transferable","value":"', data.transferable, '"},',
            '{"trait_type":"Token","value":"', data.tokenSymbol, '"},',
            '{"trait_type":"Token Name","value":"', data.tokenName, '"},',
            '{"trait_type":"Token Address","value":"', _addressToString(info.tokenAddress), '"},',
            _buildAttributesPart2(info, owner, data.formattedAmount),
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
            '{"trait_type":"Penalty Rate","value":"', _formatPenalty(info.penaltyBps), '"},',
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

    /// @dev 格式化罚金比例 (bps to percentage string)
    function _formatPenalty(uint256 penaltyBps) internal pure returns (string memory) {
        uint256 integerPart = penaltyBps / 100;
        uint256 fractionalPart = penaltyBps % 100;

        if (fractionalPart == 0) {
            return string(abi.encodePacked(integerPart.toString(), "%"));
        }

        string memory fractionalStr = fractionalPart < 10
            ? string(abi.encodePacked("0", fractionalPart.toString()))
            : fractionalPart.toString();

        // 移除尾部0
        if (fractionalPart % 10 == 0) {
            fractionalStr = (fractionalPart / 10).toString();
        }

        return string(abi.encodePacked(integerPart.toString(), ".", fractionalStr, "%"));
    }
}
