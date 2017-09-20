//pubValues.js

var pub = {
    censusId:null,
    direction:null,
    coordinates:[],
    coordinatesCounter:0,
    coordinateIds:[],
    coordinatesData:{},
    allNeighbors:[],
    actualNeighbors:null,
    stepCounter:0,
    geoData:[],
    data:[],
    censusTractId:null,
    tables:"B02001,B01002,B19013,B15003,B08301,B23025,B16002",
    actualNeighborGeos:null,
    centroid:null,
    colors:["#459d3e","#e3e039","#657348","#82e03e","#bbd1a1","#9eb531","#79df77","#b6a75a","#d2e27a","#6d8635"],
    colorDictionary:{}
}

var saveForLater = "C15010,B19055,B24080,B25004,B25006,B25034,B08134,B25035,B25041,B25065,B25069,B19053,B19059,B25061,C24030,B25081,B16004,"


//tables:"B01003,B01002,B25002,B02001,B25003,B07201,B15003,B08301,B08302,B08303,B25064,B15012,B16002,B19001,B27010,B19013,B19057,B23025"
var width = window.innerWidth
var height = window.innerWidth   
