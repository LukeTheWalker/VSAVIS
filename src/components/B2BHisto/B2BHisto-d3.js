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
        this.rect = true;

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.legendSvg = this.svg.append("g")
            .attr("transform", `translate(${100}, 0)`);

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
        this.parsedTimes = parsedTimes.slice(0, -1);

        // Store data for potential updates
        this.data = data;

        return this;
    }

    renderLegend = function(classifications) {
        // Remove existing legend
        this.legendSvg.remove();
        
        // Recreate legend group as the last child of SVG to ensure it's on top
        this.legendSvg = this.svg.append("g")
            .attr("transform", `translate(${100}, 0)`)
            .attr("class", "legend-group");

        // Rest of the code remains the same
        const lineHeight = 25;

        const topLegend = this.legendSvg.append("g")
            .attr("class", "top-legend")
            .attr("transform", "translate(0, 20)");

        let topOffsets = [];
        let currentX = 0;
        let currentLine = 0;

        classifications.top.forEach((d, i) => {
            const textWidth = String(d).length * 8 + 30;
            if (currentX + textWidth > this.width) {
                currentX = 0;
                currentLine++;
            }
            topOffsets.push([currentX, currentLine * lineHeight]);
            currentX += textWidth;
        });

        const topBBox = {
            width: Math.max(...topOffsets.map(o => o[0])) + 150,
            height: (currentLine + 1) * lineHeight + 10
        };

        topLegend.insert("rect", ":first-child")
            .attr("width", topBBox.width)
            .attr("height", topBBox.height)
            .attr("fill", "white")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("opacity", 0.8)
            .attr("transform", "translate(0, -13)");

        topLegend.selectAll(".top-legend-item")
            .data(classifications.top)
            .join("g")
            .attr("class", "top-legend-item")
            .attr("transform", (d, i) => `translate(${topOffsets[i][0]}, ${topOffsets[i][1]})`)
            .call(g => g.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", this.colorTop));

        topLegend.selectAll(".top-legend-text")
            .data(classifications.top)
            .join("text")
            .attr("class", "top-legend-text")
            .attr("x", (d, i) => topOffsets[i][0] + 15)
            .attr("y", (d, i) => topOffsets[i][1] + 10)
            .text(d => d);

        let bottomOffsets = [];
        currentX = 0;
        currentLine = 0;

        classifications.bottom.forEach((d, i) => {
            const textWidth = String(d).length * 8 + 30;
            if (currentX + textWidth > this.width) {
                currentX = 0;
                currentLine++;
            }
            bottomOffsets.push([currentX, currentLine * lineHeight]);
            currentX += textWidth;
        });

        const bottomBBox = {
            width: Math.max(...bottomOffsets.map(o => o[0])) + 150,
            height: (currentLine + 1) * lineHeight + 10
        };

        const bottomLegend = this.legendSvg.append("g")
            .attr("class", "bottom-legend")
            .attr("transform", `translate(0, ${this.height - bottomBBox.height + 100})`);

        bottomLegend.insert("rect", ":first-child")
            .attr("width", bottomBBox.width)
            .attr("height", bottomBBox.height)
            .attr("fill", "white")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("opacity", 0.8)
            .attr("transform", "translate(0, -13)");

        bottomLegend.selectAll(".bottom-legend-item")
            .data(classifications.bottom)
            .join("g")
            .attr("class", "bottom-legend-item")
            .attr("transform", (d, i) => `translate(${bottomOffsets[i][0]}, ${bottomOffsets[i][1]})`)
            .call(g => g.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", this.colorBottom));

        bottomLegend.selectAll(".bottom-legend-text")
            .data(classifications.bottom)
            .join("text")
            .attr("class", "bottom-legend-text")
            .attr("x", (d, i) => bottomOffsets[i][0] + 15)
            .attr("y", (d, i) => bottomOffsets[i][1] + 10)
            .text(d => d);

        return this;
    }

    renderB2BHisto = function (data) {
        if (!data || !data.content || !data.content.length) return this;

        // Setup scales based on data
        this.setupScales(data);

        // Normalize data
        const normalized_data = data.content.map(d => ({
            top: d.top.map(v => v / this.maxValueTop),
            bottom: d.bottom.map(v => v / this.maxValueBottom)
        }));

        // Prepare stacked data
        const stackTop = d3.stack().keys(d3.range(data.classifications.top.length));
        const stackBottom = d3.stack().keys(d3.range(data.classifications.bottom.length));

        const topStackedData = stackTop(normalized_data.map(d => d.top));
        const bottomStackedData = stackBottom(normalized_data.map(d => d.bottom.map(v => -v)));

        // Render top bars with explicit join pattern
        const topBars = this.topBarsG.selectAll(".top-bar-group")
            .data(topStackedData)
            .join(
                enter => enter.append("g")
                    .attr("class", "top-bar-group")
                    .attr("fill", (d, i) => this.colorTop(data.classifications.top[i])),
                update => update
                    .attr("fill", (d, i) => this.colorTop(data.classifications.top[i])),
                exit => exit.remove()
            );

        topBars.selectAll(".top-bar")
            .data(d => d)
            .join(
                enter => {
                    const s = enter.append("rect")
                        .attr("class", "top-bar");
                    this.updateSquareTop(s);
                },
                update => this.updateSquareTop(update),
                exit => exit.remove()
            );

        // Render bottom bars with explicit join pattern
        const bottomBars = this.bottomBarsG.selectAll(".bottom-bar-group")
            .data(bottomStackedData)
            .join(
                enter => enter.append("g")
                    .attr("class", "bottom-bar-group")
                    .attr("fill", (d, i) => this.colorBottom(data.classifications.bottom[i])),
                update => update
                    .attr("fill", (d, i) => this.colorBottom(data.classifications.bottom[i])),
                exit => exit.remove()
            );

        bottomBars.selectAll(".bottom-bar")
            .data(d => d)
            .join(
            enter => {
                const s = enter.append("rect")
                .attr("class", "bottom-bar");
                this.updateSquareBottom(s);
            },
            update => this.updateSquareBottom(update),
            exit => exit.remove()
            );

        // Axes and legend code
        const timeFormatHourMin = d3.timeFormat("%b %d %H:%M");
        const timeAxis = d3.axisBottom(this.xScale)
            .ticks(d3.timeHour.every(4))
            .tickFormat(timeFormatHourMin);

        // clear svg 
        this.xAxisG.selectAll("*").remove();
        this.yAxisG.selectAll("*").remove();

        this.xAxisG
            .attr("transform", `translate(0,${this.yScale(0)})`)
            .call(timeAxis)
            .selectAll("text")
            .style("text-anchor", "start");

        this.xAxisG.selectAll(".tick")
            .each(function() {
                // remove existing rect
                const bbox = this.getBBox();
                d3.select(this)
                    .insert("rect", ":first-child")
                    .attr("x", bbox.x - 2)
                    .attr("y", bbox.y + 5)
                    .attr("width", bbox.width + 4)
                    .attr("height", bbox.height - 5)
                    .attr("fill", "white")
                    .attr("rx", 5)
                    .attr("ry", 5)
                    .attr("opacity", 0.8);
            });

        this.xAxisG.selectAll(".tick text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        this.xAxisG.selectAll(".tick rect")
            .attr("transform", "rotate(45)");

        this.yAxisG
            .call(d3.axisLeft(this.yScale)
                .tickFormat(d => {
                    if (d <= 0) return Math.round(-d * this.maxValueBottom);
                    if (d >= 0) return Math.round(d * this.maxValueTop);
                    return d;
                }));

        this.renderLegend(data.classifications);

        return this;
    }

    updateSquareTop = function(s) { 
        const square_width = Math.floor(this.width / this.parsedTimes.length);
        s.attr("x", (d, i) => this.xScale(this.parsedTimes[i]))
            .attr("y", d => this.yScale(d[1]))
            .attr("height", d => this.yScale(d[0]) - this.yScale(d[1]))
            .attr("width", square_width);
        return s;
    }

    updateSquareBottom = function(s) {
        const square_width = Math.floor(this.width / this.parsedTimes.length);
        s.attr("x", (d, i) => this.xScale(this.parsedTimes[i]))
            .attr("y", d => this.yScale(d[0]))
            .attr("height", d => this.yScale(d[1]) - this.yScale(d[0]))
            .attr("width", square_width);
        return s;
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
        return this;
    }
}

export default B2BHistoD3;