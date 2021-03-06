import Flatbush from 'flatbush';
import * as turf from '@turf/turf';

/**
 * @description Converts GeoJSON or bounding box to [minX, minY, maxX, maxY].
 * @param {BBox|GeoJSON} data Data from which to retrieve 2D bounding box.
 * @private
 * @return {Array} [minX, minY, maxX, maxY]
 */
const toBBox = (data) => {
  let bbox = data;

  // Check for GeoJSON data.
  if (Array.isArray(data) === false) {
    bbox = turf.bbox(data);
  }

  // Check for 3D data.
  if (bbox.length === 6) {
    bbox = [bbox[0], bbox[1], bbox[3], bbox[4]];
  }

  return bbox;
};

/**
 * @description GeoJSON wrapper class for Flatbush.
 * @example
 * // Initialize GeojsonFlatbush with features.
 * const index = new GeojsonFlatbush(2)
 * const collection = turf.featureCollection([
 *   turf.lineString([[0, 0], [1, 1]]),
 *   turf.lineString([[0, 1], [1, 2]]),
 * ]);
 * index.load(collection);
 * index.finish();
 *
 * // Query with polygon.
 * const polygon = turf.polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
 * const found = index.search(polygon, collection);
 * found.features.forEach((feature) => {
 *   // do something with found feature.
 *   console.log(feature);
 * });
 */
class GeojsonFlatbush {
  /**
   * @description Instantiates a GeojsonFlatbush index from raw 'data' member.
   * @param {ArrayBuffer} data Raw indexing data array.
   * @return {GeojsonFlatbush} New instance of GeojsonFlatbush.
   * @static
   * @example
   * // Reconstruct the index from a raw array buffer.
   * const index = GeojsonFlatbush.from(e.index.data);
   */
  static from(data) {
    const idx = Flatbush.from(data);
    return new GeojsonFlatbush(idx.numItems, idx.nodeSize, idx.ArrayType, data);
  }

  /**
   * @description Instantiates a GeojsonFlatbush index.
   * @param {Number} numItems Number of items to store in static index.
   * @param {Number} [nodeSize=16] Size of the tree node.
   * @param {Number} [ArrayType=Float64Array] Array type coordinate storage.
   * @return {GeojsonFlatbush} New instance of GeojsonFlatbush.
   * @example
   * // Initialize GeojsonFlatbush for 1000 items.
   * const index = new GeojsonFlatbush(1000)
   */
  // eslint-disable-next-line require-jsdoc
  constructor(numItems, nodeSize = 16, ArrayType = Float64Array, data) {
    /**
     * @description Flatbush spatial index.
     * @type {Flatbush}
     */
    this.index = new Flatbush(numItems, nodeSize, ArrayType, data);
  }

  /**
   * @description Adds a single GeoJSON to the index.
   * @param {GeoJSON|Array} data GeoJSON or bounding box array.
   * @example
   * // Fill the index with a line string.
   * const line = turf.lineString([[0, 0], [1, 1]]);
   * index.add(line);
   */
  add(data) {
    const bbox = toBBox(data);
    this.index.add(...bbox);
  }

  /**
   * @description Performs indexing of the added GeoJSON.
   * @example
   * // Perform the indexing. Should only be called once when done adding data.
   * index.finish()
   */
  finish() {
    this.index.finish();
  }

  /**
   * @description Bulk load a collection to the index.
   * @param {FeatureCollection|Array} data GeoJSON or array of features/bboxes.
   * @example
   * // Fill the index with a feature collection.
   * const collection = turf.featureCollection([
   *   turf.lineString([[0, 0], [1, 1]]),
   *   turf.lineString([[0, 1], [1, 2]]),
   * ]);
   * index.load(collection);
   */
  load(data) {
    const features = (Array.isArray(data) ? data : data.features);
    features.forEach((feature) => {
      this.add(feature);
    });
  }

  /**
   * @description Finds the K nearest neighbors from a point.
   * @param {point} point Query point.
   * @param {Number} [maxResults=Infinity] Maximum number of results (= K).
   * @param {Number} [maxDistance=Infinity] Maximum distance from point allowed.
   * @param {GeoJSON} [collection=null] Source collection to select items from.
   * @param {Function} [filterFn] Called on every found item (passing an item
   *                              index) and only includes it if function
   *                              returned a truthy value.
   * @return {FeatureCollection|Array} Features found or their IDs.
   * @example
   * // Find the 5 nearest neighbors.
   * const point = turf.point([0,0]);
   * const neighbors = index.neighbors(point, 5, Infinity, collection);
   */
  neighbors(point, maxResults = Infinity, maxDistance = Infinity,
      collection = null, filterFn) {
    const x = point.geometry.coordinates[0];
    const y = point.geometry.coordinates[1];
    const ids = this.index.neighbors(x, y, maxResults, maxDistance, filterFn);
    if (!collection) {
      return ids;
    }
    return turf.featureCollection(ids.map((id) => collection.features[id]));
  }

  /**
   * @description Find items in the bounding box of the GeoJSON.
   * @param {GeoJSON|Array} geojson GeoJSON or its bounding box.
   * @param {GeoJSON} [collection] Source collection from which to return items.
   * @param {Function} [filterFn] Called on every found item (passing an item
   *                              index) and only includes it if the function
   *                              returned a truthy value.
   * @return {Array|FeatureCollection} IDs or features found.
   * @example
   * // Make a GeoJSON query.
   * const polygon = turf.polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
   * const found = index.search(polygon, collection);
   */
  search(geojson, collection, filterFn) {
    const bbox = toBBox(geojson);
    const ids = this.index.search(...bbox, filterFn);
    if (!collection) {
      return ids;
    }
    return turf.featureCollection(ids.map((id) => collection.features[id]));
  }
};

export default GeojsonFlatbush;
