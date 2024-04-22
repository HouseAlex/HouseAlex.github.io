let characterNetwork

let mainCast = ['DEAN','SAM','CASTIEL','LUCIFER','CROWLEY','RUBY','BELA','JACK','MARY','JOHN','BOBBY','MEG','CHUCK','GABRIEL','ROWENA','GOD','JODY','CHARLIE']

let seasonDropDown = [{season: "All Seasons", value: 0}, {season: "Season 1", value: 1},{season: "Season 2", value: 2},{season: "Season 3", value: 3},{season: "Season 4", value: 4},{season: "Season 5", value: 5},{season: "Season 6", value: 6},{season: "Season 7", value: 7},{season: "Season 8", value: 8},{season: "Season 9", value: 9},{season: "Season 10", value: 10},{season: "Season 11", value: 11},{season: "Season 12", value: 12},{season: "Season 13", value: 13},{season: "Season 14", value: 14},{season: "Season 15", value: 15}]

// const dispatcher = d3.dispatch('')

d3.csv('data/Supernatural.csv')
.then(data => {
    console.log("Data:", data);
    mainCastDialogue = [];

    seasonSelector = d3.select('#seasonSelector')
        .selectAll('option')
        .data(seasonDropDown)
        .enter().append('option')
        .attr('value', d => d.value)
        .text(d => d.season)

    for (let i = 0; i < data.length; i++){
        let d = data[i];
        if (mainCast.includes(d.speaker.toUpperCase())) {
            d.speaker = d.speaker.toUpperCase()
            mainCastDialogue.push(d)
        }
    }
    mainCastDialogueOG = [...mainCastDialogue]
    console.log("Main Character Data:", mainCastDialogue)

    characterNetwork = new NetworkGraph({
        parentElement: '#characterNetwork'
    }, mainCastDialogue)
    characterNetwork.UpdateVis()

    d3.select('#seasonSelector')
        .on('change', function() {
            if (this.value == 0){
                characterNetwork.data = mainCastDialogueOG
                characterNetwork.UpdateVis();
            }
            else {
                let filtered = mainCastDialogue.filter(d => d.season == this.value)
                characterNetwork.data = filtered
                characterNetwork.UpdateVis();
            }
        })

    wordcloud = new WordCloud({
        parentElement: '#wordcloud'
    }, mainCastDialogue);

})