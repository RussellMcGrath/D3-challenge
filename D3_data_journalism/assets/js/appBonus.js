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

var svg = d3.select("#scatter")
.append("svg")
.attr("height", svgHeight)
.attr("width", svgWidth);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

var chosenXAxis = "income"
var chosenYAxis = "obesity"

function xScale (data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
            .domain([
                d3.min(data, d => d[chosenXAxis]) - (d3.min(data, d => d[chosenXAxis])*.02),
                d3.max(data, d => d[chosenXAxis]) + (d3.min(data, d => d[chosenXAxis])*.02)
            ])
            .range([0, width]);
    
            return xLinearScale
}

function yScale (data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[chosenYAxis]))
        .range([height,0])

    console.log(d3.extent(data, d => d[chosenYAxis]))
    console.log(data)
    
    return yLinearScale
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(500)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(500)
      .call(leftAxis);
  
    return yAxis;
  }


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(500)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]))
  
    return circlesGroup;
  }

function renderStates(statesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    statesGroup.transition()
      .duration(500)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
  
    return statesGroup;
  }
 
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
    var ylabel;
  
    if (chosenXAxis === "income") {
      xlabel = "Income";
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age";
    }
  
    if (chosenYAxis === "obesity") {
        ylabel = "Obesity";
      }
      else if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`<strong>${d.state}</strong><br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

d3.csv("assets/data/data.csv").then( data => {
    console.log(data)
    console.log(Object.keys(data[0]))        

    data.forEach( datum => {
        datum.income = +datum.income;
        datum.obesity = +datum.obesity;
        datum.age = +datum.age;
    })

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    // yLinearScale function above csv import
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
 
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
    
    // append initial circles    
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")        
        .classed("stateCircle",true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("opacity", ".5");
    
    console.log(data)
    var statesGroup = chartGroup.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d=>xLinearScale(d[chosenXAxis]))
        .attr("y", d=>yLinearScale(d[chosenYAxis]))
        .attr("dy", ".4em")
        .text(d => d.abbr)

    // Create group for x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Median Household Income");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age");    

    // Create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var obesityLabel = yLabelsGroup.append("text")
        .classed("active", true)
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 40)        
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener            
        .text("Obese (%)");
        
    var healthcareLabel = yLabelsGroup.append("text")
        .classed("inactive", true)
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 10)        
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener              
        .text("Healthcare");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates y axis with transition
                // yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x,y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // update state labels with new x,y values
                statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
            }
        })

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates x axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates y axis with transition
                // yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x,y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // update state labels with new x,y values
                statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "healthcare") {
                    obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
            }
        })

    }).catch(function(error) {
    console.log(error);
    });



