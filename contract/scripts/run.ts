const hre = require("hardhat");
const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const echoContractFactory = await hre.ethers.getContractFactory("EthEcho");
  const echoContract = await echoContractFactory.deploy();
  const ethEcho = await echoContract.waitForDeployment();

  const address = await ethEcho.getAddress();
  console.log("Contract deployed to:", address);
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
