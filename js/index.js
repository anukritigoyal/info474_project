'use-strict';

(function() {

    let data = "";
    let svgContainer = "";
    var margin = {top: 10, right: 30, bottom: 30, left: 50},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    window.onload = function() {
        svgContainer = d3.select('.histogram')
                        .append('svg').attr('width', 500).attr('height', 500)
                        .append('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("data/biodiversity.csv").then((csvData) => makeHistogram(csvData));
    }
    
    function makeHistogram(csvData) {

        data = csvData.filter((row) => row["NY Listing Status"] == "Endangered");
        data = data.filter((row) => row["Year Last Documented"].startsWith("1") == true || row["Year Last Documented"].startsWith("2") == true)
                
        let year = data.map((row) => parseInt(row["Year Last Documented"]));;

        for (let i = 0; i < year.length;  i++) {
            if (year[i].length > 4) {
                year[i] = year[i].substring(0, 4)
            }
        }
        
        let limits = findMinMax(year);    

        var x = d3.scaleLinear().domain([limits.yearMin, limits.yearMax]).range([0, width]);
        
        svgContainer.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));
    
        var histogram = d3.histogram()
        .value(function(d) {return d; })
        .domain(x.domain())  
        .thresholds(x.ticks(10));
        
        var bins = histogram(year);

        var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   
        svgContainer.append("g")
        .call(d3.axisLeft(y));

        svgContainer.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#4286f4")
        

        // axis labels
        svgContainer.append("text")
        .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 25) + ")")
        .style("text-anchor", "middle")
        .text("Year");

        svgContainer.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Frequency"); 

        let rects = d3.selectAll('rect');
        d3.select("button")
        .on("click", function() {
            rects.transition()
            .style("fill", "red");
    })

    }

    function findMinMax(data) {
        let min = d3.min(data);
        let max = d3.max(data);
        return {
            yearMin : min,
            yearMax : max
        }
    }
})();