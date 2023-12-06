const { ethers } = require("ethers");
const hre = require("hardhat");

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const accountBalance = await deployer.provider.getBalance(deployer.address);
  const echoContractFactory = await hre.ethers.getContractFactory("EthEcho");
  const echoContract = await echoContractFactory.deploy();
  const echoPortal = await echoContract.waitForDeployment();

  console.log("Deploying contracts with account: ", deployerAddress);
  console.log("Account balance: ", accountBalance.toString());
  const echoPortalAddress = await echoPortal.getAddress();
  console.log("Contract deployed to: ", echoPortalAddress);
  console.log("Contract deployed by: ", deployerAddress);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
