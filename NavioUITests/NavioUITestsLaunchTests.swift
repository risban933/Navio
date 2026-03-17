//
//  NavioUITestsLaunchTests.swift
//  NavioUITests
//
//  Created by Rishabh Bansal on 11/13/25.
//

import XCTest

final class NavioUITestsLaunchTests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testLaunch() throws {
        let app = XCUIApplication()
        app.launch()

        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = "Launch Screen"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
