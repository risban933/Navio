//
//  NavioUITests.swift
//  NavioUITests
//
//  Created by Rishabh Bansal on 11/13/25.
//

import XCTest

final class NavioUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testLaunchShowsOnboarding() throws {
        let app = XCUIApplication()
        app.launch()

        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: 5))
        XCTAssertTrue(webView.staticTexts["Welcome to Navio"].waitForExistence(timeout: 5))
        XCTAssertTrue(webView.staticTexts["Version 1.0"].waitForExistence(timeout: 5))
    }
}
