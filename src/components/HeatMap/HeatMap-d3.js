import * as d3 from 'd3';

class HeatMapD3 {
    margin = { top: 10, right: 10, bottom: 40, left: 60 };
    size;
    height;
    width;
    svg;
    
    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.legendSvg = d3.select(this.el).append("svg")
            .attr("width", "100%")
            .attr("height", 50);

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
            
        this.svgG = this.svg.append("g")
            .attr("class", "svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
                                
        this.legend = this.legendSvg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(25, 25)");

        this.svgPosition = {
            left: this.margin.left + this.svg.node().getBoundingClientRect().left,
            top : this.margin.top  + this.svg.node().getBoundingClientRect().top,
        } 

    }

    updateDots = function () { console.log("IMPLEMENT updateDots") }

    renderHeatMap = function (visData) {
        if (!visData || !visData.length) return;

        this.allDotsG.selectAll(".dotG")
            .data(visData, (itemData) => itemData.index)
            .join(
                enter  => {},
                update => {},
                exit   => exit.remove()
            );
    }

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default HeatMapD3;
