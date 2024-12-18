// Last modified by Matteo Griso on 08/08/2024

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// import "@openzeppelin/contracts/access/Ownable.sol";


contract SupplyChainTracker /*is Ownable*/ {

    address public owner;
    uint256 public productCount;

    mapping(uint256 => Product) public products;
    mapping(uint256 => OwnershipEvent) public ownershipEvents;
    mapping(uint256 => SensorData) public sensorData;

    constructor() {
        owner = msg.sender;
        productCount = 0;
    }

/*    function transferContractOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }*/

    // This function allows me (the owner of the contract, to withdraw funds)
/*    function withdrawFunds() public onlyOwner {
        uint balance = address(this).balance;
        payable(owner).transfer(balance);
}*/

    struct Product {
        uint256 id;
        string name;
        address manufacturer;
        string serialNumber;
        address currentOwner;
        string currentLocation;
        uint256 timestamp;
        uint256 price;
        bool isForSale;
        uint[] ownershipEventIds;
        uint[] sensorEventIds;
    }

    struct OwnershipEvent {
        address newOwner;
        string newLocation;
        uint256 timestamp;
    }

    struct SensorData {
        uint timestamp;
        string paramName;
        string paramValue_str;
        uint paramValue_num;
        string location;
    }

    function addProduct (
        string memory _name,
        address _manufacturer,
        string memory _serialNumber,
        address _initialOwner,
        string memory _initialLocation,
        uint256 _price,
        bool _isForSale
    ) public payable {
        require(msg.sender == _manufacturer, "Only manufacturer can add products");
        require(msg.value >= (_price * 10) / 100, "Insufficient fee");

        products[productCount] = Product({
            id: productCount,
            name: _name,
            manufacturer: _manufacturer,
            serialNumber: _serialNumber,
            currentOwner: _initialOwner,
            currentLocation: _initialLocation,
            timestamp: block.timestamp,
            ownershipEventIds: new uint[](0),
            sensorEventIds: new uint[](0),
            price: _price,
            isForSale: _isForSale
        });

        productCount++;
    }

  function updateLocation(uint256 _productId, string memory _newLocation) public {
    require(_productId < productCount, "Product ID does not exist."); 
    require(msg.sender == products[_productId].currentOwner, "Only the current owner can update the location."); 
    products[_productId].currentLocation = _newLocation; 
  }

  function updatePrice(uint256 _productId, uint256 _newPrice) public {
    require(_productId < productCount, "Product ID does not exist."); 
    require(msg.sender == products[_productId].currentOwner, "Only the current owner can update the price."); 
    products[_productId].price = _newPrice;
  }

    function updateIsForSale(uint256 _productId, bool _isForSale) public {
    require(_productId < productCount, "Product ID does not exist."); 
    require(msg.sender == products[_productId].currentOwner, "Only the current owner can update the isForSale flag."); 
    products[_productId].isForSale = _isForSale; 
  }

function transferOwnership(uint256 _productId, address _newOwner, string memory _newLocation) public payable {
    // 1. Check if the product exists
    require(_productId < productCount, "Product ID does not exist."); 

    // 2. Check if the sender is the current owner
    require(msg.sender != products[_productId].currentOwner, "Current owner can't buy a from product from himself");

    // 3. Check if the product is actually for sale 
    require(products[_productId].isForSale, "This product is not currently for sale.");

    // 4. Check if the sent value meets or exceeds the product's price
    require(msg.value >= products[_productId].price, "Insufficient payment.");

    // Update product state (if all checks pass)
    // products[_productId].price = msg.value;
    products[_productId].currentOwner = _newOwner;
    products[_productId].currentLocation = _newLocation;

    // Transfer Ether to the previous owner
    payable(products[_productId].currentOwner).transfer(msg.value); 

    // Log the ownership transfer event 
    uint eventId = generateEventId();
    ownershipEvents[eventId] = OwnershipEvent(_newOwner, _newLocation, block.timestamp);
    products[_productId].ownershipEventIds.push(eventId);
}


    // Funzione per generare un ID evento univoco
    uint private eventIdCounter;
    function generateEventId() private returns (uint) {
        eventIdCounter++;
        return eventIdCounter;
    }

    // Funzione per ottenere la storia degli eventi di un prodotto
    function getOwnershipHistory(uint256 _productId) public view returns (OwnershipEvent[] memory) {
        uint[] memory eventIds = products[_productId].ownershipEventIds;
        OwnershipEvent[] memory history = new OwnershipEvent[](eventIds.length);

        for (uint i = 0; i < eventIds.length; i++) {
            history[i] = ownershipEvents[eventIds[i]];
        }

        return history;
    }

    // Funzione per ottenere l'elenco dei prodotti
    function getProducts() public view returns (Product[] memory) {
        Product[] memory history = new Product[](productCount);

        for (uint i = 0; i < productCount; i++) {
            history[i] = products[i];
        }

        return history;
    }

    // Funzione per registrare i dati dei sensori
    function recordSensorData(uint _productId, string memory _pName, string memory _spValue, uint _snValue, string memory _location) public {
        require(msg.sender == products[_productId].currentOwner, "Only the current owner can record sensor data");

        uint eventId = generateEventId();
        sensorData[eventId] = SensorData(block.timestamp, _pName, _spValue, _snValue, _location);
        products[_productId].sensorEventIds.push(eventId);
    }

    // Funzione per ottenere i dati dei sensori di un prodotto
    function getSensorData(uint _productId) public view returns (SensorData[] memory) {
        uint[] memory eventIds = products[_productId].sensorEventIds;
        SensorData[] memory data = new SensorData[](eventIds.length);

        for (uint i = 0; i < eventIds.length; i++) {
            uint index = eventIds[i];
            data[i] = sensorData[index];
        }

        return data;
    }
}

