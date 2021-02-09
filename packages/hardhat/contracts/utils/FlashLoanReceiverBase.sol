// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.12;

import { SafeMath } from './SafeMath.sol';
import { IERC20 } from '../interfaces/IERC20.sol';
import { SafeERC20 } from './SafeERC20.sol';
import { IFlashLoanReceiver } from '../interfaces/IFlashLoanReceiver.sol';
import { ILendingPoolAddressesProvider } from '../interfaces/ILendingPoolAddressesProvider.sol';
import { ILendingPool } from '../interfaces/ILendingPool.sol';

/** 
    !!!
    Never keep funds permanently on your FlashLoanReceiverBase contract as they could be 
    exposed to a 'griefing' attack, where the stored funds are used by an attacker.
    !!!
 */
abstract contract FlashLoanReceiverBase is IFlashLoanReceiver {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  ILendingPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
  ILendingPool public immutable override LENDING_POOL;

  constructor(ILendingPoolAddressesProvider provider) public {
    ADDRESSES_PROVIDER = provider;
    LENDING_POOL = ILendingPool(provider.getLendingPool());
  }
}