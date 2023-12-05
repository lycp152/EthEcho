//deploy.tsと重複箇所はは定数の頭にAltがついている、使用前に削除すること

//重複のためコメントアウト
//const hre = require("hardhat");
const Altmain = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const echoContractFactory = await hre.ethers.getContractFactory("EthEcho");
  const echoContract = await echoContractFactory.deploy();
  const ethEcho = await echoContract.waitForDeployment();

  let address = await ethEcho.getAddress();
  console.log("Contract deployed to:", address);
  address = await owner.getAddress();
  console.log("Contract deployed by:", owner.address);

  let echoCount;
  echoCount = await echoContract.getTotalEchoes();

  let echoTxn = await echoContract.echoMessage();
  await echoTxn.wait();

  echoCount = await echoContract.getTotalEchoes();

  echoTxn = await echoContract.connect(randomPerson).echoMessage();
  await echoTxn.wait();

  echoCount = await echoContract.getTotalEchoes();
};

const AltrunMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
