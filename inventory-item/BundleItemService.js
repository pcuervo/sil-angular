conAngular
    .service('BundleItemService', ['$http', '$rootScope', function($http, $rootScope){
        
        var service = {};
        service.create = create;
        return service;



        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function create( name, description, projectId, itemType, imgBase64, filename, entryDate, storageType, deliveryCompany, deliveryCompanyContact, additionalComments, barcode, parts, validityExpirationDate, itemValue, callback ) {

            var userId = $rootScope.globals.currentUser.id;
            var status = $rootScope.globals.currentUser.role == 1 ? 1 : 6;
            var serviceUrl = $rootScope.apiUrl  + 'users/' + userId + '/bundle_items/';

            $http.post(serviceUrl, 
                { 
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
                        storage_type:               storageType
                    },
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



        /******************
        * PRIVATE FUNCTIONS
        *******************/

    }]);
