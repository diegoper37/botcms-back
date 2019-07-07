import { Client } from '@elastic/elasticsearch'

const ElasticService = new Client({
  node: 'http://elastic:senha@elastic.botcms.siworks.org:9200/',
})

ElasticService.ping({}, { requestTimeout: 3000 }, function(error) {
  if (error) {
    console.error('elasticsearch cluster is down! ' + error)
  } else {
    console.log('Everything is ok')
  }
})

export default ElasticService
