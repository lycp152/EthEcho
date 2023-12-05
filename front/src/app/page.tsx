"use client";
import React, { useState, ChangeEvent } from "react";
import { ethers } from "ethers";
import abi from "./utils/EthEcho.json";

const Home: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [echoValue, setEchoValue] = useState<string>("");
  const [allEchoes, setAllEchoes] = useState([]);
  console.log("currentAccount: ", currentAccount);
  const contractAddress = "";
  const contractABI = abi.abi;

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
        let contractBalance = await provider.getBalance(
          EthEchoContract.address as unknown as string
        );
        console.log("Contract balance:", ethers.formatEther(contractBalance));
        /* コントラクトにEchoを書き込む */
        const EchoTxn = await EthEchoContract.Echo(echoValue, {
          gasLimit: 300000,
        });
        console.log("Mining...", EchoTxn.hash);
        await EchoTxn.wait();
        console.log("Mined -- ", EchoTxn.hash);
        count = await EthEchoContract.getTotalEchoes();
        console.log("Retrieved total Echo count...", count.toNumber());
        let contractBalance_post = await provider.getBalance(
          EthEchoContract.address as unknown as string
        );
        console.log("Contract balance:", ethers.formatEther(contractBalance));
        /* コントラクトの残高が減っていることを確認 */
        if (contractBalance_post < contractBalance) {
          /* 減っていたら下記を出力 */
          console.log("User won ETH!");
        } else {
          console.log("User didn't win ETH.");
        }
        console.log(
          "Contract balance after Echo:",
          ethers.formatEther(contractBalance_post)
        );
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

        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <div className="mt-8">
                {/* Echoボックスを実装*/}
                {currentAccount && (
                  <textarea
                    placeholder="Echoはこちら"
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
