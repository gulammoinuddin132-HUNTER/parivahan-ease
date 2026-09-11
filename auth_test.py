import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        base_url = 'http://localhost:8080'

        print("\n--- Testing Interactions on /auth ---")
        try:
            await page.goto(f"{base_url}/auth", wait_until="networkidle")
            
            # Initial state should be sign in
            title = await page.inner_text("h1")
            print(f"Initial Title: {title}")

            # Click "Create an account"
            await page.click("button:has-text('Create an account')")
            await asyncio.sleep(0.5)
            
            title = await page.inner_text("h1")
            print(f"Title after toggle: {title}")

            # Check for Full Name field
            if await page.query_selector("label:has-text('Full name')"):
                print("Full name field is visible in sign up mode.")
            else:
                print("Full name field is MISSING in sign up mode.")

            # Toggle back to sign in
            await page.click("button:has-text('Sign in instead')")
            await asyncio.sleep(0.5)
            
            title = await page.inner_text("h1")
            print(f"Title after toggling back: {title}")

        except Exception as e:
            print(f"Auth interaction failed: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
