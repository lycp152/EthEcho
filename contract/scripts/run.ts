//deploy.tsと重複箇所は関数の頭にaltがついている、使用前に削除すること

//重複のためコメントアウト
//const hre = require("hardhat");
const altmain = async () => {
  const echoContractFactory = await hre.ethers.getContractFactory("EthEcho");
  const echoContract = await echoContractFactory.deploy();
  let address = await echoContract.getAddress();
  console.log("Contract added to:", address);

  let echoCount;
  echoCount = await echoContract.getTotalEchoes();
  console.log(echoCount.toNumber);

  /**
   * Echoを送る
   */
  let echoTxn = await echoContract.writeEcho("A message!");
  await echoTxn.wait(); // トランザクションが承認されるのを待つ（テスト:1回目）

  const [_, randomPerson] = await hre.ethers.getSigners();
  echoTxn = await echoContract
    .connect(randomPerson)
    .writeEcho("Another message!");
  await echoTxn.wait(); // トランザクションが承認されるのを待つ（テスト:2回目）

  let allEchoes = await echoContract.getAllEchoes();
  console.log(allEchoes);
};

const altrunMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
