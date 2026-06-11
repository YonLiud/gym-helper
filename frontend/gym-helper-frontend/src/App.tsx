import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { toast } from './lib/toast'

const router = createRouter({ routeTree, defaultViewTransition: true })
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
  queryCache: new QueryCache({
    onError: (error) => toast.error(errorMessage(error)),
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(errorMessage(error)),
  }),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
