import * as d3 from 'd3'

class B2BHistoD3 {
    margin = { top: 40, right: 30, bottom: 50, left: 60 };
    size;
    height;
    width;
    svg;
    xScale;
    yScale;
    color;
    data;

    constructor(el){
        this.el = el;
    }

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.legendSvg = this.svg.append("g")
            .attr("transform", `translate(${this.width - 200}, 0)`);

        this.svgG = this.svg.append("g")
            .attr("class","svgG")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Add container groups for top and bottom bars
        this.topBarsG = this.svgG.append("g").attr("class", "top-bars");
        this.bottomBarsG = this.svgG.append("g").attr("class", "bottom-bars");

        // Add axes containers
        this.xAxisG = this.svgG.append("g")
            .attr("class", "x-axis");
        this.yAxisG = this.svgG.append("g")
            .attr("class", "y-axis");

        return this;
    }

    setupScales = function(data) {
        // Convert times to Date objects if they aren't already
        const parsedTimes = data.times.map(time => 
            time instanceof Date ? time : new Date(time)
        );

        // X scale with time - precise minute-level scaling
        this.xScale = d3.scaleTime()
            .domain([
                d3.min(parsedTimes), 
                d3.max(parsedTimes)
            ])
            .range([0, this.width]);

        // Find max values for top and bottom
        this.maxValueTop = d3.max(data.content.map(d => d3.sum(d.top)));
        this.maxValueBottom = d3.max(data.content.map(d => d3.sum(d.bottom)));

        // Y scale with symmetric domain
        this.yScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([this.height, 0]);

        // Color scale
        this.colorTop = d3.scaleOrdinal()
            .domain(data.classifications.top)
            .range(d3.schemeCategory10);

        this.colorBottom = d3.scaleOrdinal()
            .domain(data.classifications.bottom)
            .range(d3.schemeCategory10);

        // Store parsed times for potential reuse
        this.parsedTimes = parsedTimes;

        // Store data for potential updates
        this.data = data;

        return this;
    }

    renderLegend = function(classifications) {
        // Clear any existing legend
        this.legendSvg.selectAll("*").remove();

        // Top legend
        const topLegend = this.legendSvg.append("g")
            .attr("class", "top-legend")
            .attr("transform", "translate(0, 20)");

        topLegend.selectAll(".top-legend-item")
            .data(classifications.top)
            .join("g")
            .attr("class", "top-legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .call(g => g.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", this.colorTop));

        topLegend.selectAll(".top-legend-text")
            .data(classifications.top)
            .join("text")
            .attr("class", "top-legend-text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 10)
            .text(d => d);

        // Bottom legend
        const bottomLegend = this.legendSvg.append("g")
            .attr("class", "bottom-legend")
            .attr("transform", "translate(0, 800)");

        bottomLegend.selectAll(".bottom-legend-item")
            .data(classifications.bottom)
            .join("g")
            .attr("class", "bottom-legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .call(g => g.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", this.colorBottom));

        bottomLegend.selectAll(".bottom-legend-text")
            .data(classifications.bottom)
            .join("text")
            .attr("class", "bottom-legend-text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 10)
            .text(d => d);

        return this;
    }

    renderB2BHisto = function (data) {
        if (!data || !data.content || !data.content.length) return this;

        // Setup scales based on data
        this.setupScales(data);

        // Normalize data
        const normalized_data = data.content.map(d => {
            return {
                top: d.top.map(v => v / this.maxValueTop),
                bottom: d.bottom.map(v => v / this.maxValueBottom)
            }
        });

        // Prepare stacked data
        const stackTop = d3.stack()
            .keys(d3.range(data.classifications.top.length));

        const stackBottom = d3.stack()
            .keys(d3.range(data.classifications.bottom.length));

        const topStackedData = stackTop(normalized_data.map(d => d.top));
        const bottomStackedData = stackBottom(normalized_data.map(d => d.bottom.map(v => -v))); // Negate for flipping

        // Render top bars with join
        const topBars = this.topBarsG.selectAll(".top-bar-group")
            .data(topStackedData)
            .join("g")
            .attr("class", "top-bar-group")
            .attr("fill", (d, i) => this.colorTop(data.classifications.top[i]));

        topBars.selectAll(".top-bar")
            .data(d => d)
            .join("rect")
            .attr("class", "top-bar")
            .attr("x", (d, i) => this.xScale(this.parsedTimes[i]))
            .attr("y", d => this.yScale(d[1]))
            .attr("height", d => this.yScale(d[0]) - this.yScale(d[1]))
            .attr("width", this.width / this.parsedTimes.length);

        // Render bottom bars with join
        const bottomBars = this.bottomBarsG.selectAll(".bottom-bar-group")
            .data(bottomStackedData)
            .join("g")
            .attr("class", "bottom-bar-group")
            .attr("fill", (d, i) => this.colorBottom(data.classifications.bottom[i]));

        bottomBars.selectAll(".bottom-bar")
            .data(d => d)
            .join("rect")
            .attr("class", "bottom-bar")
            .attr("x", (d, i) => this.xScale(this.parsedTimes[i]))
            .attr("y", d => this.yScale(d[0]))
            .attr("height", d => this.yScale(d[1]) - this.yScale(d[0]))
            .attr("width", this.width / this.parsedTimes.length);

        // X axis with time formatting
        const timeFormatHourMin = d3.timeFormat("%b %d %H:%M");

        // Create time ticks - show ticks every 4 hours
        const timeAxis = d3.axisBottom(this.xScale)
            .ticks(d3.timeHour.every(4))
            .tickFormat(timeFormatHourMin);

        this.xAxisG
            .attr("transform", `translate(0,${this.yScale(0)})`)
            .call(timeAxis)
            .selectAll("text")
            .style("text-anchor", "start");

        // Add white rectangle behind x-axis ticks for readability
        this.xAxisG.selectAll(".tick")
            .each(function() {
            const bbox = this.getBBox();
            d3.select(this)
                .insert("rect", ":first-child")
                .attr("x", bbox.x - 2)
                .attr("y", bbox.y + 5)
                .attr("width", bbox.width + 4)
                .attr("height", bbox.height - 5)
                .attr("fill", "white")
                .attr("rx", 5) // Rounded corners
                .attr("ry", 5) // Rounded corners
                .attr("opacity", 0.8); // Opacity
            });

        // Rotate x-axis ticks
        this.xAxisG.selectAll(".tick text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        // Rotate the white rectangle behind x-axis ticks
        this.xAxisG.selectAll(".tick rect")
            .attr("transform", "rotate(45)");

        // Y axis
        this.yAxisG
            .call(d3.axisLeft(this.yScale)
            .tickFormat(d => {
                if (d <= 0) return Math.round(- d * this.maxValueBottom);
                if (d >= 0) return Math.round(  d * this.maxValueTop);
                return d;
            }));

        // Render legend
        this.renderLegend(data.classifications);

        return this;
    }

    updateDots = function() { 
        console.log("IMPLEMENT updateDots");
        return this;
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
        return this;
    }
}

export default B2BHistoD3;