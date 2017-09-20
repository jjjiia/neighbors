function setupCharts(censusData){
//    console.log(censusData)
    var formattedData = formatBarData(formatMatrixData())
    for(var i in formattedData){
        drawBarGraph(formattedData[i],i)
    }
}
function setColorKey(){
    var colorDictionary = {}
    var areas = pub.actualNeighbors
    var colors = pub.colors
    for(var i in areas){
        colorDictionary[areas[i]]=colors[i]
    }
    colorDictionary[areas[0]]="red"
    pub.colorDictionary= colorDictionary
}

function drawBarGraph(data,i){
    
    var gridSize = 25
    var width = d3.max([gridSize*(Object.keys(data.values).length+3),250])
    
    var height = 150
    var chart = d3.select("#chart")
        .append("svg").attr("width",width).attr("height",height)
    
    var yScale = d3.scaleLinear().domain([data.min,data.max]).range([10,height/2])
    var sorted = data["values"].sort(function(a, b) {
        return parseFloat(a.value) - parseFloat(b.value);
    });
//    console.log(sorted)
    chart.append("text").text(getTitle(i)).attr("x",20).attr("y",20).attr("font-size",12)
    chart.selectAll("rect")
    .data(sorted)
    .enter()
    .append("rect")
    .attr("x",function(d,i){return i*gridSize+gridSize})
    .attr("y",function(d){//console.log(d); 
        return height-yScale(d.value)-height/4})
    .attr("width",gridSize-4)
    .attr("height",function(d){return yScale(d.value)})
    .attr("fill",function(d,i){return pub.colorDictionary[d.area.split("US")[1]]})
    .attr("class",function(d){return "_"+d.area.split("US")[1]})
        .attr("opacity",.5)
    .on("mouseover",function(d){
        var id = d3.select(this).attr("class")
        console.log(id)
        //d3.selectAll("rect").attr("opacity",.2)
        d3.selectAll("."+id).attr("opacity",1)
    })
    .on("mouseout",function(d){
        d3.selectAll("rect").attr("opacity",.5)
        d3.selectAll(".areas").attr("opacity",.2)
    })
        
    chart.selectAll(".barLabel")
        .data(sorted)
        .enter()
        .append("text")
        .attr("class",function(d){return "barLabel "+d.area})
        .text(function(d){return Math.round(d.value*100)/100})
        .attr("x",function(d,i){return i*gridSize+gridSize+10})
        .attr("y",height-height/4+4)
        .attr("fill",function(d,i){return pub.colorDictionary[d.area.split("US")[1]]})
        
}
function drawDotMatrix(differenceData){
    var gridSize = 40
    var locationKeys = Object.keys(differenceData)
    var columnKeys = Object.keys(differenceData[locationKeys[0]])
    var width = (locationKeys.length+8)*gridSize
    var height = (columnKeys.length+2)*gridSize
    var chart = d3.select("#chart").append("svg").attr("width",width).attr("height",height)
  //  console.log(locationKeys)
 //   console.log(columnKeys)
    var rScale = d3.scale.linear().domain([1,90]).range([3,gridSize*.8])
    //chart.append("circle").attr("cx",30).attr("cy",20).attr("r",30).attr("fill","red")
    
    chart.selectAll("text")
        .data(columnKeys)
        .enter()
        .append("text")
        .text(function(d){return getTitle(d)})
        .attr("x",0)
        .attr("y",function(d,i){return i*gridSize+5})
        .attr("font-size",11)
        .attr("text-anchor","end")
        .attr("transform", "translate("+gridSize*5.5+","+gridSize+")")
        
    for(var j in locationKeys){
        var geoid = locationKeys[j]
        chart.selectAll("._text"+geoid)
            .data(columnKeys)
            .enter()
            .append("text")
            .attr("class","_text"+geoid)
            .attr("x",function(d,i){
                return j*gridSize
            })
            .attr("y",function(d,i){
                return i*gridSize+5
            })
            .text(function(d){
                if(Math.round(differenceData[geoid][d])==0){
                    return ""
                }else{
                    return Math.round(differenceData[geoid][d])
                }
            })
            .attr("transform", "translate("+gridSize*6+","+gridSize+")")
            .attr("font-size",10)
            .attr("text-anchor","middle")
            
        chart.selectAll("._"+geoid)
            .data(columnKeys)
            .enter()
            .append("circle")
            .attr("class","_"+geoid)
            .attr("fill","red")
            .attr("cx",function(d,i){
                return j*gridSize
            })
            .attr("cy",function(d,i){
                return i*gridSize
            })
            .attr("r",function(d){
                return rScale(differenceData[geoid][d])
            })
            .attr("transform", "translate("+gridSize*6+","+gridSize+")")
            .on("mouseover",function(){
                d3.select(this).attr("opacity",.1)
            })
            .on("mouseout",function(){
                d3.select(this).attr("opacity",1)
            })
    }
}
function formatMatrixData(){
    var doNotInclude = ["B01002000.5","B01002002","B01002003","B02001001","B02001006","B02001007","B02001008","B02001009","B02001010"]
    var percentCodes = ["B23025004","B16002003","B16002002","B16002006","B16002009","B15003022","B15003023","B15003025","B02001002","B02001003","B02001004","B02001005","B08301002","B08301010","B08301021","B08301018","B08301019"]
    var valueCodes = ["B19013001"]
   // var neighbors = pub.allNeighbors[pub.censusTractId.split("US")[1]]    
    var matrixDictionary = {}
    for(var d in pub["data"]["data"]){
        var area = d
        matrixDictionary[area]={}
        var areaData = pub["data"]["data"][d]
        for(var t in areaData){
            var tableData = areaData[t]["estimate"]
            var table = t
           // matrixDictionary[area][table]={}
            for(var c in tableData){
                var columnData = tableData[c]
                var column = c
                if(percentCodes.indexOf(column)>-1){
                    matrixDictionary[area][column]=getPercent(column,area)
                }else if(valueCodes.indexOf(column)>-1) {
                    matrixDictionary[area][column]=getValue(column,area)
                }                  
            }
        }
    }
    return matrixDictionary
}

function formatBarData(matrixData){
    var firstGeoKey = Object.keys(matrixData)[0]
    var allCodes = Object.keys(matrixData[firstGeoKey])
    var dictionary = {}
    for(var i in allCodes){
        var code = allCodes[i]
        dictionary[code]={}
        dictionary[code]["values"]=[]
        var min = 9999999999999
        var max = 0
        for(var a in matrixData){
            var area = a
            var value = matrixData[a][code]
            if(value>max){max = value}
            if(value<min){min = value}
            dictionary[code]["values"].push({area:area,value:value})
        }
        dictionary[code]["max"]=max
        dictionary[code]["min"]=min
    }
    return dictionary
}


function getDifferences(formattedData){
    var valueCodes = ["B01002001","B19013001"]
    var here = formattedData[pub.censusTractId]
    var differenceData = {}
    for(var i in formattedData){
        var locationData = formattedData[i]
        var geoid = i
        differenceData[geoid]={}
        for(var j in locationData){
            var code = j
            if(valueCodes.indexOf(code)>-1){
                var value = locationData[code]
                var hereValue = here[code]
                var difference = Math.abs(value-hereValue)
                var percentDifference = difference/hereValue
                differenceData[geoid][code]=percentDifference
            }else{
                var value = locationData[code]
                var hereValue = here[code]
                var difference = Math.abs(value-hereValue)
                differenceData[geoid][code]=difference
            }
        }
    }
  return differenceData
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
    if(codeValue==0){
        var percent = 0
    }else{
        var percent = codeValue/totalValue*100
    }
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
    var codeTitle = pub["data"].tables[table].columns[code].name.replace(":","").replace(" alone","").split("(")[0]    
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

