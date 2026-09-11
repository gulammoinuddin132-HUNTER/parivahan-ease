import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        routes = ['/', '/apply', '/auth', '/redesign', '/track']
        base_url = 'http://localhost:8080'

        for route in routes:
            print(f"\n--- Testing route: {route} ---")
            errors = []
            logs = []

            page.on("pageerror", lambda err: errors.append(f"Page Error: {err}"))
            page.on("console", lambda msg: logs.append(f"Console Error: {msg.text}") if msg.type == "error" else None)

            try:
                response = await page.goto(f"{base_url}{route}", wait_until="networkidle")
                if not response:
                    print(f"Failed to load {route}: No response")
                    continue

                print(f"Status: {response.status}")

                if errors:
                    print("Runtime Errors:")
                    for e in errors:
                        print(f"  - {e}")

                if logs:
                    print("Console Errors:")
                    for l in logs:
                        print(f"  - {l}")

                if not errors and not logs and response.status < 400:
                    print(f"Route {route} loaded successfully with no visible errors.")
                elif response.status >= 400:
                    print(f"Route {route} returned status {response.status}")

            except Exception as e:
                print(f"Failed to navigate to {route}: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
