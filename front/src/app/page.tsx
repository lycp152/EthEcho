"use client";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

/* ABIファイルを含むEthEcho.jsonファイルをインポートする */
import abi from "./utils/EthEcho.json";

interface Echo {
  address: string;
  timestamp: Date;
  message: string;
}

/* ボタンのスタイルをまとめた変数 */
const buttonStyle =
  "flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/* 履歴の詳細を表示するコンポーネント */
interface EchoDetailsProps {
  title: string;
  value: string;
}

const EchoDetails: React.FC<EchoDetailsProps> = ({ title, value }) => (
  <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
    <div>
      <p className="font-semibold">{title}</p>
      <p>{value}</p>
    </div>
  </div>
);

export default function Home() {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数 */
  const [currentAccount, setCurrentAccount] = useState<string>("");
  console.log("currentAccount: ", currentAccount);
  /* ユーザーのメッセージを保存するために使用する状態変数 */
  const [messageValue, setMessageValue] = useState<string>("");
  const [latestEcho, setLatestEcho] = useState<Echo | null>(null);

  /* デプロイされたコントラクトのアドレスを保持する変数 */
  const contractAddress = "0x225C42e7084053Da21541EAa7cf233bDAd3BF194";
  /* ABIの内容を参照する変数 */
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    /* window.ethereumにアクセスできることを確認する */
    /* 'ethereum' プロパティの型情報がないため any を使用する */
    const { ethereum } = window as any;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    /* ユーザーのウォレットへのアクセスが許可されているか確認する */
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      /* ユーザーが認証可能なウォレットアドレスを持っているか確認する */
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /* 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める
       * 許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する */
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /* ABIを読み込み、コントラクトにEchoを書き込む */
  const writeEcho = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        /* ABIを参照する */
        const ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await ethEchoContract.getTotalEchoes();
        console.log("Retrieved total echo count...", Number(count));
        /* コントラクトにEchoを書き込む */
        const echoTxn = await ethEchoContract.writeEcho(messageValue, {
          gasLimit: 300000,
        });
        console.log("Mining...", echoTxn.hash);
        await echoTxn.wait();
        console.log("Mined -- ", echoTxn.hash);
        count = await ethEchoContract.getTotalEchoes();
        console.log("Retrieved total echo count...", Number(count));
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLatestEcho = async () => {
    const { ethereum } = window as any;
    try {
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /* コントラクトからgetLatestEchoメソッドを呼び出す */
        const echo = await ethEchoContract.getLatestEcho();

        /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定する */
        const newLatestEcho: Echo = {
          address: echo.echoer,
          timestamp: new Date(Number(echo.timestamp) * 1000),
          message: echo.message,
        };

        /* React Stateにデータを格納する */
        setLatestEcho(newLatestEcho);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      checkIfWalletIsConnected();
      let ethEchoContract: ethers.Contract;

      const onNewEcho = (from: string, timestamp: number, message: string) => {
        console.log("NewEcho", from, timestamp, message);
      };

      /* NewEchoイベントがコントラクトから発信されたときに、情報を受け取る */
      if ((window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        ethEchoContract.on("NewEcho", onNewEcho);
      }

      /* メモリリークを防ぐために、NewEchoのイベントを解除する */
      return () => {
        if (ethEchoContract) {
          ethEchoContract.off("NewEcho", onNewEcho);
        }
      };
    })();
  }, [contractAddress, contractABI]);

  const isExistLogs = currentAccount && latestEcho;

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* ヘッダー */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white-900">
          EthEcho🏔️
        </h1>
        <div className="bio mt-2 mb-8">
          イーサリアムウォレットを接続して、メッセージを作成。あなたのメッセージをチェーンに響かせましょう！
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        <div>
          {/* メッセージボックス */}
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

        {/* ウォレットを接続するボタン */}
        {!currentAccount && (
          <button
            onClick={connectWallet}
            type="button"
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
          >
            Connect Wallet
          </button>
        )}
        {/* ウォレット接続済みのボタン */}
        {currentAccount && (
          <button
            disabled={true}
            title="Wallet Connected"
            className={`${buttonStyle} bg-indigo-900 text-white cursor-not-allowed`}
          >
            Wallet Connected
          </button>
        )}
        {/* コントラクトに書き込むボタン */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
            onClick={writeEcho}
          >
            Echo🏔️
          </button>
        )}
        {/* 最新の書き込みを読み込むボタン */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 mt-6`}
            onClick={getLatestEcho}
          >
            Load Latest Echo🏔️
          </button>
        )}
        {/* 履歴を表示する */}
        {isExistLogs && (
          <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
            <div>
              <EchoDetails title="Address" value={latestEcho.address} />
              <EchoDetails
                title="Time🦴🐕💨"
                value={latestEcho.timestamp.toString()}
              />
              <EchoDetails title="Message" value={latestEcho.message} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
