### Flash-Loan-Leverage-Swaps
Long and Shorts using aave flash loans and any third party AMMs like 1Inch or Uniswap
This is a copy of the project that Bhanu, Marco and I worked on in the Marketmake Hackathon. 

https://github.com/levaave/levaave

# What is it doing ?
We are trying to take a leveraged long and short position using the aave flashloans. We can use any sort of AMM's to swap for a selected token you want to leverage. 

In the App you will get 10 addresses that have **10000 WETH, 10000 DAI and USDC**, I forgot how much. You can use these on the forked network to test out your contract and test out your positions.
**--You can copy the first address from the console when you do a yarn fork.--**
I have also added closing the positions which is a little tricky, still not sure how to ensure that thers no dust remaining.

I am saving the positions on chain, can be moved to subgraph to improve on the gas cost.

**So what exactly is the LevAave contract doing -** 

1. Choose a collateral.
2. Choose a leverage.
3. Choose long or short.
4. Now the contract takes a flash loan of the required amount and also takes the approval to use the users collateral.
5. Then, Credit delegation on behalf of the user.
6. Now we swap for the required tokens on any AMM. 
7. Borrow on Aave.(Loan plus premium).
8. Repay the loan.
9. In the end your wallet will have  Atokens and you will have some debt based on your leverage on AAVE. (The first flashloan swap transaction might take a little time. *SEE NOTE*)

You can also close your positions accordingly. 

GO TEST IT OUT!!!!!!!!

# Installation and How to run ?

I used Scaffold-Eth as my base coz I was too lazy .. :P

Go into the packages folder and do a yarn install.
Now go back to the main folder.

So you have to do three things -
1. yarn start - to start the react-app.(localhost:3000)
2. yarn fork - to fork the network.
3. yarn deploy - deploys your contract on the forked net.
4. **When you do a yarn fork, you will see 10 addresses, use the private key to import into the wallet.**
5. On metamask, choose localhost:8545. 

This will start your project and you can check it out. 

## NOTE
**The first flashloan swap transaction might take a little time due to being on the forked net. Give it about a 30-45 secs and m sure the metamask will popup for the main flash loan transaction. The consequent transactions will popup quite fast after that.**

# TODO
1. Add Stop loss.
2. Take profit.
3. The positions themselves can be tokenized. Havent yet worked out on the process for this.
4. 1 inch has an interesting chi token use, can decrease swap gas price by 40 percent.
5. Add Uniswap support.
6. Slippage configuration for the user.
7. Liquidation notification.
8. Emit events and catch them on subgraph. 
