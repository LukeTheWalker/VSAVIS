import * as d3 from "d3";

class chordDiagramD3 {
    margin = { top: 50, right: 20, bottom: 20, left: 20 };
    size;
    height;
    width;
    svg;
    data;

    colorScheme = d3.schemeCategory10;
    colorScale = d3.scaleOrdinal(this.colorScheme);

    chordLayout = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
    arcGenerator = d3.arc();
    ribbonGenerator = d3.ribbon().radius(() => this.innerRadius);

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        // Set overall size
        this.size = { width: config.size.width, height: config.size.height };

        // Calculate effective size by subtracting margins
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // Define radii for the chord diagram
        this.innerRadius = Math.min(this.width, this.height) * 0.4;
        this.outerRadius = this.innerRadius + 20;

        // Initialize SVG
        this.svg = d3
            .select(this.el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

        // Add a group for the legend
        this.svg
            .append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(${-this.width / 2}, -${this.height / 2})`);
    };

    // Update method for drawing or updating the chord diagram
    updateChordDiagram = function (data) {
        this.data = data;

        const { nodes, matrix, links } = this.data;

        // Compute chord layout
        const chords = this.chordLayout(matrix);

        // Draw arcs for nodes
        const group = this.svg
            .selectAll(".group")
            .data(chords.groups)
            .join(
                (enter) =>
                    enter
                        .append("g")
                        .attr("class", "group")
                        .call((g) =>
                            g
                                .append("path")
                                .attr("d", this.arcGenerator.innerRadius(this.innerRadius).outerRadius(this.outerRadius))
                                .attr("fill", (d) => this.colorScale(nodes[d.index].group))
                                .attr("stroke", (d) => d3.rgb(this.colorScale(nodes[d.index].group)).darker())
                        )
                        .call((g) =>
                            g
                                .append("text")
                                .each((d) => {
                                    d.angle = (d.startAngle + d.endAngle) / 2;
                                })
                                .attr("dy", "0.35em")
                                .attr(
                                    "transform",
                                    (d) =>
                                        `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${this.outerRadius + 10}) ${
                                            d.angle > Math.PI ? "rotate(180)" : ""
                                        }`
                                )
                                .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
                                .text((d) => nodes[d.index].name)
                        ),
                (update) => update,
                (exit) => exit.remove()
            );

        // Draw ribbons for links
        this.svg
            .selectAll(".ribbon")
            .data(chords)
            .join("path")
            .attr("class", "ribbon")
            .attr("d", this.ribbonGenerator)
            .attr("fill", (d) => this.colorScale(nodes[d.source.index].group))
            .attr("stroke", (d) => d3.rgb(this.colorScale(nodes[d.source.index].group)).darker())
            .append("title") // Add tooltips
            .text((d) => `From ${nodes[d.source.index].name} to ${nodes[d.target.index].name}`);
    };

    // Render the legend
    renderLegend = function (nodeGroups) {
        const legendGroup = this.svg.select(".legend-group");

        // Bind data to legend items
        const legend = legendGroup
            .selectAll("g.legend-item")
            .data(nodeGroups)
            .join("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${i * 100}, 0)`);

        // Add colored rectangles
        legend.selectAll("rect")
            .data((d) => [d])
            .join("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", (d) => this.colorScale(d.group));

        // Add labels
        legend.selectAll("text")
            .data((d) => [d])
            .join("text")
            .attr("x", 25)
            .attr("y", 15)
            .text((d) => d.name)
            .attr("font-size", 12)
            .attr("fill", "black");
    };

    // Main render method
    render = function (data) {
        if (!data) return;

        this.updateChordDiagram(data);
        this.renderLegend(this.data.nodes);
    };

    // Clear the entire visualization
    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    };
}

export default chordDiagramD3;
