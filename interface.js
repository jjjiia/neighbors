//d3.select("#header").append("div").attr("class","section").attr("id","coordinates").html("coordinates").attr("width",window.innerWidth-20)
//d3.select("#header").append("div").attr("class","section").attr("id","censusLabelFCC").html("census geography from FCC").attr("width",window.innerWidth-20)
d3.select("#main").append("div").attr("class","section").attr("id","geoids")//.attr("width",window.innerWidth-20)//.html("MAP")
d3.select("#main").append("div").attr("class","section").attr("id","chart")//.attr("width",window.innerWidth-20)//.html("MAP")

d3.select("#main").append("div").attr("class","section").attr("id","map")//.attr("width",window.innerWidth-20)//.html("MAP")
d3.select("#main").append("div").attr("class","section").attr("id","key")//.html("MAP")

var geoColors = {
    county:"#d1902e",
    blockGroup:"#e64821",
    tract:"#45b865"
}