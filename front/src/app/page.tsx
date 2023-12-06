"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/EthEcho.json";

const Home: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [echoValue, setEchoValue] = useState<string>("");
  console.log("currentAccount: ", currentAccount);
  const contractAddress = "0xeA02f9dfb233416134D81227E681790BFe197b78";
  const contractABI = abi.abi;
  const [allEchoes, setAllEchoes] = useState<
    { address: any; timestamp: Date; message: any }[]
  >([]);

  const getAllEchoes = async () => {
    const { ethereum } = window as any;

    try {
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = provider.getSigner();
        const EthEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          await signer
        );
        /* コントラクトからgetAllEchoesメソッドを呼び出す */
        const echoes = await EthEchoContract.getAllEchoes();
        /* UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定 */
        const echoesCleaned = echoes.map(
          (sendEcho: { echoSender: any; timestamp: number; message: any }) => {
            return {
              address: sendEcho.echoSender,
              timestamp: new Date(sendEcho.timestamp * 1000),
              message: sendEcho.message,
            };
          }
        );

        /* React Stateにデータを格納する */
        setAllEchoes(echoesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * `emit`されたイベントに反応する
   */
  useEffect(() => {
    let EthEchoContract: ethers.Contract;

    const onNewEcho = (from: any, timestamp: number, message: any) => {
      console.log("NewEcho", from, timestamp, message);
      setAllEchoes((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    const setupContract = async () => {
      /* NewEchoイベントがコントラクトから発信されたときに、情報を受け取ります */
      if ((window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        EthEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        EthEchoContract.on("New", onNewEcho);
      }
    };

    const cleanupContract = () => {
      /*メモリリークを防ぐために、NewEchoのイベントを解除します*/
      if (EthEchoContract) {
        EthEchoContract.off("NewEcho", onNewEcho);
      }
    };

    setupContract();

    return cleanupContract;
  }, [contractABI]);

  // window.ethereumにアクセスできることを確認する
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      // ユーザーのウォレットへのアクセスが許可されているかどうかを確認する
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const sendEcho = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = provider.getSigner();
        /* ABIを参照 */
        const EthEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          await signer
        );
        let count = await EthEchoContract.getTotalEchoes();
        console.log("Retrieved total Echo count...", count.toNumber());
        console.log("Signer:", signer);
        /* let contractBalance = await provider.getBalance(
          EthEchoContract.address as unknown as string
        );
        console.log("Contract balance:", ethers.formatEther(contractBalance));*/
        /* コントラクトにEchoを書き込む */
        const EchoTxn = await EthEchoContract.sendEcho();
        console.log("Mining...", EchoTxn.hash);
        await EchoTxn.wait();
        console.log("Mined -- ", EchoTxn.hash);
        count = await EthEchoContract.getTotalEchoes();
        console.log("Retrieved total Echo count...", count.toNumber());
        /*let contractBalance_post = await provider.getBalance(
          EthEchoContract.address as unknown as string
        ); */
        /*console.log("Contract balance:", ethers.formatEther(contractBalance));
        /* コントラクトの残高が減っていることを確認 */
        /* if (contractBalance_post < contractBalance) {
          /* 減っていたら下記を出力 */
        /*console.log("User won ETH!");*/
        /*} else {
          console.log("User didn't win ETH.");
        }
        console.log(
          "Contract balance after Echo:",
          ethers.formatEther(contractBalance_post)
        );*/
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // WEBページがロードされたときに下記の関数を実行する
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

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

        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <div className="mt-8">
                {/* Echoボックスを実装*/}
                {currentAccount && (
                  <textarea
                    placeholder="メッセージはこちら"
                    name="echoArea"
                    id="echo"
                    value={echoValue}
                    onChange={(e) => setEchoValue(e.target.value)}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
