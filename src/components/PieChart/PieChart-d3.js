import * as d3 from 'd3';

class PieChartD3 {
    constructor(container) {
        this.container = container;
        this.svg = null;
        this.radius = 0; // Radius will be calculated dynamically
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
    }

    create({ size }) {
        const { width, height } = size;
        const svgWidth = width * 1.5; // Increase SVG size by 1.5 times (or adjust as needed)
        const svgHeight = height * 1.5; // Same for height

        // Set the radius to 70% of the SVG size
        this.radius = Math.min(svgWidth, svgHeight) * 0.35; // 70% of the SVG width/height

        // Create the SVG with increased size
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append('g')
            .attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`); // Center the pie chart
            

    }

    update(data, key) {
        console.log('Updating pie chart with data: ', data);
        if (!data || !this.svg) return;

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(this.radius);

        const pieData = pie(data);

        const paths = this.svg.selectAll('path').data(pieData);

        paths.enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => this.color(d.data.label))
            .attr('stroke', 'white')
            .style('stroke-width', '2px')
            .merge(paths)
            .transition()
            .duration(500)
            .attr('d', arc);

        paths.exit().remove();

        const labels = this.svg.selectAll('text').data(pieData);

        labels.enter()
            .append('text')
            .text(d => d.data.label)
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('fill', 'black')
            .merge(labels)
            .transition()
            .duration(500)
            .attr('transform', d => `translate(${arc.centroid(d)})`);

        labels.exit().remove();
    }

    clear() {
        if (this.svg) {
            this.svg.selectAll('*').remove();
            this.svg = null;
        }
    }
}

export default PieChartD3;
