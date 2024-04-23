let characterNetwork, episodeSelector

let mainCast = ['DEAN','SAM','CASTIEL','LUCIFER','CROWLEY','RUBY','BELA','JACK','MARY','JOHN','BOBBY','MEG','CHUCK','GABRIEL','ROWENA','GOD','JODY','CHARLIE']

let seasonDropDown = [{season: "All Seasons", value: 0}, {season: "Season 1", value: 1},{season: "Season 2", value: 2},{season: "Season 3", value: 3},{season: "Season 4", value: 4},{season: "Season 5", value: 5},{season: "Season 6", value: 6},{season: "Season 7", value: 7},{season: "Season 8", value: 8},{season: "Season 9", value: 9},{season: "Season 10", value: 10},{season: "Season 11", value: 11},{season: "Season 12", value: 12},{season: "Season 13", value: 13},{season: "Season 14", value: 14},{season: "Season 15", value: 15}]

// const dispatcher = d3.dispatch('')

d3.csv('data/Supernatural.csv')
.then(data => {
    console.log("Data:", data);
    mainCastDialogue = [];

    var toggleDescription = document.getElementById('toggleDescription')
    var descriptionDiv = document.getElementById('description')
    toggleDescription.addEventListener('click', function(){
        if (descriptionDiv.style.display === 'none') {
            descriptionDiv.style.display = 'flex';
        } else {
            descriptionDiv.style.display = 'none';
        }
    })

    seasonSelector = d3.select('#seasonSelector')
        .selectAll('option')
        .data(seasonDropDown)
        .enter().append('option')
        .attr('class', 'season')
        .attr('value', d => d.value)
        .text(d => d.season)

    speakerSelector = d3.select('#speakerSelector')
        .selectAll('option')
        .data(mainCast)
        .enter().append('option')
        .attr('class', 'speaker')
        .attr('value', d => d)
        .text(d => d)

    for (let i = 0; i < data.length; i++){
        let d = data[i];
        if (mainCast.includes(d.speaker.toUpperCase())) {
            d.speaker = d.speaker.toUpperCase()
            mainCastDialogue.push(d)
        }
    }
    mainCastDialogueOG = [...mainCastDialogue]
    console.log("Main Character Data:", mainCastDialogue)

    
    seasonEps = mainCastDialogue.filter(d => d.season == 1).map(d => +d.episodeNum)
    seasonEps = seasonEps.filter((val, i) => seasonEps.indexOf(val) === i)
    episodeSelector = d3.select('#episodeSelector')
        .selectAll('option')
        .data(seasonEps)
        .enter().append('option')
        .attr('class', 'episodeNums')
        .attr('value', d => d)
        .text(d => d)

    characterNetwork = new NetworkGraph({
        parentElement: '#characterNetwork'
    }, mainCastDialogue)
    characterNetwork.UpdateVis()

    barchart = new BarChart({
        parentElement: '#barchart',
        parameter: 'speaker',
        title: 'Line Count by Speaker',
        xTitle: 'Speaker Name',
        width: d3.select('#barchart').node().offsetWidth
    }, mainCastDialogue);
    barchart.UpdateVis();

    barchart2 = new BarChart({
        parentElement: '#barchart2',
        parameter: 'episodeNum',
        title: 'Line Count by Episode Number per Selected Speaker',
        xTitle: 'Episode Number',
        width: d3.select('#barchart2').node().offsetWidth
    }, mainCastDialogue);
    barchart.UpdateVis();

    wordcloud = new WordCloud({
        parentElement: '#wordcloud',
        title: 'Word Cloud'
    }, mainCastDialogue);

    phrases = new Phrases({
        parentElement: '#phrases'
    }, mainCastDialogue);

    let episode1Data = mainCastDialogue.filter(d => d.season == 1 && d.episodeNum == 1)
    /*(for(let i = 0; i < episode1Data.length; i++) {
        data[i].speaker = data[i].speaker.toUpperCase();
    }*/
    lineChart = new LineChart({
        parentElement: '#episodeLineChart'
    }, episode1Data);
    lineChart.UpdateVis()

    // Season Selector updating NetworkGraph and BarChart
    d3.select('#seasonSelector')
        .on('change', function() {
            if (this.value == 0){
                characterNetwork.data = mainCastDialogueOG //! COMMENTed CODE FOR DDL FILTERING - NOT WORKING
                d3.select('#speakerSelector').selectAll('.speaker').remove()
                d3.select('#speakerSelector').selectAll("option")
                    .data(mainCast)
                    .enter().append("option")
                    .attr('class', 'speaker')
                    .attr('value', d => d)
                    .text(d => d);
                characterNetwork.UpdateVis();
                barchart.data = mainCastDialogueOG
                barchart.UpdateVis();
                let filtered = [...mainCastDialogueOG]
                let selectedValue = d3.select('#speakerSelector').property('value')
                if (selectedValue != 0) {
                    filtered = filtered.filter(d => d.speaker == selectedValue)
                }
                barchart2.data = filtered
                barchart2.UpdateVis();
                wordcloud.data = mainCastDialogueOG
                wordcloud.UpdateVis();
                phrases.data = mainCastDialogueOG
                phrases.UpdateVis();
                
                seasonEps = mainCastDialogue.filter(d => d.season == 1).map(d => +d.episodeNum)
                seasonEps = seasonEps.filter((val, i) => seasonEps.indexOf(val) === i)
                d3.select('#episodeSelector').selectAll('.episodeNums').remove()
                d3.select('#episodeSelector').selectAll("option")
                    .data(seasonEps)
                    .enter().append('option')
                    .attr('class', 'episodeNums')
                    .attr('value', d => d)
                    .text(d => d)
            }
            else {
                let filtered = mainCastDialogue.filter(d => d.season == this.value)
                characters = filtered.map(d => d.speaker)
                seasonCharacters = characters.filter((val, i) => characters.indexOf(val) === i)
                d3.select('#speakerSelector').selectAll('.speaker').remove()
                d3.select('#speakerSelector').selectAll("option")
                    .data(seasonCharacters)
                    .enter().append("option")
                    .attr('class', 'speaker')
                    .attr('value', d => d)
                    .text(d => d);

                characterNetwork.data = filtered
                characterNetwork.UpdateVis();
                barchart.data = filtered
                barchart.UpdateVis();
                let selectedValue = d3.select('#speakerSelector').property('value')
                if (selectedValue != 0) {
                    filtered = filtered.filter(d => d.speaker == selectedValue)
                }
                barchart2.data = filtered
                barchart2.UpdateVis();
                wordcloud.data = filtered
                wordcloud.UpdateVis();
                phrases.data = filtered
                phrases.UpdateVis();

                seasonEps = mainCastDialogue.filter(d => d.season == this.value).map(d => +d.episodeNum)
                seasonEps = seasonEps.filter((val, i) => seasonEps.indexOf(val) === i)
                d3.select('#episodeSelector').selectAll('.episodeNums').remove()
                d3.select('#episodeSelector').selectAll("option")
                    .data(seasonEps)
                    .enter().append('option')
                    .attr('class', 'episodeNums')
                    .attr('value', d => d)
                    .text(d => d)
            }
        })

    // Speaker Selector updating NetworkGraph and BarChart
    d3.select('#speakerSelector')
        .on('change', function() {
                let filtered = mainCastDialogue.filter(d => d.speaker == this.value)
                let selectedValue = d3.select('#seasonSelector').property('value')
                if (selectedValue != 0) {
                    filtered = filtered.filter(d => d.season == selectedValue)
                }
                barchart2.data = filtered
                wordcloud.data = filtered
                phrases.data = filtered
                barchart2.UpdateVis();
                wordcloud.UpdateVis();
                phrases.UpdateVis();
        })

    d3.select('#episodeSelector')
        .on('change',function() {
            let selectedValue = d3.select('#seasonSelector').property('value')
            if (selectedValue == 0) {
                selectedValue =1
            }
            console.log(selectedValue)
                
            filtered = mainCastDialogue.filter(d => d.episodeNum == this.value && d.season == selectedValue)
            console.log(filtered)
            lineChart.data = filtered
            lineChart.UpdateVis()
        })

})
