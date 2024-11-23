import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { ethers } from 'ethers'; 

function AccountConnected({ account }) {
  return (
    <div>
      <h1>Supply Chain Tracker</h1>
      <p>Account connected: {account}</p>
    </div>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [products, setProducts] = useState([]);
  const [contract, setContract] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      }
    };

    if (!account) { // Only connect if the account is not already set
      connectWallet();
    }
  }, [account]);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await fetch('/SupplyChainTracker.json');
        const data = await response.json();
        const web3 = new Web3(window.ethereum);
        const contractInstance = new web3.eth.Contract(data.abi, data.networks.development.address);
        setContract(contractInstance);
      } catch (error) {
        console.error('Error fetching contract data:', error);
      }
    };

    fetchContractData();
  }, []);


// Assuming you have a provider connected to the Ethereum network
const provider = new ethers.providers.Web3Provider(window.ethereum);


  const getGasPrice = async () => {
  try {
    const gasPrice = await provider.getGasPrice();
    console.log('Gas Price (Wei):', gasPrice.toString()); // Output gas price in Wei

    // Convert to Gwei for readability
    const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, 'gwei'); 
    console.log('Gas Price (Gwei):', gasPriceInGwei); 

    return gasPrice;
  } catch (error) {
    console.error('Error fetching gas price:', error);
  }
};


  const getProducts = async () => {
    try {
      const productCount = await contract.methods.productCount().call();
      console.log('Product Count:', productCount.toString());
      
      const fetchedProducts = [];
      for (let i = 0; i < Number(productCount); i++) {
        const product = await contract.methods.products(i).call();
        console.log(product.manufacturer);
        fetchedProducts.push(product);
      }

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const productName = form.productName.value;
    const productSerialNumber = form.productSerialNumber.value;
    const productCurrentLocation = form.productCurrentLocation.value;
    const isForSale = form.isForSale.value === 'true';
    const initialPrice = Web3.utils.toWei(form.initialPrice.value, 'ether');

    console.log(initialPrice);

    if (!productName || !productSerialNumber) {
      alert('Please enter a product name and serial number.');
      return;
    }

    try {
      const estimatedGasPrice = await getGasPrice(); // Get the gas price
      const gasPriceString = estimatedGasPrice.toString(); // Convert to string
      console.log(estimatedGasPrice);

      await contract.methods.addProduct(
        productName,
        account,
        productSerialNumber,
        account,
        productCurrentLocation,
        initialPrice,
        isForSale
      ).send({ from: account, gasPrice: gasPriceString });
      console.log('Product added successfully');
      getProducts(); // Refresh the product list
    } catch (error) {
      console.error('Error adding product:', error);
      alert('An error occurred while adding the product.');
    }
  };


  const handleBuyProduct = async (productId, price) => {
    try {
      const priceInWei = Web3.utils.toWei(price, 'ether');
      console.log("productId: " +typeof(productId)+" "+ productId.toString());
      console.log("account: " + account.toString());
  
      await contract.methods.transferOwnership(productId, account, "New location " + productId) // Update location as needed
        .send({ from: account, value: priceInWei });
  
      console.log('Product purchased successfully');
      getProducts(); // Refresh the product list
    } catch (error) {
      console.error('Error purchasing product:', error);
    }
  };

  return (
    <div>
      <AccountConnected account={account} />
      
      <form onSubmit={addProduct}>
        <label htmlFor="productName">Product Name:</label>
        <input type="text" id="productName" name="productName" required />
        <br />
        <label htmlFor="productSerialNumber">Serial Number:</label>
        <input type="text" id="productSerialNumber" name="productSerialNumber" required />
        <br />
        <label htmlFor="productCurrentLocation">Current location:</label>
        <input type="text" id="productCurrentLocation" name="productCurrentLocation" required />
        <br />
        <label htmlFor="isForSale">For sale:</label>
        <select id="isForSale" name="isForSale">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        <br />
        <label htmlFor="initialPrice">Initial price (ETH):</label>
        <input type="number" id="initialPrice" name="initialPrice" step="0.01" required />
        <br />
        <button type="submit">Add Product</button>
      </form>
<p></p>
      <button onClick={getProducts}>Get Products</button>
      <ul>
        {products.map((product, index) => (
          <div key={index}>
            Manufacturer: {product.manufacturer} - 
            ID: {product.id.toString()} -
            Product: {product.name} - 
            Serial number: {product.serialNumber} - 
            Current Owner: {product.currentOwner} - 
            Current Location: {product.currentLocation} - 
            Price: {Web3.utils.fromWei(product.price, 'ether')} ETH -
            For Sale: {product.isForSale.toString()}
            {product.isForSale && product.currentOwner.toString().toLowerCase() != account && (
              <button onClick={() => handleBuyProduct(product.id, Web3.utils.fromWei(product.price, 'ether'))}>
                Buy
            </button>
            )}
            <h2>Ownership History:</h2>
    <ul>
      {product.ownershipHistory.map((event, eventIndex) => (
        <li key={eventIndex}>
          Transferred to: {event.newOwner} on {new Date(event.timestamp * 1000).toLocaleString()} - 
          Location: {event.newLocation} 
        </li>
      ))}
    </ul>
          </div>
        ))}
      </ul>

      
    </div>
  );
}

export default App;