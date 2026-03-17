//
//  NavioTests.swift
//  NavioTests
//
//  Created by Rishabh Bansal on 11/13/25.
//

import Testing
@testable import Navio
import UIKit

struct NavioTests {

    @Test
    @MainActor
    func appBundleContainsExpectedResources() async throws {
        let supportConfigURL = try #require(Bundle.main.url(forResource: "SupportConfig", withExtension: "json"))
        let onboardingURL = try #require(Bundle.main.url(forResource: "Main", withExtension: "html"))

        let supportConfigData = try Data(contentsOf: supportConfigURL)
        let onboardingHTML = try String(contentsOf: onboardingURL, encoding: .utf8)

        #expect(String(decoding: supportConfigData, as: UTF8.self).contains("\"supportEmail\""))
        #expect(onboardingHTML.contains("Contact Developer"))

        let storyboard = UIStoryboard(name: "Main", bundle: Bundle.main)
        let initialViewController = storyboard.instantiateInitialViewController()
        #expect(initialViewController is ViewController)
    }
}
