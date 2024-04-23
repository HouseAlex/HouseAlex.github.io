class Phrases {
    constructor(_config, _data) {
        this.config = _config;
        // this.dispatcher = _dispatcher;
        this.data = _data;
        this.isInitialized = false;
        this.InitVis();
    }

    InitVis() {
        const vis = this;

        vis.config.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.config.width = 600;
        vis.config.height = 600;
        vis.config.minFontSize = 10;
        vis.config.maxFontSize = 70;

        const containerWidth = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        const containerHeight = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.width)
            .attr("height", vis.config.height)
            .append("g");

        vis.svg.append("text")
            .attr("x", vis.config.width / 2)
            .attr("y", vis.config.margin.top)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("fill", "black")
            .text("Word Cloud");

        vis.UpdateVis();
    }

    UpdateVis() {
        const vis = this;

        const grossMap = this.phraseData(vis.data, 4, 7);
        const phraseMap = new Map();
        grossMap.forEach((value, key) => {
            const updatedKey = key.replace(/,/g, ' ').toUpperCase();
            phraseMap.set(updatedKey, value);
        })
        console.log("phrasemap", phraseMap);

        if (this.isInitialized) {
            this.words.remove();
        } else {
            this.isInitialized = true;
        }

        // const phraseNodes = Object.entries(phraseMap).map(([phrase, frequency]) => {
        //     return {phrase, frequency};
        // });

        const colorScale = d3.scaleLinear()
            .domain([d3.min(phraseMap.values()), d3.max(phraseMap.values())])
            .range(["blue", "red"]);

        vis.words = vis.svg.selectAll("text")
            .data(phraseMap.entries())
            .enter()
            .append("text")
            .attr("fill", d => colorScale(d[1]))
            .attr("x", 20)
            .attr("y", (d, i) => 40 + i * 40)
            .attr("font-family", "fantasy, sans-serif")
            .attr("font-size", "30px")
            .text(d => `${d[0]}: ${d[1]}`);

    }

    phraseData(data, minLen, maxLen) {
        const badArrays = ["  ", "uh   ", "  i", "so  "]
        const phraseMap = {};

        data.forEach(entry => {
            const lineWords = entry.line.split(/\s+/);
            const line = [];

            lineWords.forEach(word => {
                const cleanedWord = word.replace(/[^\w\s']/g, "").toLowerCase();
                if (cleanedWord != "") {
                    line.push(cleanedWord);
                }
            });

            for (let i = minLen; i <= maxLen; i++) {
                for (let ii = 0; ii <= line.length - i; ii++) {
                    const phraseArray = line.slice(ii, ii + i);
                    if (badArrays.includes(phraseArray.join(" "))){
                        continue;
                    } else {
                        if (phraseArray in phraseMap) {
                            phraseMap[phraseArray]++;
                        } else {
                            phraseMap[phraseArray] = 1;
                        }
                    }
                }
            }
        })
        const phraseArray = Object.entries(phraseMap);
        phraseArray.sort((a, b) => b[1] - a[1]);
        const topPhrases = phraseArray.slice(0, 10);
        const sortedPhraseMap = new Map(topPhrases);
        return sortedPhraseMap;
    }
}