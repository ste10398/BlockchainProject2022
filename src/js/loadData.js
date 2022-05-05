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
  },

  //called from the html
  load: function(watches, components) {

    console.log(JSON.stringify(watches))
    console.log(JSON.stringify(components))

    var p_correct = $("#correct");
    var p_not_correct = $("#notCorrect");

    p_correct.hide();
    p_not_correct.hide();

    //now here the data will be load on the blockchain
  }

};

$(function() {
    $(window).load(function() {
      LoadData.init(); //inizialize the app whenever the window opens
    });
});