queue()
	.defer(d3.json,"tract_neighborsOnly.json")
    .await(dataDidLoad);
function dataDidLoad(error,neighbors) {
    pub.allNeighbors = neighbors
    //getLocation()
    //console.log(neighbors)
    
    fitProjection()
}