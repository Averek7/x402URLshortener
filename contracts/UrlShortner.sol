// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract UrlShortner {
    address public owner;
    address public facilitator;

    struct UrlEntry {
        string longUrl;
        uint64 ts;
        address creator;
    }

    mapping(bytes6 => UrlEntry) public urls;

    event Shortened(
        bytes6 indexed code,
        string originalUrl,
        address indexed facilitator,
        uint256 timestamp
    );

    error NotOwner();
    error NotFacilitator();
    error CodeAlreadyExists();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    modifier onlyFacilitator() {
        if (msg.sender != facilitator) revert NotFacilitator();
        _;
    }

    constructor(address _facilitator) {
        owner = msg.sender;
        facilitator = _facilitator;
    }

    function setFacilitator(address _facilitator) external onlyOwner {
        facilitator = _facilitator;
    }
    
    function storeShortUrl(
        bytes6 code,
        string calldata longUrl
    ) external onlyFacilitator {
        // check if longUrl already exists (URLEntry.longUrl)
        if (bytes(urls[code].longUrl).length != 0) revert CodeAlreadyExists();
        urls[code] = UrlEntry({
            longUrl: longUrl,
            ts: uint64(block.timestamp),
            creator: msg.sender
        });
        emit Shortened(code, longUrl, msg.sender, block.timestamp);
    }

    function resolve(bytes6 code) external view returns (string memory) {
        if (bytes(urls[code].longUrl).length == 0) return "";
        return urls[code].longUrl;
    }

    function info(
        bytes6 code
    ) external view returns (string memory, uint64, address) {
        UrlEntry storage e = urls[code];
        return (e.longUrl, e.ts, e.creator);
    }
}
