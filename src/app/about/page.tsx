export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="mx-auto mb-16 max-w-4xl">
          <h1 className="mb-6 text-center text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            About Sylphx
          </h1>
        </div>

        {/* Company description */}
        <div className="mx-auto mb-12 max-w-4xl rounded-xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              Sylphx is a forward-thinking technology company dedicated to creating innovative
              digital experiences that push the boundaries of what's possible. We specialize in
              developing high-quality, high-performance applications, games, and immersive
              experiences across multiple platforms.
            </p>

            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              Founded by a team of passionate developers and designers, our mission is to blend
              cutting-edge technology with intuitive design to create products that are not only
              powerful but also a joy to use.
            </p>

            <h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">
              Our Vision
            </h2>

            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              We envision a future where technology enhances human creativity and connection. Our
              goal is to develop tools and experiences that empower users, spark imagination, and
              create meaningful interactions in both digital and augmented realities.
            </p>

            <h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">
              Our Approach
            </h2>

            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              At Sylphx, we believe in a thoughtful, user-centered approach to product development.
              We combine technical excellence with creative innovation, constantly exploring new
              technologies and methodologies to create exceptional digital experiences.
            </p>

            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              Our development process emphasizes:
            </p>

            <ul>
              <li className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Innovation:</strong> Constantly
                exploring emerging technologies like AI, VR, and AR
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Quality:</strong> Rigorous testing
                and optimization for flawless performance
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">User Experience:</strong>{' '}
                Intuitive design with thoughtful attention to detail
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Accessibility:</strong> Creating
                products that work for everyone
              </li>
            </ul>

            <h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">Our Team</h2>

            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              We are a diverse team of engineers, designers, and visionaries united by a passion for
              creating exceptional digital experiences. With backgrounds spanning game development,
              artificial intelligence, mobile applications, and mixed reality, our combined
              expertise allows us to tackle complex challenges and deliver innovative solutions.
            </p>
          </div>
        </div>

        {/* Team section placeholder */}
        <div className="mx-auto mt-20 max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Meet Our Leadership Team
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Team member cards */}
            {[
              {
                name: 'Jane Doe',
                role: 'Chief Executive Officer',
                description:
                  'Visionary leader with 15+ years of experience in technology and product development.',
              },
              {
                name: 'John Smith',
                role: 'Chief Technology Officer',
                description:
                  'Expert in AI and cloud architecture with a track record of scaling innovative platforms.',
              },
              {
                name: 'Emily Chen',
                role: 'Head of Design',
                description:
                  'Award-winning designer focused on creating delightful and accessible user experiences.',
              },
            ].map((member) => (
              <div
                key={member.name}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-48 items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-5xl text-gray-400 dark:text-gray-500">👤</span>
                </div>
                <div className="p-6">
                  <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="mb-4 text-indigo-600 dark:text-indigo-400">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
