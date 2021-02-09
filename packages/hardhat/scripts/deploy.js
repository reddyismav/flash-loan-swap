/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const { erc20Abi } = require("./abi");

const main = async () => {
  console.log("\n\n 📡 Deploying...\n");

  const LevAave = await deploy("LevAave", [
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
  ]); // <-- add in constructor args like line 16 vvvv
  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])

  /*

  //If you want to send some ETH to a contract on deploy (make your constructor payable!)

  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*

  //If you want to send value to an address from the deployer
*/

  const deployerWallet = ethers.provider.getSigner();
  const deployerAddress = await deployerWallet.getAddress();
  await deployerWallet.sendTransaction({
    to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    value: ethers.utils.parseEther("100"),
  });
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"],
  });
  const signerDai = await ethers.provider.getSigner(
    "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"
  );
  const dai = new ethers.Contract(
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    erc20Abi,
    signerDai
  );
  await dai.transferFrom(
    "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    deployerAddress,
    ethers.utils.parseUnits("10000")
  );
  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: ["0xF3Ae3bBdeB2fB7F9C32FbB1F4fbDAF1150a1c5Ce"],
  });
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8"],
  });
  const signerUni = await ethers.provider.getSigner(
    "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8"
  );
  const uni = new ethers.Contract(
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    erc20Abi,
    signerUni
  );
  await uni.transferFrom(
    "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
    deployerAddress,
    ethers.utils.parseUnits("5000")
  );

  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );
};

const deploy = async (contractName, _args = [], overrides = {}) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName);
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  console.log(
    " 📄",
    chalk.cyan(contractName),
    "deployed to:",
    chalk.magenta(deployed.address)
  );

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  return deployed;
};

// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (
    !contractArgs ||
    !deployed ||
    !R.hasPath(["interface", "deploy"], deployed)
  ) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(
    deployed.interface.deploy.inputs,
    contractArgs
  );
  return encoded;
};

// checks if it is a Solidity file
const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 &&
  fileName.indexOf(".swp") < 0 &&
  fileName.indexOf(".swap") < 0;

const readArgsFile = (contractName) => {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (!fs.existsSync(argsFile)) return args;
    args = JSON.parse(fs.readFileSync(argsFile));
  } catch (e) {
    console.log(e);
  }
  return args;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
