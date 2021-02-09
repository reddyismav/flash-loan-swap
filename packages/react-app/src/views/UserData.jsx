import React, { memo, useState, useEffect } from "react";
import { useBlockNumber, usePoller } from "eth-hooks";
import { AAVELendingPoolAddressProviderAbi as IAddressProvider } from "../abis/AAVELendingPoolAddressProvider.js";
import { abi as IDataProvider } from "../abis/ProtocolDataProvider.json";
import { abi as ILendingPool } from "../abis/LendingPool.json";
// import { abi as IPriceOracle } from "../abis/PriceOracle.json";
import { abi as IErc20 } from "../abis/erc20.json";
import { ethers } from "ethers";
import { Table } from "reactstrap";
import { tokenDataJson } from "../helpers/abiHelpers";
import "./NewUI.styles.scss";

function UserData(props) {
  const [userConfiguration, setUserConfiguration] = useState();
  const [activeTokenData, setActiveTokenData] = useState();
  const [reserveTokensForConfig, updateReserveTokensForConfig] = useState();
  const [userAccountData, setUserAccountData] = useState();
  const [userAssetData, setUserAssetData] = useState();
  const [userAssetList, setUserAssetList] = useState([]);
  const [balance, setBalance] = useState();
  const [poolAllowance, setPoolAllowance] = useState();

  const [reserveTokens, setReserveTokens] = useState();
  const [assetData, setAssetData] = useState({});
  const [assetPrices, setAssetPrices] = useState({});

  const POOL_ADDRESSES_PROVIDER_ADDRESS = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
  const PROTOCOL_DATA_PROVIDER = "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d";
  const LENDING_POOL = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
  const { signer, liveAsset, positions, closeLong, closeShort, setHealthFactor, healthFactor } = props;

  let addressProviderContract = new ethers.Contract(POOL_ADDRESSES_PROVIDER_ADDRESS, IAddressProvider, signer);
  let dataProviderContract = new ethers.Contract(PROTOCOL_DATA_PROVIDER, IDataProvider, signer);
  let lendingPoolContract = new ethers.Contract(LENDING_POOL, ILendingPool, signer);
  // let priceOracleContract = new ethers.Contract(PRICE_ORACLE, IPriceOracle, signer);

  useEffect(() => {
    // (async function () {
    getReserveTokens();
    // await getReserveTokens();
    // })();
  }, []);

  useEffect(() => {
    (async function () {
      // await getReserveData();
      await getUserInfo();
      // await getUserAssetData();
    })();
  }, [reserveTokens]);

  // useEffect(() => {
  //   getUserConfiguration();
  // }, [userAccountData]);

  // useEffect(() => {
  //   checkUserConfiguration();
  // }, [userConfiguration]);

  useEffect(() => {
    getDataForAllActiveTokens();
  }, [userAssetList]);

  const getDebtDetails = async asset => {
    let stableContract = new ethers.Contract(asset.stableDebtTokenAddress, IErc20, signer);
    let variableContract = new ethers.Contract(asset.variableDebtTokenAddress, IErc20, signer);
    let stableDebt = await stableContract.balanceOf(signer.getAddress());
    let variableDebt = await variableContract.balanceOf(signer.getAddress());
    return {
      stable: stableDebt,
      variable: variableDebt,
    };
  };

  const getATokenDetails = async asset => {
    let ATokenContract = new ethers.Contract(asset.aTokenAddress, IErc20, signer);
    let aTokenData = await ATokenContract.balanceOf(signer.getAddress());
    return {
      aToken: aTokenData,
    };
  };
  const getDataForAllActiveTokens = async () => {
    let _activeTokenData = [];
    if (userAssetList.length === 0) return;
    for (const asset of userAssetList) {
      // }
      // userAssetList.forEach(async asset => {
      let assetData = reserveTokens.filter(function (el) {
        return el.symbol === asset.symbol;
      })[0];
      if (assetData) {
        let _data = {
          stable: undefined,
          variable: undefined,
          aToken: undefined,
        };
        if (asset.type === "debt") {
          let data = await getDebtDetails(assetData);
          _data = { ..._data, ...data };
        } else {
          let data = await getATokenDetails(assetData);
          _data = { ..._data, ...data };
        }
        let dataObject = {
          symbol: assetData.symbol,
          stable: _data.stable || 0,
          variable: _data.variable || 0,
          aToken: _data.aToken || 0,
        };
        _activeTokenData.push(dataObject);
      }
      // });
    }
    setActiveTokenData(_activeTokenData);
  };

  const getTokenBalance = async () => {
    if (assetData && assetData.tokenAddress && signer) {
      let tokenContract = new ethers.Contract(assetData.tokenAddress, IErc20, signer);
      let address = await signer.getAddress();
      console.log(assetData, address);
      let _balance = await tokenContract.balanceOf(address);
      setBalance(_balance);
      let _allowance = await tokenContract.allowance(address, lendingPoolContract.address);
      setPoolAllowance(_allowance);
    }
  };

  const getReserveTokens = async () => {
    // debugger;
    if (!reserveTokens && dataProviderContract) {
      // console.log("getting Reserve Tokens");
      let _reserveTokensWithExtraInfo = [];
      let _reserveTokens = await dataProviderContract.getAllReservesTokens(); //.getReserveData("0x6B175474E89094C44Da98b954EedeAC495271d0F")//makeCall('getAddress', addressProviderContract, ["0x1"])
      // console.log(_reserveTokens);
      updateReserveTokensForConfig(_reserveTokens);
      for (const token of _reserveTokens) {
        let tokenAddressData = await dataProviderContract.getReserveTokensAddresses(token.tokenAddress);
        let tokenWithAddresses = {
          ...token,
          ...tokenAddressData,
        };
        _reserveTokensWithExtraInfo.push(tokenWithAddresses);
      }
      // _reserveTokens.forEach(async token => {
      //   let tokenAddressData = await dataProviderContract.getReserveTokensAddresses(token.tokenAddress);
      //   let tokenWithAddresses = {
      //     ...token,
      //     ...tokenAddressData,
      //   };
      //   _reserveTokensWithExtraInfo.push(tokenWithAddresses);
      // });
      setReserveTokens(_reserveTokensWithExtraInfo);
    }
  };

  const getReserveData = async () => {
    if (reserveTokens && liveAsset) {
      console.log("getting reserve data");

      let asset = reserveTokens.filter(function (el) {
        return el.symbol === liveAsset.label;
      })[0];

      let _reserveData = await dataProviderContract.getReserveData(asset.tokenAddress);
      let _reserveConfigurationData = await dataProviderContract.getReserveConfigurationData(asset.tokenAddress);
      let _newAssetData = { ...asset, ..._reserveData, ..._reserveConfigurationData };
      // debugger;
      setAssetData(_newAssetData);
    }
  };

  const getUserAssetData = async () => {
    if (signer && reserveTokens && liveAsset) {
      let address = await signer.getAddress();

      let asset = reserveTokens.filter(function (el) {
        return el.symbol === liveAsset.label;
      })[0];
      let _data = await dataProviderContract.getUserReserveData(asset.tokenAddress, address);
      console.log(_data);
      setUserAssetData(_data);
    }
  };

  const getUserInfo = async () => {
    console.log("getting user info");
    let address = await signer.getAddress();
    let _accountData = await lendingPoolContract.getUserAccountData(address);
    setUserAccountData(_accountData);
    //setHealthFactor(ethers.utils.formatUnits(_accountData.healthFactor, 18).slice(0,4));
    console.log("healthfactor", _accountData.healthFactor);
    let _userConfiguration = await lendingPoolContract.getUserConfiguration(address);
    checkUserConfiguration(_userConfiguration);
    setUserConfiguration(_userConfiguration);
  };

  const checkUserConfiguration = async configuration => {
    if (
      configuration &&
      reserveTokensForConfig &&
      reserveTokens &&
      reserveTokens.length === reserveTokensForConfig.length
    ) {
      let _userActiveAssets = {};
      let configBits = parseInt(configuration.toString(), 10).toString(2);
      let reversedBits = configBits.split("").reverse();
      let _userAssetList = [];
      for (let i = 0; i < reversedBits.length; i++) {
        let _assetIndex = Math.floor(i / 2);
        if (reversedBits[i] === "1") {
          let _type = i % 2 === 0 ? "debt" : "collateral";
          let _symbol = reserveTokensForConfig[_assetIndex]["symbol"];
          // let _newAsset;
          // if (_userAssetList[_symbol]) {
          //   _newAsset = [..._userAssetList[_symbol], _type];
          // } else {
          // _newAsset = [_type];
          // }
          _userAssetList.push({ symbol: _symbol, type: _type });
        }
      }
      console.log(_userAssetList);
      setUserAssetList(_userAssetList);
    }
  };

  // usePoller(getTokenBalance, 3000);
  // usePoller(getReserveTokens, 3000);
  // usePoller(getReserveData, 15000);
  // usePoller(getUserAssetData, 6000);
  usePoller(getUserInfo, 10000);
  // if (activeTokenData && Object.keys(activeTokenData.length) > 0) {
  //  debugger;
  return (
    <>
      {positions && positions.length > 0 ? (
        <div className="table-positions">
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1b432d" }}>
            <div className="table-positions-label">Positions</div>
            {(userAccountData && (parseFloat(ethers.utils.formatUnits(userAccountData.healthFactor)) < 1111111)) ?
              <div style={{ color: "#cbcbcb", fontSize: "15px" }}>
                Health Factor: {ethers.utils.formatUnits(userAccountData.healthFactor)}
              </div>:
              <div style={{ color: "#cbcbcb", fontSize: "15px" }}>
                Health Factor: Loading...
              </div>
            }
          </div>

          <Table borderless style={{ color: "#A5A5A5" }} className="main-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Loaned Amount</th>
                <th>Position</th>
                <th>Leveraged Asset</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(positionData => {
                return (
                  <tr key={positionData.id}>
                    <th scope="row">
                      {positionData.collateralSymbol}{" "}
                      {/* <img className="swap-page-input-body-button-img" src={tokenDataJson[positionData.collateralSymbol].logo}></img> */}
                      {" - "}
                      {positionData.leveragedAssetSymbol}{" "}
                      {/* <img className="swap-page-input-body-button-img" src={tokenDataJson[positionData.leveragedAssetSymbol].logo}></img> */}
                    </th>
                    <td>
                      <img
                        className="swap-page-input-body-button-img"
                        src={tokenDataJson[positionData.collateralSymbol].logo}
                      ></img>
                      {"  "}
                      {positionData.collateralAmount} {positionData.collateralSymbol}
                    </td>
                    {positionData.direction === "0.0" ? (
                      <td style={{ color: "#20bb56", fontStyle: "italic" }}>LONG</td>
                    ) : (
                      <td style={{ color: "#ed5c5c", fontStyle: "italic" }}>SHORT</td>
                    )}
                    <td>
                      <img
                        className="swap-page-input-body-button-img"
                        src={tokenDataJson[positionData.leveragedAssetSymbol].logo}
                      ></img>
                      {"  "}
                      {positionData.leveragedAmount.slice(0, 8)} {positionData.leveragedAssetSymbol}
                    </td>
                    <td>
                      <button
                        className="close-position-button"
                        onClick={
                          positionData.direction === "0.0"
                            ? () =>
                                closeLong({
                                  collateral: positionData.collateral,
                                  leveragedAsset: positionData.leveragedAsset,
                                  collateralAmount: positionData.collateralAmount,
                                  leveragedAmount: positionData.leveragedAmount,
                                  id: positionData.id,
                                })
                            : () =>
                                closeShort({
                                  collateral: positionData.collateral,
                                  leveragedAsset: positionData.leveragedAsset,
                                  collateralAmount: positionData.collateralAmount,
                                  leveragedAmount: positionData.leveragedAmount,
                                  id: positionData.id,
                                })
                        }
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="table-positions">
          <div className="table-positions-label">Positions</div>
          <div className="ghost">
            <svg width="73px" height="93px" viewBox="0 0 73 93" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>noun_Ghost_2076593 Copy</title>
              <g id="Proto-V5-Green" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="2" transform="translate(-964.000000, -357.000000)" fill="#858585" fillRule="nonzero">
                  <g id="Group-2" transform="translate(680.000000, 112.000000)">
                    <g id="noun_Ghost_2076593-Copy" transform="translate(284.128463, 245.500000)">
                      <path
                        d="M61.1942195,10.8471359 C54.6450054,4.40025324 45.7421674,0.409325883 35.8160148,0.409325883 C16.0660409,0.409325883 0,16.4753668 0,36.2253406 L0,71.9888876 C0,73.4215282 0.613988824,74.6495059 1.53497206,75.5704891 C2.4559553,76.4914723 3.78626442,77.1054612 5.11657354,77.1054612 C7.98185472,77.1054612 10.2331471,74.8541688 10.2331471,71.9888876 L10.2331471,64.8781525 C10.2331471,63.4455119 10.8471359,62.2175342 11.7681191,61.296551 C12.6891024,60.3755677 14.0194115,59.7615789 15.3497206,59.7615789 C18.2150018,59.7615789 20.4662941,62.0128713 20.4662941,64.8781525 L20.4662941,81.2511878 L20.4662941,86.6747557 C20.4662941,89.5400369 22.7175865,91.7913293 25.5828677,91.7913293 C28.4481489,91.7913293 30.6994412,89.5400369 30.6994412,86.6747557 L30.6994412,86.3677613 L30.6994412,64.8781525 C30.6994412,62.0128713 32.9507336,59.7615789 35.8160148,59.7615789 C37.2486553,59.7615789 38.476633,60.3755677 39.3976162,61.296551 C40.3185995,62.2175342 40.9325883,63.5478433 40.9325883,64.8781525 L40.9325883,67.7108516 C40.9325883,70.5761328 43.1838807,72.8274251 46.0491618,72.8274251 C48.914443,72.8274251 51.1657354,70.5761328 51.1657354,67.7108516 L51.1657354,64.8781525 C51.1657354,62.0128713 53.4170277,59.7615789 56.2823089,59.7615789 C57.7149495,59.7615789 58.9429271,60.3755677 59.8639104,61.296551 C60.7848936,62.2175342 61.3988824,63.5478433 61.3988824,64.8781525 L61.3988824,78.7900441 C61.3988824,81.6553253 63.6501748,83.9066177 66.515456,83.9066177 C69.3807372,83.9066177 71.6320295,81.6553253 71.6320295,78.7900441 L71.6320295,59.7615789 L71.6320295,36.2253406 C71.6320295,26.299188 67.6411022,17.39635 61.1942195,10.8471359 Z M23.4860645,30.8271311 C18.6581066,30.8271311 14.7079593,26.8769838 14.7079593,22.049026 C14.7079593,17.2210681 18.6581066,13.2709208 23.4860645,13.2709208 C28.3140223,13.2709208 32.2641696,17.2210681 32.2641696,22.049026 C32.2641696,26.9867101 28.3140223,30.8271311 23.4860645,30.8271311 Z M35.9349028,51.7291815 C27.398369,51.7291815 20.325241,44.9221164 20.325241,36.4431405 L25.3252108,36.4431405 L27.7642204,41.4395392 C28.3739728,42.514339 29.9593291,42.514339 30.5690815,41.4395392 L33.0080912,36.4431405 L38.6178134,36.4431405 L41.0568231,41.4395392 C41.6665755,42.514339 43.2519318,42.514339 43.8616842,41.4395392 L46.3006939,36.4431405 L51.3006637,36.4431405 C51.5445646,44.9221164 44.4714366,51.7291815 35.9349028,51.7291815 Z M47.8450517,30.8271311 C43.5850889,30.8271311 40.0996648,27.341707 40.0996648,23.0817442 C40.0996648,18.8217814 43.5850889,15.3363573 47.8450517,15.3363573 C52.1050145,15.3363573 55.5904387,18.8217814 55.5904387,23.0817442 C55.5904387,27.4385244 52.1050145,30.8271311 47.8450517,30.8271311 Z"
                        id="Shape"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <div className="ghost-text">Your Positions will appear here.</div>
        </div>
      )}
    </>
  );
  // }
}

export default memo(UserData);
