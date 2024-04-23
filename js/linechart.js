class LineChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 600,
            margin: _config.margin || {top: 45, right: 25, bottom: 40, left: 50},
            tooltipPadding: _config.tooltipPadding || 15,
            title: _config.title,
        }
        this.data = _data;
        this.InitVis();
    }

    InitVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.numChunks = 15

        vis.xScale = d3.scaleLinear()
            .domain([0, vis.numChunks - 1]) 
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = vis.chart.append("g")
            .attr("transform", "translate(0 +" + vis.height + ")")
            .call(d3.axisBottom(vis.xScale))

        vis.yAxis = vis.chart.append("g")
            //.attr("transform", `translate(${vis.config.margin.left},0)`)
            .call(d3.axisLeft(vis.yScale).ticks(vis.height / 80))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", vis.width)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                //.attr("x", -vis.config.margin.left)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start"));

        vis.clip = vis.chart.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", vis.width )
            .attr("height", vis.height )
            .attr("x", 0)
            .attr("y", 0);

        vis.areaChart = vis.chart.append('g')
            .attr("clip-path", "url(#clip)")

        vis.area = d3.area()
            .x(function(d) { return vis.xScale(d.data.chunk); })
            //.x(function(d) { return vis.xScale(d.data[0]); })
            .y0(function(d) { return vis.yScale(d[0]); })
            .y1(function(d) { return vis.yScale(d[1]); })
    


        vis.color = d3.scaleOrdinal()
            .range(d3.schemeSet2);

        
        console.log(vis.data)
    }

    UpdateVis() {
        let vis = this;

        vis.ProcessData();
        vis.sumstat = d3.nest()
            .key(d => d.speaker)
            .entries(vis.chunkDensities)

        vis.yScale.domain([0, d3.max(vis.chunkDensities, d => d.density)])
        vis.color.domain(vis.sumstat.map(d => d.key))
        /*vis.series = d3.stack()
            .keys(d3.union(vis.chunkDensities.map(d => d.speaker)))
            .value(([, D], key) => D.get(key).density)
            (d3.index(vis.chunkDensities, d => d.chunk, d => d.speaker))

        
        vis.yScale.domain([0, 1])
        vis.color.domain(vis.series.map(d => d.key))
        console.log(vis.series)*/

        /*console.log(vis.chunkDensities)
        
        vis.yScale.domain([0, 1])
        vis.yAxis.call(d3.axisLeft(vis.yScale))

        vis.keys = Object.keys(vis.transformedData[0]).slice(1)
        console.log(vis.keys)

        vis.stackedData = d3.stack()
            .keys(vis.keys)
            (vis.transformedData)

        vis.color.domain(vis.keys)

        console.log(vis.stackedData)*/

        vis.RenderVis()
    }

    RenderVis() {
        let vis = this;

        vis.lines = vis.chart.selectAll('.line')
            .data(vis.sumstat)
            .enter().append('path')
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return vis.xScale(d.chunk); })
                    .y(function(d) { return vis.yScale(+d.density); })
                    (d.values)
        })
            

        /*vis.paths = vis.chart.append("g")
        .selectAll()
        .data(vis.series)
        .join("path")
          .attr("fill", d => vis.color(d.key))
          .attr("d", vis.area)
        .append("title")
          .text(d => d.key);*/
        /*
        vis.areaChart
            .selectAll("mylayers")
            .data(vis.stackedData)
            .enter()
            .append("path")
            .attr("class", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return vis.color(d.key); })
            .attr("d", vis.area)

            var size = 20
            vis.chart.selectAll("myrect")
              .data(vis.keys)
              .enter()
              .append("rect")
                .attr("x", 400)
                .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function(d){ return vis.color(d)})
                .on("mouseover", function(d,value) {
                    d3.selectAll(".myArea").style("opacity", .1)
                    // except the one that is hovered
                    d3.select("."+value).style("opacity", 1)
                })
                .on("mouseleave", function(d){
                    
                    d3.selectAll(".myArea").style("opacity", 1)
                })
        
            // Add one dot in the legend for each name.
            vis.chart.selectAll("mylabels")
              .data(vis.keys)
              .enter()
              .append("text")
                .attr("x", 400 + size*1.2)
                .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d){ return vis.color(d)})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .on("mouseover", function(d,value) {
                    d3.selectAll(".myArea").style("opacity", .1)
                    // except the one that is hovered
                    d3.select("."+value).style("opacity", 1)
                })
                .on("mouseleave", function(d){
                    
                    d3.selectAll(".myArea").style("opacity", 1)
                })*/
    }

    ProcessData() {
        let vis = this;
        vis.chunkDensities = [];
        let totalLines = vis.data.length;
        let linesPerChunk = Math.ceil(totalLines / vis.numChunks);
        vis.allSpeakers = Array.from(new Set(vis.data.map(d => d.speaker)));

        for (let i = 0; i < vis.numChunks; i++) {
            let chunkLines = vis.data.slice(i * linesPerChunk, (i + 1) * linesPerChunk);
            let speakersInChunk = new Set(chunkLines.map(line => line.speaker));

            speakersInChunk.forEach(speaker => {
                let density = chunkLines.filter(line => line.speaker === speaker).length;
                vis.chunkDensities.push({ chunk: i, speaker, density });
            });

            // Fill in missing speakers with 0 density
            vis.allSpeakers.forEach(speaker => {
                if (!speakersInChunk.has(speaker)) {
                    vis.chunkDensities.push({ chunk: i, speaker, density: 0 });
                }
            });
        }
        
        //transform data
        /*
        const groupedData = d3.group(vis.chunkDensities, d=> d.chunk);

        vis.transformedData = []

        groupedData.forEach((chunkData, chunk) => {
            const chunkObj = { chunk };
    
            // For each speaker, add their density to the chunk object
            vis.allSpeakers.forEach(speaker => {
                const density = chunkData.find(d => d.speaker === speaker)?.density || 0;
                chunkObj[`${speaker}Density`] = density;
            });
    
            vis.transformedData.push(chunkObj);
        });

        console.log(vis.transformedData)*/
    }
}