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
        const svgWidth = width ; // Increase SVG size by 1.5 times (or adjust as needed)
        const svgHeight = height ; // Same for height

        // Set the radius to 70% of the SVG size
        this.radius = Math.min(svgWidth/2, svgHeight/2)*0.9; // 70% of the SVG width/height
        console.log("this.radius", this.radius);

        // Create the SVG with increased size
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append('g')
            .attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`); // Center the pie chart
            

    }

    update(data, key) {
        if (!data || !this.svg) return;
    
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(this.radius);
        const outerArc = d3.arc().innerRadius(this.radius * 1.05).outerRadius(this.radius * 1.05); // Arc for labels
    
        const pieData = pie(data);
        const containerSize = this.radius * 0.9; // Approximate container size (diameter)
    
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
    
        // Check if there's only one category
        const singleCategory = pieData.length === 1;
    
        if (singleCategory) {
            // Remove any existing labels or rectangles
            this.svg.selectAll('.label-group').remove();
    
            const centerGroup = this.svg.selectAll('.center-label-group').data(pieData);
    
            const enterGroup = centerGroup.enter()
                .append('g')
                .attr('class', 'center-label-group');
    
            // Append background rectangle
            enterGroup.append('rect')
                .attr('class', 'center-label-bg')
                .attr('fill', 'white')
                .attr('rx', 3) // Rounded corners
                .attr('ry', 3)
                .style('opacity', 0.8); // Semi-transparent background
    
            // Append text label
            enterGroup.append('text')
                .attr('class', 'center-label-text')
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('fill', 'black');
    
            // Merge and position text and background
            const mergedGroup = centerGroup.merge(enterGroup);
    
            mergedGroup.select('.center-label-text')
                .text(d => d.data.label)
                .attr('transform', `translate(0, 0)`); // Centered at (0, 0)
    
            mergedGroup.select('.center-label-bg')
                .each(function (d) {
                    const textElem = d3.select(this.parentNode).select('.center-label-text').node();
                    const bbox = textElem.getBBox(); // Get bounding box of text
                    d3.select(this)
                        .attr('x', bbox.x - 5) // Add padding
                        .attr('y', bbox.y - 5)
                        .attr('width', bbox.width + 10) // Adjust size based on text
                        .attr('height', bbox.height + 10);
                });
    
            centerGroup.exit().remove();
    
            return; // Skip the rest of the label logic
        }
    
        // Update labels for multiple categories
        const labels = this.svg.selectAll('.label-group').data(pieData);
    
        const labelGroups = labels.enter()
            .append('g')
            .attr('class', 'label-group');
    
        // Append background rectangles
        labelGroups.append('rect')
            .attr('class', 'label-bg')
            .attr('fill', 'white')
            .attr('rx', 3) // Rounded corners
            .attr('ry', 3)
            .style('opacity', 0.8); // Semi-transparent background
    
        // Append text labels
        labelGroups.append('text')
            .attr('class', 'label-text')
            .attr('text-anchor', d => outerArc.centroid(d)[0] > 0 ? 'start' : 'end')
            .style('font-size', '12px') // Updated font size
            .style('font-weight', 'bold')
            .style('fill', 'black');
    
        labelGroups.merge(labels)
            .select('.label-text')
            .text(d => d.data.label)
            .attr('transform', d => {
                const [x, y] = outerArc.centroid(d);
                let adjustedX = Math.max(
                    -containerSize / 2 +25,
                    Math.min(containerSize / 2-25, x)
                );
                let adjustedY = Math.max(
                    -containerSize / 2,
                    Math.min(containerSize / 2, y)
                );
                if(d.data.label === "teardown"){
                    adjustedY = adjustedY - 20;   
                }
                if(d.data.label === "built"){
                    adjustedY = adjustedY + 20;   
                }
                if(d.data.label === "deny"){
                    adjustedY = adjustedY - 20;   
                }
                if(d.data.label === "deny by acl"){
                    adjustedY = adjustedY - 15;   
                }
                if(d.data.label === "deny by acl"){
                    adjustedX = adjustedX + 15;   
                }
                return `translate(${adjustedX}, ${adjustedY})`;
            });
    
        labelGroups.merge(labels)
            .select('.label-bg')
            .attr('transform', d => {
                const [x, y] = outerArc.centroid(d);
                let adjustedX = Math.max(
                    -containerSize / 2 +25,
                    Math.min(containerSize / 2-25, x)
                );
                let adjustedY = Math.max(
                    -containerSize / 2,
                    Math.min(containerSize / 2, y)
                );
                if(d.data.label === "teardown"){
                    adjustedY = adjustedY - 20;   
                }
                if(d.data.label === "built"){
                    adjustedY = adjustedY + 20;   
                }
                if(d.data.label === "deny"){
                    adjustedY = adjustedY - 20;   
                }
                if(d.data.label === "deny by acl"){
                    adjustedY = adjustedY - 15;   
                }
                if(d.data.label === "deny by acl"){
                    adjustedX = adjustedX + 15;   
                }
                return `translate(${adjustedX}, ${adjustedY})`;
            })
            .each(function (d) {
                const textElem = d3.select(this.parentNode).select('.label-text').node();
                const bbox = textElem.getBBox(); // Get the bounding box of the text
                d3.select(this)
                    .attr('x', bbox.x - 5) // Add padding
                    .attr('y', bbox.y - 5)
                    .attr('width', bbox.width + 10) // Adjust size based on text
                    .attr('height', bbox.height + 10);
            });
    
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
