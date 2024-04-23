class WordCloud {
    constructor(_config, _data) {
        this.config = _config;
        // this.dispatcher = _dispatcher;
        this.data = _data;
        this.isInitialized = false;
        this.InitVis();
    }

    InitVis() {
        const vis = this;

        vis.stopwords = [];

        function loadStopwords() {
            const stopwordsFile = 'data/stop_words_english.txt'; // Path to your stopwords file
            const xhr = new XMLHttpRequest();
            xhr.open('GET', stopwordsFile, false); // Set the third parameter to false for synchronous request
            xhr.send();
        
            if (xhr.status === 200) {
                // File loaded successfully
                const contents = xhr.responseText;
                vis.stopwords = compileStopwords(contents);
            } else {
                // Error loading file
                console.error('Error loading stopwords file:', xhr.status);
            }
        }

        function compileStopwords(contents) {
            return contents.split('\n').map(word => word.trim());
        }

        loadStopwords()

        console.log("stopwords:", vis.stopwords)

        // const stopWords = [''];

        vis.config.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.config.width = 600;
        vis.config.height = 600;
        vis.config.minFontSize = 15;
        vis.config.maxFontSize = 60;
        vis.config.textColor = "#000";
        vis.config.hoverColor = "#ff0";

        // d3.select(vis.config.parentElement).select("svg").remove();

        const containerWidth = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        const containerHeight = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

        const maxX = containerWidth - vis.config.maxFontSize;
        const maxY = containerHeight - vis.config.maxFontSize;

        const minX = vis.config.margin.left;
        const minY = vis.config.margin.top + vis.config.minFontSize;

        const wordPositions = [];


        // Set up SVG container
        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.width)
            .attr("height", vis.config.height)
            .append("g")

        // vis.svg.append("text")
        //     .attr("class", "chart-title")
        //     .attr("x", vis.width / 2)
        //     .attr("y", -10)
        //     .style("text-anchor", "middle")
        //     .text(vis.config.title);


        vis.UpdateVis();
    }

    UpdateVis() {

        const vis = this;

        if (this.isInitialized) {
            this.words.remove();
        } else {
            this.isInitialized = true;
        }

        const new_data = this.manipulateData(vis.data, vis.stopwords);

        const topWords = this.getTopWords(new_data, 50);
        console.log("topWords", topWords);

        vis.svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.config.width)
            .attr("height", vis.config.height)
            .style("fill", "none")

        vis.fontSizeScale = d3.scaleLinear()
            .domain([0, d3.max(Object.values(topWords))])
            .range([vis.config.minFontSize, vis.config.maxFontSize]);

        const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter(vis.config.width / 2, vis.config.height / 2))
        .force("charge", d3.forceManyBody().strength(-17))
        .force("collide", d3.forceCollide().radius(d => d.radius + 2).strength(1.75))
        .stop();

        const wordNodes = Object.entries(topWords).map(([word, frequency]) => {
            const fontSize = vis.fontSizeScale(frequency);
            return { word, frequency, radius: fontSize / 2 };
        });

        simulation.nodes(wordNodes);

        for (let i = 0; i < 300; i++) {
            simulation.tick();
        }

        const colorScale = d3.scaleLinear()
            .domain([3, d3.max(Object.values(topWords))])
            .range(["blue", "red"]);

        vis.words = vis.svg.selectAll("text")
            .data(wordNodes)
            .enter()
            .append("text")
            .text(d => d.word.toUpperCase())
            .attr("font-size", d => vis.fontSizeScale(d.frequency))
            .attr("fill", d => colorScale(d.frequency))
            .attr("x", d => Math.max(d.radius + 20, Math.min(vis.config.width - d.radius, d.x)))
            .attr("y", d => Math.max(d.radius + 20, Math.min(vis.config.height - d.radius, d.y)))
            .attr("text-anchor", "middle")
            .style("font-family", "fantasy, sans-serif")
    }

    fixTypos(word) {
        // Common typos
        if (word == "ablong") {
            return "oblong";
        }
        if (word.startsWith("abov")) {
            return "above";
        }
        if (word == "abserv") {
            return "observe";
        }
        if (word == "acelarate") {
            return "accelerate";
        }
        return word;
    }

    // Stems
    stem(word) {
        if (word.includes("light")) {
            return "light";
        }
        if (word.includes("shap")) {
            return "shape";
        }
        if (word.includes("mov")) {
            return "move";
        }
        if (word.includes("driv")) {
            return "drive";
        }
        if (word.includes("object")) {
            return "object";
        }
        if (word.includes("speed")) {
            return "speed";
        }
        if (word.includes("observ")) {
            return "observe";
        }
        if (word.includes("wing")) {
            return "wing";
        }
        if (word.includes("triang")) {
            return "triangle";
        }
        if (word.includes("slow")) {
            return "slow";
        }
        if (word.includes("accel")) {
            return "accelerate";
        }
        if (word.includes("airc")) {
            return "aircraft";
        }
        if (word.includes("flew")) {
            return "fly";
        }
        if (word.includes("notic")) {
            return "notice";
        }
        if (word.includes("chang")) {
            return "change";
        }
        if (word.endsWith("ing")) {
            return word.slice(0, -3);
        }
        if (word.endsWith("ed")) {
            return word.slice(0, -2);
        }
        if (word.endsWith("ee")) {
            return word.slice(0, -2);
        }
        if (word.endsWith("io")) {
            return word.slice(0, -2);
        }
        if (word.endsWith("ion")) {
            return word.slice(0, -3);
        }
        if (word.endsWith("uin")) {
            return word.slice(0, -3);
        }
        if (word.endsWith("ies")) {
            return word.slice(0, -3) + 'y';
        }
        if (word == "able") {
            return "ability";
        }
        return word;
    }

    manipulateData(data, stopWords) {
        const wordFrequencyMap = {};

    // Iterate over each entry in the data
        data.forEach(entry => {
            // Extract the description and split it into words
            const descriptionWords = entry.line.split(/\s+/);
            
            // Iterate over each word in the description
            descriptionWords.forEach(word => {
                // Remove any punctuation or special characters from the word
                const cleanedWord = word.replace(/[^\w\s]/g, "").toLowerCase();

                if (/\d/.test(cleanedWord)) {
                    return;
                }

                if (stopWords.includes(cleanedWord)) {
                    return;
                }

                // TODO: Stem with "includes"
                // const stemmedWord = this.stem(cleanedWord);
                // const fixedWord = this.fixTypos(stemmedWord);


                // if (stopWords.includes(cleanedWord)) {
                //     return;
                // }

                // If the word is not in the map, add it with a frequency of 1

                // if (cleanedWord in wordFrequencyMap) {
                //     wordFrequencyMap[cleanedWord]++;
                // } else {
                //     wordFrequencyMap[cleanedWord] = 1;
                // }
                
                // Increment the frequency count for the word in the map
                if (cleanedWord in wordFrequencyMap) {
                    wordFrequencyMap[cleanedWord]++;
                } else {
                    wordFrequencyMap[cleanedWord] = 1;
                }
            });
        });

    return wordFrequencyMap;
    }

    getTopWords(wordMap, num) {
        // Convert the word frequency map to an array of objects
        const wordEntries = Object.entries(wordMap);
    
        // Sort the entries based on the count (descending order)
        wordEntries.sort((a, b) => b[1] - a[1]);
    
        // Select the top 10 entries
        const topWords = wordEntries.slice(0, num);
    
        // Convert the selected entries back to an object
        const topWordMap = Object.fromEntries(topWords);
    
        return topWordMap;
    }
}