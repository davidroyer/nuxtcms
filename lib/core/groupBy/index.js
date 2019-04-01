/* eslint-disable prefer-const */
'use strict'
const propertyAt = require('./property-value.js')

function groupBy(items, properties, collect) {
  // TODO argument validation
  // if (arguments.length < 2) return arr
  let groups = _groupBy(items, properties)
  // collect other properties values in array
  if (collect && collect.length > 0) {
    groups = collectProperties(groups, collect)
  }

  return groups
}

function _groupBy(items, properties) {
  let group = {}
  if (typeof properties[0] === 'string') {
    group = groupByCategory(items, properties[0])
  } else {
    group = groupByRange(items, properties[0])
  }
  properties = properties.slice(1)
  if (properties.length > 0) {
    for (const key in group) {
      group[key] = _groupBy(group[key], properties)
    }
  }
  return group
}

function groupByCategory(arr, prop) {
  return arr.reduce(function (group, item) {
    const tags = propertyAt(item, prop)

    tags.forEach(function (tag) {
      group[tag] = group[tag] || []
      group[tag].push(item)
    })
    return group
  }, {})
}

function groupByRange(arr, lookup) {
  return arr.reduce(function (group, f) {
    let val, ind, tag
    val = propertyAt(f, lookup.property)
    ind = locationOf(val, lookup.intervals)
    if (ind === lookup.intervals.length - 1) ind--
    tag = lookup.labels ? lookup.labels[ind] : ind
    group[tag] = group[tag] || []
    group[tag].push(f)
    return group
  }, {})
}

// collect the properties in an array
function collectProperties(groups, properties) {
  const collection = {}
  for (const key in groups) {
    if (Array.isArray(groups[key])) {
      collection[key] = groups[key].reduce(function (coll, item) {
        properties.forEach(function (prop) {
          if (!coll[prop]) coll[prop] = []
          coll[prop] = coll[prop].concat(propertyAt(item, prop))
        })
        return coll
      }, {})
    } else {
      collection[key] = collectProperties(groups[key], properties)
    }
  }
  return collection
}

// similar to Array.findIndex but more efficient
// http://stackoverflow.com/q/1344500/713573
function locationOf(element, array, start, end) {
  start = start || 0
  end = end || array.length
  const pivot = parseInt(start + (end - start) / 2, 10)
  if (end - start <= 1 || array[pivot] === element) return pivot
  if (array[pivot] < element) {
    return locationOf(element, array, pivot, end)
  } else {
    return locationOf(element, array, start, pivot)
  }
}

module.exports = groupBy
