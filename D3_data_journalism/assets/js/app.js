// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;





function makeResponsive(selection) {
    
    d3.csv("assets/data/data.csv").then( data => {
        console.log(data)
        console.log(Object.keys(data[0]))
                
        var svg = d3.select("#scatter")
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth);

        var chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        data.forEach( datum => {
            datum.income = +datum.income;
            datum.obesity = +datum.obesity;
            datum.age = +datum.age;
        })

        
        var states = data.map( d => d.abbr);
        console.log(states)

        var xLinearScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.income))
            .range([0, width]); 
        
        var yLinearScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.obesity))
            .range([height,0])
        
        // create the axes
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // add the axes
        chartGroup.append("g")
            .attr("transform",`translate(0,${height})`)
            .call(bottomAxis);
        
        chartGroup.append("g")
            .call(leftAxis);
        
        // create scatterplot
        var circleGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .classed("stateCircle",true)
            .attr("cx", d => xLinearScale(d.income))
            .attr("cy", d => yLinearScale(d.obesity))
            .attr("r", "15")
            .attr("fill", "lightgreen")            
            .attr("opacity","0.5")
        var textGroup = chartGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .classed("stateText",true)
            .attr("x", d=>xLinearScale(d.income))
            .attr("y", d=>yLinearScale(d.obesity))
            .attr("dy", ".4em")
            .text(d => d.abbr)
            
        chartGroup.append("text")
            .classed("aText yAxis",true)
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")            
            .text("Obese (%)")
        chartGroup.append("text")
            .classed("aText yAxis",true)
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 10)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")            
            .text("Healthcare");


        chartGroup.append("text")
            .classed("aText xAxis",true)
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .text("Median Household Income");
        chartGroup.append("text")
            .classed("aText xAxis",true)
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 60})`)
            .text("Age");
         
        var axisGroup = d3.selectAll(".aText")

        axisGroup.on("click", alterChart)

        // function alterChart() {
        //     console.log(d3.select(this).node())
        //     d3.selectAll("aText").attr("text-decoration","none")
        //     d3.select(this).attr("text-decoration","underline")
        //     var selection = d3.select(this).text()
        //     selection = 2
        //     makeResponsive(2)
        // }
   
 
    }).catch(function(error) {
    console.log(error);
    });
}


makeResponsive(1)


