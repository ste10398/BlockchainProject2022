//var csv = require('jquery-csv');
var csv = require('jquery-csv')

App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load watches.
    $.getJSON('../watches.json', function(data) {
      var watchesRow = $('#watchesRow');
      var watchesTemplate = $('#watchTemplate');

      for (i = 0; i < data.length; i ++) {
        watchesTemplate.find('.card-title').text(data[i].Name);
        watchesTemplate.find('.card-subtitle').text(data[i].Brand);
        watchesTemplate.find('img').attr('src', data[i].Image);
        watchesTemplate.find('.text-watch').text(data[i].Description);
        watchesTemplate.find('.price-watch').text(data[i].Price);
        watchesTemplate.find('.btn-buy').attr('data-id', data[i].ID);

        watchesRow.append(watchesTemplate.html());
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

      return App.markSolded();
      //set the provider for our contracts

    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
    //qui deve andare alla pagina del singolo orologio per vedere tutte le caratteristiche ed i componenti
    $(document).on('click', '.btn-view', function(event){
      event.preventDefault();
      var watchId = parseInt($(event.target).data('id'));
      var filename = "watchInfo.html?id=" + watchId;
      load(filename);
    });
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

  markSolded: function() {

    var soldingInstance;
    App.contracts.ERC998TopDown.deployed().then(function(instance) {
      soldingInstance = instance;

      return soldingInstance.tokenCount();
    }).then(function(tokenCount) {
      for (i = 0; i <= tokenCount; i++){
        //buyers[i] !== '0x0000000000000000000000000000000000000000'
        if(soldingInstance.soldTokensId(i) == true){
          $('.card-watch').eq(i).find('btn-buy').text('Solded').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.meesage);
    });

  },

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
