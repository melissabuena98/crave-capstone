var app = angular.module('craveApp', ['ngRoute', 'ngScrollSpy', 'ngSanitize']);
var registerUserData;
var loginUserData;
var allCards;
var $scope, $location;

app.config(function($routeProvider){
    $routeProvider
        .when('/', {
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
        .when('/dashboard', {
            resolve:{
                "check": function($location){
                    if(!localStorage.getItem("token")){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'front-end/pages/dashboard.html',
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
    console.log("IN SERVICE")
    path='http://localhost:3000/api/register';
    this.registerUser = function (){
        console.log("SERVICE RUNNING")
        return $http.post(path, registerUserData);
    }
});

app.controller('RegisterController', function ($scope, RegisterService) {
    console.log("HERE")
    registerUserData = {}
    $scope.register = function() {
        registerUserData = {
            "fullname": $scope.fullname,
            "username": $scope.username,
            "email": $scope.email,
            "password": $scope.password
        }
        console.log(registerUserData);
        RegisterService.registerUser().then(function(response){
            console.log("DATA", response.data);
            directToLogin();
        });
    }
});

app.service("LoginService", function($http){
    console.log("IN LOGIN SERVICE")
    path='http://localhost:3000/api/login';
    this.loginUser = function (){
        console.log("LOGIN RUNNING")
        return $http.post(path, loginUserData);
    }
});

app.controller('LoginController', function ($scope, LoginService, $location) {
    loginUserData = {}
    $scope.login = function() {
        loginUserData = {
            "username": $scope.username,
            "password": $scope.password
        }
        console.log(loginUserData);
        LoginService.loginUser().then(function(response){
            // console.log("DATA", response.data);
            localStorage.setItem("token", response.data.token);
            console.log("STORAGE", localStorage.getItem("token"));
            $location.path('/dashboard')
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
    
    $scope.gotoElement = function (eID){
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(eID);
        console.log(eID);
      // call $anchorScroll()
      anchorSmoothScroll.scrollTo(eID);
      
    };
  });

app.controller('CardController', function($scope){
    var cardObject = [
        {"name": "Panda Express",
        'img':'/front-end/resources/images/panda.jpg'
        },
    ]
    $scope.cards = cardObject;
    angular.element(document).ready(function(){
        // console.log("READY");        
        allCards = document.getElementsByClassName('card');
        var overlay = document.getElementById('overlay');
        // console.log(allCards)
        console.log(allCards.length);
        
        initCards()
    });
        
    function initCards(){
        // console.log("OUTSIDE");
        for(var i = 0; i < allCards.length; i++){
            allCards[i].style.zIndex = allCards.length-i;
            // console.log(allCards[i]);
            var hammer = new Hammer(allCards[i]);
            hammer.on('panleft panright', function(event){
                // console.log(event);
                if(event.type == 'panleft'){
                    event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(-20deg)`;
                    event.target.style.background = '#DF6857';
                }
                else{
                    event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(20deg)`;
                    event.target.style.background = '#77D9B5';
                }
            });
        
            hammer.on('panend', function(event){
                if(event.distance < 230){
                    event.target.style.transform = '';
                    event.target.style.background = '#989898';
                }
                else{
                    event.target.style.opacity = '0';
                    event.target.style.transition = '1s ease-out';
                    setTimeout(function(){event.target.style.display = 'none'}, 1000);
                }
            });
        }

    }
    

        
    

});



function navHamburger() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function directToRegister(){
    console.log("REGISTER");
    window.location.replace("#/register");
}

function directToLogin(){
    console.log("LOGIN");
    window.location.replace("#/login");
}

function directToDashboard(){
    console.log("DASH")
    window.location.replace("#/dashboard");
}

function directToFeed(){
    console.log("FEED")
    window.location.replace("#/feed");
}

function directToDiscover(){
    console.log("DISCOVER")
    window.location.replace("#/discover");
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