conAngular
    .service('UnitItemService', ['$http', '$q','$rootScope', function($http, $q, $rootScope){
        var service = {};
 
        service.create = create;
        service.getAll = getAll;
        service.edit = edit;
        return service;

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function create(serialNumber, brand, model, name, state, description, projectId, itemType, imgBase64, filename, entryDate, storageType, deliveryCompany, deliveryCompanyContact, additionalComments, barcode, validityExpirationDate, itemValue, itemRequestId, status, isHighValue, callback) {

            var userId = $rootScope.globals.currentUser.id;
            //var status = $rootScope.globals.currentUser.role == 1 ? 1 : 6;
            var serviceUrl = $rootScope.apiUrl  + 'users/' + userId + '/unit_items/';
            $http.post(serviceUrl, 
                { 
                    unit_item: {
                        name:                       name, 
                        project_id:                 projectId, 
                        serial_number:              serialNumber,
                        brand:                      brand,
                        model:                      model,
                        state:                      state,
                        description:                description, 
                        status:                     status, 
                        item_type:                  itemType,
                        barcode:                    barcode,
                        validity_expiration_date:   validityExpirationDate,
                        value:                      itemValue,
                        storage_type:               storageType,
                        is_high_value:              isHighValue
                    },
                    item_request_id: itemRequestId,
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
                    console.log( response );
                    callback( response );
                });

        }// create

        function getAll(callback) {

            var serviceUrl = $rootScope.apiUrl  + 'unit_items/';
            $http.get ( serviceUrl )
               .success(function ( response ) {
                    callback( response.unit_items );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getAll

        function edit( id, name, serialNumber, brand, model, description, value, storageType, validityExpirationDate, state, isHighValue, isInventoryItem, callback ) {

            var userId = $rootScope.globals.currentUser.id;
            var serviceUrl = $rootScope.apiUrl + 'unit_items/update';
            $http.post(serviceUrl, 
                { 
                    id:                 id,
                    is_inventory_item:  isInventoryItem,
                    unit_item: {
                        name:                       name, 
                        serial_number:              serialNumber, 
                        brand:                      brand, 
                        model:                      model, 
                        description:                description, 
                        value:                      value,
                        state:                      state,
                        storage_type:               storageType,
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

    }]);
