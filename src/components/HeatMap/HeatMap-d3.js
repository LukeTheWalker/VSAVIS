import * as d3 from 'd3';

class HeatMapD3 {
    margin = { top: 10, right: 80, bottom: 100, left: 80 };
    size;
    height;
    width;
    svg;
    colorScale;
    legendWidth = 20; // Width of the color legend
    
    constructor(el) {
        this.el = el;
    }
    
    create = function (config) {
        this.size = { width: config.size.width, height: config.size.height };
        
        // Adjust width to accommodate the legend
        this.width = this.size.width - this.margin.left - this.margin.right - this.legendWidth;
        this.height = this.size.height - this.margin.top - this.margin.bottom;
        
        this.svg = d3.select(this.el).append("svg")
        .attr("width", this.size.width + this.legendWidth)
        .attr("height", this.size.height);
        
        this.svgG = this.svg.append("g")
        .attr("class", "svgG")
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }
    
    renderColorLegend = function (maxValue) {
        // Remove existing legend if any
        this.svg.selectAll(".color-legend").remove();
        
        // Create legend group
        const legendG = this.svg.append("g")
        .attr("class", "color-legend")
        .attr("transform", `translate(${this.width + this.margin.left + 20}, ${this.margin.top})`);
        
        // Number of steps in the legend
        const legendSteps = 10;
        const legendScale = d3.scaleLinear()
        .domain([0, legendSteps])
        .range([this.height, 0]); // Reversed range
            
        // Create legend color scale (now inverted)
        const legendColorScale = d3.scaleSequential(t =>
            d3.interpolateHsl(
                d3.hsl(this.baseHSL.h, this.baseHSL.s, 0.8), 
                d3.hsl(this.baseHSL.h, this.baseHSL.s, 0.2)
            )(Math.pow(t / legendSteps, 1/3))
        );
        
        // Append colored rectangles for the legend
        legendG.selectAll(".legend-rect")
        .data(d3.range(legendSteps))
        .enter()
        .append("rect")
        .attr("class", "legend-rect")
        .attr("x", 0)
        .attr("y", d => this.height - (d + 1) * (this.height / legendSteps)) // Invert y-position
        .attr("width", this.legendWidth)
        .attr("height", this.height / legendSteps)
        .attr("fill", d => legendColorScale(d));
        
        // Add scale ticks
        const legendAxis = d3.axisRight(legendScale)
        .tickValues(d3.range(0, legendSteps + 1, 2)) // Skip one every two
        .tickFormat(d => {
            const value = (d / legendSteps) * maxValue;
            const invertedValue = Math.pow(2, value) - 1;
            return invertedValue.toFixed(0);
        });
        
        legendG.append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(${this.legendWidth}, 0)`)
        .call(legendAxis);
        
        // Add legend title
        legendG.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", this.legendWidth + 50)
        .attr("x", -this.height / 2)
        .attr("text-anchor", "middle")
        .text("Value");
    }
    insertLinebreaks = function (d) {
        var el = d3.select(this);
        var words = d.split(' ');
        el.text('');
    
        var line = '';
        var lineCount = 0;
        words.forEach(word => {
            if (line.length + word.length > 10 && line.length > 0) {
                el.append('tspan').text(line).attr('x', 0).attr('dy', '0').attr('dx', '-10');
                line = '';
                lineCount++;
            }
            line += (line.length > 0 ? ' ' : '') + word;
        });
        el.append('tspan').text(line).attr('x', 0).attr('dy', '0').attr('dx', '-10');

        const tspans = el.selectAll('tspan').attr('y', function (d, i) {
            return (.25 + i - (lineCount / 2)) + 'em';
        });
    };

    renderHeatMap = function (visData) {
        if (visData === undefined || visData.content.length === 0) return;
        
        this.xvalues = visData.sources;
        this.classes = visData.classes.map(c => c.toString());
        this.counts = visData.content;
        
        // Transform the counts object into a matrix
        // where each row corresponds to a source
        // and each column corresponds to a class
        // The value in each cell is the count
        const content = this.xvalues.map(source => {
            return this.classes.map(destination => {
                return Math.log2(this.counts[source][destination] + 1)
            });
        });
        
        
        // Draw a heatmap with xvalues on the x axis
        // and classes on the y axis
        // The color of each cell is determined by the count
        // in the corresponding cell of the counts array
        
        // Clear any existing content
        
        this.svgG.selectAll("*").remove();
        
        // Add axes
        this.xScale = d3.scaleBand()
        .domain(this.xvalues)
        .range([0, this.width])
        .padding(0.05);
        
        this.yScale = d3.scaleBand()
        .domain(this.classes)
        .range([0, this.height])
        .padding(0.05);
        
        this.svgG.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${this.height})`)
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "1em")
        .attr("dy", "-.6em")
        .attr("transform", "rotate(90)")
        
        this.svgG.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(this.yScale))

        this.svgG.selectAll(".y-axis text").each(this.insertLinebreaks);
        
        // Now add color to the heatmap
        // Calculate max value for color scaling
        const maxValue = d3.max(content.flat());

        // Define a color scale using a sigmoid function for interpolation
        const cubic = t => Math.pow(t, 1/3);
        this.baseHSL = d3.hsl("#cc6600"); // Adjust base color as needed
        this.colorScale = d3.scaleSequential(t => 
            d3.interpolateHsl(
            d3.hsl(this.baseHSL.h, this.baseHSL.s, 0.8), // Very light color
            d3.hsl(this.baseHSL.h, this.baseHSL.s, 0.2)  // Very dark color
            )(cubic(t))
        ).domain([0, maxValue]);
        
        // Draw heatmap cells with color
        this.svgG.selectAll(".heatmap-cell")
        .data(content.flat())
        .join(
            enter => {
                enter.append("rect")
                .attr("class", "heatmap-cell")
                .attr("x", (d, i) => this.xScale(this.xvalues[Math.floor(i / this.classes.length)]))
                .attr("y", (d, i) => this.yScale(this.classes[i % this.classes.length]))
                .attr("width", this.xScale.bandwidth())
                .attr("height", this.yScale.bandwidth())
                .attr("fill", d => this.colorScale(d))
                .attr("info", (d,i) => i)
                // Make the rectangles rounded
                .attr("rx", 6)
                .attr("ry", 6)
                .on("mouseover", (event, d) => {
                    // Calculate the x and y positions from data
                    // get the info html attribute from event.target
                    const info = d3.select(event.target).attr("info");
                    const i = info;

                    const xValue = this.xvalues[Math.floor(i / this.classes.length)];
                    const yValue = this.classes[i % this.classes.length];
                    
                    // Append text to show count
                    const text = this.svgG.append("text")
                    .attr("class", "heatmap-cell-text")
                    .attr("x", this.xScale(xValue) + this.xScale.bandwidth() / 2)
                    .attr("y", this.yScale(yValue) + this.yScale.bandwidth() / 2)
                    .attr("font-size", "12px")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .text(Math.round(Math.pow(2, d) - 1))
                    .style("fill", "black")
                    .style("font-size", "12px")
                    .style("font-weight", "bold")
                    .style("pointer-events", "none")
                    .style("user-select", "none");

                    // Append background rectangle for text
                    const bbox = text.node().getBBox();
                    const bgrect = this.svgG.append("rect")
                    .attr("class", "text-bg")
                    .attr("x", bbox.x - 2)
                    .attr("y", bbox.y - 2)
                    .attr("width", bbox.width + 4)
                    .attr("height", bbox.height + 4)
                    .attr("fill", "white")
                    .attr("opacity", 0.8)
                    .attr("rx", 5) // Rounded corners
                    .attr("ry", 5);

                    // on hovering make the cell bigger 
                    d3.select(event.target)
                    .raise()
                    .transition()
                    .duration(200)
                    .attr("width", this.xScale.bandwidth() + 10)
                    .attr("height", this.yScale.bandwidth() + 10)
                    .attr("x", this.xScale(xValue) - 5)
                    .attr("y", this.yScale(yValue) - 5)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);

                    bgrect.raise();
                    text.raise();

                })
                .on("mouseout", (event, d) => {
                    const info = d3.select(event.target).attr("info");
                    const i = info;

                    const xValue = this.xvalues[Math.floor(i / this.classes.length)];
                    const yValue = this.classes[i % this.classes.length];

                    this.svgG.selectAll(".heatmap-cell-text").remove();
                    this.svgG.selectAll(".text-bg").remove();

                    // on mouse out make the cell normal
                    d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr("width", this.xScale.bandwidth())
                    .attr("height", this.yScale.bandwidth())
                    .attr("x", (d, i) => this.xScale(xValue))
                    .attr("y", (d, i) => this.yScale(yValue))
                    .attr("stroke", "none");
                });
            },
            update => {
                update.attr("fill", d => this.colorScale(d));
            },
            exit => exit.remove()
        );

        this.renderColorLegend(maxValue);
    }
    
    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    };
}

export default HeatMapD3;
