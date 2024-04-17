from bs4 import BeautifulSoup

import requests as req
import csv

baseUrl = 'http://www.supernaturalwiki.com/'
baseCsv = 'data/Supernatural-Season'

testpage = '1.01_Pilot_(transcript)'
testDoc= req.get(baseUrl + testpage)

if testDoc:
    s = BeautifulSoup(testDoc.content, 'html.parser')

    body= s.find(id='mw-content-text')
    listofP = body.find_all('p')
    with open(baseCsv+'1.csv','a', newline='') as csvFile:
        writer = csv.writer(csvFile)
        writer.writerow(['episodeNum', 'speaker', 'line'])

        for item in listofP:
            isLine = item.find('br')
            isSetting = item.find('b')
            if isLine and not isSetting:
                content = item.contents
                if content and len(content) >= 3:
                    speaker = content[0].strip()
                    line = content[2].strip()

                    csvLine = [1, speaker, line]
                    writer.writerow(csvLine)

        

else:
    print("fail")