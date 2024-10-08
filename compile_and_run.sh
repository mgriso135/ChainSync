ganache-cli &
truffle compile && truffle migrate
cp build/contracts/SupplyChainTracker.json client/src/contracts/ && cp build/contracts/SupplyChainTracker.json client/public/ 
echo "Remember to change: network name, contract address and transactionHas in /client/public/SupplyChainTracker.json"
echo "Add to MetaMask an account with a balance, usually generated by ganache. You can find addresses in the log of the script you just ran."
echo "Then type cd client/ --> npm start"
