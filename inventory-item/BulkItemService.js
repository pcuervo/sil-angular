conAngular
    .service('BulkItemService', ['$http', '$rootScope', function($http, $rootScope){
        var service = {};
 
        service.create = create;
        service.getBulkItems = getBulkItems;
        return service;

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function create( name, quantity, description, projectId, itemType, imgBase64, filename, entryDate, storageType, deliveryCompany, deliveryCompanyContact, additionalComments, barcode, validityExpirationDate, itemValue, itemRequestId, status, isHighValue, callback ) {

            var userId = $rootScope.globals.currentUser.id;
            //var status = $rootScope.globals.currentUser.role == 1 ? 1 : 6;
            var serviceUrl = $rootScope.apiUrl + 'users/' + userId + '/bulk_items/';

            $http.post(serviceUrl, 
                { 
                    bulk_item: {
                        name:                       name, 
                        quantity:                   quantity,
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
                    item_request_id:            itemRequestId,
                    filename:                   filename,
                    item_img:                   imgBase64,
                    entry_date:                 entryDate, 
                    delivery_company:           deliveryCompany, 
                    delivery_company_contact:   deliveryCompanyContact,
                    additional_comments:        additionalComments
                })
                .success(function( response ) {
                    callback( response );
                })
                .error(function( response ) {
                    callback( response );
                });

        }// create

        function getBulkItems( callback ) {
 
            var serviceUrl = $rootScope.apiUrl + 'bulk_items/';
            $http.get (serviceUrl )
               .success(function ( response ) {
                    callback( response );
               })
               .error(function ( response ) {
                    callback( response );
               });

        }// getBulkItems



        /******************
        * PRIVATE FUNCTIONS
        *******************/

    }]);
