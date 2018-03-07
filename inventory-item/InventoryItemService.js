conAngular
    .service('InventoryItemService', ['$http', '$q', '$rootScope', function( $http, $q, $rootScope ){
        var service = {};
 
        service.create = create;
        service.getAll = getAll;
        service.getLatestEntries = getLatestEntries;
        service.getLatestEntriesByPM = getLatestEntriesByPM;
        service.getLatestEntriesByAE = getLatestEntriesByAE;
        service.getLatestEntriesByClient = getLatestEntriesByClient;
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
        service.cancelWithdrawal = cancelWithdrawal;
        service.withPendingLocation = withPendingLocation;
        service.reentryWithPendingLocation = reentryWithPendingLocation;
        service.isReentryWithPendingLocation = isReentryWithPendingLocation;
        service.search = search;
        service.getStatuses = getStatuses;
        service.getStatus = getStatus;
        service.getItemState = getItemState;
        service.getInStock = getInStock;
        service.getOutOfStock = getOutOfStock;
        service.requestEntry = requestEntry;
        service.getPendingEntryRequests = getPendingEntryRequests;
        service.getPendingValidationEntries = getPendingValidationEntries;
        service.getItemRequest = getItemRequest;
        service.requestWithdrawal = requestWithdrawal;
        service.getPendingWithdrawalRequests = getPendingWithdrawalRequests;
        service.getPendingWithdrawalRequestsByUser = getPendingWithdrawalRequestsByUser;
        service.getWithdrawRequest = getWithdrawRequest;
        service.getStats = getStats;
        service.getStatsPM = getStatsPM;
        service.cancelEntryRequest = cancelEntryRequest;
        service.deleteItem = deleteItem;
        service.createItemType = createItemType;
        service.getItemTypes = getItemTypes;
        service.destroyItemType = destroyItemType;
        service.getItemType = getItemType;
        service.editItemType = editItemType;
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

        function getLatestEntriesByPM( userId, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { 
                    recent:     true, 
                    pm_id:      userId  
                } 
            })
           .success(function ( response ) {
                callback( response.inventory_items );
           })
           .error(function ( response ) {
                callback( response );
           });
        }// getLatestEntriesByPM

        function getLatestEntriesByAE( userId, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { 
                    recent:     true, 
                    ae_id:      userId  
                } 
            })
           .success(function ( response ) {
                callback( response.inventory_items );
           })
           .error(function ( response ) {
                callback( response );
           });
        }// getLatestEntriesByAE

        function getLatestEntriesByClient( userId, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { 
                    recent:     true, 
                    client_id:  userId  
                } 
            })
           .success(function ( response ) {
                console.log( response );
                callback( response.inventory_items );
           })
           .error(function ( response ) {
                callback( response );
           });
        }// getLatestEntriesByClient

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
                    console.log( response );
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

        function multipleWithdrawal( items, exitDate, pickupCompany, pickupCompanyContact, returnDate, additionalComments, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/multiple_withdrawal';
            $http.post( serviceUrl, 
                { 
                    inventory_items:        items,
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

        function authorizeWithdrawal( id, pickupCompanyContact, additionalComments, quantities, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'withdraw_requests/authorize_withdrawal';
            $http.post( serviceUrl, 
                {  
                    id:                     id, 
                    pickup_company_contact: pickupCompanyContact,
                    additional_comments:    additionalComments,
                    quantities:             quantities
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// authorizeWithdrawal

        function cancelWithdrawal( id,  callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'withdraw_requests/cancel_withdrawal';
            $http.post( serviceUrl, 
                {  
                    id: id
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// cancelWithdrawal

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

        function reentryWithPendingLocation( callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/reentry_with_pending_location';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.inventory_items );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// reentryWithPendingLocation

        function isReentryWithPendingLocation( itemId, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/is_reentry_with_pending_location';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { id: itemId  } 
                })
               .success(function ( response ) {
                    callback( response );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// isReentryWithPendingLocation

        function search( projectId, clientContactId, pmId, aeId, status, itemType, storageType, keyword, serialNumber, callback ) {
 
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
                        keyword:            keyword,
                        serial_number:      serialNumber
                    }
                })
               .success(function ( response ) {
                    console.log( response );
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

        function requestWithdrawal( items, exitDate, pickupCompanyId, callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'withdraw_requests/';
            $http.post( serviceUrl, 
                { 
                    withdraw_request: {
                        inventory_items:        items,
                        exit_date:              exitDate,
                        pickup_company_id:      pickupCompanyId,
                    }
                }
            )
            .success(function( response ) {
                callback( response.withdraw_request );
            })
            .error(function( response ) {
                callback( response );
            });

        }// requestWithdrawal

        function getPendingWithdrawalRequests( callback ) {
            var serviceUrl = $rootScope.apiUrl + 'withdraw_requests/';
            $http.get( serviceUrl )
                .success(function ( response ) {
                    callback( response.withdraw_requests );
                })
               .error(function ( response ) {
                    callback( response );
                });
        }// getPendingWithdrawalRequests

        function getPendingWithdrawalRequestsByUser( userId, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'withdraw_requests/by_user/' + userId;
            $http.get( serviceUrl )
                .success(function ( response ) {
                    console.log( response );
                    callback( response.withdraw_requests );
                })
               .error(function ( response ) {
                    callback( response );
                });
        }// getPendingWithdrawalRequestsByUser

        function getWithdrawRequest( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'withdraw_requests/' + id;
            $http.get( serviceUrl )
                .success(function ( response ) {
                    callback( response.withdraw_request );
                })
               .error(function ( response ) {
                    callback( response );
                });
        }// getWithdrawRequest

        function getStats( callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'inventory_items/get_stats/';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.stats );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getStats

        function getStatsPM( callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'inventory_items/get_stats_pm_ae/';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.stats );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getStats

        function cancelEntryRequest( id,  callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/cancel_item_entry_request';
            $http.post( serviceUrl, 
                {  
                    id: id
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });

        }// cancelEntryRequest

        function deleteItem( id,  callback ) {
            var serviceUrl = $rootScope.apiUrl + 'inventory_items/destroy';
            $http.post( serviceUrl, 
                {  
                    id: id
                }
            )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// delete

        function createItemType( name, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'item_types/';
            $http.post( serviceUrl, { name: name } )
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// create
    
        function getItemTypes( callback ) {
            var serviceUrl = $rootScope.apiUrl  + 'item_types/';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    console.log(response)
                    callback( response.item_types );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getItemTypes

        function destroyItemType( id,  callback ) {
            var serviceUrl = $rootScope.apiUrl + 'item_types/destroy';
            $http.post( serviceUrl, { id: id })
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// delete

        function getItemType( id, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'item_types/' + id;
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    console.log( response );
                    callback( response.item_type );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// getItemType

        function editItemType( id, newName,  callback ) {
            var serviceUrl = $rootScope.apiUrl + 'item_types/update';
            $http.post( serviceUrl, 
                { 
                    id:     id,
                    name:   newName
                })
            .success(function( response ) {
                callback( response );
            })
            .error(function( response ) {
                callback( response );
            });
        }// editItemType
    }]);
