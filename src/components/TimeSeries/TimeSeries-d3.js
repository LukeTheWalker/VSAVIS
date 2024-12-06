import * as d3 from 'd3'

class TimeSeriesD3 {
    margin = { top: 0, right: 0, bottom: 0, left: 0 };
    size;
    height;
    width;
    svg;

    constructor(el){
        this.el = el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.svg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.legendSvg = d3.select(this.el).append("svg")
            .attr("width", "100%")
            .attr("height", 50);

        this.svgG = this.svg.append("g")
            .attr("class","svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }

    updateDots = function() { console.log("IMPLEMENT updateDots") }

    renderTimeSeries = function (visData){
        if (!visData || !visData.length) return;

        this.allDotsG.selectAll(".dotG")
            .data(visData, (itemData) => itemData.index)
            .join(
                enter  => {},
                update => {},
                exit   => exit.remove()
            )
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default TimeSeriesD3;