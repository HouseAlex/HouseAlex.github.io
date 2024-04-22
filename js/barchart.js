class BarChart {
    constructor(_config, _data) {
        this.config = _config;
        this.data = _data;
        this.InitVis();
    }

    InitVis() {
        const vis = this;

        vis.margin = { top: 40, right: 20, bottom: 100, left: 80 };
        vis.width = vis.config.width - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // Create SVG and append to the DOM
        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales
        vis.x = d3.scaleBand().rangeRound([0, vis.width]).padding(0.1);
        vis.y = d3.scaleLinear().rangeRound([vis.height, 0]);

        // Axis generators
        vis.xAxis = d3.axisBottom(vis.x);
        vis.yAxis = d3.axisLeft(vis.y);

        // Axis groups
        vis.xAxisGroup = vis.svg.append("g").attr("transform", `translate(0,${vis.height})`);
        vis.yAxisGroup = vis.svg.append("g");

        // Labels
        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 80)
            .style("text-anchor", "middle")
            .text(vis.config.xTitle);

        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", -vis.height / 2)
            .attr("y", -50)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Count");

        // Title
        vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .text(vis.config.title);

        vis.UpdateVis();
    }

    UpdateVis() {
        const vis = this;
        const param = vis.config.parameter

        vis.dataAgg = d3.rollups(vis.data, v => v.length, d => d[param])
            .map(([key, value]) => ({ key, value }));

        vis.dataAgg.sort((a, b) => +a.key - +b.key);

        vis.x.domain(vis.dataAgg.map(d => d.key));
        vis.y.domain([0, d3.max(vis.dataAgg, d => d.value)]);

        vis.RenderVis();
    }

    RenderVis() {
        const vis = this;

        // Bind data to rectangles for bars
        vis.bars = vis.svg.selectAll(".bar")
            .data(vis.dataAgg, d => d.key)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => vis.x(d.key))
            .attr("width", vis.x.bandwidth())
            .attr("y", d => vis.y(d.value))
            .attr("height", d => vis.height - vis.y(d.value))
            .attr("fill", "#69b3a2");

        // Call axis
        vis.xAxisGroup.call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        vis.yAxisGroup.call(vis.yAxis);
    }
}
