ganache-cli&
truffle compile && truffle migrate
cp build/contracts/SupplyChainTracker.json client/src/contracts/ && cp build/contracts/SupplyChainTracker.json client/public/ 
echo "Remember to change: network name, contract address and transactionHas in SupplyChainTracker.json"
echo "Then type cd client/ --> npm start"
