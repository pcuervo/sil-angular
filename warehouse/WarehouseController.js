conAngular
    .controller('WarehouseController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'WarehouseService', 'InventoryItemService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $rootScope, $state, $stateParams, $location, WarehouseService, InventoryItemService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){

        /******************
        * CONSTANTS
        *******************/
        var STATUS_EMPTY = 1;
        var STATUS_OCCUPIED = 2;
        var STATUS_FULL = 3;

        (function initController() {
            $scope.role = $rootScope.globals.currentUser.role;
            var currentPath = $location.path();
            initWarehouseOptions( currentPath );
            fetchNewNotifications();
        })();

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        $scope.getStatusClass = function( status ){

            switch( status ){
                case STATUS_EMPTY:
                    $scope.statusDescription = 'Vacío';
                    return '[ green white-text lighten-1 ]';
                    break;
                case STATUS_OCCUPIED:
                    $scope.statusDescription = 'Parcial';
                    return '[ yellow lighten-1 ]';
                    break;
                case STATUS_FULL:
                    $scope.statusDescription = 'Ocupado';
                    return '[ red white-text lighten-1 ]';
            }

        }// getStatusClass

        $scope.getItemTypeIcon = function( type ){
            switch( type ){
                case 'UnitItem': return "[ fa fa-square ]";
                case 'BulkItem': return "[ fa fa-align-justify ]";
                case 'BundleItem': return "[ fa fa-th-large ]";
            }
        }// getItemTypeIcon

        $scope.updateLocations = function( rackId ){
            LoaderHelper.showLoader('Cargando ubicaciones...');
            WarehouseService.getRackAvailableLocations( rackId, function( locations ){
                $scope.locations = locations;
                LoaderHelper.hideLoader();
            } )
        }// updateLocations

        $scope.updateLocationSelect = function( rackId, index ){
            WarehouseService.getRackAvailableLocations( rackId, function( locations ){
                $scope.multipleLocations[index] = locations;
            } )
        }// updateLocationSelect

        $scope.showLocationDetails = function( locationId ){
            $.each( $scope.locations, function( i, location ){
                if( location.id != locationId ) return true;
                $scope.hasSameLocation = true;
                $scope.sameLocationType = true;
                $scope.currentLocation = location;
            });
        }// showLocationDetails

        $scope.addToLocation = function(){

            LoaderHelper.showLoader( 'Agregando artículo a ubicación...' );
            if( $scope.sameLocationType && ! $scope.multipleLocationsType ){
                
                WarehouseService.locateItem( $scope.item.id, this.selectedLocation, $scope.quantity, true, function( response ) {
                    Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                   $state.go('/view-item', { 'itemId' : $scope.item.id }, { reload: true });
                });
                return;
            }

            if( 'BundleItem' == $scope.item.actable_type )
            {
                var partsLocation = [];
                $.each($scope.currentLocations, function(i, location){
                    partsLocation[i] = {
                        partId:      $('#parts-' + i).val(),
                        locationId: location.id,
                        units:      $('#units-' + i).val()
                    }
                });
                WarehouseService.locateBundle( $scope.item.id, partsLocation, $scope.parts.length, true, function( response ) {
                    Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                   $state.go('/view-item', { 'itemId' : $scope.item.id }, { reload: true });
                });
                return;
            }
            WarehouseService.locateBulk( $scope.item.id, $scope.bulkLocations, true, function( response ) {
                Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
               $state.go('/view-item', { 'itemId' : $scope.item.id }, { reload: true });
            });

        }// addToLocation

        $scope.showLocationForm = function( type ){
            if( 'same' === type ){
                $scope.sameLocationType = true;
                $scope.multipleLocationsType = false;
                return;
            }
            $scope.sameLocationType = false;
            $scope.multipleLocationsType = true;

            if( 'BundleItem' == $scope.item.actable_type ){
                $scope.partsToLocate = $scope.parts;
                return;
            }
            $scope.pendingUnitsToLocate = $scope.quantity;
            $scope.bulkLocations = [];
        }

        $scope.restrictUnits = function( locationId, index ){
            $.each( $scope.multipleLocations[index], function( i, location ){
                if( location.id != locationId ) return true;

                $scope.hasMultipleLocations = true;
                $scope.currentLocations[index] = location;
            });
        }// restrictUnits

        $scope.createRack = function(){
            WarehouseService.createRack( $scope.rackName, $scope.rows, $scope.columns, 1000, function( rack ){
                Materialize.toast('¡Se ha creado el rack: "' + rack.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-rack', { 'rackId' : rack.id }, { reload: true });
            });
        }// createRack

        $scope.editLocation = function(){
            WarehouseService.editLocation( $scope.locationId, $scope.locationName, $scope.units, function( location ){
                Materialize.toast('¡Se ha editado la ubicación: "' + $scope.locationName + '" exitosamente!', 4000, 'green');
                $state.go('/view-location', { 'locationId' : location.id  }, { reload: true });
            });
        }// editLocation

        $scope.getEntryType = function( type ){
            switch( type ){
                case 'UnitItem': return 'Unitaria';
                case 'BulkItem': return 'Granel';
                case 'BundleItem': return 'Paquete'
            }
        }// getEntryType

        $scope.addUnitsToLocation = function(){
            if( $scope.itemRequestId > 0 ){
                $scope.unitsToLocate = this.unitsToLocate;
                $scope.selectedLocation = this.selectedLocation;
                $scope.units = this.units;
                $scope.selectedRack = this.selectedRack;
            }

            var bulkLocation = {
                locationId:     $scope.selectedLocation,
                location:       $('#location option:selected').text(),
                quantity:       $scope.unitsToLocate,
                rack:           $('#rack option:selected').text()
            }

            $scope.bulkLocations.push( bulkLocation );
            console.log( $scope.bulkLocations );
            $scope.pendingUnitsToLocate -= $scope.unitsToLocate;
            $scope.hasMultipleLocations = true;

            if( $scope.itemRequestId > 0 ){
                this.selectedLocation = '';
                this.selectedRack = '';
                this.unitsToLocate = '';
            }

            $scope.selectedLocation = '';
            $scope.selectedRack = '';
            $scope.unitsToLocate = '';
        }

        $scope.removeUnitsFromLocation = function( bulkLocationId ){
            console.log( $scope.bulkLocations[bulkLocationId] );
            $scope.pendingUnitsToLocate += parseInt( $scope.bulkLocations[bulkLocationId].quantity );
            $scope.bulkLocations.splice( bulkLocationId, 1 );
            $('#bulk-units-'+bulkLocationId).remove();
        }

        $scope.changeRack = function( rackId ){
            getRackRelocation( rackId );
        }// changeRack

        $scope.changeRackToTransfer = function( rackId ){
            $scope.showRack = true;
            getRackTransfer( rackId );
        }// changeRack

        $scope.deleteRack = function( rackId ){
            var confirmation = confirm( '¿Estás seguro que deseas eliminar el rack?' );
            if( confirmation ){
                WarehouseService.deleteRack( rackId, function(){
                    Materialize.toast('¡Se ha eliminado el rack!', 4000, 'red');
                    $('#'+rackId).remove();
                });
            }
        }// deleteRack

        $scope.emptyRack = function( rackId ){
            var confirmation = confirm( '¿Estás seguro que deseas vaciar el rack? Este proceso no afecta el inventario, solo sus ubicaciones.' );
            if( confirmation ){
                WarehouseService.emptyRack( rackId, function(){
                    Materialize.toast('¡Se ha vaciado el rack!', 4000, 'red');
                    $state.go('/view-racks', {}, { reload: true });
                });
            }
        }// emptyRack

        $scope.updateRows = function( column ){
            var columnText = $('[name="columns"] option:selected').text();
            if( 1 == column && ( 'piso' == columnText || 'taller' == columnText ) ){
                $scope.rows = 1;
                $scope.units = 100000;
                $scope.isFloor = true;
                return;
            }

            $scope.rows = '';
            $scope.units = '';
            $scope.isFloor = false;
        }// updateRows

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

        $scope.getTransactionTypeClass = function( concept ){
            switch( concept ){
                case 'Entrada':
                    return 'green lighten-3';
                case 'Salida':
                    return 'red lighten-3';
                default:
                    return 'yellow lighten-3';
            }
        }// getTransactionTypeClass

        $scope.getRackLocationLink = function( id, locations ){
            $('#'+id+' .js-location-links').empty();
            var links = '';
            $.each( locations, function( i, val ){
                links += '<a href="#/view-location/' + val.location_id + '">' + val.location + '</a><br>';
            });
            $('#'+id+' .js-location-links').append( links );
            //return links;
        }

        $scope.markAsFull = function(){
            WarehouseService.markAsFull( $scope.locationId, function(){
                Materialize.toast('Ubicación marcada como llena', 4000, 'green');
                $state.go('/view-location', { locationId: $scope.locationId }, { reload: true });
            });
        }

        $scope.markAsAvailable = function(){
            WarehouseService.markAsAvailable( $scope.locationId, function(){
                Materialize.toast('Ubicación marcada como disponible', 4000, 'green');
                $state.go('/view-location', { locationId: $scope.locationId }, { reload: true });
            });
        }

        $scope.prepareCSVForLocation = function($fileContent){
            $scope.itemsToLocate = [];
            LoaderHelper.showLoader('Leyendo CSV...');
            var lines = $fileContent.split('\n');

            for(var line = 0; line < lines.length; line++){
                if( 0 === line ) continue;

                var itemToLocate = {};
                var lineResults= lines[line].split(',');

                itemToLocate['barcode'] = lineResults[0];
                itemToLocate['quantity'] = lineResults[1];
                itemToLocate['location'] = lineResults[2];

                $scope.itemsToLocate.push(itemToLocate);
            }
            console.log($scope.itemsToLocate);
            $scope.content = $fileContent;
            $scope.fileWasRead = true;
            LoaderHelper.hideLoader();
        };

        $scope.locateItemsCSV = function(){
            LoaderHelper.showLoader('Ubicando artículos...');
            WarehouseService.csvLocate( $scope.userToken, $scope.itemsToLocate, function(response){
                LoaderHelper.hideLoader();
                if( response.success ){
                    Materialize.toast( response.success, 4000, 'green');
                    $state.go('/csv-locate', {}, { reload: true });
                }

                $scope.hasErrors = true;
                $scope.updateErrors = response.errors;
                $scope.updatedOrders = response.updated_orders;
                console.log(response);
            });
        }

        $scope.removeItem = function(itemId){
            LoaderHelper.showLoader('Sacando artículo de ubicación...');
            WarehouseService.removeItem( $scope.userToken, $scope.locationId, itemId, function(response){
                LoaderHelper.hideLoader();
                if( response.success ){
                    Materialize.toast( response.success, 4000, 'green');
                    $state.go('/view-location', {
                        locationId: $scope.locationId
                    }, { reload: true });
                }

                Materialize.toast(response.errors, 4000, 'red');
            });
        }

        // $scope.getTransactionName = function( concept ){
        //     switch( concept ){
        //         case 'Entrada': return 'Entrada';
        //         case 'Salida':
        //             return 'red lighten-3';
        //         default:
        //             return 'yellow lighten-3';
        //     }
        // }// getTransactionName

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initWarehouseOptions( currentPath ){

            if( currentPath.indexOf('view-racks') > -1 ){
                LoaderHelper.showLoader('Cargando racks...');
                fetchWarehouseRacks();
                initRacksDataTable( 10 );
                return;
            }
            
            if( currentPath.indexOf('rack-contents') > -1 ){
                LoaderHelper.showLoader('Cargando contenidos del rack...');
                initInventoryTransactionsDataTable();
                getRack( $stateParams.rackId );
                return;
            }

            if( currentPath.indexOf('view-rack') > -1 ){
                LoaderHelper.showLoader('Cargando rack...');
                getRack( $stateParams.rackId );
                try{
                    initRackItemsDataTable();
                }
                catch(err){
                    console.log(err);
                    location.reload();
                }
                return;
            }

            if( currentPath.indexOf('view-location') > -1 || currentPath.indexOf('edit-location') > -1  ){
                getLocation( $stateParams.locationId );
                try{
                    initRackItemsDataTable();
                }
                catch(err){
                    console.log(err);
                    //location.reload();
                }
                return;
            }

            if( currentPath.indexOf('locate-item') > -1 ){
                LoaderHelper.showLoader('Cargando información del artículo...');
                getItem( $stateParams.itemId );
                fetchWarehouseRacks();
                return;
            }

            if( currentPath.indexOf('relocate') > -1 ){
                LoaderHelper.showLoader( 'Reubicando artículo(s)...' );
                fetchWarehouseRacks();
                getItemLocation( $stateParams.itemId, $stateParams.locationId )
                return;
            }

            if( currentPath.indexOf('view-warehouse-transactions') > -1 ){
                fetchWarehouseTransactions();
                initWarehouseTransactionsDataTable();
                return;
            }

            if( currentPath.indexOf('transfer-location') > -1 ){
                $scope.showRack = false;
                LoaderHelper.showLoader( 'Cargando Racks...' );
                fetchWarehouseRacks();
                getLocation( $stateParams.locationId )
                $('body').on('click', '.js-transfer-location', function(){
                    var oldLocationId = $stateParams.locationId;
                    var newLocationId = $(this).data('location');
                    
                    transferLocation( oldLocationId, newLocationId );
                    LoaderHelper.showLoader('Traspasando ubicación...');
                });
                return;
            }

            switch( currentPath ){
                case '/add-rack':
                    console.log('add');
                    $scope.isFloor = false;
                    break;
                case '/wh-dashboard':
                    LoaderHelper.showLoader('Cargando ubicaciones...');
                    fetchStats();
                    //fetchWarehouseRacks();
                    getItemsWithPendingLocation();
                    initRacksDataTable( 5 );
                    initPendingLocationDataTable();
                    break;
                case '/csv-locate':
                    $scope.fileWasRead = false;
                    $scope.hasErrors = false;
                    $scope.itemsToLocate = [];
                    initItemsToLocateDataTable();
                    break;
            }

        }// initWarehouseOptions

        function getRack( id ){
            WarehouseService.getRack( id, function( rack ){
                var hasLocations = true;
                displayRack( rack.locations, rack.rack_info.columns, hasLocations, false );
                $scope.warehouse_locations = rack.locations;
                $scope.rack = rack;
                getItemsByRack( id );
            });
        }// getRack

        function getRackRelocation( id ){
            WarehouseService.getRack( id, function( rack ){
                var hasLocations = false;
                displayRack( rack.locations, rack.rack_info.columns, hasLocations, false );
                $scope.warehouse_locations = rack.locations;
                getItemsByRack( id );
            });
        }

        function getRackTransfer( id ){
            WarehouseService.getRack( id, function( rack ){
                var isTransfer = true;
                displayRack( rack.locations, rack.rack_info.columns, false, isTransfer );
                $scope.warehouse_locations = rack.locations;
            });
        }

        function getItemsByRack( id ){
            WarehouseService.getItems( id, function( items ){
                $scope.items = items;
                LoaderHelper.hideLoader();
            });
        }

        function displayRack( locations, columns, hasLocations, isTransfer ){
            var rackHTML = [];
            $('.js-rack').empty();
            rackHTML = getRackHTML( locations, columns, hasLocations, isTransfer );
            $('.js-rack').append( rackHTML );
            conApp.initCards();
        }// displayRack

        function getRackHTML( locations, columns, hasLocations, isTransfer ){
            var rackHTML = [],
                currentRow = 0,
                colClass = getColClass( columns );

            rackHTML[ currentRow ] = '';
            $.each( locations, function( i, location ){
                console.log(location)
                var statusClass = $scope.getStatusClass( location.status );
                rackHTML[ currentRow ] += '\
                    <div class="[ col s12 ' + colClass + ' ]"> \
                        <div class="[ card ][ minimized ]"> \
                            <div class="[ title ]' + statusClass + '"> \
                                <h5>' + location.name + '</h5> \
                                <a class="minimize" href="#"><i class="mdi-navigation-expand-less"></i></a> \
                            </div> \
                            <div class="[ content ][ center-align ]">';
                if( isTransfer ){
                    if( location.status != 3 ){
                        rackHTML[currentRow] += '\
                            <p>Traspasar aquí</p> \
                            <button class="[ btn ][ mt-10 ][ js-transfer-location ]" data-location="' + location.id + '"><i class="[ fa fa-location-arrow ][ center-align ]"></i></button>';
                    }
                } else if( hasLocations ){
                    rackHTML[currentRow] += '\
                        <a class="[ btn ][ col-s6 ]" href="#/view-location/' + location.id + '"><i class="[ fa fa-eye ][ center-align ]"></i></a> \
                        <a class="[ btn ][ col-s6 ]" href="#/edit-location/' + location.id + '"><i class="[ fa fa-edit ][ center-align ]"></i></a>';
                } else {
                    rackHTML[currentRow] += '\
                        <p>Reubicar aquí</p> \
                        <button class="[ btn ][ mt-10 ][ js-location ]" data-location="' + location.id + '"><i class="[ fa fa-location-arrow ][ center-align ]"></i></button>';
                }

                rackHTML[ currentRow ] += '\
                            </div> \
                        </div> \
                    </div>';
                if( 0 == (i+1) % parseInt( columns )  ) rackHTML[ currentRow ] += '<div class="[ clear ]"></div>';

            });
            return rackHTML;

        }// getRackHTML

        function getColClass( columns ){
             switch( columns ){
                case 1:
                    colClass = 'm12';
                    break;
                case 2:
                    colClass = 'm6';
                    break;
                case 3:
                    colClass = 'm4';
                    break;
                case 4:
                    colClass = 'm3';
                    break;
                case 5:
                    colClass = 'm2';
                    break;
                case 6:
                    colClass = 'm2';
                    break;
                default:
                    colClass = 'm1';
            }// switch
            return colClass;
        }// getColClass

        function getLocation( id ){

            WarehouseService.getLocation( id, function( location ){
                $scope.locationId = location.id;
                $scope.rack = location.warehouse_rack.name;
                $scope.rackId = location.warehouse_rack.id;
                $scope.locationName = location.name;
                $scope.status = location.status;
                $scope.units = location.units;
                $scope.totalUnits = location.units;
                $scope.item_location_quantity = 0;
                $scope.numItems = 0;
                $scope.inventory_items = location.inventory_items;
                console.log(location.inventory_items);
                $.each( location.inventory_items, function(i, val){
                    $scope.item_location_quantity += location.item_locations[i].quantity;
                });
                $scope.numItems = $scope.inventory_items.length;
            });

        }// getLocation

        function getItemLocation( itemId, locationId ){
            console.log('getting ItemLocation');
            WarehouseService.getItemLocation( itemId, locationId, function( itemLocation ){
                $scope.itemLocation = itemLocation;
                $scope.quantityToRelocate = itemLocation.quantity;
                console.log( $scope.quantityToRelocate );
                $('.js-barcode').JsBarcode( itemLocation.barcode );
                getRackRelocation( itemLocation.rack_id );
                $('body').on('click', '.js-location', function(){
                    var oldLocationId = itemLocation.location_id;
                    var newLocationId = $(this).data('location');
                    
                    relocateItem( itemId, $scope.quantityToRelocate, oldLocationId, newLocationId );
                    LoaderHelper.showLoader('Reubicando artículo(s)...');
                });
                LoaderHelper.hideLoader();
            });
        }// getItemLocation

        function getItem( id ){
            InventoryItemService.byId( id, function( item ){
                LoaderHelper.hideLoader();
                var currentPath = $location.path();
                $scope.item = item;
                $scope.itemName = item.name;

                if( currentPath.indexOf('locate-item') <= -1 ){
                    $('.js-barcode').JsBarcode( item.barcode );
                }

                $scope.hasMultipleLocations = false;
                $scope.multipleLocations = [];
                $scope.currentLocations = [];

                LoaderHelper.showLoader('Cargando cantidad a reubicar...');
                $scope.quantity = item.quantity;
                InventoryItemService.isReentryWithPendingLocation( item.id, function( response ){
                    if( 'undefined' != typeof response.quantity ) $scope.quantity = response.quantity;
                    LoaderHelper.hideLoader();
                });
            });
        }// getItem

        function getItemsWithPendingLocation(){
            InventoryItemService.withPendingLocation( function( locations ){
                $scope.pending_locations = locations;
            });

            InventoryItemService.reentryWithPendingLocation( function( locations ){
                $scope.reentryPendingLocations = locations;
            });
        }// getItemsWithPendingLocation

        function initPendingLocationDataTable(){
            $scope.dtPendingLocationOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength( 15 )
                .withDOM('itp')
                .withOption('responsive', true)
                .withOption('order', [])
                .withOption('searching', false);
            $scope.dtPendingLocationColumnDefs = [
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initPendingLocationDataTable

        function initRackItemsDataTable(){
            $scope.dtRackItemsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(40)
                .withDOM('pitp')
                .withButtons([
                    {
                        extend: "csvHtml5",
                        fileName:  "CustomFileName" + ".csv",
                        exportOptions: {
                            columns: [1, 2, 3, 4, 5, 6, 7]
                        },
                        exportData: {decodeEntities:true}
                    }
                ])
                .withOption('responsive', true);
            $scope.dtRackItemsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(6).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initRackItemsDataTable

        function fetchWarehouseRacks(){
            WarehouseService.getRacks( function( racks ){
                $scope.racks = racks;
                LoaderHelper.hideLoader();
            });
        }// fetchWarehouseRacks

        function fetchWarehouseTransactions(){
            WarehouseService.getWarehouseTransactions( function( transactions ){
                console.log(transactions);
                $scope.transactions = transactions;
            });
        }// fetchWarehouseTransactions

        function initRacksDataTable( displayLength ){
            $scope.dtRackOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDOM('itp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withDisplayLength( displayLength )
            $scope.dtRackColumnDefs = [
                DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }//initRacksDataTable

        function relocateItem( itemId, quantityToRelocate, oldLocationId,  newLocationId ){
            WarehouseService.relocateItem( itemId, quantityToRelocate, oldLocationId,  newLocationId, function( item_location ) {
                if( item_location.errors ){
                    Materialize.toast( item_location.errors, 4000, 'red' );
                    LoaderHelper.hideLoader();
                    return;
                }

                Materialize.toast('¡Se reubicó el artículo: "' + item_location.inventory_item.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-location', {
                    locationId: item_location.warehouse_location.id
                 }, { reload: true });
                location.reload();
            });
            return;
        }

        function transferLocation( oldLocationId, newLocationId ){
            WarehouseService.transferLocation(oldLocationId, newLocationId, function( item_location ) {
                console.log(item_location)
                if( item_location.errors ){
                    Materialize.toast( item_location.errors, 4000, 'red' );
                    LoaderHelper.hideLoader();
                    return;
                }

                Materialize.toast('¡Traspaso exitoso!', 4000, 'green');
                $state.go('/view-location', {
                    locationId: newLocationId
                 }, { reload: true });
            });
            return;
        }

        function fetchNewNotifications(){
            NotificationService.getNumUnread( function( numUnreadNotifications ){
                NotificationHelper.updateNotifications( numUnreadNotifications );
            });
        }

        function fetchStats(){
            WarehouseService.stats( function( stats ){
                $scope.stats = stats;
                LoaderHelper.hideLoader();
            });
        }

        function initItemsToLocateDataTable(){
            $scope.toLocateDtOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withDisplayLength(30)
                .withDOM('itp')
                .withOption('responsive', true)
                .withOption('order', []);
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initInventoryDataTable

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
                            columns: [0, 1, 2, 3, 4]
                        },
                        exportData: {decodeEntities:true}
                    }
                ]);
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initInventoryTransactionsDataTable

        function initWarehouseTransactionsDataTable(){
            $scope.dtWarehouseTransactionsOptions = DTOptionsBuilder.newOptions()
                .withPaginationType('full_numbers')
                .withOption('searching', true)
                .withDisplayLength(10)
                .withDOM('pitrp')
                .withOption('responsive', true);
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');

        }// initWarehouseTransactionsDataTable
}]);