# Tenders POC
Quick and dirty POC to play with elasticsearch and validate it's feasibility to be used to generate
flexible "on the fly" statistics of tenders and items for the business engagement scope.

## Setup elastic and kibana in docker
https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html

## Build tenders index
1. Update hardcoded `apiKey` in all files
2. Set appropriate `numberOfDays` in index-tenders.js. The script will pull and store in local 
elasticsearch all tenders updated over the last numberOfDays. 
3. It will take some time It tool around 6 hours to import tenders over the last 365 days of my local env
4. Run `node index-tenders.js` to build elastic index based on prozorro tenders over the last `numberOfDays`

## Get histogram statistics by 
`node histogram.js year`
`node histogram.js month`
`node histogram.js week`
