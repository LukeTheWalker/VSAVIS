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
        const outerArc = d3.arc().innerRadius(this.radius * 1.05).outerRadius(this.radius * 1.05); // Arc for labels
    
        const pieData = pie(data);
        const containerSize = this.radius * 2; // Approximate container size (diameter)
    
        // Check if only one category exists
        const singleCategory = pieData.length === 1;
    
        // Update paths for pie slices
        const paths = this.svg.selectAll('path').data(pieData);
    
        paths.enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => this.color(d.data.label))
            .merge(paths)
            .transition()
            .duration(500)
            .attr('d', arc);
    
        paths.exit().remove();
    
        // Handle single category: Place label in the center
        if (singleCategory) {
            // Remove any existing lines
            this.svg.selectAll('line').remove();
    
            // Update label in the center
            const labels = this.svg.selectAll('text').data(pieData);
    
            labels.enter()
                .append('text')
                .text(d => d.data.label)
                .attr('text-anchor', 'middle') // Center-align text
                .style('font-size', '25px')
                .style('fill', 'black')
                .merge(labels)
                .transition()
                .duration(500)
                .attr('transform', `translate(0, 0)`); // Position at the center
    
            labels.exit().remove();
        } else {
    
            // Update labels outside the pie chart
            const labels = this.svg.selectAll('text').data(pieData);
    
            labels.enter()
            .append('text')
            .text(d => d.data.label)
            .attr('text-anchor', d => outerArc.centroid(d)[0] > 0 ? 'start' : 'end') // Align left or right
            .style('font-size', '25px')
            .style('fill', 'black')
            .attr('transform', d => `translate(${outerArc.centroid(d)})`) // Initial position
            .each(function (d) {
                // Dynamically adjust positions after calculating text size
                const textElem = d3.select(this);
                const bbox = this.getBBox(); // Get the size of the text element
                const [x, y] = outerArc.centroid(d);

                // Adjust positions to ensure the text fits within the container
                const adjustedX = Math.max(
                    -containerSize / 2 + bbox.width / 2 + 10, 
                    Math.min(containerSize / 2 - bbox.width / 2 - 10, x)
                );
                const adjustedY = Math.max(
                    -containerSize / 2 + bbox.height / 2 + 10, 
                    Math.min(containerSize / 2 - bbox.height / 2 - 10, y)
                );

                textElem.attr('transform', `translate(${adjustedX}, ${adjustedY})`);
            })
            .merge(labels)
            .transition()
            .duration(500)
            .attr('text-anchor', d => outerArc.centroid(d)[0] > 0 ? 'start' : 'end'); // Keep alignment consistent

        labels.exit().remove();

        }
    }
    
    
    
    clear() {
        if (this.svg) {
            this.svg.selectAll('*').remove();
            this.svg = null;
        }
    }
}

export default PieChartD3;
