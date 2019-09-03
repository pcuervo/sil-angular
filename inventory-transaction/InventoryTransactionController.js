conAngular
  .controller('InventoryTransactionController', ['$scope', '$rootScope', '$state', '$stateParams', 'InventoryTransactionService', 'SupplierService', 'NotificationService', 'ProjectService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', '$location', function($scope, $rootScope, $state, $stateParams, InventoryTransactionService, SupplierService, NotificationService, ProjectService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, $location){
      
    (function initController() {
      var currentPath = $location.path();
      initInventoryTransactions( currentPath );
      fetchNewNotifications();
    })();

    /******************
    * PUBLIC FUNCTIONS
    *******************/

    $scope.getTransactionType = function( type ){
        switch( type ){
            case 'UnitItem':
                return 'Unitaria'
            case 'BulkItem':
                return 'Granel'
            case 'BundleItem':
                return 'Paquete'
        }
    }// getTransactionType

    $scope.getItemTypeIcon = function( type ){
        switch( type ){
            case 'UnitItem': return "[ fa fa-square ]";
            case 'BulkItem': return "[ fa fa-align-justify ]";
            case 'BundleItem': return "[ fa fa-th-large ]";
        }
    }// getItemTypeIcon

    $scope.getTransactionTypeClass = function( type ){
        if( 'CheckOutTransaction' == type ) return 'red lighten-3';

        return 'green lighten-3';
    }// getTransactionTypeClass

    $scope.getTransactionConcept = function( concept ){
        if( 'CheckOutTransaction' == concept ) return 'Salida';

        return 'Entrada';
    }

    $scope.searchTransactions = function(){
        LoaderHelper.showLoader('Buscando...');
        InventoryTransactionService.search( $scope.keyword, function( inventoryTransactions ){
            console.log(inventoryTransactions);
            if(! inventoryTransactions.length){
                Materialize.toast( 'No se encontró ningún artículo con el criterio seleccionado.', 4000, 'red');
            }
            $scope.inventoryTransactions = inventoryTransactions;
            LoaderHelper.hideLoader();
        })
    }// searchItem
    
    $scope.searchByFolio = function(){
        LoaderHelper.showLoader('Buscando...');
        InventoryTransactionService.searchByFolio( $scope.folio, function( inventoryTransactions ){
            console.log(inventoryTransactions);
            if(! inventoryTransactions.length){
                Materialize.toast( 'No se encontró ningún movimiento para ese folio.', 4000, 'red');
            }
            $scope.inventoryTransactions = inventoryTransactions;
            LoaderHelper.hideLoader();
        })
    }// searchItem

    $scope.printFolio = function(){
        window.print();
    }

    $scope.cancelFolio = function(){
      var confirmation = confirm( '¿Estás seguro que deseas cancelar el folio? Las piezas se devolverán a su ubicación original.' );
      if( confirmation ){
        InventoryTransactionService.cancelFolio( $scope.folio, function( response ){
          Materialize.toast( response.success, 4000, 'green');
          $state.go('/view-folio', { 'folio' : response.folio }, { reload: true });
        });   
      }
    }

    /******************
    * PRIVATE FUNCTIONS
    *******************/

    function initInventoryTransactions( currentPath ){
        if( currentPath.indexOf( '/view-inventory-transaction' ) > -1 ){
            getInventoryTransaction( $stateParams.transactionId );
            return;
        }

        if( currentPath.indexOf( '/view-folio' ) > -1 ){
          $scope.canCancel = false;
          $scope.folio = $stateParams.folio;
          getByFolio($scope.folio);
          initItemsFolioDT();
          return;
        }

        if( currentPath == '/transactions-by-project' ){
          fetchProjects();
          $scope.inventoryTransactions = [];
        }

        if( 0 !== Object.keys( $stateParams ).length ) {
          LoaderHelper.showLoader('Cargando movimientos al inventario...');
          if( $rootScope.globals.currentUser.role == 6 ){
              getAllInventoryTransactions();
          } else {
              LoaderHelper.hideLoader();
          }
        } 
        try {
          initInventoryTransactionsDataTable();
        }
        catch(err) {
          location.reload();
        }
        
    }// initInventoryTransactions

    function getInventoryTransaction( id ){
        InventoryTransactionService.byId( id, function( inventoryTransaction ){
            initTransaction( inventoryTransaction );
            $scope.inventoryTransaction = inventoryTransaction;
        }); 
    }

    function initTransaction( transaction ){
        getSupplier( transaction.delivery_pickup_company );
        $scope.transactionDate = transaction.entry_exit_date;
        $scope.itemName = transaction.inventory_item.name;
        $scope.itemStatus = transaction.inventory_item.status;
        $scope.concept = transaction.concept;
        $scope.quantity = transaction.quantity;
        $scope.itemType = $scope.getTransactionType( transaction.inventory_item.actable_type );
        $scope.itemTransactionType = '  ';
        $scope.additionalComments = transaction.additional_comments;
        $scope.supplierContact = transaction.delivery_pickup_contact;
    }

    function getSupplier( id ){
        SupplierService.byId( id, function( supplier ){
            $scope.supplier = supplier.name;
        }); 
    }

    function getAllInventoryTransactions(){
        InventoryTransactionService.getAll( function( inventoryTransactions ){
            $scope.inventoryTransactions = inventoryTransactions;
            console.log(inventoryTransactions);
            LoaderHelper.hideLoader();
        }); 
    }// getAllInventoryTransactions

    function getTransactionsByType( type ){

        InventoryTransactionService.byType( type, function( inventoryTransactions ){
            $scope.inventoryTransactions = inventoryTransactions;
            LoaderHelper.hideLoader();
        }); 

    }// getTransactionsByType

    function initInventoryTransactionsDataTable(){
        $scope.dtInventoryTransactionsOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withOption('searching', true)
            .withDisplayLength(30)
            .withOption('responsive', true)
            .withDOM('pitrp');
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

    }// initInventoryTransactionsDataTable

    function initInventoryTransactionsFolioDataTable(){
        $scope.dtInventoryTransactionsFolioOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withOption('searching', true)
            .withDisplayLength(10)
            .withDOM('pitrp')
            .withOption('responsive', true)
            .withButtons([
                {
                    extend: "csvHtml5",
                    fileName:  "CustomFileName" + ".csv",
                    exportOptions: {
                        //columns: ':visible'
                        columns: [0, 1, 2, 3, 4]
                    },
                    exportData: {decodeEntities:true}
                }
            ]);
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

    }// initInventoryTransactionsFolioDataTable

    function getByFolio( folio ){
        InventoryTransactionService.searchByFolio( folio, function( inventoryTransactions ){
            console.log(inventoryTransactions);
            if( ! inventoryTransactions.length ){
                Materialize.toast( 'No se encontró ningún movimiento para ese folio.', 4000, 'red');
                $state.go('/dashboard', {}, { reload: true });
            }

            $scope.inventoryTransaction = inventoryTransactions[0];
            $scope.inventoryTransactions = inventoryTransactions;
            $scope.canCancel = canCancel($scope.inventoryTransaction);
            LoaderHelper.hideLoader();
        });
    }

    function canCancel(transaction){
      if( transaction.folio.indexOf('Cancelado') > 0 ) return false;

      return true;
    }

    function initItemsFolioDT(){
        $scope.dtFolioItemsDTOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withOption('searching', true)
            .withDisplayLength(1000)
            .withDOM('itr')
            .withOption('responsive', true);
        DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

    }// initItemsFolioDT

    function fetchNewNotifications(){
        NotificationService.getNumUnread( function( numUnreadNotifications ){
            NotificationHelper.updateNotifications( numUnreadNotifications );
        });
    }

    function fetchProjects(){
      LoaderHelper.showLoader('Cargando proyectos...');
      ProjectService.all( function( projects ){
        $scope.projects = projects;
        LoaderHelper.hideLoader();
      });
    }

    $scope.searchByProject = function(){
      LoaderHelper.showLoader('Buscando movimientos...');
      InventoryTransactionService.byProject( $scope.selectedProject, function( inventoryTransactions ){
        console.log(inventoryTransactions);
        LoaderHelper.hideLoader();
        if(! inventoryTransactions.length){
          Materialize.toast( 'No se encontró ningún artículo con el criterio seleccionado.', 4000, 'red');
          $scope.inventoryTransactions = [];
          return;
        }

        $scope.inventoryTransactions = inventoryTransactions;
      })
    }// searchByProject

    $scope.getTransactionDate = function(transaction){
      console.log(transaction);
      if(typeof transaction.entry_date !== 'undefined'){
        return transaction.entry_date;
      }
      return transaction.exit_date;
    }
}]);