import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

class SankeyDiagramD3 {
    margin = { top: 20, right: 20, bottom: 20, left: 20 };
    width;
    height;
    svg;
    sankeyGenerator;
    tooltip;

    constructor(el) {
        this.el = el;
    }

    

    // Create the SVG container
    create(config) {
        // Set chart dimensions
        this.width = config.size.width - this.margin.left - this.margin.right;
        this.height = config.size.height - this.margin.top - this.margin.bottom;

        // Remove any previous SVG
        d3.select(this.el).selectAll("svg").remove();

        // Create the SVG container
        this.svg = d3
            .select(this.el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        // Initialize the Sankey generator
        this.sankeyGenerator = sankey()
            .nodeWidth(20) // Width of nodes
            .nodePadding(25) // Space between nodes
            .size([this.width, this.height]); // Layout dimensions

        // Initialize tooltip for interactivity
        this.tooltip = d3
            .select(this.el)
            .append("div")
            .attr("class", "sankey-tooltip")
            .style("visibility", "hidden")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "#fff")
            .style("padding", "5px 10px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("font-size", "12px");
    }

    // Render the Sankey diagram with data
    render(data) {
        if (!data || !data.nodes || !data.links) return;

        // Set up color scale for nodes
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Compute Sankey layout
        const sankeyData = this.sankeyGenerator({
            nodes: data.nodes.map((d) => Object.assign({}, d)),
            links: data.links.map((d) => Object.assign({}, d)),
        });

        

        // Draw links (flows)
        const link = this.svg
            .append("g")
            .attr("class", "sankey-links")
            .selectAll("path")
            .data(sankeyData.links)
            .enter()
            .append("path")
            .attr("class", "sankey-link")
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke", "#999")
            .attr("stroke-width", (d) => Math.max(1, d.width))
            .attr("fill", "none")
            .attr("opacity", 0.6)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).attr("opacity", 1);
                this.tooltip
                    .style("visibility", "visible")
                    .html(
                        `Source: <b>${d.source.name}</b><br>
                         Target: <b>${d.target.name}</b><br>
                         Value: ${d.value}`
                    )
                    .style("top", `${event.pageY - 30}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).attr("opacity", 0.6);
                this.tooltip.style("visibility", "hidden");
            });

        // Draw nodes
        const node = this.svg
            .append("g")
            .attr("class", "sankey-nodes")
            .selectAll("g")
            .data(sankeyData.nodes)
            .enter()
            .append("g")
            .attr("class", "sankey-node");

        // Add rectangles for nodes
        node.append("rect")
            .attr("x", (d) => d.x0)
            .attr("y", (d) => d.y0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("width", (d) => d.x1 - d.x0)
            .attr("fill", (d) => colorScale(d.name))
            .attr("stroke", "#000");

        // Add node labels
        node.append("text")
            .attr("x", (d) => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
            .attr("y", (d) => (d.y0 + d.y1) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", (d) => (d.x0 < this.width / 2 ? "start" : "end"))
            .text((d) => d.name)
            .style("font-size", "12px")
            .style("fill", "#333");
    }

    // Clear the chart for re-rendering
    clear() {
        d3.select(this.el).selectAll("*").remove();
        this.tooltip.remove();
    }
}

export default SankeyDiagramD3;
