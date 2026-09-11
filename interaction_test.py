import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        base_url = 'http://localhost:8080'

        print("\n--- Testing Interactions on /apply ---")
        try:
            await page.goto(f"{base_url}/apply", wait_until="networkidle")
            
            # Check if we are on the first step
            step1_text = await page.inner_text("legend")
            print(f"Initial Step: {step1_text}")

            # Fill in Step 1
            await page.fill("input#name", "John Doe")
            await page.fill("input#mobile", "9876543210")
            # For 'renew-licence', DL is required
            await page.fill("input#dl", "MH12 20190001234")
            
            # Click Save and continue
            await page.click("button[type='submit']")
            await asyncio.sleep(0.5) # Wait for transition

            # Check if we moved to Step 2
            step2_text = await page.inner_text("legend")
            print(f"Step after clicking continue: {step2_text}")

            # Fill in Step 2
            await page.select_option("select#state", label="Maharashtra")
            await asyncio.sleep(0.5)
            await page.select_option("select#rto", label="MH12 Pune")

            # Click Save and continue
            await page.click("button[type='submit']")
            await asyncio.sleep(0.5)

            # Check if we are on Step 3 (Review & pay)
            step3_text = await page.inner_text("h2:has-text('Check your details')")
            print(f"Step after second continue: {step3_text}")

            # Submit the form
            # Note: This might trigger a Supabase call which will fail in this environment if not configured
            # But we want to see if it handles errors gracefully.
            await page.click("button[type='submit']")
            await asyncio.sleep(2) # Wait for submission

            # Check for error or success
            if await page.query_selector("p[role='alert']"):
                error_msg = await page.inner_text("p[role='alert']")
                print(f"Submission Error (Expected if no Supabase keys): {error_msg}")
            elif await page.query_selector("h1:has-text('Application submitted')"):
                print("Submission Success!")
            else:
                print("Submission state unknown.")

        except Exception as e:
            print(f"Interaction failed: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
