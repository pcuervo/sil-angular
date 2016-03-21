conAngular
    .controller('WarehouseController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'WarehouseService', 'InventoryItemService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $rootScope, $state, $stateParams, $location, WarehouseService, InventoryItemService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){
        
        /******************
        * CONSTANTS
        *******************/
        var STATUS_EMPTY = 1;
        var STATUS_OCCUPIED = 2;
        var STATUS_FULL = 3;

        (function initController() {
            var currentPath = $location.path();
            initWarehouseOptions( currentPath ); 
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
            WarehouseService.getRackAvailableLocations( rackId, function( locations ){
                $scope.locations = locations;
            } )
        }// updateLocations

        $scope.updateLocationSelect = function( rackId, index ){
            WarehouseService.getRackAvailableLocations( rackId, function( locations ){
                $scope.multipleLocations[index] = locations;
            } )
        }// updateLocations

        $scope.showLocationDetails = function( locationId ){
            $.each( $scope.locations, function( i, location ){
                if( location.id != locationId ) return true;
                $scope.hasSameLocation = true;
                $scope.sameLocationType = true;
                $scope.currentLocation = location;
            });
        }// showLocationDetails

        $scope.addToLocation = function(){

            LoaderHelper.showLoader( 'Ubicando en almacén...' );
            if( $scope.sameLocationType && ! $scope.multipleLocationsType ){
                switch( $scope.item.actable_type ){
                    case 'UnitItem': 
                        var quantity = 1;
                        break;
                    case 'BulkItem': 
                        var quantity = $scope.quantity;
                        break;
                    default:
                        var quantity = $scope.parts.length;
                }
                WarehouseService.locateItem( $scope.item.id, $scope.selectedLocation, $scope.units, quantity, true, function( response ) {
                    console.log( response );
                    Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                    $state.go('/wh-dashboard', {}, { reload: true });
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
                    $state.go('/wh-dashboard', {}, { reload: true });
                });
                return;
            }
            WarehouseService.locateBulk( $scope.item.id, $scope.bulkLocations, true, function( response ) {
                Materialize.toast('¡Se ubicó el artículo: "' + $scope.itemName + '" exitosamente!', 4000, 'green');
                $state.go('/wh-dashboard', {}, { reload: true });
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
            WarehouseService.createRack( $scope.rackName, $scope.rows, $scope.columns, $scope.units, function( rack ){
                Materialize.toast('¡Se ha creado el rack: "' + rack.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-rack', { 'rackId' : rack.id }, { reload: true });
            });
        }// createRack

        $scope.editLocation = function(){
            WarehouseService.editLocation( $scope.locationId, $scope.locationName, $scope.units, function( location ){
                console.log( location );
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
            var bulkLocation = {
                locationId:     $scope.selectedLocation,
                quantity:       $scope.unitsToLocate,
                units:          $scope.units,
                rack:           $scope.selectedRack
            }

            $scope.bulkLocations.push( bulkLocation );
            $scope.pendingUnitsToLocate -= $scope.unitsToLocate;
            $scope.hasMultipleLocations = true;
            $scope.selectedLocation = '';
            $scope.selectedRack = '';
            $scope.unitsToLocate = '';
            $scope.units = '';
        }

        $scope.changeRack = function( rackId ){
            console.log( rackId );
            getRackRelocation( rackId );
        }// changeRack
 
        $scope.locationTest = function( locationId ){
            console.log( locationId );
        }

        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initWarehouseOptions( currentPath ){

            if( currentPath.indexOf('view-racks') > -1 ){
                fetchWarehouseRacks();
                initRacksDataTable(); 
                return;
            }

            if( currentPath.indexOf('view-rack') > -1 ){
                getRack( $stateParams.rackId ); 
                initRackItemsDataTable();
                return;
            }

            if( currentPath.indexOf('view-location') > -1 || currentPath.indexOf('edit-location') > -1  ){
                getLocation( $stateParams.locationId ); 
                return;
            }

            if( currentPath.indexOf('locate-item') > -1 ){
                getItem( $stateParams.itemId ); 
                fetchWarehouseRacks();
                return;
            }

            if( currentPath.indexOf('relocate') > -1 ){
                LoaderHelper.showLoader( 'Cargando reubicación de mercancía.' );
                fetchWarehouseRacks();
                getItemLocation( $stateParams.itemId, $stateParams.locationId )
                return;
            }

            if( currentPath.indexOf('view-warehouse-transactions') > -1 ){
                fetchWarehouseTransactions();
                initWarehouseTransactionsDataTable(); 
                return;
            }

            getItemsWithPendingLocation();
            initPendingLocationDataTable();
    
        }// initWarehouseOptions

        function getRack( id ){
            WarehouseService.getRack( id, function( rack ){
                var hasLocations = true;
                displayRack( rack.locations, rack.rack_info.columns, hasLocations );
                $scope.warehouse_locations = rack.locations;
                $scope.rack = rack;
                console.log( rack );
                getItemsByRack( id );
            }); 
        }// getRack

        function getRackRelocation( id ){
            WarehouseService.getRack( id, function( rack ){
                console.log( rack );
                var hasLocations = false;
                displayRack( rack.locations, rack.rack_info.columns, hasLocations );
                $scope.warehouse_locations = rack.locations;
                getItemsByRack( id );
            }); 
        }// getRackRelocation

        function getItemsByRack( id ){
            WarehouseService.getItems( id, function( items ){
                $scope.items = items;
            }); 
        }

        function displayRack( locations, columns, hasLocations ){
            var rackHTML = [];
            $('.js-rack').empty();    
            switch( columns ){
                case 8:
                    rackHTML = getRackHTMLEightCol( locations, columns, hasLocations )
                    break;
                default:
                    rackHTML = getRackHTML( locations, columns, hasLocations )
                    break;
            }
            $('.js-rack').append( rackHTML );
            conApp.initCards();
        }// displayRack

        function getRackHTML( locations, columns, hasLocations ){
            var rackHTML = [],
                currentRow = 0,
                colClass = getColClass( columns );

            rackHTML[ currentRow ] = '';
            $.each( locations, function( i, location ){
                var statusClass = $scope.getStatusClass( location.status );
                rackHTML[ currentRow ] += '\
                    <div class="[ col s12 ' + colClass + ' ]"> \
                        <div class="[ card ][ minimized ]"> \
                            <div class="[ title ]' + statusClass + '"> \
                                <h5>' + location.name + '</h5> \
                                <a class="minimize" href="#"><i class="mdi-navigation-expand-less"></i></a> \
                            </div> \
                            <div class="content"> \
                                <p>Disponibilidad</p> \
                                <p class="[ h1 ]">' + location.available_units + '/' + location.units + '</p>';
                if( hasLocations ){
                    rackHTML[currentRow] += '\
                        <a class="[ btn ][ col s12 ]" href="#/view-location/' + location.id + '"><i class="[ fa fa-eye ][ center-align ]"></i></a> \
                        <a class="[ btn ][ col s12 ][ mt-10 ]" href="#/edit-location/' + location.id + '"><i class="[ fa fa-edit ][ center-align ]"></i></a>';
                } else {
                    rackHTML[currentRow] += '\
                        <p>Reubicar aquí</p> \
                        <button class="[ btn ][ col s12 ][ mt-10 ][ js-location ]" data-location="' + location.id + '"><i class="[ fa fa-location-arrow ][ center-align ]"></i></button>';
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
                case 2:
                    colClass = 'm6';
                    break;
                case 3:
                    colClass = 'm4';
                    break;
                case 4:
                    colClass = 'm3';
                    break;
                case 6:
                    colClass = 'm2';
                    break;
                default:
                    colClass = 'm1';
            }// switch
            return colClass;
        }// getColClass

        function getRackHTMLEightCol( locations, columns, hasLocations ){
            var rackHTML = [];
            var currentRow = 0;
            rackHTML[ currentRow ] = '';

            $.each( locations, function( i, location ){
                var statusClass = $scope.getStatusClass( location.status );
                if( i % 2 == 0 ) rackHTML[ currentRow ] += '<div class="[ col s12 m3 ]"><div class="row">';
                rackHTML[ currentRow ] += '\
                    <div class="[ col s6 ]"> \
                        <div class="[ card ][ minimized ]"> \
                            <div class="[ title ]' + statusClass + '"> \
                                <h5>' + location.name + '</h5> \
                                <a class="minimize" href="#"><i class="mdi-navigation-expand-less"></i></a> \
                            </div> \
                            <div class="content"> \
                                <p>Capacidad</p> \
                                <p class="[ h1 ]">' + location.available_units + '/' + location.units + '</p>';
                if( hasLocations ){
                    rackHTML[currentRow] += '\
                        <a class="[ btn ][ col s12 ]" href="#/view-location/' + location.id + '"><i class="[ fa fa-eye ][ center-align ]"></i></a> \
                        <a class="[ btn ][ col s12 ][ mt-10 ]" href="#/edit-location/' + location.id + '"><i class="[ fa fa-edit ][ center-align ]"></i></a>';
                } else {
                    rackHTML[currentRow] += '\
                        <p>Reubicar aquí</p> \
                        <button class="[ btn ][ col s12 ][ mt-10 ][ js-location ]" data-location="' + location.id + '"><i class="[ fa fa-location-arrow ][ center-align ]"></i></button>';
                }

                rackHTML[ currentRow ] += '\
                            </div> \
                        </div> \
                    </div>';
                if( i % 2 == 1 ) rackHTML[ currentRow ] += '</div></div>';

                if( ( parseInt( i )+1 ) % 8 == 0) {
                    currentRow += 1;
                    rackHTML[ currentRow ] = '<div class="[ clear ]"></div>';
                }
            });

            return rackHTML;
        }// getRackHTMLEightCol

        function getLocation( id ){

            WarehouseService.getLocation( id, function( location ){
                $scope.locationId = location.id;
                $scope.rack = location.warehouse_rack.name;
                $scope.locationName = location.name;
                $scope.status = location.status;
                $scope.units = location.units;
                $scope.totalUnits = location.units;
                $scope.item_location_units = 0;
                $scope.numItems = 0;
                $scope.inventory_items = [];
                $.each( location.inventory_items, function(i, val){
                    $scope.inventory_items.push( val.inventory_item );
                    $scope.item_location_units += location.item_locations[i].units;
                });
                $scope.numItems = $scope.inventory_items.length;
            }); 

        }// getLocation

        function getItemLocation( itemId, locationId ){
            WarehouseService.getItemLocation( itemId, locationId, function( itemLocation ){
                $scope.itemLocation = itemLocation;
                $('.js-barcode').JsBarcode( itemLocation.barcode );
                getRackRelocation( itemLocation.rack_id ); 
                //$scope.selectedRack = itemLocation.rack_id;
                $('body').on('click', '.js-location', function(){
                    var newLocationId = $(this).data('location');
                    LoaderHelper.showLoader('reubicando');
                    relocateItem( $scope.itemLocation.id, newLocationId );
                });
                LoaderHelper.hideLoader();
            }); 
        }// getItemLocation

        function getItem( id ){
            InventoryItemService.byId( id, function( item ){
                var currentPath = $location.path();
                $scope.item = item;
                $scope.itemName = item.name;

                if( currentPath.indexOf('locate-item') <= -1 ){
                    $('.js-barcode').JsBarcode( item.barcode );
                }
                if( 'UnitItem' === item.actable_type ) return;

                $scope.hasMultipleLocations = false;
                $scope.multipleLocations = [];
                $scope.currentLocations = [];

                if( 'BundleItem' === item.actable_type ) {
                    $scope.parts = item.parts;
                    return;
                }
                if( 'BulkItem' === item.actable_type ) $scope.quantity = item.quantity;

            }); 
        }// getItem

        function getItemsWithPendingLocation(){
            InventoryItemService.withPendingLocation( function( locations ){
                $scope.pending_locations = locations;
            }); 
        }// getItemsWithPendingLocation

        function initPendingLocationDataTable(){
            $scope.dtPendingLocationOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(10)
                    .withDOM('itp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtPendingLocationColumnDefs = [
                DTColumnDefBuilder.newColumnDef(6).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initPendingLocationDataTable

        function initRackItemsDataTable(){
            $scope.dtRackItemsOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(10)
                    .withDOM('itp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtRackItemsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initRackItemsDataTable

        function initWarehouseTransactionsDataTable(){
            $scope.dtWarehouseTransactionsOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(30)
                    .withDOM('itp')
                    .withOption('responsive', true)
                    .withOption('order', [])
                    .withOption('searching', false);
            $scope.dtWarehouseTransactionsColumnDefs = [
                DTColumnDefBuilder.newColumnDef(3).notSortable(),
                DTColumnDefBuilder.newColumnDef(4).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initWarehouseTransactionsDataTable

        function fetchWarehouseRacks(){
            WarehouseService.getRacks( function( racks ){
                $scope.racks = racks;
            });
        }// fetchWarehouseRacks

        function fetchWarehouseTransactions(){
            WarehouseService.getWarehouseTransactions( function( transactions ){
                console.log( transactions );
                $scope.transactions = transactions;
            });
        }// fetchWarehouseTransactions

        function initRacksDataTable(){
            $scope.dtRackOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDOM('t')
                    .withOption('responsive', true)
                    .withOption('order', [])
            $scope.dtRackColumnDefs = [
                DTColumnDefBuilder.newColumnDef(3).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }//initRacksDataTable

        function relocateItem( itemLocationId, newLocationId ){
            WarehouseService.relocateItem( itemLocationId, newLocationId, function( item_location ) {
                Materialize.toast('¡Se reubicó el artículo: "' + item_location.inventory_item.name + '" exitosamente!', 4000, 'green');
                $state.go('/relocate', { 
                    locationId: item_location.warehouse_location.id,
                    itemId: item_location.inventory_item.id
                 }, { reload: true });
            });
            return;
        }

}]);