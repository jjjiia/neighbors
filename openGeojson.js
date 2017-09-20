function mapSetup(){
    var randomIndex = Math.round(Math.random()*Object.keys(pub.allNeighbors).length)-1
    var tempid = Object.keys(pub.allNeighbors)[randomIndex]
    
    var hereFile = "tract_geojson/"+tempid+".json"
    
    var width = window.innerWidth/2
    var height = window.innerHeight
    var svg = d3.select("#map").append("svg").attr('width',width).attr("height",height).append("g")

    var neighbors = (tempid+","+pub.allNeighbors[tempid]).split(",")
    pub.actualNeighbors = neighbors
    var q = d3.queue();    
    setColorKey()
    
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
    pub.centroid = centroid
    for (var i = 1; i < arguments.length; i++) {
        pub.allNeighborGeos["features"].push(arguments[i])
      }
      setProjection()
      drawBaseMap()
      for (var j = 1; j < arguments.length; j++) {
          drawTract({type:"FeatureCollection",features:[arguments[j]]})
        }
     // drawTracts()
      
}
function setProjection(){    
    var projection = d3.geoMercator().fitSize([window.innerWidth/2,window.innerHeight], pub.allNeighborGeos)
    pub.projection = projection
}
function drawTracts(){
var path = d3.geoPath()
    .projection(pub.projection);
    var svg = d3.select("#map svg")
    svg.append("path")
        .datum(pub.allNeighborGeos)
        .attr("d", path)
        .attr("fill","none")
        .attr("stroke","red")
        .attr("stroke-width","3")
}
function drawTract(geoData){
    var id = geoData.features[0].properties.GEOID
   //var data = {type:"FeatureCollection",features:[geoData]}
    var path = d3.geoPath()
        .projection(pub.projection);
    var svg = d3.select("#map svg")
    svg.append("path")
        .datum(geoData)
        .attr("d", path)
        .attr("fill",pub.colorDictionary[id])
        .attr("opacity",.2)
        .attr("class","_"+geoData.features[0].properties.GEOID+" areas")
        .attr("stroke-width","3")
        .on("mouseover",function(d){
            var id = d3.select(this).attr("class").replace(" areas","")
            console.log(id)
            d3.selectAll("."+id).attr("opacity",1)
        })
        .on("mouseout",function(d){
            d3.selectAll("rect").attr("opacity",.5)
            d3.selectAll(".areas").attr("opacity",.2)
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