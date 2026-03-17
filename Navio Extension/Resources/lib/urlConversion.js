/**
 * Shared Navio URL conversion helpers.
 */

(function(root, factory) {
    const api = factory();

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }

    root.NavioUrlConversion = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";

    const TRAVEL_MODE_MAP = {
        d: "d",
        driving: "d",
        drive: "d",
        w: "w",
        walking: "w",
        walk: "w",
        r: "r",
        transit: "r",
        train: "r",
        public_transit: "r"
    };

    function safeDecode(value) {
        if (typeof value !== "string" || value.length === 0) {
            return "";
        }

        const normalized = value.replace(/\+/g, " ");

        try {
            return decodeURIComponent(normalized);
        } catch (error) {
            return normalized;
        }
    }

    function normalizeValue(value) {
        return safeDecode(value).trim();
    }

    function isCurrentLocation(value) {
        return /^(current|my)\s+location$/i.test(normalizeValue(value));
    }

    function extractCoordinates(url) {
        const ll = url.searchParams.get("ll");
        if (ll) {
            const llMatch = ll.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
            if (llMatch) {
                return {
                    latitude: llMatch[1],
                    longitude: llMatch[2]
                };
            }
        }

        const atMatch = url.href.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        if (atMatch) {
            return {
                latitude: atMatch[1],
                longitude: atMatch[2]
            };
        }

        return null;
    }

    function extractTravelMode(url) {
        const candidates = [
            url.searchParams.get("travelmode"),
            url.searchParams.get("mode"),
            url.searchParams.get("dirflg")
        ];

        for (const candidate of candidates) {
            const normalized = normalizeValue(candidate).toLowerCase();
            if (TRAVEL_MODE_MAP[normalized]) {
                return TRAVEL_MODE_MAP[normalized];
            }
        }

        return null;
    }

    function getMapsPathSegments(pathname, marker) {
        const index = pathname.indexOf(marker);
        if (index === -1) {
            return [];
        }

        return pathname
            .slice(index + marker.length)
            .split("/")
            .map(normalizeValue);
    }

    function unwrapGoogleRedirectUrl(inputUrl) {
        let currentUrl = inputUrl;
        const seen = new Set();

        while (typeof currentUrl === "string" && currentUrl.length > 0 && !seen.has(currentUrl)) {
            seen.add(currentUrl);

            const parsedUrl = new URL(currentUrl);
            const isRedirectWrapper =
                parsedUrl.pathname === "/url" ||
                parsedUrl.pathname === "/imgres" ||
                parsedUrl.pathname.startsWith("/local_url");

            if (!isRedirectWrapper) {
                return parsedUrl;
            }

            const nestedUrl =
                parsedUrl.searchParams.get("q") ||
                parsedUrl.searchParams.get("url") ||
                parsedUrl.searchParams.get("destination");

            if (!nestedUrl || !/^https?:/i.test(nestedUrl)) {
                return parsedUrl;
            }

            currentUrl = nestedUrl;
        }

        return new URL(inputUrl);
    }

    function extractDirections(url) {
        let destination = normalizeValue(
            url.searchParams.get("destination") || url.searchParams.get("daddr")
        );
        let origin = normalizeValue(
            url.searchParams.get("origin") || url.searchParams.get("saddr")
        );

        if (!destination && /\/maps\/dir(?:\/|$)/.test(url.pathname)) {
            const segments = getMapsPathSegments(url.pathname, "/maps/dir/");
            if (segments.length > 0) {
                if (segments[0]) {
                    origin = origin || segments[0];
                }
                if (segments.length > 1 && segments[1]) {
                    destination = destination || segments[1];
                }
            }
        }

        return {
            destination: destination,
            origin: origin
        };
    }

    function extractSearchQuery(url) {
        const directQuery = normalizeValue(
            url.searchParams.get("q") || url.searchParams.get("query")
        );
        if (directQuery) {
            return directQuery;
        }

        if (/\/maps\/place(?:\/|$)/.test(url.pathname)) {
            const segments = getMapsPathSegments(url.pathname, "/maps/place/");
            if (segments.length > 0 && segments[0]) {
                return segments[0].split("@")[0].trim();
            }
        }

        if (/\/maps\/search(?:\/|$)/.test(url.pathname)) {
            const segments = getMapsPathSegments(url.pathname, "/maps/search/");
            if (segments.length > 0 && segments[0]) {
                return segments[0];
            }
        }

        return "";
    }

    function isGoogleMapsLikeUrl(url) {
        return (
            url.hostname.startsWith("maps.") ||
            /\/maps(?:\/|$)/.test(url.pathname) ||
            url.searchParams.has("map_action")
        );
    }

    function buildAppleMapsUrl(details) {
        const appleMapsUrl = new URL("https://maps.apple.com/");

        if (details.destination || details.origin) {
            if (details.origin && !isCurrentLocation(details.origin)) {
                appleMapsUrl.searchParams.set("saddr", details.origin);
            }

            if (details.destination) {
                appleMapsUrl.searchParams.set("daddr", details.destination);
            }

            if (details.travelMode) {
                appleMapsUrl.searchParams.set("dirflg", details.travelMode);
            }

            return appleMapsUrl.toString();
        }

        if (details.coordinates) {
            appleMapsUrl.searchParams.set(
                "ll",
                details.coordinates.latitude + "," + details.coordinates.longitude
            );
        }

        if (details.query) {
            appleMapsUrl.searchParams.set("q", details.query);
        }

        if ([...appleMapsUrl.searchParams.keys()].length === 0) {
            return null;
        }

        return appleMapsUrl.toString();
    }

    function googleToAppleMapsURL(inputUrl) {
        if (typeof inputUrl !== "string" || inputUrl.length === 0) {
            return null;
        }

        try {
            const url = unwrapGoogleRedirectUrl(inputUrl);
            if (!isGoogleMapsLikeUrl(url)) {
                return null;
            }
            const coordinates = extractCoordinates(url);
            const directions = extractDirections(url);
            const query = extractSearchQuery(url);
            const travelMode = extractTravelMode(url);
            const hasDirections = Boolean(directions.destination || directions.origin);

            return buildAppleMapsUrl({
                coordinates: coordinates,
                destination: directions.destination,
                origin: directions.origin,
                query: hasDirections ? "" : query,
                travelMode: hasDirections ? travelMode : null
            });
        } catch (error) {
            return null;
        }
    }

    return {
        buildAppleMapsUrl: buildAppleMapsUrl,
        googleToAppleMapsURL: googleToAppleMapsURL,
        unwrapGoogleRedirectUrl: unwrapGoogleRedirectUrl
    };
});
