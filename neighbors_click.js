//$(function() {
//	queue()
//		.defer(d3.json,"010439642006.json")
//    .await(dataDidLoad);
//})
//
//function dataDidLoad(error,neighbors) {
//    console.log("test")
//    console.log(neighbors)
////make 1 svg for everything
//    var chart = d3.select("#map").append("div")
//    
var projection = d3.geo.mercator().scale(40000).center([-86.694091, 34.184612])
var mapSvg = d3.select("#map").append("svg").attr("width",800).attr("height",800)
//    //draw each layer
//    drawBuildings(neighbors)
//    //uses csv version
//    //this version of the data uses shortened, not exact lat and lngs
//
//}
drawBuildings("geodata_processing/bg_json/010439642006.json")
function drawBuildings(geoDataFile){
    
	d3.json(geoDataFile, function(geoData){
        
        var geoid = geoData.properties.GEOID
        var path = d3.geo.path().projection(projection);
        var lineFunction = d3.svg.line()
        .x(function(d){
            return projection([d[0],d[1]])[0]
        })
        .y(function(d){
            return projection([d[0],d[1]])[1]
        })
        .interpolate("linear");
        var svg = d3.select("#map svg")
    	svg.append("path")
    		.attr("class","_"+geoid)
    		.attr("d",lineFunction(geoData.geometry.coordinates[0]))
            .attr("fill","#aaa") 
            .attr("stroke","#888")
            .on("click",function(){
                var neighbors = geoData.properties.NEIGHBORS.split(",")
                for(var n in neighbors){
                    var neighbor = neighbors[n]
                    console.log(neighbor)
                    drawBuildings("geodata_processing/bg_json/"+neighbor+".json")
                }
            })
    })
}
function drawDots(data,svg){
	var projection = d3.geo.mercator().scale(4000000).center([-71.063,42.3562])
    
    svg.selectAll(".dots")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","dots")
        .attr("r",2)
        .attr("cx",function(d){
            var lat = parseFloat(d.latitude)
            var lng = parseFloat(d.longitude)
            //to get projected dot position, use this basic formula
            var projectedLng = projection([lng,lat])[0]
            return projectedLng
        })
        .attr("cy",function(d){
            var lat = parseFloat(d.latitude)
            var lng = parseFloat(d.longitude)
            var projectedLat = projection([lng,lat])[1]
            return projectedLat
        })
        .attr("fill",function(d){
            //color code the dots by gender
            var gender = d.gender
            if(gender == "F"){
                return "red"
            }else if(gender == "M"){
                return "blue"
            }else{
                return "black"
            }            
        })
	    .style("opacity",.3)
        //on mouseover prints dot data
        .on("mouseover",function(d){
            console.log(d)
        })
        
}