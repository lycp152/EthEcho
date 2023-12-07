"use client";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

/* ABIファイルを含むEthEcho.jsonファイルをインポートする*/
import abi from "./utils/EthEcho.json";

/* イベントの詳細を表示するコンポーネント */
interface EventDetailsProps {
  title: string;
  value: string;
}
const EventDetails: React.FC<EventDetailsProps> = ({ title, value }) => (
  <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
    <div>
      <p className="font-semibold">{title}</p>
      <p>{value}</p>
    </div>
  </div>
);

/* ボタンのスタイルをまとめた変数 */
const buttonStyle =
  "flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const Home: React.FC = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数*/
  const [currentAccount, setCurrentAccount] = useState<string>("");
  /* ユーザーのメッセージを保存するために使用する状態変数 */
  const [messageValue, setMessageValue] = useState<string>("");
  /* 最新のEchoを保存する状態変数 */
  const [latestEcho, setLatestEcho] = useState<{
    address: any;
    timestamp: Date;
    message: any;
  } | null>(null);

  console.log("currentAccount: ", currentAccount);
  /* デプロイされたコントラクトのアドレスを保持する変数 */
  const contractAddress = "0x97c61078D81eAA18E779C3d1F5eAfdA9e027e491";
  /* ABIの内容を参照する変数 */
  const contractABI = abi.abi;

  /**
   * `emit`されたイベントをフロントエンドに反映させる
   */
  useEffect(() => {
    let ethEchoContract: ethers.Contract;

    const onNewEcho = (from: any, timestamp: number, message: any) => {
      console.log("NewEcho", from, timestamp, message);
      setLatestEcho({
        address: from,
        timestamp: new Date(Number(timestamp) * 1000),
        message: message,
      });
    };

    const setupContract = async () => {
      if (currentAccount === "" || !currentAccount) return;
      if ((window as any).ethereum) {
        /* NewEchoイベントがコントラクトから発信されたときに、情報をを受け取る */
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        /* イベントリスナーの設定
        何をしているか説明できるようにする */
        ethEchoContract.on("NewEcho", onNewEcho);
      }
    };
    const cleanupContract = () => {
      /*メモリリークを防ぐために、NewEchoのイベントを解除する*/
      if (ethEchoContract) {
        ethEchoContract.off("NewEcho", onNewEcho);
      }
    };

    setupContract();

    return cleanupContract;
  }, [contractABI, currentAccount]);

  /* ウォレットに接続する */
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

  /* コントラクトに書き込む */
  const writeEcho = async () => {
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
        const echoTxn = await ethEchoContract.writeEcho(messageValue, {
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
              className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
            >
              Connect Wallet
            </button>
          )}
          {currentAccount && (
            <button
              disabled={true}
              title="Wallet Connected"
              className={`${buttonStyle} bg-indigo-900 text-white cursor-not-allowed`}
            >
              Wallet Connected
            </button>
          )}
          {/* EchoボタンにwriteEcho関数を連動 */}
          {currentAccount && (
            <button
              className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
              onClick={writeEcho}
            >
              Echo🏔️
            </button>
          )}
          {/* Load Latest Echo ボタンに関数を連動 */}
          {currentAccount && (
            <button
              className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 mt-6`}
              //onClick={loadLatestEcho}
            >
              Load Latest Echo🏔️
            </button>
          )}
          {/* 履歴を表示する */}
          {currentAccount && latestEcho && (
            <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
              <div>
                <EventDetails title="Address" value={latestEcho.address} />
                <EventDetails
                  title="Time🦴🐕💨"
                  value={latestEcho.timestamp.toString()}
                />
                <EventDetails title="Message" value={latestEcho.message} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
