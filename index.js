"use strict";
/* global __dirname */

var express = require("express");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var path = require('path');

var port = (process.env.PORT || 10000);
var BASE_API_PATH = "/api/v1";

var publicFolder = path.join(__dirname, 'public');

var dbRoberto;



var MongoClient = require('mongodb').MongoClient;
var mdbURL= "mongodb://test:test@ds133450.mlab.com:33450/sandbox";



MongoClient.connect(mdbURL,{native_parser:true}, function(err, database){
    if(err){
        console.log("Cant connect to database" +err);
        process.exit(1);
    }
    
    
    dbRoberto = database.collection("provinces");
    
    
    app.listen(port, () => {
        console.log("Magic is happening on port " + port);
    });
    
});




var app = express();



app.use(bodyParser.json()); //use default json enconding/decoding
app.use(helmet()); //improve security
app.use("/",express.static(publicFolder));

app.use("/api/v1/tests", express.static(path.join(__dirname , "public/tests.html")));

// @see: https://curlbuilder.com/
// @see: https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
// @see: https://i.stack.imgur.com/whhD1.png
// @see: https://blog.agetic.gob.bo/2016/07/elegir-un-codigo-de-estado-http-deja-de-hacerlo-dificil/

//*********************************************************************************************************************************************************************************************************************
//*************************************************************************************API ROBERTO*********************************************************************************************************************
//*********************************************************************************************************************************************************************************************************************



///CREACIÓN DE LA APIKEY///

var apiKeyRoberto = "hf5HF86KvZ";

//COMPROBANDo EL APIKEY
function apiKeyCheck(request,response){
    var ak = request.query.apikey;
    var check = true;
    
    if(!ak){
        console.log("WARNING: Necesita introducir una apikey para acceder a los datos. Aquí está su apikey: "+ apiKeyRoberto);
        check = false;
        response.sendStatus(401);
    }else{
        if(ak != apiKeyRoberto){
            console.log("WARNING: La APIKEY introducida no es válida, aquí está la apikey válida "+ apiKeyRoberto);
            check=false;
            response.sendStatus(403);
        }
    }
    return check;
}






//Load Initial Data
app.get(BASE_API_PATH + "/provinces/loadInitialData",function(request, response) {
        if(apiKeyCheck(request,response)==true){

    dbRoberto.find({}).toArray(function(err,provinces){
        
         if (err) {
        console.error('WARNING: Error while getting initial data from DB');
        return 0;
    }
    
      if (provinces.length === 0) {
        console.log('INFO: Empty DB, loading initial data');

       var province = [{
                "province": "Seville",
                "year": "2015",
                "varied": "1,23%",
                "averageWage": "15.921"
            },
            {
                "province": "Madrid",
                "year": "2014",
                "varied": "0,66%",
                "averageWage": "24.734"
                
            },
            {
                "province": "Barcelona",
                "year": "2013",
                "varied": "1,29%",
                "averageWage": "22.153"
            },
            {
                "province": "Valencia",
                "year": "2012",
                "varied": "1,35%",
                "averageWage": "18.052"
            }];
        dbRoberto.insert(province);
        response.sendStatus(201) //created
    } else {
        console.log('INFO: DB has ' + provinces.length + ' provinces ');
    }
});
}
});


// GET a collection 
 app.get(BASE_API_PATH + "/provinces", function(request, response) {
  var url = request.query;
  var province = url.province;
  var year = url.year;
  var varied = url.varied;
  var averageWage = url.averageWage;
  var offSet = 0;
  var limit = 6;
      if(apiKeyCheck(request,response)==true){

 
    dbRoberto.find({}).skip(offSet).limit(limit).toArray(function(err, asd) {
     if (err) {
      console.error('WARNING: Error getting data from DB');
      response.sendStatus(500); // internal server error
     }
     else {
      var filted = asd.filter((stat) => {
       if ((province == undefined || stat.province == province) && (year == undefined || stat.year == year) && (varied == undefined || stat.varied == varied) && (averageWage == undefined || stat.averageWage == averageWage)) {
        return stat;
       }
      });
      if (filted.length > 0) {
       console.log("INFO: Sending stat: " + JSON.stringify(filted, 2, null));
       response.send(filted);
      }
      else {
       console.log("WARNING: There are not any province with this properties");
       response.sendStatus(404); // not found
      }
     }
    });
      }
  });


/*
// GET a collection
app.get(BASE_API_PATH + "/provinces", function (request, response) {
        if(apiKeyCheck(request,response)==true){

    console.log("INFO: New GET request to /provinces");
    dbRoberto.find({}).toArray( function (err, provinces) {
        if (err) {
            console.error('WARNING: Error getting data from DB');
            response.sendStatus(500); // internal server error
        } else {
            console.log("INFO: Sending provinces: " + JSON.stringify(provinces, 2, null));
            response.send(provinces);
        }
    });
        }
});

*/
// GET a collection de paises en un mismo año 

app.get(BASE_API_PATH + "/provinces/:year", function (request, response) {
        if(apiKeyCheck(request,response)==true){

    var year = request.params.year;
    var province = request.params.year;
    if(isNaN(request.params.year.charAt(0))){
            if (!province) {
        console.log("WARNING: New GET request to /provinces/:province without name, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New GET request to /provices/" + province);
        dbRoberto.find({province:province}).toArray(function (err, results) {
            if (err) {
                console.error('WARNING: Error getting data from DB');
                response.sendStatus(500); // internal server error
            } else if (results.length > 0) { 
                    var result = results; //since we expect to have exactly ONE contact with this name
                    console.log("INFO: Sending result: " + JSON.stringify(result, 2, null));
                    response.send(result);
                } else {
                    console.log("WARNING: There are not any result with province " + province);
                    response.sendStatus(404); // not found
                }
        });
}
    }else{
    if (!year) {
        console.log("WARNING: New GET request to /provinces/:year without year, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New GET request to /provinces/" + year);
        dbRoberto.find({year:year}).toArray(function (err, results) {
            if (err) {
                console.error('WARNING: Error getting data from DB');
                response.sendStatus(500); // internal server error
            } else if (results.length > 0) { 
                    var result = results; //since we expect to have exactly ONE contact with this name
                    console.log("INFO: Sending result: " + JSON.stringify(result, 2, null));
                    response.send(result);
                } else {
                    console.log("WARNING: There are not any result with year " + year);
                    response.sendStatus(404); // not found
                
                }
        });
}}
}});


//GET a recurso concreto con 2 parametros

app.get(BASE_API_PATH + "/provinces/:province/:year", function (request, response) {
    var province = request.params.province;
    var year = request.params.year;
        if(apiKeyCheck(request,response)==true){

    if (!province || !year) {
        console.log("WARNING: New GET request to /provinces/:province without name or without year, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New GET request to /provinces/" + province + "/" + year);
        dbRoberto.find({province:province, $and:[{year:year}]}).toArray(function (err, results) {
            if (err) {
                console.error('WARNING: Error getting data from DB');
                response.sendStatus(500); // internal server error
            } else if (results.length > 0) { 
                    var result = results[0]; //since we expect to have exactly ONE contact with this name
                    console.log("INFO: Sending result: " + JSON.stringify(result, 2, null));
                    response.send(result);
                } else {
                    console.log("WARNING: There are not any province with name " + province +  "and year " + year);
                    response.sendStatus(404); // not found
                
                }
        });
}}
});


//POST over a collection
app.post(BASE_API_PATH + "/provinces", function (request, response) {
    var newstat = request.body;
        if(apiKeyCheck(request,response)==true){

    if (!newstat) {
        console.log("WARNING: New POST request to /provinces/ without stat, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New POST request to /provinces with body: " + JSON.stringify(newstat, 2, null));
        if (!newstat.province || !newstat.year ||  !newstat.varied || !newstat.averageWage) {
            console.log("WARNING: The stat " + JSON.stringify(newstat, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
            dbRoberto.find({}).toArray( function (err, provinces) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    var provincesBeforeInsertion = provinces.filter((stats) => {
                        return (stats.province.localeCompare(newstat.province, "en", {'sensitivity': 'base'}) === 0);
                    });
                    if (provincesBeforeInsertion.length > 0) {
                        console.log("WARNING: The stat " + JSON.stringify(newstat, 2, null) + " already extis, sending 409...");
                        response.sendStatus(409); // conflict
                    } else {
                        console.log("INFO: Adding stat " + JSON.stringify(newstat, 2, null));
                        dbRoberto.insert(newstat);
                        response.sendStatus(201); // created
                    }
                }
            });
        }
    }}
});

//a

//POST over a single resource NO PERMITIDO
app.post(BASE_API_PATH + "/provinces/:province", function (request, response) {
    var province = request.params.province;
        if(apiKeyCheck(request,response)==true){

    console.log("WARNING: New POST request to /provinces/" + province + ", sending 405...");
    response.sendStatus(405); // method not allowed
        }
});


//PUT over a collection NO PERMITIDO
app.put(BASE_API_PATH + "/provinces", function (request, response) {
        if(apiKeyCheck(request,response)==true){

    console.log("WARNING: New PUT request to /provinces, sending 405...");
    response.sendStatus(405); // method not allowed
        }
});


//PUT over a single resource
app.put(BASE_API_PATH + "/provinces/:province/:year", function (request, response) {
    var updatedStat = request.body;
    var province = request.params.province;
    var year = request.params.year;
        if(apiKeyCheck(request,response)==true){


    if (!updatedStat) {
        console.log("WARNING: New PUT request to /provinces/ without stat, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New PUT request to /provinces/" + province + " with data " + JSON.stringify(updatedStat, 2, null));
        if (!updatedStat.province || !updatedStat.year ||  !updatedStat.varied || !updatedStat.averageWage) {
            console.log("WARNING: The stat " + JSON.stringify(updatedStat, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
            dbRoberto.find({province:province, $and:[{year:year}]}).toArray( function (err, provinces) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else if (provinces.length > 0) {
                        dbRoberto.update({province: province, year: year}, updatedStat);
                        console.log("INFO: Modifying result with proviç " + province + " with data " + JSON.stringify(updatedStat, 2, null));
                        response.send(updatedStat); // return the updated contact
                    } else {
                        console.log("WARNING: There are not any result with province " + province);
                        response.sendStatus(404); // not found
                    }
                }
            )}
        }}
    });
           
           
//DELETE over a collection
app.delete(BASE_API_PATH + "/provinces", function (request, response) {
        if(apiKeyCheck(request,response)==true){

    console.log("INFO: New DELETE request to /provinces");
    dbRoberto.remove({}, {multi: true}, function (err, numRemoved) {
        if (err) {
            console.error('WARNING: Error removing data from DB');
            response.sendStatus(500); // internal server error
        } else {
            if (numRemoved > 0) {
                console.log("WARNING: There are no provinces to delete");
                response.sendStatus(404); // no content
            } else {
                console.log("INFO: All the provinces (" + numRemoved + ") have been succesfully deleted, sending 204...");
                response.sendStatus(204); // not found
            }
        }
    });
        }
});



//DELETE over a single resource
app.delete(BASE_API_PATH + "/provinces/:province/:year", function (request, response) {
    var province = request.params.province;
    var year = request.params.year;
        if(apiKeyCheck(request,response)==true){

    if (!province || !year) {
        console.log("WARNING: New DELETE request to /provinces/:province/:year without province and year, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New DELETE request to /provinces/" + province + " and year " + year);
        dbRoberto.remove({province:province, $and:[{year:year}]}, {}, function (err, result) {
            var numRemoved= JSON.parse(result);
            if (err) {
                console.error('WARNING: Error removing data from DB');
                response.sendStatus(500); // internal server error
            } else {
                console.log("INFO: Results removed: " + numRemoved.n);
                if (numRemoved.n === 1) {
                    console.log("INFO: The result with province " + province + "and year " + year + " has been succesfully deleted, sending 204...");
                    response.sendStatus(204); // not found
                } else {
                    console.log("WARNING: There are no provinces to delete");
                    response.sendStatus(404); // no content
                }
            }
        });
    }}
});