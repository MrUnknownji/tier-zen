from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        try:
            page.goto("http://localhost:3000")

            # Wait for the main content to be visible
            expect(page.get_by_role("heading", name="Unranked Items")).to_be_visible(timeout=30000)

            # Take a screenshot of the initial state
            page.screenshot(path="jules-scratch/verification/verification.png")

            print("Screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Try to capture the page content on error for debugging
            try:
                content = page.content()
                with open("jules-scratch/verification/error_page.html", "w") as f:
                    f.write(content)
                print("Error page content saved to jules-scratch/verification/error_page.html")
            except Exception as save_e:
                print(f"Could not save page content: {save_e}")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
