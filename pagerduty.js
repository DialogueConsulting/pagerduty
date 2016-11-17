'use strict'

const request = require('request')
const assert = require('assert')

const CREATE_EVENT_URI = 'https://events.pagerduty.com/generic/2010-04-15/create_event.json'

class PagerDuty {

  constructor(options) {
    if (!options.serviceKey) throw new Error('serviceKey is required')
    this.serviceKey = options.serviceKey
  }

  create(options) {
    assert(options.description, 'Description is required')
    return this.sendEvent(options, 'trigger')
  }

  acknowledge(options) {
    assert(options.incidentKey, 'incidentKey is required')
    return this.sendEvent(options, 'acknowledge')
  }

  resolve(options) {
    assert(options.incidentKey, 'incidentKey is required')
    return this.sendEvent(options, 'resolve')
  }

  sendEvent(options, eventType) {
    return this.request(Object.assign({eventType}, options))
  }

  //{description, incidentKey, eventType, details}
  request(options) {
    if (!options.eventType) throw new Error('eventType is required')

    const body = {
      service_key: this.serviceKey,
      event_type: options.eventType,
      description: options.description,
      details: options.details || {}
    }

    if (options.incidentKey) {
      body.incident_key = options.incidentKey
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        uri: CREATE_EVENT_URI,
        json: body
      }, (err, res, body) => {
        if (err || res.statusCode !== 200) {
          return reject(err || {statusCode: res.statusCode, body})
        }
        return resolve(body)
      })
    })
  }
}

module.exports = PagerDuty