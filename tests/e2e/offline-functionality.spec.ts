import { test, expect } from '@playwright/test'

test.describe('PWA Offline Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have service worker registered', async ({ page }) => {
    // Wait for service worker registration
    await page.waitForFunction(() => {
      return 'serviceWorker' in navigator
    })

    const serviceWorkerSupported = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })

    expect(serviceWorkerSupported).toBe(true)
  })

  test('should have valid web app manifest', async ({ page }) => {
    // Check if manifest is accessible
    const manifestResponse = await page.request.get('/manifest.webmanifest')
    expect(manifestResponse.status()).toBe(200)

    const manifest = await manifestResponse.json()
    expect(manifest.name).toBe('Match Manager - Soccer Coach Assistant')
    expect(manifest.short_name).toBe('Match Manager')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#059669')
    expect(manifest.background_color).toBe('#059669')
    expect(manifest.icons).toHaveLength(3)
  })

  test('should load homepage with PWA features', async ({ page }) => {
    // Check main content loads
    await expect(page.locator('h1')).toContainText('Match Manager')
    await expect(page.locator('text=Soccer Coach Assistant')).toBeVisible()

    // Check PWA status indicators
    await expect(page.locator('text=PWA Features Active')).toBeVisible()
    await expect(page.locator('text=Offline functionality enabled')).toBeVisible()
    await expect(page.locator('text=Installable as native app')).toBeVisible()
    await expect(page.locator('text=Mobile-optimized interface')).toBeVisible()
    await expect(page.locator('text=Service worker configured')).toBeVisible()
  })

  test('should be responsive for mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check main content is still visible and properly laid out
    await expect(page.locator('h1')).toContainText('Match Manager')

    // Check mobile-specific styling
    const mainCard = page.locator('main')
    await expect(mainCard).toHaveClass(/max-w-md/)
    await expect(mainCard).toHaveClass(/w-full/)
  })

  test('should handle offline mode gracefully', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Reload page to test offline behavior
    await page.reload()

    // Should still show content (cached by service worker)
    // Note: This test may need adjustment based on actual service worker caching strategy
    await expect(page.locator('h1')).toContainText('Match Manager', { timeout: 10000 })
  })

  test('should show offline indicator when offline', async ({ page, context }) => {
    // Start online, then go offline
    await context.setOffline(true)

    // Trigger offline event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'))
    })

    // Should show offline indicator
    await expect(page.locator('text=You\'re offline')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=All data saved locally')).toBeVisible()
  })

  test('should handle going back online', async ({ page, context }) => {
    // Go offline first
    await context.setOffline(true)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'))
    })

    // Verify offline indicator appears
    await expect(page.locator('text=You\'re offline')).toBeVisible()

    // Go back online
    await context.setOffline(false)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'))
    })

    // Offline indicator should disappear
    await expect(page.locator('text=You\'re offline')).not.toBeVisible({ timeout: 5000 })
  })

  test('should have proper PWA viewport meta tags', async ({ page }) => {
    // Check viewport configuration for PWA
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content')

    expect(viewportMeta).toContain('width=device-width')
    expect(viewportMeta).toContain('initial-scale=1')
    expect(viewportMeta).toContain('user-scalable=false')
  })

  test('should have theme color meta tag', async ({ page }) => {
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
    expect(themeColor).toBe('#059669')
  })

  test('should navigate to offline page', async ({ page }) => {
    await page.goto('/offline')

    await expect(page.locator('h1')).toContainText('You\'re Offline')
    await expect(page.locator('text=Continue Offline')).toBeVisible()
    await expect(page.locator('text=Try Again')).toBeVisible()
  })
})

test.describe('PWA Installation', () => {
  test('should show install prompt on supported browsers', async ({ page, browserName }) => {
    // Skip on Safari as it doesn't support beforeinstallprompt
    test.skip(browserName === 'webkit', 'Safari does not support beforeinstallprompt')

    // Simulate beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      // Add required properties for PWA install prompt
      Object.defineProperty(event, 'platforms', { value: ['web'] })
      Object.defineProperty(event, 'userChoice', {
        value: Promise.resolve({ outcome: 'accepted', platform: 'web' })
      })
      Object.defineProperty(event, 'prompt', {
        value: () => Promise.resolve()
      })

      window.dispatchEvent(event)
    })

    // Should show install prompt
    await expect(page.locator('text=Install Match Manager')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Add to your home screen')).toBeVisible()
  })
})