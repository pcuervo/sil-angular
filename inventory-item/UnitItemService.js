conAngular
    .service('UnitItemService', ['$http', '$q','$rootScope', function($http, $q, $rootScope){
        var service = {};
 
        service.create = create;
        service.getAll = getAll;
        return service;

        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function create(serialNumber, brand, model, name, state, description, projectId, itemType, imgBase64, filename, entryDate, storageType, deliveryCompany, deliveryCompanyContact, additionalComments, barcode, validityExpirationDate, itemValue, callback) {

            var userId = $rootScope.globals.currentUser.id;
            var status = $rootScope.globals.currentUser.role == 1 ? 1 : 6;
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
                        storage_type: storageType 
                    },
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



        /******************
        * PRIVATE FUNCTIONS
        *******************/

    }]);
