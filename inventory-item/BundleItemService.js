conAngular
    .service('BundleItemService', ['$http', '$rootScope', function($http, $rootScope){
        
        var service = {};
        service.create = create;
        service.edit = edit;
        return service;



        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function create( name, description, projectId, itemType, imgBase64, filename, entryDate, storageType, deliveryCompany, deliveryCompanyContact, additionalComments, barcode, parts, validityExpirationDate, itemValue, itemRequestId, status, isHighValue, pm, ae, callback ) {

            var userId = $rootScope.globals.currentUser.id;
            //var status = $rootScope.globals.currentUser.role == 1 ? 1 : 6;
            var serviceUrl = $rootScope.apiUrl  + 'users/' + userId + '/bundle_items/';
            $http.post(serviceUrl, 
                { 
                    pm_id: pm,
                    ae_id: ae,
                    bundle_item: {
                        name:                       name, 
                        project_id:                 projectId, 
                        description:                description, 
                        status:                     status, 
                        user_id:                    userId, 
                        item_type:                  itemType,
                        barcode:                    barcode,
                        validity_expiration_date:   validityExpirationDate,
                        value:                      itemValue,
                        storage_type:               storageType,
                        is_high_value:              isHighValue
                    },
                    item_request_id: itemRequestId,
                    parts: parts,
                    filename: filename,
                    item_img: imgBase64,
                    entry_date: entryDate, 
                    delivery_company: deliveryCompany, 
                    delivery_company_contact: deliveryCompanyContact,
                    additional_comments: additionalComments
                })
                .success(function( response ) {
                    callback( response );
                })
                .error(function( response ) {
                    callback( response );
                });

        }// create

        function edit( id, name, description, value, storageType, validityExpirationDate, state, isHighValue, isInventoryItem, pm, ae, callback ) {

            var userId = $rootScope.globals.currentUser.id;
            var serviceUrl = $rootScope.apiUrl + 'bundle_items/update';
            $http.post(serviceUrl, 
                { 
                    id:    id,
                    pm_id: pm,
                    ae_id: ae,
                    is_inventory_item:  isInventoryItem,
                    bundle_item: {
                        name:                       name, 
                        description:                description, 
                        value:                      value,
                        storage_type:               storageType,
                        state:                      state,
                        validity_expiration_date:   validityExpirationDate,
                        is_high_value:              isHighValue
                    }
                })
                .success(function( response ) {
                    callback( response.inventory_item );
                })
                .error(function( response ) {
                    callback( response );
                });
        }// edit


        /******************
        * PRIVATE FUNCTIONS
        *******************/

    }]);
