conAngular
    .controller('CheckOutController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'InventoryItemService', 'InventoryTransactionService', 'UserService', 'ClientService', 'SupplierService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $rootScope, $state, $stateParams, $location, InventoryItemService, InventoryTransactionService,  UserService, ClientService, SupplierService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){

        (function initController() {
            $scope.role = $rootScope.globals.currentUser.role;
            var currentPath = $location.path();
            initWithdrawalOptions( currentPath ); 
            getCheckOutTransactions();
            initCheckOutsDataTable();
            fetchNewNotifications();
        })();


        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.searchByBarcode = function(){
            var isReEntry = false;
            InventoryItemService.byBarcode( $scope.barcode, isReEntry, function( item ){
                if( item.errors ){
                    $scope.hasItem = false;
                    Materialize.toast( 'No se encontró ningún artículo con código de barras: "' + $scope.barcode + '"', 4000, 'red');
                    return;
                }
                getItem( item.id );
                //$scope.item = item;
                $scope.hasItem = true;
                $scope.exitDate = new Date();
            });

        }// searchByBarcode

        $scope.withdraw = function( type ){

            LoaderHelper.showLoader( 'Registrando salida...' );
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

        $scope.withdrawExpress = function( type ){

            switch( type ){
                case 'UnitItem': 
                    withdrawUnitItem( this.item.actable_id, this.exitDate, this.pickupCompany, this.pickupCompanyContact, this.returnDate, this.additionalComments );
                    break;
                case 'BulkItem': 
                    withdrawBulkItem( this.item.actable_id, this.item.withdrawQuantity, this.exitDate, this.pickupCompany, this.pickupCompanyContact, this.returnDate, this.additionalComments );
                    break;
                case 'BundleItem': 
                    withdrawBundleItem( this.item.actable_id, this.exitDate, this.pickupCompany, this.pickupCompanyContact, this.returnDate, this.additionalComments );
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
            $scope.withdrawnItems = getItemsToWithdraw();
            InventoryItemService.multipleWithdrawal( $scope.withdrawnItems, $scope.exitDate, $scope.pickupCompany, $scope.pickupCompanyContact, $scope.returnDate, $scope.additionalComments, function( response ){
                Materialize.toast( response.success, 4000, 'green');
                console.log( $scope.withdrawnItems );
                $scope.isSummary = true;
                $scope.selectedPickupCompanyText = $('[name="pickupCompany"] option:selected').text();
                //$state.go('/check-out', {}, { reload: true });
            });
        }

        $scope.printSummary = function(){
            window.print();
        }

        $scope.requestWithdrawal = function(){
            var items = getItemsToWithdraw();
            InventoryItemService.requestWithdrawal( items, $scope.exitDate, $scope.pickupCompany, function( withdrawRequest ){
                Materialize.toast( "Has solicitado la salida de " + withdrawRequest.withdraw_request_items.length + " artículo(s). Se le ha enviado una notificación al jefe de almacén.", 4000, 'green');
                $state.go('/check-out', {}, { reload: true });
            });
        }

        $scope.authorizeWithdrawal = function(){
            var quantities = [];
            $('.quantities').each( function(i, quantityInput){
                quantities.push( $(quantityInput).val() );
            });
            console.log( quantities );
            InventoryItemService.authorizeWithdrawal( $scope.withdrawRequest.id, $scope.pickupCompanyContact, $scope.additionalComments, quantities, function( response ){
                console.log( response );
                Materialize.toast( "Has aprobado la salida exitosamente. Se le ha enviado una notificación al usuario que la solicitó.", 4000, 'green');
                $state.go('/check-out', {}, { reload: true });
            });
        }

        $scope.cancelWithdrawalRequest = function( id ){
            InventoryItemService.cancelWithdrawal( id, function( response ){
                console.log( response );
                Materialize.toast( "Has cancelado la solicitud exitosamente.", 4000, 'green');
                $state.go('/pending-withdrawal-requests', {}, { reload: true });
            });
        }

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initWithdrawalOptions( currentPath ){

            if( currentPath.indexOf( 'withdraw-items' ) > -1 ){
                LoaderHelper.showLoader('Obteniendo artículos en existencia...');
                fetchItemsInStock();
                initMultipleWithdrawalDataTable();
                fetchSuppliers();
                $scope.exitDate = new Date();
                return;
            }

            if( currentPath.indexOf( 'withdraw-item/' ) > -1 ){
                $scope.isSummary = false;
                getItem( $stateParams.itemId ); 
                fetchSuppliers();
                return;
            }

            if( currentPath.indexOf( '/authorize-withdrawal' ) > -1 ){
                fetchSuppliers();
                getWithdrawRequest( $stateParams.withdrawRequestId );
            }

            switch( currentPath ){
                case '/pending-withdrawals':
                    getPendingWithdrawals();
                    initPendingWithdrawalsDataTable();
                    break;
                case '/withdraw-unit-item':
                    getUnitItems();
                    break;
                case '/withdraw-bulk-item':
                    getBulkItems();
                    break;
                case '/withdraw-bundle-item':
                    getBundleItems();
                    break;
                case '/request-exit':
                    fetchItemsInStock();
                    initMultipleWithdrawalDataTable();
                    fetchSuppliers();
                    $scope.exitDate = new Date();
                    break;
                case '/pending-withdrawal-requests':
                    getPendingWithdrawalRequests();
                    initPendingWithdrawalRequestsDataTable();
                    break;
                case '/express-withdrawal':
                    $scope.isSummary = false;
                    fetchSuppliers();
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
                console.log(unitItems);
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

                LoaderHelper.hideLoader();
                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }

                Materialize.toast( response.success, 4000, 'green');
                $scope.isSummary = true;
                $scope.selectedPickupCompanyText = $('[name="pickupCompany"] option:selected').text();

            });

        }// withdrawUnitItem

        function withdrawBulkItem( id, quantity, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments ){

            LoaderHelper.hideLoader();
            if( $scope.multipleBulkLocations ){
                var withdrawQuantity = 0;
                var locations = [];

                angular.forEach( $scope.item.locations, function( location, key){
                    var $withdrawQuantityInput = $('#withdraw-quantity-' + key);
                    var $withdrawUnitsInput = $('#withdraw-units-' + key);

                    if( '' == $withdrawQuantityInput.val() || '' == $withdrawUnitsInput.val() ) return 1;



                    locations.push({
                        location:       location.location,
                        location_id:    location.location_id,
                        quantity:       parseInt( $withdrawQuantityInput.val() ),
                        units:          parseInt( $withdrawUnitsInput.val() )      
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

                $scope.fromLocations = locations;
                Materialize.toast( response.success, 4000, 'green');
                $scope.isSummary = true;
                $scope.selectedPickupCompanyText = $('[name="pickupCompany"] option:selected').text();

            });

        }// withdrawBulkItem

        function withdrawBundleItem( id, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments ){

            LoaderHelper.hideLoader();
            var parts = getBundlePartsToRemove();
            InventoryItemService.withdrawBundleItem( id, parts, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments,  function( response ){

                if( response.errors ){
                    Materialize.toast( response.errors, 4000, 'red');
                    return;
                }

                Materialize.toast( response.success, 4000, 'green');
                $scope.removedParts = parts;
                $scope.isSummary = true;
                $scope.selectedPickupCompanyText = $('[name="pickupCompany"] option:selected').text();

            });

        }// withdrawBundleItem

        function getBundlePartsToRemove(){
            var parts = [];
            $('input[type="checkbox"]:checked').each( function(i, partCheckbox){
                parts.push( $(partCheckbox).val() );
            });
            return parts;
        }

        function getItemsToWithdraw(){
            var items = []
            $('input[type="checkbox"]:checked').each( function(i, partCheckbox){
                item = {};
                item['id'] = $(partCheckbox).val();
                item['inventory_item_id'] = $(partCheckbox).val();
                item['name'] = $( '#name-'+item['id'] ).text();
                item['serial_number'] = $( '#serial-number-'+item['id'] ).text();
                item['quantity'] = $( '#quantity-'+item['id'] ).val();
                items.push( item );
            });
            return items;
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

                $scope.item = item;
                $scope.exitDate = new Date();
                $scope.locations = '';
                $.each( item.locations, function(i, loc){
                    console.log( loc );
                    $scope.locations += loc.location + ', ';
                });
                $scope.locations = $scope.locations.replace(/,\s*$/, "");

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
                }
            });
        }// getItem

        function fetchItemsInStock(){
            LoaderHelper.showLoader('Obteniendo artículos en existencia...');
            InventoryItemService.getInStock( function( items ){
                LoaderHelper.hideLoader();
                $scope.inventoryItems = items;
            });
        }

        function initMultipleWithdrawalDataTable(){
            $scope.dtMultipleWithdrawalOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('riftp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', true);
            $scope.dtMultipleWithdrawalColumnDefs = [
                DTColumnDefBuilder.newColumnDef(5).notSortable(),
                DTColumnDefBuilder.newColumnDef(6).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initMultipleWithdrawalDataTable

        function fetchSuppliers(){
            SupplierService.getAll( function( suppliers ){
                $scope.suppliers = suppliers;
            }); 
        }// fetchSuppliers

        function getPendingWithdrawals(){
            InventoryItemService.getPendingWithdrawals( function( pendingInventoryItems ){
                $scope.pendingInventoryItems = pendingInventoryItems;
            }); 
        }// getPendingWithdrawals

        function initPendingWithdrawalsDataTable(){
            $scope.dtPendingWithdrawalsOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtPendingWithdrawalsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(4).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initPendingWithdrawalsDataTable

        function getPendingWithdrawalRequests(){
            InventoryItemService.getPendingWithdrawalRequests( function( withdrawRequests ){
                $scope.withdrawRequests = withdrawRequests;
            });
        }// getPendingWithdrawalRequests

        function initPendingWithdrawalRequestsDataTable(){
            $scope.dtPendingWithdrawalRequestsOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
                    .withDOM('it')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtPendingWithdrawalRequestsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initPendingWithdrawalRequestsDataTable

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

        function getWithdrawRequest( id ){
            InventoryItemService.getWithdrawRequest( id, function( withdrawRequest ){
                console.log( withdrawRequest );
                $scope.withdrawRequest = withdrawRequest;
                $scope.withdrawItems = withdrawRequest.withdraw_request_items;
                $scope.exitDate = new Date( withdrawRequest.exit_date );
                $scope.deliveryCompany = withdrawRequest.pickup_company_id;
                // $scope.itemRequestId = item.id;
                // $scope.projectName = item.project;
                // $scope.selectedProject = item.project_id;
                // $scope.pmName = item.pm;
                // $scope.aeName = item.ae;
                // $scope.itemName = item.name;
                // $scope.itemQuantity = item.quantity;
                // $scope.itemType = item.item_type;
                // $scope.description = item.description;
                // 
                // if( null != item.validity_expiration_date ){
                //     $scope.validityExpirationDate = new Date( item.validity_expiration_date );
                // }
                // $scope.itemState = item.state;
                // getWithdrawState( item.state );
            });
        }// getWithdrawRequest
}]);