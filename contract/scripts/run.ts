import { ethers } from "hardhat";
const main = async () => {
  const echoContractFactory = await ethers.getContractFactory("EthEcho");
  const echoContract = await echoContractFactory.deploy();

  const deployedContractAddress = await echoContract.getAddress();
  console.log("Contract added to:", deployedContractAddress);

  /**
   * Echoを送る
   */
  let echoTxn = await echoContract.writeEcho("A message!");
  await echoTxn.wait(); // トランザクションが承認されるのを待つ（テスト:1回目）

  const [_, randomPerson] = await ethers.getSigners();
  echoTxn = await echoContract
    .connect(randomPerson)
    .writeEcho("Another message!");
  await echoTxn.wait(); // トランザクションが承認されるのを待つ（テスト:2回目）

  let latestEcho = await echoContract.getLatestEcho();
  console.log(latestEcho);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
