conAngular
    .service('InventoryItemService', ['$http', '$q', '$rootScope', function( $http, $q, $rootScope ){
        var service = {};
 
        service.create = create;
        service.getAll = getAll;
        service.getLatestEntries = getLatestEntries;
        service.getPendingEntries = getPendingEntries;
        service.getPendingWithdrawals = getPendingWithdrawals;
        service.byBarcode = byBarcode;
        service.byType = byType;
        service.byId = byId;
        service.withdrawUnitItem = withdrawUnitItem;
        service.withdrawBulkItem = withdrawBulkItem;
        service.withdrawBundleItem = withdrawBundleItem;
        service.multipleWithdrawal = multipleWithdrawal;
        service.reentryUnitItem = reentryUnitItem;
        service.reentryBulkItem = reentryBulkItem;
        service.reentryBundleItem = reentryBundleItem;
        service.authorizeEntry = authorizeEntry;
        service.authorizeWithdrawal = authorizeWithdrawal;
        service.withPendingLocation = withPendingLocation;
        service.search = search;
        service.getStatuses = getStatuses;
        service.getStatus = getStatus;
        service.getItemState = getItemState;
        service.getTotalInventory = getTotalInventory;
        service.getInventoryValue = getInventoryValue;
        service.getCurrentRent = getCurrentRent;
        service.getInStock = getInStock;
        service.getOutOfStock = getOutOfStock;
        service.requestEntry = requestEntry;
        service.getPendingEntryRequests = getPendingEntryRequests;
        service.getPendingValidationEntries = getPendingValidationEntries;
        service.getItemRequest = getItemRequest;
        return service;

        // Public 
        function create( name, description, status, userId, projectId, clientId, img, ext, callback ) {
            var deferred = $q.defer();
            var serviceUrl = $rootScope.apiUrl + 'users/1/inventory_items/';
            $http.post(serviceUrl, { 
                name: name, description: description, status: status, user_id: userId, project_id: projectId, client_id: clientId, item_img: img, item_img_ext: ext })
                .success(function(response) {
                    console.log(response)
                })
                .error(function(response) {
                    console.log(response);
                });

        }// create

        function getLatestEntries( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { recent: true  } 
                })
               .success(function ( response ) {
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getLatestEntries

        function getAll( callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'inventory_items/';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getAll

        function getPendingEntries( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/pending_entry';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { recent: true  } 
                })
               .success(function ( response ) {
                    console.log( response );
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getPendingEntries

        function getPendingWithdrawals( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/pending_withdrawal';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { recent: true  } 
                })
               .success(function ( response ) {
                    console.log( response );
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getPendingWithdrawals

        function byType( type, status, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/by_type';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { 
                    type: type,
                    status: status
                } 
                })
               .success(function ( response ) {
                    console.log( response )
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// byType

        function byBarcode( barcode, isReEntry, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/by_barcode';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { barcode: barcode, re_entry: isReEntry  } 
                })
               .success(function ( response ) {
                    callback( response.inventory_item );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// byBarcode

        function byId( id, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/' + id;
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_item );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// byId

        function withdrawUnitItem( id, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'unit_items/withdraw';
            $http.post( serviceUrl, 
                { 
                    id: id,
                    exit_date:              exitDate,
                    pickup_company:         pickupCompany,
                    pickup_company_contact: pickupCompanyContact,
                    returnDate:             returnDate,
                    additional_comments:    additionalComments
                }
            )
            .success(function( response ) {
                console.log( response );
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// withdrawUnitItem

        function withdrawBulkItem( id, quantity, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments, locations, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'bulk_items/withdraw';
            $http.post( serviceUrl, 
                { 
                    id:                     id,
                    quantity:               quantity,
                    exit_date:              exitDate,
                    pickup_company:         pickupCompany,
                    pickup_company_contact: pickupCompanyContact,
                    returnDate:             returnDate,
                    additional_comments:    additionalComments,
                    locations:              locations
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// withdrawBulkItem

        function withdrawBundleItem( id, parts, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'bundle_items/withdraw';
            $http.post( serviceUrl, 
                { 
                    id:                     id,
                    exit_date:              exitDate,
                    pickup_company:         pickupCompany,
                    pickup_company_contact: pickupCompanyContact,
                    returnDate:             returnDate,
                    parts:                  parts,
                    additional_comments:    additionalComments
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// withdrawBundleItem

        function multipleWithdrawal( ids, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/multiple_withdrawal';
            $http.post( serviceUrl, 
                { 
                    inventory_item_ids:     ids,
                    exit_date:              exitDate,
                    pickup_company:         pickupCompany,
                    pickup_company_contact: pickupCompanyContact,
                    returnDate:             returnDate,
                    additional_comments:    additionalComments
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// multipleWithdrawal

        function reentryUnitItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments, callback ){
            var serviceUrl = $rootScope.apiUrl + 'unit_items/re_entry';
            $http.post( serviceUrl, 
                { 
                    id:                         id,
                    entry_date:                 entryDate,
                    delivery_company:           deliveryCompany,
                    delivery_company_contact:   deliveryCompanyContact,
                    state:                      itemState,
                    additional_comments:        additionalComments
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// reentryUnitItem

        function reentryBulkItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments, quantity, callback ){
            var serviceUrl = $rootScope.apiUrl + 'bulk_items/re_entry';
            $http.post( serviceUrl, 
                { 
                    id:                         id,
                    entry_date:                 entryDate,
                    delivery_company:           deliveryCompany,
                    delivery_company_contact:   deliveryCompanyContact,
                    state:                      itemState,
                    additional_comments:        additionalComments,
                    quantity:                   quantity
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// reentryBulkItem

        function reentryBundleItem( id, entryDate, deliveryCompany, deliveryCompanyContact, itemState, additionalComments, parts, quantity, callback ){
            var serviceUrl = $rootScope.apiUrl + 'bundle_items/re_entry';
            $http.post( serviceUrl, 
                { 
                    id:                         id,
                    entry_date:                 entryDate,
                    delivery_company:           deliveryCompany,
                    delivery_company_contact:   deliveryCompanyContact,
                    state:                      itemState,
                    additional_comments:        additionalComments,
                    parts:                      parts,
                    quantity:                   quantity
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// reentryBundleItem

        function authorizeEntry( id, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/authorize_entry';
            $http.post( serviceUrl, { id: id } )
            .success(function( response ) {
                console.log( response );
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// authorizeEntry

        function authorizeWithdrawal( id, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/authorize_withdrawal';
            $http.post( serviceUrl, { id: id } )
            .success(function( response ) {
                console.log( response );
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// authorizeWithdrawal

        function withPendingLocation( callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/with_pending_location';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// withPendingLocation

        function search( projectId, clientContactId, pmId, aeId, status, itemType, storageType, keyword, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: 
                    { 
                        project_id:         projectId,
                        client_contact_id:  clientContactId,
                        pm_id:              pmId,
                        ae_id:              aeId,
                        status:             status,
                        item_type:          itemType,
                        storage_type:       storageType,
                        keyword:            keyword
                    }
                })
               .success(function ( response ) {
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// search

        function getStatuses( callback ){
            var statuses = [
                {
                    id: 1,
                    name: 'En existencia'
                },
                {
                    id: 2,
                    name: 'Sin existencias'
                },
                {
                    id: 3,
                    name: 'Existencia parcial'
                },
                {
                    id: 4,
                    name: 'Caducado'
                },
                {
                    id: 5,
                    name: 'Entrada pendiente'
                },
                {
                    id: 6,
                    name: 'Salida pendiente'
                }
            ]
            callback( statuses );
        }// getStatuses

        function getItemState( stateId, callback ){
            var state;
            switch( stateId ){
                case 1:
                    state = 'Nuevo';
                    break;
                case 2:
                    state = 'Como nuevo';
                    break;
                case 3:
                    state = 'Usado';
                    break;
                case 4:
                    state = 'Dañado';
                    break;
            }
            callback( state );
        }// getItemState

        function getStatus( statusId, callback ){
            var status;
            switch( statusId ){
                case 1:
                    status = 'En existencia';
                    break;
                case 2:
                    status = 'Sin existencia';
                    break;
                case 3:
                    status = 'Existencia parcial';
                    break;
                case 4:
                    status = 'Caducado';
                    break;
                case 5:
                    status = 'Entrada pendiente';
                    break;
                case 6:
                    status = 'Salida pendiente';
                    break;
            }
            callback( status );
        }// getStatus

        function getTotalInventory( callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'inventory_items/total_number_items';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.total_number_items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getTotalInventory

        function getInventoryValue( callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'inventory_items/inventory_value';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_value );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getInventoryValue

        function getCurrentRent( callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'inventory_items/current_rent';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.current_rent );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getCurrentRent

        function getInStock( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { in_stock: true  } 
                })
               .success(function ( response ) {
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getInStock

        function getOutOfStock( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { out_of_stock: true  } 
                })
               .success(function ( response ) {
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getOutOfStock
    
        function requestEntry( name, quantity, description, itemType, projectId, pmId, aeId, itemState, entryDate, validityExpirationDate, callback ){
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/request_item_entry';
            $http.post( serviceUrl, 
                { 
                    inventory_item_request: {
                        name:                       name,
                        quantity:                   quantity,
                        description:                description,
                        item_type:                  itemType,
                        project_id:                 projectId,
                        pm_id:                      pmId,
                        ae_id:                      aeId,
                        project_id:                 projectId,
                        state:                      itemState,
                        entry_date:                 entryDate,
                        validity_expiration_date:   validityExpirationDate
                    }
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// requestEntry

        function getPendingEntryRequests( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/pending_entry_requests';
            $http.get( serviceUrl )
                .success(function ( response ) {
                    callback( response.inventory_item_requests );
                })
               .error(function ( response ) {
                    callback( response );
                });
        }// getPendingEntryRequests

        function getPendingValidationEntries( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/pending_validation_entries';
            $http.get( serviceUrl )
                .success(function ( response ) {
                    callback( response.inventory_items );
                })
               .error(function ( response ) {
                    callback( response );
                });
        }// getPendingValidationEntries

        function getItemRequest( id, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/get_item_request';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { 
                    id: id
                } 
                })
               .success(function ( response ) {
                    callback( response.inventory_item_requests[0] );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getItemRequest

    }]);
