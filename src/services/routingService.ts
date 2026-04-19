/**
 * RoutingService — Road-Aware Route Calculation
 * 
 * Uses OSRM (Open Source Routing Machine) to calculate real road paths
 * between bus stops. Processes stop-to-stop segments individually to:
 *   1. Avoid OSRM waypoint limits
 *   2. Ensure each segment follows the actual road network
 *   3. Cache results to prevent redundant API calls
 *   4. Gracefully degrade if the API is unavailable
 */

// In-memory cache: "lat1,lon1|lat2,lon2" → road coordinates
const segmentCache: Record<string, [number, number][]> = {};

/**
 * Build a cache key from two coordinate pairs
 */
function cacheKey(a: [number, number], b: [number, number]): string {
    return `${a[0].toFixed(5)},${a[1].toFixed(5)}|${b[0].toFixed(5)},${b[1].toFixed(5)}`;
}

/**
 * Fetch the road-following path between exactly TWO points from OSRM.
 * Returns an array of [lat, lon] coordinates tracing the road.
 */
async function fetchSegmentPath(
    from: [number, number],
    to: [number, number]
): Promise<[number, number][]> {
    const key = cacheKey(from, to);
    if (segmentCache[key]) return segmentCache[key];

    try {
        // OSRM uses lon,lat order
        const coordStr = `${from[1]},${from[0]};${to[1]},${to[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`OSRM HTTP ${res.status} for segment`);
            return [from, to];
        }

        const data = await res.json();

        if (
            !data.routes ||
            data.routes.length === 0 ||
            !data.routes[0].geometry?.coordinates
        ) {
            console.warn('OSRM returned no route geometry for segment');
            return [from, to];
        }

        // OSRM returns [lon, lat], Leaflet needs [lat, lon]
        const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]] as [number, number]
        );

        segmentCache[key] = coords;
        return coords;
    } catch (err) {
        console.error('OSRM segment fetch failed:', err);
        return [from, to];
    }
}

/**
 * Add a small delay to avoid hammering the public OSRM server
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const routingService = {
    /**
     * Get the full road-following path through an ordered list of stops.
     * 
     * Strategy (similar to Google Maps):
     *   - Process each consecutive pair of stops as an individual routing request
     *   - OSRM finds the shortest driving path between each pair
     *   - Stitch the segments together, removing duplicate junction points
     *   - Cache each segment so revisiting the same route is instant
     * 
     * @param waypoints Array of [latitude, longitude] for each bus stop, in order
     * @returns Array of [lat, lon] coordinates tracing the full road path
     */
    async getRoutePath(waypoints: [number, number][]): Promise<[number, number][]> {
        if (waypoints.length < 2) return waypoints;

        // Process each consecutive pair of stops
        const fullPath: [number, number][] = [];

        for (let i = 0; i < waypoints.length - 1; i++) {
            const from = waypoints[i];
            const to = waypoints[i + 1];

            // Rate-limit: 200ms between requests to be polite to the public server
            if (i > 0) await delay(200);

            const segmentCoords = await fetchSegmentPath(from, to);

            if (segmentCoords.length > 0) {
                // Avoid duplicating the junction point between segments
                const startIdx = (i === 0) ? 0 : 1;
                fullPath.push(...segmentCoords.slice(startIdx));
            }
        }

        // If we got a reasonable path, return it
        if (fullPath.length >= waypoints.length) {
            return fullPath;
        }

        // Fallback: return raw waypoints as straight lines
        console.warn('Road path too short, falling back to straight lines');
        return waypoints;
    },

    /**
     * Clear the segment cache (useful if data changes)
     */
    clearCache() {
        Object.keys(segmentCache).forEach(k => delete segmentCache[k]);
    }
};
