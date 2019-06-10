conAngular
    .service('WarehouseService', ['$http', '$rootScope', function($http, $rootScope){

        var service = {};
        service.getRack = getRack;
        service.getRacks = getRacks;
        service.createRack = createRack;
        service.getLocation = getLocation;
        service.editLocation = editLocation;
        service.getRackAvailableLocations = getRackAvailableLocations;
        service.locateItem = locateItem;
        service.locateBundle = locateBundle;
        service.locateBulk = locateBulk;
        service.relocateItem = relocateItem;
        service.getItems = getItems;
        service.getItemLocation = getItemLocation;
        service.getWarehouseTransactions = getWarehouseTransactions
        service.deleteRack = deleteRack
        service.emptyRack = emptyRack
        service.stats = stats
        service.markAsFull = markAsFull
        service.markAsAvailable = markAsAvailable
        service.csvLocate = csvLocate
        service.removeItem = removeItem
        service.transferLocation = transferLocation;
        return service;

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function getRack( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/show_details/' + id;
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getRack

        function getRacks( callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/';
            $http.get( serviceUrl )
               .success(function ( response ) {
                    callback( response.warehouse_racks );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getRacks

        function createRack( name, rows, columns, units, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/';
            $http.post(serviceUrl, {
                    warehouse_rack: {
                        name:   name,
                        row:    rows,
                        column: columns
                    },
                    units: units
                })
               .success(function ( response ) {
                    callback ( response.warehouse_rack );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// createRack

        function getLocation( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/' + id;
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.warehouse_location );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getLocation

        function editLocation( id, name, units, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/update';
            $http.post(serviceUrl, {
                    id:     id,
                    name:   name,
                    units:  units
                })
               .success(function ( response ) {
                    callback ( response.warehouse_location );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// editLocation

        function getRackAvailableLocations( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/get_available_locations/' + id;
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.available_locations );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getRackAvailableLocations

        function locateItem( inventoryItemId, warehouseLocationId, quantity, isInventoryItem, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/locate_item';
            $http.post( serviceUrl, 
                { 
                    inventory_item_id:      inventoryItemId,
                    warehouse_location_id:  warehouseLocationId,
                    quantity:               quantity,
                    is_inventory_item:      isInventoryItem,
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// locateItem

        function locateBundle( inventoryItemId, partLocations, quantity, isInventoryItem, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/locate_bundle';
            $http.post( serviceUrl, 
                { 
                    inventory_item_id:  inventoryItemId,
                    part_locations:     partLocations,
                    quantity:           quantity,
                    is_inventory_item:  isInventoryItem,
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// locateBundle

        function locateBulk( inventoryItemId, bulkLocations, isInventoryItem, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/locate_bulk';
            $http.post( serviceUrl, 
                { 
                    inventory_item_id:  inventoryItemId,
                    bulk_locations:     bulkLocations,
                    is_inventory_item:  isInventoryItem,
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// locateBulk

        function relocateItem( itemId, quantityToRelocate, oldLocationId,  newLocationId, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/relocate_item';
            $http.post( serviceUrl, 
                { 
                    inventory_item_id: itemId,
                    old_location_id: oldLocationId,
                    new_location_id: newLocationId,
                    quantity: quantityToRelocate,
                }
            )
            .success(function( response ) {
                callback( response.item_location );
            })
            .error(function( response ) {
                callback( response );
            });
        }// relocateItem


        function getItems( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/get_items/' + id;
            $http.get(serviceUrl)
               .success(function ( items ) {
                    callback( items.items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getItems

        function getItemLocation( itemId, locationId, callback ){
            var serviceUrl = $rootScope.apiUrl + 'item_locations/get_item_location_details';
            $http.post( serviceUrl, 
                { 
                    item_id: itemId,
                    location_id: locationId  
                }
            )
           .success(function ( response ) {
                callback( response.item_location );
           })
           .error(function ( response ) {
                callback( response );
           });
        }// getItemLocation

        function getWarehouseTransactions( callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_transactions/';
            $http.get( serviceUrl )
               .success(function ( response ) {
                    callback( response.warehouse_transactions );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getWarehouseTransactions

        function deleteRack( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/destroy';
            $http.post( serviceUrl, { id: id } )
               .success(function ( response ) {
                    callback ( response.warehouse_rack );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// deleteRack

        function stats( callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/stats/';
            $http.get(serviceUrl)
               .success(function ( response ) {
                    callback( response.stats );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// stats

        function emptyRack( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_racks/empty';
            $http.post( serviceUrl, { id: id } )
               .success(function ( response ) {
                    callback ( response.warehouse_rack );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// emptyRack

        function markAsFull( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/mark_as_full';
            $http.post( serviceUrl, { location_id: id } )
               .success(function ( response ) {
                    console.log(response);
                    callback ( response );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// markAsFull

        function markAsAvailable( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/mark_as_available';
            $http.post( serviceUrl, { location_id: id } )
               .success(function ( response ) {
                    console.log(response);
                    callback ( response );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// markAsAvailable

        function csvLocate( token, warehouseData, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/csv_locate';
            $http.post(serviceUrl, {
                auth_token: token,
                warehouse_data: warehouseData
            })
            .success(function ( response ) {
                callback ( response );
            })
            .error(function ( response ) {
                callback ( response );
            });
        }// csvLocate

        function removeItem( token, locationId, itemId, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/remove_item';
            $http.post(serviceUrl, {
                auth_token: token,
                inventory_item_id: itemId,
                warehouse_location_id: locationId
            })
            .success(function ( response ) {
                callback ( response );
            })
            .error(function ( response ) {
                callback ( response );
            });
        }// removeItem

        function transferLocation( currentLocationId,  newLocationId, callback ){
            var serviceUrl = $rootScope.apiUrl + 'warehouse_locations/transfer_to';
            $http.post( serviceUrl, 
                { 
                    current_location_id: currentLocationId,
                    new_location_id: newLocationId,
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// transferLocation
    }]);

