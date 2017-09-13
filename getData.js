var tables = []
function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(usePosition);
  } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function formatLocation(position){
    var lng = position.coords.longitude
    var lat = position.coords.latitude        
    var alt = position.coords.altitude 
    pub.coordinates = [lat,lng]
    d3.select("#coordinates").html("<strong>Lat:</strong> "+Math.round(lat*1000000)/1000000+" <strong>Lng:</strong> "+Math.round(lng*10000)/10000)//+" <strong>Alt:</strong> "+Math.round(alt*1000000)/1000000)//+"<br/>"+speed+"<br/>"+alt+"<br/>"+heading)
    return [lat,lng]
}

function usePosition(position) {
    var latLng = formatLocation(position)
    var lat = latLng[0]
    var lng = latLng[1]
    var fccUrl = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude="+lat+"&longitude="+lng       
    getCensusId(fccUrl,"jsonp","formatCensusIds")
}

function getCensusId(url,type,callBack){
    $.ajax({
    url: url,
    dataType: type,
    jsonpCallback: callBack
    });
}

var colors = ["#de4645","#4dbb31","#ea4a73","#45b865","#e64821","#87b733","#b3324f","#5b821d","#a5361a","#b1a930","#d77231","#d1902e"]


var returnedData = null
var returnedGeoData = null

function getNeighbors(steps,geoid){
    var neighbors = pub.allNeighbors[geoid].split(",")
    pub.neighborSteps["_0"]=[geoid]
    pub.neighborSteps["_1"]=neighbors
    pub.neighborSteps["_2"]=[]
    pub.neighborSteps["_3"]=[]
    for(var i in neighbors){
        var geoid1 = neighbors[i]
        var neighbors2 = pub.allNeighbors[geoid1].split(",")
        for(var n2 in neighbors2){            
            var geoid2 = neighbors2[n2]
            if(pub.neighborSteps["_1"].indexOf(geoid2)==-1 && pub.neighborSteps["_2"].indexOf(geoid2)==-1 && geoid2!=geoid){
                pub.neighborSteps["_2"].push(geoid2)
                var neighbors3 = pub.allNeighbors[geoid2].split(",")
                for(var n3 in neighbors3){
                    var geoid3 = neighbors3[n3]
                     if(pub.neighborSteps["_1"].indexOf(geoid3)==-1 && pub.neighborSteps["_2"].indexOf(geoid3)==-1 && pub.neighborSteps["_3"].indexOf(geoid3)==-1 &&geoid3!=geoid){
                         pub.neighborSteps["_3"].push(geoid3)
                     }
                }
            }
        }
    }
    return pub.neighborSteps["_0"].concat(pub.neighborSteps["_1"])//.concat(pub.neighborSteps["_2"])//.concat(pub.neighborSteps["_3"])
}

function formatCensusIds(json){
    var blockGroupid = "15000US"+json.Block.FIPS.slice(0,12)
    pub.censusTractId = "14000US"+json.Block.FIPS.slice(0,11)
    d3.select("#censusLabelFCC").html("<strong>Block Group:</strong> "+blockGroupid)
    pub.censusId = blockGroupid

    var listOfNeighbors = getNeighbors(4,json.Block.FIPS.slice(0,12))
    var formattedList = []
   // for(var n in listOfNeighbors){
   //     var formattedId = "15000US"+listOfNeighbors[n]
   //     formattedList.push(formattedId)
   // }
     var county = "04000US"+json.County.FIPS
  //  console.log(listOfNeighbors)
  //  var neighbors = pub.allNeighbors[json.Block.FIPS.slice(0,12)].split(",")
   // getDataNeighbors(blockGroupid,listOfNeighbors)
    getTracksInCounty(county,blockGroupid)
}
function getValue(code,geoId){
    var table = code.substr(0, code.length -3)    
    var codeValue = pub["data"][geoId].data[geoId][table].estimate[code]
    return codeValue
}

function getTracksInCounty(county,blockGroupid){
  //  var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+"B02001"+"&geo_ids=140|"+county
    var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+pub.tables+"&geo_ids=140|"+county
    $.getJSON(censusReporter, function(tractData) {
        //console.log(tractData)
         pub["data"]=tractData 
         var blockGeoRequest = "https://api.censusreporter.org/1.0/geo/tiger2015/"+pub.censusId+"?geom=true"
         $.getJSON( blockGeoRequest, function(blockGeoData) {
             
            pub["geoData"][blockGroupid]=blockGeoData
            drawTracts()
         })
    })
}
function getDataNeighbors(geoid,neighbors){
    var geoid = "15000US"+neighbors[pub.neighborCounter]
   var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+pub.tables+"&geo_ids="+geoid
        $.getJSON(censusReporter, function(blockGroupData) {
           // pub.data[geoid]=blockGroupData
          //  console.log(blockGroupData)
            var populationCode = "B02001001"
            var table = populationCode.substr(0, populationCode.length -3) 
            var totalPopulation = blockGroupData.data[geoid][table].estimate[populationCode]
            if(totalPopulation >0){
               // console.log("population: "+totalPopulation)
                pub.data[geoid]=blockGroupData
                var blockGeoRequest = "https://api.censusreporter.org/1.0/geo/tiger2015/"+geoid+"?geom=true"
                $.getJSON( blockGeoRequest, function(blockGeoData) {
                    pub["geoData"][geoid]=blockGeoData
                    if(pub.neighborCounter==neighbors.length-1){
                        draw()
                        return
                    }
                    pub.neighborCounter+=1
                    getDataNeighbors(pub.censusId,neighbors)            
                }); 
            }else{
                    pub.neighborCounter+=1
                    getDataNeighbors(pub.censusId,neighbors) 
            }
    });
}