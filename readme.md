# GeoJSON Flatbush

[![build](https://travis-ci.org/dpmcmlxxvi/geojson-flatbush.svg?branch=master)](https://travis-ci.org/dpmcmlxxvi/geojson-flatbush)
[![coverage](https://img.shields.io/coveralls/dpmcmlxxvi/geojson-flatbush.svg)](https://coveralls.io/r/dpmcmlxxvi/geojson-flatbush?branch=master)
[![npm](https://badge.fury.io/js/geojson-flatbush.svg)](https://badge.fury.io/js/geojson-flatbush)

GeoJSON implementation of [Flatbush][flatbush-github] — A really fast **static
spatial index** for 2D points and rectangles in JavaScript.

## GETTING STARTED

### Install

```bash
npm install --save geojson-flatbush
```

### Example

This is a simple example that populates the index with lines and queries
the index with a polygon. Note, for this example, [Turf][turf-github] must be
installed `npm install @turf/turf`

```javascript
// Initialize GeojsonFlatbush with features.
const index = new GeojsonFlatbush(2)

// Add feature collection to index.
const collection = turf.featureCollection([
  turf.lineString([[0, 0], [1, 1]]),
  turf.lineString([[0, 1], [1, 2]]),
]);
index.load(collection);

// Perform the indexing.
index.finish();

// Query with polygon.
const polygon = turf.polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
const found = index.search(polygon, collection);

// Find k-nearest neighbors and return IDs instead features
const ids = index.neighbors(point, 5);

// Do something with found feature.
found.features.forEach((feature) => {
  console.log(feature);
});

// Reconstruct the index from a raw array buffer
const newindex = GeojsonFlatbush.from(index.data);
```

## USAGE

The API is documented at the [documentation page][geojson-flatbush-docs]. The
following methods are available:

```javascript
add       // Add GeoJSON to index
finish    // Perform indexing
load      // Load feature collection or array
neighbors // Find k-nearest neighbors from point
search    // Find features within bounding box
from      // Create new index from raw data
```

## TIPS

-   `GeojsonFlatbush` is really just a wrapper to `Flatbush` but just more
    GeoJSON friendly.

-   `GeojsonFlatbush`, just like its underlying spatial index, `Flatbush`, does
    not store the original data when using `add()` or `load()`. It only stores a
    bounding box and its ID (i.e., the order in which the data was added).

-   The query methods (`neighbors`, `search`) will return a `FeatureCollection`
    if a source collection is provided, but the order of the features in the
    source collection must match the order in which the original data was added.

-   It is probably not a good idea to combine using `add` and `load` since the
    order of the data will be needed to map the query output IDs to the original
    features. It is best to just add all your data to a single
    `FeatureCollection` for loading and querying. Unless you want to keep track
    of the ID order.

## BUILD

To build and test the library locally:

```shell
npm install
npm test
```

## LICENSE

Copyright (c) 2019 Daniel Pulido <mailto:dpmcmlxxvi@gmail.com>

Source code is released under the [MIT License](http://opensource.org/licenses/ISC).

[flatbush-github]: https://github.com/mourner/flatbush

[geojson-flatbush-docs]: https://dpmcmlxxvi.github.io/geojson-flatbush/

[turf-github]: https://github.com/Turfjs/turf
