import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
    googleToAppleMapsURL,
    unwrapGoogleRedirectUrl
} = require("../../Navio Extension/Resources/lib/urlConversion.js");

test("converts place URLs with coordinates", () => {
    const result = googleToAppleMapsURL(
        "https://www.google.com/maps/place/Empire+State+Building/@40.748,-73.985,17z"
    );

    assert.equal(
        result,
        "https://maps.apple.com/?ll=40.748%2C-73.985&q=Empire+State+Building"
    );
});

test("converts directions and preserves supported walking mode", () => {
    const result = googleToAppleMapsURL(
        "https://www.google.com/maps/dir/Times+Square/Central+Park?travelmode=walking"
    );

    assert.equal(
        result,
        "https://maps.apple.com/?saddr=Times+Square&daddr=Central+Park&dirflg=w"
    );
});

test("unwraps Google redirect wrappers before converting", () => {
    const redirectUrl =
        "https://www.google.com/url?q=https%3A%2F%2Fwww.google.com%2Fmaps%2Fsearch%2F%3Fapi%3D1%26query%3Dcoffee%2Bnear%2Bme";

    assert.equal(
        unwrapGoogleRedirectUrl(redirectUrl).toString(),
        "https://www.google.com/maps/search/?api=1&query=coffee+near+me"
    );

    assert.equal(
        googleToAppleMapsURL(redirectUrl),
        "https://maps.apple.com/?q=coffee+near+me"
    );
});

test("returns null for non-convertible URLs", () => {
    const result = googleToAppleMapsURL("https://www.google.com/search?q=navio");
    assert.equal(result, null);
});
