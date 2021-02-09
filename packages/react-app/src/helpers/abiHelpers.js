// import { AAVELendingPoolAddressProviderAbi } from "../abis/AAVELendingPoolAddressProvider";
// import { ethers } from "ethers";

export async function getListOfTokensSupportedByAAVE(contract) {
  try {
    const response = await contract.getAllReservesTokens();
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const tokenDataAddressJson = {
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": {
    symbol: "USDT",
    decimal: 6,
  },
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": {
    symbol: "WBTC",
    decimal: 8,
  },
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
    symbol: "WETH",
    decimal: 18,
  },
  "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e": {
    symbol: "YFI",
    decimal: 18,
  },
  "0xE41d2489571d322189246DaFA5ebDe1F4699F498": {
    symbol: "ZRX",
    decimal: 18,
  },
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": {
    symbol: "UNI",
    decimal: 18,
  },
  "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": {
    symbol: "AAVE",
    decimal: 18,
  },
  "0x0D8775F648430679A709E98d2b0Cb6250d2887EF": {
    symbol: "BAT",
    decimal: 18,
  },
  "0x4Fabb145d64652a948d72533023f6E7A623C7C53": {
    symbol: "BUSD",
    decimal: 18,
  },
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": {
    symbol: "DAI",
    decimal: 18,
  },
  "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c": {
    symbol: "ENJ",
    decimal: 18,
  },
  "0xdd974D5C2e2928deA5F71b9825b8b646686BD200": {
    symbol: "KNC",
    decimal: 18,
  },
  "0x514910771AF9Ca656af840dff83E8264EcF986CA": {
    symbol: "LINK",
    decimal: 18,
  },
  "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942": {
    symbol: "MANA",
    decimal: 18,
  },
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2":{
    symbol: "MKR",
    decimal: 18,
  },
  "0x408e41876cCCDC0F92210600ef50372656052a38": {
    symbol: "REN",
    decimal: 18,
  },
  "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F": {
    symbol: "SNX",
    decimal: 18,
  },
  "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51": {
    symbol: "sUSD",
    decimal: 18,
  },
  "0x0000000000085d4780B73119b644AE5ecd22b376": {
    symbol: "TUSD",
    decimal: 18,
  },
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
    symbol: "USDC",
    decimal: 6,
  },
  "0xD533a949740bb3306d119CC777fa900bA034cd52": {
    symbol: "CRV",
    decimal: 18,
  },
  "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd": {
    symbol: "GUSD",
    decimal: 2,
  }
}

export const tokenDataJson = {
  USDT: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    logo: "https://tokens.1inch.exchange/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
    decimal: 6,
    name: "Tether Usd",
  },
  WBTC: {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    logo: "https://tokens.1inch.exchange/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    decimal: 8,
    name: "Wrapped BTC",
  },
  WETH: {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    logo: "https://tokens.1inch.exchange/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    name: "Wrapped Ether",
    decimal: 18
  },
  YFI: {
    address: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
    decimal: 18,
    name: "yearn.finance",
    logo: "https://tokens.1inch.exchange/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e.png"
  },
  ZRX: {
    address: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0xe41d2489571d322189246dafa5ebde1f4699f498.png",
    name: "0x Protocol"
  },
  UNI: {
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
    name: "UniSwap",
  },
  AAVE: {
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    name: "AAVE Token",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.png",
  },
  BAT: {
    address: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
    decimal: 18,
    name: "Basic Attention Token",
    logo: "https://tokens.1inch.exchange/0x0d8775f648430679a709e98d2b0cb6250d2887ef.png",
  },
  BUSD: {
    address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    decimal: 18,
    name: "Binance USD",
    logo: "https://tokens.1inch.exchange/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
  },
  DAI: {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    name: "DAI StableCoin",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0x6b175474e89094c44da98b954eedeac495271d0f.png",
  },
  ENJ: {
    address: "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c.png",
    name: "Enjin Coin",
  },
  KNC: {
    address: "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0xdd974d5c2e2928dea5f71b9825b8b646686bd200.png",
    name: "Kyber Network",
  },
  LINK: {
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimal: 18,
    name: "Chain Link",
    logo: "https://tokens.1inch.exchange/0x514910771af9ca656af840dff83e8264ecf986ca.png",
  },
  MANA: {
    address: "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
    decimal: 18,
    name: "Mana",
    logo: "https://tokens.1inch.exchange/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
  },
  MKR: {
    address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png",
    name: "Maker"
  },
  REN: {
    address: "0x408e41876cCCDC0F92210600ef50372656052a38",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0x408e41876cccdc0f92210600ef50372656052a38.png",
    name: "Republic",
  },
  SNX: {
    address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f.png",
    name: "Synthetix Network Token",
  },
  sUSD: {
    address: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0x57ab1ec28d129707052df4df418d58a2d46d5f51.png",
    name: "Synth sUSD",
  },
  TUSD: {
    address: "0x0000000000085d4780B73119b644AE5ecd22b376",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0x0000000000085d4780b73119b644ae5ecd22b376.png",
    name: "TrueUSD"
  },
  USDC: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimal: 6,
    logo: "https://tokens.1inch.exchange/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    name: "USD Coin"
  },
  CRV: {
    address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    decimal: 18,
    logo: "https://tokens.1inch.exchange/0xd533a949740bb3306d119cc777fa900ba034cd52.png",
    name: "Curve DAO Token",
  },
  GUSD: {
    address: "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd",
    decimal: 2,
    logo: "https://tokens.1inch.exchange/0x056fd409e1d7a124bd7017459dfea2f387b6d5cd.png",
    name: "Gemini Dollar",
  },
};
// for 1inch tokens

// const getApprove1inchData = async (tokenAddress) => {
//   try {
//     const oneInchAproveDataUrl = `https://api.1inch.exchange/v2.0/approve/calldata?infinity=true&tokenAddress=${tokenAddress}`;
//     const jsonRequest = { inifinity: true, tokenAddress };
//     const request = new Request(oneInchAproveDataUrl, {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (error) {
//     console.log(

export const getApprove1inchData = async tokenAddress => {
  try {
    const oneInchAproveDataUrl = `https://api.1inch.exchange/v2.0/approve/calldata?infinity=true&tokenAddress=${tokenAddress}`;
    const request = new Request(oneInchAproveDataUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "*"
      },
    });
    let response = await fetch(request);
    return response.json();
  } catch (error) {
    console.log("error in getApprove1incData", error);
  }
};

export const get1InchQuote = async (fromTokenAddress, toTokenAddress, amount) => {
  try {
    const oneInchAproveDataUrl = `https://api.1inch.exchange/v2.0/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}`;
    const request = new Request(oneInchAproveDataUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "*"
      },
    });
    let response = await fetch(request);
    return response.json();
  } catch (error) {
    console.log("error in getApprove1incData", error);
  }
};

export const get1InchSwapData = async (
  fromTokenAddress,
  toTokenAddress,
  amount,
  fromAddress,
  maxSlippagePercentage,
) => {
  try {
    const oneInchAproveDataUrl = `https://api.1inch.exchange/v2.0/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}&fromAddress=${fromAddress}&slippage=${maxSlippagePercentage}&disableEstimate=true`;
    const request = new Request(oneInchAproveDataUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "*"
      },
    });
    let response = await fetch(request);
    return response.json();
  } catch (error) {
    console.log("error in getApprove1incData", error);
  }
};
