const hre = require("hardhat");

const main = async () => {
  const echoContractFactory = await hre.ethers.getContractFactory("EthEcho");
  const echoContract = await echoContractFactory.deploy();
  const EthEcho = await echoContract.waitForDeployment();

  const address = await EthEcho.getAddress();
  console.log("EthEcho address: ", address);
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
