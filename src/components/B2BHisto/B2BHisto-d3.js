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
    zoomEnabled = true;

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

        // Setup zoom functionality
        this.setupZoom();

        // Create tooltip div
        this.tooltip = d3.select(this.el)
            .append("div")
            .attr("class", "b2b-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("box-shadow", "0 2px 5px rgba(0,0,0,0.1)");

        return this;
    }

    // New method to create tooltip pie chart
    createTooltipPieChart = function(data, isTop) {
        // Remove any existing chart
        this.tooltip.select("svg").remove();

        // Filter out zero values, hidden classifications, and their corresponding data
        const visibleData = data.filter((d, i) => {
            const isVisible = isTop 
                ? this.classVisibility.top[i] 
                : this.classVisibility.bottom[i];
            return d > 0 && isVisible;
        });

        const visibleClassifications = isTop 
            ? this.data.classifications.top.filter((_, i) => data[i] > 0 && this.classVisibility.top[i])
            : this.data.classifications.bottom.filter((_, i) => data[i] > 0 && this.classVisibility.bottom[i]);

        // Pie chart configuration
        const width = 250;
        const height = 120;
        const radius = Math.min(width - 130, height) / 2;

        const pie = d3.pie()
            .value(d => d)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        // Create SVG for pie chart
        const tooltipSvg = this.tooltip
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Add pie chart group
        const pieGroup = tooltipSvg.append("g")
            .attr("transform", `translate(${radius},${height/2})`);

        // Determine color scale based on top/bottom
        const colorScale = isTop ? this.colorTop : this.colorBottom;

        // Create pie chart segments
        pieGroup.selectAll("path")
            .data(pie(visibleData))
            .join("path")
            .attr("d", arc)
            .attr("fill", (d, i) => colorScale(visibleClassifications[i]))
            .attr("stroke", "white")
            .style("stroke-width", "1px");

        // Add legend
        const legend = tooltipSvg.append("g")
            .attr("transform", `translate(${2*radius + 20}, 10)`);

        legend.selectAll("rect")
            .data(visibleClassifications)
            .join("rect")
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => colorScale(d));

        legend.selectAll("text")
            .data(visibleClassifications)
            .join("text")
            .attr("x", 15)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => d.length > 15 ? d.substring(0, 15) + "..." : d)
            .style("font-size", "12px");

        return this;
    }

    setupZoom = function () {
        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([1, 20]) // Limit zoom levels
            .translateExtent([[0, 0], [this.width, this.height]]) // Define panning boundaries
            .extent([[0, 0], [this.width, this.height]])
            .on("zoom", this.zoomed.bind(this));
    
        // Add zoom and panning to the SVG
        this.svg.call(this.zoom);
    
        return this;
    };
    
    zoomed = function (event) {
        if (!this.zoomEnabled) return;
    
        const { transform } = event; // Extract the zoom/pan transform
    
        // Update xScale with the new transform
        const newXScale = transform.rescaleX(this.xOriginalXScale);

        this.xScale = newXScale;
    
        this.plotAxis(newXScale);

        // Update bars and other elements to reflect new xScale
        this.renderBars(newXScale);
    };
    
    resetZoom = function () {
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity); // Reset transform to identity
        return this;
    };

    renderLegend = function(classifications) {
        // Remove existing legend
        this.legendSvg.remove();
        
        // Recreate legend group as the last child of SVG to ensure it's on top
        this.legendSvg = this.svg.append("g")
            .attr("transform", `translate(${100}, 0)`)
            .attr("class", "legend-group");

        const lineHeight = 25;

        const self = this;

        // Tracking visibility for each classification
        if (!this.classVisibility) {
            this.classVisibility = {
                top: classifications.top.map(() => true),
                bottom: classifications.bottom.map(() => true)
            };
        }

        // Function to toggle class visibility
        const toggleClassVisibility = (isTop, index, shiftKey = false) => {
            const visibilityArray = this.classVisibility[isTop ? 'top' : 'bottom'];
            
            // Count currently active classifications
            const activeCount = visibilityArray.filter(v => v).length;

            if (shiftKey) {
                if (activeCount === 1 && visibilityArray[index]) {
                    // If this is the only active one and it's clicked, reactivate all
                    this.classVisibility[isTop ? 'top' : 'bottom'] = 
                        visibilityArray.map(() => true);
                } else {
                    // Otherwise, only show the clicked classification
                    this.classVisibility[isTop ? 'top' : 'bottom'] = 
                        visibilityArray.map((_, i) => i === index);
                }
            } else {
                // Toggle the visibility state
                visibilityArray[index] = !visibilityArray[index];
            }

            this.setupScales(this.data);

            // Rerender bars with updated visibility
            this.renderBars(self.xScale);

            this.plotAxis(this.xScale);

            // Update legend item appearance
            updateLegendAppearance(isTop);
        };

        // Function to update legend item appearance
        const updateLegendAppearance = (isTop) => {
            const legendItems = isTop ? topLegend : bottomLegend;

            legendItems.selectAll(".legend-item")
                .each(function(d, i) {
                    const opacity = isTop 
                        ? (self.classVisibility.top[i] ? 1 : 0.3)
                        : (self.classVisibility.bottom[i] ? 1 : 0.3);

                    d3.select(this)
                        .selectAll("rect")
                        .style("opacity", opacity);
                    
                    d3.select(this)
                        .selectAll("text")
                        .style("opacity", opacity);
                });
        };

        // Top Legend
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

        const topLegendGroup = topLegend.selectAll(".top-legend-item")
            .data(classifications.top)
            .join("g")
            .attr("class", "top-legend-item legend-item")
            .attr("transform", (d, i) => `translate(${topOffsets[i][0]}, ${topOffsets[i][1]})`)
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                const index = classifications.top.indexOf(d);
                toggleClassVisibility(true, index, event.shiftKey);
            });

        topLegendGroup.call(g => g.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", this.colorTop));

        topLegendGroup.call(g => g.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text(d => d));

        // Bottom Legend - similar structure to top legend
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

        const bottomLegendGroup = bottomLegend.selectAll(".bottom-legend-item")
            .data(classifications.bottom)
            .join("g")
            .attr("class", "bottom-legend-item legend-item")
            .attr("transform", (d, i) => `translate(${bottomOffsets[i][0]}, ${bottomOffsets[i][1]})`)
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                const index = classifications.bottom.indexOf(d);
                toggleClassVisibility(false, index, event.shiftKey);
            });

        bottomLegendGroup.call(g => g.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", this.colorBottom));

        bottomLegendGroup.call(g => g.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text(d => d));

        return this;
    }
     
    renderBars = function(xScale) {
        if (!this.data) return this;

        // Normalize data, respecting visibility
        const normalized_data = this.data.content.map(d => ({
        top: d.top.map((v, i) => 
            !this.classVisibility || this.classVisibility.top[i] ? v / this.maxValueTop : 0
        ),
        bottom: d.bottom.map((v, i) => 
            !this.classVisibility || this.classVisibility.bottom[i] ? v / this.maxValueBottom : 0
        )
        }));

        // Existing implementation follows...
        const stackTop = d3.stack().keys(d3.range(this.data.classifications.top.length));
        const stackBottom = d3.stack().keys(d3.range(this.data.classifications.bottom.length));

        const topStackedData = stackTop(normalized_data.map(d => d.top));
        const bottomStackedData = stackBottom(normalized_data.map(d => d.bottom.map(v => -v)));

        // Render top bars
        const topBars = this.topBarsG.selectAll(".top-bar-group")
            .data(topStackedData)
            .join(
                enter => enter.append("g")
                    .attr("class", "top-bar-group")
                    .attr("fill", (d, i) => this.colorTop(this.data.classifications.top[i])),
                update => update
                    .attr("fill", (d, i) => this.colorTop(this.data.classifications.top[i])),
                exit => exit.remove()
            );

        topBars.selectAll(".top-bar")
            .data(d => d)
            .join(
            enter => {
                const s = enter.append("rect")
                .attr("class", "top-bar")
                .on("mouseover", (event, d) => {
                    const mouseX = d3.pointer(event)[0];
                    const mouseX_percent = mouseX / this.width;

                    const timeIndex = this.parsedTimes.findIndex((t, i) => {
                        const nextT = i < this.parsedTimes.length - 1 ? this.parsedTimes[i + 1] : this.xScale.invert(this.width);
                        return this.xScale.invert(mouseX) > t && this.xScale.invert(mouseX) < nextT;
                    });

                    const barData = this.data.content[timeIndex].top;

                    this.createTooltipPieChart(barData, true);
                    
                    // Tooltip positioning logic
                    const tooltipWidth = 250; // From the createTooltipPieChart method
                    const tooltipHeight = 120; // Estimate based on previous implementation

                    let tooltipX, tooltipY;
                    if (mouseX_percent > 0.75) {
                        // Position tooltip to the left of the mouse
                        tooltipX = event.pageX - tooltipWidth - 20;
                    } else {
                        // Position tooltip to the right of the mouse
                        tooltipX = event.pageX + 10;
                    }

                    // Vertically center the tooltip relative to the mouse
                    tooltipY = event.pageY;

                    this.tooltip
                    .style("visibility", "visible")
                    .style("left", `${tooltipX}px`)
                    .style("top", `${tooltipY}px`);
                })
                .on("mouseout", () => {
                    this.tooltip.style("visibility", "hidden");
                })
                .on("click", (event, d) => {
                    const mouseX = this.xScale.invert(d3.pointer(event)[0]);
                    const timeIndex = this.parsedTimes.findIndex((t, i) => {
                        const nextT = i < this.parsedTimes.length - 1 ? this.parsedTimes[i + 1] : new Date(t.getTime() + (t.getTime() - this.parsedTimes[i-1].getTime()));
                        return mouseX > t && mouseX < nextT;
                    });

                    this.behavior.timelineSelection({start: this.data.times[timeIndex], end: this.data.times[timeIndex + 1]});
                    
                });
                this.updateSquareTop(s, xScale);
            },
            update => this.updateSquareTop(update, xScale),
            exit => exit.remove()
            );

        // Similar modifications for bottom bars
        const bottomBars = this.bottomBarsG.selectAll(".bottom-bar-group")
            .data(bottomStackedData)
            .join(
                enter => enter.append("g")
                    .attr("class", "bottom-bar-group")
                    .attr("fill", (d, i) => this.colorBottom(this.data.classifications.bottom[i])),
                update => update
                    .attr("fill", (d, i) => this.colorBottom(this.data.classifications.bottom[i])),
                exit => exit.remove()
            );

        bottomBars.selectAll(".bottom-bar")
            .data(d => d)
            .join(
            enter => {
                const s = enter.append("rect")
                .attr("class", "bottom-bar")
                .on("mouseover", (event, d) => {
                    const mouseX = d3.pointer(event)[0];
                    const mouseX_percent = mouseX / this.width;

                    const timeIndex = this.parsedTimes.findIndex((t, i) => {
                        const nextT = i < this.parsedTimes.length - 1 ? this.parsedTimes[i + 1] : this.xScale.invert(this.width);
                        return this.xScale.invert(mouseX) > t && this.xScale.invert(mouseX) < nextT;
                    });

                    const barData = this.data.content[timeIndex].bottom;

                    this.createTooltipPieChart(barData, false);
                    
                    // Tooltip positioning logic
                    const tooltipWidth = 250; // From the createTooltipPieChart method
                    const tooltipHeight = 120; // Estimate based on previous implementation

                    let tooltipX, tooltipY;
                    if (mouseX_percent > 0.75) {
                        // Position tooltip to the left of the mouse
                        tooltipX = event.pageX - tooltipWidth - 20;
                    } else {
                        // Position tooltip to the right of the mouse
                        tooltipX = event.pageX + 10;
                    }

                    // Vertically center the tooltip relative to the mouse
                    tooltipY = event.pageY;

                    this.tooltip
                    .style("visibility", "visible")
                    .style("left", `${tooltipX}px`)
                    .style("top", `${tooltipY}px`);
                })
                .on("mouseout", () => {
                    this.tooltip.style("visibility", "hidden");
                })
                .on("click", (event, d) => {
                    const mouseX = this.xScale.invert(d3.pointer(event)[0]);
                    const timeIndex = this.parsedTimes.findIndex((t, i) => {
                        const nextT = i < this.parsedTimes.length - 1 ? this.parsedTimes[i + 1] : new Date(t.getTime() + (t.getTime() - this.parsedTimes[i-1].getTime()));
                        return mouseX >= t && mouseX < nextT;
                    });

                    this.behavior.timelineSelection({start: this.data.times[timeIndex], end: this.data.times[timeIndex + 1]});
                })
                ;

                this.updateSquareBottom(s, xScale);
            },
            update => this.updateSquareBottom(update, xScale),
            exit => exit.remove()
            );

        return this;

    }

    setupScales = function(data) {
        // Convert times to Date objects if they aren't already
        const parsedTimes = data.times.map(time => 
            time instanceof Date ? time : new Date(time)
        );

        // X scale with time - precise minute-level scaling
        this.xOriginalXScale = d3.scaleTime()
            .domain([
                d3.min(parsedTimes), 
                d3.max(parsedTimes)
            ])
            .range([0, this.width]);

        this.xScale = this.xOriginalXScale.copy();

        const visibleTopIndices = this.classVisibility.top
        .reduce((acc, isVisible, index) => isVisible ? [...acc, index] : acc, []);
        
        const visibleBottomIndices = this.classVisibility.bottom
            .reduce((acc, isVisible, index) => isVisible ? [...acc, index] : acc, []);

        // Filter data based on visible classifications
        const filteredContent = data.content.map(item => ({
            top: item.top.filter((_, i) => visibleTopIndices.includes(i)),
            bottom: item.bottom.filter((_, i) => visibleBottomIndices.includes(i))
        }));

        // Update max values for visible classifications
        this.maxValueTop = d3.max(filteredContent.map(d => d3.sum(d.top))) || 1;
        this.maxValueBottom = d3.max(filteredContent.map(d => d3.sum(d.bottom))) || 1;

        // Y scale with symmetric domain
        this.yScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([this.height, 0]);

        // Use interpolateRainbow for both top and bottom color scales
        this.colorTop = d3.scaleOrdinal()
            .domain(data.classifications.top)
            .range(data.classifications.top.map((_, i) => 
                d3.interpolateRainbow(i / data.classifications.top.length)
            ));

        this.colorBottom = d3.scaleOrdinal()
            .domain(data.classifications.bottom)
            .range(data.classifications.bottom.map((_, i) => 
                d3.interpolateRainbow(i / data.classifications.bottom.length)
            ));
            
        // Store parsed times for potential reuse
        this.parsedTimes = parsedTimes.slice(0, -1);

        // Store data for potential updates
        this.data = data;

        return this;
    }

    plotAxis = function(xScale) {
        const timeFormatHourMin = d3.timeFormat("%b %d %H:%M");
        const timeRange = xScale.range();
        const tickPositions = Array.from({length: 6}, (_, i) => 
            timeRange[0] + (timeRange[1] - timeRange[0]) * (i/5)
        );
        const timeAxis = d3.axisBottom(xScale)
            .tickValues(tickPositions.map(t => xScale.invert(t)))
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


        return this;
    }

    renderB2BHisto = function (data, behavior) {
        if (!data || !data.content || !data.content.length) return this;

        this.behavior = behavior;

        this.resetClassFilter(data);

        // Setup scales based on data
        this.setupScales(data);

        // Render bars with initial x scale
        this.renderBars(this.xScale);

        // Axes
        this.plotAxis(this.xScale);

        // Legend
        this.renderLegend(data.classifications);


        return this;
    }

    updateSquareTop = function(s, xScale = this.xScale) {
        const padding = 1; // Add 1 pixel padding between bars
        s.attr("x", (d, i) => Math.max(0, xScale(this.parsedTimes[i])) + padding/2)
            .attr("y", d => this.yScale(d[1]))
            .attr("height", d => this.yScale(d[0]) - this.yScale(d[1]))
            .attr("width", (d, i) => {
                const x = xScale(this.parsedTimes[i]);
                
                let width_offset = x < 0 ? Math.abs(x) : 0;

                const current = xScale(this.parsedTimes[i]);
                const next = xScale(this.parsedTimes[i+1]);

                if (Math.abs(next - current) < width_offset) return 0;
                if (x > this.width) return 0;
                if (i === this.parsedTimes.length - 1) return this.width - current - padding;

                return Math.max(0, Math.abs(Math.min(this.width, next) - current) - width_offset - padding);
            });
        return s;
    }

    updateSquareBottom = function(s, xScale = this.xScale) {
        const padding = 1; // Add 1 pixel padding between bars
        s.attr("x", (d, i) => Math.max(0, xScale(this.parsedTimes[i])) + padding/2)
            .attr("y", d => this.yScale(d[0]))
            .attr("height", d => this.yScale(d[1]) - this.yScale(d[0]))
            .attr("width", (d, i) => {
                const x = xScale(this.parsedTimes[i]);
                
                let width_offset = x < 0 ? Math.abs(x) : 0;

                const current = xScale(this.parsedTimes[i]);
                const next = xScale(this.parsedTimes[i+1]);

                if (Math.abs(next - current) < width_offset) return 0;
                if (x > this.width) return 0;
                if (i === this.parsedTimes.length - 1) return this.width - current - padding;

                return Math.max(0, Math.abs(Math.min(this.width, next) - current) - width_offset - padding);
            });
        return s;
    }

    // New method to enable/disable zooming
    toggleZoom = function(enable = true) {
        this.zoomEnabled = enable;
        return this;
    }

    // Reset method to restore all classifications
    resetClassFilter = function(data) {
        this.classVisibility = {
            top: data.classifications.top.map(() => true),
            bottom: data.classifications.bottom.map(() => true)
        };
        return this;
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
        return this;
    }
}

export default B2BHistoD3;