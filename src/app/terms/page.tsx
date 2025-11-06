export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using our website and applications, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on Sylphx's website for
              personal, non-commercial transitory viewing only.
            </p>

            <h2>Disclaimer</h2>
            <p>
              The materials on Sylphx's website are provided on an 'as is' basis. Sylphx makes no
              warranties, expressed or implied, and hereby disclaims and negates all other
              warranties.
            </p>

            <h2>Limitations</h2>
            <p>
              In no event shall Sylphx or its suppliers be liable for any damages arising out of the
              use or inability to use the materials on our website.
            </p>

            <h2>Modifications</h2>
            <p>
              Sylphx may revise these terms of service at any time without notice. By using this
              website, you agree to be bound by the current version of these terms.
            </p>

            <h2>Contact</h2>
            <p>
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@sylphx.com">legal@sylphx.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
