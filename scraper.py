from bs4 import BeautifulSoup, NavigableString

import requests as req
import csv

baseUrl = 'http://www.supernaturalwiki.com'
baseCsv = 'data/Supernatural'

badChars = ['♪']

allTranscripts = req.get(baseUrl + '/Category:Transcripts')
episodeCount = 1
isStopping = False

if allTranscripts:
    all = BeautifulSoup(allTranscripts.content, 'html.parser')

    body = all.find(id='mw-content-text')
    seasons = body.find_all(attrs={"class":"mw-category-group"})
    seasonCount = 1
    with open(f"{baseCsv}.csv",'a', newline='') as csvFile:
        writer = csv.writer(csvFile)
        writer.writerow(['season','episodeNum', 'speaker', 'line'])
        for season in seasons:
            for a in season.find_all('a', href=True):
                episode = a['href']
                sep = episode.split('_')[0]
                info = sep.split('.')
                episodeNum = int(info[1])
                seasonNum = int(info[0].split('/')[1])

                episodePage = req.get(baseUrl+episode)

                if episodePage:
                    s = BeautifulSoup(episodePage.content, 'html.parser')

                    pageBody= s.find(id='mw-content-text')
                    listofP = pageBody.find_all('p')
                    for item in listofP:
                        cont = item.contents
                        lin = cont[0]
                        if len(cont) == 1 and isinstance(cont[0], str):
                            lineInfo = cont[0].split(':')
                            if len(lineInfo) == 2 and len(lineInfo[0].split()) <= 2 and '\uf0bc' not in lineInfo[1] and '♪' not in lineInfo[1] and '\u0101' not in lineInfo[1]:
                                csvLine = [seasonNum, episodeNum, lineInfo[0], lineInfo[1].strip()]
                                writer.writerow(csvLine)
                        else:
                            isLine = item.find('br')
                            isSetting = item.find('b')
                            if isLine and not isSetting:
                                content = item.contents
                                if content and len(content) == 3 and isinstance(content[0], str) and isinstance(content[2], str) and len(content[0].split()) <= 2 and content[0].lower() != 'music'  and content[2] != '':
                                    speaker = content[0].strip()
                                    line = content[2].strip()
                                    csvLine = [seasonNum, episodeNum, speaker, line]
                                    writer.writerow(csvLine)
                else:
                    print("fail")

            seasonCount +=1
            if seasonCount > 9:
                break