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
    * Echoという構造体を作成。
    * 構造体の中身は、カスタマイズすることができます。
    */
    struct Echo {
        address echoSender; // を送ったユーザーのアドレス
        string message; // ユーザーが送ったメッセージ
        uint256 timestamp; // ユーザーがEchoを送った瞬間のタイムスタンプ

    }
    /*
    * 構造体の配列を格納するための変数echoesを宣言。
    * これで、ユーザーが送ってきたすべてのEchoを保持することができます。
    */
    Echo[] private _echoes;

    constructor() {
        console.log("EthEcho - Smart Contract!");
    }

    /*
    * _messageという文字列を要求するようにecho関数を更新。
    * _messageは、ユーザーがフロントエンドから送信するメッセージです。
    */
    function writeEcho(string memory _message) public {
        _totalEchoes += 1;
        console.log("%s echoed w/ message %s", msg.sender, _message);

        /*
         * Echoとメッセージを配列に格納。
         */
        _echoes.push(Echo(msg.sender, _message, block.timestamp));

        /*
         * コントラクト側でemitされたイベントに関する通知をフロントエンドで取得できるようにする。
         */
        emit NewEcho(msg.sender, block.timestamp, _message);
    }

    /*
     * 構造体配列のechoesを返してくれるgetAllEchoesという関数を追加。
     * これで、私たちのWEBアプリからechoesを取得することができます。
     */
    function getAllEchoes() public view returns (Echo[] memory) {
        return _echoes;
    }

    function getTotalEchoes() public view returns (uint256) {
        // コントラクトが出力する値をコンソールログで表示する。
        console.log("We have %d total echoes!", _totalEchoes);
        return _totalEchoes;
    }
}
