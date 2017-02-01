conAngular
    .controller('InventoryTransactionController', ['$scope', '$state', '$stateParams', 'InventoryTransactionService', 'SupplierService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', '$location', function($scope, $state, $stateParams, InventoryTransactionService, SupplierService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions, $location){

        // Constants
        
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


        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initInventoryTransactions( currentPath ){
            if( currentPath.indexOf( '/view-inventory-transaction' ) > -1 ){
                getInventoryTransaction( $stateParams.transactionId );
                return;
            }

            if( 0 !== Object.keys( $stateParams ).length ) {
                LoaderHelper.showLoader('Cargando movimientos al inventario...');
                switch( $stateParams.transactionType ){
                    case 'checkIns':
                    case 'checkOuts':
                        getTransactionsByType( $stateParams.transactionType ); 
                        break;
                    default:
                        getAllInventoryTransactions();
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
            console.log( transaction );
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
                .withDisplayLength(10)
                .withDOM('pitrp')
                .withOption('responsive', true)
                .withButtons([
                    {
                        extend: "csvHtml5",
                        fileName:  "CustomFileName" + ".csv",
                        exportOptions: {
                            //columns: ':visible'
                            columns: [1, 2, 3, 4, 5]
                        },
                        exportData: {decodeEntities:true}
                    }
                ]);
            $scope.dtInventoryTransactionsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(6).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initInventoryTransactionsDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

}]);