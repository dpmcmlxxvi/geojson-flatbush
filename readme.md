# [GeoJSON Flatbush][geojson-flatbush-github]

[![build](https://travis-ci.org/dpmcmlxxvi/geojson-flatbush.svg?branch=master)](https://travis-ci.org/dpmcmlxxvi/geojson-flatbush)
[![coverage](https://img.shields.io/coveralls/dpmcmlxxvi/geojson-flatbush.svg)](https://coveralls.io/r/dpmcmlxxvi/geojson-flatbush?branch=master)
[![npm](https://badge.fury.io/js/geojson-flatbush.svg)](https://badge.fury.io/js/geojson-flatbush)
[![code](https://api.codacy.com/project/badge/Grade/698be81064804bb2b03b7f33f7471924)](https://www.codacy.com/app/dpmcmlxxvi/geojson-flatbush?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dpmcmlxxvi/geojson-flatbush&amp;utm_campaign=Badge_Grade)

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

For a full listing of all available API options see the
[documentation page][geojson-flatbush-docs]. The following methods are
available:

```javascript
const index = new GeojsonFlatbush(numItems, [nodeSize], [ArrayType])
  // numItems: Number of items to index
  // nodeSize: Size of the tree node (16 by default)
  // ArrayType: the array type used for coordinates storage (Float64Array by default)

index.add(GeoJSON)                       // Add GeoJSON to index
index.finish()                           // Perform indexing
index.load(FeatureCollection)            // Load feature collection or array
index.neighbors(point, k)                // Find k-nearest neighbors from point
index.search(GeoJSON, FeatureCollection) // Find features within bounding box
GeojsonFlatbush.from(index.data)         // Create new index from raw data
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

[geojson-flatbush-github]: https://github.com/dpmcmlxxvi/geojson-flatbush

[turf-github]: https://github.com/Turfjs/turf
