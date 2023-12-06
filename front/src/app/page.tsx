"use client";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

/* ABIファイルを含むEthEcho.jsonファイルをインポートする*/
import abi from "./utils/EthEcho.json";

const Home: React.FC = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義 */
  const [currentAccount, setCurrentAccount] = useState<string>("");
  /* ユーザーのメッセージを保存するために使用する状態変数を定義 */
  const [messageValue, setMessageValue] = useState<string>("");
  /* すべてのechoesを保存する状態変数を定義 */
  const [allEchoes, setAllEchoes] = useState<
    { address: any; timestamp: Date; message: any }[]
  >([]);

  console.log("currentAccount: ", currentAccount);
  /* デプロイされたコントラクトのアドレスを保持する変数を作成 */
  const contractAddress = "0xf0582a0aACDD920CF0861f0fF520B0230bCc20AC";
  /* コントラクトからすべてのechoesを取得するメソッドを作成 */
  /* ABIの内容を参照する変数を作成 */
  const contractABI = abi.abi;

  /**
   * `emit`されたイベントをフロントエンドに反映させる
   */
  useEffect(() => {
    let ethEchoContract: ethers.Contract;

    const onNewEcho = (from: any, timestamp: number, message: any) => {
      console.log("NewEcho", from, timestamp, message);
      setAllEchoes((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(Number(timestamp) * 1000),
          message: message,
        },
      ]);
    };

    const setupContract = async () => {
      if (currentAccount === "" || !currentAccount) return;
      if ((window as any).ethereum) {
        /* NewEchoイベントがコントラクトから発信されたときに、情報をを受け取ります */
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        ethEchoContract.on("NewEcho", onNewEcho);
      }
    };
    const cleanupContract = () => {
      /*メモリリークを防ぐために、NewEchoのイベントを解除します*/
      if (ethEchoContract) {
        ethEchoContract.off("NewEcho", onNewEcho);
      }
    };

    setupContract();

    return cleanupContract;
  }, [contractABI, currentAccount]);

  /* connectWalletメソッドを実装 */
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /* echoの回数をカウントする関数を実装 */
  const sendEcho = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = provider.getSigner();
        /* ABIを参照 */
        const ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          await signer
        );
        let count = await ethEchoContract.getTotalEchoes();
        console.log("Retrieved total echo count...", count.toNumber);
        /* コントラクトにEchoを書き込む */
        const echoTxn = await ethEchoContract.sendEcho(messageValue, {
          gasLimit: 300000,
        });
        console.log("Mining...", echoTxn.hash);
        await echoTxn.wait();
        console.log("Mined -- ", echoTxn.hash);
        count = await ethEchoContract.getTotalEchoes();
        console.log("Retrieved total echo count...", count.toNumber);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white-900">
            EthEcho🏔️
          </h1>
          <div className="bio mt-2">
            イーサリアムウォレットを接続して、メッセージを作成。あなたのメッセージをチェーンに響かせましょう！
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
          <div>
            <div className="mt-8">
              {/* メッセージボックスを実装 */}
              {currentAccount && (
                <textarea
                  placeholder="メッセージはこちら"
                  name="messageArea"
                  id="message"
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                />
              )}
            </div>
          </div>

          {/* ウォレットコネクトのボタンを実装 */}
          {!currentAccount && (
            <button
              onClick={connectWallet}
              type="button"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Connect Wallet
            </button>
          )}
          {currentAccount && (
            <button
              disabled={true}
              title="Wallet Connected"
              className="flex w-full justify-center rounded-md bg-indigo-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm cursor-not-allowed"
            >
              Wallet Connected
            </button>
          )}
          {/* EchoボタンにsendEcho関数を連動 */}
          {currentAccount && (
            <button
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={sendEcho}
            >
              Echo🏔️
            </button>
          )}
          {/* 履歴を表示する */}
          {currentAccount &&
            allEchoes
              .slice(0)
              .reverse()
              .map((sendEcho, index) => (
                <div
                  key={index}
                  className=" py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100"
                >
                  <div className="font-semibold">Address</div>
                  {sendEcho.address}
                  <div className="font-semibold">Time🦴🐕💨 </div>
                  {sendEcho.timestamp.toString()}
                  <div className="font-semibold">Message </div>
                  {sendEcho.message}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
