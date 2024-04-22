let characterNetwork

let mainCast = ['DEAN','SAM','CASTIEL','LUCIFER','CROWLEY','RUBY','BELA','JACK','MARY','JOHN','BOBBY','MEG','CHUCK','GABRIEL','ROWENA','GOD','JODY','CHARLIE']

d3.csv('data/Supernatural.csv')
.then(data => {
    console.log(data);
    mainCastDialogue = [];

    for (let i = 0; i < data.length; i++){
        let d = data[i];
        if (mainCast.includes(d.speaker.toUpperCase())) {
            d.speaker = d.speaker.toUpperCase()
            mainCastDialogue.push(d)
        }
    }
    console.log(mainCastDialogue)

    characterNetwork = new NetworkGraph({
        parentElement: '#characterNetwork'
    }, mainCastDialogue)
    characterNetwork.UpdateVis();
})