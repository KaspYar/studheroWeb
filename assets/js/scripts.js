/* 
 * Main Application Model START
 */
function AppViewModel() {

    var self = this;
    var ext = "php";
    self.Nav = ko.observable(Navigation());
    self.AppDate = ko.observable(ApplicationDate());
    self.User = ko.observable(User());
    self.Ajax = ko.observable(Ajax());

    self.Nav().setTitle();

    self.currentYear = ko.observable(self.AppDate().year);
    self.currentPage = ko.observable(self.Nav().currentPage);
    self.showCreateEvent = self.Nav().showCreateEvent;
    self.showMain = self.Nav().showMain;
    self.eventsBatch = ko.observable(0);


    /* Bindings for search*/
    self.search_text_value = ko.observable("");
    var search_text_value_used = "";
    self.search_text_value.subscribe(function(newValue) {
        self.search_text_value(newValue);
        self.search();
    });

    /* set toggle buttons value*/
    var currentActivity_defult ="Сфера діяльності";
    var common_defult ="Будь-який";
    self.currentActivity = ko.observable(currentActivity_defult);
    var currentActivity_used = "";
    self.setActivity = function (data, event) {
        self.currentActivity(event.target.innerHTML);
        self.search();
    }
    var eventType_defult ="Тип події";
    self.eventType = ko.observable(eventType_defult);
    var eventType_used = "";
    self.setEventType = function (data, event) {
        self.eventType(event.target.innerHTML);
        self.search();
    };

    /* on pages loaded events */
    self.currentEvent = ko.observableArray([]);
    self.events = ko.observableArray([]);
    jQuery(document).ready(function () {
        if (window.location.pathname === '/index.' + ext) {
            var h = jQuery(window).height();
            //jQuery(".main-background").css("padding-top", h/2+"px");
        }
        ;
        if (window.location.pathname === '/profile.' + ext) {
            self.User().profile();
        }
        ;
        if (window.location.pathname === '/event-page.' + ext) {
            self.Ajax().getEvent(null, getCookie("createdEvent"), function (data) {
                self.currentEvent(data);
            });
        }
        ;
        if (window.location.pathname === '/events.' + ext) {
            self.loadEvents();
        }
        ;
        if (window.location.pathname === '/for-students.' + ext) {
            self.User().setUser("student");
        }
        ;
        if (window.location.pathname === '/for-companies.' + ext) {
            self.User().setUser("company");
        }
        ;

    });

    self.loadEvents = function () {
        jQuery("#load-more-btn").addClass("disabled");
        var from = self.eventsBatch();
        var to = from === 0 ? 11 : self.eventsBatch() + 12;
        self.Ajax().getEvents(0, to, function (data) {
            self.events(data);
            self.eventsBatch(to);
            if (from !== 0) {
                jQuery('html,body').animate({
                    scrollTop: jQuery('#load-more-btn').offset().top - 1470
                }, 1000);
            }
            jQuery("#load-more-btn").removeClass("disabled");
        });
    }
    self.subscribeToEvent = function () {
        var idStudent = User().getId();
        var idEvent = self.currentEvent().objectId;
        self.Ajax().subscribeToEvent(idStudent, idEvent, self.User().subscribe());
    }
    /*
     jQuery("#upload-photo-form").submit(function(e){
     jQuery.ajax( {
     url: 'http://89.184.67.220:8080/StudHero/events/uploadFile',
     type: 'POST',
     data: new FormData( this ),
     processData: false,
     contentType: false,
     success: function(data){
     console.log(data);
     },
     error: function(a,b,c){
     console.log(a,b,c);
     }
     });
     e.preventDefault();
     });
     */
    self.loginStudent = function () {
        var data = {
            email: self.User().login(),
            password: self.User().password()
        };
        self.Ajax().loginStudent(JSON.stringify(data), self.User().onLoggedInStudent);
    };

    self.loginCompany = function () {
        var data = {
            email: self.User().login(),
            password: self.User().password()
        };
        self.Ajax().loginCompany(JSON.stringify(data), self.User().onLoggedInCompany);
    };

    self.createEvent = function () {
        var data = {
            title: jQuery("#create-event-form input[name=title]").val(),
            description: jQuery("#create-event-form textarea[name=description]").val(),
            descriptionShort: jQuery("#create-event-form input[name=descriptionShort]").val(),
            startDate: jQuery("#create-event-form input[name=startDate]").val(),
            endDate: jQuery("#create-event-form input[name=endDate]").val(),
            startTime: jQuery("#create-event-form input[name=startTime]").val(),
            endTime: jQuery("#create-event-form input[name=endTime]").val(),
            manager: jQuery("#create-event-form input[name=manager]").val(),
            activity: self.currentActivity(),
            type: self.eventType(),
            company: User().getId()
        };
        var restServer = 'http://studhero.org:8080/StudHero';
        var formData = new FormData();
        var fileSelect = document.getElementById('upload-photo');
        if (fileSelect.files.length > 0) {
            formData.append('file', fileSelect.files[0], fileSelect.files[0].name);
            if (!fileSelect.files[0].type.match('image.*')) {
                alert("Wrong image format");
                return;
            }
            jQuery.ajax({
                url: restServer + '/events/uploadFile',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (imageUrl) {
                    data.image = imageUrl;
                    self.Ajax().createEvent(JSON.stringify(data));
                }
            });
        } else {
            self.Ajax().createEvent(JSON.stringify(data));
        }

    };

    self.createUser = function () {
        if (self.User().type() === "student") {
            self.createStudent();
        } else {
            self.createCompany();
        }
    }

    self.createCompany = function () {
        var form = "#company-registarte-form ";
        var data = {
            user: {
                password: jQuery(form + "input[name=password]").val(),
                email: jQuery(form + "input[name=email]").val()
            },
            company: {
                name: jQuery(form + "input[name=name]").val(),
                activity: self.currentActivity(),
                edrpoy: jQuery(form + "input[name=edrpoy]").val(),
                phone: jQuery(form + "input[name=phone]").val(),
                city: jQuery(form + "input[name=city]").val(),
                email: jQuery(form + "input[name=email]").val()
            }
        };
        if (jQuery(form + "input[name=password]").val() !== jQuery(form + "input[name=password2]").val()) {
            jQuery('#wrong-password-popup').modal('show');
        } else {
            self.User().setUser("company");
            self.Ajax().createCompany(JSON.stringify(data), self.User().onRegistrateCompany);
        }
    }

    self.createStudent = function () {
        var form = "#student-registarte-form ";
        var data = {
            user: {
                password: jQuery(form + "input[name=password]").val(),
                email: jQuery(form + "input[name=email]").val()
            },
            student: {
                name: jQuery(form + "input[name=name]").val(),
                phone: jQuery(form + "input[name=phone]").val(),
                city: jQuery(form + "input[name=city]").val(),
                email: jQuery(form + "input[name=email]").val()
            }
        };
        if (jQuery(form + "input[name=password]").val() !== jQuery(form + "input[name=password2]").val()) {
            jQuery('#wrong-password-popup').modal('show');
        } else {
            self.User().setUser("student");
            self.Ajax().createStudent(JSON.stringify(data), self.User().onRegistrateStudent);
        }
    }

    /* init USER on document loaded */
    var user = getCookie("user");
    console.log("current user: " + user);
    console.log("logged in: " + self.User().loggedIn());
    if (!user || user === "") {
        self.User().setUser("student");
    } else {
        self.User().getUser();
    }

    jQuery('.data-picker input').datepicker({
        autoclose: true,
        clearBtn: true,
        disableTouchKeyboard: true,
        weekStart: 1
    });
    jQuery('.time-picker input').timepicker({
        template: "dropdown",
        showMeridian: false
    });

    jQuery('#student-registarte-form').validator();
    jQuery('#company-registarte-form').validator();
    jQuery('#create-event-form').validator();
    jQuery('#feedback-form').validator();

    self.scrollToHowItWorks = function () {
        var h = jQuery(window).height() / 2 - jQuery('#how-it-works').height() / 2;
        jQuery('html,body').animate({
            scrollTop: jQuery('#how-it-works').offset().top - 60 - h
        }, 1000);
    };
    self.scrollToHowItWorks2 = function () {
        var h = jQuery(window).height() / 2 - jQuery('#how-it-works-2').height() / 2;
        jQuery('html,body').animate({
            scrollTop: jQuery('#how-it-works-2').offset().top - 60 - h
        }, 1000);
    };
    self.scrollToFooter = function (data, event) {
        var to = jQuery('.contact-form').length ? jQuery('.contact-form').offset().top - 60 : jQuery('.footer').offset().top - 60
        jQuery('html,body').animate({
            scrollTop: to
        }, 1000);
        jQuery(".menu li > a").removeClass("active");
    };

    self.sendFeedback = function () {
        var callback = function (data) {
            jQuery("#feedback-sent-popup").modal("show");
        };
        var postData = {
            name: jQuery(".contact-form #name").val(),
            email: jQuery(".contact-form #email").val(),
            text: jQuery(".contact-form #text").val()
        };
        self.Ajax().sendFeedback(postData, callback);
    }

    self.search = function(){
        var start =
            "[";
        var search_string_param = self.search_text_value() === "" ?"":
        "{\"paramNames\":[\"title\"],\"paramValue\":\""+self.search_text_value()+"\"}";
        var search_current_activity_param =
            self.currentActivity() === common_defult ||  self.currentActivity() === currentActivity_defult ?"":
        "{\"paramNames\":[\"activity\"],\"paramValue\":\""+self.currentActivity()+"\"}";
        var search_event_type_param =
            self.eventType() === common_defult ||  self.eventType() === eventType_defult ?"":
        "{\"paramNames\":[\"type\"],\"paramValue\":\""+self.eventType()+"\"}";
        var end = "]";

        var search_values = "";
        search_values =
            search_values +
            (search_values === "" || search_string_param === "" ? search_string_param: ","+search_string_param);
        search_values =
            search_values +
            (search_values === "" || search_current_activity_param === "" ? search_current_activity_param
                : ","+search_current_activity_param);
        search_values =
            search_values + 
            (search_values === "" || search_event_type_param === "" ? search_event_type_param
                : ","+search_event_type_param);
        var all =
            start
            +search_values
            +end;
        self.Ajax().searchEvent(all,
            function (data) {
                self.events.removeAll();
                self.events(data);
            });
        currentActivity_used = self.currentActivity;
        eventType_used = self.eventType;
        search_text_value_used = self.search_text_value;
    }
}

/* 
 * Main Application Model END
 */

/* 
 * Navigation START
 */
var Navigation = function () {
    var titleMain = "StudHero";
    var sep = " | ";
    var ext = ".php";
    var pages = {
        indexPage: "index",
        eventsPage: "events",
        eventPage: "event-page",
        faqPage: "faq",
        loginPage: "login",
        searchPage: "search",
        registrationPage: "registration",
        newEventPage: "create-event",
        profilePage: "profile"
    };
    var currentPage = window.location.pathname.replace('/', '');

    var navObj = {
        pages: pages,
        ext: ext,
        showCreateEvent: function () {
            var loggedIn = getCookie("loggedIn");
            var userType = getCookie("user");
            if (loggedIn === "true" && userType === "company") {
                window.location.pathname = pages.newEventPage + ext;
            } else {
                navObj.showLogin();
            }
        },
        showMain: function () {
            window.location.pathname = pages.indexPage + ext;
        },
        showEvents: function () {
            window.location.pathname = pages.eventsPage + ext;
        },
        showEvent: function (data) {
            setCookie("createdEvent", data.objectId, 1);
            window.location.pathname = pages.eventPage + ext;
        },
        showFAQ: function () {
            window.location.pathname = pages.faqPage + ext;
        },
        showRegistration: function () {
            window.location.pathname = pages.registrationPage + ext;
        },
        showLogin: function () {
            window.location.pathname = pages.loginPage + ext;
        },
        showProfile: function () {
            window.location.pathname = pages.profilePage + ext;
        },
        setTitle: function () {
            switch (currentPage) {
                case "index" + ext:
                    document.title = titleMain + sep + "Головна";
                    break;
                case "events" + ext:
                    document.title = titleMain + sep + "Події";
                    break;
                case "faq" + ext:
                    document.title = titleMain + sep + "FAQ";
                    break;
                case "login" + ext:
                    document.title = titleMain + sep + "Вхід";
                    break;
                case "registration" + ext:
                    document.title = titleMain + sep + "Реєстрація";
                    break;
                case "profile" + ext:
                    document.title = titleMain + sep + "Профайл";
                    break;
            }
        },
        currentPage: currentPage ? currentPage : pages.indexPage + ext
    };
    return navObj;
};
/* 
 * Navigation END
 */

/* 
 * Application Date START
 */
var ApplicationDate = function () {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDay();
    var dateObj = {
        year: year,
        getFullDate: function () {
            return day + "." + month + "." + year;
        },
        getFullDate2: function () {
            var y = year < 10 ? "0" + year.toString() : year;
            var m = month < 10 ? "0" + month.toString() : year;
            var d = day < 10 ? "0" + day.toString() : year;
            return d + "/" + m + "/" + y;
        }
    };
    return dateObj;
};
/* 
 * Application Date END
 */

/* 
 * User START
 */
var User = function () {
    var self = {};
    var restServer = 'http://studhero.org:8080/StudHero';
    self.nav = new Navigation();
    self.type = ko.observable("student");
    self.login = ko.observable("");
    self.password = ko.observable("");
    self.id = ko.observable();
    self.userInfo = ko.observableArray([]);

    self.loggedIn = ko.computed(function () {
        var loggedIn = getCookie("loggedIn");
        return loggedIn && loggedIn == "true";
    });
    self.subscribe = function () {
        jQuery('#subscribe-popup').modal('show');
    },
        self.setUser = function (user) {
            self.type(user);
            setCookie("user", user, 1);
        }
    self.getUser = function () {
        var user = getCookie("user");
        self.type(user);
        return user;
    };
    self.getId = function () {
        return getCookie("userId");
    }
    self.checkUser = function () {
        var name = getCookie("user");
        return name && (name === "student" || name === "company");
    };
    self.onLoggedInStudent = function (data) {
        if (data.error) {
            jQuery("#login-error-popup").modal("show");
            return;
        }
        if (data.objectId == 0)
            return;
        console.log("user id: " + data.objectId);
        setCookie("loggedIn", "true", 1);
        setCookie("userId", data.objectId, 1);
        self.setUser("student");
        self.nav.showProfile();
    };
    self.onRegistrateStudent = function (data) {
        console.log("user id(student): " + data.objectId);
        setCookie("loggedIn", true, 1);
        setCookie("userId", data.objectId, 1);
        self.id(data.objectId);
        self.setUser("student");
        self.nav.showProfile();
    };
    self.onRegistrateCompany = function (data) {
        console.log("user id(company): " + data.objectId);
        setCookie("loggedIn", true, 1);
        setCookie("userId", data.objectId, 1);
        self.id(data.objectId);
        self.setUser("company");
        self.nav.showProfile();
    };
    self.onLoggedInCompany = function (data) {
        if (data.error) {
            jQuery("#login-error-popup").modal("show");
            return;
        }
        console.log("user id: " + data.objectId);
        setCookie("loggedIn", "true", 1);
        setCookie("userId", data.objectId, 1);
        self.setUser("company");
        self.nav.showProfile();
    };
    self.logOut = function () {
        setCookie("loggedIn", "false", 1);
        setCookie("userId", -1, 1);
        self.setUser("");
        self.nav.showLogin();
    };

    self.profile = function () {
        if (self.getUser() === "company") {
            defaultAjax('GET', null, restServer + '/companies/' + self.getId(), function (data) {
                self.userInfo(data);
            });
        } else {
            defaultAjax('GET', null, restServer + '/students/' + self.getId(), function (data) {
                self.userInfo(data);
            });
        }
        ;
    };
    return self;
};
/* 
 * User END
 */

/* 
 * Ajax START
 */
var Ajax = function () {
    var restServer = 'http://studhero.org:8080/StudHero';
    var nav = new Navigation();
    var ajaxObj = {
        loginStudent: function (postData, callback) {
            defaultAjax('POST', postData, restServer + '/students/login', callback);
        },
        loginCompany: function (postData, callback) {
            defaultAjax('POST', postData, restServer + '/companies/login', callback);
        },
        getEvents: function (from, to, callback) {
            defaultAjax('GET', null, restServer + '/events/limit?from=' + from + '&to=' + to, callback);
        },
        subscribeToEvent: function (idStudent, idEvent, callback) {
            defaultAjax('GET', null, restServer+'/students/'+idStudent+'/subscribe/'+idEvent, callback);
        },
        unsubscribeFromEvent: function (idStudent, idEvent, callback) {
            defaultAjax('GET', null, restServer+'/students/'+idStudent+'/unsubscribe/'+idEvent, callback);
        },
        getEvent: function (postData, id, callback) {
            defaultAjax('GET', postData, restServer + '/events/' + id, callback);
        },
        createEvent: function (postData, callback) {
            callback = function (data) {
                setCookie("createdEvent", data.objectId, 1);
                nav.showEvent(data);
            };
            defaultAjax('POST', postData, restServer + '/events/create', callback);
        },
        searchEvent: function (postData, callback) {
            defaultAjax('POST', postData, restServer + '/events/search', callback);
        },
        createCompany: function (postData, callback) {
            defaultAjax('POST', postData, restServer + '/companies/registrate', callback);
        },
        createStudent: function (postData, callback) {
            defaultAjax('POST', postData, restServer + '/students/registrate', callback);
        },
        sendFeedback: function (postData, callback) {
            var jsonObj = {
                type: 'POST',
                data: postData,
                url: 'services/mail.php',
                dataType: 'json',
                success: function (data) {
                    if (callback) {
                        callback(data);
                    }
                },
                error: function (jqXHR, textStatus, ex) {
                    if (callback) {
                        callback();
                    }
                }
            };
            jQuery.ajax(jsonObj);
        }

    };
    return ajaxObj;
};
/* 
 * Ajax END
 */

function defaultAjax(type, requestData, url, callback) {
    var jsonObj = {
        type: type,
        headers: {
            'Content-Type': 'application/json'
        },
        url: url,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        beforeSend: function () {
            console.log(requestData);
        },
        success: function (data) {
            console.log(data);
            if (callback) {
                callback(data)
            }
        },
        error: function (jqXHR, textStatus, ex) {
            console.log("ajax error");
            console.log(textStatus + ", " + ex + ", " + jqXHR.responseText);
        },
        complete: function (data) {
        }
    };
    if (type.toLowerCase() === 'post' && requestData) {
        jsonObj.data = encode(requestData);
    }
    jQuery.ajax(jsonObj);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }
    return "";
}


// URL utils Start
function addParameterToURL(url, param) {
    url += (url.split('?')[1] ? '&' : '?') + param;
    return url;
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function getURLParameter(url, name) {
    return decodeURIComponent(
        (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(url) || [null, null])[1]
    );
}
function setURLParameter(url, name, value) {
    var search;
    if (url.indexOf('?') > 0) {
        search = location.search + '&' + name + '=' + encodeURIComponent(value);
    } else {
        search = '?' + name + '=' + encodeURIComponent(value);
    }
    //History.pushState({state:History.getStateId()+1},document.title,search);
    return search;
}


// URL utils end

function encode(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            obj[key] = encodeURIComponent(obj[key]);
        }
    }
    return obj;
}


ko.applyBindings(new AppViewModel());
