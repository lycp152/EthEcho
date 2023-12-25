// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract EthEcho {

    uint256 private _totalEchoes;
    /*
    * NewEchoイベントの作成
    */
    event NewEcho(address indexed from, uint256 timestamp, string message);

    /*
     * ユーザーが送信したEchoの情報
     */
    struct Echo {
        address echoer; // Echoを送ったユーザーのアドレス
        string message; // ユーザーが送ったメッセージ
        uint256 timestamp; // ユーザーがEchoを送った瞬間のタイムスタンプ
    }

    /*
     * ユーザーが送ってきた最新のEchoを保持する
     */
    Echo private _latestEcho;

    constructor() {
        console.log("EthEcho - Smart Contract!");
    }

    /*
     * _messageという文字列を要求する
     * _messageは、ユーザーがフロントエンドから送信するメッセージ
     */
    function writeEcho(string memory _message) public {
        _totalEchoes += 1;
        console.log("%s echoed w/ message %s", msg.sender, _message);

        /*
         * Echoとメッセージを格納する
         */
        _latestEcho = Echo(msg.sender, _message, block.timestamp);

        /*
         * コントラクト側でemitされたイベントに関する通知をフロントエンドで取得する
         */
        emit NewEcho(msg.sender, block.timestamp, _message);
    }

    function getLatestEcho() public view returns (Echo memory) {
        return _latestEcho;
    }

    function getTotalEchoes() public view returns (uint256) {
        console.log("We have %d total echoes!", _totalEchoes);
        return _totalEchoes;
    }
}
