conAngular
    .service('DeliveryService', ['$http', '$rootScope', function($http, $rootScope){

        var service = {};
        service.get = get;
        service.all = all;
        service.create = create;
        service.update = update;
        service.stats = stats;
        service.pendingApproval = pendingApproval;
        service.createRequest = createRequest;
        return service;


        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function get( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'deliveries/' + id;
            $http.get( serviceUrl )
               .success(function ( response ) {
                    callback( response.delivery );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// get

        function all( role, callback ){
            var serviceUrl = $rootScope.apiUrl + 'deliveries/';
            $http ({
                url: serviceUrl, 
                method: "GET",
                params: { recent: true, user_role: role  } 
                })
               .success(function ( response ) {
                    callback( response.deliveries );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// all

        function create( userId, deliveryUserId, company, address, latitude, longitude, status, addressee, addresseePhone, additionalComments, deliveryDate, deliveryCompanyId, inventoryItems, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'deliveries/';
            $http.post(serviceUrl, {
                    delivery: {
                        delivery_user_id:       deliveryUserId,
                        company:                company,
                        address:                address,
                        latitude:               latitude,
                        longitude:              longitude,
                        status:                 status,
                        addressee:              addressee,
                        addressee_phone:        addresseePhone,
                        additional_comments:    additionalComments,
                        date_time:              deliveryDate, 
                        supplier_id:            deliveryCompanyId, 
                    },
                    user_id:            userId,
                    inventory_items:    inventoryItems
                })
               .success(function ( response ) {
                    console.log( response );
                    callback ( response.delivery );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// create

        function update( id, company, address, latitude, longitude, status, addressee, addresseePhone, additionalComments, deliveryUserId, image, filename, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'deliveries/update';
            $http.post(serviceUrl, {
                    id: id,
                    delivery: {
                        delivery_user_id:       deliveryUserId,
                        company:                company,
                        address:                address,
                        latitude:               latitude,
                        longitude:              longitude,
                        status:                 status,
                        addressee:              addressee,
                        addressee_phone:        addresseePhone,
                        additional_comments:    additionalComments,
                    },
                    image: image,
                    filename: filename,

                })
               .success(function ( response ) {
                    console.log( response );
                    callback ( response.delivery );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// update

        function stats( callback ){
            var serviceUrl = $rootScope.apiUrl + 'deliveries/stats/';
            $http.get( serviceUrl )
               .success(function ( response ) {
                    callback( response.stats );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// stats

        function pendingApproval( callback ){
            var serviceUrl = $rootScope.apiUrl + 'deliveries/pending_approval/';
            $http.get( serviceUrl )
               .success(function ( response ) {
                    callback( response.deliveries );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// pendingApproval

        function createRequest( userId, company, address, latitude, longitude, addressee, addresseePhone, additionalComments, deliveryDate, inventoryItems, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'delivery_requests/';
            $http.post(serviceUrl, {
                    delivery_request: {
                        company:                company,
                        address:                address,
                        latitude:               latitude,
                        longitude:              longitude,
                        addressee:              addressee,
                        addressee_phone:        addresseePhone,
                        additional_comments:    additionalComments,
                        date_time:              deliveryDate, 
                    },
                    user_id:            userId,
                    inventory_items:    inventoryItems
                })
               .success(function ( response ) {
                    console.log( response );
                    callback ( response.delivery );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// createRequest

    }]);

