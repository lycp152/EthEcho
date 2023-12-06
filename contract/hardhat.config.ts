import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_SEPOLIA_ACCOUNT_KEY],
    },
  },
};
