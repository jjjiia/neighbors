function draw(){
    var center = [Math.round(pub.coordinates[1]*10000)/10000,Math.round(pub.coordinates[0]*10000)/10000]

    var width = window.innerWidth
    var height = window.innerWidth
    var svg = d3.select("#map").append("svg").attr("width",width).attr("height",height)
    drawBaseMap(width,height,center)
    drawMapLayer(pub["geoData"])
    drawChart("B02001002","percent")
    drawChart("B02001003","percent")
    drawChart("B02001004","percent")
    drawChart("B02001005","percent")
    
    drawChart("B01002001","value")
    drawChart("B19013001","value")
    drawChart("B15003022","percent")
    drawChart("B08301010","percent")
    drawChart("B23025005","percent")
    
    drawChart("B16002002","percent")
    drawChart("B16002003","percent")
    drawChart("B16002006","percent")
    drawChart("B16002009","percent")
}

function drawBaseMap(width,height,center){

    var tiler = d3.geo.tile()
        .size([width, height]);

    var projection = d3.geo.mercator()
        .center(center)
        .scale((1 << 21) / 2 / Math.PI)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#map svg")
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
function drawChart(columnCode,type){
    var formatted = returnColumnData(columnCode,type)
    var width = window.innerWidth
    var height = 160
    var margin = 40
    var svg = d3.select("#chart").append("svg").attr("width",width).attr("height",height)
    svg.append("text").text(getTitle(columnCode)).attr("x",margin).attr("y",30).attr("font-size",12)
    
    var xScale = d3.scale.linear().domain([0,100]).range([margin*4, width-margin*4])
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10)
        .tickFormat(function(d) { 
            if(type == "percent"){
                return d+"%";}
                else{
                    return d
                }
            })
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,"+(height-margin)+")")
        .call(xAxis)
    
    var geoIds = Object.keys(formatted)
    svg.selectAll("rect")
    .data(geoIds)
    .enter()
    .append("rect")
    .attr("x",function(d){
        return xScale(formatted[d].value)
    })
    .attr("y", function(d){
        var geoid = d.split("US")[1]
        if(pub.neighborSteps["_0"].indexOf(geoid)>-1){
            return height/4
        }else{
            return height/2
        }
    })
    .attr("height",function(d){
        var geoid = d.split("US")[1]
        if(pub.neighborSteps["_0"].indexOf(geoid)>-1){
            return height/2
        }else{
            return height/4
        }
    })
    .attr("width",2)
    .attr("opacity",function(d){
        var geoid = d.split("US")[1]
        if(pub.neighborSteps["_0"].indexOf(geoid)>-1){
            return 1
        }else{
            return .5
        }
    })
    .attr("fill",function(d){
        var geoid = d.split("US")[1]
        if(pub.neighborSteps["_0"].indexOf(geoid)>-1){
            var className = "n0"
        }else if(pub.neighborSteps["_1"].indexOf(geoid)>-1){
            var className = "n1"
        }else if(pub.neighborSteps["_2"].indexOf(geoid)>-1){
            var className = "n2"
        }else if(pub.neighborSteps["_3"].indexOf(geoid)>-1){
            var className = "n3"
        }
        //var colors = {n0:"#cb5b4c",n1:"#4c9c47",n2:"#56ba5c",n3:"#70cf50"}
        //var colors = {n0:"#cb5b4c",n1:"#000",n2:"#888",n3:"#aaa"}
        var colors = {n0:"#ce1d2f",n1:"	#f45c38",n2:"	#f5ce41",n3:"green"}
        
        var color = colors[className]
        return color
    })
   // .attr("transform","translate("+(margin)+",0)")
    
}
function getPercent(code,geoId){
    var table = code.substr(0, code.length -3)
    var codeValue = pub["data"][geoId].data[geoId][table].estimate[code]
    var totalCode = table+"001"
    var totalValue = pub["data"][geoId].data[geoId][table].estimate[totalCode]
    var percent = codeValue/totalValue*100
    return percent
}
function formatPercents(percent){
    var color = colors[Math.round(Math.random()*colors.length)]
    return "<span style=\"color:"+color+"\"><strong>"+Math.round(percent)+"%</strong></span>"
}
function formatMoney(money){
    var color = colors[Math.round(Math.random()*colors.length)]
    money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "<span style=\"color:"+color+"; font-size = 24px\"><strong>$"+money+"</strong></span>"
}
function formatValues(value){
    var color = colors[Math.round(Math.random()*colors.length)]
    return "<span style=\"color:"+color+"\"><strong>"+value+"</strong></span>"
}
function getPercentSum(codes,geoGroup){
    var sum = 0
    for(var c in codes){
        var code = codes[c]
        sum+=getPercent(code,geoGroup)
    }
    return sum
}
function getTitle(code){
    var table = code.substr(0, code.length -3)
    var tableTitle = getTableName(table)
    var geoKey = Object.keys(pub["data"])[0]
    var codeTitle = pub["data"][geoKey].tables[table].columns[code].name    
    return tableTitle+": "+codeTitle
}

function getValue(code,geoId){
    var table = code.substr(0, code.length -3)    
    var codeValue = pub["data"][geoId].data[geoId][table].estimate[code]
    return codeValue
}
function getTableName(tableCode){
    var geoKey = Object.keys(pub["data"])[0]
   return pub["data"][geoKey].tables[tableCode].title
}
function returnColumnData(columnCode,type){
    var geoIds = Object.keys(pub["data"])
    var columnData = {}
    var max = 0
    var min = 9999999999
    for(var g in geoIds){
        var geoId = geoIds[g]
        var title = getTitle(columnCode)
        if(type == "percent"){
            var value = getPercent(columnCode,geoId)
        }else{
            var value = getValue(columnCode,geoId)
        }
        if(value == 0){
            percent = 0
        }
        if(value>max){max = value}
        if(value<min){min = value}
        columnData[geoId]={title:title,value:value}
    }
    //columnData["min"]=min
   // columnData["max"]=max
    return columnData
}

function drawMapLayer(data){
    var svg = d3.select("#map svg")

    var width = window.innerWidth
    var height = window.innerWidth    
    var center = [pub.coordinates[1],pub.coordinates[0]]
    var lat = center[1]
    var lng = center[0]
    
    var projection = d3.geo.mercator()
        .scale((1 << 21) / 2 / Math.PI)
    .center(center)		    
        .translate([width/2,height/2])

        //d3 geo path uses projections, it is similar to regular paths in line graphs
    var path = d3.geo.path().projection(projection);
    var lineFunction = d3.svg.line()
        .x(function(d){
            return projection([d[0],d[1]])[0]
        })
        .y(function(d){
           // console.log(projection([d[0],d[1]])[1])
            return projection([d[0],d[1]])[1]})
            .interpolate("linear");
        //push data, add path
        //[topojson.object(geoData, geoData.geometry)]   
    
        for(var i in data){
            var geoid = data[i].properties["full_geoid"].split("US")[1]
            if(pub.neighborSteps["_0"].indexOf(geoid)>-1){
                var className = "n0"
            }else if(pub.neighborSteps["_1"].indexOf(geoid)>-1){
                var className = "n1"
            }else if(pub.neighborSteps["_2"].indexOf(geoid)>-1){
                var className = "n2"
            }else if(pub.neighborSteps["_3"].indexOf(geoid)>-1){
                var className = "n3"
            }
            var colors = {n0:"red",n1:"orange",n2:"yellow",n3:"green"}
            
            var color = colors[className]
        	svg.append("path")
                .attr("class",className)
                .attr("d",lineFunction(pub["geoData"][i].geometry.coordinates[0]))
                //.attr("stroke","#fff")
                //.attr("stroke-width",2)
                .attr("fill",function(d){
                    return color
                    return "none"
                }) 
                .attr("opacity",.6)    
        }
}
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}