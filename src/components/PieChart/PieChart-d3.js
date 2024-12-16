import * as d3 from 'd3';

class pieChartD3 {
    margin = {top: 50, right: 20, bottom: 20, left: 20}; // Adjust top margin for legend
    size;
    height;
    width;
    matSvg;
    data;

    // Circle packing specific properties
    colorScheme = d3.schemeCategory10;
    packLayout = d3.pack();
    colorScale = d3.scaleOrdinal(this.colorScheme);

    pie = d3.pie().value(d => d[Object.keys(d)[0]]);
    arc = d3.arc();

    sliceNames = ['Built', 'Deny', 'Deny by ACL', 'Teardown'];


    constructor(el) {
        this.el = el;
    }

    create = function(config) {
        // Set overall size
        this.size = {width: config.size.width, height: config.size.height};

        // Calculate effective size by subtracting margins
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // Configure pack layout
        this.packLayout
            .size([this.width, this.height])
            .padding(3);

        // Initialize SVG
        this.matSvg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class", "circle-packing-g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Add a group for the legend
        this.matSvg.append("g")
            .attr("class", "legend-group")
            .attr("transform", "translate(0,-30)"); // Position above the chart
    }

    // Update individual circle elements
    updatePieChart(selection) {
        const self = this;
        // Set the radius for each pie chart based on the circle's radius
        selection.each(function(d) {
            // Configure the arc generator for this specific pie
            self.arc.innerRadius(0)
                .outerRadius(d.r);

            // Create pie chart data from the slices
            const pieData = self.pie(d.data.slices);

            // Create/update pie segments
            d3.select(this)
                .selectAll(".segment")
                .data(pieData)
                .join("path")
                .attr("class", "segment")
                .attr("d", self.arc)
                // .attr("fill", (d, i) => self.colorScale(this.sliceNames[this.sliceNames.indexOf(d)]))
                .attr("fill", (d, i) => {
                    const name = Object.keys(d.data)[0];
                    return self.colorScale(self.sliceNames.indexOf(name));
                })
                .attr("opacity", 0.7)
                .attr("stroke", "white")
                .attr("stroke-width", 1);

            // Append protocol name at the center
            const text = d3.select(this)
                .selectAll(".protocol-name")
                .data([d])
                .join("text")
                .attr("class", "protocol-name")
                .attr("text-anchor", "middle")
                .attr("dy", ".35em")
                .text(d.data.name)
                .attr("font-size", d => Math.min(d.r / 3, 12))
                .attr("fill", "black")
                .attr("font-weight", "bold");

            // Append background rectangle for text
            const bbox = text.node().getBBox();
            const bgbox = d3.select(this)
                .selectAll(".text-bg")
                .data([d])
                .join("rect")
                .attr("class", "text-bg")
                .attr("x", bbox.x - 2)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 4)
                .attr("height", bbox.height + 4)
                .attr("fill", "white")
                .attr("opacity", 0.8)
                .attr("rx", 5) // Rounded corners
                .attr("ry", 5);

            bgbox.raise();
            text.raise();
        });

        // Position the pie charts
        selection.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    // Render the legend
    renderLegend = function(sliceNames) {
        const legendGroup = this.matSvg.select(".legend-group");

        // Bind data to legend items
        const legend = legendGroup.selectAll("g.legend-item")
            .data(sliceNames)
            .join("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${i * 100}, 0)`);

        // Add colored rectangles
        legend.selectAll("rect")
            .data(d => [d])
            .join("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", (d, i) => this.colorScale(this.sliceNames.indexOf(d)))
            .attr("opacity", 0.7);

        // Add labels
        legend.selectAll("text")
            .data(d => [d])
            .join("text")
            .attr("x", 25)
            .attr("y", 15)
            .text(d => d)
            .attr("font-size", 12)
            .attr("fill", "black");

        // Adjust legend item positions based on text width
        let cumulativeWidth = 0;
        legend.attr("transform", function(d, i) {
            const textWidth = d3.select(this).select("text").node().getBBox().width;
            const xOffset = cumulativeWidth;
            cumulativeWidth += textWidth + 40; // 40 is the width of rect + some padding
            return `translate(${xOffset}, 0)`;
        });
    }

    // Main render method
    renderPieChart = function(visData) {
        if (!visData || visData.content.length === 0) return;

        this.data = visData;
        this.protocolNames = Object.keys(visData.content);

        const processedData = this.protocolNames.map(name => {
            // pick up the first key in the object
            const array_values = Object.values(visData.content[name]);

            // for each element of the array, sum the values
            const value = Math.max(Math.log2(array_values.reduce(
                (acc, curr) => { 
                    return acc + curr;
                } , 0)), 1);

            const slices = array_values.map((v, i) => {
                return { [Object.keys(visData.content[name])[i]]: v };
            });
            return { name, value, slices };
        });

        // Create hierarchy
        const root = d3.hierarchy({
            name: "Root",
            children: processedData
        })
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    
        // Apply pack layout
        this.packLayout(root);
    
        // Data join for circle groups
        this.matSvg.selectAll(".node-group")
            .data(root.leaves(), d => d.data.name)
            .join(
                enter => {
                    const nodeG = enter.append("g")
                        .attr("class", "node-group");
                    
                    this.updatePieChart(nodeG);
                    return nodeG;
                },
                update => {
                    this.updatePieChart(update);
                    return update;
                },
                exit => exit.remove()
            );

        // Render legend
        this.renderLegend(this.sliceNames);
    }

    // Clear the entire visualization
    clear = function() {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default pieChartD3;
