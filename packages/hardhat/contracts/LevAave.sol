//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;

import { FlashLoanReceiverBase } from "./utils/FlashLoanReceiverBase.sol";
import { ILendingPool } from "./interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "./interfaces/ILendingPoolAddressesProvider.sol";
import { IERC20 } from "./interfaces/IERC20.sol";

contract LevAave is FlashLoanReceiverBase {
    address oneInch = address(0x111111125434b319222CdBf8C261674aDB56F3ae);

    constructor(ILendingPoolAddressesProvider _addressProvider) public FlashLoanReceiverBase(_addressProvider) {}

    mapping(address => Position[]) public positions;
    mapping(address => uint256) public positionsOpen;

    event TransactionSuccess(
        address userAddress,
        uint8 leverageType,
        uint8 leverageMultiplier,
        address collateralTokenAddress,
        uint256 collateralAmount,
        address leverageTokenAddress,
        uint256 leverageAmount
    );

    struct Position {
        uint256 id;
        uint8 direction; // 0 long 1 shor
        address collateral;
        address leveragedAsset;
        uint256 collateralAmount;
        uint256 leveragedAmount;
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        uint256 operation = abi.decode(params, (uint256));
        if (operation == 0) {
            _executeLongLeverage(assets[0], amounts[0], premiums[0], params);
        } else if (operation == 1) {
            _executeCloseLong(assets[0], amounts[0], premiums[0], params);
        } else if (operation == 2) {
            _executeShortLeverage(assets[0], amounts[0], premiums[0], params);
        } else if (operation == 2) {
            _executeShortLeverage(assets[0], amounts[0], premiums[0], params);
        } else if (operation == 3) {
            _executeCloseShort(assets[0], amounts[0], premiums[0], params);
        }

        // necessary to repay the loan
        for (uint256 i = 0; i < assets.length; i++) {
            uint256 amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        return true;
    }

    function positionsLength(address sender) external view returns (uint256) {
        return positions[sender].length;
    }

    function longLeverage(
        address loanAsset,
        address positionAsset,
        uint256 amount,
        uint8 leverage,
        bytes calldata oneInchData
    ) public {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = loanAsset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = address(this);
        bytes memory params = abi.encode(0, msg.sender, positionAsset, leverage, oneInchData);
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(receiverAddress, assets, amounts, modes, onBehalfOf, params, referralCode);
    }

    function _executeLongLeverage(
        address asset,
        uint256 amount,
        uint256 premium,
        bytes memory params
    ) private {
        // decode params
        (, address sender, address positionAsset, uint8 leverage, bytes memory oneInchData) =
            abi.decode(params, (uint256, address, address, uint8, bytes));
        // transfer collateral from user to contract
        IERC20(asset).transferFrom(sender, address(this), amount.div(leverage));
        // approve for 1inch
        if (IERC20(asset).allowance(address(this), address(oneInch)) < amount.div(leverage)) {
            IERC20(asset).approve(address(oneInch), uint256(-1));
        }
        // 1inch trade
        (, bytes memory res) = oneInch.call(oneInchData);
        uint256 balanceFrom1Inch = toUint256(res);
        // if no aave allowance, approve
        if (IERC20(positionAsset).allowance(address(this), address(LENDING_POOL)) < balanceFrom1Inch) {
            IERC20(positionAsset).approve(address(LENDING_POOL), uint256(-1));
        }
        // deposit collateral to aave on behalf of user
        LENDING_POOL.deposit(positionAsset, balanceFrom1Inch, sender, 0);
        LENDING_POOL.borrow(asset, amount.add(premium), 2, 0, sender);
        // save position info in storage
        Position memory newPosition =
            Position(positions[sender].length, 0, asset, positionAsset, amount, balanceFrom1Inch);
        positions[sender].push(newPosition);
        positionsOpen[sender]++;
        emit TransactionSuccess(sender, 0, leverage, asset, amount, positionAsset, balanceFrom1Inch);
    }

    function closeLong(
        address loanAsset,
        address positionAsset,
        address apositionAsset,
        address debtToken,
        uint256 amount,
        uint256 collateralAmount,
        uint16 id,
        bytes calldata oneInchData
    ) public {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = loanAsset;

        uint256[] memory amounts = new uint256[](1);
        if (positionsOpen[msg.sender] == 1) {
            uint256 debt = IERC20(debtToken).balanceOf(msg.sender);
            amounts[0] = debt;
        } else {
            amounts[0] = amount;
        }
        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = address(this);
        bytes memory params =
            abi.encode(1, msg.sender, positionAsset, apositionAsset, collateralAmount, id, oneInchData);
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(receiverAddress, assets, amounts, modes, onBehalfOf, params, referralCode);
    }

    function _executeCloseLong(
        address asset,
        uint256 amount,
        uint256 premium,
        bytes memory params
    ) private {
        // decode params
        (
            ,
            address sender,
            address positionAsset,
            address apositionAsset,
            uint256 collateralAmount,
            uint8 id,
            bytes memory oneInchData
        ) = abi.decode(params, (uint256, address, address, address, uint256, uint8, bytes));
        // if no aave allowance, approve
        if (IERC20(asset).allowance(address(this), address(LENDING_POOL)) < amount) {
            IERC20(asset).approve(address(LENDING_POOL), uint256(-1));
        }
        // first repay the debt of the user using the flashloan funds
        LENDING_POOL.repay(asset, amount, 2, sender);
        // transfer atoken from user to contract
        if (positionsOpen[sender] == 1) {
            uint256 newAmount = IERC20(apositionAsset).balanceOf(sender);
            IERC20(apositionAsset).transferFrom(sender, address(this), newAmount);
            LENDING_POOL.withdraw(positionAsset, newAmount, address(this));
        } else {
            IERC20(apositionAsset).transferFrom(sender, address(this), collateralAmount);
            LENDING_POOL.withdraw(positionAsset, collateralAmount, address(this));
        }
        // approve for 1inch
        if (IERC20(positionAsset).allowance(address(this), address(oneInch)) < collateralAmount) {
            IERC20(positionAsset).approve(address(oneInch), uint256(-1));
        }
        // 1inch trade
        (, bytes memory res) = oneInch.call(oneInchData);
        uint256 balanceFrom1Inch = toUint256(res);
        // send collateral back to user
        IERC20(asset).transfer(sender, balanceFrom1Inch - amount.add(premium));
        IERC20(positionAsset).transfer(sender, IERC20(positionAsset).balanceOf(address(this)));
        // remove position info from storage
        delete positions[sender][id];
        positionsOpen[sender]--;
        // emit event
        emit TransactionSuccess(sender, 0, 0, asset, amount, positionAsset, collateralAmount);
    }

    function shortLeverage(
        address loanAsset,
        address positionAsset,
        uint256 amount,
        uint256 collateralAmount,
        bytes calldata oneInchData
    ) public {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = loanAsset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = address(this);
        bytes memory params = abi.encode(2, msg.sender, positionAsset, collateralAmount, oneInchData);
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(receiverAddress, assets, amounts, modes, onBehalfOf, params, referralCode);
    }

    function _executeShortLeverage(
        address asset,
        uint256 amount,
        uint256 premium,
        bytes memory params
    ) private {
        // decode params
        (, address sender, address positionAsset, uint256 collateralAmount, bytes memory oneInchData) =
            abi.decode(params, (uint256, address, address, uint256, bytes));
        // transfer collateral from user to contract
        IERC20(positionAsset).transferFrom(sender, address(this), collateralAmount);
        // 1inch approve
        if (IERC20(asset).allowance(address(this), address(oneInch)) < amount) {
            IERC20(asset).approve(address(oneInch), uint256(-1));
        }
        // 1inch trade
        (, bytes memory res) = oneInch.call(oneInchData);
        uint256 balanceFrom1Inch = toUint256(res);
        balanceFrom1Inch = balanceFrom1Inch + collateralAmount;
        // if no aave allowance, approve
        if (IERC20(positionAsset).allowance(address(this), address(LENDING_POOL)) < balanceFrom1Inch) {
            IERC20(positionAsset).approve(address(LENDING_POOL), uint256(-1));
        }
        // deposit collateral to aave on behalf of user
        LENDING_POOL.deposit(positionAsset, balanceFrom1Inch, sender, 0);
        // borrow loaned asset on behalf of user
        LENDING_POOL.borrow(asset, amount.add(premium), 2, 0, sender);
        // save position info in storage
        Position memory newPosition =
            Position(positions[sender].length, 1, positionAsset, asset, amount, balanceFrom1Inch);
        positions[sender].push(newPosition);
        positionsOpen[sender]++;
        // emit event
        emit TransactionSuccess(sender, 0, 0, asset, amount, positionAsset, balanceFrom1Inch);
    }

    function closeShort(
        address loanAsset,
        address positionAsset,
        address apositionAsset,
        address debtToken,
        uint256 amount,
        uint256 atokenAmount,
        uint16 id,
        bytes calldata oneInchData
    ) public {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = loanAsset;

        uint256[] memory amounts = new uint256[](1);
        if (positionsOpen[msg.sender] == 1) {
            uint256 debt = IERC20(debtToken).balanceOf(msg.sender);
            amounts[0] = debt;
        } else {
            amounts[0] = amount;
        }
        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = address(this);
        bytes memory params = abi.encode(3, msg.sender, positionAsset, apositionAsset, atokenAmount, id, oneInchData);
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(receiverAddress, assets, amounts, modes, onBehalfOf, params, referralCode);
    }

    function _executeCloseShort(
        address asset,
        uint256 amount,
        uint256 premium,
        bytes memory params
    ) private {
        // decode params
        (
            ,
            address sender,
            address positionAsset,
            address apositionAsset,
            uint256 atokenAmount,
            uint16 id,
            bytes memory oneInchData
        ) = abi.decode(params, (uint256, address, address, address, uint256, uint16, bytes));
        // if no aave allowance, approve
        if (IERC20(asset).allowance(address(this), address(LENDING_POOL)) < amount) {
            IERC20(asset).approve(address(LENDING_POOL), uint256(-1));
        }
        // first repay the debt of the user using the flashloan funds
        LENDING_POOL.repay(asset, amount, 2, sender);
        // transfer atoken from user to contract
        if (positionsOpen[sender] == 1) {
            atokenAmount = IERC20(apositionAsset).balanceOf(sender);
        }
        IERC20(apositionAsset).transferFrom(sender, address(this), atokenAmount);
        // transform atoken in token
        LENDING_POOL.withdraw(positionAsset, atokenAmount, address(this));
        // approve for 1inch
        if (IERC20(positionAsset).allowance(address(this), address(oneInch)) < atokenAmount) {
            IERC20(positionAsset).approve(address(oneInch), uint256(-1));
        }
        // 1inch trade
        (, bytes memory res) = oneInch.call(oneInchData);
        uint256 balanceFrom1Inch = toUint256(res);
        // send collateral back to user
        IERC20(asset).transfer(sender, balanceFrom1Inch - amount.add(premium));
        IERC20(positionAsset).transfer(sender, IERC20(positionAsset).balanceOf(address(this)));
        // remove position info from storage
        delete positions[sender][id];
        positionsOpen[sender]--;
        // emit event
        emit TransactionSuccess(sender, 0, 0, asset, amount, positionAsset, atokenAmount);
    }

    function toUint256(bytes memory _bytes) internal pure returns (uint256 value) {
        assembly {
            value := mload(add(_bytes, 0x20))
        }
    }
}
