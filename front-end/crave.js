var app = angular.module('craveApp', ['ngRoute', 'ngScrollSpy', 'ngSanitize']);
var registerUserData;
var loginUserData;
var tokenData;
var yelpQuery;
var uploadData; 
var allCards;
var locations;

var $scope, $location;
var cardObject;
var userLocation;

var postData;
var faveObject;
var userID;
var updatedProfile;
var profilePicData;
var likePostObject;
var checkingUsername;

var followUserID;
var deletePostObj;

var lat;
var long;
var distances;


app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            resolve:{
                "check": function($location){
                    if(localStorage.getItem("token")){
                        $location.path('/search');
                    }
                }
            },
            templateUrl: 'front-end/pages/crave.html'
        })
        .when('/register', {
            templateUrl: 'front-end/pages/register.html',
            controller: 'RegisterController'
        })
        .when('/login', {
            templateUrl: 'front-end/pages/login.html',
            controller: 'LoginController'
        })
        .when('/search', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/search.html',
        })
        .when('/discover', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/discover.html',
        })

        .when('/favorites', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/favorites.html',
        })
});




app.controller('HomeController', function ($scope, $anchorScroll, $location, $window) {
    $scope.load = function() {
        console.log("HOME")
        // checkHttps();
        if($location.path() == '/'){
            $location.hash('welcome');
            $anchorScroll();
        }
        
    }

    $scope.init = function(){
        if(sessionStorage.getItem("splashed") == 'true'){
            console.log("IN HERE")
            document.getElementById('splash').style.display='none';
        }
        setTimeout(function(){
            document.getElementById('splash').classList.add('fade');
            document.getElementById('splash-logo').classList.add('fade');
            sessionStorage.setItem("splashed", true);
        }, 2000)
    }
});

app.service("RegisterService", function($http){
    console.log("IN REGISTER SERVICE")
    this.path='http://localhost:3000/api/register';
    this.registerUser = function (){
        return $http.post(this.path, registerUserData);
    }

    this.checkNamePath='http://localhost:3000/api/check-username';
    this.checkUsername = function (){
        // console.log(checkingUsername)
        return $http.post(this.checkNamePath, checkingUsername);
    }
});

app.controller('RegisterController', function ($scope, RegisterService, $location) {
    registerUserData = {}
    $scope.register = function(form) {
        checkingUsername = {
            "username":$scope.username
        }
        RegisterService.checkUsername().then(function(response){
            console.log(response.data);
            if(response.data == false){
                document.getElementById('username-taken').style.display='block';
            }
            else if(response.data == true){
                if(form.$valid){
                    console.log("REGISTER!!!")
                    registerUserData = {
                        "fullname": $scope.fullname,
                        "username": $scope.username,
                        // "email": $scope.email,
                        "password": $scope.password,
                        "post_count":0,
                        "follower_count":0,
                        "profile_pic": 'profile.jpg'
                    }
                    console.log(registerUserData);
                    RegisterService.registerUser().then(function(response){
                        console.log("DATA", response.data);
                        $scope.directToLogin();
                    });
                }
                else{
                    console.log("NOT VALID");
                    var errors = document.getElementsByClassName('reg-req');
                    console.log(errors);
                    for(i=0;i<errors.length;i++){
                        errors[i].classList.remove('ng-hide');
                        errors[i].classList.add('ng-show');
                    }
                }
            }

        });
    }

    $scope.directToLogin = function(){
        console.log("D2L");
        $location.path('/login');
    }
});

app.service("LoginService", function($http){
    console.log("IN LOGIN SERVICE")
    this.path='http://localhost:3000/api/login';
    this.loginUser = function (){
        console.log("LOGIN RUNNING")
        return $http.post(this.path, loginUserData);
    }
});

app.controller('LoginController', function ($scope, LoginService, $location, RegisterService) {
    console.log("IN LOGIN CTRL")
    loginUserData = {}
    $scope.login = function(form) {
        checkingUsername = {
            "username":$scope.username
        }
        RegisterService.checkUsername().then(function(response){
            console.log("RDATA",response.data);
            if(response.data == false){
                if(form.$valid){
                    loginUserData = {
                        "username": $scope.username,
                        "password": $scope.password
                    }
                    console.log(loginUserData);
                    LoginService.loginUser().then(function(response){
                        console.log("RES",response.data);
                        console.log("RESTOK",response.data.token);
                        if(response.data == "invalid username" || response.data == 'invalid password'){
                            console.log("INVALID LO")
                            document.getElementById('invalid-login').classList.remove('ng-hide');
                            document.getElementById('invalid-login').classList.add('ng-show');
                        }
                        else{
                            localStorage.setItem("token", response.data.token);
                            $location.path('/search')
                            console.log("OK LOG ME IN")
                        }
                    });
                }
                else{
                    console.log("NOT VALID");
                    var errors = document.getElementsByClassName('reg-req');
                    console.log(errors);
                    for(i=0;i<errors.length;i++){
                        errors[i].classList.remove('ng-hide');
                        errors[i].classList.add('ng-show');
                    }
                }
            }
            else if(response.data == true){
                console.log($scope.username)
                if($scope.username == undefined){
                    var errors = document.getElementsByClassName('reg-req');
                    console.log(errors);
                    for(i=0;i<errors.length;i++){
                        errors[i].classList.remove('ng-hide');
                        errors[i].classList.add('ng-show');
                    }
                }
                else{
                    document.getElementById('invalid-username').classList.remove('ng-hide');
                    document.getElementById('invalid-username').classList.add('ng-show');
                }
                
            }

        });
    }

    $scope.directToRegister = function(){
        console.log("D2R");
        $location.path('/register');
    }
});

app.service("DashboardService", function($http){
    console.log("IN DASH SERVICE")
    tokenData = {};
    tokenData = {
        "token": localStorage.getItem('token')
    }
    this.path='http://localhost:3000/api/getUser';
    this.getUser = function (){
        return $http.post(this.path, tokenData);
    }
});

app.service('DiscoverService', function($http){
    this.path='http://localhost:3000/yelp/crave-search';
    this.sendYelpData = function (){
        console.log('in sendyelp')
        return $http.post(this.path, yelpQuery);
    }

    this.getUserLocation = function(){
        console.log("LAT", lat);
        console.log("LONG", long);
        return $http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyDnScNtIJXrverfSC7o51y1LXR2q0Dlz58`)
    }


    this.getLocationCoords = function(userLocation){
        console.log("CONVERT: ", userLocation);
        return $http.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${userLocation}&key=AIzaSyDnScNtIJXrverfSC7o51y1LXR2q0Dlz58`)
    }
});


app.controller('DiscoverController', function($scope, DiscoverService){
    yelpQuery = {};
    $scope.price = 0;

    $scope.$watch('price', function (numberVal) {
        console.log("SLIDER", $scope.price);
        if (typeof numberVal !== 'undefined') {
            if(numberVal == 0){
                $scope.priceVal = "Any Price"
            }
            if(numberVal == 1){
                $scope.priceVal = "$";
            }
            else if(numberVal == 2){
                $scope.priceVal = "$$";
            }
            else if(numberVal == 3){
                $scope.priceVal = "$$$";
            }
            else if(numberVal == 4){
                $scope.priceVal = "$$$$";
            }
        }
    });

    $scope.discover = function(){
        console.log("DISCOVER TRIGGERED");
        if($scope.price == 0){
            yelpQuery = {
                "term": $scope.term,
                "location": $scope.location,
                "limit": 50
            }
        }
        else{
            yelpQuery = {
                "term": $scope.term,
                "price": $scope.price,
                "location": $scope.location,
                "limit": 50
            }
        }
        console.log("YELP QUERY", yelpQuery);
        DiscoverService.sendYelpData().then(function(response){
            console.log("RESPONSE", response.data);
            if(response.data.total == 0){
                console.log("NO RESULTS")
                document.getElementById('invalid-search').style.display='block';
            }
            else{
                console.log("SHOW SPLASH")
                document.getElementById('search-splash').style.display='flex';
                cardObject = response.data;
                userLocation = $scope.location;
                DiscoverService.getLocationCoords(userLocation).then(function(response){
                    console.log("RESP: ", response.data.results[0].geometry.location);
                    distances = [];
                    lat = response.data.results[0].geometry.location.lat;
                    lon = response.data.results[0].geometry.location.lng;
                    for(i=0;i<cardObject.businesses.length; i++){
                        var f = new google.maps.LatLng(lat, lon);
                        var t = new google.maps.LatLng(cardObject.businesses[i].coordinates.latitude, cardObject.businesses[i].coordinates.longitude);
                        var service = new google.maps.DistanceMatrixService();
                        service.getDistanceMatrix(
                            {
                                origins: [f],
                                destinations: [t],
                                travelMode: 'DRIVING',
                                unitSystem: google.maps.UnitSystem.IMPERIAL
                            }, function(response, status){
                                if (status == 'OK') {
                                    console.log("RES:!", response.rows[0].elements[0].distance.text);
                                    distances.push(response.rows[0].elements[0].distance.text);
                                    if(distances.length == cardObject.businesses.length){
                                        console.log("DONEZOSSSS")
                                        directToDiscover();
                                    }
                                    else{
                                        console.log("NOT DONE: ", distances.length)
                                    }
                                }
                            });
                    }
                });


            }
        });
    }

    $scope.getGeoLocation = function(){
        document.getElementById('accent').style.cursor ='wait'
        console.log("GET GEOLOCATION")
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                $scope.$apply(function(){
                    $scope.position = position;
                    console.log("POSITION: ", $scope.position);
                    lat = $scope.position.coords.latitude;
                    long = $scope.position.coords.longitude;

                    DiscoverService.getUserLocation().then(function(response){
                        console.log(response.data)
                        $scope.location = response.data.results[0].formatted_address;
                        document.getElementById('accent').style.cursor ='pointer'
                    });
                });
            });
        }
    }
})

app.service('FavoriteService', function ($http){
    this.postPath='http://localhost:3000/api/add-favorite';
    this.addFavorite = function(){
        console.log("ADDING FAVE...")
        return $http.post(this.postPath, faveObject);
    }

    this.getPath='http://localhost:3000/api/get-favorites';
    this.getFavorites = function(){
        console.log("GETTING FAVES...")
        return $http.post(this.getPath, userID);
    }

    this.removePath='http://localhost:3000/api/remove-favorite';
    this.removeFavorite = function(faveID){
        console.log("REMOVING FAVORITE...", faveID);
        return $http.post(this.removePath, faveID);
    }

    this.checkFavePath='http://localhost:3000/api/check-favorite';
    this.checkFavorite = function(){
        console.log("CHECKING FAVORITE...", faveObject);
        return $http.post(this.checkFavePath, faveObject);
    }

});

app.controller('FaveController', function($scope, DashboardService, FavoriteService, $route){
    DashboardService.getUser().then(function(response){
        userID = {
            "id":response.data._id
        }
        FavoriteService.getFavorites().then(function(response){
            console.log("GETFAVESRESPONSE", response.data);
            $scope.faves = response.data;
        });
    });

    $scope.removeFavorite = function(cardID){
        console.log("REMOVE CARD:" , $scope.faves[cardID].id);
        $scope.faves[cardID].index = cardID;
        FavoriteService.removeFavorite($scope.faves[cardID]).then(function(response){
            console.log("REMOVERES", response.data);
            $route.reload();
        });
    };
    
});

app.controller('CardController', function($scope, FavoriteService, DashboardService){
    var cardIndex = 0;
    console.log("CARD CTRL")
    DashboardService.getUser().then(function(response){
        $scope.userID = response.data._id;
    });

    if(cardObject == undefined){
        directToSearch();
        $scope.empty = true;
    }
    else {
        $scope.cards = cardObject.businesses;
        shuffle($scope.cards);
        $scope.totalCards = $scope.cards.length-1;
        $scope.numOfCardsLeft = $scope.totalCards;
        $scope.distances = distances;
        console.log("LOCATION: ", userLocation);
        for(i=0;i<$scope.distances.length;i++){
            $scope.cards[i].miles = $scope.distances[i];
        }
    }

    angular.element(document).ready(function(){
        if(!$scope.empty){
            console.log("NOT EMPTY")
            allCards = document.getElementsByClassName('card');
            console.log(allCards.length);
            initCards()
        }
    });
     
    function initCards(){
        console.log("CARD INDEX", cardIndex);
        var direction;
        for(var i = 0; i < allCards.length; i++){
            allCards[i].style.zIndex = allCards.length-i;
            var hammer = new Hammer(allCards[i]);
            hammer.on('pressup', function(event){
                if(event.type=='pressup'){
                    var yelpURL = $scope.cards[cardIndex].url;
                    window.open(yelpURL, '_blank').focus(); 
                }
            })

            hammer.on('panleft panright', function(event){
                if(event.type == 'panleft'){
                    direction = 'left';
                    event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(-20deg)`;
                    event.target.style.background = '#DF6857';
                }
                else{
                    direction = 'right'
                    event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(20deg)`;
                    event.target.style.background = '#77D9B5';
                }
            });
        
            hammer.on('panend', function(event){
                if(event.distance < 230){
                    event.target.style.transform = '';
                    event.target.style.background = '#ebebeb';
                }
                else{
                    if(direction == 'right'){
                        $scope.addToFavorites(cardIndex);
                    }
                    // cardIndex++;
                    $scope.countCards();
                    event.target.style.opacity = '0';
                    event.target.style.transition = '0.75s ease-out';
                    setTimeout(function(){event.target.style.display = 'none'}, 750);
                    console.log("CARD INDEX", cardIndex);
                }
            });

        }

    }

    $scope.yes = function(){
        // console.log("YES");
        // console.log("ALLCARDS", allCards)
        console.log("CARD", allCards[cardIndex]);
        allCards[cardIndex].style.transform = `translate(250px) rotate(20deg)`;
        allCards[cardIndex].style.background = '#77D9B5';
        allCards[cardIndex].style.opacity = '0';
        allCards[cardIndex].style.transition = '0.75s ease-out';
        $scope.addToFavorites(cardIndex);
        setTimeout(function(){
            allCards[cardIndex].style.display = 'none'
            // cardIndex++;
            $scope.countCards();
        }, 750);
    }

    $scope.no = function(){
        console.log("CARD", allCards[cardIndex]);
        allCards[cardIndex].style.transform = `translate(-250px) rotate(-20deg)`;
        allCards[cardIndex].style.background = '#DF6857';
        allCards[cardIndex].style.opacity = '0';
        allCards[cardIndex].style.transition = '0.75s ease-out';
        setTimeout(function(){
            allCards[cardIndex].style.display = 'none'
            // cardIndex++;
            $scope.countCards();
            console.log("NEW INDEX", cardIndex);
        }, 750);
    }
    
    $scope.addToFavorites = function(cardIndex){
        console.log("ADD TO FAVE", $scope.cards[cardIndex]);
        faveObject = $scope.cards[cardIndex];
        faveObject.userID = $scope.userID;

        FavoriteService.checkFavorite().then(function(response){
            console.log("CHECK F", response.data)
            if(!response.data == true){
                FavoriteService.addFavorite();
            }
        });

    }

    $scope.countCards = function(){
        if($scope.totalCards > 0){
            cardIndex++;
            $scope.totalCards--;
            $scope.$apply(function() {
                $scope.numOfCardsLeft = $scope.totalCards;
            });
        }
    }

    $scope.viewControls = function(){
        console.log("SHOW CONTROLS")
        document.getElementById('controls-box').style.visibility='visible';
    }

    $scope.hideControls = function(){
        console.log("HIDE CONTROLS")
        document.getElementById('controls-box').style.visibility='hidden';
    }
});

///////////
app.service('anchorSmoothScroll', function(){
    
    this.scrollTo = function(eID) {

        // This scrolling function 
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
        
        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }
        
        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
        
        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };
    
});

app.controller('ScrollCtrl', function($scope, $location, anchorSmoothScroll) {
    $scope.directToLogin = function(){
        console.log("D2L");
        $location.path('/login');
    }
    $scope.directToRegister = function(){
        console.log("D2R");
        $location.path('/register');
    }

    $scope.gotoElement = function (eID){
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(eID);
        console.log(eID);
      // call $anchorScroll()
      anchorSmoothScroll.scrollTo(eID);
      
    };
  });

function navHamburger() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
        console.log("HAMB")
        document.getElementById("showLogin").style.display="block !important"
    } else {
        x.className = "topnav";
        document.getElementById("showLogin").style.display="none !important"
    }
}

function directToSearch(){
    window.location.replace("#/search");
}

function directToFavorites(){
    console.log("FAVS")
    window.location.replace("#/favorites");
}

function directToDiscover(){
    window.location.replace("#/discover");
}

function goHome(){
    window.location.assign("#/");
    window.location.reload();
}

function directToLogout(){
    console.log("LOGOUT");
    localStorage.clear();
    window.location.replace("#/login");
    window.location.reload();
}

function getLocation(){
    console.log("IN GETLOCATION")
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            console.log("LAT",position.coords.latitude)
            console.log("LONG",position.coords.longitude); 
            return position;
        });
    }
}

function showPosition(position) {
    console.log("LAT",position.coords.latitude)
    console.log("LONG",position.coords.longitude); 
}



function checkHttps(){
    console.log("CHECKING");
    if (window.location.protocol == "http:") {
        var restOfUrl = window.location.href.substr(5);
        window.location = "https:" + restOfUrl;
    }
}

function profilePicLoaded(){
    console.log("PIC LOADED")
    var sidebarAvatar = document.getElementById('profile-pic');
    sidebarAvatar.style.visibility = 'visible';
}

function avatarLoaded(){
    var avatar = document.getElementById('avatar');
    avatar.style.visibility = 'visible';
}

function distance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    console.log("DISTANCE: ", d);
  }
  
function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}
