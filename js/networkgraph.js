class NetworkGraph {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
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
            //.style("background-color", "#f0f0f0");

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", function(event) {
                const { transform } = event
                vis.chart.attr("transform", transform)
            });

        // vis.svg.append("text")
        //     .attr("x", vis.config.width / 2)
        //     .attr("y", vis.config.margin.top)
        //     .attr("text-anchor", "middle")
        //     .attr("font-family", "sans-serif")
        //     .attr("font-size", "24px")
        //     .attr("fill", "black")
        //     .text("Interaction Network");

        vis.svg.call(vis.zoom);        

        vis.frequencyScale = d3.scaleLinear()
            .range([0.05,1]);
        
        vis.ProcessData();
        console.log(vis.links)

        
    }

    UpdateVis() {
        let vis = this;
        
        vis.ProcessData();
        console.log(vis.links)

        vis.RenderVis()
    }

    RenderVis() {
        let vis = this;

        vis.simulation = d3.forceSimulation(vis.nodes)
            .force("link", d3.forceLink(vis.links).id(d => d.id).distance(250))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2));

        vis.drag = d3.drag()
            .on("start", function(event, d) {
                if (!event.active) 
                    vis.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", function(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", function(event, d) {
                if (!event.active) 
                    vis.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            })

        vis.chart.selectAll(".link").remove();
        vis.chart.selectAll(".node").remove();
        
        vis.link = vis.chart.selectAll(".link")
            .data(vis.links)
            .join("line")
            .attr("class", "link")
            .style("stroke-width", d => vis.frequencyScale(d.freq) * 8)
            .style("stroke", "black");

        vis.node = vis.chart.selectAll(".node")
            .data(vis.nodes)
            .join("circle")
            .attr("class", "node")
            .attr("r", 8)
            .style("fill", "red")
            .call(vis.drag)
        
        vis.node
            .on("mouseover", function(event,d){
                d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                console.log(vis.node)
                // Highlight neighboring nodes

                let neighbors = vis.links.filter(link => link.source.id === d.id || link.target.id === d.id)
                    .map(link => link.source.id === d.id ? link.target.id : link.source.id);

                neighbors = neighbors.filter((val, i) => neighbors.indexOf(val) === i)
                let index = neighbors.indexOf(d.id)
                if (index > -1)
                    neighbors.splice(index, 1)

                //! HIGHLIGHT NOT WORKING    
                vis.node.filter(neighbor => neighbors.includes(neighbor.id))
                    .attr("fill", "orange");

                const svgPosition = document.getElementById('characterNetwork')
                console.log(svgPosition)

                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (svgPosition.offsetLeft + vis.config.tooltipPadding) + 'px')   
                    .style('top', (svgPosition.offsetTop + vis.config.tooltipPadding) + 'px')
                    .html(`
                        <div class='tooltip-title'>${d.id}</div>
                        <div>Interacts with:</div>
                        <div>${neighbors.join(", ")}</div>
                    `);
            })
            .on("mouseout", function(){
                d3.select(this).attr("stroke", null).attr("stroke-width", null);
                vis.node.attr("fill", "red");
                d3.select('#tooltip').style('display', 'none')
            });

        vis.node.append("title")
            .text(d => d.id);

        vis.simulation.on("tick", () => {
            vis.link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            vis.node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        vis.simulation.nodes(vis.nodes);
        vis.simulation.force("link").links(vis.links);
        vis.simulation.alpha(1).restart();
    }

    ProcessData() {
        let vis = this;

        let episodes = Array.from(d3.group(vis.data, d=> d.season+'-'+d.episodeNum),([key, values]) => ({ key, values }))

        vis.nodes = [];
        vis.links = [];

        episodes.forEach(scene => {
            let characters = scene.values.map(d => d.speaker);

            // Create nodes if not already present
            characters.forEach(character => {
                if (!vis.nodes.find(node => node.id === character)) {
                    vis.nodes.push({ id: character });
                }
            });
            
            let interactions = {};
            
            // Create links between characters in the scene
            for (let i = 0; i < characters.length - 1; i++) {
                for (let j = i + 1; j < characters.length; j++) {
                    let source = characters[i];
                    let target = characters[j];
    
                    let interactionKey = source < target ? source + '-' + target : target + '-' + source;

                    // Increment interaction count
                    interactions[interactionKey] = (interactions[interactionKey] || 0) + 1;
                }
            }

            Object.entries(interactions).forEach(([interactionKey, frequency]) => {
                let [source, target] = interactionKey.split('-');
                vis.links.push({ source, target, freq: frequency });
            });

        });

        vis.frequencyScale.domain(d3.extent(vis.links, d=> d.freq))
    }
}