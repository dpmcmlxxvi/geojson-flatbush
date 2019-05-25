import fs from 'fs';
import load from 'load-json-file';
import path from 'path';
import tap from 'tap';
import * as turf from '@turf/turf';

import GeojsonFlatbush from '../index';

const directories = {
  in: path.join(__dirname, 'in'),
  out: path.join(__dirname, 'out'),
};

const fixtures = fs.readdirSync(directories.in).map((filename) => {
  return {
    filename,
    name: path.parse(filename).name,
    geojson: load.sync(path.join(directories.in, filename)),
  };
});

tap.test('geojson-flatbush -- array', (t) => {
  const polygon = turf.bboxPolygon([-150, -60, 150, 60]);
  const tree = new GeojsonFlatbush(1);

  tree.load([polygon]);
  tree.finish();

  t.equal(tree.search([-140, -50, 140, 50]).length, 1);
  t.equal(tree.search(polygon).length, 1);
  t.equal(tree.search(turf.featureCollection([polygon])).length, 1);
  t.end();
});

tap.test('geojson-flatbush -- bbox', (t) => {
  const polygon = turf.bboxPolygon([-150, -60, 150, 60]);
  const tree = new GeojsonFlatbush(1);

  tree.add(polygon);
  tree.finish();

  t.equal(tree.search([-140, -50, 140, 50]).length, 1);
  t.equal(tree.search(polygon).length, 1);
  t.equal(tree.search(turf.featureCollection([polygon])).length, 1);
  t.throws(() => tree.search('foo'));
  t.end();
});

tap.test('geojson-flatbush -- from', (t) => {
  const polygon = turf.bboxPolygon([-150, -60, 150, 60]);
  const tree1 = new GeojsonFlatbush(1);

  tree1.add(polygon);
  tree1.finish();
  const tree2 = GeojsonFlatbush.from(tree1.index.data);

  t.equal(tree2.search([-140, -50, 140, 50]).length, 1);
  t.equal(tree2.search(polygon).length, 1);
  t.equal(tree2.search(turf.featureCollection([polygon])).length, 1);
  t.throws(() => tree2.search('foo'));
  t.end();
});

tap.test('geojson-flatbush -- neighbors', (t) => {
  const polygon = turf.bboxPolygon([-150, -60, 150, 60]);
  const collection = turf.featureCollection([polygon]);
  const tree = new GeojsonFlatbush(1);

  tree.load(collection);
  tree.finish();

  const point = turf.point([0, 0]);
  const found = tree.neighbors(point, Infinity, Infinity, collection);

  t.equal(tree.neighbors(point).length, 1);
  t.equal(found.features.length, 1);
  t.end();
});

tap.test('geojson-flatbush -- search', (t) => {
  for (const fixture of fixtures) {
    // Extract fixture data.
    const name = fixture.name;
    const filename = fixture.filename;
    const geojson = fixture.geojson;

    // Expected fixtures have bboxes defined but input do not.
    turf.featureEach(geojson, (feature) => {
      feature.bbox = turf.bbox(feature);
    });

    // Index data and perform search.
    const index = new GeojsonFlatbush(geojson.features.length);
    index.load(geojson);
    index.finish();
    const found = index.search(geojson.features[0], geojson);

    // Check actual and expected are equal.
    const fileout = path.join(directories.out, 'search.' + filename);
    const expected = load.sync(fileout);
    const equals = found.features.every((f) => {
      return expected.features.some((e) => {
        return JSON.stringify(f) === JSON.stringify(e);
      });
    });
    t.ok(equals, name);
  }
  t.end();
});

tap.test('geojson-flatbush -- 3D data', (t) => {
  const polygon = turf.polygon([[
    [-150, -60, 0], [-150, 60, 1], [150, 60, 2], [150, -60, 1], [-150, -60, 0],
  ]]);
  const tree = new GeojsonFlatbush(1);

  tree.add(polygon);
  tree.finish();

  t.equal(tree.search([-140, -50, 0, 140, 50, 0]).length, 1);
  t.end();
});
