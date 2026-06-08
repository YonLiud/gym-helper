import { createFileRoute } from '@tanstack/react-router'
import { ComponentsPreviewPage } from '../pages/ComponentsPreview'

export const Route = createFileRoute('/components')({
  component: ComponentsPreviewPage,
})
