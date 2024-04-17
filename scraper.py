from bs4 import BeautifulSoup

import requests as req
import csv

baseUrl = 'http://www.supernaturalwiki.com'
baseCsv = 'data/Supernatural-Season'

badChars = ['♪']

allTranscripts = req.get(baseUrl + '/Category:Transcripts')
episodeCount = 0

if allTranscripts:
    all = BeautifulSoup(allTranscripts.content, 'html.parser')

    body = all.find(id='mw-content-text')
    seasons = body.find_all(attrs={"class":"mw-category-group"})
    seasonCount = 1
    for season in seasons:
        with open(f"{baseCsv}{seasonCount}.csv",'a', newline='') as csvFile:
            writer = csv.writer(csvFile)
            writer.writerow(['episodeNum', 'speaker', 'line'])
            for a in season.find_all('a', href=True):
                episode = a['href']
                #if episode.startswith('/10.') or episode.startswith('/11.') or episode.startswith('/12.') or episode.startswith('/13.') or episode.startswith('/14.') or episode.startswith('/15.'):
                #   continue
                episodePage = req.get(baseUrl+episode)

                if episodePage:
                    s = BeautifulSoup(episodePage.content, 'html.parser')

                    pageBody= s.find(id='mw-content-text')
                    listofP = pageBody.find_all('p')
                    for item in listofP:
                        isLine = item.find('br')
                        isSetting = item.find('b')
                        if isLine and not isSetting:
                            content = item.contents
                            if content and len(content) == 3 and isinstance(content[0], str) and isinstance(content[2], str) and len(content[0].split()) == 1 and content[0].lower() != 'music':
                                speaker = content[0].strip()
                                line = content[2].strip()


                                csvLine = [episodeCount, speaker, line]
                                writer.writerow(csvLine)
                else:
                    print("fail")
            
                episodeCount += 1

        seasonCount += 1