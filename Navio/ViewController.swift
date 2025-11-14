//
//  ViewController.swift
//  Navio
//
//  Created by Rishabh Bansal on 11/13/25.
//

import UIKit
import WebKit
import MessageUI

class ViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler, MFMailComposeViewControllerDelegate {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self
        self.webView.scrollView.isScrollEnabled = true

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Page loaded successfully
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Handle messages from the web view
        guard let messageBody = message.body as? [String: Any],
              let action = messageBody["action"] as? String else {
            return
        }

        switch action {
        case "contact":
            openContactDeveloper()
        default:
            break
        }
    }

    /// Opens email composer to contact the developer
    private func openContactDeveloper() {
        guard MFMailComposeViewController.canSendMail() else {
            // If mail is not configured, open mailto URL as fallback
            openMailtoURL()
            return
        }

        let mailComposer = MFMailComposeViewController()
        mailComposer.mailComposeDelegate = self
        mailComposer.setToRecipients(["support@navio-app.com"]) // Replace with actual support email
        mailComposer.setSubject("Navio Feedback")

        // Pre-fill device information
        let deviceInfo = """


        ---
        Device Information:
        Device: \(UIDevice.current.model)
        iOS Version: \(UIDevice.current.systemVersion)
        App Version: \(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown")
        """

        mailComposer.setMessageBody(deviceInfo, isHTML: false)

        present(mailComposer, animated: true)
    }

    /// Fallback method to open mailto URL if mail composer is not available
    private func openMailtoURL() {
        let email = "support@navio-app.com" // Replace with actual support email
        let subject = "Navio Feedback"
        let device = UIDevice.current.model
        let iosVersion = UIDevice.current.systemVersion
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown"

        let body = """


        ---
        Device: \(device)
        iOS Version: \(iosVersion)
        App Version: \(appVersion)
        """

        let encodedSubject = subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""

        if let url = URL(string: "mailto:\(email)?subject=\(encodedSubject)&body=\(encodedBody)") {
            UIApplication.shared.open(url)
        }
    }

    // MARK: - MFMailComposeViewControllerDelegate

    func mailComposeController(_ controller: MFMailComposeViewController, didFinishWith result: MFMailComposeResult, error: Error?) {
        controller.dismiss(animated: true)
    }

}
