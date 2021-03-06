var angular = require('angular');

module.exports = ['mapManagerService', 'uiEventsService', '$timeout',
    function(mapManagerService, uiEventsService, $timeout) {

        var service = {
            onResume: onResume,
            addMarker: addMarker,
            updateMarker: updateMarker,
            removeMarker: removeMarker,
            focusMarker: focusMarker,
            showMarkers: showMarkers,
            showItinerary: showItinerary,
            hideItinerary: hideItinerary
        };

        var _map = null;
        var _isShown = false;
        var _markers = [];
        var _bounds = null;
        var _this = this;

        function onCreate() {
            mapManagerService.onReady().then(function() {
                var center = new google.maps.LatLng(46.48361, 2.52639);

                var mapOptions = {
                    center: center,
                    zoom: 6,
                    styles: [{ "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative.neighborhood", "elementType": "labels.text.fill", "stylers": [{ "color": "#333333" }] }, { "featureType": "poi.business", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.business", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.place_of_worship", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.place_of_worship", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.local", "elementType": "labels.text", "stylers": [{ "weight": 0.5 }, { "color": "#333333" }] }, { "featureType": "transit.station", "elementType": "labels.icon", "stylers": [{ "gamma": 1 }, { "saturation": 50 }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "visibility": "on" }, { "saturation": 50 }, { "hue": "#50a5d1" }] }]
                };
                mapManagerService.createMap(mapOptions).then(function(map) {
                    _map = map;
                    initMap();

                    _addLayer(_map);
                });
            });
        }

        function onResume() {
            if (_map === null) {
                onCreate();
            } else {
                initMap();
            }
        }

        function updateMarker(marker, options) {
            var position = new google.maps.LatLng(
                options.latitude,
                options.longitude
            );

            marker.setOptions({
                position: position,
                icon: getUrlIcon(options.icon)
            });
        }

        function initMap() {
            $timeout(function() {
                showMarkers();
            }, 100);

        }

        function getUrlIcon(breakType) {
            return {
                url: '/static/img/marker/marker-general.png',
                scaledSize: new google.maps.Size(30, 42)
            };
        }

        function addMarker(key, options) {
            var position = new google.maps.LatLng(
                options.latitude,
                options.longitude
            );

            var marker = new google.maps.Marker({
                position: position,
                icon: getUrlIcon(options.icon),
                map: _map
            });

            marker.set('point', key);

            marker.addListener('click', function() {
                uiEventsService.openPanel(this.get('point'));
                focusMarker(this);
            });

            _markers.push(marker);

            if (_bounds === null) {
                _bounds = new google.maps.LatLngBounds(position, position);
            } else {
                _bounds.extend(position);
            }


            showMarkers();

            return marker;
        }

        function removeMarker(marker) {
            marker.setMap(null);
            return true;
        }

        function focusMarker(marker) {
            _map.panTo(marker.getPosition());
            _map.setZoom(15);
        }

        function showMarkers() {
            if (_bounds !== null) {
                _map.fitBounds(_bounds);
            }
        }

        function _addLayer(map) {
            map.data.setStyle({
                visible: false
            });

            map.data.loadGeoJson('/static/data/itinerary.json');
            showOnMap(_isShown);
        }

        function showItinerary() {
            _isShown = true;
            showOnMap(_isShown);
        }

        function hideItinerary() {
            _isShown = false;
            showOnMap(_isShown);
        }

        function showOnMap(visibility) {
            if (_map !== null) {
                _map.data.setStyle({
                    visible: visibility,
                    strokeWeight: 4,
                    strokeColor: '#4CAF50',
                });
            }
        }

        return service;
    }
];