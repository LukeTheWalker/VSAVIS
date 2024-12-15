import * as d3 from 'd3';

class HistoTimeLineD3 {
    margin = { top: 30, right: 30, bottom: 20, left: 60 };
    size;
    height;
    width;
    svg;
    xScale;
    yScale;
    data;
    brush;
    tooltip;

    constructor(el) {
        this.el = el;
        this.manageBrushingEnd = this.manageBrushingEnd.bind(this);
        this.resize = this.resize.bind(this);

        // Initialize tooltip
        this.tooltip = d3.select(this.el)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("opacity", 0);

        // Attach resize listener for responsiveness
        window.addEventListener("resize", this.resize);
    }

    create(config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.svgG = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        this.axisG = this.svgG.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.height})`);

        this.brush = d3.brushX()
            .extent([[0, 0], [this.width, this.height - 1]])
            .on("end", this.manageBrushingEnd);

        this.allDotsG = this.svgG.append("g")
            .attr("class", "dots");

        this.svgG.append("g")
            .attr("class", "brush")
            .call(this.brush);

        return this;
    }

    manageBrushingEnd(e) {
        const selection = e.selection;
        if (!selection) {
            this.behaviors.timeLineSelection({});
            return;
        }

        const beginTime = this.xScale.invert(selection[0]);
        const endTime = this.xScale.invert(selection[1]);

        const beginTimeStr = d3.timeFormat('%Y-%m-%d %H:%M:%S')(beginTime);
        const endTimeStr = d3.timeFormat('%Y-%m-%d %H:%M:%S')(endTime);

        this.behaviors.timeLineSelection({
            start: beginTimeStr,
            end: endTimeStr
        });
    }

    renderChart() {
        const histoData = this.histogramData;
        const timelineData = this.timelineData;

        const beginTime = timelineData.times.begin instanceof Date ? timelineData.times.begin : new Date(timelineData.times.begin);
        const endTime = timelineData.times.end instanceof Date ? timelineData.times.end : new Date(timelineData.times.end);

        const timeFormatHourMin = d3.timeFormat("%b %d %H:%M");

        this.xScale = d3.scaleTime()
            .domain([beginTime, endTime])
            .range([0, this.width]);

        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(histoData, d => d.count)])
            .range([this.height, 0]);

        const timeAxis = d3.axisBottom(this.xScale)
            .ticks(d3.timeHour.every(4))
            .tickFormat(timeFormatHourMin);

        this.axisG.selectAll("*").remove();

        this.axisG.call(timeAxis)
            .selectAll("text")
            .style("text-anchor", "middle");

        const line = d3.line()
            .x(d => this.xScale(new Date(d.time)))
            .y(d => this.yScale(d.count));

        this.allDotsG.selectAll(".line").remove();
        this.allDotsG.append("path")
            .attr("class", "line")
            .datum(histoData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        const area = d3.area()
            .x(d => this.xScale(new Date(d.time)))
            .y0(this.height-3)
            .y1(d => this.yScale(d.count));

        this.allDotsG.selectAll(".area").remove();
        this.allDotsG.append("path")
            .attr("class", "area")
            .datum(histoData)
            .attr("fill", "steelblue")
            .attr("opacity", 0.3)
            .attr("d", area);

        this.allDotsG.selectAll(".event").remove();
        this.allDotsG.selectAll(".event")
            .data(this.events)
            .enter()
            .append("circle")
            .attr("class", "event")
            .attr("cx", d => this.xScale(new Date(d.time)))
            .attr("cy", -15)
            .attr("r", 5)
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", (event, d) => this.handleOnMouseOver(d, event))
            .on("mouseout", () => this.handleOnMouseOut())
            .on("click", (event, d) => this.handleOnClick(d));

        // From each event, draw a line from the dot to the x axis
        this.allDotsG.selectAll(".event-line").remove();
        this.allDotsG.selectAll(".event-line")
            .data(this.events)
            .enter()
            .append("line")
            .attr("class", "event-line")
            .attr("x1", d => this.xScale(new Date(d.time)))
            .attr("y1", -10)
            .attr("x2", d => this.xScale(new Date(d.time)))
            .attr("y2", this.height)
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5");

        return this;
    }

    handleOnMouseOver(d, e) {
        this.tooltip
            .html(d.description)
            .style("left", `${e.pageX}px`)
            .style("top", `${e.pageY}px`)
            .style("opacity", 1);
    }

    handleOnMouseOut() {
        this.tooltip
            .style("left", "-1000px")
            .style("top", "-1000px")
            .style("opacity", 0);
    }

    handleOnClick(d) {
        const startTime = new Date(d.time);
        startTime.setMinutes(startTime.getMinutes() - 30);

        const endTime = new Date(d.time);
        endTime.setMinutes(endTime.getMinutes() + 30);

        // add 1 second to the end time
        endTime.setSeconds(endTime.getSeconds() + 1);
        // and to the begin time
        startTime.setSeconds(startTime.getSeconds() + 1);

        const timeFormat = d3.timeFormat('%Y-%m-%d %H:%M:%S');

        console.log("Selected time range", timeFormat(startTime), timeFormat(endTime));

        this.behaviors.timeLineSelection({
            start: timeFormat(startTime),
            end: timeFormat(endTime)
        });
        
    }

    renderHistoTimeLine(data, behaviors) {
        if (!data || !data.timeline || !data.histogram || !data.events) return this;

        this.timelineData = data.timeline;
        this.histogramData = data.histogram;
        this.events = data.events;

        this.behaviors = behaviors;

        this.renderChart();

        return this;
    }

    clear() {
        d3.select(this.el).selectAll("svg").remove();
        return this;
    }

    resize() {
        const rect = this.el.getBoundingClientRect();
        this.size = { width: rect.width, height: rect.height };
        this.clear().create({ size: this.size }).renderHistoTimeLine(this.data, this.behaviors);
    }
}

export default HistoTimeLineD3;
