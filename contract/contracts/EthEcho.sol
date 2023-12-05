// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract EthEcho {
    uint256 totalEchos;
    uint256 private seed;

    event NewEcho(address indexed from, uint256 timestamp, string message);

    struct Echo {
        address Echor;
        string message;
        uint256 timestamp;
    }

    Echo[] Echos;

    /*
     * "address => uint mapping"は、アドレスと数値を関連付ける
     */
    mapping(address => uint256) public lastEchodAt;

    constructor() payable {
        console.log("We have been constructed!");
        /*
         * 初期シードの設定
         */
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function Echo(string memory _message) public {
        /*
         * 現在ユーザーがEchoを送信している時刻と、前回Echoを送信した時刻が15分以上離れていることを確認。
         */
        // require(
        //     lastEchodAt[msg.sender] + 15 minutes < block.timestamp,
        //     "Wait 15m"
        // );

        /*
         * ユーザーの現在のタイムスタンプを更新する
         */
        lastEchodAt[msg.sender] = block.timestamp;

        totalEchos += 1;
        console.log("%s has Echod!", msg.sender);

        Echos.push(Echo(msg.sender, _message, block.timestamp));

        /*
         *  ユーザーのために乱数を設定
         */
        seed = (block.difficulty + block.timestamp + seed) % 100;

        if (seed <= 50) {
            console.log("%s won!", msg.sender);

            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than they contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewEcho(msg.sender, block.timestamp, _message);
    }

    function getAllEchos() public view returns (Echo[] memory) {
        return Echos;
    }

    function getTotalEchos() public view returns (uint256) {
        return totalEchos;
    }
}
