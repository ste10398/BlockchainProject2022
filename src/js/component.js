//var csv = require('jquery-csv');
var csv = require('jquery-csv')

App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load watches.
    $.getJSON('../watches.json', function(data) {
      var watchInfo = $('#watchInfo');
      var watchInfoTable = $('watchInfoTable');
      for (i = 0; i < data.length; i ++) {
        
        watchInfo.find('#watchId').text(data[i].ID);
        watchInfo.find('#watchName').text(data[i].Name);
        watchInfo.find('#watchBrand').text(data[i].Brand);
        watchInfo.find('#watchPrice').text(data[i].Price);

        watchInfoTable.append(watchInfo.html());
      }
    });

    $.getJSON('../components.json', function(datacomponent) {
        var componentsRow = $('#componentsRow');
        var componentTemplate = $('#componentTemplate');
        for (i = 0; i < data.length; i ++) {
            //qui i dati sono da sistemare anche in base agli indici che vengono creati quando si genera il json
            componentTemplate.find('#idComponent').text(datacomponent[i].ID);
            componentTemplate.find('#componentName').text(datacomponent[i].Name);
            componentTemplate.find('#brandName').text(datacomponent[i].Brand);
            componentTemplate.find('#producerName').text(datacomponent[i].producer);
            componentTemplate.find('#productionDate').text(datacomponent[i].date);
            componentTemplate.find('#componentMaterial').text(datacomponent[i].material);
            componentTemplate.find('#componentColor').text(datacomponent[i].color);
            componentTemplate.find('#componentDescription').text(datacomponent[i].description);
  
          componentsRow.append(componentTemplate.html());
        }
      });

    //$.csv.toArray('../../mint_contracts/watches_data.csv');

    return await App.initWeb3();
  },

  initWeb3: /*async*/ function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('ERC998TopDown.json', function(data){

      //get the contract artifact file and instanciate it with @truffle/contract
      var ERC998Artifacts = data;
      App.contracts.ERC998TopDown = TruffleContract(ERC998Artifacts);

      App.contracts.ERC998TopDown.setProvider(App.web3Provider);

      //return App.markSolded();
      //set the provider for our contracts

    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
    //per andare all'area personale dell'utente
    $(document).on('click', '.btn-personal-area', function(event){
      event.preventDefault();
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        var filename = "personal_area.html?account=" + account;
        load(filename);
      });
    });
  },

//   markSolded: function() {

//     var soldingInstance;
//     App.contracts.ERC998TopDown.deployed().then(function(instance) {
//       soldingInstance = instance;

//       return soldingInstance.tokenCount();
//     }).then(function(tokenCount) {
//       for (i = 0; i <= tokenCount; i++){
//         //buyers[i] !== '0x0000000000000000000000000000000000000000'
//         if(soldingInstance.soldTokensId(i) == true){
//           $('.card-watch').eq(i).find('btn-buy').text('Solded').attr('disabled', true);
//         }
//       }
//     }).catch(function(err) {
//       console.log(err.meesage);
//     });

//   },

  handleBuy: function(event) {
    event.preventDefault();

    var watchId = parseInt($(event.target).data('id'));

    var soldingInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ERC998TopDown.deployed().then(function(instance) {
        soldingInstance = instance;

        // Execute buy watch as a transaction by sending account
        soldingInstance.buyToken({from: account}, watchId);
      }).then(function(result) {
        return App.markSolded();
      }).catch(function(err) {
        console.log(err.message);
      });
    }); 
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
