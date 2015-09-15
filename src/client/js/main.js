var tess = angular.module("tessell", [
  "ngRoute"
]);

tess.config(["$routeProvider", '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider){
    $routeProvider
      .when('/', {
        templateUrl: '../login.html',
        controller: 'landingController'
      })
      .when('/events', {
        templateUrl: '../events.html', 
        controller: 'eventsProfileController'
      })
      .when('/create', {
        templateUrl: '../create.html', 
        controller: 'eventsProfileController'
      })
      .when('/event/:eventcode', {/*eventually /mosaic/:eventId*/
        templateUrl: '../mosaic.html',
        controller: 'mosaicCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
      $httpProvider.interceptors.push('InterceptResponse');
  }]);

tess.run([ '$rootScope', '$location', function ($rootScope, $location){
}]);

tess.factory('InterceptResponse', ['$q', '$location', function ($q, $location){
  return {
    responseError: function (response){
      if (response.status === 401){
        $location.url('/');
        return $q.reject(response);
      }
    }
  };
}]);

tess.factory('httpRequestFactory', [ '$http', '$location', '$q', function ($http, $location, $q){
  var httpRequestFactory = {};
  httpRequestFactory.getUserProfile = function(){
    return $http({
      method: 'GET',
      url: '/user'
    }).then(function(response){
      httpRequestFactory.fullUserProfile = response.data;
      return response;
    });
  };
  httpRequestFactory.getUserEvents = function(){
    return $http({
      method: 'GET',
      url: '/events'
    }).then(function(response){
      httpRequestFactory.userEvents = response.data;
      return response;
    });
  };
  httpRequestFactory.getEvent = function(eventCode){
    return $http({
      method: 'GET',
      url:'/events/'+ eventCode
    }).then(function(response){
      httpRequestFactory.currentEvent = response.data;
      return response;
    });
  };
  httpRequestFactory.joinEvent = function(eventCode){
    return $http({
      method: 'POST',
      url: '/events/' + eventCode,
    }).then(function(response){
      // console.log('finished post join event');
      return response;
    });
  };
  httpRequestFactory.updateMap = function(replacedSector, eventCode){
    return $http({
      method: 'POST',
      url: '/events/' + eventCode + '/map',
      data: {
        key: replacedSector.ID,
        value: replacedSector,
        eventCode: eventCode
      }
    }).then(function(response){
      // console.log("response from post request ",response);
      return response;
    });
  };
  httpRequestFactory.logout = function(){
    return $http({
      method: 'GET',
      url: '/logout'
    }).then(function (res){
      console.log("LOGGED OUT!");
      return res;
    });
  };
  return httpRequestFactory;
}]);


tess.factory('mosaicFactory', ['httpRequestFactory', function (httpRequestFactory){
  var mosaicFactory = {};

  mosaicFactory.updateMap = function(replacedSector, eventCode){
    // console.log('sending over to factory for POST');
    httpRequestFactory.updateMap(replacedSector, eventCode)
      .then(function(response){
        // console.log("inside mosaicFactory ", response);
      });
  };

  mosaicFactory.startMosaic = function(mosaicData){
    var mosaic = document.getElementById('mosaic');
    mosaic.setAttributeNS(null, 'height', mosaicData.map.height.toString());
    mosaic.setAttributeNS(null, 'width', mosaicData.map.width.toString());
    var mainImg = document.createElementNS('http://www.w3.org/2000/svg','image');
    mainImg.setAttributeNS(null, 'height', mosaicData.map.height.toString()); // mainImg -> image
    mainImg.setAttributeNS(null, 'width', mosaicData.map.width.toString()); //mainImg -> image
    mainImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', mosaicData.image.imgPath); //the path to cloudinary mainImg -> image
    mainImg.setAttributeNS(null, 'x', 0);
    mainImg.setAttributeNS(null, 'y', 0);
    mainImg.setAttributeNS(null, 'visibility', 'visible');

    mosaic.appendChild(mainImg);
    mosaicFactory.redrawImages(mosaicData.map);
  };

  mosaicFactory.redrawImages = function(map){
    for (var key in map.data){
      if (map.data[key].imgPath){
        mosaicFactory.renderImage(map.data[key].coords[0], map.data[key].coords[1], key, map.data[key].imgPath, map.data[key].thumbnailPath);
      }
    }
  };

  mosaicFactory.renderImage = function(xCoord, yCoord, ID, imgPath, thumbnailPath){
    var svgImg = document.createElementNS('http://www.w3.org/2000/svg','image');
    svgImg.setAttributeNS(null,'height','10'); //squishes the image down, but still preserves the actual size
    svgImg.setAttributeNS(null,'width','10');
    svgImg.setAttributeNS('http://www.w3.org/1999/xlink','href', thumbnailPath);
    svgImg.setAttributeNS(null,'x', xCoord);
    svgImg.setAttributeNS(null,'y', yCoord);
    svgImg.setAttributeNS(null, 'visibility', 'visible');

    var svgLink = document.createElementNS('http://www.w3.org/2000/svg', 'a');
    svgLink.setAttributeNS('http://www.w3.org/1999/xlink','href', imgPath);
    svgLink.setAttributeNS(null,'id','image'+ID);
    svgLink.appendChild(svgImg);

    // document.getElementsByClassName('svg-pan-zoom_viewport')[0].appendChild(svgLink);
    document.getElementById('mosaic').appendChild(svgLink);
    //for the above to append, the pan-zoom code snippet needs to have run...
  };

  //we won't have to use this until we start handling collisions.
  mosaicFactory.deleteImage = function(ID){
    var removeLink = document.getElementById('image' + ID);
    document.getElementById('mosaic').removeChild(removeLink);
  };

  mosaicFactory.findImageHome = function(guestImg, map, eventCode, index){
    var placedNewImage = false;
    var replacedSector;
    /*
    while we haven't placed the image AND we are still within bounds of the mosaic image
    go through each sector.
     */
    while(placedNewImage === false && index < Object.keys(map.data).length){
      //if there is no image currently there place the guestImg in that position
      if(!map.data[index].hasOwnProperty('imgPath')){
        console.log('no image found at ', index, ' place uplaoded here');
        map.data[index].imgPath = guestImg.imgPath;
        map.data[index].thumbnailPath = guestImg.thumbnailPath;
        replacedSector = map.data[index];
        replacedSector.ID = index;
        replacedSector.currentRGB = guestImg.rgb;
        placedNewImage = true;
        mosaicFactory.updateMap(replacedSector, eventCode);
      }else{
        // console.log('collision at ', index, 'trying to repalce');
        //there was an image placed there already
        //put in guestImg and find home for the current image you jsut replaced
        var mainRGB = map.data[index].originalRGB; //map -> eventMap
        var CurrentImageRGBDistance = Math.sqrt(Math.pow(mainRGB.r - map.data[index].currentRGB.r, 2) + Math.pow(mainRGB.g - map.data[index].currentRGB.g, 2) + Math.pow(mainRGB.b - map.data[index].currentRGB.b, 2));
        var PotentialImageRGBDistance = Math.sqrt(Math.pow(mainRGB.r - guestImg.rgb.r, 2) + Math.pow(mainRGB.g - guestImg.rgb.g, 2) + Math.pow(mainRGB.b - guestImg.rgb.b, 2));
        if(PotentialImageRGBDistance < CurrentImageRGBDistance){
          // console.log('found better match');
          //replace the current image with the guest image
          //
          //temp variable to hold the current image about to be replaced
          var tempImage = {
            'imgPath': map.data[index].imgPath, 
            'rgb': map.data[index].currentRGB,
            'thumbnailPath': map.data[index].thumbnailPath
          };

          //replace the current image with the guest image
          map.data[index].imgPath = guestImg.imgPath;
          map.data[index].thumbnailPath = guestImg.thumbnailPath;
          replacedSector = map.data[index];
          replacedSector.ID = index;
          replacedSector.currentRGB = guestImg.rgb;
          placedNewImage = true;
          mosaicFactory.findImageHome(tempImage, map, eventCode, index);
          mosaicFactory.deleteImage(replacedSector.ID);
          mosaicFactory.updateMap(replacedSector, eventCode);
        }
        index++;
      }
    }
    mosaicFactory.renderImage(replacedSector.coords[0], replacedSector.coords[1], replacedSector.ID, guestImg.imgPath, guestImg.thumbnailPath);

  };

  return mosaicFactory;

}]);

tess.controller('mosaicCtrl', ['$scope', 'mosaicFactory', 'httpRequestFactory', function ($scope, mosaicFactory, httpRequestFactory){
  $scope.currentEvent = httpRequestFactory.currentEvent;
  $scope.startMosaic = function(mosaicData){
    mosaicFactory.startMosaic(mosaicData);
  };
  $scope.startMosaic($scope.currentEvent);

  $scope.dropzoneConfig = {
    'options': {
      'url': '/event/' + $scope.currentEvent.event.eventCode + '/image', //ultimately, we need to set this route up on the server.
      'method': 'POST',
      // 'maxFiles': 1,
      'clickable': true,
      'acceptedFiles': 'image/jpeg, image/png',
    },
    'eventHandlers': {
      'sending': function (file, xhr, formData) {
        console.log('file sent');
        //TODO: modify the below based on the instructions you gave Jon.
        // formData.append("eventCode", $scope.event._id);
      },
      'success': function (file, response) {
        // console.log('file returned success');
        mosaicFactory.findImageHome(response, $scope.currentEvent.map, $scope.currentEvent.event.eventCode, 0);
      }
    }
  };
}]);

tess.controller('eventsProfileController', [ '$scope', 'httpRequestFactory', '$location', function ($scope, httpRequestFactory, $location){
  $scope.photoLoaded = false;

  $scope.getUserProfile = function(){
    httpRequestFactory.getUserProfile()
      .then(function(response){
        $scope.userProfile = response.data;
      });
  };
  $scope.getUserEvents = function(){
    // console.log('getting events');
    httpRequestFactory.getUserEvents()
      .then(function(response){
        $scope.userEvents = response.data;
        // console.log(response.data.events);
      });
  };
  $scope.joinEvent = function(eventCode){
    if(!eventCode){
      console.log(eventCode);
      $scope.noEventCode = true;
    } else {
      console.log("trying to join ", eventCode);
      $scope.noEventCode = false;
      httpRequestFactory.joinEvent(eventCode)
        .then(function(response){
          // console.log(response);
          $scope.getEvent(eventCode);
        });
    }
  };
  $scope.createEvent = function(eventCode){
  };
  $scope.getEvent = function(eventCode){
    // console.log(eventCode);
    httpRequestFactory.getEvent(eventCode)
      .then(function(response){
        console.log(response.data);
        $location.url('/event/' + eventCode);
      });
  };

  $scope.logout = function (){
    httpRequestFactory.logout();
  };

  $scope.dropzoneConfig = {
    'options': {
      'url': '/event',
      'method': 'POST',
      'maxFiles': 1,
      'clickable': true,
      'autoProcessQueue': false,
      'acceptedFiles': 'image/jpeg, image/png',
      init: function(){
        dz = this;
        $('#submit-all').click(function(){
          if(!!$scope.eventCode && !!$scope.eventName && !!$scope.eventDate && dz.files.length === 1){
            dz.processQueue();
            dz.removeAllFiles();
          }
        });
      }
    },
    'eventHandlers': {
      'sending': function (file, xhr, formData) {
        // console.log('sending file');
        formData.append("eventCode", $scope.eventCode);
        formData.append("eventName", $scope.eventName);
        // formData.append("eventDate", $scope.eventDate);
      },
      'success': function (file, response) {
        // console.log('success call ', $scope.eventCode);
        $scope.getEvent($scope.eventCode);
      },
      'maxfilesexceeded': function(file){
        this.removeAllFiles();
        this.addFile(file);
      },
      'addedfile': function(file){
        // $scope.$broadcast('photoUploaded');
      }
    }
  };
  $scope.getUserEvents();

  $scope.$on('redraw', function (newMosaicData){
    console.log('trying to redraw');
    mosaicFactory.redrawImages(newMosaicData);
  });

  $scope.currentEvent = httpRequestFactory.currentEvent;

}]);

tess.controller('landingController', ['$scope', function ($scope){
  $scope.loaded = true;
}]);

/**
* An AngularJS directive for Dropzone.js, http://www.dropzonejs.com/
* 
* Usage:
* 
* <div ng-app="app" ng-controller="SomeCtrl">
*   <button dropzone="dropzoneConfig">
*     Drag and drop files here or click to upload
*   </button>
* </div>
*/

tess.directive('dropzone', function () {
 return function (scope, element, attrs) {
   var config, dropzone;

   config = scope[attrs.dropzone];
   dropzone = new Dropzone(element[0], config.options);

   angular.forEach(config.eventHandlers, function (handler, event) {
     dropzone.on(event, handler);
   });
 };
});
