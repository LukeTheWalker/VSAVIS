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


    setupScales = function(data) {
        // Convert times to Date objects if they are not already
        const beginTime = data.times.begin instanceof Date ? data.times.begin : new Date(data.times.begin);
        const endTime = data.times.end instanceof Date ? data.times.end : new Date(data.times.end);

        
        this.xScale = d3.scaleTime()
        .domain([beginTime, endTime])
        .range([0, this.width]);

        return this;
    }

    plotAxis = function() {
        const timeFormatHourMin = d3.timeFormat("%b %d %H:%M");
        const timeAxis = d3.axisBottom(this.xScale)
        .ticks(d3.timeHour.every(4))
        .tickFormat(timeFormatHourMin);
        
        this.axisG.selectAll("*").remove();

        this.axisG
        .call(timeAxis)
        .selectAll("text")
        .style("text-anchor", "middle")
        ;

        this.axisG.selectAll(".tick text")
        .style("text-anchor", "start");

    }

    renderChart = function(xScale) {
        
        // TODO: Implement
            
        return this;
    }


    renderHistoTimeLine = function (data, behaviors) {

        if (!data || !data.times) return this;

        this.data = data;
        this.behaviors = behaviors;

        this.setupScales(data);

        this.plotAxis();

        this.renderChart(this.xScale);

        return this;
    }

    clear = function () {
        d3.select(this.el).selectAll("svg").remove();
        return this;
    }
}

export default HistoTimeLineD3;