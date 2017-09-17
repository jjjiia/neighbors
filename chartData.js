function setMatrix(){
    var width = window.innerWidth
    var height = window.innerWidth
    var center = [Math.round(pub.coordinates[1]*10000)/10000,Math.round(pub.coordinates[0]*10000)/10000]
    
    var svg = d3.select("#map").append("svg").attr("width",width).attr("height",height)
    drawBaseMap(width,height,center)
    drawMapLayer(pub["geoData"])
    
    
//    var colorScale = d3.scale.linear().domain([0,100]).range(["yellow","red"])
//    var key = d3.select("#chart").append("svg").attr("width",100).attr("height",100)
//    key
//        .data([0,20,40,60,80,100])
//        .enter().append("rect")
//        .attr("x",10).attr("y",function(d,i){return i*12})
//        .attr("width",10).attr("height",10)
//        .attr("fill",function(d){
//            return "red"
//            return (colorScale(d*20))
//        })

    var doNotInclude = []

    var matrixData = formattMatrix(returnColumnData("B02001002","percent"))
    drawMatrix(matrixData,"B02001002")    
    var matrixData = formattMatrix(returnColumnData("B02001003","percent"))
    drawMatrix(matrixData,"B02001003")
    var matrixData = formattMatrix(returnColumnData("B02001004","percent"))
    drawMatrix(matrixData,"B02001004")
    
    drawMatrix(formattMatrix(returnColumnData("B02001005","percent")),"B02001005")
    drawMatrix(formattMatrix(returnColumnData("B15003022","percent")),"B15003022")
    drawMatrix(formattMatrix(returnColumnData("B08301010","percent")),"B08301010")
    drawMatrix(formattMatrix(returnColumnData("B16002002","percent")),"B16002002")
    drawMatrix(formattMatrix(returnColumnData("B16002003","percent")),"B16002003")
    drawMatrix(formattMatrix(returnColumnData("B23025005","percent")),"B23025005")
}
function formattMatrix(data){
    console.log("format matrix data")
    //console.log(data)
    var formatted = []
    for(var i in data){
        var geo1 = i
        var value1 = data[i].value
        for(var j in data){
            var geo2 = j
            var value2 = data[j].value
           // console.log([geo1,geo2])
            if(isNaN(value1)!= true && isNaN(value2)!=true){
                var difference = Math.abs(value1-value2)
                var entry = {geo1:i,geo2:j,difference:difference}
                formatted.push(entry)
            }
        }
    }
    //var sorted = formatted.sort(function(a,b){
    //    return a["difference"] - b["difference"];
    //});
    return formatted//.slice(0,90000)
}

function drawMatrix(data,code){
    console.log("draw")
    var squareSize =15
    var keys = []
    for(var j in data){
        if(keys.indexOf(data[j]["geo1"])==-1){
            keys.push(data[j]["geo1"])
        }
    }
    var svg = d3.select("#chart").append("svg").attr("width",340).attr("height",340)
    svg.append("text").text(getTitle(code)).attr("x",10).attr("y",18).attr("font-size",16)
    
    var colorScale = d3.scale.linear().domain([0,100]).range(["yellow","red"])
    //svg.data([1,2,3,4,5]).enter().append("rect").
    
    for(var i in data){
        var x = keys.indexOf(data[i]["geo1"])
        var y = keys.indexOf(data[i]["geo2"])
     //   console.log([x,y,colorScale(data[i]["difference"])])
        svg.append("text")
            .attr("x",x*squareSize+squareSize*.5)
            .attr("y",y*squareSize+squareSize*.5+20)
            .attr("text-anchor","middle")
            .text(Math.round(data[i]["difference"]))
            .attr("fill","#666")
            .attr("id1",data[i]["geo1"])
            .attr("id2",data[i]["geo2"])
            .attr("difference",Math.round(data[i]["difference"]*10)/10)
            .style("font-size",10)
//        var tip = d3.tip()
//        .attr('class', 'd3-tip')
//        .offset([-10, 0])
//           
//        svg.call(tip);
           
        svg.append("rect")
            .attr("class","_"+x+"_"+y)
            .attr("x",x*squareSize)
            .attr("y",y*squareSize+20)
            .attr("width",squareSize)
            .attr("height",squareSize)
            .attr("fill",colorScale(data[i]["difference"]))
            .attr("id1",data[i]["geo1"])
            .attr("id2",data[i]["geo2"])
            .attr("difference",Math.round(data[i]["difference"]))
            .on("mouseover",function(){
                var id1 = d3.select(this).attr("id1")
                var id2 = d3.select(this).attr("id2")
                var difference = d3.select(this).attr("difference")
                //d3.select(this).attr("opacity",.2)
                d3.selectAll("."+d3.select(this).attr("class")).attr("opacity",.2)
                //console.log(d3.select(this).attr("class"))
                //d3.select("#geoids").html("GEOID 1: "+id1+" GEOID 2: "+ id2)
                
                var sum = 0
                var boxes = d3.selectAll("."+d3.select(this).attr("class"))
                for(var b in boxes[0].slice(0,boxes[0].length)){
                    var difference = boxes[0][b].attributes[8].value
                    sum+=parseFloat(difference)
                }
                d3.select("#geoids").html("GEOID 1: "+id1+" GEOID 2: "+ id2+"<br/> <strong>DIFFERENCE SUM: "+sum+"</strong>")
                
                //tip.html(id1+" "+id2)
                //tip.show
            })
            .on("mouseout",function(){
               d3.selectAll("."+d3.select(this).attr("class")).attr("opacity",1)
                
                //d3.select(this).attr("opacity",1)
               // tip.hide
            })
    }
    
}

function getPercentTract(code,geoId){
    //console.log(pub.censusTractId)
    var table = code.substr(0, code.length -3)
   // console.log(pub["data"].data)
    var codeValue = pub["data"].data[pub.censusTractId][table].estimate[code]
    var totalCode = table+"001"
    var totalValue = pub["data"].data[pub.censusTractId][table].estimate[totalCode]
    var percent = codeValue/totalValue*100
    return percent
}
function getPercent(code,geoId){
    var table = code.substr(0, code.length -3)
    var codeValue = pub["data"].data[geoId][table].estimate[code]
    var totalCode = table+"001"
    var totalValue = pub["data"].data[geoId][table].estimate[totalCode]
    var percent = codeValue/totalValue*100
    return percent
}
function formatPercents(percent){
    var color = colors[Math.round(Math.random()*colors.length)]
    return "<span style=\"color:"+color+"\"><strong>"+Math.round(percent)+"%</strong></span>"
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
    var codeTitle = pub["data"].tables[table].columns[code].name    
   // return tableTitle+": "+codeTitle
     return codeTitle
}
function getValue(code,geoId){
    var table = code.substr(0, code.length -3)    
    var codeValue = pub["data"].data[geoId][table].estimate[code]
    return codeValue
}
function getTableName(tableCode){
   return pub["data"].tables[tableCode].title
}
function returnColumnData(columnCode,type){
    console.log("columndata")
    var geoIds = Object.keys(pub["data"]["data"])
    var columnData = {}
    var max = 0
    var min = 9999999999
    var counter = 0
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
         counter +=1
        if(counter>20){
           break
        }
    }
    //columnData["min"]=min
   // columnData["max"]=max
    return columnData
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
