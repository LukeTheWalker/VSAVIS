import * as d3 from 'd3';

class HeatMapD3 {
    margin = { top: 10, right: 80, bottom: 60, left: 150 };
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

        // Create color legend scale
        const legendScale = d3.scaleLinear()
            .domain([0, legendSteps])
            .range([0, this.height]);

        // Create legend color gradient
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
            .attr("y", d => legendScale(d))
            .attr("width", this.legendWidth)
            .attr("height", this.height / legendSteps)
            .attr("fill", d => legendColorScale(d));

        // Add scale ticks
        const legendAxis = d3.axisRight(legendScale)
            .tickValues([0, legendSteps / 2, legendSteps])
            .tickFormat(d => {
                const value = (d / legendSteps) * maxValue;
                return value.toFixed(0);
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
            .text("Value")
            
    }

    renderHeatMap = function (visData) {
        if (visData === undefined || visData.content.length === 0) return;

        const sources = visData.sources;
        const destinations = visData.destination;
        const content = visData.content;

        // Calculate max value for color scaling
        const maxValue = d3.max(content, d => d3.sum(d.values));

        // Define a color scale using a sigmoid function for interpolation
        const cubic = t => Math.pow(t, 1/3);
        this.baseHSL = d3.hsl("#cc6600"); // Adjust base color as needed
        this.colorScale = d3.scaleSequential(t => 
            d3.interpolateHsl(
            d3.hsl(this.baseHSL.h, this.baseHSL.s, .8), // Very light color
            d3.hsl(this.baseHSL.h, this.baseHSL.s, 0.2)  // Very dark color
            )(cubic(t))
        ).domain([0, maxValue]);

        const xScale = d3.scaleBand()
            .domain(sources)
            .range([0, this.width])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(destinations)
            .range([0, this.height])
            .padding(0.05);

        // Clear any existing content
        this.svgG.selectAll("*").remove();

        // Add axes
        this.svgG.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("dx", ".5em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(45)")

        this.svgG.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));

        // Draw heatmap cells
        this.svgG.selectAll(".heatmap-cell")
        .data(content)
        .join(
            enter => {
                const cellGroup = enter.append("g"); // Create a group for each cell
                
                // Append rect
                cellGroup.append("rect")
                    .attr("class", "heatmap-cell")
                    .attr("x", d => xScale(d.source))
                    .attr("y", d => yScale(d.destination))
                    .attr("width", xScale.bandwidth())
                    .attr("height", yScale.bandwidth())
                    .attr("fill", d => this.colorScale(d3.sum(d.values))); // Adjust color as needed
                
                // Append background rect for text
                // cellGroup.append("rect")
                //     .attr("class", "heatmap-cell-text-bg")
                //     .attr("x", d => xScale(d.source) + xScale.bandwidth() / 2)
                //     .attr("y", d => yScale(d.destination) + yScale.bandwidth() / 2)
                //     .attr("width", function(d) {
                //         const text = d3.sum(d.values).toString();
                //         return text.length * 8 + 10; // Adjust width based on text length
                //     })
                //     .attr("height", 20) // Adjust height as needed
                //     .attr("rx", 5) // Rounded corners
                //     .attr("ry", 5) // Rounded corners
                //     .style("fill", "white")
                //     .style("opacity", 0.8)
                //     .attr("transform", function(d) {
                //         const text = d3.sum(d.values).toString();
                //         const width = text.length * 8;
                //         return `translate(${-width / 2 - 5}, -10)`; // Center the background rect
                //     });

                // // Append text
                // cellGroup.append("text")
                //     .attr("class", "heatmap-cell-text")
                //     .attr("x", d => xScale(d.source) + xScale.bandwidth() / 2)
                //     .attr("y", d => yScale(d.destination) + yScale.bandwidth() / 2)
                //     .attr("dy", "0.35em") // Center vertically
                //     .attr("text-anchor", "middle") // Center horizontally
                //     .text(d => d3.sum(d.values)) // Replace this with your desired value
                //     .style("fill", "black") // Adjust color as needed
                //     .style("font-size", "12px"); // Adjust font size as needed
            },
            update => {
                update.select("rect")
                    .attr("fill", d => this.colorScale(d3.sum(d.values)));
                
                // update.select("text")
                //     .text(d => d3.sum(d.values));
            },
            exit => exit.remove()
        );

        // Render color legend
        this.renderColorLegend(maxValue);
    }

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    };
}

export default HeatMapD3;