//
//  SafariWebExtensionHandler.swift
//  Navio Extension
//
//  Created by Rishabh Bansal on 11/13/25.
//

import SafariServices
import os.log

#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem

        let profile: UUID?
        if #available(iOS 17.0, macOS 14.0, *) {
            profile = request?.userInfo?[SFExtensionProfileKey] as? UUID
        } else {
            profile = request?.userInfo?["profile"] as? UUID
        }

        let message: Any?
        if #available(iOS 15.0, macOS 11.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }

        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@ (profile: %@)", String(describing: message), profile?.uuidString ?? "none")

        // Handle the message
        var responseMessage: [String: Any] = [:]

        if let messageDict = message as? [String: Any],
           let action = messageDict["action"] as? String,
           action == "openAppleMaps",
           let urlString = messageDict["url"] as? String,
           let url = URL(string: urlString) {

            os_log(.default, "Opening Apple Maps URL: %@", urlString)

            // Open the Apple Maps URL
            openURL(url)

            responseMessage = [
                "success": true,
                "message": "Apple Maps opened successfully"
            ]
        } else {
            os_log(.error, "Invalid message format or missing parameters")
            responseMessage = [
                "success": false,
                "message": "Invalid message format"
            ]
        }

        let response = NSExtensionItem()
        if #available(iOS 15.0, macOS 11.0, *) {
            response.userInfo = [ SFExtensionMessageKey: responseMessage ]
        } else {
            response.userInfo = [ "message": responseMessage ]
        }

        context.completeRequest(returningItems: [ response ], completionHandler: nil)
    }

    /// Opens a URL using the appropriate method for iOS or macOS
    private func openURL(_ url: URL) {
        #if os(iOS)
        // iOS: App extensions cannot use UIApplication.shared
        // The JavaScript side will handle URL opening via window.location.href
        os_log(.default, "URL opening delegated to JavaScript on iOS: %@", url.absoluteString)
        #elseif os(macOS)
        // macOS: Use NSWorkspace.shared.open
        DispatchQueue.main.async {
            let success = NSWorkspace.shared.open(url)
            if success {
                os_log(.default, "Successfully opened URL on macOS: %@", url.absoluteString)
            } else {
                os_log(.error, "Failed to open URL on macOS: %@", url.absoluteString)
            }
        }
        #endif
    }

}
