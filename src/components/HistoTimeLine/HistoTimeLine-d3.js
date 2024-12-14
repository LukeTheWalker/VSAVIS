import * as d3 from 'd3'


class HistoTimeLineD3 {
    margin = { top: 20, right: 30, bottom: 20, left: 60};
    size;
    height;
    width;
    svg;
    xScale;
    data;
    brush;
    
    constructor(el) {
        this.el = el;
        this.manageBrushingEnd = this.manageBrushingEnd.bind(this);
    }
    
    create = function (config) {
        this.size = {width : config.size.width, height: config.size.height};
        
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;
        
        this.svg = d3.select(this.el).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
        
        this.svgG = this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        // Add an horizontal line to the svg
        this.axisG = this.svgG.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + this.height + ")");
        
        this.brush = d3.brushX()
        .extent([[0,0], [this.width, this.height-1]])
        .on("end", this.manageBrushingEnd);

        this.allDotsG = this.svgG.append("g")
        .attr("class", "dots");
        
        this.svgG.append("g")
        .attr("class", "brush")
        .call(this.brush);
        
        
        return this;
    }
    
    manageBrushingEnd = function (e) {
        // Get the selection of the brush
        const selection = e.selection;
        // If the selection is a single point, do nothing
        if (!selection) { this.behaviors.timeLineSelection({}); return; }
        // Otherwise, print the extremes of the selection
        const beginTime = this.xScale.invert(selection[0]);
        const endTime = this.xScale.invert(selection[1]);
        
        let beginTimeStr = d3.timeFormat('%Y-%m-%d %H:%M:%S')(beginTime);
        let endTimeStr = d3.timeFormat('%Y-%m-%d %H:%M:%S')(endTime);
        
        this.behaviors.timeLineSelection({
            start: beginTimeStr,
            end: endTimeStr
        });
    }
    
    renderChart = function() {
        
        const histoData = this.histogramData;
        const timelineData = this.timelineData
        // Convert times to Date objects if they are not already
        const beginTime = timelineData.times.begin instanceof Date ? timelineData.times.begin : new Date(timelineData.times.begin);
        const endTime = timelineData.times.end instanceof Date ? timelineData.times.end : new Date(timelineData.times.end);
        
        const timeFormatHourMin = d3.timeFormat("%b %d %H:%M");
        
        // Define the scales
        this.xScale = d3.scaleTime()
        .domain([beginTime, endTime])
        .range([0, this.width]);
        
        this.yScale = d3.scaleLinear()
        .domain([0, d3.max(histoData, d => d.count)])
        .range([this.height, 0]);
        
        const timeAxis = d3.axisBottom(this.xScale)
        .ticks(d3.timeHour.every(4))
        .tickFormat(timeFormatHourMin);
        
        this.axisG.selectAll().remove();
        
        this.axisG
        .call(timeAxis)
        .selectAll("text")
        .style("text-anchor", "middle")
        ;
        
        // Define the line component
        const line = d3.line()
        .x(d => this.xScale(new Date(d.time)))
        .y(d => this.yScale(d.count));
        
        // Draw the line
        this.allDotsG.selectAll(".line").remove();
        this.allDotsG.append("path")
        .attr("class", "line")
        .datum(histoData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
        
        // Define the area generator
        const area = d3.area()
        .x(d => this.xScale(new Date(d.time)))
        .y0(this.height) // Baseline (bottom of the chart area)
        .y1(d => this.yScale(d.count)); // Top (data points)
        
        // Draw the area
        this.allDotsG.selectAll(".area").remove(); // Remove existing areas if any
        this.allDotsG.append("path")
        .attr("class", "area")
        .datum(histoData)
        .attr("fill", "steelblue") // Fill color
        .attr("opacity", 0.3) // Optional transparency
        .attr("d", area);

        // add small vertical lines in correspondance of the ticks
        this.svgG.selectAll(".tick-line").remove();
        this.axisG.selectAll(".tick")
        .append("line")
        .attr("class", "tick-line")
        .attr("y1", 0)
        .attr("y2", -this.height)
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("stroke-dasharray", ("3, 3"))
        .style("opacity", 0.5);
        
        
        return this;
        
    }
    
    
    renderHistoTimeLine = function (data, behaviors) {
        
        if (!data || !data.timeline || !data.histogram) return this;
        
        console.log("Rendering")
        this.timelineData = data.timeline;
        this.histogramData = data.histogram;
        
        this.behaviors = behaviors;
        
        this.renderChart();
        
        return this;
    }
    
    clear = function () {
        d3.select(this.el).selectAll("svg").remove();
        return this;
    }
}

export default HistoTimeLineD3;