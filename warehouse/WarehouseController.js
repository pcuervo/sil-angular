conAngular
    .controller('WarehouseController', ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'WarehouseService', 'InventoryItemService', 'NotificationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'DTDefaultOptions', function( $scope, $rootScope, $state, $stateParams, $location, WarehouseService, InventoryItemService, NotificationService, DTOptionsBuilder, DTColumnDefBuilder, DTDefaultOptions ){
        
        /******************
        * CONSTANTS
        *******************/
        var STATUS_EMPTY = 1;
        var STATUS_OCCUPIED = 2;
        var STATUS_FULL = 3;

        (function initController() {
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

            LoaderHelper.showLoader( 'Agregando artículo a ubicación...' );
            if( $scope.sameLocationType && ! $scope.multipleLocationsType ){
                switch( $scope.item.actable_type ){
                    case 'UnitItem': 
                        var quantity = 1;
                        break;
                    case 'BulkItem': 
                        var quantity = this.quantity;
                        break;
                    default:
                        var quantity = $scope.parts.length;
                }
                WarehouseService.locateItem( $scope.item.id, this.selectedLocation, this.units, quantity, true, $scope.item.actable_type, function( response ) {
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
                locationId:     this.selectedLocation,
                quantity:       this.unitsToLocate,
                units:          this.units,
                rackLocation:   $('[name="rack"] option:selected').first().text() + ' / ' + $('[name="location"] option:selected').first().text()
            }
            console.log( bulkLocation );
            $scope.bulkLocations.push( bulkLocation );
            this.pendingUnitsToLocate -= this.unitsToLocate;
            $scope.hasMultipleLocations = true;
            this.selectedLocation = '';
            this.selectedRack = '';
            this.unitsToLocate = '';
            this.units = '';
        }

        $scope.changeRack = function( rackId ){
            getRackRelocation( rackId );
        }// changeRack
 
        $scope.deleteRack = function( rackId ){
            WarehouseService.deleteRack( rackId, function(){
                Materialize.toast('¡Se ha eliminado el rack!', 4000, 'red');
                $('#'+rackId).remove();
            });
        }// deleteRack

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



        /******************
        * PRIVATE FUNCTIONS
        *******************/

        function initWarehouseOptions( currentPath ){

            if( currentPath.indexOf('view-racks') > -1 ){
                fetchWarehouseRacks();
                initRacksDataTable( 10 ); 
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
                LoaderHelper.showLoader( 'Reubicando artículo(s)...' );
                fetchWarehouseRacks();
                console.log('before getting item_location');
                getItemLocation( $stateParams.itemId, $stateParams.locationId )
                return;
            }

            if( currentPath.indexOf('view-warehouse-transactions') > -1 ){
                fetchWarehouseTransactions();
                initWarehouseTransactionsDataTable(); 
                return;
            }

            switch( currentPath ){
                case '/add-rack':
                    console.log('add');
                    $scope.isFloor = false;
                    break;
                case '/wh-dashboard':
                    fetchStats();
                    fetchWarehouseRacks();
                    getItemsWithPendingLocation();
                    initRacksDataTable( 5 ); 
                    initPendingLocationDataTable();
                    break;
            }
    
        }// initWarehouseOptions

        function getRack( id ){
            WarehouseService.getRack( id, function( rack ){
                var hasLocations = true;
                console.log( rack );
                displayRack( rack.locations, rack.rack_info.columns, hasLocations );
                $scope.warehouse_locations = rack.locations;
                $scope.rack = rack;
                getItemsByRack( id );
            }); 
        }// getRack

        function getRackRelocation( id ){
            console.log( $scope.itemLocation );
            WarehouseService.getRack( id, function( rack ){
                var hasLocations = false;
                displayRack( rack.locations, rack.rack_info.columns, hasLocations );
                $scope.warehouse_locations = rack.locations;
                getItemsByRack( id );
            }); 
        }// getRackRelocation

        function getItemsByRack( id ){
            WarehouseService.getItems( id, function( items ){
                console.log( items );
                $scope.items = items;
            }); 
        }

        function displayRack( locations, columns, hasLocations ){
            var rackHTML = [];
            $('.js-rack').empty();    
            switch( columns ){
                case 7:
                    rackHTML = getRackHTMLSevenCol( locations, columns, hasLocations )
                    break;
                case 8:
                    rackHTML = getRackHTMLEightCol( locations, columns, hasLocations )
                    break;
                case 9:
                    rackHTML = getRackHTMLNineCol( locations, columns, hasLocations )
                    break;
                case 10:
                    rackHTML = getRackHTMLTenCol( locations, columns, hasLocations )
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

        function getRackHTMLSevenCol( locations, columns, hasLocations ){
            var rackHTML = [];
            var currentRow = 0;
            var j = 0;
            rackHTML[ currentRow ] = '';

            $.each( locations, function( i, location ){
                var statusClass = $scope.getStatusClass( location.status );

                if( j % 2 == 0 ) rackHTML[ currentRow ] += '<div class="[ col s12 m3 ]"><div class="row">';
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
                
                if( ( parseInt( i )+1 ) % 7 == 0){
                    rackHTML[ currentRow ] += '<div class="[ col s6 ]"><div class="[ card ][ minimized ]"><div class="[ title ][ black ]"><h5>-</h5></div></div></div>';    
                    rackHTML[ currentRow ] += '</div></div>';
                    currentRow += 1;
                    rackHTML[ currentRow ] = '<div class="[ clear ]"></div>';      
                    j += 1;         
                } 
                if( j % 2 == 1 ) {
                    rackHTML[ currentRow ] += '</div></div>';
                }
                j += 1;
            });

            return rackHTML;
        }// getRackHTMLSevenCol

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

        function getRackHTMLNineCol( locations, columns, hasLocations ){
            var rackHTML = [];
            var currentRow = 0;
            rackHTML[ currentRow ] = '';

            $.each( locations, function( i, location ){
                var statusClass = $scope.getStatusClass( location.status );
                if( i % 3 == 0 ) rackHTML[ currentRow ] += '<div class="[ col s12 m4 ]"><div class="row">';
                rackHTML[ currentRow ] += '\
                    <div class="[ col s4 ]"> \
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
                if( i % 3 == 2 ) {
                    rackHTML[ currentRow ] += '</div></div>';
                }

                if( ( parseInt( i )+1 ) % 9 == 0) {
                    currentRow += 1;
                    rackHTML[ currentRow ] = '<div class="[ clear ]"></div>';
                }
            });

            return rackHTML;
        }// getRackHTMLNineCol

        function getRackHTMLTenCol( locations, columns, hasLocations ){
            var rackHTML = [],
                currentRow = 0,
                colClass = getColClass( columns ),
                offsetClass = '';

            rackHTML[ currentRow ] = '';
            $.each( locations, function( i, location ){
                var statusClass = $scope.getStatusClass( location.status );
                if( ( parseInt( i ) ) % 10 == 0) {
                    offsetClass = 'offset-m1';
                } else {
                    offsetClass = '';
                }
                rackHTML[ currentRow ] += '\
                    <div class="[ col s12 ' + colClass + ' ' + offsetClass + ' ]"> \
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

        }// getRackHTMLTenCol


        function getLocation( id ){

            WarehouseService.getLocation( id, function( location ){
                $scope.locationId = location.id;
                $scope.rack = location.warehouse_rack.name;
                $scope.rackId = location.warehouse_rack.id;
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
            console.log('getting ItemLocation');
            WarehouseService.getItemLocation( itemId, locationId, function( itemLocation ){
                $scope.itemLocation = itemLocation;
                console.log( itemLocation );
                $('.js-barcode').JsBarcode( itemLocation.barcode );
                getRackRelocation( itemLocation.rack_id ); 
                $('body').on('click', '.js-location', function(){
                    $scope.itemLocation = itemLocation;
                    console.log( $scope.itemLocation.id );
                    var newLocationId = $(this).data('location');
                    LoaderHelper.showLoader('Reubicando artículo(s)...');
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
                if( 'BulkItem' === item.actable_type ){
                    $scope.quantity = item.quantity;
                    InventoryItemService.isReentryWithPendingLocation( item.id, function( response ){
                        if( 'undefined' != typeof response.quantity ) $scope.quantity = response.quantity;
                    });
                } 

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
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(1).notSortable(),
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];
            DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
        }// initRackItemsDataTable

        function initWarehouseTransactionsDataTable(){
            $scope.dtWarehouseTransactionsOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withDisplayLength(20)
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

        function relocateItem( itemLocationId, newLocationId ){
            WarehouseService.relocateItem( itemLocationId, newLocationId, function( item_location ) {
                if( item_location.errors ){
                    Materialize.toast( item_location.errors, 4000, 'red' );
                    LoaderHelper.hideLoader();
                    return;
                }

                Materialize.toast('¡Se reubicó el artículo: "' + item_location.inventory_item.name + '" exitosamente!', 4000, 'green');
                $state.go('/view-location', { 
                    locationId: item_location.warehouse_location.id
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
            });
        }

}]);