import * as d3 from 'd3';

class HeatMapD3 {
    margin = { top: 10, right: 10, bottom: 40, left: 150 };
    size;
    height;
    width;
    svg;
    colorScale;

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.svgG = this.svg.append("g")
            .attr("class", "svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    };

    renderHeatMap = function (visData) {
        if (visData === undefined || visData.content.length === 0) return;

        const sources = visData.sources;
        const destinations = visData.destination;
        const content = visData.content;

        // Calculate max value for color scaling
        const maxValue = d3.max(content, d => d3.sum(d.values));

        // Define a color scale
        this.colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, maxValue]);

        const xScale = d3.scaleBand()
            .domain(sources)
            .range([0, this.width])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(destinations)
            .range([0, this.height])
            .padding(0.05);

        // Add axes
        this.svgG.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(xScale));

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
                    .attr("fill", d => this.colorScale(d3.sum(d.values)));
                
                // Append text
                cellGroup.append("text")
                    .attr("class", "heatmap-cell-text")
                    .attr("x", d => xScale(d.source) + xScale.bandwidth() / 2)
                    .attr("y", d => yScale(d.destination) + yScale.bandwidth() / 2)
                    .attr("dy", "0.35em") // Center vertically
                    .attr("text-anchor", "middle") // Center horizontally
                    .text(d => d3.sum(d.values)) // Replace this with your desired value
                    .style("fill", "black") // Adjust color as needed
                    .style("font-size", "12px"); // Adjust font size as needed
            },
            update => {
                update.select("rect")
                    .attr("fill", d => this.colorScale(d3.sum(d.values)));
                
                update.select("text")
                    .text(d => d3.sum(d.values));
            },
            exit => exit.remove()
        );
    }


    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    };
}

export default HeatMapD3;
