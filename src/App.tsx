import { Route } from '@solidjs/router'
import type { Component } from 'solid-js'
import { AppHeader } from './components/AppHeader'
import { AppFooter } from './components/AppFooter'
import { ToastContainer } from './components/Toast'
import { MetaProvider, Title, Meta } from '@solidjs/meta'

// Lazy load pages
import { lazy } from 'solid-js'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Products = lazy(() => import('./pages/Products'))
const Technologies = lazy(() => import('./pages/Technologies'))
const Careers = lazy(() => import('./pages/Careers'))
const Contact = lazy(() => import('./pages/Contact'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Cookies = lazy(() => import('./pages/Cookies'))

const App: Component = () => {
  return (
    <MetaProvider>
      <Title>Sylphx - Democratizing AI Through Elegant Code</Title>
      <Meta
        name="description"
        content="Production-ready, open-source AI infrastructure. 5-10x faster PDF processing, 1.7-45x faster state management, 94% test coverage. Built for developers."
      />
      <Meta property="og:type" content="website" />
      <Meta property="og:url" content="https://sylphx.com" />
      <Meta property="og:title" content="Sylphx - Democratizing AI Through Elegant Code" />
      <Meta
        property="og:description"
        content="Production-ready, open-source AI infrastructure. Build faster, safer, and more reliable AI applications."
      />
      <Meta property="og:image" content="https://sylphx.com/og-image.svg" />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:site" content="@sylphxlab" />

      <AppHeader />
      <main class="min-h-screen">
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/products" component={Products} />
        <Route path="/technologies" component={Technologies} />
        <Route path="/careers" component={Careers} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/cookies" component={Cookies} />
      </main>
      <AppFooter />
      <ToastContainer />
    </MetaProvider>
  )
}

export default App
