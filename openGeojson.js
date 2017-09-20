function mapSetup(){
    var randomIndex = Math.round(Math.random()*Object.keys(pub.allNeighbors).length)-1
    var tempid = Object.keys(pub.allNeighbors)[randomIndex]
    
    var hereFile = "tract_geojson/"+tempid+".json"
    
    var width = window.innerWidth/2
    var height = window.innerHeight
    var svg = d3.select("#map").append("svg").attr('width',width).attr("height",height).append("g")

    
    var colors = ["#459d3e","#e3e039","#657348","#82e03e","#bbd1a1","#9eb531","#79df77","#b6a75a","#d2e27a","#6d8635"]
    var colorDictionary = {}
    
    var neighbors = (tempid+","+pub.allNeighbors[tempid]).split(",")
    pub.actualNeighbors = neighbors
    var q = d3.queue();    
    
    for(var i in neighbors){
        console.log(neighbors[i])
        q=q.defer(d3.json, "tract_geojson/"+neighbors[i]+".json")
    }
    q.await(consolidateGeos);
    
   var formattedNeighbors = "14000US"+neighbors.join(",14000US")
    getTracksInCounty(formattedNeighbors)
}

function consolidateGeos(error){
    if(error) { console.log(error); }
    pub.allNeighborGeos = {type:"FeatureCollection",features:[]}
    var centroid = d3.geoCentroid(arguments[1])
    console.log(centroid)    
    pub.centroid = centroid
    for (i = 1; i < arguments.length; i++) {
        pub.allNeighborGeos["features"].push(arguments[i])
      }
      setProjection()
      drawBaseMap()
      drawTracts()
}
function setProjection(){
        
    var projection = d3.geoMercator().fitSize([window.innerWidth/2,window.innerHeight], pub.allNeighborGeos)
    pub.projection = projection
}
function drawTracts(){
var path = d3.geoPath()
    .projection(pub.projection);
var svg = d3.select("#map svg g")
svg.append("path")
    .datum(pub.allNeighborGeos)
    .attr("d", path)
    .attr("fill","none")
    .attr("stroke","red")
    .attr("stroke-width","3")
}
function drawTract(geoDataFile,color,opacity){
    //console.log(geoDataFile)
	d3.json(geoDataFile, function(geoData){
        console.log(geoData)
    var geoDataFormatted = {type:"FeatureCollection",features:[geoData]}
    var projection = pub.projection
    
    var geoid = geoData.properties.GEOID
    var path = d3.geoPath()
        .projection(projection);
    var svg = d3.select("#map svg")
        svg.append("path")
            .datum(geoDataFormatted)
            .attr("class",geoid)
            .attr("d", path)
            .attr("fill",color)
            .attr("opacity",opacity)
       
   // var lineFunction = d3.line()
   // .x(function(d){
   //     return projection([d[0],d[1]])[0]
   // })
   // .y(function(d){
   //     return projection([d[0],d[1]])[1]
   // })
   // .interpolate("linear");
   // var svg = d3.select("#map svg")
   //	svg.append("path")
   //     .data(geoData.geometry.coordinates[0])
   //		.attr("class","_"+geoid)
   //		.attr("d",lineFunction)
   //     .attr("fill",color) 
   //     .attr("stroke","#888")
   //     .attr("opacity",opacity)
   //     .attr("stroke-width",3)
   //     .on("click",function(){
   //         var neighbors = geoData.properties.NEIGHBORS.split(",")
   //         for(var n in neighbors){
   //             var neighbor = neighbors[n]
   //           //  drawBuildings("geodata_processing/bg_json/"+neighbor+".json")
   //         }
   //     })
    })
}
function drawBaseMap(){

    var tiler = d3.tile()
        .size([window.innerWidth, window.innerHeight]);
    var projection = pub.projection

    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#map svg g")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("g")
        .data(tiler
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0])))
      .enter().append("g")
        .each(function(d) {
          var g = d3.select(this);
          d3.json("https://vector.mapzen.com/osm/roads/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key=vector-tiles-LM25tq4", function(error, json) {
            if (error) throw error;

            g.selectAll("path")
              .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
            .enter().append("path")
              .attr("class", function(d) { return d.properties.kind+" basemap"; })
              .attr("d", path);
          });
        });
}