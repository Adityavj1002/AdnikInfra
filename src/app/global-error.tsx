'use client'

/**
 * Last-resort boundary when the root layout itself fails. It replaces the whole document,
 * so it carries its own minimal markup and no dependency on the design-system CSS.
 */
export default function GlobalError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Something went wrong</h1>
          <p>Please try again in a moment.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
