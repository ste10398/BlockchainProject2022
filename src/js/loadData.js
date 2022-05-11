LoadData = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  //initialize the app
  init: function() {
    return LoadData.initWeb3();
  },

  //connection of the client to the blockchain
  initWeb3: function() {
      // TODO: refactor conditional
      if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      LoadData.web3Provider = web3.currentProvider;
      web3 = new Web3(LoadData.web3Provider);
      } else {
      // Specify default instance if no web3 instance provided
      LoadData.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545'); //local blockchain instance
      web3 = new Web3(LoadData.web3Provider);
      }
      return LoadData.initContract();
  },

  //initialize the contract so we can interact
  initContract: function() {
      //questo funziona perchè usiamo il bs-config.json file
      $.getJSON("ERC998TopDown.json", function(composable) {
          // Instantiate a new truffle contract from the artifact
          LoadData.contracts.ERC998TopDown = TruffleContract(composable);
          // Connect provider to interact with contract
          LoadData.contracts.ERC998TopDown.setProvider(LoadData.web3Provider);
      });

      $.getJSON("SampleNFT.json", function(component) {
          // Instantiate a new truffle contract from the artifact
          LoadData.contracts.SampleNFT = TruffleContract(component);
          // Connect provider to interact with contract
          LoadData.contracts.SampleNFT.setProvider(LoadData.web3Provider);
          
          return LoadData.render(); //render the content of the page
      });
  },

//show the content on the page
render: function() {
  var submitForm = $("#loadForm");

  submitForm.show();

  (async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      LoadData.account = accounts[0];
    } catch (e) {
        // Deal with the fact the chain failed
    }
})();
},

//called from the html
load: function(watches, components) {

  console.log(JSON.stringify(watches))
  console.log(JSON.stringify(components))
  console.log(LoadData.account)

  var p_correct = $("#correct");
  var p_not_correct = $("#notCorrect");

  p_correct.hide();
  p_not_correct.hide();

  //now here the data will be load on the blockchain

  //MINTING
  for(w in watches) {
    (async () => {
      var wat = w;
      LoadData.contracts.ERC998TopDown.deployed().then(function(instance){
        return instance.mint(watches[wat].urlWatch, {from: LoadData.account})
      }).then(function(ris){
        console.log("Watch "+watches[wat].idWatch+" minted");
      });;
    })(); 
  }
  
  for(c in components) {
    (async () => {
      var con = c;
      await LoadData.contracts.SampleNFT.deployed().then(function(instance){
        return instance.mint721(components[con].urlComponent, {from: LoadData.account})
      }).then(function(ris){
        console.log("Componet "+components[con].idComponent+" minted");
      });
    })();
  }

  //get ERC998 adress
  var add998 = '0x0';
  (async () => {
    await LoadData.contracts.ERC998TopDown.deployed().then(function(instance){
      add998 = instance.address;
    });
  })(); 
 
  const Web3Utils = require('web3-utils');
  //PAIRING
  for(c in components) {
    (async () => {
      var con = c;
      LoadData.contracts.SampleNFT.deployed().then(function(instance){
        return instance.transferToFather(LoadData.account, add998, components[con].idComponent, web3Utils.padLeft(web3Utils.toHex(components[con].idParentWatch), 32), { from: LoadData.account, gas: 500000 });
      }).then(function(ris){
        console.log("Componet "+components[con].idComponent+" transferred to Watch "+components[con].idParentWatch);
      });;
    })();
  }
}

};

$(function() {
  $(window).load(function() {
    LoadData.init(); //inizialize the app whenever the window opens
  });
});