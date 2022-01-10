//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IOpenSea {
    function cancelOrder_ (
        address[7] memory addrs,
        uint[9] memory uints,
        uint8 feeMethod,
        uint8 side,
        uint8 saleKind,
        uint8 howToCall,
        bytes calldata,
        bytes memory replacementPattern,
        bytes memory staticExtradata,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external; 
    
    function approveOrder_ (
        address[7] memory addrs,
        uint[9] memory uints,
        uint8 feeMethod,
        uint8 side,
        uint8 saleKind,
        uint8 howToCall,
        bytes calldata,
        bytes memory replacementPattern,
        bytes memory staticExtradata,
        bool orderbookInclusionDesired
    ) external;
}

interface IERC720 {
    function ownerOf(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

contract JenieBatchCanceller is Ownable {
    // mainnet
    // address public constant OPENSEA = 0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b;
    // address public constant RARIBLE = 0x9757F2d2b135150BBeb65308D4a91804107cd8D6;
    // rinkeby
    address public constant OPENSEA = 0x5206e78b21Ce315ce284FB24cf05e0585A93B1d9;
    // address public constant RARIBLE = 0xd4a57a3bD3657D0d46B4C5bAC12b3F156B9B886b;
    
    // cancel order for opensea
    struct OpenSeaCancelOrder {
        address[7] addrs;
        uint[9] uints;
        uint8 feeMethod;
        uint8 side;
        uint8 saleKind;
        uint8 howToCall;
        bytes calldataOrder;
        bytes replacementPattern;
        bytes staticExtradata;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }
    
    // listing details for opensea
    struct OpenSeaListing {
        address[7] addrs;
        uint[9] uints;
        uint8 feeMethod;
        uint8 side;
        uint8 saleKind;
        uint8 howToCall;
        bytes calldataListing;
        bytes replacementPattern;
        bytes staticExtradata;
        bool orderbookInclusionDesired;
    }

    // can generate OpenSeaListing from this input
    struct ListingInput {
        address tokenAddress;
        uint256 tokenId;
        uint256 priceInWei;
    }
    
    struct ExchangeDetails {
        address exchange;
        bool isActive;
    }
    
    // calldata supplies data for cancel order function relative to exchangeid
    struct CancelInstruction {
        uint256 exchangeId;
        bytes cancelCalldata;
    }
    
    ExchangeDetails[] public exchanges;
    
    constructor() Ownable() {}
    
    function addExchange(address exchange) external onlyOwner {
        exchanges.push(ExchangeDetails(exchange, true));
    }
    
    function updateExchange(uint256 exchangeId, address _exchange, bool _isActive) external onlyOwner {
        exchanges[exchangeId] = ExchangeDetails(_exchange, _isActive);
    }
    
    // allows you to bulk cancel orders given exchange exists
    function generalBatchCanceller(CancelInstruction[] memory instructions, bool revertIfFailure) external {
        for (uint i = 0; i < instructions.length; i++) {
            require(exchanges[instructions[i].exchangeId].isActive, "Exchange is not active");
            _generalCancelOrder(instructions[i], revertIfFailure);
        }
    }

    // allows you to batch list order supplying ListingInput
    // generates OpenSeaListing and calls
    // obvious but only for opensesa
    function listOrders(ListingInput[] memory tokenListings, bool revertIfFailure) external {
        OpenSeaListing[] memory listings = new OpenSeaListing[](tokenListings.length);
        
        for (uint i = 0; i < tokenListings.length; i++) {
            address tokenAddress = tokenListings[i].tokenAddress;
            uint256 tokenId = tokenListings[i].tokenId;
            uint256 priceInWei = tokenListings[i].priceInWei;

            IERC720 t = IERC720(tokenAddress);
            require(msg.sender == t.ownerOf(tokenId), "Not the owner");
            require(t.isApprovedForAll(msg.sender, address(this)), "Need to approve Jenie");

            address[7] memory addrs = [OPENSEA, address(this), address(0), address(0x5b3256965e7C3cF26E11FCAf296DfC8807C01073), tokenAddress, address(0), address(0)];
            uint[9] memory uints = [250, 0, 0, 0, priceInWei, 0, block.timestamp, 0, uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)))];
            bytes memory transferCalldata = abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(0), tokenId);
            bytes memory replacementPattern = bytes(hex"000000000000000000000000000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000000000000000000000000000000000000000000000000000");

            OpenSeaListing memory listing = OpenSeaListing(addrs, uints, 1, 1, 0, 0, transferCalldata, replacementPattern, bytes(""), true);
            listings[i] = listing;
        }
        
        batchList(listings, revertIfFailure);
    }

    // batch list orders using OpenSeaListing
    // obvious but only for opensea
    function batchList(OpenSeaListing[] memory listings, bool revertIfFailure) public {
        for (uint i = 0; i < listings.length; i++) {
            _listOrder(listings[i], revertIfFailure);
        }
    }

    // batch cancel opensea orders supply OpenSeaCancelOrder
    function batchCancel(OpenSeaCancelOrder[] memory orders, bool revertIfFailure) external {
        for (uint i = 0; i < orders.length; i++) {
            _cancelOrder(orders[i], revertIfFailure);
        }
    }
    
    function _generalCancelOrder(CancelInstruction memory instruction, bool revertIfFailure) internal {
        (bool success, ) = exchanges[instruction.exchangeId].exchange.call(instruction.cancelCalldata);
        if (!success && revertIfFailure) {
            assembly {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
    }
    
    function _listOrder(OpenSeaListing memory listing, bool revertIfFailure) internal {
        bytes memory _data = abi.encodeWithSelector(IOpenSea.approveOrder_.selector, listing.addrs, listing.uints, listing.feeMethod, listing.side, listing.saleKind, listing.howToCall, listing.calldataListing, listing.replacementPattern, listing.staticExtradata);
        (bool success, ) = OPENSEA.call(_data);
        if (!success && revertIfFailure) {
            assembly {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
    }

    function _cancelOrder(OpenSeaCancelOrder memory order, bool revertIfFailure) internal {
        require(order.addrs[1] == address(this), "Maker is not Jenie");
        bytes memory _data = abi.encodeWithSelector(IOpenSea.cancelOrder_.selector, order.addrs, order.uints, order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldataOrder, order.replacementPattern, order.staticExtradata, order.v, order.r, order.s);
        (bool success, ) = OPENSEA.call(_data);
        if (!success && revertIfFailure) {
            assembly {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
    }
}