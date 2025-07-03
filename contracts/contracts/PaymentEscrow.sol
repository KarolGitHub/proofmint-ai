// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentEscrow
 * @dev Simple escrow contract for holding and releasing MATIC payments between payer and payee.
 */
contract PaymentEscrow is Ownable {
    struct Escrow {
        address payer;
        address payee;
        uint256 amount;
        bool isReleased;
        bool isRefunded;
    }

    uint256 public escrowCount;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId);

    /**
     * @dev Create a new escrow. Payer sends MATIC, payee is specified.
     */
    function createEscrow(address payee) external payable returns (uint256) {
        require(msg.value > 0, "No MATIC sent");
        require(payee != address(0), "Invalid payee");
        escrows[escrowCount] = Escrow({
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            isReleased: false,
            isRefunded: false
        });
        emit EscrowCreated(escrowCount, msg.sender, payee, msg.value);
        escrowCount++;
        return escrowCount - 1;
    }

    /**
     * @dev Release escrow to payee. Only owner (backend authority) can call.
     */
    function releaseEscrow(uint256 escrowId) external onlyOwner {
        Escrow storage e = escrows[escrowId];
        require(!e.isReleased, "Already released");
        require(!e.isRefunded, "Already refunded");
        require(e.amount > 0, "No funds");
        e.isReleased = true;
        (bool sent, ) = e.payee.call{value: e.amount}("");
        require(sent, "Failed to send MATIC");
        emit EscrowReleased(escrowId);
    }

    /**
     * @dev Refund escrow to payer. Only owner (backend authority) can call.
     */
    function refundEscrow(uint256 escrowId) external onlyOwner {
        Escrow storage e = escrows[escrowId];
        require(!e.isReleased, "Already released");
        require(!e.isRefunded, "Already refunded");
        require(e.amount > 0, "No funds");
        e.isRefunded = true;
        (bool sent, ) = e.payer.call{value: e.amount}("");
        require(sent, "Failed to refund MATIC");
        emit EscrowRefunded(escrowId);
    }

    /**
     * @dev Get escrow details.
     */
    function getEscrow(uint256 escrowId) external view returns (address payer, address payee, uint256 amount, bool isReleased, bool isRefunded) {
        Escrow storage e = escrows[escrowId];
        return (e.payer, e.payee, e.amount, e.isReleased, e.isRefunded);
    }
}