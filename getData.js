
function getTracksInCounty(neighbors){
    console.log("get data")
        var censusReporter = "https://api.censusreporter.org/1.0/data/show/acs2015_5yr?table_ids="+pub.tables+"&geo_ids="+neighbors
        $.getJSON(censusReporter, function(tractData) {
             pub["data"]=tractData 
           
            setupCharts(tractData)
        })        

}


 