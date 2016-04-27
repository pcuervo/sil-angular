conAngular
    .controller('InventoryController', ['$rootScope', '$scope', '$state', '$stateParams', '$location', '$filter', 'ClientService', 'InventoryItemService', 'UnitItemService', 'BulkItemService', 'BundleItemService', 'ProjectService', 'UserService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function($rootScope, $scope, $state, $stateParams, $location, $filter, ClientService, InventoryItemService, UnitItemService, BulkItemService, BundleItemService, ProjectService, UserService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions){
        
        (function initController() {
            var currentPath = $location.path();
            initInventory( currentPath );
            fetchNewNotifications();
        })();

        
        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.getStatus = function( statusId ){
            switch( statusId ){
                case 1: return 'En existencia';
                case 2: return 'Sin existencias';
                case 3: return 'Existencia parcial';
                case 4: return 'Caducado';
                case 5: return 'Entrada pendiente';
                case 6: return 'Salida pendiente';
                default: return 'Validación pendiente';
            }
        }// getStatus

        $scope.searchItem = function(){

            if( 6 === $scope.role ){ 
                $scope.selectedClient = $rootScope.globals.currentUser.id;
            }
            if( 2 === $scope.role ){ 
                $scope.selectedPM = $rootScope.globals.currentUser.id;
            }
            if( 3 === $scope.role ){ 
                $scope.selectedAE = $rootScope.globals.currentUser.id;
            }
            InventoryItemService.search( $scope.selectedProject, $scope.selectedClient, $scope.selectedPM, $scope.selectedAE, $scope.selectedStatus, $scope.itemType, $scope.storageType, $scope.keyword, function( inventoryItems ){
                $scope.inventoryItems = inventoryItems;
                console.log( inventoryItems );
            })
        }// searchItem

        $scope.getItemTypeIcon = function( type ){
            switch( type ){
                case 'UnitItem': return "[ fa fa-square ]";
                case 'BulkItem': return "[ fa fa-align-justify ]";
                case 'BundleItem': return "[ fa fa-th-large ]";
            }
        }// getItemTypeIcon

        $scope.getNameClass = function( type ){
            switch( type ){
                case 'UnitItem':
                case 'BundleItem': return "m6";
                case 'BulkItem': return "m4";
            }
        }

        $scope.getStateClass = function( type ){
            switch( type ){
                case 'UnitItem': return "m4";
                case 'BundleItem': return "m6";
                case 'BulkItem': return "m4";
            }
        }

        $scope.getStatus = function( statusId ){
            InventoryItemService.getStatus( statusId, function( status ){
                $scope.itemStatus = status;
            });
        }

        $scope.printSummary = function(){
            window.print();
        }

        $scope.printBarcode = function( divId ){

            var barcodeEl = $(divId).html();

            var barcodeWindow = window.open('', 'my div', 'height=400,width=600');
            barcodeWindow.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>' + $scope.barcode + '</title>');
            barcodeWindow.document.write('<style>');
            barcodeWindow.document.write('@page{size:auto;margin:0}.card-image img{max-width:100%;display:block;margin-left:auto;margin-right:auto}.content h5{text-align:center}table{width:100%}#watermark{width:50%;height:auto;margin:0;color:#d0d0d0;position:absolute;left:25%;top:35%;opacity:.3;z-index:-1;-webkit-transform:rotate(-45deg);-moz-transform:rotate(-45deg)}');
            barcodeWindow.document.write('</style>');
            barcodeWindow.document.write('</head><body>');
            barcodeWindow.document.write('<table><tr><td>'+barcodeEl+'</td><td></td></tr>');
            barcodeWindow.document.write('<tr><td>Nombre</td><td>' + $scope.item.name + '</td></tr>');
            barcodeWindow.document.write('<tr><td>Proyecto</td><td>' + $scope.item.project_number + ' - ' + $scope.selectedProjectText + '</td></tr>');
            barcodeWindow.document.write('<tr><td>Cliente</td><td>' + $scope.clientName + ' - ' + $scope.clientContact + '</td></tr>');
            barcodeWindow.document.write('<tr><td>PM</td><td> ' + $scope.selectedPMText + '</td></tr>');
            barcodeWindow.document.write('<tr><td>Ejecutivo de cuenta</td><td>' + $scope.selectedAEText + '</td></tr>');
            if( 'undefined' != typeof $scope.serialNumber ){
                barcodeWindow.document.write('<tr><td>Número de serie</td><td>' + $scope.serialNumber + '</td></tr>');
            }
            barcodeWindow.document.write('</table><img id="watermark" src="data:image/jpeg;base64,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">');
            barcodeWindow.document.write('</body></html>');

            barcodeWindow.document.close(); // necessary for IE >= 10
            barcodeWindow.focus(); // necessary for IE >= 10
            barcodeWindow.print();
            //barcodeWindow.close();

            return true;
        }

        $scope.editItem = function( id, type ){
            LoaderHelper.showLoader( 'Actualizando artículo...' );
            switch( type ){
                case 'UnitItem':
                    editUnitItem( id );
                    break;
                case 'BulkItem':
                    editBulkItem( id );
                    break;
                case 'BundleItem':
                    editBundleItem( id );
                    break;
            }
        }// registerItem



        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initInventory( currentPath ){
            $scope.role = $rootScope.globals.currentUser.role;
            if( currentPath.indexOf( '/view-item' ) > -1 ){
                getItem( $stateParams.itemId );
                $scope.$on('$includeContentLoaded', function ( e, template ) {
                    if( 'inventory-item/templates/view-unit-item.html' == template || 'inventory-item/templates/view-bulk-item.html' == template || 'inventory-item/templates/view-bundle-item.html' == template ){
                        $('.js-barcode').JsBarcode( $scope.item.barcode );
                        $('[name="storageType"]').val( $scope.item.storage_type );
                        $('[name="itemType"]').val( $scope.item.item_type );
                        getItemState( $scope.item.state );
                    }
                });
                return;
            }

            if( currentPath.indexOf( '/edit-item' ) > -1 ){
                getItem( $stateParams.itemId );
                $scope.$on('$includeContentLoaded', function ( e, template ) {
                    if( 'inventory-item/templates/edit-unit-item.html' == template || 'inventory-item/templates/edit-bulk-item.html' == template || 'inventory-item/templates/edit-bundle-item.html' == template ){
                        $('.js-barcode').JsBarcode( $scope.item.barcode );
                        $('[name="storageType"]').val( $scope.item.storage_type );
                        $('[name="itemType"]').val( $scope.item.item_type );
                        getItemState( $scope.item.state );
                        if( 0 == $scope.item.value ) {
                            $scope.item.value = '';
                        } 
                    }
                });

            }

            switch( currentPath ){
                case '/my-inventory':
                    if( 1 === $scope.role ) {
                        fetchProjectManagers();
                        fetchAccountExecutives();
                        fetchClientContacts();
                    }
                    if( 6 === $scope.role ) {
                        $scope.selectedClient = $rootScope.globals.currentUser.id;
                    }
                    fetchInventory();
                    fetchProjects();
                    fetchStatuses();
                    initInventoryDataTable();
                    break;
            }
        }// initInventory

        function fetchInventory(){
            if( 1 === $scope.role ){
                InventoryItemService.getAll( function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                });
                return;
            }
            if( 2 === $scope.role ){ 
                $scope.selectedPM = $rootScope.globals.currentUser.id;
                InventoryItemService.search( '', '', $scope.selectedPM, '', '', '', '', '', function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                });
            }
            if( 3 === $scope.role ){ 
                $scope.selectedAE = $rootScope.globals.currentUser.id;
                InventoryItemService.search( '', '', '', $scope.selectedAE, '', '', '', '', function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                });
                return;
            }
            if( 6 === $scope.role ){ 
                $scope.selectedClient = $rootScope.globals.currentUser.id;
                InventoryItemService.search( '', $scope.selectedClient, '', '', '', '', '', '', function( inventoryItems ){
                    $scope.inventoryItems = inventoryItems;
                    console.log( inventoryItems );
                });
            }
        }// fetchInventory

        function initInventoryDataTable(){
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('pitp')
                .withOption('responsive', true)
                .withOption('order', []);
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');


        }// initInventoryDataTable

        function getItem( id ){
            InventoryItemService.byId( id, function( item ){
                if( item.errors ){
                    $scope.hasItem = false;
                    Materialize.toast( 'No se encontró ningún artículo con id: "' + id + '"', 4000, 'red');
                    return;
                }
                $scope.item = item;
                console.log( item );
                initItem( item );
                if( 'BundleItem' == item.actable_type ){
                    initItemPartsDataTable();
                    $scope.itemParts = item.parts;
                    $scope.hasPartsToWithdraw = false;
                }
                if( 'BulkItem' == item.actable_type ){
                    $scope.quantity = item.quantity;
                    $scope.itemQuantity = item.quantity;
                }
            });
        }// getItem

        function initItem( item ){
            $scope.project = item.project;
            $scope.pm = item.pm;
            $scope.ae = item.ae;
            $scope.clientName = item.client;
            $scope.clientContact = item.client_contact;
            $scope.description = item.description;
            $scope.itemName = item.name;
            $scope.itemState = item.state;
            $scope.itemType = item.item_type;
            $scope.storageType = item.storage_type;
            $scope.getStatus( item.status );
            $scope.itemValue = $filter( 'currency' )( item.value );
            $scope.entryDate = new Date( $filter('date')( item.created_at, 'yyyy-MM-dd' ) );
            $scope.item.validity_expiration_date = new Date( $filter('date')( item.validity_expiration_date, 'yyyy-MM-dd' ) );
            if( item.locations.length > 0 ){
                $scope.hasLocations = 1;
                initItemLocationsDataTable();
            }
        }// initItem

        function fetchProjects(){
            ProjectService.getAll( function( projects ){
                $scope.projects = projects;
            });
        }// fetchProjects

        function fetchStatuses(){
            InventoryItemService.getStatuses( function( statuses ){
                $scope.statuses = statuses;
            });
        }// fetchStatuses

        function fetchProjectManagers(){
            UserService.getProjectManagers( function( projectManagers ){
                $scope.projectManagers = projectManagers;
            });
        }// fetchProjectManagers

        function fetchAccountExecutives(){
            UserService.getAccountExecutives( function( accountExecutives ){
                $scope.accountExecutives = accountExecutives;
            });
        }// fetchAccountExecutives

        function fetchClientContacts(){
            UserService.getClientContacts( function( clientContacts ){
                $scope.clientContacts = clientContacts;
            });
        }// fetchClientContacts

        function getItemState( stateId ){
            InventoryItemService.getItemState( stateId, function( state ){
                $scope.itemStateLabel = state;
            });
        }

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

        function initItemLocationsDataTable(){
            $scope.dtItemLocationsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
            $scope.dtItemLocationsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
                DTColumnDefBuilder.newColumnDef(2).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initItemLocationsDataTable

        function editUnitItem( id ){
            UnitItemService.edit( id, $scope.item.name, $scope.item.serial_number, $scope.item.brand, $scope.item.model, $scope.item.description, $scope.item.value, $scope.item.storage_type, $scope.item.validity_expiration_date, $scope.item.state, $scope.item.is_high_value, true, function ( inventory_item ){

                LoaderHelper.hideLoader();
                if( inventory_item.errors ) {
                    ErrorHelper.display( inventory_item.errors );
                    $scope.currentStep = 1;
                    return;
                }
                console.log( inventory_item );
                Materialize.toast('Se actualizó el artículo: "' + inventory_item.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-item', { 'itemId' : inventory_item.id }, { reload: true });
            });

        }// editUnitItem

        function editBulkItem( id ){
            console.log( $scope.item.value );
            BulkItemService.edit( id, $scope.item.name, $scope.item.description, $scope.item.value, $scope.item.storage_type, $scope.item.validity_expiration_date, $scope.item.state, $scope.item.is_high_value, true, function ( inventory_item ){

                LoaderHelper.hideLoader();
                if( inventory_item.errors ) {
                    ErrorHelper.display( inventory_item.errors );
                    $scope.currentStep = 1;
                    return;
                }
                console.log( inventory_item );
                Materialize.toast('Se actualizó el artículo: "' + inventory_item.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-item', { 'itemId' : inventory_item.id }, { reload: true });
            });

        }// editBulkItem

        function editBundleItem( id ){
            console.log( $scope.item.state );
            BundleItemService.edit( id, $scope.item.name, $scope.item.description, $scope.item.value, $scope.item.storage_type, $scope.item.validity_expiration_date, $scope.item.state, $scope.item.is_high_value, true, function ( inventory_item ){

                LoaderHelper.hideLoader();
                if( inventory_item.errors ) {
                    ErrorHelper.display( inventory_item.errors );
                    $scope.currentStep = 1;
                    return;
                }
                console.log( inventory_item );
                Materialize.toast('Se actualizó el artículo: "' + inventory_item.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-item', { 'itemId' : inventory_item.id }, { reload: true });
            });

        }// editBundleItem

        function initItemPartsDataTable(){
            $scope.dtItemPartsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(20)
                .withDOM('')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
            $scope.dtItemPartsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
                DTColumnDefBuilder.newColumnDef(2).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initItemPartsDataTable

    }]);