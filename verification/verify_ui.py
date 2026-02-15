from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000")
            page.wait_for_timeout(2000) # Wait for animations and everything to load

            # Take a screenshot of the full page
            page.screenshot(path="verification/ui_screenshot.png", full_page=True)
            print("Screenshot saved to verification/ui_screenshot.png")

            # Also take a screenshot of dark mode
            # Toggle dark mode
            theme_btn = page.locator('button[title*="Dark Theme"]')
            if theme_btn.count() == 0:
                 theme_btn = page.locator('button[title*="Light Theme"]')

            if theme_btn.count() > 0:
                theme_btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="verification/ui_screenshot_dark.png", full_page=True)
                print("Dark mode screenshot saved to verification/ui_screenshot_dark.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
