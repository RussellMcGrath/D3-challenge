// define svg size
var svgWidth = 960;
var svgHeight = 500;
// define chart margins
var margin = {
  top: 50,
  right: 40,
  bottom: 100,
  left: 100
};
// calculate chart size
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create svg
var svg = d3.select("#scatter")
.append("svg")
.attr("height", svgHeight)
.attr("width", svgWidth);

// create chart group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// assign defatult data to display
var chosenXAxis = "income"
var chosenYAxis = "obesity"

// function to create xScale based on selected data
function xScale (data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
            .domain([
                d3.min(data, d => d[chosenXAxis]) - (d3.min(data, d => d[chosenXAxis])*.02),
                d3.max(data, d => d[chosenXAxis]) + (d3.min(data, d => d[chosenXAxis])*.02)
            ])
            .range([0, width]);
    
            return xLinearScale
}

// function to create xScale based on selected data
function yScale (data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([
          d3.min(data, d => d[chosenYAxis]) - (d3.min(data, d => d[chosenYAxis])*.1),
          d3.max(data, d => d[chosenYAxis]) + (d3.min(data, d => d[chosenYAxis])*.02)
        ])
        .range([height,0])

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

// function used for updating state labels group with a transition to
// new locations
function renderStates(statesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    statesGroup.transition()
      .duration(500)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
  
    return statesGroup;
  }
 
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    // insantiate label variable
    var xlabel;
    var ylabel;
    // assign the active axis values to tooltop label vars
    if (chosenXAxis === "income") {
        xlabel = "Income";
    } else if (chosenXAxis === "age") {
        xlabel = "Age";
    } else if (chosenXAxis === "poverty") {
        xlabel = "Poverty";
    }
  
    if (chosenYAxis === "obesity") {
        ylabel = "Obesity";
    } else if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare";
    } else if (chosenYAxis === "smokes") {
        ylabel = "Smokes";
    }
    
    // create tooltip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`<strong>${d.state}</strong><br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
      });
  
    // call tooltip tp circles group
    circlesGroup.call(toolTip);
  
    // create event listener to display tooltop on mouseover circle
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

// read csv file and perform actions
d3.csv("assets/data/data.csv").then( data => {
    // typecast target data to numerical
    data.forEach( datum => {
        datum.income = +datum.income;
        datum.obesity = +datum.obesity;
        datum.age = +datum.age;
        datum.healthcare = +datum.healthcare;
        datum.poverty = +datum.poverty;
        datum.smokes = +datum.smokes;
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
    // append state labels
    var statesGroup = chartGroup.selectAll("cicle text")
        .data(data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d=>xLinearScale(d[chosenXAxis]))
        .attr("y", d=>yLinearScale(d[chosenYAxis]))
        .attr("dy", ".4em")
        .text(d => d.abbr)

    // Create chart title
    var titleGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, -10)`)
        .append("text")
        .classed("title", true)
        .text("Health Risks per Demographic (State Level)")

    // Create group for x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    // create x-axis labels
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Household Income (Median)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("In Poverty (%)"); 

    // Create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
       // create y-axis labels
    var obesityLabel = yLabelsGroup.append("text")
        .classed("active", true)
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 50)        
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener            
        .text("Obese (%)");
        
    var healthcareLabel = yLabelsGroup.append("text")
        .classed("inactive", true)
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 30)        
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener              
        .text("Lack Healthcare (%)");
    
    var smokesLabel = yLabelsGroup.append("text")
        .classed("inactive", true)
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 10)        
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener              
        .text("Smokes (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");

            // create click indicator animation
            var indicator = xLabelsGroup
            .append("circle")
            .classed("indicator",true)
            .attr("cx", d3.mouse(xLabelsGroup.node())[0])
            .attr("cy", d3.mouse(xLabelsGroup.node())[1])                 
            .attr("r", 30)
            .attr("stroke-width",3)
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("opacity", "1")
            .transition()
            .duration(500)
            .attr("opacity", "0")
            
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

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
                    povertyLabel
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
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "poverty") {
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  povertyLabel
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

            // create click indicator animation
            var indicator = yLabelsGroup
                .append("circle")
                .classed("indicator",true)
                .attr("cx", d3.mouse(yLabelsGroup.node())[0])
                .attr("cy", d3.mouse(yLabelsGroup.node())[1])                 
                .attr("r", 30)
                .attr("stroke-width",3)
                .attr("stroke", "black")
                .attr("fill", "none")
                .attr("opacity", "1")
                .transition()
                .duration(500)
                .attr("opacity", "0")
            
            // if clicked factor is differen than the active one
            // re-render charts
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

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
                    smokesLabel
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
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                  obesityLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  healthcareLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  smokesLabel
                      .classed("active", true)
                      .classed("inactive", false);                      
                }
        }})

    }).catch(function(error) {
    console.log(error);
    });