import * as d3 from "d3";

class chordDiagramD3 {
    margin = { top: 50, right: 20, bottom: 20, left: 20 };
    size = { width: 800, height: 500 }; // Default size
    height;
    width;
    svg;
    data;

    colorScheme = d3.schemeCategory10;
    colorScale;

    chordLayout = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
    arcGenerator = d3.arc();
    ribbonGenerator = d3.ribbon().radius(() => this.innerRadius);

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        // Dynamically get container size
        const containerWidth = this.el.offsetWidth || this.size.width;
        const containerHeight = this.el.offsetHeight || this.size.height;

        // Set size based on config or container
        this.size = {
            width: config?.size?.width || containerWidth,
            height: config?.size?.height || containerHeight,
        };

        // Effective size
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // Radii
        this.innerRadius = Math.min(this.width, this.height) * 0.4;
        this.outerRadius = this.innerRadius + 20;

        // Initialize SVG
        this.svg = d3
            .select(this.el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${(this.width + this.margin.left) / 2},${(this.height + this.margin.top) / 2})`);

        // Add legend group
        this.svg
            .append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(${-this.width / 2}, -${this.height / 2})`);
    };

    updateChordDiagram = function (data) {
        this.data = data;

        const { nodes, matrix } = this.data;

        // Group nodes into services and ports
        const services = nodes.filter((node) => node.group === "service");
        const ports = nodes.filter((node) => node.group === "port");

        // Define color scale for services
        this.colorScale = d3.scaleOrdinal()
            .domain(services.map((node) => node.name))
            .range(d3.schemeTableau10);

        // Compute chord layout
        const chords = this.chordLayout(matrix);

        // Draw arcs for nodes
        const groups = this.svg
            .selectAll(".group")
            .data(chords.groups)
            .join("g")
            .attr("class", "group");

        groups
            .append("path")
            .attr("d", this.arcGenerator.innerRadius(this.innerRadius).outerRadius(this.outerRadius))
            .attr("fill", (d) => this.getNodeColor(nodes[d.index]))
            .attr("stroke", (d) => d3.rgb(this.getNodeColor(nodes[d.index])).darker());

        groups
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
            .attr("font-size", "10px")
            .attr("fill", "#333");

        // Draw ribbons for relationships
        this.svg
            .selectAll(".ribbon")
            .data(chords)
            .join("path")
            .attr("class", "ribbon")
            .attr("d", this.ribbonGenerator)
            .attr("fill", (d) => this.getNodeColor(nodes[d.source.index]))
            .attr("stroke", (d) => d3.rgb(this.getNodeColor(nodes[d.source.index])).darker())
            .attr("opacity", 0.8)
            .append("title")
            .text(
                (d) =>
                    `Service: ${nodes[d.source.index].name}\nPort: ${nodes[d.target.index].name}\nValue: ${d.source.value}`
            );
    };

    // Method to get the color for a node
    getNodeColor = function (node) {
        return node.group === "service" ? this.colorScale(node.name) : "#cccccc"; // Ports are gray
    };

    render = function (data) {
        if (!data) return;

        this.updateChordDiagram(data);
    };

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    };
}

export default chordDiagramD3;
