//http://www.movable-type.co.uk/scripts/latlong.html
Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

Number.prototype.toDeg = function() {
   return this * 180 / Math.PI;
}

function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(returnPositions);
  } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function getCensusId(url,type,callBack){
    $.ajax({
    url: url,
    async:true,
    dataType: type,
    jsonpCallback: callBack
    });
}
function makeChart(){
    console.log(pub.coordinates)
    console.log(pub.coordinatesData)
    var formatted = formatDataForCharts(pub.coordinatesData,"B01002")
    console.log(formatted)
    var height = 300
    var width = 300
    var barHeight = 10
    var xScale = d3.scale.linear().domain([10,80]).range([0,width])
    var chart = d3.select("#chart").append("svg").attr("width",width).attr("height",height)
    chart.selectAll("rect")
        .data(Object.keys(formatted))
        .enter()
        .append("rect")
        .attr("x",10)
        .attr("y",function(d,i){console.log(i); return height - i*(barHeight+1)})
        .attr("width",function(d,i){
            console.log(formatted[d][0]["value"])
           // return 20;
            return xScale(formatted[d][0]["value"])
        })
        .attr("height",barHeight)
    chart.select("text")
        .data(Object.keys(formatted))
        .enter()
        .append("text")
        .text(function(d){
            return formatted[d][0]["value"]
        })
        .attr("x",0)
        .attr("y",function(d,i){return height - i*(barHeight+1)})
}

function formatDataForCharts(data,tableCode){
    var formattedData = {}
    
    for(var i in pub.coordinateIds){
        var gid = pub.coordinateIds[i]
        console.log(gid)
        var title = data[gid].tables[tableCode].title
        var estimates = data[gid].data[gid][tableCode].estimate
        var columnCodes = Object.keys(estimates)
        var columnNames = data[gid].tables[tableCode].columns
        var formattedEntry = []
        for( var c in columnCodes){
            var cCode = columnCodes[c]
            var cName = columnNames[cCode].name
            var cValue = estimates[cCode]
            formattedEntry.push({"code":cCode,"name":cName,"value":cValue})
            //console.log([cCode,cName,cValue])
        }
        formattedData[gid]=formattedEntry
    }
    //console.log(formattedData)
    return formattedData
}

function getCensusId(){
    var url = "https://data.fcc.gov/api/block/2010/find?format=jsonp&latitude="+coordinate[0]
        +"&longitude="+coordinate[1]
//    console.log(url)
    $.ajax({
    url: url,
    async:true,
    dataType:"jsonp",
    success:function(data){
            var blockGroupid = "15000US"+data.Block.FIPS.slice(0,12)
            getData(blockGroupid)
        }
    });
}
function getData(geoid){
    var tableCode = 
    var censusReporter = "https://api.censusreporter.org/1.0/data/show/latest?table_ids="+tableCode+"&geo_ids="+geoid

    var finishedIds = Object.keys(pub.coordinatesData)
    if(finishedIds.indexOf(geoid)>-1){
        //console.log("already searched")
        getCensusIdList()
    }else{
        $.ajax({
            url:censusReporter,
            async:true,
            success:function(data){
               // console.log(data)
               // var formatted = formatCensusData(data,"B01002")
                //console.log(formatted)
                pub.coordinatesData[geoid]=data
                getCensusIdList()
            }
        })
    }
    
}

function returnPositions(position){
    var lng = position.coords.longitude
    var lat = position.coords.latitude        
    var alt = position.coords.altitude 
    
    pub.lat = lat
    pub.lng = lng
    getCensusId()
}
