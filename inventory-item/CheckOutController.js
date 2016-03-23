conAngular
    .controller('CheckOutController', ['$scope', '$state', '$stateParams', '$location', 'InventoryItemService', 'InventoryTransactionService', 'UserService', 'ClientService', 'SupplierService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $state, $stateParams, $location, InventoryItemService, InventoryTransactionService,  UserService, ClientService, SupplierService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){

        // Constants

        (function initController() {

            var currentPath = $location.path();
            initWithdrawalOptions( currentPath ); 
            getCheckOutTransactions();
            initCheckOutsDataTable();
            
        })();

        

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.searchByBarcode = function(){

            InventoryItemService.byBarcode( $scope.barcode, function( item ){
                if( item.errors ){
                    $scope.hasItem = false;
                    Materialize.toast( 'No se encontró ningún artículo con código de barras: "' + $scope.barcode + '"', 4000, 'red');
                    return;
                }
                $scope.item = item;
                $scope.hasItem = true;
                $scope.exitDate = new Date();
            });

        }// searchByBarcode

        $scope.withdraw = function( type ){

            switch( type ){
                case 'UnitItem': 
                    withdrawUnitItem( $scope.item.actable_id, $scope.exitDate, $scope.pickupCompany, $scope.pickupCompanyContact, $scope.returnDate, $scope.additionalComments );
                    break;
                case 'BulkItem': 
                    withdrawBulkItem( $scope.item.actable_id, $scope.item.withdrawQuantity, $scope.exitDate, $scope.pickupCompany, $scope.pickupCompanyContact, $scope.returnDate, $scope.additionalComments );
                    break;
                case 'BundleItem': 
                    withdrawBundleItem( $scope.item.actable_id, $scope.exitDate, $scope.pickupCompany, $scope.pickupCompanyContact, $scope.returnDate, $scope.additionalComments );
                    break;
            }

        }// withdraw

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

        $scope.multipleWithdrawal = function(){
            var ids = getItemIdsToWithdraw();
            InventoryItemService.multipleWithdrawal( ids, $scope.exitDate, $scope.pickupCompany, $scope.pickupCompanyContact, $scope.returnDate, $scope.additionalComments, function( response ){
                Materialize.toast( response.success, 4000, 'green');
                $state.go('/check-out', {}, { reload: true });
            });
        }



        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initWithdrawalOptions( currentPath ){

            if( currentPath.indexOf( 'withdraw-items' ) > -1 ){
                fetchItemsInStock();
                initMultipleWithdrawalDataTable();
                fetchSuppliers();
                $scope.exitDate = new Date();
                return;
            }

            if( currentPath.indexOf( 'withdraw-item/' ) > -1 ){
                getItem( $stateParams.itemId ); 
                return;
            }

            switch( currentPath ){
                case '/withdraw-unit-item':
                    getUnitItems();
                    break;
                case '/withdraw-bulk-item':
                    getBulkItems();
                    break;
                case '/withdraw-bundle-item':
                    getBundleItems();
                    break;
            }

            getProjectManagers();
            getAccountExecutives();
            getClients();
            initItemsDataTable();
        

        }// initWithdrawalOptions

        function getProjectManagers(){

            UserService.getProjectManagers( function( projectManagers ){
                $scope.projectManagers = projectManagers;                
            });

        }// getProjectManagers

        function getAccountExecutives(){

            UserService.getAccountExecutives( function( accountExecutives ){
                $scope.accountExecutives = accountExecutives;                
            });

        }// getAccountExecutives

        function getClients(){

            ClientService.getAll( function( clients ){
                $scope.clients = clients;                
            });

        }// getClients

        function getUnitItems(){

            InventoryItemService.byType( 'UnitItem', 1, function( unitItems ){
                $scope.unitItems = unitItems;
            }); 

        }// getUnitItems

        function getBulkItems(){

            InventoryItemService.byType( 'BulkItem', 1, function( bulkItems ){
                $scope.bulkItems = bulkItems;
            }); 

        }// getBulkItems

        function getBundleItems(){

            InventoryItemService.byType( 'BundleItem', 1, function( bundleItems ){
                $scope.bundleItems = bundleItems;
            }); 

        }// getBundleItems

        function initItemsDataTable(){

            $scope.dtItemsOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtItemsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initItemsDataTable

        function withdrawUnitItem( id, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments  ){

            InventoryItemService.withdrawUnitItem( id, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments, function( response ){

                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }

                Materialize.toast( response.success, 4000, 'green');
                $state.go('/check-out', {}, { reload: true });

            });

        }// withdrawUnitItem

        function withdrawBulkItem( id, quantity, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments ){

            if( $scope.multipleBulkLocations ){
                var withdrawQuantity = 0;
                var locations = [];

                angular.forEach( $scope.item.locations, function( location, key){
                    var $withdrawQuantityInput = $('#withdraw-quantity-' + key);
                    var $withdrawUnitsInput = $('#withdraw-units-' + key);

                    if( '' == $withdrawQuantityInput.val() || '' == $withdrawUnitsInput.val() ) return 1;

                    locations.push({
                        location_id:  location.location_id,
                        quantity:     parseInt( $withdrawQuantityInput.val() ),
                        units:        parseInt( $withdrawUnitsInput.val() )      
                    })
                    withdrawQuantity += parseInt( $withdrawQuantityInput.val() );
                });

                if( withdrawQuantity <= 0  ){
                    Materialize.toast( '¡Cantidad o unidades inválidas! Por favor ingresa el número de unidades que desear retirar y las unidades a desocupar.', 4000, 'red');
                    return;
                }
                quantity = withdrawQuantity;
            }
            
            InventoryItemService.withdrawBulkItem( id, quantity, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments, locations,  function( response ){

                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }

                Materialize.toast( response.success, 4000, 'green');
                $state.go('/check-out', {}, { reload: true });

            });

        }// withdrawBulkItem

        function withdrawBundleItem( id, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments ){

            var parts = getBundlePartsToRemove();
            InventoryItemService.withdrawBundleItem( id, parts, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments,  function( response ){

                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }

                Materialize.toast( response.success, 4000, 'green');
                $state.go('/check-out', {}, { reload: true });

            });

        }// withdrawBundleItem

        function getBundlePartsToRemove(){
            var parts = [];
            $('input[type="checkbox"]:checked').each( function(i, partCheckbox){
                parts.push( $(partCheckbox).val() );
            });
            return parts;
        }

        function getItemIdsToWithdraw(){
            var ids = []
            $('input[type="checkbox"]:checked').each( function(i, partCheckbox){
                ids.push( $(partCheckbox).val() );
            });
            return ids;
        }

        function getCheckOutTransactions(){

            InventoryTransactionService.getCheckOuts( function( checkOutTransactions ){
                $scope.checkOutTransactions = checkOutTransactions;
            }); 

        }// getCheckOutTransactions

        function initCheckOutsDataTable(){

            $scope.dtCheckOutsOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtCheckOutsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(4).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initCheckOutsDataTable

        function getItem( id ){
            InventoryItemService.byId( id, function( item ){
                if( item.errors ){
                    $scope.hasItem = false;
                    Materialize.toast( 'No se encontró ningún artículo con id: "' + id + '"', 4000, 'red');
                    return;
                }
                console.log( item );
                $scope.item = item;
                $scope.exitDate = new Date();
                if( 'BundleItem' == item.actable_type ){
                    $scope.itemParts = [];
                    $scope.hasPartsToWithdraw = false;
                    $.each( item.parts, function(i, part){
                        if( part.status == 2 ) return true;

                        $scope.itemParts.push( part );
                        $scope.hasPartsToWithdraw = true;
                    });
                }
                if( 'BulkItem' == item.actable_type ){
                    $scope.multipleBulkLocations = item.locations.length > 0 ? true : false;
                    console.log( $scope.multipleBulkLocations );
                }
            });
        }// getItem

        function fetchItemsInStock(){
             InventoryItemService.getInStock( function( items ){
                console.log( items );
                $scope.inventoryItems = items;
            });
        }

        function initMultipleWithdrawalDataTable(){

            $scope.dtMultipleWithdrawalOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtMultipleWithdrawalColumnDefs = [
                DTColumnDefBuilder.newColumnDef(4).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initMultipleWithdrawalDataTable

        function fetchSuppliers(){
            SupplierService.getAll( function( suppliers ){
                $scope.suppliers = suppliers;
            }); 
        }// fetchSuppliers


}]);