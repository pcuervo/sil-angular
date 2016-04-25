conAngular
    .service('SettingsService', ['$http', '$rootScope', function($http, $rootScope){

        var service = {};
        service.get = get;
        service.update = update;
        return service;


        /******************
        * PUBLIC FUNCTIONS
        *******************/

        function get( id, callback ){
            var serviceUrl = $rootScope.apiUrl + 'system_settings/' + id;
            $http.get( serviceUrl )
               .success(function ( response ) {
                    callback( response.system_setting );
               })
               .error(function ( response ) {
                    callback( response );
               });
        }// get

        function update( id, unitsPerLocation, costPerLocation, costHighValue, callback ) {
            var serviceUrl = $rootScope.apiUrl + 'system_settings/update';
            $http.post(serviceUrl, {
                    id: id,
                    system_settings: {
                        units_per_location:     unitsPerLocation,
                        cost_per_location:      costPerLocation,
                        cost_high_value:        costHighValue
                    }

                })
               .success(function ( response ) {
                    callback ( response.system_setting );
               })
               .error(function ( response ) {
                    callback ( response );
               });
        }// update

    }]);

