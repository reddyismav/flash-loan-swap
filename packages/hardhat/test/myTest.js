const { expect } = require("chai");
const { ethers } = require("hardhat");
const fetch = require("node-fetch");

let lendingPool;
let weth;
let aweth;
let usdc;
let dai;
let uniswap;
let usdcDebt;
let daiDebt;
let calldata;

describe("levaave", function () {
  before(async () => {
    this.timeout(120000);
    deployer = ethers.provider.getSigner(0);
    const Weth = await ethers.getContractFactory("WETH9");
    weth = Weth.attach("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    const AWeth = await ethers.getContractFactory("WETH9");
    aweth = AWeth.attach("0x030bA81f1c18d280636F32af80b9AAd02Cf0854e");
    const Usdc = await ethers.getContractFactory("WETH9");
    usdc = Usdc.attach("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    const Dai = await ethers.getContractFactory("WETH9");
    dai = Dai.attach("0x6B175474E89094C44Da98b954EedeAC495271d0F");
    usdcDebt = await ethers.getContractAt(
      "DebtTokenBase",
      "0x619beb58998eD2278e08620f97007e1116D5D25b"
    );
    daiDebt = await ethers.getContractAt(
      "DebtTokenBase",
      "0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d"
    );
    wethDebt = await ethers.getContractAt(
      "DebtTokenBase",
      "0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf"
    );

    const Flashloan = await ethers.getContractFactory("LevAave");
    flashloan = await Flashloan.deploy(
      "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
    );
    const Uniswap = await ethers.getContractFactory("UniswapV2Router02");
    uniswap = Uniswap.attach("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
    lendingPool = await ethers.getContractAt(
      "ILendingPool",
      "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"
    );
  });
  it("open long position", async function () {
    this.timeout(120000);
    balance = await dai.balanceOf(deployer.getAddress());
    console.log("jsbalance", ethers.utils.formatUnits(balance));
    txApprove = await weth.approve(
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      ethers.utils.parseEther("10000000")
    );
    await txApprove.wait();
    txDeposit = await weth.deposit({ value: ethers.utils.parseEther("100") });
    dai.approve(flashloan.address, ethers.utils.parseEther("1000000000"));
    txApproveUni = await weth.approve(
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      ethers.utils.parseEther("10000000")
    );
    await txApproveUni.wait();
    txConvert = await uniswap.swapExactETHForTokens(
      1,
      [
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      ],
      deployer.getAddress(),
      999999999999999,
      { value: ethers.utils.parseEther("10") }
    );
    await txConvert.wait();
    balance2 = await dai.balanceOf(deployer.getAddress());
    console.log("jsbalance2", ethers.utils.formatUnits(balance2));
    txApproveLoan = await dai.approve(
      flashloan.address,
      ethers.utils.parseUnits("10000000000")
    );
    await txApproveLoan.wait();
    txApproveWeth = await aweth.approve(
      flashloan.address,
      ethers.utils.parseUnits("10000000000")
    );
    await txApproveWeth.wait();
    txDelegate = await daiDebt.approveDelegation(
      flashloan.address,
      ethers.utils.parseUnits("1000000000")
    );
    await txDelegate.wait();
    let approveApi = await fetch(
      "https://api.1inch.exchange/v2.0/approve/calldata?infinity=true&tokenAddress=0x6B175474E89094C44Da98b954EedeAC495271d0F"
    );
    let dataApprove = await approveApi.json();
    let tradeApi = await fetch(
      "https://api.1inch.exchange/v2.0/swap?fromTokenAddress=0x6B175474E89094C44Da98b954EedeAC495271d0F&toTokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&amount=3000000000000000000000&fromAddress=0x5FbDB2315678afecb367f032d93F642f64180aa3&slippage=1&disableEstimate=true"
    );
    let dataTrade = await tradeApi.json();
    txLoan = await flashloan.myFlashLoanCall(
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e",
      "0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d",
      ethers.utils.parseUnits("2000"),
      0,
      0,
      dataTrade.tx.data,
      dataApprove.data
    );
    await txLoan.wait();
    balance3 = await usdc.balanceOf(deployer.getAddress());
    console.log("jsbalance3", ethers.utils.formatUnits(balance3));
    info = await lendingPool.getUserAccountData(deployer.getAddress());
    console.log(
      "totEthColl",
      ethers.utils.formatEther(info.totalCollateralETH)
    );
    console.log("totEthDebt", ethers.utils.formatEther(info.totalDebtETH));
    console.log(
      "avaBorrEth",
      ethers.utils.formatEther(info.availableBorrowsETH)
    );
    console.log(
      "currentLiquidationThreshold:",
      ethers.utils.formatEther(info.currentLiquidationThreshold)
    );
    console.log("ltv:", ethers.utils.formatEther(info.ltv));
    console.log("healthFactor:", ethers.utils.formatEther(info.healthFactor));
  });
  it("close long position", async function () {
    this.timeout(120000);
    txApproveLoan = await aweth.approve(
      flashloan.address,
      ethers.utils.parseUnits("1000000000000000")
    );
    await txApproveLoan.wait();
    closeLongAmount = await aweth.balanceOf(deployer.getAddress());
    console.log("close1", closeLongAmount);
    closeLongAmount = closeLongAmount.toString();
    console.log("close2", closeLongAmount);
    repayAmount = await daiDebt.balanceOf(deployer.getAddress());
    console.log("repayAmount", ethers.utils.formatUnits(repayAmount));
    console.log("closeLongAmount", ethers.utils.formatUnits(closeLongAmount));
    let approveApi = await fetch(
      "https://api.1inch.exchange/v2.0/approve/calldata?infinity=true&tokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    );
    let dataApprove = await approveApi.json();
    let tradeApi = await fetch(
      `https://api.1inch.exchange/v2.0/swap?fromTokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&toTokenAddress=0x6B175474E89094C44Da98b954EedeAC495271d0F&amount=${closeLongAmount}&fromAddress=0x5FbDB2315678afecb367f032d93F642f64180aa3&slippage=1&disableEstimate=true`
    );
    let dataTrade = await tradeApi.json();
    txClose = await flashloan.myFlashLoanCall(
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e",
      "0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d",
      repayAmount,
      1,
      0,
      dataTrade.tx.data,
      dataApprove.data
    );
    balance3 = await usdc.balanceOf(deployer.getAddress());
    console.log("jsbalance3", ethers.utils.formatUnits(balance3, 6));
    info = await lendingPool.getUserAccountData(deployer.getAddress());
    console.log(
      "totEthColl",
      ethers.utils.formatEther(info.totalCollateralETH)
    );
    console.log("totEthDebt", ethers.utils.formatEther(info.totalDebtETH));
    console.log(
      "avaBorrEth",
      ethers.utils.formatEther(info.availableBorrowsETH)
    );
    console.log(
      "currentLiquidationThreshold:",
      ethers.utils.formatEther(info.currentLiquidationThreshold)
    );
    console.log("ltv:", ethers.utils.formatEther(info.ltv));
    console.log("healthFactor:", ethers.utils.formatEther(info.healthFactor));
  });
  it("open short position", async function () {
    balance3 = await dai.balanceOf(deployer.getAddress());
    console.log("usdcbalance", ethers.utils.formatUnits(balance3));
    txDelegate = await wethDebt.approveDelegation(
      flashloan.address,
      ethers.utils.parseUnits("1000000000000000")
    );
    await txDelegate.wait();
    txApprove = await weth.approve(
      flashloan.address,
      ethers.utils.parseEther("10000000")
    );
    await txApprove.wait();
    let approveApi = await fetch(
      "https://api.1inch.exchange/v2.0/approve/calldata?infinity=true&tokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    );
    let dataApprove = await approveApi.json();
    let tradeApi = await fetch(
      `https://api.1inch.exchange/v2.0/swap?fromTokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&toTokenAddress=0x6B175474E89094C44Da98b954EedeAC495271d0F&amount=2000000000000000000&fromAddress=0x5FbDB2315678afecb367f032d93F642f64180aa3&slippage=1&disableEstimate=true`
    );
    let dataTrade = await tradeApi.json();
    txShort = await flashloan.myFlashLoanCall(
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
      ethers.utils.parseUnits("2"),
      2,
      ethers.utils.parseUnits("1000"),
      dataTrade.tx.data,
      dataApprove.data
    );
    await txShort.wait();
    balance3 = await dai.balanceOf(deployer.getAddress());
    console.log("usdcbalance", ethers.utils.formatUnits(balance3));
    info = await lendingPool.getUserAccountData(deployer.getAddress());
    console.log(
      "totEthColl",
      ethers.utils.formatEther(info.totalCollateralETH)
    );
    console.log("totEthDebt", ethers.utils.formatEther(info.totalDebtETH));
    console.log(
      "avaBorrEth",
      ethers.utils.formatEther(info.availableBorrowsETH)
    );
    console.log(
      "currentLiquidationThreshold:",
      ethers.utils.formatEther(info.currentLiquidationThreshold)
    );
    console.log("ltv:", ethers.utils.formatEther(info.ltv));
    console.log("healthFactor:", ethers.utils.formatEther(info.healthFactor));
  });
  xit("close short position", async function () {});
});
