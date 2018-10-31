var app = angular.module('craveApp', ['ngRoute', 'ngScrollSpy', 'ngSanitize']);
var registerUserData;
var loginUserData;
var tokenData;
var yelpQuery;
var uploadData; 
var allCards;
var $scope, $location;
var cardObject;
var postData;
var faveObject;
var userID;

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
        .when('/feed', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/feed.html',
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

        .when('/profile', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/profile.html',
        })

        .when('/crave-search', {
            // resolve:{
            //     "check": function($location){
            //         if(!localStorage.getItem("token")){
            //             $location.path('/login');
            //         }
            //     }
            // },
            templateUrl: 'front-end/pages/crave-search.html',
        })

        .when('/upload', {
            templateUrl: 'front-end/pages/upload.html',
        })
});




app.controller('HomeController', function ($scope, $anchorScroll, $location, $window) {
    $scope.load = function() {
        console.log($location.path())
        // checkHttps();
        if($location.path() == '/'){
            $location.hash('welcome');
            $anchorScroll();
        }
    }
});

app.service("RegisterService", function($http){
    console.log("IN REGISTER SERVICE")
    this.path='http://localhost:3000/api/register';
    this.registerUser = function (){
        console.log("SERVICE RUNNING")
        return $http.post(this.path, registerUserData);
    }
});

app.controller('RegisterController', function ($scope, RegisterService, $location) {
    console.log("IN REGISTER CTRL")
    registerUserData = {}
    $scope.register = function() {
        registerUserData = {
            "fullname": $scope.fullname,
            "username": $scope.username,
            "email": $scope.email,
            "password": $scope.password,
            "post_count":0,
            "follower_count":0
        }
        console.log(registerUserData);
        RegisterService.registerUser().then(function(response){
            console.log("DATA", response.data);
            // directToLogin();
            // $location.path('/login')
            $scope.directToLogin();
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

app.controller('LoginController', function ($scope, LoginService, $location) {
    console.log("IN LOGIN CTRL")
    loginUserData = {}
    $scope.login = function() {
        loginUserData = {
            "username": $scope.username,
            "password": $scope.password
        }
        console.log(loginUserData);
        LoginService.loginUser().then(function(response){
            console.log("RES",response.data);
            console.log("RESTOK",response.data.token);
            localStorage.setItem("token", response.data.token);
            $location.path('/search')
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

app.controller('DashboardController', function($scope, DashboardService) {
    DashboardService.getUser().then(function(response){
        console.log(response.data);
        // localStorage.setItem('username', response.data.username);
        // localStorage.setItem('posts', response.data.post_count);
        // localStorage.setItem('followers', response.data.follower_count);
        // $scope.username = localStorage.getItem('username');
        // $scope.post_count = localStorage.getItem('posts');
        // $scope.follower_count = localStorage.getItem('followers');
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
    });
});


app.service('DiscoverService', function($http){
    this.path='http://localhost:3000/yelp/crave-search';
    this.sendYelpData = function (){
        console.log('in sendyelp')
        return $http.post(this.path, yelpQuery);
    }
});


app.controller('DiscoverController', function($scope, DiscoverService, DashboardService){
    // $scope.username = localStorage.getItem('username');
    // $scope.post_count = localStorage.getItem('posts');
    // $scope.follower_count = localStorage.getItem('followers');
    DashboardService.getUser().then(function(response){
        console.log(response.data);
        // localStorage.setItem('username', response.data.username);
        // localStorage.setItem('posts', response.data.post_count);
        // localStorage.setItem('followers', response.data.follower_count);
        // $scope.username = localStorage.getItem('username');
        // $scope.post_count = localStorage.getItem('posts');
        // $scope.follower_count = localStorage.getItem('followers');
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
    });

    yelpQuery = {};
    $scope.price = 1;

    $scope.$watch('price', function (numberVal) {
        if (typeof numberVal !== 'undefined') {
            if(numberVal == 1){
                $scope.priceVal = "$";
            }
            else if(numberVal == 2){
                $scope.priceVal = "$$";
            }
            else if(numberVal == 3){
                $scope.priceVal = "$$$";
            }
            else{
                $scope.priceVal = "$$$$";
            }
        }
    });

    $scope.discover = function(){
        console.log("DISCOVER TRIGGERED");
        yelpQuery = {
            "term": $scope.term,
            "price": $scope.price,
            "location": $scope.location,
            "limit": 50
        }
        console.log("YELP QUERY", yelpQuery);
        DiscoverService.sendYelpData().then(function(response){
            console.log("RESPONSE", response.data);
            cardObject = response.data;
            directToSearch();
        });
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

});

app.controller('FaveController', function($scope, DashboardService, FavoriteService, $route){
    DashboardService.getUser().then(function(response){
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
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

app.controller('CardController', function($scope, DashboardService, FavoriteService){
    if(cardObject == undefined){
        directToDiscover();
        $scope.empty = true;
    }
    else{
        $scope.cards = cardObject.businesses;
    }
    console.log("CARD CTRL")
    DashboardService.getUser().then(function(response){
        $scope.username = response.data.username;
        $scope.post_count = response.data.post_count;
        $scope.follower_count = response.data.follower_count;
        $scope.userID = response.data._id;
    });

    // $scope.cards = [
    //     {
    //         "image_url":"/front-end/resources/images/panda.jpg",
    //         "name":"Restaurant 0",
    //         "categories":[
    //             {"title": "title0"}
    //         ],
    //         "is_closed":true,
    //         "rating":"5",
    //         "price":"$$$$",
    //         "phone":"1234567890",
    //         "location":{
    //             "display_address":[
    //                 "143 S Main St",
    //                 "Salt Lake City, UT 84111"
    //             ]
    //         }
    //     }
    // ]

    var cardIndex = 0;
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
                    cardIndex++;
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
            cardIndex++;
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
            cardIndex++;
            console.log("NEW INDEX", cardIndex);
        }, 750);
    }
    
    $scope.addToFavorites = function(cardIndex){
        console.log("ADD TO FAVE", $scope.cards[cardIndex]);
        faveObject = $scope.cards[cardIndex];
        faveObject.userID = $scope.userID;
        FavoriteService.addFavorite();
    }
    

});

app.service('UploadService', function($http){
    this.path='http://localhost:3000/api/upload';
    this.uploadPost = function(){
        return $http.post(this.path, postData, {
            transformRequest: angular.identity,
            headers:{
                'Content-Type': undefined
            }
        });
    }
});

app.controller('UploadController', function($scope, UploadService){
    console.log("IN UPLOAD CTRL")
    $scope.onImagePicked = function(imgFile){
        console.log("IMAGE PICKED!", imgFile.files[0]);
        $scope.postImage = imgFile.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            console.log("On load")
            $scope.$apply(function() {
              $scope.imagePreviewUrl = reader.result;
            });
        }
        reader.readAsDataURL(imgFile.files[0]);
    }


    $scope.upload = function(){
        console.log("UPLOAD CLICKED")
        console.log("CAPTION",$scope.postCaption);
        console.log("LOCATION",$scope.postLocation);
        console.log("IMAGE",$scope.postImage);
        postData = new FormData();
        postData.append('caption', $scope.postCaption);
        postData.append('location', $scope.postLocation);
        postData.append('image', $scope.postImage);

        console.log("PD", postData);
        UploadService.uploadPost().then(function(response){
            console.log("RESPONSE", response.data);
        });
    }
});

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

///////////
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
    } else {
        x.className = "topnav";
    }
}

function directToDashboard(){
    console.log("DASH")
    window.location.replace("#/search");
    // window.location.reload();
}

function directToFeed(){
    console.log("FEED")
    window.location.replace("#/feed");
}

function directToDiscover(){
    console.log("DISCOVER")
    window.location.replace("#/discover");
}

function directToSearch(){
    window.location.replace("#/crave-search");
}

function directToFavorites(){
    console.log("FAVS")
    window.location.replace("#/favorites");
}

function directToProfile(){
    console.log("PROFILE")
    window.location.replace("#/profile");
}

function directToLogout(){
    console.log("LOGOUT");
    localStorage.clear();
    window.location.replace("#/login");
}

function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
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