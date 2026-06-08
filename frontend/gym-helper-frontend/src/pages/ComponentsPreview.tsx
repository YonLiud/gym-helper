import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from '../components'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 style={{ margin: '0 0 16px' }}>{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

export function ComponentsPreviewPage() {
  const [inputVal, setInputVal] = useState('')
  const [textareaVal, setTextareaVal] = useState('')
  const [selectVal, setSelectVal] = useState('')

  return (
    <div className="p-8 text-left max-w-3xl mx-auto">
      <PageHeader
        title="Component Preview"
        description="All UI components in one place."
      />

      <Section title="Button">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Section>

      <Section title="Input">
        <Input
          label="Username"
          placeholder="Enter username"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
        />
        <Input label="With error" placeholder="Bad value" error="This field is required." />
        <Input placeholder="No label" />
      </Section>

      <Section title="Textarea">
        <Textarea
          label="Notes"
          placeholder="Add any notes…"
          value={textareaVal}
          onChange={e => setTextareaVal(e.target.value)}
        />
        <Textarea label="With error" error="Notes are too long." />
      </Section>

      <Section title="Select">
        <Select
          label="Muscle group"
          placeholder="Select one…"
          value={selectVal}
          onChange={e => setSelectVal(e.target.value)}
          options={[
            { value: 'chest', label: 'Chest' },
            { value: 'back', label: 'Back' },
            { value: 'legs', label: 'Legs' },
            { value: 'shoulders', label: 'Shoulders' },
          ]}
        />
        <Select
          label="With error"
          placeholder="Select one…"
          options={[{ value: 'a', label: 'Option A' }]}
          error="Please select an option."
        />
      </Section>

      <Section title="Card">
        <Card>
          <p className="text-[var(--text-h)] font-medium">Basic card</p>
          <p className="text-sm text-[var(--text)]">Plain container with border.</p>
        </Card>
        <Card onClick={() => alert('clicked!')}>
          <p className="text-[var(--text-h)] font-medium">Clickable card</p>
          <p className="text-sm text-[var(--text)]">Hover to see accent border.</p>
        </Card>
      </Section>

      <Section title="Badge">
        <Row>
          <Badge>Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </Row>
      </Section>

      <Section title="Spinner">
        <Row>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
      </Section>

      <Section title="Alert">
        <Alert variant="error">Something went wrong. Please try again.</Alert>
        <Alert variant="success">Workout saved successfully.</Alert>
        <Alert variant="warning">Your session is about to expire.</Alert>
        <Alert variant="info">Tip: add notes to track your progress over time.</Alert>
      </Section>

      <Section title="EmptyState">
        <Card>
          <EmptyState
            title="No workouts yet"
            description="Start logging your sessions to track progress over time."
            action={<Button size="sm">Add workout</Button>}
          />
        </Card>
      </Section>
    </div>
  )
}
